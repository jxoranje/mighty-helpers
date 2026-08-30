import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST() {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {
            // This route only reads the existing session.
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user?.email) {
      return NextResponse.json(
        { error: "You must be logged in with a verified email to start checkout." },
        { status: 401 }
      );
    }

    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    const hadPriorSubscription =
      existingCustomers.data.length > 0
        ? (
            await stripe.subscriptions.list({
              customer: existingCustomers.data[0].id,
              limit: 1,
            })
          ).data.length > 0
        : false;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      subscription_data: hadPriorSubscription
        ? {}
        : {
            trial_period_days: 7,
            trial_settings: {
              end_behavior: {
                missing_payment_method: "cancel",
              },
            },
          },
      payment_method_collection: "always",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding?step=finish`,
      metadata: {
        userId: user.id,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create Stripe Checkout session:", error);

    return NextResponse.json(
      { error: "Unable to start checkout. Please try again." },
      { status: 500 }
    );
  }
}