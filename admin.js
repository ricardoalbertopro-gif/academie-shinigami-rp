const config = window.APP_CONFIG || {};
const configured = config.supabaseUrl && !config.supabaseUrl.startsWith("__") && config.supabaseAnonKey && !config.supabaseAnonKey.startsWith("__");
const client = configured && window.supabase ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
const authPanel = document.querySelector("#auth-panel");
const pendingPanel = document.querySelector("#pending-panel");
const dashboard = document.querySelector("#dashboard");
const userPanel = document.querySelector("#admin-user");
const authForm = document.querySelector("#auth-form");
const authMessage = document.querySelector("#auth-message");
let authMode = "login";
let currentProfile = null;
let attempts = [];

const questionLabels = {
  "hakuda-goal": "Objectif du Hakuda", "flexible-guard": "Garde souple", "short-range": "Distance courte",
  "deflection": "Déviation", "rhythm": "Rythme", "observe-body": "Observation du corps", "feint": "Feinte",
  "narrow-space": "Espace étroit", "observer-role": "Rôle de l'observateur", "retreat": "Retraite tactique",
  "combine": "Hakuda et Zanjutsu", "movement-economy": "Économie des mouvements"
};

function showOnly(panel) {
  [authPanel, pendingPanel, dashboard].forEach(element => element.hidden = element !== panel);
}

function setAuthMessage(message, type = "") {
  authMessage.textContent = message;
  authMessage.className = `form-message ${type}`.trim();
}

document.querySelectorAll("[data-auth-mode]").forEach(button => button.addEventListener("click", () => {
  authMode = button.dataset.authMode;
  document.querySelectorAll("[data-auth-mode]").forEach(tab => tab.classList.toggle("active", tab === button));
  document.querySelector("#auth-submit").textContent = authMode === "login" ? "Se connecter" : "Créer ma demande";
  document.querySelector("#auth-password").autocomplete = authMode === "login" ? "current-password" : "new-password";
  setAuthMessage("");
}));

authForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!client) return setAuthMessage("Supabase n'est pas encore configuré.", "error");
  const email = document.querySelector("#auth-email").value.trim();
  const password = document.querySelector("#auth-password").value;
  setAuthMessage("Connexion en cours…");
  const result = authMode === "login"
    ? await client.auth.signInWithPassword({ email, password })
    : await client.auth.signUp({ email, password, options: { emailRedirectTo: `${location.origin}${location.pathname}` } });
  if (result.error) return setAuthMessage(result.error.message, "error");
  if (authMode === "signup" && !result.data.session) {
    return setAuthMessage("Compte créé. Confirmez l'adresse reçue par e-mail, puis connectez-vous.", "success");
  }
  await loadSession();
});

async function loadSession() {
  if (!client) {
    showOnly(authPanel);
    setAuthMessage("Le service d'administration n'est pas encore configuré.", "error");
    return;
  }
  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    userPanel.hidden = true;
    currentProfile = null;
    return showOnly(authPanel);
  }
  userPanel.hidden = false;
  document.querySelector("#user-email").textContent = session.user.email;
  let { data: profile, error } = await client.from("admin_profiles").select("id,email,role,created_at").eq("id", session.user.id).single();
  if (!error && profile?.role === "pending") {
    const { data: claim } = await client.functions.invoke("claim-owner", { body: {} });
    if (claim?.claimed) {
      const refreshed = await client.from("admin_profiles").select("id,email,role,created_at").eq("id", session.user.id).single();
      profile = refreshed.data;
      error = refreshed.error;
    }
  }
  if (error || !profile || !["owner", "admin"].includes(profile.role)) return showOnly(pendingPanel);
  currentProfile = profile;
  showOnly(dashboard);
  document.querySelector("#owner-section").hidden = profile.role !== "owner";
  await loadAttempts();
  if (profile.role === "owner") await loadAdmins();
}

async function signOut() {
  if (client) await client.auth.signOut();
  userPanel.hidden = true;
  currentProfile = null;
  showOnly(authPanel);
}

document.querySelector("#logout-button").addEventListener("click", signOut);
document.querySelector("#pending-logout").addEventListener("click", signOut);
document.querySelector("#refresh-button").addEventListener("click", loadAttempts);

async function loadAttempts() {
  const { data, error } = await client.from("exam_attempts").select("id,candidate_name,answers,correct_count,total,percent,passed,created_at").order("created_at", { ascending: false });
  if (error) return alert(`Impossible de charger les résultats : ${error.message}`);
  attempts = data || [];
  renderStats();
  renderAttempts();
}

function renderStats() {
  const total = attempts.length;
  const passed = attempts.filter(attempt => attempt.passed).length;
  const average = total ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.percent, 0) / total) : 0;
  document.querySelector("#stat-attempts").textContent = total;
  document.querySelector("#stat-average").textContent = `${average}%`;
  document.querySelector("#stat-passed").textContent = passed;
  document.querySelector("#stat-pass-rate").textContent = `${total ? Math.round((passed / total) * 100) : 0}%`;
}

function filteredAttempts() {
  const name = document.querySelector("#filter-name").value.trim().toLocaleLowerCase("fr");
  const result = document.querySelector("#filter-result").value;
  const date = document.querySelector("#filter-date").value;
  return attempts.filter(attempt => (!name || attempt.candidate_name.toLocaleLowerCase("fr").includes(name))
    && (result === "all" || (result === "passed") === attempt.passed)
    && (!date || attempt.created_at.slice(0, 10) >= date));
}

function renderAttempts() {
  const rows = filteredAttempts();
  document.querySelector("#empty-results").hidden = rows.length > 0;
  document.querySelector("#results-body").innerHTML = rows.map(attempt => `<tr>
    <td><strong>${escapeHtml(attempt.candidate_name)}</strong></td><td>${formatDate(attempt.created_at)}</td>
    <td>${attempt.correct_count}/${attempt.total} · ${attempt.percent}%</td>
    <td><span class="result-badge ${attempt.passed ? "passed" : "failed"}">${attempt.passed ? "Réussite" : "Échec"}</span></td>
    <td><button class="text-button detail-button" type="button" data-id="${attempt.id}">Consulter</button></td></tr>`).join("");
  document.querySelectorAll(".detail-button").forEach(button => button.addEventListener("click", () => openAttempt(button.dataset.id)));
}

["filter-name", "filter-result", "filter-date"].forEach(id => document.querySelector(`#${id}`).addEventListener("input", renderAttempts));

function openAttempt(id) {
  const attempt = attempts.find(item => item.id === id);
  if (!attempt) return;
  document.querySelector("#dialog-title").textContent = attempt.candidate_name;
  document.querySelector("#dialog-meta").textContent = `${formatDate(attempt.created_at)} · ${attempt.correct_count}/${attempt.total} · ${attempt.percent}%`;
  document.querySelector("#answer-details").innerHTML = attempt.answers.map(answer => `<li class="${answer.correct ? "answer-correct" : "answer-wrong"}"><strong>${escapeHtml(questionLabels[answer.questionId] || answer.questionId)}</strong><span>Réponse choisie : option ${answer.optionIndex + 1} · ${answer.correct ? "Correcte" : `Incorrecte (bonne option : ${answer.correctOptionIndex + 1})`}</span></li>`).join("");
  document.querySelector("#attempt-dialog").showModal();
}

document.querySelector(".dialog-close").addEventListener("click", () => document.querySelector("#attempt-dialog").close());

async function loadAdmins() {
  const { data, error } = await client.from("admin_profiles").select("id,email,role,created_at").order("created_at", { ascending: false });
  if (error) return;
  document.querySelector("#admin-requests").innerHTML = data.map(profile => `<article>
    <div><strong>${escapeHtml(profile.email)}</strong><small>${roleLabel(profile.role)} · ${formatDate(profile.created_at)}</small></div>
    ${profile.role === "owner" ? "<span class=\"owner-badge\">Propriétaire</span>" : `<div class="role-actions">${profile.role !== "admin" ? `<button data-action="approve" data-user="${profile.id}">Accepter</button>` : ""}${profile.role === "pending" ? `<button data-action="reject" data-user="${profile.id}">Refuser</button>` : ""}${profile.role === "admin" ? `<button data-action="revoke" data-user="${profile.id}">Retirer</button>` : ""}</div>`}
  </article>`).join("");
  document.querySelectorAll("[data-action]").forEach(button => button.addEventListener("click", () => manageAdmin(button.dataset.action, button.dataset.user)));
}

async function manageAdmin(action, userId) {
  const { error } = await client.functions.invoke("manage-admin", { body: { action, userId } });
  if (error) return alert(`Action impossible : ${error.message}`);
  await loadAdmins();
}

document.querySelector("#export-button").addEventListener("click", () => {
  const header = ["Nom ou pseudonyme", "Date", "Bonnes réponses", "Total", "Pourcentage", "Résultat", "Réponses JSON"];
  const lines = filteredAttempts().map(attempt => [attempt.candidate_name, attempt.created_at, attempt.correct_count, attempt.total, attempt.percent, attempt.passed ? "Réussite" : "Échec", JSON.stringify(attempt.answers)]);
  const csv = "\uFEFF" + [header, ...lines].map(row => row.map(csvCell).join(";")).join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  link.download = `resultats-shinigami-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
});

function csvCell(value) { return `"${String(value).replaceAll('"', '""')}"`; }
function formatDate(value) { return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function roleLabel(role) { return ({ owner: "Propriétaire", admin: "Administrateur", pending: "En attente", rejected: "Refusé" })[role] || role; }
function escapeHtml(value) { const node = document.createElement("div"); node.textContent = value; return node.innerHTML; }

if (client) client.auth.onAuthStateChange(() => setTimeout(loadSession, 0));
loadSession();
