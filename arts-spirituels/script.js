const questions = [
  { id: "spiritual-foundation", text: "Pendant la formation d'un sort, votre flux oscille et sa structure se déforme à mesure que vous augmentez la puissance. Quelle correction doit être prioritaire ?", options: ["Accélérer la récitation pour libérer le sort avant sa rupture", "Compenser chaque oscillation par une poussée de Reiatsu", "Réduire l'apport et stabiliser la circulation avant de reformer la technique", "Changer immédiatement de voie sans dissiper le flux engagé"] },
  { id: "reiryoku-definition", text: "Un candidat possède une réserve spirituelle importante, mais ses techniques se dispersent avant leur émission. Quelle conclusion est la plus juste ?", options: ["Son contrôle du Reiryoku est insuffisant malgré l'importance de sa réserve", "Son Reiatsu prouve qu'il maîtrise déjà les techniques de rang élevé", "Sa réserve doit être entièrement libérée pour empêcher la dispersion", "Il doit employer uniquement des barrières jusqu'à épuisement de sa réserve"] },
  { id: "reiatsu-definition", text: "Vous percevez à distance une pression spirituelle particulièrement forte. Que pouvez-vous en déduire avec certitude ?", options: ["La réserve totale de l'individu est presque épuisée", "L'individu prépare nécessairement un Hadō", "La technique employée sera forcément de rang élevé", "Une puissance spirituelle importante se manifeste, sans révéler précisément la réserve restante"] },
  { id: "hado-purpose", text: "Un adversaire doit être repoussé immédiatement ; l'axe est dégagé et aucune contrainte durable n'est nécessaire. Quel choix correspond le mieux à la situation ?", options: ["Établir un scellement complexe autour de toute la zone", "Employer un Hadō dosé et précisément dirigé", "Commencer un Kaidō afin de perturber son équilibre", "Déployer une barrière fermée autour de vos alliés et attendre"] },
  { id: "bakudo-purpose", text: "La mission exige de capturer un adversaire mobile sans le blesser tout en maintenant un passage sécurisé. Quelle voie répond le mieux à ces deux objectifs ?", options: ["Un Hadō de grande portée dirigé derrière la cible", "Un Kaidō appliqué à l'adversaire pour ralentir son mouvement", "Un Bakudō de contrainte complété par une protection du passage", "Une émission continue de Reiatsu sur toute la zone"] },
  { id: "kaido-purpose", text: "Un blessé présente une forte diminution de son énergie spirituelle et son état physique se dégrade. Quelle conduite respecte le principe du Kaidō ?", options: ["Évaluer son état puis restaurer progressivement son équilibre spirituel en surveillant sa réaction", "Refermer immédiatement la blessure en ignorant son niveau spirituel", "Lui transférer toute votre réserve afin d'accélérer la récupération", "Élever votre Reiatsu autour de lui pour imposer la stabilisation"] },
  { id: "barrier-stability", text: "Une barrière alimentée par une réserve suffisante se fissure toujours au même endroit sous l'impact. Quelle réponse est la plus efficace ?", options: ["Augmenter uniformément la puissance sans modifier sa forme", "Superposer une seconde barrière identique sur la première", "Maintenir la structure actuelle et réduire uniquement sa surface", "Corriger la forme et redistribuer le flux vers la zone faible avant d'ajouter de la puissance"] },
  { id: "full-incantation", text: "Vous disposez d'une position protégée et devez produire un effet aussi stable et complet que possible. Quelle méthode privilégier ?", options: ["Omettre l'incantation afin de conserver toute la réserve", "Employer l'incantation complète pour guider et renforcer la structure", "Libérer d'abord le sort puis choisir sa fonction selon le résultat", "Remplacer la concentration par une pression spirituelle constante"] },
  { id: "incantation-omission", text: "Une menace immédiate ne laisse pas le temps de réciter, mais un effet modéré suffit et vous maîtrisez la technique. Quelle décision est cohérente ?", options: ["Omettre l'incantation en acceptant une puissance réduite et une exigence de contrôle accrue", "Choisir un art de rang supérieur pour compenser automatiquement l'absence d'incantation", "Commencer la récitation complète même si l'action devient trop tardive", "Libérer davantage de Reiatsu sans former précisément la technique"] },
  { id: "unstable-technique", text: "À proximité de vos alliés, la structure d'un sort se désagrège alors qu'une partie du Reiryoku est déjà engagée. Quelle action limite le mieux le danger ?", options: ["Projeter le sort incomplet loin devant vous", "Renforcer brusquement le noyau avec le reste de votre réserve", "Cesser de l'alimenter, dissiper progressivement le flux et reprendre le contrôle", "Transformer directement le flux instable en barrière"] },
  { id: "high-rank-discipline", text: "Vous connaissez imparfaitement un art de rang élevé, tandis qu'une technique plus simple et maîtrisée suffit à remplir la mission. Quel choix démontre la meilleure discipline ?", options: ["Tenter l'art supérieur afin d'accélérer votre progression", "Employer les deux techniques simultanément pour répartir le risque", "Augmenter votre Reiatsu puis utiliser l'art supérieur sans incantation", "Choisir la technique simple, stable et suffisante"] },
  { id: "right-technique", text: "Vous devez protéger un blessé et bloquer un poursuivant dans un espace occupé par des alliés. L'adversaire n'a pas besoin d'être blessé. Quelle réponse est la plus adaptée ?", options: ["Employer un Hadō étendu pour forcer tout le monde à reculer", "Combiner protection et contrainte par le Bakudō, en gardant l'offensive en dernier recours", "Concentrer tout le Reiryoku dans le soin et ignorer le poursuivant", "Émettre un Reiatsu maximal pour immobiliser indistinctement la zone"] }
];

const config = window.APP_CONFIG || {};
const isConfigured = config.supabaseUrl && !config.supabaseUrl.startsWith("__") && config.supabaseAnonKey && !config.supabaseAnonKey.startsWith("__");
const supabaseClient = isConfigured && window.supabase ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
const quizContainer = document.querySelector("#quiz-questions");
const form = document.querySelector("#quiz-form");
const answeredCount = document.querySelector("#answered-count");
const results = document.querySelector("#results");
const submitStatus = document.querySelector("#submit-status");
const submitButton = form.querySelector("button[type=submit]");

questions.forEach((question, index) => {
  const article = document.createElement("article");
  article.className = "question reveal";
  article.dataset.question = index;
  const options = question.options.map((option, optionIndex) => `
    <label class="option"><input type="radio" name="q${index}" value="${optionIndex}"><span>${option}</span></label>`).join("");
  article.innerHTML = `<div class="question-head"><span class="question-number">${String(index + 1).padStart(2, "0")}</span><h3>${question.text}</h3></div><div class="options">${options}</div><p class="explanation"></p>`;
  quizContainer.appendChild(article);
});

function updateAnsweredCount() {
  answeredCount.textContent = new Set([...form.querySelectorAll("input:checked")].map(input => input.name)).size;
}

function setStatus(message, type = "") {
  submitStatus.textContent = message;
  submitStatus.className = `submit-status ${type}`.trim();
}

function collectSubmission() {
  const candidateName = document.querySelector("#candidate-name").value.trim();
  const answers = questions.map((question, index) => {
    const selected = form.querySelector(`input[name="q${index}"]:checked`);
    return { questionId: question.id, optionIndex: selected ? Number(selected.value) : null };
  });
  return { courseId: "arts-spirituels", candidateName, answers };
}

form.addEventListener("change", updateAnsweredCount);
form.addEventListener("submit", async event => {
  event.preventDefault();
  setStatus("");
  const submission = collectSubmission();
  if (submission.candidateName.length < 2 || submission.candidateName.length > 60) {
    setStatus("Saisissez un nom de candidat de 2 à 60 caractères.", "error");
    document.querySelector("#candidate-name").focus();
    return;
  }
  if (submission.answers.some(answer => answer.optionIndex === null)) {
    setStatus("Répondez aux 12 questions avant de valider.", "error");
    const firstMissing = submission.answers.findIndex(answer => answer.optionIndex === null);
    form.querySelector(`[data-question="${firstMissing}"]`).scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  if (!supabaseClient) {
    setStatus("Le service d'enregistrement n'est pas encore configuré. Contactez l'administrateur.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Enregistrement…";
  setStatus("Envoi sécurisé de votre copie…");
  try {
    const { data, error } = await supabaseClient.functions.invoke("submit-exam", { body: submission });
    if (error) throw error;
    if (!data || !Array.isArray(data.corrections)) throw new Error("Réponse serveur invalide");
    data.corrections.forEach((correction, index) => {
      const article = form.querySelector(`[data-question="${index}"]`);
      article.classList.add("graded", correction.correct ? "correct" : "incorrect");
      article.classList.remove(correction.correct ? "incorrect" : "correct");
      article.querySelector(".explanation").innerHTML = `<strong>Correction :</strong> ${correction.explanation}`;
    });
    document.querySelector("#score-percent").textContent = `${data.percent}%`;
    document.querySelector("#result-title").textContent = data.passed ? "Épreuve réussie" : "Entraînement à poursuivre";
    document.querySelector("#result-text").textContent = `${submission.candidateName}, vous avez obtenu ${data.correctCount} bonne${data.correctCount > 1 ? "s" : ""} réponse${data.correctCount > 1 ? "s" : ""} sur ${data.total}. Votre tentative a bien été enregistrée.`;
    results.hidden = false;
    setStatus("Tentative enregistrée avec succès.", "success");
    results.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    console.error(error);
    setStatus("L'enregistrement a échoué. Vérifiez votre connexion puis réessayez.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Valider mes réponses";
  }
});

document.querySelector("#retry-button").addEventListener("click", () => {
  form.reset();
  form.querySelectorAll(".question").forEach(question => question.classList.remove("graded", "correct", "incorrect"));
  form.querySelectorAll(".explanation").forEach(explanation => explanation.textContent = "");
  answeredCount.textContent = "0";
  results.hidden = true;
  setStatus("");
  form.scrollIntoView({ behavior: "smooth" });
});

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector("#main-nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .08 });
document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
