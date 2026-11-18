/* ==========================================================
   Data layer — wraps browser localStorage with an in-memory
   fallback so the app works even where storage is blocked.
   ========================================================== */

const Store = (() => {
  const KEY = "coh_db_v1";
  const SESSION_KEY = "coh_session_v1";
  let memory = null;      // fallback when localStorage is unavailable
  let memSession = null;

  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
  }
  function remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  function load() {
    if (memory) return memory;
    const raw = read(KEY);
    if (raw) {
      try { memory = JSON.parse(raw); return memory; } catch (e) { /* corrupted: reseed */ }
    }
    memory = { opportunities: seedOpportunities(), users: seedUsers(), notifications: {} };
    persist();
    return memory;
  }

  function persist() { write(KEY, JSON.stringify(memory)); }

  function uid(prefix) {
    return prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  /* ---------- Opportunities ---------- */
  function getOpportunities() { return load().opportunities.slice(); }
  function getOpportunity(id) { return load().opportunities.find(o => o.id === id) || null; }

  function addOpportunity(data, adminEmail) {
    const db = load();
    const opp = { ...data, id: uid("opp"), postedAt: new Date().toISOString(), createdBy: adminEmail };
    db.opportunities.unshift(opp);
    persist();
    return opp;
  }

  function updateOpportunity(id, data) {
    const db = load();
    const i = db.opportunities.findIndex(o => o.id === id);
    if (i === -1) return null;
    db.opportunities[i] = { ...db.opportunities[i], ...data, updatedAt: new Date().toISOString() };
    persist();
    return db.opportunities[i];
  }

  function deleteOpportunity(id) {
    const db = load();
    db.opportunities = db.opportunities.filter(o => o.id !== id);
    db.users.forEach(u => {
      if (u.saved) u.saved = u.saved.filter(x => x !== id);
      if (u.applied) u.applied = u.applied.filter(x => x !== id);
    });
    persist();
  }

  /* ---------- Users & auth ---------- */
  function getUsers() { return load().users.slice(); }
  function getUserByEmail(email) {
    return load().users.find(u => u.email.toLowerCase() === String(email).toLowerCase()) || null;
  }
  function getUser(id) { return load().users.find(u => u.id === id) || null; }

  function register(profile, password) {
    if (getUserByEmail(profile.email)) throw new Error("An account with this email already exists.");
    const user = {
      id: uid("usr"), role: "student", ...profile,
      passwordHash: simpleHash(password), saved: [], applied: [],
      reminderDays: 3, createdAt: new Date().toISOString()
    };
    load().users.push(user);
    persist();
    return user;
  }

  function login(email, password) {
    const user = getUserByEmail(email);
    if (!user || user.passwordHash !== simpleHash(password)) throw new Error("Invalid email or password.");
    setSession(user.id);
    return user;
  }

  function updateUser(id, data) {
    const u = getUser(id);
    if (!u) return null;
    Object.assign(u, data);
    persist();
    return u;
  }

  function toggleInList(userId, listName, oppId) {
    const u = getUser(userId);
    if (!u) return false;
    u[listName] = u[listName] || [];
    const has = u[listName].includes(oppId);
    u[listName] = has ? u[listName].filter(x => x !== oppId) : [...u[listName], oppId];
    persist();
    return !has;
  }

  /* ---------- Session ---------- */
  function setSession(userId) { memSession = userId; write(SESSION_KEY, userId); }
  function getSession() { return memSession || read(SESSION_KEY); }
  function clearSession() { memSession = null; remove(SESSION_KEY); }
  function currentUser() { const id = getSession(); return id ? getUser(id) : null; }

  /* ---------- Reminder bookkeeping (avoid repeating the same alert) ---------- */
  function wasNotified(key) { return !!load().notifications[key]; }
  function markNotified(key) { load().notifications[key] = Date.now(); persist(); }

  function resetAll() { remove(KEY); remove(SESSION_KEY); memory = null; memSession = null; load(); }

  return {
    getOpportunities, getOpportunity, addOpportunity, updateOpportunity, deleteOpportunity,
    getUsers, getUser, getUserByEmail, register, login, updateUser, toggleInList,
    getSession, clearSession, currentUser, wasNotified, markNotified, resetAll
  };
})();
