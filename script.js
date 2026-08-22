const questions = [
  {
    text: "Quel est l'objectif principal du Hakuda ?",
    options: ["Frapper aussi fort que possible", "Contrôler le corps à corps et exploiter les ouvertures", "Remplacer définitivement le Zanpakutō", "Augmenter la pression spirituelle"],
    answer: 1,
    explanation: "Le Hakuda recherche le contrôle de la distance, de l'équilibre et des ouvertures, pas seulement la puissance brute."
  },
  {
    text: "Pourquoi faut-il conserver une garde souple ?",
    options: ["Pour paraître moins menaçant", "Pour économiser son Reiatsu uniquement", "Pour réagir vite sans fatiguer inutilement les muscles", "Pour empêcher toute esquive"],
    answer: 2,
    explanation: "Une garde trop rigide fatigue le combattant et ralentit ses réactions."
  },
  {
    text: "Quelle distance favorise les saisies, les coudes et les projections ?",
    options: ["La distance longue", "La distance moyenne", "La distance courte", "Toutes de manière identique"],
    answer: 2,
    explanation: "Ces techniques exigent d'entrer au contact : elles appartiennent principalement à la distance courte."
  },
  {
    text: "Face à une attaque de Zanjutsu très puissante, quelle réponse limite le choc direct ?",
    options: ["Crisper davantage sa prise", "Dévier la trajectoire de la lame", "Fermer les yeux et bloquer", "Avancer en ligne droite"],
    answer: 1,
    explanation: "Une déviation accompagne ou détourne la force au lieu de chercher à l'arrêter frontalement."
  },
  {
    text: "Pourquoi varier le rythme de ses attaques ?",
    options: ["Pour rendre les gestes plus spectaculaires", "Pour empêcher l'adversaire d'anticiper", "Pour allonger volontairement le combat", "Pour ne plus avoir besoin de garde"],
    answer: 1,
    explanation: "Les changements de vitesse et les retards perturbent la lecture et le timing de la défense adverse."
  },
  {
    text: "Que doit principalement observer un pratiquant de Zanjutsu ?",
    options: ["Uniquement la pointe de la lame", "Uniquement les yeux", "L'ensemble du corps et le mouvement adverse", "Le décor derrière lui"],
    answer: 2,
    explanation: "Le corps entier révèle l'équilibre, la direction, la portée et l'intention d'une attaque."
  },
  {
    text: "À quoi sert une feinte ?",
    options: ["À imposer une blessure en RP", "À provoquer une réaction et créer une ouverture", "À interrompre définitivement le combat", "À restaurer son énergie"],
    answer: 1,
    explanation: "Une feinte présente une fausse intention afin de provoquer une défense exploitable."
  },
  {
    text: "Quel avantage peut offrir un espace étroit contre une arme très longue ?",
    options: ["Il augmente sa portée", "Il limite ses grands mouvements", "Il rend son porteur invisible", "Il annule automatiquement son Shikai"],
    answer: 1,
    explanation: "Les murs et obstacles peuvent empêcher une arme longue de développer pleinement ses trajectoires."
  },
  {
    text: "Quel membre d'une équipe analyse les capacités ennemies et transmet les informations ?",
    options: ["Le finisseur", "L'avant-garde", "L'observateur", "Le contrôleur"],
    answer: 2,
    explanation: "L'observateur lit le combat et partage les informations nécessaires à l'adaptation du groupe."
  },
  {
    text: "Votre mission consiste seulement à recueillir des informations. L'ennemi est très supérieur. Que faire ?",
    options: ["Combattre jusqu'à l'épuisement", "Libérer immédiatement toutes ses capacités", "Transmettre les informations et battre en retraite", "Ignorer l'objectif initial"],
    answer: 2,
    explanation: "L'objectif est déjà atteint. Préserver l'équipe et rapporter les renseignements constitue ici la victoire tactique."
  },
  {
    text: "Quelle combinaison unit correctement Hakuda et Zanjutsu ?",
    options: ["Jeter sa lame avant chaque combat", "Contrôler la distance au sabre, frapper au corps à corps dans la garde puis se replacer", "Utiliser les deux sans observer l'adversaire", "Rester immobile en alternant les attaques"],
    answer: 1,
    explanation: "Les deux disciplines se complètent lorsque le combattant adapte sa technique à la distance."
  },
  {
    text: "En RP, pourquoi une attaque doit-elle être décrite comme une tentative ?",
    options: ["Parce que les personnages ne savent pas combattre", "Pour laisser à l'autre joueur la possibilité de réagir", "Pour rendre chaque action plus longue", "Parce que toutes les attaques doivent échouer"],
    answer: 1,
    explanation: "Le RP équitable respecte l'agence de l'autre joueur : chacun décrit les actions et réactions de son propre personnage."
  }
];

const quizContainer = document.querySelector("#quiz-questions");
const form = document.querySelector("#quiz-form");
const answeredCount = document.querySelector("#answered-count");
const results = document.querySelector("#results");

questions.forEach((question, index) => {
  const article = document.createElement("article");
  article.className = "question reveal";
  article.dataset.question = index;
  const options = question.options.map((option, optionIndex) => `
    <label class="option">
      <input type="radio" name="q${index}" value="${optionIndex}">
      <span>${option}</span>
    </label>`).join("");

  article.innerHTML = `
    <div class="question-head">
      <span class="question-number">${String(index + 1).padStart(2, "0")}</span>
      <h3>${question.text}</h3>
    </div>
    <div class="options">${options}</div>
    <p class="explanation"><strong>Correction :</strong> ${question.explanation}</p>`;
  quizContainer.appendChild(article);
});

function updateAnsweredCount() {
  const answered = new Set([...form.querySelectorAll("input:checked")].map(input => input.name)).size;
  answeredCount.textContent = answered;
}

form.addEventListener("change", updateAnsweredCount);

form.addEventListener("submit", event => {
  event.preventDefault();
  let score = 0;
  questions.forEach((question, index) => {
    const article = form.querySelector(`[data-question="${index}"]`);
    const selected = form.querySelector(`input[name="q${index}"]:checked`);
    const isCorrect = selected && Number(selected.value) === question.answer;
    if (isCorrect) score += 1;
    article.classList.add("graded", isCorrect ? "correct" : "incorrect");
    article.classList.remove(isCorrect ? "incorrect" : "correct");
  });

  const percent = Math.round((score / questions.length) * 100);
  document.querySelector("#score-percent").textContent = `${percent}%`;
  const passed = percent >= 75;
  document.querySelector("#result-title").textContent = passed ? "Épreuve réussie" : "Entraînement à poursuivre";
  document.querySelector("#result-text").textContent = `Vous avez obtenu ${score} bonne${score > 1 ? "s" : ""} réponse${score > 1 ? "s" : ""} sur ${questions.length}. ${passed ? "Votre maîtrise des fondamentaux est validée." : "Relisez les corrections puis tentez de nouveau l'épreuve."}`;
  results.hidden = false;
  results.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.querySelector("#retry-button").addEventListener("click", () => {
  form.reset();
  form.querySelectorAll(".question").forEach(question => question.classList.remove("graded", "correct", "incorrect"));
  answeredCount.textContent = "0";
  results.hidden = true;
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
