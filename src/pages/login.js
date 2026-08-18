import { login } from "../state.js";
import { navigate } from "../router.js";
import { escapeHTML, showToast } from "../utils.js";
import { icons } from "../components.js";
import { DEMO_USER } from "../data.js";

export function renderLogin(container) {
  container.innerHTML = `
    <div class="page page--auth">
      <header class="auth-header">
        <p class="brand-word">Melaro</p>
        <p>Plan. Celebrate. Remember.</p>
      </header>

      <form class="auth-form" id="login-form" novalidate>
        <h1>Login</h1>

        <div class="field" id="field-identifier">
          <label for="identifier">Email/Username:</label>
          <input class="input" id="identifier" name="identifier" type="text"
            placeholder="Enter your email/username" autocomplete="username" required />
          <p class="field-error" role="alert"></p>
        </div>

        <div class="field" id="field-password">
          <label for="password">Password:</label>
          <div class="input-wrap">
            <input class="input" id="password" name="password" type="password"
              placeholder="Enter your password" autocomplete="current-password" required />
            <button type="button" class="input-toggle-visibility" id="toggle-password" aria-label="Show password">
              ${icons.eye}
            </button>
          </div>
          <p class="field-error" role="alert"></p>
        </div>

        <button type="submit" class="btn btn-primary">Login</button>
      </form>

      <p class="auth-switch">Don't have an account? <button type="button" id="go-signup">Sign up</button></p>
      <p class="auth-demo-hint">
        New here? <button type="button" id="use-demo">Fill in the demo account</button> to explore instantly.
      </p>
    </div>
  `;

  const form = container.querySelector("#login-form");
  const identifierField = container.querySelector("#field-identifier");
  const passwordField = container.querySelector("#field-password");

  container.querySelector("#toggle-password").addEventListener("click", (e) => {
    const input = container.querySelector("#password");
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    e.currentTarget.innerHTML = showing ? icons.eye : icons.eyeOff;
    e.currentTarget.setAttribute("aria-label", showing ? "Show password" : "Hide password");
  });

  container.querySelector("#go-signup").addEventListener("click", () => navigate("signup"));

  container.querySelector("#use-demo").addEventListener("click", () => {
    form.identifier.value = DEMO_USER.username;
    form.password.value = DEMO_USER.password;
    clearError(identifierField);
    clearError(passwordField);
    form.identifier.focus();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearError(identifierField);
    clearError(passwordField);

    const identifier = form.identifier.value.trim();
    const password = form.password.value;

    if (!identifier) {
      setError(identifierField, "Enter your email or username.");
      return;
    }
    if (!password) {
      setError(passwordField, "Enter your password.");
      return;
    }

    const result = login(identifier, password);
    if (!result.ok) {
      if (result.error === "no-account") {
        setError(identifierField, "No Melaro account found with that email/username.");
      } else {
        setError(passwordField, "Incorrect password. Try again.");
      }
      return;
    }

    showToast(`Welcome back, ${result.user.fullName.split(" ")[0]}`);
    navigate("home");
  });
}

function setError(field, message) {
  field.classList.add("has-error");
  field.querySelector(".field-error").textContent = message;
}
function clearError(field) {
  field.classList.remove("has-error");
  field.querySelector(".field-error").textContent = "";
}
