import { escapeHTML, formatDate, formatTime, todayISO } from "./utils.js";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function parseTime(value) {
  if (!value) return { hour12: 6, minute: "30", period: "AM" };
  const [h, m] = value.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = ((h + 11) % 12) + 1;
  const snapped = String(Math.round((m || 0) / 5) * 5).padStart(2, "0");
  return { hour12, minute: snapped === "60" ? "00" : snapped, period };
}

function toTimeValue(hour12, minute, period) {
  let hour = hour12 % 12;
  if (period === "PM") hour += 12;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export function mountDatePicker({ input, trigger, panel, min = todayISO(), onChange, onOpen }) {
  const valueEl = trigger.querySelector(".select-menu__value");
  const minDate = min;
  let view = minDate.slice(0, 7);
  let selected = input.value || "";

  function setLabel() {
    if (selected) {
      valueEl.textContent = formatDate(selected);
      valueEl.classList.remove("select-menu__value--placeholder");
    } else {
      valueEl.textContent = "Select date";
      valueEl.classList.add("select-menu__value--placeholder");
    }
  }

  function close() {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function focusDay() {
    const day =
      panel.querySelector(".date-picker__day.is-selected:not(:disabled)") ||
      panel.querySelector(".date-picker__day:not(:disabled)");
    day?.focus();
  }

  function open() {
    if (selected) view = selected.slice(0, 7);
    else view = minDate.slice(0, 7);
    renderPanel();
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    onOpen?.();
    focusDay();
  }

  function renderPanel() {
    const [year, month] = view.split("-").map(Number);
    const monthIndex = month - 1;
    const firstWeekday = new Date(year, monthIndex, 1).getDay();
    const count = daysInMonth(year, monthIndex);
    const prevAllowed = `${year}-${String(month).padStart(2, "0")}` > minDate.slice(0, 7);

    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) cells.push(`<span class="date-picker__pad"></span>`);
    for (let day = 1; day <= count; day += 1) {
      const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const disabled = iso < minDate;
      const isSelected = iso === selected;
      const isToday = iso === todayISO();
      cells.push(`
        <button type="button" class="date-picker__day${isSelected ? " is-selected" : ""}${isToday ? " is-today" : ""}"
          data-date="${iso}" ${disabled ? "disabled" : ""} aria-pressed="${isSelected}">
          ${day}
        </button>
      `);
    }

    panel.innerHTML = `
      <div class="date-picker" role="dialog" aria-label="Choose date">
        <div class="date-picker__nav">
          <button type="button" class="date-picker__nav-btn" data-nav="prev" ${prevAllowed ? "" : "disabled"} aria-label="Previous month">‹</button>
          <p class="date-picker__month">${escapeHTML(monthLabel(year, monthIndex))}</p>
          <button type="button" class="date-picker__nav-btn" data-nav="next" aria-label="Next month">›</button>
        </div>
        <div class="date-picker__weekdays">${WEEKDAYS.map((d) => `<span>${d}</span>`).join("")}</div>
        <div class="date-picker__grid">${cells.join("")}</div>
      </div>
    `;
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (trigger.getAttribute("aria-expanded") === "true") close();
    else open();
  });

  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (trigger.getAttribute("aria-expanded") !== "true") open();
    } else if (e.key === "Escape") {
      close();
    }
  });

  panel.addEventListener("click", (e) => {
    e.stopPropagation();
    const nav = e.target.closest("[data-nav]");
    if (nav) {
      const [year, month] = view.split("-").map(Number);
      const shift = nav.getAttribute("data-nav") === "next" ? 1 : -1;
      const next = new Date(year, month - 1 + shift, 1);
      view = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
      renderPanel();
      focusDay();
      return;
    }
    const day = e.target.closest("[data-date]");
    if (!day || day.disabled) return;
    selected = day.getAttribute("data-date");
    input.value = selected;
    setLabel();
    close();
    onChange?.(selected);
    trigger.focus();
  });

  panel.addEventListener("keydown", (e) => {
    const days = [...panel.querySelectorAll(".date-picker__day:not(:disabled)")];
    const index = days.indexOf(document.activeElement);
    if (index < 0) return;
    let next = index;
    if (e.key === "ArrowRight") next = Math.min(index + 1, days.length - 1);
    else if (e.key === "ArrowLeft") next = Math.max(index - 1, 0);
    else if (e.key === "ArrowDown") next = Math.min(index + 7, days.length - 1);
    else if (e.key === "ArrowUp") next = Math.max(index - 7, 0);
    else return;
    e.preventDefault();
    days[next]?.focus();
  });

  setLabel();
  return { open, close, isOpen: () => trigger.getAttribute("aria-expanded") === "true" };
}

export function mountTimePicker({ input, trigger, panel, onChange, onOpen }) {
  const valueEl = trigger.querySelector(".select-menu__value");
  let { hour12, minute, period } = parseTime(input.value);

  function setLabel() {
    if (input.value) {
      valueEl.textContent = formatTime(input.value);
      valueEl.classList.remove("select-menu__value--placeholder");
    } else {
      valueEl.textContent = "Select time";
      valueEl.classList.add("select-menu__value--placeholder");
    }
  }

  function commit() {
    input.value = toTimeValue(hour12, minute, period);
    setLabel();
    onChange?.(input.value);
  }

  function close() {
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function optionClass(selected) {
    return `time-picker__option${selected ? " is-selected" : ""}`;
  }

  function renderPanel() {
    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    panel.innerHTML = `
      <div class="time-picker" role="dialog" aria-label="Choose time">
        <div class="time-picker__col" role="listbox" aria-label="Hour">
          ${hours
            .map(
              (h) => `
            <button type="button" class="${optionClass(h === hour12)}" role="option" aria-selected="${h === hour12}" data-hour="${h}">
              ${h}
            </button>`
            )
            .join("")}
        </div>
        <div class="time-picker__col" role="listbox" aria-label="Minute">
          ${MINUTES.map(
            (m) => `
            <button type="button" class="${optionClass(m === minute)}" role="option" aria-selected="${m === minute}" data-minute="${m}">
              ${m}
            </button>`
          ).join("")}
        </div>
        <div class="time-picker__col" role="listbox" aria-label="AM or PM">
          ${["AM", "PM"]
            .map(
              (p) => `
            <button type="button" class="${optionClass(p === period)}" role="option" aria-selected="${p === period}" data-period="${p}">
              ${p}
            </button>`
            )
            .join("")}
        </div>
      </div>
    `;
    panel.querySelectorAll(".time-picker__col").forEach((col) => {
      const selectedOpt = col.querySelector(".is-selected");
      if (!selectedOpt) return;
      col.scrollTop = Math.max(0, selectedOpt.offsetTop - col.clientHeight / 2 + selectedOpt.clientHeight / 2);
    });
  }

  function open() {
    ({ hour12, minute, period } = parseTime(input.value || "06:30"));
    renderPanel();
    panel.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    onOpen?.();
    panel.querySelector(".time-picker__col .is-selected")?.focus();
  }

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (trigger.getAttribute("aria-expanded") === "true") close();
    else open();
  });

  trigger.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (trigger.getAttribute("aria-expanded") !== "true") open();
    } else if (e.key === "Escape") close();
  });

  panel.addEventListener("click", (e) => {
    e.stopPropagation();
    const hourBtn = e.target.closest("[data-hour]");
    const minuteBtn = e.target.closest("[data-minute]");
    const periodBtn = e.target.closest("[data-period]");
    if (hourBtn) hour12 = Number(hourBtn.getAttribute("data-hour"));
    else if (minuteBtn) minute = minuteBtn.getAttribute("data-minute");
    else if (periodBtn) period = periodBtn.getAttribute("data-period");
    else return;
    commit();
    renderPanel();
    const attr = hourBtn ? "data-hour" : minuteBtn ? "data-minute" : "data-period";
    const value = hourBtn ? String(hour12) : minuteBtn ? minute : period;
    panel.querySelector(`[${attr}="${value}"]`)?.focus();
  });

  panel.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    const col = e.target.closest(".time-picker__col");
    if (!col) return;
    const options = [...col.querySelectorAll("button")];
    const index = options.indexOf(document.activeElement);
    if (index < 0) return;
    e.preventDefault();
    const next = e.key === "ArrowDown" ? Math.min(index + 1, options.length - 1) : Math.max(index - 1, 0);
    options[next]?.focus();
  });

  setLabel();
  return { open, close, isOpen: () => trigger.getAttribute("aria-expanded") === "true" };
}
