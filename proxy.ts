import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/sign-up",
  "/pricing",
  "/help",
  "/legal",
  "/api/checkout",
  "/api/webhooks",
  "/auth/callback",
  "/start-checkout",
];

const ONBOARDING_PATH = "/onboarding";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const isPublicPath =
    pathname === "/" ||
    PUBLIC_PATHS.some(
      (path) => path !== "/" && pathname.startsWith(path)
    );

  if (isPublicPath) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });

          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const loginUrl = new URL("/login", req.url);

    if (pathname !== "/") {
      loginUrl.searchParams.set("next", pathname);
    }

    return NextResponse.redirect(loginUrl);
  }

  const { data: membership, error: membershipError } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError || !membership?.household_id) {
    console.error(
      "Proxy could not load household membership:",
      membershipError
    );

    if (pathname === ONBOARDING_PATH) {
      return response;
    }

    return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
  }

  const { data: household, error: householdError } = await supabase
    .from("households")
    .select("onboarding_completed_at")
    .eq("id", membership.household_id)
    .maybeSingle();

  if (householdError || !household) {
    console.error(
      "Proxy could not load household onboarding status:",
      householdError
    );

    if (pathname === ONBOARDING_PATH) {
      return response;
    }

    return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
  }

  if (!household.onboarding_completed_at) {
    if (pathname === ONBOARDING_PATH) {
      return response;
    }

    return NextResponse.redirect(new URL(ONBOARDING_PATH, req.url));
  }

  if (pathname === ONBOARDING_PATH) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const { data: subscription, error: subscriptionError } = await supabase
    .from("subscribers")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (subscriptionError) {
    console.error(
      "Proxy could not load subscription status:",
      subscriptionError
    );
  }

  const hasAccess =
    subscription &&
    ["trialing", "active"].includes(subscription.status);

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/pricing", req.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};