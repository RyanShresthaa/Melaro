import { getCategories, createEvent } from "../state.js";
import { navigate } from "../router.js";
import { escapeHTML, isPastDate, showToast, todayISO, setNamedError, clearNamedError } from "../utils.js";
import { icons } from "../components.js";
import { mountDatePicker, mountTimePicker } from "../pickers.js";

const MAX_COVER_BYTES = 2 * 1024 * 1024;

export function renderCreateEvent(container) {
  const categories = getCategories();
  let coverDataUrl = null;

  container.innerHTML = `
    <div class="page page--create">
      <div class="topbar">
        <button type="button" class="topbar__back" data-route="home">${icons.back} Create Event</button>
      </div>

      <form id="create-event-form" class="create-form" novalidate>
        <div class="cover-upload" id="cover-upload">
          <input type="file" accept="image/*" id="cover-input" class="sr-only" />
          <label for="cover-input" class="cover-upload__cta" id="cover-placeholder">
            ${icons.camera}<span>Add Cover Page</span>
          </label>
        </div>
        <p class="field-hint" id="cover-hint">JPG or PNG, up to 2MB. Optional — a placeholder image is used if skipped.</p>

        <div class="field" id="field-title">
          <label for="title">Event Title:</label>
          <input class="input" id="title" name="title" type="text" placeholder="Enter event title" required />
          <p class="field-error" role="alert"></p>
        </div>

        <div class="field" id="field-description">
          <label for="description">Description:</label>
          <textarea class="input" id="description" name="description" placeholder="Enter event description" required></textarea>
          <p class="field-error" role="alert"></p>
        </div>

        <div class="field-row">
          <div class="field" id="field-date">
            <span class="field-label" id="date-label">Date:</span>
            <input type="hidden" id="date" name="date" value="" />
            <div class="select-menu">
              <button type="button" class="select-menu__trigger" id="date-trigger"
                aria-haspopup="dialog" aria-expanded="false" aria-controls="date-panel"
                aria-labelledby="date-label">
                <span class="select-menu__value select-menu__value--placeholder">Select date</span>
                <span class="select-menu__chevron" aria-hidden="true"></span>
              </button>
              <div class="select-menu__popover" id="date-panel" hidden></div>
            </div>
            <p class="field-error" role="alert"></p>
          </div>
          <div class="field" id="field-time">
            <span class="field-label" id="time-label">Time:</span>
            <input type="hidden" id="time" name="time" value="" />
            <div class="select-menu">
              <button type="button" class="select-menu__trigger" id="time-trigger"
                aria-haspopup="dialog" aria-expanded="false" aria-controls="time-panel"
                aria-labelledby="time-label">
                <span class="select-menu__value select-menu__value--placeholder">Select time</span>
                <span class="select-menu__chevron" aria-hidden="true"></span>
              </button>
              <div class="select-menu__popover" id="time-panel" hidden></div>
            </div>
            <p class="field-error" role="alert"></p>
          </div>
        </div>

        <div class="field" id="field-location">
          <label for="location">Location:</label>
          <input class="input" id="location" name="location" type="text" placeholder="Enter Location" required />
          <p class="field-error" role="alert"></p>
        </div>

        <div class="field" id="field-type">
          <label id="type-label">Event Type:</label>
          <div class="radio-group" role="radiogroup" aria-labelledby="type-label">
            <label class="radio-option"><input type="radio" name="type" value="public" checked /> Public</label>
            <label class="radio-option"><input type="radio" name="type" value="private" /> Private</label>
          </div>
          <p class="field-hint">Private events stay off Home and Search. People join from a shared link.</p>
        </div>

        <div class="field" id="field-category">
          <span class="field-label" id="category-label">Category:</span>
          <input type="hidden" id="category" name="category" value="" />
          <div class="select-menu">
            <button type="button" class="select-menu__trigger" id="category-trigger"
              aria-haspopup="listbox" aria-expanded="false" aria-controls="category-list"
              aria-labelledby="category-label">
              <span class="select-menu__value select-menu__value--placeholder">Select Category</span>
              <span class="select-menu__chevron" aria-hidden="true"></span>
            </button>
            <ul class="select-menu__list" id="category-list" role="listbox" hidden>
              ${categories
                .map(
                  (c, i) => `
                <li>
                  <button type="button" class="select-menu__option" role="option" id="category-opt-${i}"
                    data-value="${escapeHTML(c)}" aria-selected="false" tabindex="-1">
                    ${escapeHTML(c)}
                  </button>
                </li>`
                )
                .join("")}
            </ul>
          </div>
          <p class="field-error" role="alert"></p>
        </div>

        <div class="create-actions">
          <button type="submit" class="btn btn-primary">Create Event</button>
        </div>
      </form>
    </div>
  `;

  const form = container.querySelector("#create-event-form");
  const datePicker = mountDatePicker({
    input: container.querySelector("#date"),
    trigger: container.querySelector("#date-trigger"),
    panel: container.querySelector("#date-panel"),
    min: todayISO(),
    onChange: () => clearNamedError(container, "date"),
    onOpen: () => {
      closeCategoryMenu();
      timePicker.close();
    },
  });
  const timePicker = mountTimePicker({
    input: container.querySelector("#time"),
    trigger: container.querySelector("#time-trigger"),
    panel: container.querySelector("#time-panel"),
    onChange: () => clearNamedError(container, "time"),
    onOpen: () => {
      closeCategoryMenu();
      datePicker.close();
    },
  });

  const categoryInput = container.querySelector("#category");
  const categoryTrigger = container.querySelector("#category-trigger");
  const categoryList = container.querySelector("#category-list");
  const categoryValue = categoryTrigger.querySelector(".select-menu__value");
  const categoryOptions = () => [...categoryList.querySelectorAll("[data-value]")];
  let activeIndex = -1;

  function setActiveOption(index) {
    const items = categoryOptions();
    if (!items.length) return;
    activeIndex = ((index % items.length) + items.length) % items.length;
    items.forEach((el, i) => el.classList.toggle("is-active", i === activeIndex));
    const active = items[activeIndex];
    categoryTrigger.setAttribute("aria-activedescendant", active.id);
    active.scrollIntoView({ block: "nearest" });
  }

  function chooseOption(option) {
    if (!option) return;
    const value = option.getAttribute("data-value");
    categoryInput.value = value;
    categoryValue.textContent = value;
    categoryValue.classList.remove("select-menu__value--placeholder");
    categoryOptions().forEach((el) => el.setAttribute("aria-selected", el === option));
    closeCategoryMenu();
    clearNamedError(container, "category");
    categoryTrigger.focus();
  }

  function closeCategoryMenu() {
    categoryList.hidden = true;
    categoryTrigger.setAttribute("aria-expanded", "false");
    categoryTrigger.removeAttribute("aria-activedescendant");
    categoryOptions().forEach((el) => el.classList.remove("is-active"));
    activeIndex = -1;
  }

  function openCategoryMenu() {
    datePicker.close();
    timePicker.close();
    categoryList.hidden = false;
    categoryTrigger.setAttribute("aria-expanded", "true");
    const items = categoryOptions();
    const selected = items.findIndex((el) => el.getAttribute("aria-selected") === "true");
    setActiveOption(selected >= 0 ? selected : 0);
  }

  function closeAllMenus() {
    closeCategoryMenu();
    datePicker.close();
    timePicker.close();
  }

  categoryTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (categoryTrigger.getAttribute("aria-expanded") === "true") closeCategoryMenu();
    else openCategoryMenu();
  });

  categoryTrigger.addEventListener("keydown", (e) => {
    const open = categoryTrigger.getAttribute("aria-expanded") === "true";
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) openCategoryMenu();
      else setActiveOption(activeIndex + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        openCategoryMenu();
        setActiveOption(categoryOptions().length - 1);
      } else setActiveOption(activeIndex - 1);
    } else if (e.key === "Home" && open) {
      e.preventDefault();
      setActiveOption(0);
    } else if (e.key === "End" && open) {
      e.preventDefault();
      setActiveOption(categoryOptions().length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!open) openCategoryMenu();
      else chooseOption(categoryOptions()[activeIndex]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      closeCategoryMenu();
    }
  });

  categoryList.addEventListener("click", (e) => {
    const option = e.target.closest("[data-value]");
    if (!option) return;
    chooseOption(option);
  });

  const onDocClick = (e) => {
    if (!container.isConnected) {
      teardown();
      return;
    }
    if (!e.target.closest(".select-menu")) closeAllMenus();
  };
  const onDocKey = (e) => {
    if (e.key === "Escape") closeAllMenus();
  };
  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onDocKey);

  let cleaned = false;
  function teardown() {
    if (cleaned) return;
    cleaned = true;
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onDocKey);
  }
  container.__melaroCleanup = teardown;

  const coverUpload = container.querySelector("#cover-upload");
  const coverInput = container.querySelector("#cover-input");
  const coverPlaceholder = container.querySelector("#cover-placeholder");
  const coverHint = container.querySelector("#cover-hint");

  coverUpload.addEventListener("click", (e) => {
    if (e.target.closest(".cover-upload__remove") || e.target === coverInput || e.target.closest("label")) return;
    if (coverUpload.querySelector("img")) coverInput.click();
  });

  coverInput.addEventListener("change", () => {
    const file = coverInput.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      coverHint.textContent = "That file isn't an image. Choose a JPG or PNG.";
      coverHint.style.color = "var(--color-accent)";
      coverInput.value = "";
      return;
    }
    if (file.size > MAX_COVER_BYTES) {
      coverHint.textContent = "That image is too large. Choose a file under 2MB.";
      coverHint.style.color = "var(--color-accent)";
      coverInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      coverDataUrl = reader.result;
      coverPlaceholder.hidden = true;
      let img = coverUpload.querySelector("img");
      if (!img) {
        img = document.createElement("img");
        img.alt = "Selected cover preview";
        coverUpload.append(img);
      }
      img.src = coverDataUrl;

      let removeBtn = coverUpload.querySelector(".cover-upload__remove");
      if (!removeBtn) {
        removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "cover-upload__remove";
        removeBtn.setAttribute("aria-label", "Remove cover image");
        removeBtn.innerHTML = icons.x;
        removeBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          coverDataUrl = null;
          coverInput.value = "";
          img.remove();
          removeBtn.remove();
          coverPlaceholder.hidden = false;
        });
        coverUpload.append(removeBtn);
      }
      coverHint.style.color = "";
      coverHint.textContent = "Cover selected. Click the image to replace it.";
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fieldNames = ["title", "description", "date", "time", "location", "category"];
    fieldNames.forEach((name) => clearNamedError(container, name));

    const values = {
      title: form.title.value.trim(),
      description: form.description.value.trim(),
      date: form.date.value,
      time: form.time.value,
      location: form.location.value.trim(),
      type: form.type.value,
      category: form.category.value,
    };

    let hasError = false;
    if (values.title.length < 3) {
      setNamedError(container, "title", "Give your event a title (at least 3 characters).");
      hasError = true;
    }
    if (values.description.length < 10) {
      setNamedError(container, "description", "Add a bit more description (at least 10 characters).");
      hasError = true;
    }
    if (!values.date) {
      setNamedError(container, "date", "Choose a date.");
      hasError = true;
    } else if (isPastDate(values.date)) {
      setNamedError(container, "date", "Date can't be in the past.");
      hasError = true;
    }
    if (!values.time) {
      setNamedError(container, "time", "Choose a time.");
      hasError = true;
    }
    if (!values.location) {
      setNamedError(container, "location", "Add a location.");
      hasError = true;
    }
    if (!values.category) {
      setNamedError(container, "category", "Select a category.");
      hasError = true;
    }
    if (hasError) {
      const firstError = container.querySelector(".has-error input, .has-error textarea, .has-error .select-menu__trigger");
      firstError?.focus();
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    teardown();
    const event = createEvent({ ...values, coverDataUrl });
    if (!event) {
      if (submitBtn) submitBtn.disabled = false;
      return;
    }
    showToast("Event created");
    navigate(`event/${event.id}`);
  });
}
