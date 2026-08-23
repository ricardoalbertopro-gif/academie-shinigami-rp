const questions = [
  { id: "spiritual-foundation", text: "Quel est le fondement d'une technique spirituelle stable ?", options: ["Libérer toute son énergie immédiatement", "Contrôler précisément le flux de Reiryoku", "Réciter l'incantation le plus vite possible", "Maintenir une pression spirituelle maximale"] },
  { id: "reiryoku-definition", text: "Que désigne le Reiryoku ?", options: ["La pression ressentie autour d'un combattant", "La structure extérieure d'une barrière", "La réserve d'énergie spirituelle contenue dans l'âme", "La trajectoire suivie par un sort"] },
  { id: "reiatsu-definition", text: "Que représente le Reiatsu ?", options: ["Une formule réservée aux arts de soin", "La pression produite lorsque la puissance spirituelle se manifeste", "Une réserve indépendante du Reiryoku", "Le nom donné à toute incantation"] },
  { id: "hado-purpose", text: "Quelle est la fonction principale du Hadō ?", options: ["Soigner une blessure", "Maintenir un scellement durable", "Produire un effet offensif ou destructeur", "Masquer toute présence spirituelle"] },
  { id: "bakudo-purpose", text: "À quoi sert principalement le Bakudō ?", options: ["À augmenter définitivement le Reiryoku", "À contraindre, protéger ou soutenir", "À remplacer toutes les techniques offensives", "À soigner les blessures physiques"] },
  { id: "kaido-purpose", text: "Quel est le principe du Kaidō ?", options: ["Accroître la pression exercée sur un adversaire", "Restaurer l'équilibre spirituel afin de soutenir la guérison", "Transformer une barrière en attaque", "Rompre immédiatement tout scellement"] },
  { id: "barrier-stability", text: "De quoi dépend principalement la stabilité d'une barrière ?", options: ["De sa couleur et de sa forme extérieure", "Du nombre d'adversaires présents", "Du contrôle et de la puissance spirituelle de son utilisateur", "De la longueur du Zanpakutō"] },
  { id: "full-incantation", text: "Quel avantage apporte une incantation complète ?", options: ["Elle rend le pratiquant impossible à interrompre", "Elle guide et renforce la structure du sort", "Elle supprime toute dépense d'énergie", "Elle garantit que la cible sera atteinte"] },
  { id: "incantation-omission", text: "Quel compromis accompagne généralement l'abandon de l'incantation ?", options: ["Une portée supérieure mais une exécution plus lente", "Une guérison plus rapide sans dépense supplémentaire", "Une exécution plus rapide, mais une puissance réduite et davantage de contrôle requis", "Une technique plus puissante sans risque d'échec"] },
  { id: "unstable-technique", text: "Que faire lorsqu'une technique devient instable ?", options: ["L'alimenter avec toute l'énergie restante", "Interrompre l'apport, dissiper le flux et reprendre le contrôle", "La diriger vers la cible la plus proche", "Accélérer l'incantation sans modifier le flux"] },
  { id: "high-rank-discipline", text: "Que faut-il retenir des arts de rang élevé ?", options: ["Ils sont toujours préférables aux techniques simples", "Ils peuvent être utilisés sans entraînement si la réserve est suffisante", "Ils exigent davantage de maîtrise, de puissance et de stabilité", "Ils ne présentent aucun danger pour les alliés"] },
  { id: "right-technique", text: "Quelle décision démontre la meilleure maîtrise du Kidō en mission ?", options: ["Employer systématiquement la technique la plus puissante", "Choisir la technique la plus simple qui accomplit l'objectif sans risque inutile", "Ignorer l'environnement pour conserver sa concentration", "Attendre l'épuisement complet avant de changer de voie"] }
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
