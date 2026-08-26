import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createBrowserClientInstance() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase URL or key is missing");
  }

  browserClient = createBrowserClient(url, key);
  return browserClient;
}

// Keep the old export name so every existing import across the app
// (`import { createBrowserClient } from "@/lib/supabase/client"`)
// keeps working without editing every file that uses it.
export { createBrowserClientInstance as createBrowserClient };