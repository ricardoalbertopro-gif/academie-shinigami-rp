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
  { id: "spiritual-foundation", answer: 2, explanation: "Ajouter de la puissance à un flux instable aggrave sa déformation. Il faut réduire l'apport, rétablir une circulation régulière puis reformer la technique." },
  { id: "reiryoku-definition", answer: 0, explanation: "Une grande réserve ne garantit pas une exécution correcte : la dispersion révèle ici un défaut de contrôle du Reiryoku." },
  { id: "reiatsu-definition", answer: 3, explanation: "Le Reiatsu confirme qu'une puissance spirituelle se manifeste, mais ne permet pas de mesurer précisément la réserve restante ni d'identifier à lui seul la technique préparée." },
  { id: "hado-purpose", answer: 1, explanation: "Lorsque l'objectif est un effet offensif immédiat et que l'axe est sûr, un Hadō précisément dosé répond directement au besoin." },
  { id: "bakudo-purpose", answer: 2, explanation: "Le Bakudō permet de contraindre sans blesser et comprend aussi des fonctions défensives adaptées à la sécurisation du passage." },
  { id: "kaido-purpose", answer: 0, explanation: "Le Kaidō demande d'évaluer le patient et de restaurer progressivement son équilibre spirituel, sans transfert aveugle ni précipitation." },
  { id: "barrier-stability", answer: 3, explanation: "Une rupture localisée malgré une réserve suffisante indique un défaut de structure ou de répartition. La forme doit être corrigée avant d'augmenter la puissance." },
  { id: "full-incantation", answer: 1, explanation: "Quand le temps et la protection sont disponibles, l'incantation complète offre la structure la plus stable et permet de développer pleinement l'effet." },
  { id: "incantation-omission", answer: 0, explanation: "L'urgence et le besoin limité justifient ici une exécution abrégée, à condition d'accepter sa puissance réduite et d'en maîtriser le risque." },
  { id: "unstable-technique", answer: 2, explanation: "Près des alliés, il faut cesser d'alimenter la technique puis dissiper son flux de manière contrôlée plutôt que tenter de la transformer ou de la projeter." },
  { id: "high-rank-discipline", answer: 3, explanation: "Une technique simple, maîtrisée et suffisante est plus fiable qu'un art supérieur dont la structure demeure incertaine." },
  { id: "right-technique", answer: 1, explanation: "La combinaison d'une protection et d'une contrainte répond aux deux objectifs sans exposer les alliés à une attaque inutile." }
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
