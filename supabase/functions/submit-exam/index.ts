import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const questions = [
  { id: "hakuda-goal", answer: 1, explanation: "Le Hakuda recherche le contrôle de la distance, de l'équilibre et des ouvertures, pas seulement la puissance brute." },
  { id: "flexible-guard", answer: 2, explanation: "Une garde trop rigide fatigue le combattant et ralentit ses réactions." },
  { id: "short-range", answer: 2, explanation: "Les saisies, coudes et projections exigent d'entrer au contact." },
  { id: "deflection", answer: 1, explanation: "Une déviation détourne la force au lieu de chercher à l'arrêter frontalement." },
  { id: "rhythm", answer: 1, explanation: "Les changements de vitesse perturbent la lecture et le timing de la défense adverse." },
  { id: "observe-body", answer: 2, explanation: "Le corps entier révèle l'équilibre, la direction, la portée et l'intention." },
  { id: "feint", answer: 1, explanation: "Une feinte présente une fausse intention afin de provoquer une défense exploitable." },
  { id: "narrow-space", answer: 1, explanation: "Les murs et obstacles limitent les trajectoires d'une arme longue." },
  { id: "observer-role", answer: 2, explanation: "L'observateur analyse le combat et partage les informations utiles au groupe." },
  { id: "retreat", answer: 2, explanation: "Rapporter les renseignements et préserver l'équipe constitue ici la victoire tactique." },
  { id: "combine", answer: 1, explanation: "Les deux disciplines se complètent lorsque la technique s'adapte à la distance." },
  { id: "movement-economy", answer: 1, explanation: "Un geste inutile dépense de l'énergie sans avantage tactique et peut dévoiler l'action préparée." }
];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  try {
    const payload = await request.json();
    const candidateName = typeof payload.candidateName === "string" ? payload.candidateName.trim().replace(/\s+/g, " ") : "";
    if (candidateName.length < 2 || candidateName.length > 60) return json({ error: "Nom invalide" }, 400);
    if (!Array.isArray(payload.answers) || payload.answers.length !== questions.length) return json({ error: "Copie incomplète" }, 400);

    const detailedAnswers = questions.map((question, index) => {
      const submitted = payload.answers[index];
      if (!submitted || submitted.questionId !== question.id || !Number.isInteger(submitted.optionIndex) || submitted.optionIndex < 0 || submitted.optionIndex > 3) {
        throw new Error("Réponses invalides");
      }
      return { questionId: question.id, optionIndex: submitted.optionIndex, correctOptionIndex: question.answer, correct: submitted.optionIndex === question.answer };
    });
    const correctCount = detailedAnswers.filter(answer => answer.correct).length;
    const percent = Math.round((correctCount / questions.length) * 100);
    const passed = percent >= 75;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await supabase.from("exam_attempts").insert({ candidate_name: candidateName, answers: detailedAnswers, correct_count: correctCount, total: questions.length, percent, passed }).select("id").single();
    if (error) throw error;
    return json({ attemptId: data.id, correctCount, total: questions.length, percent, passed, corrections: detailedAnswers.map((answer, index) => ({ correct: answer.correct, explanation: questions[index].explanation })) });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error && error.message === "Réponses invalides" ? error.message : "Enregistrement impossible" }, 400);
  }
});
