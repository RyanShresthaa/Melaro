import {
  getCurrentUser,
  findUserByUsername,
  getJoinedEvents,
  getEventsByOrganizer,
  logout,
  updateProfile,
} from "../state.js";
import { navigate, goBack } from "../router.js";
import { escapeHTML, showToast, todayISO, trapFocus } from "../utils.js";
import { avatarHTML, eventCardHTML, emptyStateHTML, icons, bindTabs } from "../components.js";

export function renderProfile(container, { params }) {
  const me = getCurrentUser();
  const username = params?.[0] || me.username;
  const user = findUserByUsername(username) || me;
  const isSelf = user.username === me.username;
  let activeTab = "past";

  function paint() {
    const joined = getJoinedEvents(user.username);
    const hosted = getEventsByOrganizer(user.username);
    const today = todayISO();
    const pastList = joined.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date));
    const hostedList = hosted.slice().sort((a, b) => b.date.localeCompare(a.date));

    container.innerHTML = `
      <div class="page page--profile">
        <div class="topbar">
          ${!isSelf ? `<button type="button" class="topbar__back" data-action="back" style="padding-left:0;">${icons.back} Back</button>` : `<p class="brand-word">Melaro</p>`}
          ${isSelf ? `<button type="button" class="btn-ghost" id="logout-btn" style="width:auto;">Log out</button>` : "<span></span>"}
        </div>

        <div class="profile-header">
          ${avatarHTML(user, 76)}
          <div class="profile-stats">
            <div class="profile-stat"><strong>${user.followers}</strong><span>Followers</span></div>
            <div class="profile-stat"><strong>${user.following}</strong><span>Following</span></div>
            <div class="profile-stat"><strong>${hostedList.length}</strong><span>Events</span></div>
          </div>
        </div>
        <div class="profile-identity">
          <h1>${escapeHTML(user.username)}</h1>
          <p>${escapeHTML(user.email)}</p>
          ${user.bio ? `<p style="margin-top:6px;color:var(--color-text);font-size:13px;">${escapeHTML(user.bio)}</p>` : ""}
        </div>

        <div class="profile-actions">
          ${
            isSelf
              ? `<button type="button" class="btn btn-outline btn-sm" disabled title="Highlights aren't part of this demo">View Highlight</button>
                 <button type="button" class="btn btn-outline btn-sm" id="edit-profile-btn">Edit Profile</button>`
              : `<button type="button" class="btn btn-primary btn-sm" disabled title="Following isn't part of this demo">Follow</button>`
          }
        </div>

        <div class="tabs" role="tablist" aria-label="Profile events">
          <button type="button" class="tab-btn" role="tab" id="tab-past" data-tab="past" aria-selected="${activeTab === "past"}" aria-controls="profile-list" tabindex="${activeTab === "past" ? "0" : "-1"}">Past Events</button>
          <button type="button" class="tab-btn" role="tab" id="tab-hosted" data-tab="hosted" aria-selected="${activeTab === "hosted"}" aria-controls="profile-list" tabindex="${activeTab === "hosted" ? "0" : "-1"}">Hosted Events</button>
        </div>

        <div class="event-list" id="profile-list" role="tabpanel" aria-labelledby="${activeTab === "past" ? "tab-past" : "tab-hosted"}" style="padding-top:16px;">
          ${
            activeTab === "past"
              ? pastList.length
                ? pastList.map(eventCardHTML).join("")
                : emptyStateHTML({ title: "No past events yet", body: isSelf ? "Events you join will move here after they happen." : "This user hasn't attended any past events yet." })
              : hostedList.length
              ? hostedList.map(eventCardHTML).join("")
              : emptyStateHTML({ title: "Nothing hosted yet", body: isSelf ? "Create an event and it'll show up here." : "This user hasn't hosted any events yet." })
          }
        </div>
      </div>
    `;

    bindTabs(container.querySelector(".tabs"), {
      onChange(tab, { focus } = {}) {
        if (tab === activeTab) {
          if (focus) container.querySelector(`[data-tab="${tab}"]`)?.focus();
          return;
        }
        activeTab = tab;
        paint();
        if (focus) container.querySelector(`[data-tab="${tab}"]`)?.focus();
      },
    });

    container.querySelector('[data-action="back"]')?.addEventListener("click", () => goBack("home"));
    container.querySelector("#logout-btn")?.addEventListener("click", () => {
      logout();
      navigate("login");
    });
    container.querySelector("#edit-profile-btn")?.addEventListener("click", () => openEditModal(user, paint));
  }

  paint();
}

function openEditModal(user, onSaved) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <h3 id="edit-title">Edit Profile</h3>
      <div class="field" id="field-edit-fullName">
        <label for="edit-fullName">Full Name</label>
        <input class="input" id="edit-fullName" value="${escapeHTML(user.fullName)}" />
        <p class="field-error" role="alert"></p>
      </div>
      <div class="field" style="margin-bottom:20px;">
        <label for="edit-bio">Bio</label>
        <textarea class="input" id="edit-bio" rows="2">${escapeHTML(user.bio || "")}</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" id="edit-cancel">Cancel</button>
        <button type="button" class="btn btn-primary" id="edit-save">Save</button>
      </div>
    </div>
  `;
  document.body.append(backdrop);
  const card = backdrop.querySelector(".modal-card");
  const nameField = backdrop.querySelector("#field-edit-fullName");
  backdrop.querySelector("#edit-fullName").focus();

  let restore = () => {};
  function close() {
    restore();
    backdrop.remove();
  }
  restore = trapFocus(card, { onEscape: close });

  backdrop.querySelector("#edit-cancel").addEventListener("click", close);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelector("#edit-save").addEventListener("click", () => {
    const fullName = backdrop.querySelector("#edit-fullName").value.trim();
    const bio = backdrop.querySelector("#edit-bio").value.trim();
    if (!fullName) {
      nameField.classList.add("has-error");
      nameField.querySelector(".field-error").textContent = "Enter your name.";
      backdrop.querySelector("#edit-fullName").focus();
      return;
    }
    updateProfile({ fullName, bio });
    close();
    showToast("Profile updated");
    onSaved();
  });
}
