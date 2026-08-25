import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/sign-up", "/pricing", "/api/checkout", "/api/webhooks", "/auth/callback", "/start-checkout"];

export async function proxy(req: NextRequest) {
  const res = NextResponse.next();

  if (PUBLIC_PATHS.some((p) => req.nextUrl.pathname.startsWith(p))) return res;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => req.cookies.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { data: sub } = await supabase
    .from("subscribers")
    .select("status")
    .eq("user_id", user.id)
    .single();

  const allowed = sub && ["trialing", "active"].includes(sub.status);
  if (!allowed) {
    return NextResponse.redirect(new URL("/pricing", req.url));
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};