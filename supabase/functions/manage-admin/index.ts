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
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Authentification requise" }, 401);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: authData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !authData.user) return json({ error: "Session invalide" }, 401);
    const { data: caller } = await supabase.from("admin_profiles").select("role").eq("id", authData.user.id).single();
    if (caller?.role !== "owner") return json({ error: "Action réservée au propriétaire" }, 403);

    const { action, userId } = await request.json();
    const roles: Record<string, string> = { approve: "admin", reject: "rejected", revoke: "pending" };
    if (!roles[action] || typeof userId !== "string" || userId === authData.user.id) return json({ error: "Action invalide" }, 400);
    const { data: target } = await supabase.from("admin_profiles").select("role").eq("id", userId).single();
    if (!target || target.role === "owner") return json({ error: "Le propriétaire ne peut pas être modifié" }, 400);
    const { error } = await supabase.from("admin_profiles").update({ role: roles[action] }).eq("id", userId);
    if (error) throw error;
    return json({ success: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Modification impossible" }, 500);
  }
});
