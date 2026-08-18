import { signup } from "../state.js";
import { navigate } from "../router.js";
import { isValidEmail, showToast } from "../utils.js";
import { icons } from "../components.js";

export function renderSignup(container) {
  container.innerHTML = `
    <div class="page page--auth">
      <header class="auth-header">
        <p class="brand-word">Melaro</p>
        <p>Welcome to Melaro</p>
      </header>

      <form class="auth-form" id="signup-form" novalidate>
        <h1>Sign Up</h1>

        <div class="field" id="field-fullName">
          <label for="fullName">Full Name:</label>
          <input class="input" id="fullName" name="fullName" type="text" placeholder="Enter your full name" autocomplete="name" required />
          <p class="field-error" role="alert"></p>
        </div>

        <div class="field" id="field-username">
          <label for="username">Username:</label>
          <input class="input" id="username" name="username" type="text" placeholder="Enter username" autocomplete="username" required />
          <p class="field-error" role="alert"></p>
        </div>

        <div class="field" id="field-email">
          <label for="email">Email:</label>
          <input class="input" id="email" name="email" type="email" placeholder="Enter your email" autocomplete="email" required />
          <p class="field-error" role="alert"></p>
        </div>

        <div class="field" id="field-password">
          <label for="password">Password:</label>
          <div class="input-wrap">
            <input class="input" id="password" name="password" type="password" placeholder="Enter your password" autocomplete="new-password" required />
            <button type="button" class="input-toggle-visibility" data-toggle-for="password" aria-label="Show password">${icons.eye}</button>
          </div>
          <p class="field-hint">At least 6 characters.</p>
          <p class="field-error" role="alert"></p>
        </div>

        <div class="field" id="field-confirmPassword">
          <label for="confirmPassword">Confirm Password:</label>
          <div class="input-wrap">
            <input class="input" id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter your password" autocomplete="new-password" required />
            <button type="button" class="input-toggle-visibility" data-toggle-for="confirmPassword" aria-label="Show password">${icons.eye}</button>
          </div>
          <p class="field-error" role="alert"></p>
        </div>

        <button type="submit" class="btn btn-primary">Sign Up</button>
      </form>

      <p class="auth-switch">Already have an account? <button type="button" id="go-login">Login</button></p>
    </div>
  `;

  const form = container.querySelector("#signup-form");

  container.querySelectorAll("[data-toggle-for]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = form.elements[btn.getAttribute("data-toggle-for")];
      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      btn.innerHTML = showing ? icons.eye : icons.eyeOff;
      btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
    });
  });

  container.querySelector("#go-login").addEventListener("click", () => navigate("login"));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = ["fullName", "username", "email", "password", "confirmPassword"];
    fields.forEach((name) => clearError(container.querySelector(`#field-${name}`)));

    const values = Object.fromEntries(fields.map((name) => [name, form[name].value.trim()]));
    let hasError = false;

    if (values.fullName.length < 2) {
      setError(container, "fullName", "Enter your full name.");
      hasError = true;
    }
    if (!/^[a-z0-9_.]{3,20}$/i.test(values.username)) {
      setError(container, "username", "3-20 characters: letters, numbers, underscore or dot.");
      hasError = true;
    }
    if (!isValidEmail(values.email)) {
      setError(container, "email", "Enter a valid email address.");
      hasError = true;
    }
    if (form.password.value.length < 6) {
      setError(container, "password", "Password must be at least 6 characters.");
      hasError = true;
    }
    if (form.confirmPassword.value !== form.password.value) {
      setError(container, "confirmPassword", "Passwords do not match.");
      hasError = true;
    }
    if (hasError) return;

    const result = signup({
      fullName: values.fullName,
      username: values.username,
      email: values.email,
      password: form.password.value,
    });

    if (!result.ok) {
      if (result.error === "username-taken") setError(container, "username", "That username is already taken.");
      if (result.error === "email-taken") setError(container, "email", "An account with that email already exists.");
      return;
    }

    showToast("Account created");
    navigate("preferences");
  });
}

function setError(container, name, message) {
  const field = container.querySelector(`#field-${name}`);
  field.classList.add("has-error");
  field.querySelector(".field-error").textContent = message;
}
function clearError(field) {
  field.classList.remove("has-error");
  field.querySelector(".field-error").textContent = "";
}
