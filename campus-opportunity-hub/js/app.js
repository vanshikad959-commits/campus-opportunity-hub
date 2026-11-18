/* ==========================================================
   Campus Opportunity Hub — Application controller & views
   ========================================================== */

const App = (() => {
  const root = document.getElementById("app");
  const state = {
    filters: { q: "", category: "All", eligibleOnly: false, deadline: "any", before: "", skill: "", mode: "", branch: "", sort: "deadline", showClosed: false },
    calMonth: null,
    adminQuery: ""
  };

  /* ---------- Theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("coh_theme", t); } catch (e) { /* ignore */ }
  }
  function toggleTheme() {
    applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    route();
  }

  /* ---------- Router ---------- */
  const STUDENT_ROUTES = { home: viewHome, explore: viewExplore, recommended: viewRecommended, deadlines: viewDeadlines, saved: viewSaved, profile: viewProfile };
  const ADMIN_ROUTES = { admin: viewAdmin, "admin-opportunities": viewAdminOpps, "admin-students": viewAdminStudents };

  function go(path) { location.hash = "#" + path; }

  function route() {
    closeModal();
    const path = (location.hash.replace(/^#\/?/, "") || "").split("?")[0];
    const user = Store.currentUser();
    if (!user) {
      if (path !== "register") return renderAuth("login");
      return renderAuth("register");
    }
    if (user.role === "admin") {
      const fn = ADMIN_ROUTES[path];
      if (!fn) return go("admin");
      return renderShell(user, path, fn);
    }
    const fn = STUDENT_ROUTES[path];
    if (!fn) return go("home");
    renderShell(user, path, fn);
  }

  /* ======================================================
     AUTH
     ====================================================== */
  function renderAuth(mode) {
    root.innerHTML = `
    <div class="auth">
      <section class="auth-hero">
        <div class="logo"><div class="logo-mark">${icon("target")}</div>Campus Opportunity Hub</div>
        <div>
          <h1>Every hackathon, internship & workshop on campus — <em>matched to you.</em></h1>
          <p>One feed for every opportunity your college publishes. Our recommender reads your skills and interests, checks your eligibility and tells you what to apply for before the deadline passes.</p>
          <div class="hero-cards">
            <div class="hero-card"><div class="hero-icon">${icon("code")}</div><div><b>Generative AI Hackathon</b><span>AI Research Lab · 10 days left</span></div><div class="pct">94%</div></div>
            <div class="hero-card"><div class="hero-icon">${icon("briefcase")}</div><div><b>ML Summer Internship</b><span>DataNova · ₹15k stipend</span></div><div class="pct">88%</div></div>
            <div class="hero-card"><div class="hero-icon">${icon("clock")}</div><div><b>Reminder</b><span>Power BI workshop closes tomorrow</span></div></div>
          </div>
        </div>
        <div class="hero-foot"><div><b>5</b>categories</div><div><b>AI</b>recommendations</div><div><b>0</b>missed deadlines</div></div>
      </section>
      <section class="auth-panel">
        <div class="auth-box">
          <div class="tabs">
            <button class="${mode === "login" ? "active" : ""}" data-tab="login">Sign in</button>
            <button class="${mode === "register" ? "active" : ""}" data-tab="register">Create profile</button>
          </div>
          ${mode === "login" ? loginForm() : registerForm()}
        </div>
      </section>
    </div>`;
    root.querySelectorAll("[data-tab]").forEach(b => b.addEventListener("click", () => {
      location.hash = b.dataset.tab === "register" ? "#register" : "#login";
      if (b.dataset.tab === "login") renderAuth("login");
    }));
    if (mode === "login") bindLogin(); else bindRegister();
  }

  function loginForm() {
    return `
      <h2>Welcome back</h2>
      <p class="sub">Sign in to see opportunities picked for you.</p>
      <form id="loginForm" novalidate>
        <div class="field"><label for="le">College email</label><input id="le" class="input" type="email" placeholder="you@campus.edu" required></div>
        <div class="field"><label for="lp">Password</label><input id="lp" class="input" type="password" placeholder="••••••••" required></div>
        <div class="error-text" id="loginErr"></div>
        <button class="btn btn-primary" style="width:100%;height:46px" type="submit">Sign in</button>
      </form>
      <div class="demo-box">
        <b>Demo accounts</b><br>
        Student: student@campus.edu / student123 · Admin: admin@campus.edu / admin123<br>
        <button class="btn btn-sm" data-demo="student">${icon("user")}Student demo</button>
        <button class="btn btn-sm" data-demo="admin">${icon("shield")}Admin demo</button>
      </div>`;
  }

  function bindLogin() {
    const f = document.getElementById("loginForm");
    const doLogin = (email, pass) => {
      try {
        const u = Store.login(email, pass);
        toast("Signed in", "Welcome, " + u.name.split(" ")[0] + "!");
        go(u.role === "admin" ? "admin" : "home");
        route();
        if (u.role === "student") setTimeout(() => runReminders(true), 600);
      } catch (e) { document.getElementById("loginErr").textContent = e.message; }
    };
    f.addEventListener("submit", e => {
      e.preventDefault();
      const email = f.le.value.trim(), pass = f.lp.value;
      if (!email || !pass) { document.getElementById("loginErr").textContent = "Enter your email and password."; return; }
      doLogin(email, pass);
    });
    root.querySelectorAll("[data-demo]").forEach(b => b.addEventListener("click", () =>
      b.dataset.demo === "admin" ? doLogin("admin@campus.edu", "admin123") : doLogin("student@campus.edu", "student123")));
  }

  function profileFields(u = {}) {
    return `
      <div class="field"><label>Full name</label><input name="name" class="input" value="${esc(u.name || "")}" placeholder="e.g. Priya Patel" required></div>
      <div class="row-3">
        <div class="field"><label>Branch</label><select name="branch" class="input">${BRANCHES.map(b => `<option ${u.branch === b ? "selected" : ""}>${b}</option>`).join("")}</select></div>
        <div class="field"><label>Year</label><select name="year" class="input">${YEARS.map(y => `<option value="${y}" ${+u.year === y ? "selected" : ""}>Year ${y}</option>`).join("")}</select></div>
        <div class="field"><label>CGPA</label><input name="cgpa" class="input" type="number" step="0.01" min="0" max="10" value="${u.cgpa != null ? u.cgpa : ""}" placeholder="8.0"></div>
      </div>
      <div class="field"><label>Skills</label><div id="skillsInput"></div><span class="hint">Press Enter after each skill, or tap a suggestion.</span></div>
      <div class="field"><label>Interests</label><div id="interestsInput"></div></div>`;
  }

  function registerForm() {
    return `
      <h2>Create your profile</h2>
      <p class="sub">Your branch, skills and interests power your recommendations.</p>
      <form id="regForm" novalidate>
        ${profileFields()}
        <div class="row">
          <div class="field"><label>College email</label><input name="email" class="input" type="email" placeholder="you@campus.edu" required></div>
          <div class="field"><label>Password</label><input name="password" class="input" type="password" placeholder="Min. 6 characters" required></div>
        </div>
        <div class="error-text" id="regErr"></div>
        <button class="btn btn-primary" style="width:100%;height:46px" type="submit">Create profile & continue</button>
      </form>`;
  }

  function readProfile(form, skills, interests) {
    return {
      name: form.name.value.trim(), branch: form.branch.value, year: +form.year.value,
      cgpa: form.cgpa.value === "" ? 0 : +form.cgpa.value, skills: skills.get(), interests: interests.get()
    };
  }

  function validateProfile(p) {
    if (p.name.length < 2) return "Please enter your full name.";
    if (p.cgpa < 0 || p.cgpa > 10) return "CGPA must be between 0 and 10.";
    if (!p.skills.length) return "Add at least one skill.";
    if (!p.interests.length) return "Pick at least one interest.";
    return "";
  }

  function bindRegister() {
    const f = document.getElementById("regForm");
    const skills = tagInput(document.getElementById("skillsInput"), [], SKILL_SUGGESTIONS, "e.g. Python");
    const interests = chipSelect(document.getElementById("interestsInput"), INTERESTS, []);
    f.addEventListener("submit", e => {
      e.preventDefault();
      const err = document.getElementById("regErr");
      const p = readProfile(f, skills, interests);
      const email = f.email.value.trim(), pass = f.password.value;
      const msg = validateProfile(p) ||
        (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email address." : "") ||
        (pass.length < 6 ? "Password must be at least 6 characters." : "");
      if (msg) { err.textContent = msg; return; }
      try {
        Store.register({ ...p, email }, pass);
        Store.login(email, pass);
        toast("Profile created", "Your recommendations are ready.");
        go("recommended");
      } catch (ex) { err.textContent = ex.message; }
    });
  }

  /* ======================================================
     SHELL
     ====================================================== */
  function renderShell(user, path, view) {
    const isAdmin = user.role === "admin";
    const opps = Store.getOpportunities();
    const recCount = isAdmin ? 0 : Recommender.recommend(user, opps).length;
    const dueSoon = isAdmin ? 0 : trackedItems(user).filter(o => { const d = dueInfo(o.deadline); return d.days >= 0 && d.days <= (user.reminderDays || 3); }).length;
    const nav = isAdmin ? [
      ["admin", "home", "Overview"],
      ["admin-opportunities", "list", "Opportunities", opps.length],
      ["admin-students", "users", "Students", Store.getUsers().filter(u => u.role === "student").length]
    ] : [
      ["home", "home", "Dashboard"],
      ["explore", "feed", "Opportunity feed"],
      ["recommended", "spark", "For you", recCount],
      ["deadlines", "clock", "Deadline tracker", dueSoon, dueSoon > 0],
      ["saved", "bookmark", "Saved", (user.saved || []).length],
      ["profile", "user", "My profile"]
    ];
    const notifs = isAdmin ? [] : buildNotifications(user);
    const dark = document.documentElement.getAttribute("data-theme") === "dark";

    root.innerHTML = `
    <div class="shell">
      <aside class="sidebar" id="sidebar">
        <div class="logo"><div class="logo-mark">${icon("target")}</div>Opportunity Hub</div>
        <div class="nav-label">${isAdmin ? "Administration" : "Student"}</div>
        <nav class="nav">
          ${nav.map(([p, ic, label, count, hot]) => `<a href="#${p}" class="${p === path ? "active" : ""}">${icon(ic)}${label}${count ? `<span class="count ${hot ? "hot" : ""}">${count}</span>` : ""}</a>`).join("")}
        </nav>
        <div class="side-foot">
          <div class="avatar">${initials(user.name)}</div>
          <div style="min-width:0"><b>${esc(user.name)}</b><span>${isAdmin ? "Administrator" : esc(user.branch + " · Year " + user.year)}</span></div>
          <button class="btn btn-ghost btn-icon btn-sm" id="logoutBtn" title="Sign out" aria-label="Sign out">${icon("logout")}</button>
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="btn btn-icon menu-btn" id="menuBtn" aria-label="Menu">${icon("menu")}</button>
          <div class="search">${icon("search")}<input class="input" id="globalSearch" placeholder="${isAdmin ? "Search opportunities to manage…" : "Search hackathons, internships, skills…"}" value="${esc(isAdmin ? state.adminQuery : state.filters.q)}"></div>
          <div class="top-actions">
            ${isAdmin ? `<button class="btn btn-primary" id="topAdd">${icon("plus")}New opportunity</button>` : ""}
            <button class="btn btn-icon" id="themeBtn" title="Toggle theme" aria-label="Toggle theme">${icon(dark ? "sun" : "moon")}</button>
            ${isAdmin ? "" : `<button class="btn btn-icon" id="bellBtn" title="Reminders" aria-label="Reminders" style="position:relative">${icon("bell")}${notifs.length ? `<span class="bell-dot">${notifs.length}</span>` : ""}</button>`}
          </div>
        </header>
        <main class="content" id="content"></main>
      </div>
    </div>`;

    document.getElementById("logoutBtn").onclick = () => { Store.clearSession(); toast("Signed out"); go("login"); };
    document.getElementById("themeBtn").onclick = toggleTheme;
    document.getElementById("menuBtn").onclick = () => document.getElementById("sidebar").classList.toggle("open");
    const gs = document.getElementById("globalSearch");
    gs.addEventListener("keydown", e => {
      if (e.key !== "Enter") return;
      if (isAdmin) { state.adminQuery = gs.value; if (path !== "admin-opportunities") go("admin-opportunities"); else route(); }
      else { state.filters.q = gs.value; if (path !== "explore") go("explore"); else route(); }
    });
    gs.addEventListener("input", () => {
      if (isAdmin && path === "admin-opportunities") { state.adminQuery = gs.value; renderAdminTable(); }
      if (!isAdmin && path === "explore") { state.filters.q = gs.value; renderExploreResults(Store.currentUser()); }
    });
    if (isAdmin) document.getElementById("topAdd").onclick = () => opportunityForm();
    else document.getElementById("bellBtn").onclick = e => { e.stopPropagation(); toggleNotifPanel(notifs); };

    view(user, document.getElementById("content"));
    window.scrollTo(0, 0);
  }

  /* Global click delegation for cards & save buttons */
  document.addEventListener("click", e => {
    const saveBtn = e.target.closest("[data-save]");
    if (saveBtn) { e.stopPropagation(); toggleSave(saveBtn.dataset.save); return; }
    const card = e.target.closest("[data-open]");
    if (card) { openDetail(card.dataset.open); return; }
    const panel = document.querySelector(".notif-panel");
    if (panel && !e.target.closest(".notif-panel")) panel.remove();
  });

  function toggleSave(id) {
    const u = Store.currentUser();
    if (!u || u.role !== "student") return;
    const nowSaved = Store.toggleInList(u.id, "saved", id);
    const o = Store.getOpportunity(id);
    toast(nowSaved ? "Saved" : "Removed from saved", o ? o.title : "", "bookmark");
    const keepModal = document.getElementById("overlay");
    route();
    if (keepModal) openDetail(id);
  }

  /* ---------- Detail modal ---------- */
  function openDetail(id) {
    const o = Store.getOpportunity(id);
    if (!o) return;
    const u = Store.currentUser();
    const meta = CAT_META[o.category];
    const due = dueInfo(o.deadline);
    const isStudent = u && u.role === "student";
    const elig = isStudent ? Recommender.checkEligibility(u, o) : null;
    const rec = isStudent ? Recommender.scoreOne(u, o, Store.getOpportunities()) : null;
    const saved = isStudent && u.saved.includes(o.id);
    const applied = isStudent && (u.applied || []).includes(o.id);
    const m = openModal(`
      <div class="modal-head">
        <div class="cat-icon" style="background:${meta.color}">${icon(meta.icon)}</div>
        <div style="flex:1;min-width:0"><span class="badge cat" style="background:${meta.color};margin-bottom:6px">${o.category}</span>
          <h2>${esc(o.title)}</h2><div style="color:var(--muted);margin-top:3px">${esc(o.org)}</div></div>
        ${rec ? `<div class="match-ring" style="--p:${rec.match};width:56px;height:56px"><b>${rec.match}%</b></div>` : ""}
        <button class="btn btn-ghost btn-icon btn-sm" data-close aria-label="Close">${icon("x")}</button>
      </div>
      <div class="modal-body">
        <p style="margin:0;color:var(--ink-2)">${esc(o.description)}</p>
        <div class="detail-grid">
          <div><span>Application deadline</span><b>${fmtDate(o.deadline, true)}</b></div>
          <div><span>Event / start date</span><b>${o.eventDate ? fmtDate(o.eventDate, true) : "—"}</b></div>
          <div><span>Mode & location</span><b>${esc(o.mode)} · ${esc(o.location || "—")}</b></div>
          <div><span>Reward / stipend</span><b>${esc(o.reward || "—")}</b></div>
          <div><span>Eligible branches</span><b>${esc((o.branches || []).join(", "))}</b></div>
          <div><span>Minimum year / CGPA</span><b>Year ${o.minYear || 1}+ · ${o.minCgpa ? o.minCgpa + "+" : "No cut-off"}</b></div>
        </div>
        <div class="field"><label>Required skills</label><div class="tags">${(o.skills || []).map(s => `<span class="tag ${isStudent && u.skills.map(x => x.toLowerCase()).includes(s.toLowerCase()) ? "match" : ""}">${esc(s)}</span>`).join("")}</div></div>
        ${elig ? `<div class="elig ${elig.eligible ? "yes" : "no"}">${icon(elig.eligible ? "check" : "alert")}${elig.eligible ? "You meet all eligibility criteria." : esc(elig.reasons.join(" · "))}</div>` : ""}
        ${rec && rec.why.length ? `<div class="why" style="margin-top:12px"><b>${icon("spark")}AI insight</b><ul>${rec.why.map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>` : ""}
      </div>
      <div class="modal-foot">
        <span class="due ${due.cls}" style="margin-right:auto">${icon("clock")}${due.label}</span>
        ${isStudent ? `
          <button class="btn btn-sm" data-ics>${icon("download")}Add to calendar</button>
          <button class="btn btn-sm save-btn ${saved ? "saved" : ""}" data-save="${o.id}">${icon("bookmark")}${saved ? "Saved" : "Save"}</button>
          <button class="btn btn-sm ${applied ? "btn-dark" : ""}" data-applied>${icon("check")}${applied ? "Applied" : "Mark applied"}</button>` : ""}
        ${due.cls !== "closed" ? `<a class="btn btn-sm btn-primary" href="${esc(o.link)}" target="_blank" rel="noopener">Apply ${icon("external")}</a>` : ""}
      </div>`);
    m.querySelector("[data-close]").onclick = closeModal;
    const ics = m.querySelector("[data-ics]");
    if (ics) ics.onclick = () => downloadICS(o)
      .then(() => toast("Calendar file ready", "Open it to add the deadline to your calendar.", "calendar"))
      .catch(e => toast("Could not save file", (e && e.message) || "Download was cancelled.", "alert"));
    const ap = m.querySelector("[data-applied]");
    if (ap) ap.onclick = () => {
      const now = Store.toggleInList(u.id, "applied", o.id);
      toast(now ? "Marked as applied" : "Application status cleared", o.title);
      route(); openDetail(o.id);
    };
  }

  /* ======================================================
     STUDENT VIEWS
     ====================================================== */
  function trackedItems(user) {
    const ids = new Set([...(user.saved || []), ...(user.applied || [])]);
    return Store.getOpportunities().filter(o => ids.has(o.id));
  }

  function viewHome(user, el) {
    const opps = Store.getOpportunities();
    const active = opps.filter(o => dueInfo(o.deadline).days >= 0);
    const recs = Recommender.recommend(user, opps);
    const tracked = trackedItems(user).filter(o => dueInfo(o.deadline).days >= 0).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const thisWeek = tracked.filter(o => dueInfo(o.deadline).days <= 7);
    const hour = new Date().getHours();
    const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    el.innerHTML = `
      <div class="hello">
        <div><h1>${greet}, ${esc(user.name.split(" ")[0])} 👋</h1>
          <p>${recs.length} opportunities match your profile right now${thisWeek.length ? `, and ${thisWeek.length} of your tracked deadlines fall this week` : ""}.</p></div>
        <a class="btn btn-primary" href="#recommended">${icon("spark")}See my matches</a>
      </div>
      <div class="stats">
        <div class="stat accent"><div class="k">${icon("feed")}Live opportunities</div><div class="v">${active.length}</div><div class="s">across ${CATEGORIES.length} categories</div></div>
        <div class="stat"><div class="k">${icon("spark")}Matched for you</div><div class="v">${recs.length}</div><div class="s">eligible & relevant</div></div>
        <div class="stat"><div class="k">${icon("clock")}Due this week</div><div class="v" style="color:${thisWeek.length ? "var(--bad)" : "inherit"}">${thisWeek.length}</div><div class="s">from saved & applied</div></div>
        <div class="stat"><div class="k">${icon("bookmark")}Saved</div><div class="v">${(user.saved || []).length}</div><div class="s">${(user.applied || []).length} applied</div></div>
      </div>
      <div class="grid-2">
        <div>
          <div class="page-head" style="margin-bottom:12px"><h1 style="font-size:19px">Top picks for you</h1><a class="btn btn-sm" href="#recommended">View all</a></div>
          <div class="cards" style="grid-template-columns:1fr">${recs.slice(0, 3).map(r => opportunityCard(r.opportunity, { user, rec: r, showWhy: true })).join("") ||
            emptyState("spark", "No matches yet", "Add more skills and interests to your profile.", `<a class="btn btn-primary" href="#profile">Update profile</a>`)}</div>
        </div>
        <div>
          <div class="panel">
            <h3>Upcoming deadlines <a href="#deadlines">Open tracker →</a></h3>
            ${tracked.length ? `<div class="timeline">${tracked.slice(0, 5).map(timelineItem).join("")}</div>` :
              emptyState("clock", "Nothing tracked", "Save an opportunity to track its deadline.")}
          </div>
          <div class="panel" style="margin-top:18px">
            <h3>Browse by category</h3>
            <div class="bars">${CATEGORIES.map(c => {
              const n = active.filter(o => o.category === c).length;
              return `<div class="bar-row" style="cursor:pointer" data-cat="${c}"><span>${c}</span><div class="bar"><i style="width:${active.length ? n / active.length * 100 : 0}%;background:${CAT_META[c].color}"></i></div><span>${n}</span></div>`;
            }).join("")}</div>
          </div>
        </div>
      </div>`;
    el.querySelectorAll("[data-cat]").forEach(r => r.onclick = () => { state.filters.category = r.dataset.cat; go("explore"); });
  }

  /* ---------- Feed + smart search & filters ---------- */
  function viewExplore(user, el) {
    const f = state.filters;
    const allSkills = [...new Set(Store.getOpportunities().flatMap(o => o.skills || []))].sort();
    el.innerHTML = `
      <div class="page-head"><div><h1>Campus opportunity feed</h1><p>Hackathons, internships, workshops, competitions and events — all in one place.</p></div></div>
      <div class="filters" id="catChips">
        ${["All", ...CATEGORIES].map(c => `<button class="chip ${f.category === c ? "active" : ""}" data-c="${c}">${c !== "All" ? `<span class="dot" style="background:${CAT_META[c].color}"></span>` : ""}${c}</button>`).join("")}
      </div>
      <div class="panel" style="padding:14px 16px;margin-bottom:16px">
        <div class="filter-bar" style="margin:0">
          <div class="field"><label>Required skill</label><select class="input" id="fSkill"><option value="">Any skill</option>${allSkills.map(s => `<option ${f.skill === s ? "selected" : ""}>${esc(s)}</option>`).join("")}</select></div>
          <div class="field"><label>Eligible branch</label><select class="input" id="fBranch"><option value="">Any branch</option>${BRANCHES.map(b => `<option ${f.branch === b ? "selected" : ""}>${b}</option>`).join("")}</select></div>
          <div class="field"><label>Deadline within</label><select class="input" id="fDeadline">
            ${[["any", "Any time"], ["3", "Next 3 days"], ["7", "Next 7 days"], ["30", "Next 30 days"], ["custom", "Before a date…"]].map(([v, l]) => `<option value="${v}" ${f.deadline === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
          <div class="field"><label>${f.deadline === "custom" ? "Deadline before" : "Mode"}</label>${f.deadline === "custom" ?
            `<input type="date" class="input" id="fBefore" value="${esc(f.before)}">` :
            `<select class="input" id="fMode"><option value="">Any mode</option>${["Online", "Offline", "Hybrid"].map(m => `<option ${f.mode === m ? "selected" : ""}>${m}</option>`).join("")}</select>`}</div>
          <div class="field"><label>Sort by</label><select class="input" id="fSort">
            ${[["deadline", "Deadline (soonest)"], ["newest", "Newest first"], ["match", "Best match (AI)"]].map(([v, l]) => `<option value="${v}" ${f.sort === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
          <button class="btn btn-ghost btn-sm" id="fReset" style="height:38px">${icon("refresh")}Reset</button>
        </div>
        <div style="display:flex;gap:20px;margin-top:10px;flex-wrap:wrap">
          <label class="toggle"><input type="checkbox" id="fElig" ${f.eligibleOnly ? "checked" : ""}><span class="sw"></span>Only show what I'm eligible for</label>
          <label class="toggle"><input type="checkbox" id="fClosed" ${f.showClosed ? "checked" : ""}><span class="sw"></span>Include closed</label>
        </div>
      </div>
      <div id="results"></div>`;

    el.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { f.category = b.dataset.c; viewExplore(user, el); });
    const bind = (id, key, evt = "change", rerender = false) => {
      const n = document.getElementById(id);
      if (!n) return;
      n.addEventListener(evt, () => {
        f[key] = n.type === "checkbox" ? n.checked : n.value;
        rerender ? viewExplore(user, el) : renderExploreResults(user);
      });
    };
    bind("fSkill", "skill"); bind("fBranch", "branch"); bind("fDeadline", "deadline", "change", true);
    bind("fBefore", "before"); bind("fMode", "mode"); bind("fSort", "sort"); bind("fElig", "eligibleOnly"); bind("fClosed", "showClosed");
    document.getElementById("fReset").onclick = () => {
      Object.assign(f, { q: "", category: "All", eligibleOnly: false, deadline: "any", before: "", skill: "", mode: "", branch: "", sort: "deadline", showClosed: false });
      document.getElementById("globalSearch").value = "";
      viewExplore(user, el);
    };
    renderExploreResults(user);
  }

  function filterOpportunities(user, list, f) {
    const q = f.q.trim().toLowerCase();
    const qTokens = q ? Recommender.tokenize(q) : [];
    const now = Date.now();
    return list.filter(o => {
      const dl = new Date(o.deadline).getTime();
      if (!f.showClosed && dl <= now) return false;
      if (f.category !== "All" && o.category !== f.category) return false;
      if (f.skill && !(o.skills || []).includes(f.skill)) return false;
      if (f.mode && o.mode !== f.mode) return false;
      if (f.branch && !(o.branches.includes("ALL") || o.branches.includes(f.branch))) return false;
      if (["3", "7", "30"].includes(f.deadline) && (dl - now > +f.deadline * 86400000 || dl < now)) return false;
      if (f.deadline === "custom" && f.before && dl > new Date(f.before + "T23:59:59").getTime()) return false;
      if (f.eligibleOnly && user && !Recommender.checkEligibility(user, o).eligible) return false;
      if (q) {
        const hay = [o.title, o.org, o.category, o.description, o.location, ...(o.skills || []), ...(o.tags || [])].join(" ").toLowerCase();
        // every query word must appear somewhere (smart multi-word search with synonyms)
        if (!hay.includes(q) && !qTokens.every(t => hay.includes(t))) return false;
      }
      return true;
    });
  }

  function renderExploreResults(user) {
    const box = document.getElementById("results");
    if (!box) return;
    const f = state.filters;
    const all = Store.getOpportunities();
    let list = filterOpportunities(user, all, f);
    const recMap = {};
    Recommender.recommend(user, all, { includeIneligible: true, limit: 999 }).forEach(r => { recMap[r.opportunity.id] = r; });
    if (f.sort === "deadline") list.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    if (f.sort === "newest") list.sort((a, b) => new Date(b.postedAt) - new Date(a.postedAt));
    if (f.sort === "match") list.sort((a, b) => ((recMap[b.id] || {}).score || 0) - ((recMap[a.id] || {}).score || 0));
    const active = [f.category !== "All" && f.category, f.skill, f.branch && "Branch: " + f.branch, f.mode, f.q && `"${f.q}"`, f.eligibleOnly && "Eligible only"].filter(Boolean);
    box.innerHTML = `
      <div class="result-meta"><span><b style="color:var(--ink)">${list.length}</b> opportunit${list.length === 1 ? "y" : "ies"} found${active.length ? " · " + esc(active.join(" · ")) : ""}</span></div>
      ${list.length ? `<div class="cards">${list.map(o => opportunityCard(o, { user, rec: recMap[o.id] })).join("")}</div>` :
        emptyState("search", "No opportunities match these filters", "Try removing a filter or searching for a different skill.")}`;
  }

  /* ---------- AI recommender ---------- */
  function viewRecommended(user, el) {
    const opps = Store.getOpportunities();
    const recs = Recommender.recommend(user, opps);
    const almost = Recommender.recommend(user, opps, { includeIneligible: true }).filter(r => !r.eligible).slice(0, 3);
    el.innerHTML = `
      <div class="page-head"><div><h1>Recommended for you</h1><p>Ranked by how well each opportunity fits your skills, interests, eligibility and activity.</p></div></div>
      <div class="ai-head">
        <div class="orb">${icon("spark")}</div>
        <div><b>Your profile signal</b><p>${esc(user.branch)} · Year ${user.year} · CGPA ${user.cgpa || "—"} · learning from ${(user.saved || []).length + (user.applied || []).length} saved/applied items</p></div>
        <div class="chips">${[...(user.skills || []), ...(user.interests || [])].slice(0, 10).map(s => `<span class="tag">${esc(s)}</span>`).join("")}</div>
      </div>
      ${recs.length ? `<div class="cards">${recs.map(r => opportunityCard(r.opportunity, { user, rec: r, showWhy: true })).join("")}</div>` :
        emptyState("spark", "No recommendations yet", "Add skills and interests so the recommender can find matches.", `<a class="btn btn-primary" href="#profile">Complete profile</a>`)}
      ${almost.length ? `
        <div class="page-head" style="margin-top:30px"><div><h1 style="font-size:19px">Relevant, but not eligible yet</h1><p>Good fits for your interests that need a different year, branch or CGPA.</p></div></div>
        <div class="cards">${almost.map(r => opportunityCard(r.opportunity, { user, rec: r }).replace('<div class="card-foot">', `<div class="elig no">${icon("alert")}${esc(r.ineligibleReasons.join(" · "))}</div><div class="card-foot">`)).join("")}</div>` : ""}`;
  }

  /* ---------- Deadline tracker ---------- */
  function timelineItem(o) {
    const d = new Date(o.deadline);
    const due = dueInfo(o.deadline);
    const u = Store.currentUser();
    const applied = u && (u.applied || []).includes(o.id);
    return `<div class="t-item ${due.cls}">
      <div class="t-date"><b>${d.getDate()}</b><span>${d.toLocaleString("en-IN", { month: "short" })}</span></div>
      <div style="min-width:0;cursor:pointer" data-open="${o.id}"><h4>${esc(o.title)}</h4><div class="meta"><span>${esc(o.category)}</span><span>${icon("clock")}${d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>${applied ? `<span class="status-pill">Applied</span>` : ""}</div></div>
      <span class="due ${due.cls}">${due.label}</span>
    </div>`;
  }

  function viewDeadlines(user, el) {
    const items = trackedItems(user).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const upcoming = items.filter(o => dueInfo(o.deadline).days >= 0);
    const closed = items.filter(o => dueInfo(o.deadline).days < 0);
    const groups = [
      ["Due in the next 3 days", upcoming.filter(o => dueInfo(o.deadline).days <= 3)],
      ["This week", upcoming.filter(o => { const d = dueInfo(o.deadline).days; return d > 3 && d <= 7; })],
      ["Later", upcoming.filter(o => dueInfo(o.deadline).days > 7)],
      ["Closed", closed]
    ].filter(g => g[1].length);
    const perm = typeof Notification !== "undefined" ? Notification.permission : "unsupported";
    el.innerHTML = `
      <div class="page-head"><div><h1>Deadline tracker</h1><p>Every saved or applied opportunity, ordered by when applications close.</p></div>
        <button class="btn" id="exportAll">${icon("download")}Export all to calendar</button></div>
      <div class="tracker">
        <div>${items.length ? groups.map(([label, list]) => `<div class="nav-label" style="padding-left:2px;color:var(--muted)">${label} · ${list.length}</div><div class="timeline" style="margin-bottom:10px">${list.map(timelineItem).join("")}</div>`).join("") :
          emptyState("clock", "No deadlines tracked yet", "Save opportunities from the feed and their deadlines appear here automatically.", `<a class="btn btn-primary" href="#explore">Browse the feed</a>`)}</div>
        <div>
          <div class="panel cal" id="calendar"></div>
          <div class="panel reminder-box">
            <h3>Reminder settings</h3>
            <div class="field"><label>Remind me before a deadline</label>
              <select class="input" id="remDays">${[1, 2, 3, 5, 7].map(n => `<option value="${n}" ${+user.reminderDays === n ? "selected" : ""}>${n} day${n > 1 ? "s" : ""} before</option>`).join("")}</select></div>
            <div class="field" style="margin:0"><label>Browser notifications</label>
              ${perm === "granted" ? `<div class="elig yes">${icon("check")}Enabled on this device</div>` :
                perm === "unsupported" ? `<div class="elig no">${icon("alert")}Not supported in this browser — in-app reminders still work</div>` :
                `<button class="btn btn-sm" id="enableNotif">${icon("bell")}Enable desktop notifications</button>`}
              <span class="hint">In-app reminders appear when you sign in and under the bell icon.</span></div>
          </div>
        </div>
      </div>`;
    renderCalendar(items);
    document.getElementById("remDays").onchange = e => { Store.updateUser(user.id, { reminderDays: +e.target.value }); toast("Reminder updated", `You'll be reminded ${e.target.value} day(s) before.`, "bell"); route(); };
    const en = document.getElementById("enableNotif");
    if (en) en.onclick = () => Notification.requestPermission().then(() => { route(); runReminders(true); });
    document.getElementById("exportAll").onclick = () => {
      if (!upcoming.length) return toast("Nothing to export", "Save some opportunities first.", "alert");
      upcoming.reduce((p, o) => p.then(() => downloadICS(o)), Promise.resolve())
        .then(() => toast("Calendar files ready", upcoming.length + " deadline(s)", "calendar"))
        .catch(e => toast("Could not save files", (e && e.message) || "Download was cancelled.", "alert"));
    };
  }

  function renderCalendar(items) {
    const box = document.getElementById("calendar");
    if (!state.calMonth) { const n = new Date(); state.calMonth = new Date(n.getFullYear(), n.getMonth(), 1); }
    const m = state.calMonth;
    const first = new Date(m.getFullYear(), m.getMonth(), 1);
    const start = new Date(first); start.setDate(1 - ((first.getDay() + 6) % 7)); // Monday start
    const byDay = {};
    items.forEach(o => { const k = new Date(o.deadline).toDateString(); (byDay[k] = byDay[k] || []).push(o); });
    const today = new Date().toDateString();
    let cells = "";
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const k = d.toDateString(); const has = byDay[k];
      cells += `<div class="cal-day ${d.getMonth() !== m.getMonth() ? "other" : ""} ${k === today ? "today" : ""} ${has ? "has" : ""}" ${has ? `data-open="${has[0].id}" title="${esc(has.map(o => o.title).join(", "))}"` : ""}>${d.getDate()}${has ? `<span class="dots">${has.slice(0, 3).map(() => "<i></i>").join("")}</span>` : ""}</div>`;
    }
    box.innerHTML = `
      <div class="cal-head"><button class="btn btn-ghost btn-icon btn-sm" id="calPrev" aria-label="Previous month">${icon("chevL")}</button>
        <b>${m.toLocaleString("en-IN", { month: "long", year: "numeric" })}</b>
        <button class="btn btn-ghost btn-icon btn-sm" id="calNext" aria-label="Next month">${icon("chevR")}</button></div>
      <div class="cal-grid">${["M", "T", "W", "T", "F", "S", "S"].map(d => `<div class="dow">${d}</div>`).join("")}${cells}</div>
      <div class="legend"><span><i style="background:var(--ink)"></i>Today</span><span><i style="background:var(--brand-soft);border:1px solid var(--brand)"></i>Deadline</span></div>`;
    document.getElementById("calPrev").onclick = () => { state.calMonth = new Date(m.getFullYear(), m.getMonth() - 1, 1); renderCalendar(items); };
    document.getElementById("calNext").onclick = () => { state.calMonth = new Date(m.getFullYear(), m.getMonth() + 1, 1); renderCalendar(items); };
  }

  /* ---------- Reminders ---------- */
  function buildNotifications(user) {
    return trackedItems(user)
      .map(o => ({ o, d: dueInfo(o.deadline) }))
      .filter(x => x.d.days >= 0 && x.d.days <= (user.reminderDays || 3))
      .sort((a, b) => new Date(a.o.deadline) - new Date(b.o.deadline));
  }

  function toggleNotifPanel(list) {
    const existing = document.querySelector(".notif-panel");
    if (existing) return existing.remove();
    const p = document.createElement("div");
    p.className = "notif-panel";
    p.innerHTML = `<h4>Reminders <span style="color:var(--muted);font-weight:600;font-size:12px">${list.length} due soon</span></h4>
      ${list.length ? list.map(({ o, d }) => `<div class="notif" data-open="${o.id}"><div class="n-ic" style="background:var(--${d.cls}-soft);color:var(--${d.cls})">${icon("clock")}</div>
        <div><b>${esc(o.title)}</b><div style="color:var(--muted)">${d.label} · closes ${fmtDate(o.deadline, true)}</div></div></div>`).join("") :
        `<div style="padding:24px;text-align:center;color:var(--muted)">You're all caught up. No tracked deadlines in the next ${Store.currentUser().reminderDays || 3} days.</div>`}`;
    document.querySelector(".top-actions").appendChild(p);
  }

  function runReminders(showToasts) {
    const user = Store.currentUser();
    if (!user || user.role !== "student") return;
    const today = new Date().toDateString();
    buildNotifications(user).forEach(({ o, d }) => {
      const key = user.id + ":" + o.id + ":" + today;
      if (Store.wasNotified(key)) return;
      Store.markNotified(key);
      if (showToasts) toast("Deadline reminder", `${o.title} — ${d.label}`, "bell");
      try {
        if (typeof Notification !== "undefined" && Notification.permission === "granted")
          new Notification("Deadline reminder: " + o.title, { body: d.label + " · " + o.org });
      } catch (e) { /* notifications unavailable */ }
    });
  }

  /* ---------- Saved ---------- */
  function viewSaved(user, el) {
    const saved = Store.getOpportunities().filter(o => (user.saved || []).includes(o.id))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    el.innerHTML = `
      <div class="page-head"><div><h1>Saved opportunities</h1><p>Bookmarked for later. Their deadlines are tracked automatically.</p></div>
        ${saved.length ? `<a class="btn" href="#deadlines">${icon("clock")}View in deadline tracker</a>` : ""}</div>
      ${saved.length ? `<div class="cards">${saved.map(o => opportunityCard(o, { user, rec: Recommender.scoreOne(user, o, Store.getOpportunities()) })).join("")}</div>` :
        emptyState("bookmark", "Nothing saved yet", "Tap the bookmark on any opportunity to keep it here.", `<a class="btn btn-primary" href="#explore">Explore opportunities</a>`)}`;
  }

  /* ---------- Profile ---------- */
  function viewProfile(user, el) {
    const fields = [user.name, user.branch, user.year, user.cgpa, (user.skills || []).length >= 3, (user.interests || []).length >= 2];
    const pct = Math.round(fields.filter(Boolean).length / fields.length * 100);
    el.innerHTML = `
      <div class="page-head"><div><h1>My profile</h1><p>Keep this up to date — it drives your recommendations and eligibility checks.</p></div></div>
      <div class="profile-grid">
        <div class="panel profile-card">
          <div class="avatar">${initials(user.name)}</div>
          <h2>${esc(user.name)}</h2>
          <div class="meta"><span>${esc(user.email)}</span></div>
          <div class="meta"><span>${esc(user.branch)}</span><span>Year ${user.year}</span><span>CGPA ${user.cgpa || "—"}</span></div>
          <div class="completion"><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700"><span>Profile strength</span><span>${pct}%</span></div>
            <div class="bar"><i style="width:${pct}%;background:var(--brand)"></i></div>
            <p class="hint" style="font-size:12px;color:var(--muted)">${pct < 100 ? "Add at least 3 skills and 2 interests for sharper matches." : "Great — your profile is complete."}</p></div>
          <div class="stats" style="grid-template-columns:1fr 1fr;margin:14px 0 0">
            <div class="stat" style="padding:12px"><div class="k">Saved</div><div class="v" style="font-size:22px">${(user.saved || []).length}</div></div>
            <div class="stat" style="padding:12px"><div class="k">Applied</div><div class="v" style="font-size:22px">${(user.applied || []).length}</div></div>
          </div>
        </div>
        <form class="panel" id="profileForm" novalidate>
          <h3>Edit details</h3>
          ${profileFields(user)}
          <div class="error-text" id="profErr"></div>
          <div style="display:flex;gap:10px;justify-content:flex-end"><button type="button" class="btn" id="profCancel">Cancel</button><button class="btn btn-primary" type="submit">${icon("check")}Save profile</button></div>
        </form>
      </div>`;
    const f = document.getElementById("profileForm");
    const skills = tagInput(document.getElementById("skillsInput"), user.skills || [], SKILL_SUGGESTIONS, "Add a skill");
    const interests = chipSelect(document.getElementById("interestsInput"), INTERESTS, user.interests || []);
    document.getElementById("profCancel").onclick = () => route();
    f.addEventListener("submit", e => {
      e.preventDefault();
      const p = readProfile(f, skills, interests);
      const msg = validateProfile(p);
      if (msg) { document.getElementById("profErr").textContent = msg; return; }
      Store.updateUser(user.id, p);
      toast("Profile saved", "Recommendations refreshed.");
      route();
    });
  }

  /* ======================================================
     ADMIN VIEWS
     ====================================================== */
  function viewAdmin(user, el) {
    const opps = Store.getOpportunities();
    const students = Store.getUsers().filter(u => u.role === "student");
    const active = opps.filter(o => dueInfo(o.deadline).days >= 0);
    const closingWeek = active.filter(o => dueInfo(o.deadline).days <= 7).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const saves = {};
    students.forEach(s => (s.saved || []).forEach(id => { saves[id] = (saves[id] || 0) + 1; }));
    const popular = opps.filter(o => saves[o.id]).sort((a, b) => saves[b.id] - saves[a.id]).slice(0, 5);
    const branchCount = {};
    students.forEach(s => { branchCount[s.branch] = (branchCount[s.branch] || 0) + 1; });
    el.innerHTML = `
      <div class="page-head"><div><h1>Admin overview</h1><p>Publish and manage every opportunity students see.</p></div></div>
      <div class="stats">
        <div class="stat accent"><div class="k">${icon("list")}Total published</div><div class="v">${opps.length}</div><div class="s">${opps.length - active.length} closed</div></div>
        <div class="stat"><div class="k">${icon("feed")}Active now</div><div class="v">${active.length}</div><div class="s">accepting applications</div></div>
        <div class="stat"><div class="k">${icon("clock")}Closing this week</div><div class="v" style="color:var(--bad)">${closingWeek.length}</div><div class="s">within 7 days</div></div>
        <div class="stat"><div class="k">${icon("users")}Registered students</div><div class="v">${students.length}</div><div class="s">${Object.keys(branchCount).length} branches</div></div>
      </div>
      <div class="admin-grid">
        <div class="panel"><h3>Active by category</h3><div class="bars">${CATEGORIES.map(c => {
          const n = active.filter(o => o.category === c).length;
          return `<div class="bar-row"><span>${c}</span><div class="bar"><i style="width:${active.length ? n / active.length * 100 : 0}%;background:${CAT_META[c].color}"></i></div><span>${n}</span></div>`;
        }).join("")}</div></div>
        <div class="panel"><h3>Most saved by students</h3>${popular.length ? `<div class="bars">${popular.map(o => `<div class="bar-row" style="grid-template-columns:1fr 28px"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(o.title)}</span><span>${saves[o.id]}</span></div>`).join("")}</div>` : `<p style="color:var(--muted)">No saves yet.</p>`}</div>
        <div class="panel"><h3>Students by branch</h3><div class="bars">${BRANCHES.map(b => {
          const n = branchCount[b] || 0;
          return `<div class="bar-row"><span>${b}</span><div class="bar"><i style="width:${students.length ? n / students.length * 100 : 0}%;background:var(--ink)"></i></div><span>${n}</span></div>`;
        }).join("")}</div></div>
      </div>
      <div class="panel"><h3>Closing within 7 days <a href="#admin-opportunities">Manage all →</a></h3>
        ${closingWeek.length ? `<div class="timeline">${closingWeek.map(timelineItem).join("")}</div>` : `<p style="color:var(--muted)">No deadlines this week.</p>`}</div>`;
  }

  function viewAdminOpps(user, el) {
    el.innerHTML = `
      <div class="page-head"><div><h1>Manage opportunities</h1><p>Create, edit or remove listings. Changes appear in every student's feed instantly.</p></div>
        <select class="input" id="admCat" style="height:40px;width:190px"><option value="">All categories</option>${CATEGORIES.map(c => `<option>${c}</option>`).join("")}</select></div>
      <div id="admTable"></div>`;
    document.getElementById("admCat").onchange = renderAdminTable;
    renderAdminTable();
  }

  function renderAdminTable() {
    const box = document.getElementById("admTable");
    if (!box) return;
    const q = state.adminQuery.trim().toLowerCase();
    const cat = (document.getElementById("admCat") || {}).value || "";
    const list = Store.getOpportunities()
      .filter(o => !cat || o.category === cat)
      .filter(o => !q || [o.title, o.org, o.category, ...(o.skills || [])].join(" ").toLowerCase().includes(q))
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    box.innerHTML = list.length ? `
      <div class="table-wrap"><table>
        <thead><tr><th>Opportunity</th><th>Category</th><th>Eligibility</th><th>Deadline</th><th>Status</th><th style="text-align:right">Actions</th></tr></thead>
        <tbody>${list.map(o => {
          const d = dueInfo(o.deadline);
          return `<tr>
            <td><div class="title">${esc(o.title)}</div><div class="sub">${esc(o.org)} · ${esc(o.mode)}</div></td>
            <td><span class="badge cat" style="background:${CAT_META[o.category].color}">${o.category}</span></td>
            <td><div>${esc(o.branches.join(", "))}</div><div class="sub">Year ${o.minYear}+${o.minCgpa ? " · CGPA " + o.minCgpa + "+" : ""}</div></td>
            <td style="white-space:nowrap">${fmtDate(o.deadline)}</td>
            <td><span class="due ${d.cls}">${d.label}</span></td>
            <td style="text-align:right;white-space:nowrap">
              <button class="btn btn-sm btn-icon" data-view="${o.id}" title="Preview">${icon("external")}</button>
              <button class="btn btn-sm btn-icon" data-edit="${o.id}" title="Edit">${icon("edit")}</button>
              <button class="btn btn-sm btn-icon btn-danger" data-del="${o.id}" title="Delete">${icon("trash")}</button></td>
          </tr>`;
        }).join("")}</tbody></table></div>` :
      emptyState("list", "No opportunities found", "Try a different search or add a new opportunity.");
    box.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => opportunityForm(Store.getOpportunity(b.dataset.edit)));
    box.querySelectorAll("[data-view]").forEach(b => b.onclick = () => openDetail(b.dataset.view));
    box.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
      const o = Store.getOpportunity(b.dataset.del);
      if (await confirmDialog("Delete this opportunity?", `"${o.title}" will be removed from all student feeds, saved lists and trackers. This cannot be undone.`)) {
        Store.deleteOpportunity(o.id); toast("Opportunity deleted", o.title, "trash"); route();
      }
    });
  }

  function toLocalInput(iso) {
    if (!iso) return "";
    const d = new Date(iso); const p = n => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function opportunityForm(o = null) {
    const editing = !!o;
    o = o || { category: "Hackathon", mode: "Offline", branches: ["ALL"], minYear: 1, minCgpa: 0, skills: [], tags: [] };
    const m = openModal(`
      <div class="modal-head"><div class="cat-icon" style="background:var(--brand)">${icon(editing ? "edit" : "plus")}</div>
        <div style="flex:1"><h2>${editing ? "Edit opportunity" : "Publish a new opportunity"}</h2><p style="margin:4px 0 0;color:var(--muted)">${editing ? "Students see changes immediately." : "It will appear in the feed and in matching students' recommendations."}</p></div>
        <button class="btn btn-ghost btn-icon btn-sm" data-close>${icon("x")}</button></div>
      <form id="oppForm" novalidate>
        <div class="modal-body">
          <div class="field"><label>Title *</label><input name="title" class="input" value="${esc(o.title || "")}" placeholder="e.g. Smart India Hackathon — Internal Round"></div>
          <div class="row"><div class="field"><label>Organiser *</label><input name="org" class="input" value="${esc(o.org || "")}" placeholder="Club, department or company"></div>
            <div class="field"><label>Category</label><select name="category" class="input">${CATEGORIES.map(c => `<option ${o.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></div></div>
          <div class="field"><label>Description *</label><textarea name="description" class="input" placeholder="What is it, who should apply, what will they gain?">${esc(o.description || "")}</textarea></div>
          <div class="row"><div class="field"><label>Application deadline *</label><input name="deadline" type="datetime-local" class="input" value="${toLocalInput(o.deadline)}"></div>
            <div class="field"><label>Event / start date</label><input name="eventDate" type="datetime-local" class="input" value="${toLocalInput(o.eventDate)}"></div></div>
          <div class="row-3"><div class="field"><label>Mode</label><select name="mode" class="input">${["Offline", "Online", "Hybrid"].map(x => `<option ${o.mode === x ? "selected" : ""}>${x}</option>`).join("")}</select></div>
            <div class="field"><label>Location</label><input name="location" class="input" value="${esc(o.location || "")}" placeholder="Venue or Online"></div>
            <div class="field"><label>Reward / stipend</label><input name="reward" class="input" value="${esc(o.reward || "")}" placeholder="₹10,000 prize"></div></div>
          <div class="field"><label>Required skills</label><div id="oSkills"></div></div>
          <div class="field"><label>Interest areas (used by the recommender)</label><div id="oTags"></div></div>
          <div class="field"><label>Eligible branches</label><div id="oBranches"></div></div>
          <div class="row-3"><div class="field"><label>Minimum year</label><select name="minYear" class="input">${YEARS.map(y => `<option value="${y}" ${+o.minYear === y ? "selected" : ""}>Year ${y}+</option>`).join("")}</select></div>
            <div class="field"><label>Minimum CGPA</label><input name="minCgpa" type="number" min="0" max="10" step="0.1" class="input" value="${o.minCgpa || 0}"></div>
            <div class="field"><label>Application link *</label><input name="link" class="input" value="${esc(o.link || "")}" placeholder="https://"></div></div>
          <div class="error-text" id="oppErr"></div>
        </div>
        <div class="modal-foot"><button type="button" class="btn" data-close>Cancel</button><button class="btn btn-primary" type="submit">${icon("check")}${editing ? "Save changes" : "Publish"}</button></div>
      </form>`, { wide: true });
    m.querySelectorAll("[data-close]").forEach(b => b.onclick = closeModal);
    const skills = tagInput(m.querySelector("#oSkills"), o.skills || [], SKILL_SUGGESTIONS, "Add a skill");
    const tags = chipSelect(m.querySelector("#oTags"), INTERESTS, o.tags || []);
    const branches = chipSelect(m.querySelector("#oBranches"), ["ALL", ...BRANCHES], o.branches || ["ALL"], { allValue: "ALL" });
    const f = m.querySelector("#oppForm");
    f.addEventListener("input", e => e.target.classList.remove("invalid"));
    f.addEventListener("submit", e => {
      e.preventDefault();
      const err = m.querySelector("#oppErr");
      f.querySelectorAll(".invalid").forEach(x => x.classList.remove("invalid"));
      const data = {
        title: f.title.value.trim(), org: f.org.value.trim(), category: f.category.value, description: f.description.value.trim(),
        deadline: f.deadline.value ? new Date(f.deadline.value).toISOString() : "",
        eventDate: f.eventDate.value ? new Date(f.eventDate.value).toISOString() : "",
        mode: f.mode.value, location: f.location.value.trim(), reward: f.reward.value.trim(),
        skills: skills.get(), tags: tags.get(), branches: branches.get(), minYear: +f.minYear.value,
        minCgpa: +f.minCgpa.value || 0, link: f.link.value.trim()
      };
      const problems = [];
      const mark = n => f[n].classList.add("invalid");
      if (data.title.length < 5) { problems.push("Title must be at least 5 characters"); mark("title"); }
      if (!data.org) { problems.push("Organiser is required"); mark("org"); }
      if (data.description.length < 20) { problems.push("Description must be at least 20 characters"); mark("description"); }
      if (!data.deadline) { problems.push("Deadline is required"); mark("deadline"); }
      else if (!editing && new Date(data.deadline) <= new Date()) { problems.push("Deadline must be in the future"); mark("deadline"); }
      if (data.eventDate && data.deadline && new Date(data.eventDate) < new Date(data.deadline)) { problems.push("Event date cannot be before the deadline"); mark("eventDate"); }
      if (!/^https?:\/\/\S+\.\S+/.test(data.link)) { problems.push("Enter a valid application link (https://…)"); mark("link"); }
      if (!data.branches.length) problems.push("Select at least one branch (or ALL)");
      if (data.minCgpa < 0 || data.minCgpa > 10) { problems.push("CGPA must be between 0 and 10"); mark("minCgpa"); }
      if (problems.length) { err.textContent = problems.join(" · "); return; }
      if (editing) { Store.updateOpportunity(o.id, data); toast("Changes saved", data.title, "edit"); }
      else { Store.addOpportunity(data, Store.currentUser().email); toast("Opportunity published", data.title, "check"); }
      closeModal(); route();
    });
  }

  function viewAdminStudents(user, el) {
    const students = Store.getUsers().filter(u => u.role === "student");
    el.innerHTML = `
      <div class="page-head"><div><h1>Registered students</h1><p>Profiles students have created. Used for eligibility and recommendation analytics.</p></div></div>
      ${students.length ? `<div class="table-wrap"><table>
        <thead><tr><th>Student</th><th>Branch / Year</th><th>CGPA</th><th>Skills</th><th>Interests</th><th>Saved</th><th>Applied</th></tr></thead>
        <tbody>${students.map(s => `<tr>
          <td><div style="display:flex;gap:10px;align-items:center"><div class="avatar" style="width:32px;height:32px;font-size:12px">${initials(s.name)}</div><div><div class="title">${esc(s.name)}</div><div class="sub">${esc(s.email)}</div></div></div></td>
          <td>${esc(s.branch)} · Y${s.year}</td><td>${s.cgpa || "—"}</td>
          <td><div class="tags">${(s.skills || []).slice(0, 4).map(k => `<span class="tag">${esc(k)}</span>`).join("")}</div></td>
          <td class="sub">${esc((s.interests || []).join(", "))}</td>
          <td>${(s.saved || []).length}</td><td>${(s.applied || []).length}</td></tr>`).join("")}</tbody></table></div>` :
        emptyState("users", "No students yet", "Students appear here after they create a profile.")}`;
  }

  /* ---------- Boot ---------- */
  function init() {
    let theme = "light";
    try { theme = localStorage.getItem("coh_theme") || "light"; } catch (e) { /* ignore */ }
    applyTheme(theme);
    window.addEventListener("hashchange", route);
    route();
    runReminders(true);
    setInterval(() => runReminders(true), 60000);
  }

  return { init, route, state };
})();

App.init();
