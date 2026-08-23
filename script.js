const questions = [
  { id: "hakuda-goal", text: "Quel est l'objectif principal du Hakuda ?", options: ["Frapper aussi fort que possible", "Contrôler le corps à corps et exploiter les ouvertures", "Remplacer définitivement le Zanpakutō", "Augmenter la pression spirituelle"] },
  { id: "flexible-guard", text: "Pourquoi faut-il conserver une garde souple ?", options: ["Pour paraître moins menaçant", "Pour économiser son Reiatsu uniquement", "Pour réagir vite sans fatiguer inutilement les muscles", "Pour empêcher toute esquive"] },
  { id: "short-range", text: "Quelle distance favorise les saisies, les coudes et les projections ?", options: ["La distance longue", "La distance moyenne", "La distance courte", "Toutes de manière identique"] },
  { id: "deflection", text: "Face à une attaque de Zanjutsu très puissante, quelle réponse limite le choc direct ?", options: ["Crisper davantage sa prise", "Dévier la trajectoire de la lame", "Fermer les yeux et bloquer", "Avancer en ligne droite"] },
  { id: "rhythm", text: "Pourquoi varier le rythme de ses attaques ?", options: ["Pour rendre les gestes plus spectaculaires", "Pour empêcher l'adversaire d'anticiper", "Pour allonger volontairement le combat", "Pour ne plus avoir besoin de garde"] },
  { id: "observe-body", text: "Que doit principalement observer un pratiquant de Zanjutsu ?", options: ["Uniquement la pointe de la lame", "Uniquement les yeux", "L'ensemble du corps et le mouvement adverse", "Le décor derrière lui"] },
  { id: "feint", text: "À quoi sert une feinte ?", options: ["À garantir que le prochain coup atteindra sa cible", "À provoquer une réaction et créer une ouverture", "À interrompre définitivement le combat", "À restaurer son énergie"] },
  { id: "narrow-space", text: "Quel avantage peut offrir un espace étroit contre une arme très longue ?", options: ["Il augmente sa portée", "Il limite ses grands mouvements", "Il rend son porteur invisible", "Il neutralise automatiquement sa puissance"] },
  { id: "observer-role", text: "Quel membre d'une équipe analyse les capacités ennemies et transmet les informations ?", options: ["Le finisseur", "L'avant-garde", "L'observateur", "Le contrôleur"] },
  { id: "retreat", text: "Votre mission consiste seulement à recueillir des informations. L'ennemi est très supérieur. Que faire ?", options: ["Combattre jusqu'à l'épuisement", "Libérer immédiatement toutes ses capacités", "Transmettre les informations et battre en retraite", "Ignorer l'objectif initial"] },
  { id: "combine", text: "Quelle combinaison unit correctement Hakuda et Zanjutsu ?", options: ["Jeter sa lame avant chaque combat", "Contrôler la distance au sabre, frapper au corps à corps dans la garde puis se replacer", "Utiliser les deux sans observer l'adversaire", "Rester immobile en alternant les attaques"] },
  { id: "movement-economy", text: "Pourquoi un combattant doit-il éviter les gestes inutiles ?", options: ["Parce qu'ils réduisent la portée de sa lame", "Parce qu'ils consomment de l'énergie et révèlent ses intentions", "Parce qu'ils empêchent toute attaque à distance", "Parce qu'ils rendent sa garde systématiquement trop basse"] }
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
  return { candidateName, answers };
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
