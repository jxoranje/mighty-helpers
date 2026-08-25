import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId, email } = await req.json();

  // Has this email ever had a Stripe customer/subscription before?
  const existingCustomers = await stripe.customers.list({ email, limit: 1 });
  const hadPriorSubscription = existingCustomers.data.length > 0
    ? (await stripe.subscriptions.list({ customer: existingCustomers.data[0].id, limit: 1 })).data.length > 0
    : false;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    subscription_data: hadPriorSubscription
      ? {}                              // no trial for repeat emails
      : {
          trial_period_days: 7,
          trial_settings: { end_behavior: { missing_payment_method: "cancel" } },
        },
    payment_method_collection: "always", // card required even during trial
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
    metadata: { userId },
  });

  return NextResponse.json({ url: session.url });
}