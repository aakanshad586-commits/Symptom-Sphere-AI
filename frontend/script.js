const configuredApiOrigin = document.querySelector('meta[name="api-base-url"]')?.content.trim();
const isLocalFrontendServer = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  && window.location.port !== "5000";
const API_BASE = configuredApiOrigin
  ? `${configuredApiOrigin.replace(/\/+$/, "")}/api`
  : window.location.protocol === "file:"
    ? "http://127.0.0.1:5000/api"
    : isLocalFrontendServer
      ? `${window.location.protocol}//${window.location.hostname}:5000/api`
      : `${window.location.origin}/api`;
const MIN_SYMPTOMS = 4;
const MAX_SYMPTOMS = 6;
document.addEventListener("change", (event) => {
  if (!event.target.matches("#symptomList input") || state.selected.size <= MAX_SYMPTOMS) return;
  state.selected.delete(event.target.value);
  event.target.checked = false;
  notify(`Select no more than ${MAX_SYMPTOMS} symptoms.`);
  renderSymptomList();
});
const state = { symptoms: [], selected: new Set(), category: "all", dataset: null, library: [], charts: {}, backendError: null };
const translations = {
  en: { home: "Home", howItWorks: "How it works", features: "Features", about: "About", launchDashboard: "Launch dashboard", exploreDashboard: "Explore dashboard", learnHow: "Learn how it works", startCheck: "Start symptom check", backendConnected: "Backend connected", backendOffline: "Backend offline", connecting: "Connecting to backend...", overview: "Overview", checker: "Symptom checker", results: "Prediction results", library: "Health library", insights: "Model insights", website: "About website", backWebsite: "Back to website", goodToSee: "Good to see you.", checkerTitle: "What are you experiencing?", checkerIntro: "Select 4 to 6 symptoms from the simplified model vocabulary. This produces an educational screening output, never a confirmed diagnosis.", searchSymptoms: "Search symptoms...", yourSelection: "Your selection", selected: "symptoms selected", selectedHint: "Choose 4 to 6 symptoms for a focused result.", clear: "Clear all", analyze: "Analyze symptoms", noMatch: "No matching symptoms.", connectSymptoms: "Connect the backend to load symptoms.", chooseSymptoms: "Select 4 to 6 symptoms first.", libraryHeading: "Reference, not diagnosis.", libraryIntro: "General educational notes for the condition classes represented in the public dataset.", searchConditions: "Search conditions...", seekHelp: "When to seek help:" },
  mr: { home: "मुख्यपृष्ठ", howItWorks: "हे कसे काम करते", features: "वैशिष्ट्ये", about: "आमच्याबद्दल", launchDashboard: "डॅशबोर्ड उघडा", exploreDashboard: "डॅशबोर्ड पहा", learnHow: "हे कसे काम करते", startCheck: "लक्षणांची तपासणी सुरू करा", backendConnected: "बॅकएंड जोडलेले आहे", backendOffline: "बॅकएंड ऑफलाइन आहे", connecting: "बॅकएंडशी जोडत आहे...", overview: "आढावा", checker: "लक्षण तपासणी", results: "अंदाजाचे निकाल", library: "आरोग्य माहिती", insights: "मॉडेल माहिती", website: "वेबसाइटविषयी", backWebsite: "वेबसाइटवर परत जा", goodToSee: "तुम्हाला पुन्हा पाहून आनंद झाला.", checkerTitle: "तुम्हाला कोणती लक्षणे जाणवत आहेत?", checkerIntro: "सोप्या मॉडेलमधून ४ ते ६ लक्षणे निवडा. हा शैक्षणिक अंदाज आहे, निश्चित निदान नाही.", searchSymptoms: "लक्षणे शोधा...", yourSelection: "तुमची निवड", selected: "लक्षणे निवडली", selectedHint: "अचूक निकालासाठी ४ ते ६ लक्षणे निवडा.", clear: "सर्व हटवा", analyze: "लक्षणांचे विश्लेषण करा", noMatch: "जुळणारी लक्षणे नाहीत.", connectSymptoms: "लक्षणे लोड करण्यासाठी बॅकएंड जोडा.", chooseSymptoms: "प्रथम ४ ते ६ लक्षणे निवडा.", libraryHeading: "संदर्भासाठी, निदानासाठी नाही.", libraryIntro: "या सार्वजनिक डेटासेटमधील आजारांच्या वर्गांबद्दल सामान्य शैक्षणिक माहिती.", searchConditions: "आजार शोधा...", seekHelp: "मदत कधी घ्यावी:" }
};
translations.en.descriptionTitle = "Symptom descriptions";
translations.en.descriptionHint = "Select symptoms to read their descriptions.";
translations.en.descriptionUnavailable = "No description is available for this symptom.";
translations.en.descriptionFallback = "This is an educational symptom reference. Consider it together with your other symptoms and seek professional advice when needed.";
translations.en.userDescriptionLabel = "Describe your symptoms (optional)";
translations.en.userDescriptionPlaceholder = "Add details such as when it started, severity, or what you noticed...";
translations.en.guidanceTitle = "General guidance, not a prescription";
translations.en.guidanceNote = "Do not self-medicate. Consult a qualified healthcare professional for diagnosis and treatment.";
translations.mr.checkerIntro = "सोप्या मॉडेलमधून ४ ते ६ लक्षणे निवडा. हा शैक्षणिक अंदाज आहे, निश्चित निदान नाही.";
translations.mr.descriptionTitle = "लक्षणांचे वर्णन";
translations.mr.descriptionHint = "लक्षणांची माहिती वाचण्यासाठी लक्षणे निवडा.";
translations.mr.descriptionUnavailable = "या लक्षणाचे वर्णन उपलब्ध नाही.";
translations.mr.descriptionFallback = "ही शैक्षणिक लक्षण माहिती आहे. इतर लक्षणांसोबत याचा विचार करा आणि गरज असल्यास वैद्यकीय तज्ज्ञांचा सल्ला घ्या.";
translations.mr.userDescriptionLabel = "तुमच्या लक्षणांचे वर्णन करा (पर्यायी)";
translations.mr.userDescriptionPlaceholder = "लक्षणे कधी सुरू झाली, तीव्रता किंवा तुम्हाला काय जाणवले ते लिहा...";
translations.mr.guidanceTitle = "सामान्य मार्गदर्शन, प्रिस्क्रिप्शन नाही";
translations.mr.guidanceNote = "स्वतःहून औषधोपचार करू नका. निदान आणि उपचारांसाठी पात्र वैद्यकीय तज्ज्ञांचा सल्ला घ्या.";
let language = "en";
const t = (key) => translations[language][key] || translations.en[key] || key;
const marathiSymptoms = {
  abdominal_pain: "पोटदुखी", acne: "मुरुम", acidity: "आम्लपित्त", anxiety: "चिंता", back_pain: "पाठदुखी", belly_pain: "पोटदुखी", blackheads: "ब्लॅकहेड्स", bladder_discomfort: "मूत्राशयात अस्वस्थता", blister: "फोड", blurred_and_distorted_vision: "अस्पष्ट किंवा विकृत दृष्टी", breathlessness: "धाप लागणे", burning_micturition: "लघवी करताना जळजळ", chest_pain: "छातीत दुखणे", chills: "थंडी वाजणे", congestion: "नाक बंद होणे", constipation: "बद्धकोष्ठता", continuous_sneezing: "सतत शिंका येणे", cough: "खोकला", cramps: "आकडी", dark_urine: "गडद रंगाची लघवी", dizziness: "चक्कर येणे", fatigue: "थकवा", fever: "ताप", headache: "डोकेदुखी", itching: "खाज", joint_pain: "सांधेदुखी", loss_of_appetite: "भूक मंदावणे", nausea: "मळमळ", neck_pain: "मानदुखी", skin_rash: "त्वचेवर पुरळ", sore_throat: "घसा दुखणे", stomach_pain: "पोटदुखी", swelling_joints: "सांधे सुजणे", swelling_of_legs: "पाय सुजणे", swelling_of_stomach: "पोट सुजणे", vomiting: "उलट्या", weakness_in_limbs: "हातपायात अशक्तपणा"
};
function formatSymptomLabel(value) { return language === "mr" ? marathiSymptoms[value] || formatLabel(value) : formatLabel(value); }
const $ = (selector) => document.querySelector(selector);
const dashboardContent = $("#dashboardContent");

async function api(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot reach the backend at ${API_BASE}. Start Flask or check the deployed service URL.`);
    }
    throw error;
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The backend returned an error.");
  return data;
}

function notify(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 3200); }
function setTitle(text) { const titles = { "Good to see you.": t("goodToSee"), "Symptom checker": t("checker"), "Prediction results": t("results"), "Health library": t("library"), "Model insights": t("insights"), "About the website": t("website") }; $("#viewTitle").textContent = titles[text] || text; }
function formatLabel(value) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function escapeHTML(value) { const div = document.createElement("div"); div.textContent = value ?? ""; return div.innerHTML; }

function setText(selector, text) { document.querySelectorAll(selector).forEach((element) => { [...element.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).forEach((node) => { node.remove(); }); element.append(document.createTextNode(` ${text}`)); }); }
function applyLanguage() { document.documentElement.lang = language === "mr" ? "mr" : "en"; document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); }); $("#languageToggle").textContent = language === "en" ? "मराठी" : "English"; setText(".dashboard-nav button[data-view='overview']", t("overview")); setText(".dashboard-nav button[data-view='checker']", t("checker")); setText(".dashboard-nav button[data-view='results']", t("results")); setText(".dashboard-nav button[data-view='library']", t("library")); setText(".dashboard-nav button[data-view='insights']", t("insights")); setText(".dashboard-nav button[data-view='website']", t("website")); setText("#backHome", t("backWebsite")); if (state.dataset && !$("#dashboardView").classList.contains("hidden")) showView(document.querySelector(".dashboard-nav button.active")?.dataset.view || "overview"); }
Object.assign($("#languageToggle").style, { border: "1px solid var(--line)", borderRadius: "7px", padding: "8px 11px", background: "var(--white)", color: "var(--teal)", fontSize: "12px", fontWeight: "700", transition: "all .2s ease" });
document.querySelectorAll(".launch-button").forEach((button) => button.addEventListener("click", () => openDashboard("overview")));
$("#languageToggle").addEventListener("click", () => { language = language === "en" ? "mr" : "en"; applyLanguage(); });
$("#mobileMenu").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
$("#backHome").addEventListener("click", () => { $("#dashboardView").classList.add("hidden"); $("#landingView").classList.remove("hidden"); window.scrollTo(0, 0); });

async function openDashboard(view) {
  $("#landingView").classList.add("hidden"); $("#dashboardView").classList.remove("hidden"); window.scrollTo(0, 0);
  await loadDashboardData(); showView(view);
}

async function loadDashboardData() {
  try {
    const [dataset, charts, library, model] = await Promise.all([api("/dataset-info"), api("/charts"), api("/health-library"), api("/model-info")]);
    state.dataset = { ...dataset, model }; state.library = library.items || []; state.charts = charts;
    state.backendError = null;
  } catch (error) {
    state.backendError = error.message;
    notify(error.message);
  }
}

document.querySelectorAll(".dashboard-nav button").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
function showView(view) {
  document.querySelectorAll(".dashboard-nav button").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  const views = { overview: renderOverview, checker: renderChecker, results: renderResults, library: renderLibrary, insights: renderInsights, website: renderProject };
  (views[view] || renderOverview)();
}

function renderOverview() {
  setTitle("Good to see you."); const data = state.dataset;
  if (!data) {
    dashboardContent.innerHTML = `<div class="panel loading"><h2>Backend unavailable</h2><p>${escapeHTML(state.backendError || "Connect to the backend to load dashboard data.")}</p><button class="button button-primary" id="retryBackend">Retry connection</button></div>`;
    $("#retryBackend").addEventListener("click", async () => { await loadDashboardData(); showView("overview"); });
    return;
  }
  dashboardContent.innerHTML = `<div class="dash-grid"><div class="stat-card"><div><small>Supported classes</small><strong>${data.class_count}</strong></div><span class="stat-icon"><i class="fa-solid fa-layer-group"></i></span></div><div class="stat-card"><div><small>Available symptoms</small><strong>${data.feature_count}</strong></div><span class="stat-icon"><i class="fa-solid fa-list-check"></i></span></div><div class="stat-card"><div><small>Dataset records</small><strong>${data.records.toLocaleString()}</strong></div><span class="stat-icon"><i class="fa-solid fa-database"></i></span></div><div class="stat-card"><div><small>Model status</small><strong>${data.model.model_status === "ready" ? "Ready" : "Setup"}</strong></div><span class="stat-icon"><i class="fa-solid fa-circle-check"></i></span></div></div><div class="dashboard-columns"><div class="panel"><div class="panel-heading"><div><h2>Disease class distribution</h2><p>Records grouped by target label</p></div></div><div class="chart-wrap"><canvas id="diseaseChart"></canvas></div></div><div class="panel"><div class="panel-heading"><div><h2>Common symptoms</h2><p>Frequency across dataset records</p></div></div><div class="chart-wrap"><canvas id="symptomChart"></canvas></div></div></div><div class="panel quick-start" style="margin-top:15px"><div><h2>Ready to run a check?</h2><p>Choose symptoms from the dataset vocabulary and see how the educational classifier responds.</p></div><button class="button button-light" id="overviewChecker">Start symptom check <i class="fa-solid fa-arrow-right"></i></button></div>`;
  $("#overviewChecker").addEventListener("click", () => showView("checker")); renderCharts();
}

function renderCharts() {
  Object.values(state.charts).forEach((chart) => chart?.destroy?.());
  const colors = ["#0f9d8a", "#f4a261", "#367c9b", "#72b9ab", "#183b56", "#ed8b74", "#8ab6c5", "#e0bd6a"];
  const disease = state.charts.disease_distribution || {}; const symptoms = state.charts.symptom_frequency || {};
  state.charts.disease = new Chart($("#diseaseChart"), { type: "bar", data: { labels: Object.keys(disease).map(formatLabel), datasets: [{ data: Object.values(disease), backgroundColor: colors, borderRadius: 4, borderSkipped: false }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { display: false }, grid: { display: false } }, y: { grid: { color: "#edf2f3" }, ticks: { precision: 0 } } } } });
  state.charts.symptom = new Chart($("#symptomChart"), { type: "doughnut", data: { labels: Object.keys(symptoms).map(formatLabel), datasets: [{ data: Object.values(symptoms), backgroundColor: colors, borderWidth: 3, borderColor: "#fff" }] }, options: { responsive: true, maintainAspectRatio: false, cutout: "64%", plugins: { legend: { position: "bottom", labels: { boxWidth: 10, font: { size: 9 } } } } } });
}

function renderChecker() {
  setTitle(t("checker")); if (!state.dataset) { dashboardContent.innerHTML = `<div class="panel loading">${t("connectSymptoms")}</div>`; return; }
  dashboardContent.innerHTML = `<div class="view-intro"><h2>${t("checkerTitle")}</h2><p>${t("checkerIntro")}</p></div><div class="checker-layout"><div class="panel"><div class="search-box"><i class="fa-solid fa-search"></i><input id="symptomSearch" placeholder="${t("searchSymptoms")}" aria-label="${t("searchSymptoms")}"></div><div class="symptom-list" id="symptomList"></div></div><div class="panel selected-panel"><div class="panel-heading"><div><h2>${t("yourSelection")}</h2><small><span id="selectedCount">0</span> ${t("selected")}</small></div><i class="fa-solid fa-clipboard-check" style="color:var(--teal)"></i></div><div class="selected-tags" id="selectedTags"><span class="empty-state">${t("selectedHint")}</span></div><div class="symptom-description-box" id="symptomDescriptions"><h3>${t("descriptionTitle")}</h3><label class="field-label" for="symptomNote">${t("userDescriptionLabel")}</label><textarea id="symptomNote" class="symptom-note" rows="3" placeholder="${t("userDescriptionPlaceholder")}">${escapeHTML(state.symptomNote || "")}</textarea><div id="symptomDescriptionItems"><p class="empty-state">${t("descriptionHint")}</p></div></div><div class="panel-actions"><button class="button button-outline" id="clearSymptoms">${t("clear")}</button><button class="button button-primary" id="analyzeSymptoms">${t("analyze")} <i class="fa-solid fa-arrow-right"></i></button></div></div></div>`;
  Object.assign($("#symptomDescriptions").style, { marginTop: "18px", padding: "15px", border: "1px solid var(--line)", borderRadius: "8px", background: "var(--paper)", maxHeight: "340px", overflow: "auto" }); Object.assign($("#symptomNote").style, { width: "100%", margin: "8px 0 12px", padding: "10px", border: "1px solid var(--line)", borderRadius: "7px", resize: "vertical", font: "inherit", color: "var(--navy)", background: "var(--white)" }); $("#symptomNote").addEventListener("input", (event) => { state.symptomNote = event.target.value; }); renderSymptomList(); $("#symptomSearch").addEventListener("input", renderSymptomList); $("#clearSymptoms").addEventListener("click", () => { state.selected.clear(); renderSymptomList(); }); $("#analyzeSymptoms").addEventListener("click", predict);
}
function renderSymptomList() { const query = $("#symptomSearch")?.value.toLowerCase() || ""; const list = $("#symptomList"); if (!list) return; list.innerHTML = state.dataset.symptoms.filter((symptom) => formatSymptomLabel(symptom).toLowerCase().includes(query) || formatLabel(symptom).toLowerCase().includes(query)).map((symptom) => `<label class="symptom-option"><input type="checkbox" value="${escapeHTML(symptom)}" ${state.selected.has(symptom) ? "checked" : ""}>${escapeHTML(formatSymptomLabel(symptom))}</label>`).join("") || `<span class="empty-state">${t("noMatch")}</span>`; list.querySelectorAll("input").forEach((input) => input.addEventListener("change", (event) => { event.target.checked ? state.selected.add(event.target.value) : state.selected.delete(event.target.value); renderSymptomList(); })); const tags = $("#selectedTags"); $("#selectedCount").textContent = state.selected.size; tags.innerHTML = state.selected.size ? [...state.selected].map((symptom) => `<span class="tag">${escapeHTML(formatSymptomLabel(symptom))}</span>`).join("") : `<span class="empty-state">${t("selectedHint")}</span>`; const descriptionItems = $("#symptomDescriptionItems"); if (descriptionItems) descriptionItems.innerHTML = state.selected.size ? [...state.selected].map((symptom) => `<div class="symptom-description"><strong>${escapeHTML(formatSymptomLabel(symptom))}</strong><p>${escapeHTML(t("descriptionFallback"))}</p></div>`).join("") : `<p class="empty-state">${t("descriptionHint")}</p>`; }
const symptomCategories = [
  ["all", "All symptoms", "fa-layer-group"],
  ["eyes", "Eyes", "fa-eye"],
  ["face", "Face", "fa-face-smile"],
  ["skin", "Skin", "fa-hand-dots"],
  ["respiratory", "Respiratory", "fa-lungs"],
  ["digestive", "Digestive", "fa-utensils"],
  ["urinary", "Urinary", "fa-droplet"],
  ["body", "Body & movement", "fa-person"],
  ["other", "Other", "fa-ellipsis"],
];
const symptomCategoryKeywords = {
  eyes: ["eye", "vision", "visual", "watering"],
  face: ["acne", "blackhead", "puffy_face", "red_sore_around_nose", "face", "facial"],
  skin: ["acne", "blackhead", "blister", "itching", "nail", "pimple", "rash", "skin", "sore_around_nose", "spots", "scurring", "silver_like", "ulcers_on_tongue", "yellowish_skin"],
  respiratory: ["breath", "sputum", "cough", "congestion", "sneez", "smell", "phlegm", "throat", "sinus", "runny_nose", "blood_in_sputum"],
  digestive: ["abdominal", "acidity", "bowel", "constipation", "diarr", "distention", "indigestion", "appetite", "nausea", "stomach", "vomit", "gases", "liver", "jaundice", "anus", "anal"],
  urinary: ["bladder", "micturition", "urine", "polyuria", "urination"],
  body: ["back", "joint", "muscle", "neck", "limb", "walking", "knee", "hip", "stiffness", "cramp", "weakness", "fever", "chill", "fatigue", "dizziness", "headache", "sensorium", "balance", "concentration", "depression", "slurred", "spinning", "unsteadiness", "restlessness", "mood", "pain", "swelling", "heart", "pulse", "sweat", "weight", "hunger", "thirst", "obesity"]
};
function getSymptomCategory(symptom) { const match = Object.entries(symptomCategoryKeywords).find(([, keywords]) => keywords.some((keyword) => symptom.includes(keyword))); return match?.[0] || "other"; }
function getRelatedDiseases(symptom) { return Object.entries(state.dataset?.disease_symptoms || {}).filter(([, symptoms]) => symptoms.includes(symptom)).map(([disease]) => disease).slice(0, 5); }
const diseaseReferenceImages = {
  acne: "https://commons.wikimedia.org/wiki/Special:FilePath/Acne%20vulgaris.jpg?width=900",
  psoriasis: "https://commons.wikimedia.org/wiki/Special:FilePath/Psoriasis%20on%20the%20back.jpg?width=900",
  "chicken pox": "https://commons.wikimedia.org/wiki/Special:FilePath/Varicella.JPG?width=900",
  jaundice: "https://commons.wikimedia.org/wiki/Special:FilePath/Jaundice%20in%20a%20baby.jpg?width=900",
  conjunctivitis: "https://commons.wikimedia.org/wiki/Special:FilePath/Conjunctivitis.jpg?width=900"
};
function diseaseReferenceImage(disease) { const key = disease.toLowerCase(); const match = Object.entries(diseaseReferenceImages).find(([name]) => key.includes(name)); return match?.[1] || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80"; }
let eyeCameraStream = null;
function stopEyeCamera() { eyeCameraStream?.getTracks().forEach((track) => track.stop()); eyeCameraStream = null; }
function renderEyeSelfCheck() {
  const list = $("#symptomList"); const existing = $("#eyeSelfCheck");
  if (state.category !== "eyes") { existing?.remove(); stopEyeCamera(); return; }
  if (existing || !list) return;
  list.insertAdjacentHTML("beforebegin", `<section class="eye-self-check" id="eyeSelfCheck"><div class="eye-self-check-heading"><div><span class="eyebrow">Private on-device preview</span><h3>Eye camera check</h3></div><i class="fa-solid fa-shield-halved"></i></div><p class="eye-self-check-note">Use the laptop camera to look for visible changes. The camera does not automatically identify symptoms or diagnose eye conditions. No image is uploaded or saved.</p><div class="eye-camera-frame"><video id="eyeCamera" autoplay muted playsinline></video><div class="eye-camera-placeholder" id="eyeCameraPlaceholder"><i class="fa-solid fa-camera"></i><span>Camera preview is off</span></div></div><div class="eye-camera-actions"><button type="button" class="button button-primary button-small" id="startEyeCamera"><i class="fa-solid fa-video"></i> Start camera</button><button type="button" class="button button-outline button-small" id="stopEyeCamera" disabled>Stop</button></div><p class="eye-camera-guidance"><strong>Visible eye symptoms are not selected automatically.</strong> Stop using the camera and seek qualified medical advice if you notice redness, puffiness, yellowing, pain, or vision changes.</p></section>`);
  const video = $("#eyeCamera"); const placeholder = $("#eyeCameraPlaceholder"); const start = $("#startEyeCamera"); const stop = $("#stopEyeCamera");
  start.addEventListener("click", async () => { try { eyeCameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false }); video.srcObject = eyeCameraStream; placeholder.classList.add("hidden"); start.disabled = true; stop.disabled = false; } catch (error) { notify("Camera access was not available. You can still select symptoms from the dataset."); } });
  stop.addEventListener("click", () => { stopEyeCamera(); video.srcObject = null; placeholder.classList.remove("hidden"); start.disabled = false; stop.disabled = true; });
}
function renderCategoryTabs() { const container = $("#symptomCategories"); if (!container) return; container.innerHTML = symptomCategories.map(([value, label, icon]) => `<button type="button" class="category-tab ${state.category === value ? "active" : ""}" data-category="${value}"><i class="fa-solid ${icon}"></i><span>${label}</span></button>`).join(""); container.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => { state.category = button.dataset.category; renderCategoryTabs(); renderSymptomList(); })); }
function renderSymptomList() { const list = $("#symptomList"); if (!list || !state.dataset) return; if (!$("#symptomCategories")) { list.insertAdjacentHTML("beforebegin", '<div class="category-tabs" id="symptomCategories"></div>'); renderCategoryTabs(); } const query = $("#symptomSearch")?.value.toLowerCase() || ""; const symptoms = state.dataset.symptoms.filter((symptom) => (state.category === "all" || getSymptomCategory(symptom) === state.category) && (formatSymptomLabel(symptom).toLowerCase().includes(query) || formatLabel(symptom).toLowerCase().includes(query))); list.innerHTML = symptoms.map((symptom) => `<label class="symptom-option"><input type="checkbox" value="${escapeHTML(symptom)}" ${state.selected.has(symptom) ? "checked" : ""}>${escapeHTML(formatSymptomLabel(symptom))}</label>`).join("") || `<span class="empty-state">${t("noMatch")}</span>`; list.querySelectorAll("input").forEach((input) => input.addEventListener("change", (event) => { event.target.checked ? state.selected.add(event.target.value) : state.selected.delete(event.target.value); renderSymptomList(); })); const tags = $("#selectedTags"); $("#selectedCount").textContent = state.selected.size; tags.innerHTML = state.selected.size ? [...state.selected].map((symptom) => `<span class="tag">${escapeHTML(formatSymptomLabel(symptom))}</span>`).join("") : `<span class="empty-state">${t("selectedHint")}</span>`; const descriptionItems = $("#symptomDescriptionItems"); if (descriptionItems) descriptionItems.innerHTML = state.selected.size ? [...state.selected].map((symptom) => { const related = getRelatedDiseases(symptom); return `<div class="symptom-description"><strong>${escapeHTML(formatSymptomLabel(symptom))}</strong><p>${escapeHTML(t("descriptionFallback"))}${related.length ? `<br><strong>Dataset-related classes:</strong> ${related.map((disease) => escapeHTML(disease)).join(", ")}` : ""}</p></div>`; }).join("") : `<p class="empty-state">${t("descriptionHint")}</p>`; }

async function predict() { if (state.selected.size < MIN_SYMPTOMS) { notify(`Select at least ${MIN_SYMPTOMS} symptoms first.`); return; } if (state.selected.size > MAX_SYMPTOMS) { notify(`Select no more than ${MAX_SYMPTOMS} symptoms.`); return; } const button = $("#analyzeSymptoms"); button.disabled = true; button.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...'; try { const result = await api("/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ symptoms: [...state.selected] }) }); state.prediction = result; state.selected.clear(); showView("results"); } catch (error) { notify(error.message); button.disabled = false; button.innerHTML = 'Analyze symptoms <i class="fa-solid fa-arrow-right"></i>'; } }
function renderResults() { setTitle("Prediction results"); const result = state.prediction; const precautions = result?.precautions || []; const possibleCauses = result?.possible_causes || []; const comfortMeasures = result?.comfort_measures || []; const isNoMatch = result?.status === "no_clear_match"; const image = result && !isNoMatch ? `<figure class="disease-reference"><img src="${diseaseReferenceImage(result.predicted_class)}" alt="Educational reference image related to ${escapeHTML(formatLabel(result.predicted_class))}" loading="lazy" onerror="this.closest('figure').classList.add('image-unavailable')"><figcaption>Educational reference image only. This image is not evidence of your condition.</figcaption></figure>` : ""; dashboardContent.innerHTML = result ? `<div class="view-intro"><p class="eyebrow">Your latest model output</p><h2>${isNoMatch ? "No clear dataset match" : "Educational screening result"}</h2><p>${isNoMatch ? "The model did not find a strong enough match to name a disease." : "Here is what the trained classifier returned for this symptom pattern."}</p></div><div class="result-card ${isNoMatch ? "result-no-match" : ""}"><span class="result-label"><i class="fa-solid ${isNoMatch ? "fa-circle-question" : "fa-clipboard-check"}"></i> ${isNoMatch ? "Uncertain result" : "Predicted class"}</span><h2>${escapeHTML(formatLabel(result.predicted_class))}</h2>${image}<p>${escapeHTML(result.message)}</p><div class="result-tags">${result.selected_symptoms.map((symptom) => `<span class="tag">${escapeHTML(formatSymptomLabel(symptom))}</span>`).join("")}</div><div class="result-guidance"><h3>${t("guidanceTitle")}</h3><p>${escapeHTML(result.description || "")}</p>${possibleCauses.length ? `<h3>Possible causes</h3><ul>${possibleCauses.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : ""}${comfortMeasures.length ? `<h3>Temporary comfort measures</h3><ul>${comfortMeasures.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : ""}${precautions.length ? `<ul>${precautions.slice(0, 4).map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>` : ""}<p><strong>${escapeHTML(result.guidance || "")}</strong></p><p class="metric-note">${t("guidanceNote")}</p></div><div class="disclaimer"><strong>Important:</strong> This system is an educational prototype and does not provide medical diagnosis. Symptoms may have multiple causes. Consult a qualified healthcare professional for medical advice.</div><div class="panel-actions"><button class="button button-primary" id="newCheck">Start new check</button><button class="button button-outline" id="resultHome">Return to dashboard</button></div></div>` : '<div class="panel empty-state">No prediction yet. Start a symptom check to see a result.</div>'; $("#newCheck")?.addEventListener("click", () => showView("checker")); $("#resultHome")?.addEventListener("click", () => showView("overview")); }
function renderLibrary() { setTitle("Health library"); dashboardContent.innerHTML = `<div class="view-intro"><h2>${t("libraryHeading")}</h2><p>${t("libraryIntro")}</p><div class="search-box" style="max-width:420px"><i class="fa-solid fa-search"></i><input id="librarySearch" placeholder="${t("searchConditions")}" aria-label="${t("searchConditions")}"></div></div><div class="library-grid" id="libraryGrid"></div>`; const draw = () => { const query = $("#librarySearch").value.toLowerCase(); $("#libraryGrid").innerHTML = state.library.filter((item) => item.name.toLowerCase().includes(query)).map((item) => { const description = language === "mr" ? `${formatLabel(item.name)} या आजाराबद्दलची ही सामान्य शैक्षणिक माहिती आहे. अचूक माहितीसाठी आरोग्य तज्ज्ञांचा सल्ला घ्या.` : item.description; const precautions = language === "mr" ? ["आरोग्य तज्ज्ञांचा सल्ला घ्या.", "स्वतःहून औषधोपचार करू नका.", "लक्षणे वाढल्यास त्वरित वैद्यकीय मदत घ्या."] : item.precautions.slice(0, 3); const guidance = language === "mr" ? "लक्षणे गंभीर, सतत किंवा चिंताजनक असल्यास पात्र वैद्यकीय तज्ज्ञांचा सल्ला घ्या." : item.guidance; return `<article class="panel library-card"><span class="condition-icon"><i class="fa-solid fa-leaf"></i></span><h3>${escapeHTML(item.name)}</h3><p>${escapeHTML(description)}</p><ul>${precautions.map((precaution) => `<li>${escapeHTML(precaution)}</li>`).join("")}</ul><p><strong>${t("seekHelp")}</strong> ${escapeHTML(guidance)}</p></article>`; }).join("") || `<div class="panel empty-state">${language === "mr" ? "या शोधासाठी कोणतेही आजार सापडले नाहीत." : "No conditions match that search."}</div>`; }; $("#librarySearch").addEventListener("input", draw); draw(); }
function renderInsights() { setTitle("Model insights"); const data = state.dataset; const metrics = data?.model?.metrics || {}; dashboardContent.innerHTML = `<div class="view-intro"><h2>Look under the hood.</h2><p>Transparent project metadata and measured evaluation details for classroom discussion.</p></div><div class="insight-grid"><div class="panel"><div class="panel-heading"><div><h2>Model configuration</h2><p>Loaded from backend metadata</p></div></div><div class="info-list"><div class="info-row"><span>Dataset</span><strong>${escapeHTML(data?.dataset_name || "Unavailable")}</strong></div><div class="info-row"><span>Algorithm</span><strong>${escapeHTML(data?.model?.model_name || "Unavailable")}</strong></div><div class="info-row"><span>Features</span><strong>${data?.feature_count || 0} symptoms</strong></div><div class="info-row"><span>Classes</span><strong>${data?.class_count || 0} disease labels</strong></div><div class="info-row"><span>Status</span><strong>${data?.model?.model_status || "Unavailable"}</strong></div></div><h3 style="margin:26px 0 13px;font-size:16px">Feature vocabulary</h3><div class="feature-cloud">${(data?.symptoms || []).map((item) => `<span>${escapeHTML(formatLabel(item))}</span>`).join("")}</div></div><div class="panel"><div class="panel-heading"><div><h2>Evaluation</h2><p>Only shown when calculated by training</p></div></div>${metrics.available ? `<div class="stat-card" style="padding:0;border:0;box-shadow:none"><div><small>Holdout accuracy</small><strong>${(metrics.accuracy * 100).toFixed(1)}%</strong></div><span class="stat-icon"><i class="fa-solid fa-chart-line"></i></span></div><div class="stat-card" style="padding:25px 0 0;border:0;box-shadow:none"><div><small>Macro F1 score</small><strong>${(metrics.macro_f1 * 100).toFixed(1)}%</strong></div></div><p class="metric-note">${escapeHTML(metrics.note || "Measured on a stratified holdout set.")}</p>` : `<p class="metric-note">No reliable holdout metric is available. ${escapeHTML(metrics.reason || "Train the model first.")}</p>`}<div class="disclaimer">Metrics from public symptom datasets should not be interpreted as real-world medical accuracy.</div></div></div>`; }
function renderProject() { setTitle("About the website"); dashboardContent.innerHTML = `<div class="project-grid"><div class="panel"><p class="eyebrow">SY Engineering mini-project</p><h2>SymptomSphere AI</h2><p>SymptomSphere AI demonstrates how artificial intelligence and data science can transform structured symptom records into an educational classification workflow.</p><h3>Objectives</h3><ul><li>Apply preprocessing and classification techniques.</li><li>Build a functional Flask and vanilla JavaScript application.</li><li>Visualize dataset structure and model metadata.</li><li>Understand the limits of machine learning in healthcare.</li></ul><h3>Methodology</h3><p>Data collection &rarr; cleaning &rarr; binary feature encoding &rarr; Random Forest training &rarr; measured evaluation &rarr; educational prediction.</p></div><div class="panel"><h3>Website details</h3><div class="info-list"><div class="info-row"><span>College</span><strong>NMIET, Pune</strong></div><div class="info-row"><span>Subject</span><strong>FAI</strong></div></div><h3>Future scope</h3><p>Larger expert-reviewed datasets, multilingual support, improved validation, and expert-reviewed educational content.</p><div class="disclaimer">Do not enter personal medical information. This prototype does not store patient data or replace clinical advice.</div></div></div>`; }

document.addEventListener("focusin", (event) => { if (event.target.id === "symptomSearch" || event.target.id === "librarySearch") event.target.type = "search"; });

// Start on the public site; dashboard data is loaded only when the workspace opens.