import { CATEGORIES, SEED_USERS, SEED_EVENTS, SEED_MESSAGES, SEED_POSTS, SEED_JOINS } from "./data.js";
import { uid, todayISO } from "./utils.js";

const STORAGE_KEY = "melaro_state_v1";

function seedState() {
  // Clone so mutations (join/create) don't rewrite the module-level seed arrays.
  return {
    version: 3,
    currentUsername: null,
    users: structuredClone(SEED_USERS),
    events: structuredClone(SEED_EVENTS),
    joinedEventIds: structuredClone(SEED_JOINS),
    messages: structuredClone(SEED_MESSAGES),
    posts: structuredClone(SEED_POSTS),
    filters: { category: "All Events", query: "" },
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("no state yet");
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== 3) throw new Error("stale shape");
    return parsed;
  } catch {
    const fresh = seedState();
    persist(fresh);
    return fresh;
  }
}

function persist(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error("Melaro: could not persist state", err);
  }
}

let state = load();

function save() {
  persist(state);
}

export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY);
  state = load();
  return state;
}
if (typeof window !== "undefined") {
  window.melaroResetDemo = resetDemoData;
}

export function getCurrentUser() {
  if (!state.currentUsername) return null;
  return state.users.find((u) => u.username === state.currentUsername) || null;
}

export function findUserByLogin(identifier) {
  const value = identifier.trim().toLowerCase();
  return state.users.find((u) => u.username.toLowerCase() === value || u.email.toLowerCase() === value) || null;
}

export function findUserByUsername(username) {
  return state.users.find((u) => u.username === username) || null;
}

export function login(identifier, password) {
  const user = findUserByLogin(identifier);
  if (!user) return { ok: false, error: "no-account" };
  if (user.password !== password) return { ok: false, error: "wrong-password" };
  state.currentUsername = user.username;
  save();
  return { ok: true, user };
}

export function signup({ fullName, username, email, password }) {
  if (findUserByUsername(username)) return { ok: false, error: "username-taken" };
  if (state.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: "email-taken" };
  }
  const user = {
    username,
    fullName,
    email,
    password,
    followers: 0,
    following: 0,
    preferences: [],
    bio: "",
  };
  state.users.push(user);
  state.currentUsername = username;
  save();
  return { ok: true, user };
}

export function logout() {
  state.currentUsername = null;
  save();
}

export function updateProfile({ fullName, bio }) {
  const user = getCurrentUser();
  if (!user) return;
  if (fullName != null) user.fullName = fullName;
  if (bio != null) user.bio = bio;
  save();
}

export function savePreferences(preferences) {
  const user = getCurrentUser();
  if (!user) return;
  user.preferences = preferences;
  save();
}

export function getCategories() {
  return CATEGORIES;
}

export function getEvents() {
  return state.events;
}

export function getEventById(id) {
  return state.events.find((e) => e.id === id) || null;
}

export function getTrendingEvents() {
  return getListedEvents({ when: "upcoming" }).filter((e) => e.trending);
}

/** Home/Search catalog. `when`: "upcoming" | "past" | "all" */
export function getListedEvents({
  query = "",
  category = "All Events",
  when = "all",
} = {}) {
  const today = todayISO();
  const q = String(query || "").trim().toLowerCase();
  return state.events
    .filter((e) => {
      if (when === "upcoming") return e.date >= today;
      if (when === "past") return e.date < today;
      return true;
    })
    .filter((e) => category === "All Events" || !category || e.category === category)
    .filter((e) => {
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        (e.description || "").toLowerCase().includes(q)
      );
    })
    .slice()
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export function isJoined(eventId) {
  const user = getCurrentUser();
  if (!user) return false;
  const event = getEventById(eventId);
  if (event && event.organizer === user.username) return true;
  return !!state.joinedEventIds.find((j) => j.eventId === eventId && j.username === user.username);
}

export function isOrganizer(event) {
  const user = getCurrentUser();
  return !!user && event.organizer === user.username;
}

export function joinEvent(eventId) {
  const user = getCurrentUser();
  if (!user) return;
  if (isJoined(eventId)) return;
  state.joinedEventIds.push({ eventId, username: user.username });
  const event = getEventById(eventId);
  if (event) event.attendeeCount = (event.attendeeCount || 0) + 1;
  save();
}

export function leaveEvent(eventId) {
  const user = getCurrentUser();
  if (!user) return;
  const event = getEventById(eventId);
  if (event && event.organizer === user.username) return;
  const before = state.joinedEventIds.length;
  state.joinedEventIds = state.joinedEventIds.filter(
    (j) => !(j.eventId === eventId && j.username === user.username)
  );
  if (state.joinedEventIds.length !== before && event) {
    event.attendeeCount = Math.max(0, (event.attendeeCount || 1) - 1);
  }
  save();
}

export function getAttendeeUsernames(event) {
  const joined = state.joinedEventIds.filter((j) => j.eventId === event.id).map((j) => j.username);
  const sample = event.attendeeSample || [];
  return Array.from(new Set([event.organizer, ...sample, ...joined]));
}

export function createEvent(eventInput) {
  const user = getCurrentUser();
  const id = uid("evt");
  const event = {
    id,
    title: eventInput.title,
    description: eventInput.description,
    date: eventInput.date,
    time: eventInput.time,
    location: eventInput.location,
    category: eventInput.category,
    type: eventInput.type,
    organizer: user.username,
    cover: eventInput.coverDataUrl || null,
    coverSeed: id,
    trending: false,
    attendeeSample: [],
    attendeeCount: 1,
    createdAt: new Date().toISOString(),
  };
  state.events.unshift(event);
  state.joinedEventIds.push({ eventId: id, username: user.username });
  save();
  return event;
}

export function getEventsByOrganizer(username) {
  return state.events.filter((e) => e.organizer === username);
}

export function getJoinedEvents(username) {
  const ids = new Set(state.joinedEventIds.filter((j) => j.username === username).map((j) => j.eventId));
  return state.events.filter((e) => ids.has(e.id) || e.organizer === username);
}

export function getMessages(eventId) {
  return state.messages[eventId] || [];
}

export function sendMessage(eventId, text) {
  const user = getCurrentUser();
  if (!user) return null;
  const message = { id: uid("msg"), author: user.username, text, ts: new Date().toISOString() };
  if (!state.messages[eventId]) state.messages[eventId] = [];
  state.messages[eventId].push(message);
  save();
  return message;
}

export function getPosts(eventId) {
  return state.posts[eventId] || [];
}

export function createPost(eventId, text) {
  const user = getCurrentUser();
  if (!user) return null;
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;
  const post = { id: uid("post"), author: user.username, text: trimmed, ts: new Date().toISOString() };
  if (!state.posts[eventId]) state.posts[eventId] = [];
  state.posts[eventId].unshift(post);
  save();
  return post;
}

export function getFilters() {
  return state.filters;
}
export function setFilters(patch) {
  state.filters = { ...state.filters, ...patch };
  save();
}
