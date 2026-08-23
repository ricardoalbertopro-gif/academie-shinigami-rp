import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const combatQuestions = [
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

const spiritualArtsQuestions = [
  { id: "spiritual-foundation", answer: 1, explanation: "La stabilité repose d'abord sur un contrôle précis du Reiryoku, pas sur la quantité libérée." },
  { id: "reiryoku-definition", answer: 2, explanation: "Le Reiryoku est l'énergie spirituelle contenue dans l'âme et disponible pour alimenter les techniques." },
  { id: "reiatsu-definition", answer: 1, explanation: "Le Reiatsu est la pression produite lorsque la puissance spirituelle d'un être se manifeste." },
  { id: "hado-purpose", answer: 2, explanation: "Le Hadō regroupe les arts offensifs destinés à frapper, repousser ou produire un effet destructeur." },
  { id: "bakudo-purpose", answer: 1, explanation: "Le Bakudō sert à contraindre, protéger ou soutenir plutôt qu'à infliger directement des dégâts." },
  { id: "kaido-purpose", answer: 1, explanation: "Le Kaidō restaure l'équilibre spirituel du patient afin de soutenir la récupération de son corps." },
  { id: "barrier-stability", answer: 2, explanation: "Une barrière dépend de la puissance disponible, mais surtout de la capacité à lui donner une forme stable." },
  { id: "full-incantation", answer: 1, explanation: "L'incantation complète guide la structure du sort et permet d'en déployer plus sûrement le potentiel." },
  { id: "incantation-omission", answer: 2, explanation: "L'abandon de l'incantation accélère l'exécution, mais affaiblit généralement le sort et exige une maîtrise supérieure." },
  { id: "unstable-technique", answer: 1, explanation: "Une technique instable doit être privée d'énergie puis dissipée avant qu'elle ne menace son utilisateur ou son entourage." },
  { id: "high-rank-discipline", answer: 2, explanation: "Les arts de rang élevé imposent davantage de puissance, de précision et de stabilité." },
  { id: "right-technique", answer: 1, explanation: "La maîtrise consiste à employer la technique suffisante pour réussir la mission sans dépense ni risque inutiles." }
];

const questionSets = {
  combat: combatQuestions,
  "arts-spirituels": spiritualArtsQuestions
} as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async request => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Méthode non autorisée" }, 405);
  try {
    const payload = await request.json();
    const rawCourseId = payload.courseId ?? "combat";
    if (typeof rawCourseId !== "string" || !(rawCourseId in questionSets)) return json({ error: "Cours invalide" }, 400);
    const courseId = rawCourseId as keyof typeof questionSets;
    const questions = questionSets[courseId];
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
    const { data, error } = await supabase.from("exam_attempts").insert({ course_id: courseId, candidate_name: candidateName, answers: detailedAnswers, correct_count: correctCount, total: questions.length, percent, passed }).select("id").single();
    if (error) throw error;
    return json({ attemptId: data.id, correctCount, total: questions.length, percent, passed, corrections: detailedAnswers.map((answer, index) => ({ correct: answer.correct, explanation: questions[index].explanation })) });
  } catch (error) {
    console.error(error);
    return json({ error: error instanceof Error && error.message === "Réponses invalides" ? error.message : "Enregistrement impossible" }, 400);
  }
});
