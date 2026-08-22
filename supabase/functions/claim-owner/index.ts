import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return json({ error: "Authentification requise" }, 401);
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return json({ error: "Session invalide" }, 401);
  const ownerEmail = Deno.env.get("OWNER_EMAIL")?.trim().toLowerCase();
  if (!ownerEmail || data.user.email?.toLowerCase() !== ownerEmail) return json({ claimed: false });
  const { count } = await supabase.from("admin_profiles").select("id", { count: "exact", head: true }).eq("role", "owner");
  if (count && count > 0) return json({ claimed: false });
  const { error: updateError } = await supabase.from("admin_profiles").update({ role: "owner" }).eq("id", data.user.id);
  if (updateError) return json({ error: "Initialisation impossible" }, 500);
  return json({ claimed: true });
});
