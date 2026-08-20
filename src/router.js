import { getCurrentUser, userNeedsPreferences } from "./state.js";
import { renderBottomNav, showBottomNav } from "./components.js";

const routes = new Map();
const AUTH_ROUTES = new Set(["login", "signup"]);
const RETURN_KEY = "melaro_return";
const DID_NAV_KEY = "melaro_did_nav";
let enterTimer;

export function registerRoute(name, renderFn) {
  routes.set(name, renderFn);
}

function toHash(path) {
  return `#/${String(path || "").replace(/^#\/?/, "")}`;
}

function isInternalPath(path) {
  const base = String(path || "").replace(/^#\/?/, "").split("/")[0];
  return Boolean(base) && (routes.has(base) || base === "search") && !AUTH_ROUTES.has(base) && base !== "preferences";
}

export function navigate(path) {
  sessionStorage.setItem(DID_NAV_KEY, "1");
  const next = toHash(path);
  if (location.hash === next) {
    handleRoute();
    return;
  }
  location.hash = next;
}

/** Use real history after in-app navigation. Deep-linked first pages go to the fallback instead of leaving the site. */
export function goBack(fallback = "home") {
  if (sessionStorage.getItem(DID_NAV_KEY) === "1") {
    history.back();
    return;
  }
  navigate(fallback);
}

export function consumeReturnPath(fallback = "home") {
  const ret = sessionStorage.getItem(RETURN_KEY);
  sessionStorage.removeItem(RETURN_KEY);
  if (!isInternalPath(ret)) return fallback;
  return String(ret).replace(/^#\/?/, "");
}

function replaceHash(path) {
  const next = toHash(path);
  if (location.hash === next) return;
  history.replaceState(null, "", `${location.pathname}${location.search}${next}`);
  handleRoute();
}

function rememberReturnHash() {
  const hash = location.hash;
  if (isInternalPath(hash)) sessionStorage.setItem(RETURN_KEY, hash);
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [base, ...rest] = raw.split("/").filter(Boolean);
  return { base: base || "login", params: rest };
}

function runPageCleanup() {
  const app = document.getElementById("app");
  if (typeof app?.__melaroCleanup === "function") {
    try {
      app.__melaroCleanup();
    } catch (err) {
      console.error("Melaro: page cleanup failed", err);
    }
    app.__melaroCleanup = null;
  }
}

function markRouteEnter(app) {
  app.classList.remove("is-entering");
  void app.offsetWidth;
  app.classList.add("is-entering");
  clearTimeout(enterTimer);
  enterTimer = setTimeout(() => app.classList.remove("is-entering"), 280);
}

async function handleRoute({ animate = true } = {}) {
  const user = getCurrentUser();
  const app = document.getElementById("app");

  if (!location.hash) {
    replaceHash(!user ? "login" : userNeedsPreferences() ? "preferences" : "home");
    return;
  }

  const { base, params } = parseHash();

  if (!user && !AUTH_ROUTES.has(base)) {
    rememberReturnHash();
    replaceHash("login");
    return;
  }
  if (user && AUTH_ROUTES.has(base)) {
    replaceHash(userNeedsPreferences() ? "preferences" : consumeReturnPath("home"));
    return;
  }
  if (user && userNeedsPreferences() && base !== "preferences") {
    rememberReturnHash();
    replaceHash("preferences");
    return;
  }

  runPageCleanup();

  const effectiveBase = base === "search" ? "home" : base;
  const renderFn = routes.get(effectiveBase) || routes.get("notfound");

  showBottomNav(user != null && !AUTH_ROUTES.has(base) && base !== "preferences");
  renderBottomNav(base === "search" ? "search" : base);

  app.scrollTo?.(0, 0);
  window.scrollTo?.(0, 0);
  if (animate) markRouteEnter(app);
  else app.classList.remove("is-entering");

  try {
    await renderFn(app, { params, query: base === "search" ? { isSearch: true } : {} });
  } catch (err) {
    console.error("Melaro: failed to render route", base, err);
    app.innerHTML = `<div class="page page--status"><p>Something went wrong loading this page.</p></div>`;
  }
}

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-route]");
  if (!target) return;
  e.preventDefault();
  navigate(target.getAttribute("data-route"));
});

export function startRouter() {
  sessionStorage.removeItem(DID_NAV_KEY);
  window.addEventListener("hashchange", () => handleRoute());
  window.addEventListener("melaro:sync", () => handleRoute({ animate: false }));
  handleRoute();
}
