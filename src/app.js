import { registerRoute, startRouter } from "./router.js";
import { renderLogin } from "./pages/login.js";
import { renderSignup } from "./pages/signup.js";
import { renderPreferences } from "./pages/preferences.js";
import { renderHome } from "./pages/home.js";
import { renderCreateEvent } from "./pages/createEvent.js";
import { renderEventDetails } from "./pages/eventDetails.js";
import { renderProfile } from "./pages/profile.js";
import { renderSchedule } from "./pages/schedule.js";
import { emptyStateHTML } from "./components.js";

registerRoute("login", renderLogin);
registerRoute("signup", renderSignup);
registerRoute("preferences", renderPreferences);
registerRoute("home", renderHome);
registerRoute("create", renderCreateEvent);
registerRoute("event", renderEventDetails);
registerRoute("profile", renderProfile);
registerRoute("schedule", renderSchedule);
registerRoute("notfound", (container) => {
  container.innerHTML = `
    <div class="page page--status">
      ${emptyStateHTML({
        title: "Page not found",
        body: "That link doesn't match anything in Melaro.",
      })}
      <button type="button" class="btn btn-primary" data-route="home">Back to Home</button>
    </div>
  `;
});

document.getElementById("app")?.addEventListener(
  "error",
  (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.hasAttribute("data-cover")) return;
    img.closest("[data-media]")?.classList.add("media--fallback");
    img.remove();
  },
  true
);

startRouter();
