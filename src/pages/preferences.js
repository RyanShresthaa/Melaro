import { getCategories, getCurrentUser, savePreferences } from "../state.js";
import { navigate, consumeReturnPath } from "../router.js";
import { escapeHTML, showToast } from "../utils.js";

export function renderPreferences(container) {
  const user = getCurrentUser();
  const categories = getCategories();
  let selected = new Set(user.preferences || []);

  container.innerHTML = `
    <div class="page page--preferences">
      <header class="preferences-header">
        <p class="brand-word">Melaro</p>
        <h1>Select Your Preferences</h1>
      </header>

      <div class="chip-grid" id="pref-grid" role="group" aria-label="Interest categories">
        ${categories
          .map(
            (cat) => `
          <button type="button" class="chip" data-cat="${escapeHTML(cat)}" aria-pressed="${selected.has(cat)}">
            ${escapeHTML(cat)}
          </button>`
          )
          .join("")}
      </div>

      <div class="preferences-footer">
        <p class="preferences-count" id="pref-count"></p>
        <button type="button" class="btn btn-secondary" id="save-preferences">Save Preferences</button>
      </div>
    </div>
  `;

  const grid = container.querySelector("#pref-grid");
  const saveBtn = container.querySelector("#save-preferences");
  const countLabel = container.querySelector("#pref-count");

  function refresh() {
    countLabel.textContent =
      selected.size === 0 ? "Pick at least one category to continue" : `${selected.size} selected`;
    saveBtn.disabled = selected.size === 0;
  }

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    const cat = btn.getAttribute("data-cat");
    if (selected.has(cat)) selected.delete(cat);
    else selected.add(cat);
    btn.setAttribute("aria-pressed", selected.has(cat));
    refresh();
  });

  saveBtn.addEventListener("click", () => {
    if (selected.size === 0) return;
    savePreferences(Array.from(selected));
    showToast("Preferences saved");
    navigate(consumeReturnPath("home"));
  });

  refresh();
}
