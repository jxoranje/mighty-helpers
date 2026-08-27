import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data: subscriber, error: subscriberError } = await supabaseAdmin
    .from("subscribers")
    .select("stripe_subscription_id, status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (subscriberError || !subscriber?.stripe_subscription_id) {
    return NextResponse.json(
      { error: "No active subscription found for this account." },
      { status: 404 }
    );
  }

  if (subscriber.status === "canceled") {
    return NextResponse.json(
      { error: "This subscription is already canceled." },
      { status: 400 }
    );
  }

  try {
    const updatedSubscription = await stripe.subscriptions.update(
      subscriber.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    const currentPeriodEnd = (updatedSubscription as any).current_period_end
      ? new Date((updatedSubscription as any).current_period_end * 1000).toISOString()
      : null;

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: true,
      periodEnd: currentPeriodEnd,
    });
  } catch (err) {
    console.error("Failed to cancel subscription:", err);
    return NextResponse.json(
      { error: "Something went wrong canceling your subscription." },
      { status: 500 }
    );
  }
}