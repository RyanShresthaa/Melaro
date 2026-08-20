import {
  getCurrentUser,
  findUserByUsername,
  getJoinedEvents,
  getEventsByOrganizer,
  logout,
  updateProfile,
  getFollowCounts,
  getFollowers,
  getFollowingUsers,
  isFollowing,
  isJoined,
  toggleFollow,
} from "../state.js";
import { navigate, goBack } from "../router.js";
import { escapeHTML, showToast, todayISO, trapFocus } from "../utils.js";
import { avatarHTML, eventCardHTML, emptyStateHTML, icons, bindTabs, openPeopleList, openHighlightReel } from "../components.js";

export function renderProfile(container, { params }) {
  const me = getCurrentUser();
  const username = params?.[0] || me.username;
  const user = findUserByUsername(username);

  if (!user) {
    container.innerHTML = `
      <div class="page page--status">
        ${emptyStateHTML({ title: "Profile not found", body: "That username doesn't match anyone in this demo." })}
        <button type="button" class="btn btn-primary" data-route="home">Back to Home</button>
      </div>
    `;
    return;
  }

  const isSelf = user.username === me.username;
  let activeTab = "past";

  function paint() {
    const joined = getJoinedEvents(user.username);
    const hosted = getEventsByOrganizer(user.username);
    const today = todayISO();
    const visibleOnProfile = (event) => event.type !== "private" || isSelf || isJoined(event.id);
    const pastList = joined
      .filter((e) => e.date < today)
      .filter(visibleOnProfile)
      .sort((a, b) => b.date.localeCompare(a.date));
    const hostedList = hosted
      .filter(visibleOnProfile)
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date));
    const { followers, following } = getFollowCounts(user);
    const followsThem = !isSelf && isFollowing(user.username);

    container.innerHTML = `
      <div class="page page--profile">
        <div class="topbar">
          ${!isSelf ? `<button type="button" class="topbar__back" data-action="back">${icons.back} Back</button>` : `<p class="brand-word">Melaro</p>`}
          ${isSelf ? `<button type="button" class="btn-logout" id="logout-btn">${icons.logout} Log out</button>` : "<span></span>"}
        </div>

        <div class="profile-header">
          ${avatarHTML(user, 76)}
          <div class="profile-stats">
            <button type="button" class="profile-stat" data-action="followers" aria-label="${followers} followers">
              <strong>${followers}</strong><span>Followers</span>
            </button>
            <button type="button" class="profile-stat" data-action="following" aria-label="${following} following">
              <strong>${following}</strong><span>Following</span>
            </button>
            <div class="profile-stat"><strong>${hostedList.length}</strong><span>Events</span></div>
          </div>
        </div>
        <div class="profile-identity">
          <h1>${escapeHTML(user.fullName || user.username)}</h1>
          <p class="profile-handle">@${escapeHTML(user.username)}</p>
          ${isSelf ? `<p>${escapeHTML(user.email)}</p>` : ""}
          ${user.bio ? `<p class="profile-bio">${escapeHTML(user.bio)}</p>` : ""}
        </div>

        <div class="profile-actions">
          ${
            isSelf
              ? `<button type="button" class="btn btn-outline btn-sm" id="highlight-btn">View Highlight</button>
                 <button type="button" class="btn btn-outline btn-sm" id="edit-profile-btn">Edit Profile</button>`
              : `<button type="button" class="btn ${followsThem ? "btn-outline btn--following" : "btn-primary"} btn-sm" id="follow-btn" aria-pressed="${followsThem}" aria-label="${followsThem ? `Unfollow ${escapeHTML(user.fullName)}` : `Follow ${escapeHTML(user.fullName)}`}">${
                  followsThem
                    ? `<span class="follow-label follow-label--idle">Following</span><span class="follow-label follow-label--hover">Unfollow</span>`
                    : "Follow"
                }</button>`
          }
        </div>

        <div class="tabs" role="tablist" aria-label="Profile events">
          <button type="button" class="tab-btn" role="tab" id="tab-past" data-tab="past" aria-selected="${activeTab === "past"}" aria-controls="profile-list" tabindex="${activeTab === "past" ? "0" : "-1"}">Past Events</button>
          <button type="button" class="tab-btn" role="tab" id="tab-hosted" data-tab="hosted" aria-selected="${activeTab === "hosted"}" aria-controls="profile-list" tabindex="${activeTab === "hosted" ? "0" : "-1"}">Hosted Events</button>
        </div>

        <div class="event-list profile-list" id="profile-list" role="tabpanel" aria-labelledby="${activeTab === "past" ? "tab-past" : "tab-hosted"}">
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
    container.querySelector("#highlight-btn")?.addEventListener("click", () => {
      openHighlightReel({
        events: hostedList.length ? hostedList : pastList,
        onSelect: (eventId) => navigate(`event/${eventId}`),
      });
    });
    container.querySelector("#follow-btn")?.addEventListener("click", () => {
      toggleFollow(user.username);
      showToast(isFollowing(user.username) ? `Following ${user.fullName}` : "Unfollowed");
      paint();
    });
    container.querySelector('[data-action="followers"]')?.addEventListener("click", () => {
      openPeopleList({
        title: "Followers",
        people: getFollowers(user.username),
        empty: isSelf ? "No followers yet." : "This user has no followers yet.",
        onSelect: (name) => navigate(`profile/${name}`),
      });
    });
    container.querySelector('[data-action="following"]')?.addEventListener("click", () => {
      openPeopleList({
        title: "Following",
        people: getFollowingUsers(user),
        empty: isSelf ? "You're not following anyone yet." : "This user isn't following anyone yet.",
        onSelect: (name) => navigate(`profile/${name}`),
      });
    });
  }

  paint();
}

function openEditModal(user, onSaved) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <form class="modal-card" role="dialog" aria-modal="true" aria-labelledby="edit-title">
      <h3 id="edit-title">Edit Profile</h3>
      <div class="field" id="field-edit-fullName">
        <label for="edit-fullName">Full Name</label>
        <input class="input" id="edit-fullName" value="${escapeHTML(user.fullName)}" autocomplete="name" />
        <p class="field-error" role="alert"></p>
      </div>
      <div class="field">
        <label for="edit-bio">Bio</label>
        <textarea class="input" id="edit-bio" rows="2">${escapeHTML(user.bio || "")}</textarea>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-outline" id="edit-cancel">Cancel</button>
        <button type="submit" class="btn btn-primary" id="edit-save">Save</button>
      </div>
    </form>
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
  card.addEventListener("submit", (e) => {
    e.preventDefault();
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
