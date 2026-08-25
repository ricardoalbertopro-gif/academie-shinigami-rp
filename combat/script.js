const questions = [
  { id: "hakuda-goal", text: "Un adversaire plus puissant avance en garde haute, mais transfère tout son poids sur sa jambe avant à chaque attaque. Quelle stratégie traduit le mieux l'objectif du Hakuda ?", options: ["Opposer immédiatement sa force à la sienne pour tester sa résistance", "Contrôler son appui, provoquer son déséquilibre puis exploiter l'ouverture créée", "Maintenir la distance jusqu'à pouvoir dégainer, sans chercher à influencer sa posture", "Accroître sa pression spirituelle avant toute tentative de corps à corps"] },
  { id: "flexible-guard", text: "Après plusieurs échanges, votre adversaire alterne brusquement frappes hautes et saisies. Quelle garde offre la meilleure capacité d'adaptation ?", options: ["Une garde très contractée qui résiste mieux au premier impact, quitte à ralentir la riposte", "Une garde basse et relâchée qui économise l'énergie, même si elle expose le visage", "Une garde structurée mais souple, capable de protéger, dévier ou se transformer en saisie sans tension excessive", "Une garde constamment mobile dont l'amplitude empêche l'adversaire de repérer une position fixe"] },
  { id: "short-range", text: "Un sabreur tente de conserver sa portée, mais son dos approche d'un mur. Vous avez franchi la ligne de sa pointe sans perdre votre équilibre. Quelle distance faut-il stabiliser pour limiter sa lame et employer saisies, coudes ou projections ?", options: ["La distance longue, afin de surveiller l'ensemble de ses mouvements", "La distance moyenne, juste à l'extrémité de sa lame", "La distance courte, au contact de sa garde et de ses appuis", "Une alternance continue entre distance longue et moyenne, sans rester au contact"] },
  { id: "deflection", text: "Une coupe descendante puissante arrive alors que vos appuis sont légèrement décalés et qu'un blocage frontal risquerait de briser votre posture. Quelle réponse réduit le mieux le choc tout en préparant une riposte ?", options: ["Resserrer fortement la prise et recevoir la coupe au-dessus de la tête", "Sortir légèrement de l'axe et accompagner la lame pour en dévier la trajectoire", "Reculer en ligne droite tout en opposant le tranchant de votre Zanpakutō", "Avancer sous la coupe en comptant sur la vitesse pour traverser sa garde"] },
  { id: "rhythm", text: "Après deux enchaînements rapides, l'adversaire pare désormais votre troisième frappe avant même son déclenchement. Quelle adaptation exploite le mieux le principe du rythme ?", options: ["Augmenter uniformément la vitesse des trois frappes pour dépasser ses réflexes", "Reproduire le début de l'enchaînement, retarder ou interrompre la troisième frappe, puis attaquer sur sa parade anticipée", "Changer entièrement de technique à chaque échange afin de ne jamais répéter un mouvement", "Ralentir toutes les attaques pour conserver plus longtemps votre énergie"] },
  { id: "observe-body", text: "Un adversaire masque sa lame derrière son épaule et utilise son regard pour annoncer de fausses cibles. Quel ensemble d'indices permet la lecture la plus fiable de son attaque ?", options: ["La pointe de sa lame, car elle indique toujours la cible finale", "Ses yeux et l'orientation de sa tête, puisqu'ils précèdent nécessairement le geste", "Ses appuis, ses hanches, ses épaules et le déplacement global de son centre de gravité", "La position de sa main dominante uniquement, car elle détermine seule la trajectoire"] },
  { id: "feint", text: "Votre adversaire ferme systématiquement sa ligne intérieure lorsque vous amorcez une coupe à l'épaule, mais il ne réagit plus aux feintes répétées sans conséquence. Comment employer la feinte avec pertinence ?", options: ["Multiplier la même amorce jusqu'à ce qu'il cesse complètement de défendre", "Rendre l'amorce crédible, observer sa fermeture puis attaquer la zone qu'il découvre", "Feinter le plus loin possible de la cible afin d'augmenter l'amplitude du vrai coup", "Considérer sa première réaction comme certaine et lancer immédiatement une attaque irréversible"] },
  { id: "narrow-space", text: "Vous affrontez un utilisateur de lance dans un couloir, mais celui-ci conserve encore assez d'espace pour porter des estocs. Quel bénéfice tactique réel pouvez-vous tirer du terrain ?", options: ["Rester au fond du couloir, où l'allonge de la lance devient moins dangereuse", "Réduire ses angles et ses grands mouvements, puis choisir le moment d'entrer après avoir écarté la pointe", "Vous placer volontairement contre un mur afin qu'aucune attaque ne puisse vous contourner", "Considérer l'arme comme neutralisée dès l'entrée dans le couloir et charger immédiatement"] },
  { id: "observer-role", text: "Pendant un combat d'équipe, un membre repère que l'ennemi recharge sa technique après trois attaques et qu'il protège moins son flanc gauche. Qui doit prioritairement confirmer puis transmettre cette information sans rompre le dispositif ?", options: ["Le finisseur, même s'il doit abandonner l'ouverture qu'il préparait", "L'avant-garde, en cessant de fixer l'attention de l'ennemi", "L'observateur, dont la fonction est d'analyser les habitudes et d'informer l'unité", "Le contrôleur, en relâchant immédiatement les restrictions de mouvement"] },
  { id: "retreat", text: "Votre unité a identifié la capacité ennemie et transmis l'information recherchée. Le soutien est blessé, des civils approchent de la zone et l'adversaire reçoit des renforts. Quelle décision respecte le mieux la mission ?", options: ["Maintenir le combat pour empêcher l'ennemi de comprendre que l'information a été transmise", "Engager toutes les capacités restantes afin d'obtenir une victoire avant l'arrivée des renforts", "Organiser une retraite coordonnée, protéger le blessé et détourner le danger des civils", "Disperser l'unité afin que chaque membre tente séparément de retenir un adversaire"] },
  { id: "combine", text: "Après avoir dévié la lame adverse, vous entrez momentanément dans sa garde, mais un second ennemi peut intervenir. Quel enchaînement combine Hakuda et Zanjutsu sans sacrifier votre sécurité ?", options: ["Abandonner votre Zanpakutō pour saisir l'adversaire à deux mains et prolonger le contrôle", "Employer une frappe courte pour briser sa posture, reprendre aussitôt la distance de lame et vous replacer face aux deux menaces", "Rester au contact et alterner coups de poing et coupes jusqu'à la chute du premier adversaire", "Reculer immédiatement à longue distance sans exploiter le déséquilibre obtenu"] },
  { id: "movement-economy", text: "Lors d'un duel prolongé, un combattant multiplie les changements de garde amples et les feintes sans objectif. Quel double désavantage risque surtout de devenir exploitable ?", options: ["La diminution progressive de la longueur utile de sa lame et de sa zone d'attaque", "Une dépense d'énergie inutile et l'apparition de signaux permettant de lire ses intentions", "L'impossibilité d'utiliser ensuite une attaque à distance, quelle que soit sa réserve spirituelle", "Un abaissement automatique de son centre de gravité qui bloque ses déplacements latéraux"] }
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
  return { courseId: "combat", candidateName, answers };
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
