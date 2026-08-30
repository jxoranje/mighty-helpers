import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=confirmation_failed`
    );
  }

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

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError) {
    console.error("Could not exchange confirmation code:", exchangeError);

    return NextResponse.redirect(
      `${origin}/login?error=confirmation_failed`
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Could not load confirmed user:", userError);

    return NextResponse.redirect(
      `${origin}/login?error=confirmation_failed`
    );
  }

  const termsAcceptedAt = user.user_metadata?.terms_accepted_at;
  const termsVersion = user.user_metadata?.terms_version;

  if (!termsAcceptedAt || !termsVersion) {
    console.error("Confirmed user is missing terms consent metadata:", user.id);

    return NextResponse.redirect(
      `${origin}/login?error=missing_consent`
    );
  }

  const { error: consentError } = await supabaseAdmin
    .from("user_consents")
    .upsert(
      {
        user_id: user.id,
        terms_accepted_at: termsAcceptedAt,
        terms_version: termsVersion,
      },
      { onConflict: "user_id" }
    );

  if (consentError) {
    console.error("Failed to record terms consent:", consentError);

    return NextResponse.redirect(
      `${origin}/login?error=setup_failed`
    );
  }

  const { data: existingMembership, error: membershipLookupError } =
    await supabaseAdmin
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (membershipLookupError) {
    console.error(
      "Failed to look up household membership:",
      membershipLookupError
    );

    return NextResponse.redirect(
      `${origin}/login?error=setup_failed`
    );
  }

  if (!existingMembership?.household_id) {
    const { data: newHousehold, error: householdError } = await supabaseAdmin
      .from("households")
      .insert({
        name: "My Household",
        owner_user_id: user.id,
      })
      .select("id")
      .single();

    if (householdError || !newHousehold) {
      console.error("Failed to create household for new user:", householdError);

      return NextResponse.redirect(
        `${origin}/login?error=setup_failed`
      );
    }

    const { error: memberError } = await supabaseAdmin
      .from("household_members")
      .insert({
        household_id: newHousehold.id,
        user_id: user.id,
        role: "owner",
      });

    if (memberError) {
      console.error("Failed to create household membership:", memberError);

      return NextResponse.redirect(
        `${origin}/login?error=setup_failed`
      );
    }
  }

  return NextResponse.redirect(`${origin}/onboarding`);
}