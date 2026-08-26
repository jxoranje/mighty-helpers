import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Supabase redirects the user here after they click the email
// confirmation link. We exchange the auth code for a real session,
// make sure they have a household set up, then send them on to
// /start-checkout to begin their subscription.
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: existingMembership } = await supabaseAdmin
          .from("household_members")
          .select("household_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existingMembership) {
          const { data: newHousehold, error: householdError } =
            await supabaseAdmin
              .from("households")
              .insert({
                name: "My Household",
                owner_user_id: user.id,
              })
              .select("id")
              .single();

          if (householdError) {
            console.error(
              "Failed to create household for new user:",
              householdError
            );
          } else if (newHousehold) {
            const { error: memberError } = await supabaseAdmin
              .from("household_members")
              .insert({
                household_id: newHousehold.id,
                user_id: user.id,
                role: "owner",
              });

            if (memberError) {
              console.error(
                "Failed to create household_members row:",
                memberError
              );
            }
          }
        }
      }

      return NextResponse.redirect(`${origin}/start-checkout`);
    }
  }

  // Something went wrong (expired link, invalid code, etc.)
  return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}