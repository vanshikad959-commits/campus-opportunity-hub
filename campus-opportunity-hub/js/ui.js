/* ==========================================================
   UI helpers — icons, formatting, toasts, modals, components
   ========================================================== */

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  feed: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  spark: '<path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  bookmark: '<path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.5c1.9.8 3 2.8 3 5.5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 17l-5-5 5-5M5 12h11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  map: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  award: '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  code: '<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5z"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.4L4 8M4 4v4h4M4 13a8 8 0 0 0 14.6 4.4L20 16M20 20v-4h-4"/>',
  chevL: '<path d="m15 6-6 6 6 6"/>', chevR: '<path d="m9 6 6 6-6 6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'
};

function icon(name, cls = "") {
  return `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

const CAT_META = {
  Hackathon: { icon: "code", color: "var(--c-hackathon)" },
  Internship: { icon: "briefcase", color: "var(--c-internship)" },
  Workshop: { icon: "tool", color: "var(--c-workshop)" },
  Competition: { icon: "trophy", color: "var(--c-competition)" },
  Event: { icon: "star", color: "var(--c-event)" }
};

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function fmtDate(iso, withTime = false) {
  const d = new Date(iso);
  const opts = { day: "numeric", month: "short", year: "numeric" };
  if (withTime) Object.assign(opts, { hour: "numeric", minute: "2-digit" });
  return d.toLocaleString("en-IN", opts);
}

function initials(name) {
  return String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");
}

/* Deadline status used everywhere (cards, tracker, admin) */
function dueInfo(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return { cls: "closed", label: "Closed", days: -1 };
  const hours = ms / 3600000;
  const days = Math.ceil(ms / 86400000);
  let label;
  if (hours < 24) label = "Closes in " + Math.max(1, Math.round(hours)) + "h";
  else label = days + " day" + (days === 1 ? "" : "s") + " left";
  const cls = days <= 3 ? "bad" : days <= 7 ? "warn" : "ok";
  return { cls, label, days };
}

/* ---------- Toasts ---------- */
function toast(title, msg = "", ic = "check") {
  let wrap = document.querySelector(".toasts");
  if (!wrap) { wrap = document.createElement("div"); wrap.className = "toasts"; document.body.appendChild(wrap); }
  const t = document.createElement("div");
  t.className = "toast";
  t.innerHTML = `${icon(ic)}<div><b>${esc(title)}</b>${msg ? `<span>${esc(msg)}</span>` : ""}</div>`;
  wrap.appendChild(t);
  setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 4200);
}

/* ---------- Modals ---------- */
function openModal(html, { wide = false, onMount } = {}) {
  closeModal();
  const o = document.createElement("div");
  o.className = "overlay";
  o.id = "overlay";
  o.innerHTML = `<div class="modal ${wide ? "wide" : ""}" role="dialog" aria-modal="true">${html}</div>`;
  o.addEventListener("mousedown", e => { if (e.target === o) closeModal(); });
  document.body.appendChild(o);
  if (onMount) onMount(o.querySelector(".modal"));
  return o.querySelector(".modal");
}
function closeModal() { const o = document.getElementById("overlay"); if (o) o.remove(); }
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

function confirmDialog(title, message, okLabel = "Delete") {
  return new Promise(resolve => {
    const m = openModal(`
      <div class="modal-head"><div class="cat-icon" style="background:var(--bad)">${icon("alert")}</div>
        <div><h2>${esc(title)}</h2><p style="margin:6px 0 0;color:var(--muted)">${esc(message)}</p></div></div>
      <div class="modal-foot" style="border:0;margin-top:10px">
        <button class="btn" data-r="0">Cancel</button>
        <button class="btn btn-primary" style="background:var(--bad);border-color:var(--bad)" data-r="1">${esc(okLabel)}</button>
      </div>`);
    m.querySelectorAll("[data-r]").forEach(b => b.addEventListener("click", () => {
      closeModal(); resolve(b.dataset.r === "1");
    }));
  });
}

/* ---------- Tag input component ---------- */
function tagInput(container, initial = [], suggestions = [], placeholder = "Type and press Enter") {
  let values = [...initial];
  let rendering = false;
  container.innerHTML = `<div class="tag-input"></div><div class="suggestions"></div>`;
  const box = container.querySelector(".tag-input");
  const sug = container.querySelector(".suggestions");
  function render() {
    rendering = true;
    box.innerHTML = values.map((v, i) => `<span class="tag">${esc(v)}<button type="button" data-i="${i}" aria-label="Remove">×</button></span>`).join("") +
      `<input type="text" placeholder="${values.length ? "" : esc(placeholder)}" list="">`;
    const input = box.querySelector("input");
    input.addEventListener("keydown", e => {
      if ((e.key === "Enter" || e.key === ",") && input.value.trim()) {
        e.preventDefault(); addValue(input.value.trim().replace(/,$/, ""));
      } else if (e.key === "Backspace" && !input.value && values.length) {
        values.pop(); render(); box.querySelector("input").focus();
      }
    });
    input.addEventListener("blur", () => { if (!rendering && input.value.trim()) addValue(input.value.trim()); });
    box.querySelectorAll("button[data-i]").forEach(b => b.addEventListener("click", e => {
      e.stopPropagation(); values.splice(+b.dataset.i, 1); render();
    }));
    const left = suggestions.filter(s => !values.some(v => v.toLowerCase() === s.toLowerCase())).slice(0, 14);
    sug.innerHTML = left.map(s => `<button type="button" class="chip" data-s="${esc(s)}">+ ${esc(s)}</button>`).join("");
    sug.querySelectorAll("[data-s]").forEach(b => b.addEventListener("click", () => addValue(b.dataset.s)));
    rendering = false;
  }
  function addValue(v) {
    if (!values.some(x => x.toLowerCase() === v.toLowerCase())) values.push(v);
    render(); box.querySelector("input").focus();
  }
  box.addEventListener("click", () => box.querySelector("input").focus());
  render();
  return { get: () => values.slice() };
}

/* ---------- Multi-select chips ---------- */
function chipSelect(container, options, selected = [], { allValue = null } = {}) {
  let values = new Set(selected);
  function render() {
    container.innerHTML = options.map(o => `<button type="button" class="chip ${values.has(o) ? "active" : ""}" data-v="${esc(o)}">${esc(o)}</button>`).join("");
    container.querySelectorAll("[data-v]").forEach(b => b.addEventListener("click", () => {
      const v = b.dataset.v;
      if (allValue && v === allValue) values = new Set(values.has(allValue) ? [] : [allValue]);
      else {
        if (allValue) values.delete(allValue);
        values.has(v) ? values.delete(v) : values.add(v);
      }
      render();
    }));
  }
  container.style.display = "flex"; container.style.flexWrap = "wrap"; container.style.gap = "6px";
  render();
  return { get: () => [...values] };
}

/* ---------- Opportunity card ---------- */
function opportunityCard(o, { user = null, rec = null, showWhy = false } = {}) {
  const meta = CAT_META[o.category] || CAT_META.Event;
  const due = dueInfo(o.deadline);
  const saved = user && (user.saved || []).includes(o.id);
  const applied = user && (user.applied || []).includes(o.id);
  const userSkills = new Set(((user && user.skills) || []).map(s => s.toLowerCase()));
  const ring = rec ? `<div class="match-ring" style="--p:${rec.match}" title="AI match score"><b>${rec.match}%</b></div>` : "";
  const why = showWhy && rec && rec.why.length ? `<div class="why"><b>${icon("spark")}Why this is recommended</b><ul>${rec.why.slice(0, 3).map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>` : "";
  return `
  <article class="card ${due.cls === "closed" ? "closed" : ""}" data-open="${o.id}">
    <div class="card-top">
      <div class="cat-icon" style="background:${meta.color}">${icon(meta.icon)}</div>
      <div style="min-width:0">
        <h4>${esc(o.title)}</h4>
        <div class="org">${esc(o.org)}</div>
      </div>
      ${ring}
    </div>
    <p class="desc">${esc(o.description)}</p>
    <div class="meta">
      <span>${icon("calendar")}${fmtDate(o.deadline)}</span>
      <span>${icon("globe")}${esc(o.mode)}</span>
      ${o.reward ? `<span>${icon("award")}${esc(o.reward)}</span>` : ""}
    </div>
    <div class="tags">
      <span class="badge cat" style="background:${meta.color}">${esc(o.category)}</span>
      ${(o.skills || []).slice(0, 4).map(s => `<span class="tag ${userSkills.has(s.toLowerCase()) ? "match" : ""}">${esc(s)}</span>`).join("")}
    </div>
    ${why}
    <div class="card-foot">
      <span class="due ${due.cls}">${icon("clock")}${due.label}</span>
      ${applied ? `<span class="status-pill">Applied</span>` : ""}
      ${user ? `<button class="btn btn-sm btn-icon save-btn ${saved ? "saved" : ""}" data-save="${o.id}" title="${saved ? "Remove from saved" : "Save for later"}" aria-label="Save">${icon("bookmark")}</button>` : ""}
    </div>
  </article>`;
}

function emptyState(ic, title, text, action = "") {
  return `<div class="empty"><div class="e-ic">${icon(ic)}</div><h3>${esc(title)}</h3><p style="margin:0 0 14px">${esc(text)}</p>${action}</div>`;
}

/* Download an .ics calendar file for a deadline */
function downloadICS(o) {
  const dt = d => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Campus Opportunity Hub//EN", "BEGIN:VEVENT",
    "UID:" + o.id + "@campus-hub", "DTSTAMP:" + dt(new Date()), "DTSTART:" + dt(o.deadline), "DTEND:" + dt(o.deadline),
    "SUMMARY:Deadline: " + o.title, "DESCRIPTION:" + (o.org + " — " + o.link).replace(/\n/g, " "),
    "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Deadline tomorrow", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"
  ].join("\r\n");
  const filename = o.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".ics";
  // When hosted inside the Claude artifact viewer, use its download capability
  if (window.claude && typeof window.claude.use === "function") {
    return window.claude.use("downloads").then(dl => {
      if (dl) return dl.save({ filename, data: ics });
      throw new Error("Downloads are not available in this viewer.");
    });
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  return Promise.resolve();
}
