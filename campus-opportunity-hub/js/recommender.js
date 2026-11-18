/* ==========================================================
   AI Opportunity Recommender
   Content-based filtering with TF-IDF weighted cosine similarity,
   a hard eligibility filter, implicit feedback from saved items,
   and a small urgency/freshness boost. Every recommendation
   carries a human-readable explanation.
   ========================================================== */

const Recommender = (() => {
  const STOPWORDS = new Set(("a an the and or of for to in on with by at from is are be this that your you our " +
    "will can as it its into using use build built work real top get all per up out who what how teams team " +
    "provided open round held day days week weeks hour hours based").split(" "));

  const WEIGHTS = { content: 0.70, category: 0.15, urgency: 0.10, freshness: 0.05 };

  function norm(term) {
    const t = String(term).toLowerCase().trim();
    return SYNONYMS[t] || t;
  }

  function tokenize(text) {
    return String(text).toLowerCase()
      .replace(/[^a-z0-9+#.\s/-]/g, " ")
      .split(/\s+/)
      .map(w => w.replace(/^[.\-/]+|[.\-/]+$/g, ""))
      .filter(w => w.length > 1 && !STOPWORDS.has(w))
      .map(norm);
  }

  /* Terms describing an opportunity, with field weights */
  function oppTerms(o) {
    const terms = {};
    const add = (t, w) => { t = norm(t); if (t) terms[t] = (terms[t] || 0) + w; };
    (o.skills || []).forEach(s => add(s, 1.0));
    (o.tags || []).forEach(tag => {
      add(tag, 0.8);
      (INTEREST_KEYWORDS[tag] || []).forEach(k => add(k, 0.35));
    });
    add(o.category, 0.5);
    tokenize(o.title + " " + o.description).forEach(t => add(t, 0.2));
    return terms;
  }

  /* Terms describing a student profile */
  function studentTerms(user, opportunities) {
    const terms = {};
    const add = (t, w) => { t = norm(t); if (t) terms[t] = (terms[t] || 0) + w; };
    (user.skills || []).forEach(s => add(s, 1.0));
    (user.interests || []).forEach(i => {
      add(i, 0.9);
      (INTEREST_KEYWORDS[i] || []).forEach(k => add(k, 0.4));
    });
    // Implicit feedback: what the student saved or applied to teaches us their taste
    const liked = [...(user.saved || []), ...(user.applied || [])];
    liked.forEach(id => {
      const o = opportunities.find(x => x.id === id);
      if (!o) return;
      (o.skills || []).forEach(s => add(s, 0.25));
      (o.tags || []).forEach(t => add(t, 0.25));
    });
    return terms;
  }

  function idf(opportunities) {
    const df = {};
    const N = opportunities.length || 1;
    opportunities.forEach(o => Object.keys(oppTerms(o)).forEach(t => { df[t] = (df[t] || 0) + 1; }));
    const out = {};
    Object.keys(df).forEach(t => { out[t] = Math.log((N + 1) / (df[t] + 1)) + 1; });
    return out;
  }

  function vectorize(terms, idfMap) {
    const v = {};
    Object.keys(terms).forEach(t => { v[t] = terms[t] * (idfMap[t] || 1); });
    return v;
  }

  function cosine(a, b) {
    let dot = 0, na = 0, nb = 0;
    Object.keys(a).forEach(k => { na += a[k] * a[k]; if (b[k]) dot += a[k] * b[k]; });
    Object.keys(b).forEach(k => { nb += b[k] * b[k]; });
    return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
  }

  /* Eligibility rules defined by the admin for each opportunity */
  function checkEligibility(user, o) {
    const reasons = [];
    const branchOk = (o.branches || ["ALL"]).includes("ALL") || (o.branches || []).includes(user.branch);
    if (!branchOk) reasons.push("Open to " + o.branches.join(", ") + " only");
    if (user.year < (o.minYear || 1)) reasons.push("Requires year " + o.minYear + " or above");
    if ((o.minCgpa || 0) > 0 && (user.cgpa || 0) < o.minCgpa) reasons.push("Requires CGPA ≥ " + o.minCgpa);
    return { eligible: reasons.length === 0, reasons };
  }

  function daysLeft(iso) {
    return Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000);
  }

  function recommend(user, opportunities, { limit = 50, includeIneligible = false } = {}) {
    const active = opportunities.filter(o => new Date(o.deadline).getTime() > Date.now());
    const idfMap = idf(opportunities);
    const sv = vectorize(studentTerms(user, opportunities), idfMap);
    const userSkills = new Set((user.skills || []).map(norm));
    const userInterests = new Set(user.interests || []);

    // Category affinity learned from saved/applied items
    const catCount = {};
    [...(user.saved || []), ...(user.applied || [])].forEach(id => {
      const o = opportunities.find(x => x.id === id);
      if (o) catCount[o.category] = (catCount[o.category] || 0) + 1;
    });
    const maxCat = Math.max(1, ...Object.values(catCount));

    const results = active.map(o => {
      const elig = checkEligibility(user, o);
      const content = cosine(sv, vectorize(oppTerms(o), idfMap));
      const category = (catCount[o.category] || 0) / maxCat;
      const dl = daysLeft(o.deadline);
      const urgency = dl <= 3 ? 1 : dl <= 7 ? 0.6 : dl <= 14 ? 0.3 : 0;
      const ageDays = (Date.now() - new Date(o.postedAt).getTime()) / 86400000;
      const freshness = Math.max(0, 1 - ageDays / 14);

      const raw = WEIGHTS.content * content + WEIGHTS.category * category +
                  WEIGHTS.urgency * urgency + WEIGHTS.freshness * freshness;

      const matchedSkills = (o.skills || []).filter(s => userSkills.has(norm(s)));
      const matchedInterests = (o.tags || []).filter(t => userInterests.has(t));
      const why = [];
      if (matchedSkills.length) why.push("Uses your skills: " + matchedSkills.join(", "));
      if (matchedInterests.length) why.push("Matches your interest in " + matchedInterests.join(", "));
      if (category > 0.5) why.push("You often save " + o.category.toLowerCase() + "s");
      if (elig.eligible) why.push("You are eligible (" + user.branch + ", year " + user.year + ")");
      if (dl <= 3) why.push("Closing in " + dl + " day" + (dl === 1 ? "" : "s"));

      return {
        opportunity: o,
        score: raw,
        // Scale to a friendly 0–100 match value; content similarity dominates
        match: Math.min(99, Math.round(Math.sqrt(Math.min(1, raw / 0.75)) * 100)),
        eligible: elig.eligible,
        ineligibleReasons: elig.reasons,
        matchedSkills, matchedInterests, why,
        breakdown: { content, category, urgency, freshness }
      };
    });

    return results
      .filter(r => includeIneligible || r.eligible)
      .filter(r => r.breakdown.content > 0.02)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /* Match score for one opportunity (used to show match % on any card) */
  function scoreOne(user, o, opportunities) {
    const r = recommend(user, opportunities, { includeIneligible: true, limit: 999 })
      .find(x => x.opportunity.id === o.id);
    return r || null;
  }

  return { recommend, scoreOne, checkEligibility, daysLeft, tokenize };
})();
