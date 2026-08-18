import { getCurrentUser } from "./state.js";
import { renderBottomNav, showBottomNav } from "./components.js";

const routes = new Map();
const AUTH_ROUTES = new Set(["login", "signup"]);
const NAV_VISIBLE_ROUTES = new Set(["home", "search", "create", "schedule", "profile", "event"]);

export function registerRoute(name, renderFn) {
  routes.set(name, renderFn);
}

export function navigate(path) {
  if (location.hash.slice(1) === path) {
    handleRoute();
    return;
  }
  location.hash = path;
}

export function goBack(fallback = "home") {
  navigate(fallback);
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "");
  const [base, ...rest] = raw.split("/").filter(Boolean);
  return { base: base || "login", params: rest };
}

async function handleRoute() {
  const { base, params } = parseHash();
  const user = getCurrentUser();
  const app = document.getElementById("app");

  if (!user && !AUTH_ROUTES.has(base)) {
    location.hash = "#/login";
    return;
  }
  if (user && AUTH_ROUTES.has(base)) {
    location.hash = "#/home";
    return;
  }

  const effectiveBase = base === "search" ? "home" : base;
  const renderFn = routes.get(effectiveBase) || routes.get("notfound");

  showBottomNav(user != null && NAV_VISIBLE_ROUTES.has(effectiveBase));
  renderBottomNav(base === "search" ? "search" : base);

  app.scrollTo?.(0, 0);
  window.scrollTo?.(0, 0);

  try {
    await renderFn(app, { params, query: base === "search" ? { isSearch: true } : {} });
  } catch (err) {
    console.error("Melaro: failed to render route", base, err);
    app.innerHTML = `<div class="page" style="padding:${"40px 20px"}"><p>Something went wrong loading this page.</p></div>`;
  }
}

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-route]");
  if (!target) return;
  e.preventDefault();
  navigate(target.getAttribute("data-route"));
});

export function startRouter() {
  window.addEventListener("hashchange", handleRoute);
  handleRoute();
}
