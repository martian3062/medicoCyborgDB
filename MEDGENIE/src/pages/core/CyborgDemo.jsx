// src/pages/core/CyborgDemo.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import { api } from "../../services/apiConfig";
import {
  FiSearch,
  FiDatabase,
  FiClipboard,
  FiArrowRight,
  FiActivity,
  FiWifi,
  FiHardDrive,
} from "react-icons/fi";

/**
 * Local seed records (small + curated)
 */
const LOCAL_SAMPLE_RECORDS = [
  {
    title: "ECG Note — ST Elevation",
    text:
      "ECG shows ST elevation in leads II, III, aVF. Patient reports acute chest pain radiating to left arm. Troponin pending. Consider inferior wall MI; urgent cardiology review advised.",
    metadata: {
      patient_id: "PT-001",
      visit_date: "2025-12-20",
      tags: ["ECG", "Chest Pain", "MI"],
      source: "OPD",
    },
  },
  {
    title: "Diabetes Follow-up",
    text:
      "Type 2 diabetes mellitus follow-up. HbA1c 8.2%. Current meds: Metformin 500mg BID. Counsel diet/exercise. Consider adding SGLT2 inhibitor if renal function permits. Foot exam normal.",
    metadata: {
      patient_id: "PT-001",
      visit_date: "2025-11-05",
      tags: ["Diabetes", "HbA1c", "Metformin"],
      source: "OPD",
    },
  },
  {
    title: "Dengue Risk — Climate + Symptoms",
    text:
      "Symptoms: fever 101.8F, body ache, headache. Local rainfall high and stagnant water reported; mosquito risk elevated. Advice: hydration, avoid NSAIDs, monitor platelet count if fever persists.",
    metadata: {
      patient_id: "PT-044",
      visit_date: "2025-12-12",
      tags: ["Dengue", "Fever", "Climate"],
      source: "Community",
    },
  },
  {
    title: "Allergy Record — Penicillin",
    text:
      "Documented allergy: Penicillin (urticaria + wheeze). Avoid beta-lactams if possible; consider macrolide alternatives depending on indication.",
    metadata: {
      patient_id: "PT-017",
      visit_date: "2025-10-01",
      tags: ["Allergy", "Penicillin"],
      source: "EMR",
    },
  },
  {
    title: "Vitals Snapshot",
    text:
      "Vitals: BP 148/92 mmHg, HR 104 bpm, SpO2 95% RA, Temp 99.6F. Patient anxious. Recommend repeat BP after rest, evaluate tachycardia causes, hydration status, and pain score.",
    metadata: {
      patient_id: "PT-001",
      visit_date: "2025-12-20",
      tags: ["Vitals", "BP", "HR", "SpO2"],
      source: "Triage",
    },
  },
];

/**
 * Live open-source seed from openFDA drug labels
 * Docs: https://api.fda.gov/drug/label.json?search=...&limit=...
 */
const OPEN_FDA_SEEDS = [
  { q: 'openfda.generic_name:"metformin"', title: "openFDA — Metformin label" },
  { q: 'openfda.generic_name:"penicillin"', title: "openFDA — Penicillin label" },
  { q: 'openfda.generic_name:"aspirin"', title: "openFDA — Aspirin label" },
  { q: 'openfda.generic_name:"insulin"', title: "openFDA — Insulin label" },
];

function Pill({ children }) {
  return (
    <span className="rounded-full border border-slate-200 bg-white/70 px-2 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-900/40">
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-2xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm dark:border-slate-800 dark:bg-slate-950/60 " +
        className
      }
    >
      {children}
    </div>
  );
}

function Mono({ children }) {
  return (
    <span className="font-mono text-[12px] text-slate-600 dark:text-slate-300">
      {children}
    </span>
  );
}

// -------------------- Local in-memory vault (fallback) --------------------
function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toTokens(text) {
  const stop = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "was",
    "were",
    "this",
    "that",
    "it",
    "as",
    "at",
    "by",
    "be",
    "from",
    "if",
    "then",
    "than",
    "into",
    "about",
    "patient",
    "mg",
    "bid",
    "bpm",
    "bp",
    "hr",
    "spo2",
    "temp",
  ]);

  const toks = normalize(text).split(" ").filter(Boolean);
  return toks.filter((t) => t.length > 2 && !stop.has(t));
}

function scoreDoc(query, docText) {
  const q = toTokens(query);
  const d = toTokens(docText);
  if (!q.length || !d.length) return 0;

  const dset = new Set(d);
  let hit = 0;
  for (const t of q) if (dset.has(t)) hit += 1;

  // simple tf-lite score
  return hit / Math.sqrt(d.length);
}

async function fetchOpenFdaDocs(limitPerQuery = 1) {
  const out = [];

  for (const s of OPEN_FDA_SEEDS) {
    try {
      const url = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(
        s.q
      )}&limit=${limitPerQuery}`;

      const res = await fetch(url);
      if (!res.ok) continue;

      const json = await res.json();
      const r = json?.results?.[0];
      if (!r) continue;

      const pick = (arrOrStr) => {
        if (!arrOrStr) return "";
        if (Array.isArray(arrOrStr)) return arrOrStr[0] || "";
        if (typeof arrOrStr === "string") return arrOrStr;
        return "";
      };

      const indication = pick(r.indications_and_usage);
      const warnings = pick(r.warnings_and_precautions) || pick(r.warnings);
      const dosage = pick(r.dosage_and_administration);
      const contraind = pick(r.contraindications);

      const openfda = r.openfda || {};
      const brand = Array.isArray(openfda.brand_name) ? openfda.brand_name[0] : "";
      const generic = Array.isArray(openfda.generic_name)
        ? openfda.generic_name[0]
        : "";

      const text = [
        `Drug label summary (${generic || brand || "unknown"}):`,
        indication && `Indications: ${indication}`,
        warnings && `Warnings: ${warnings}`,
        contraind && `Contraindications: ${contraind}`,
        dosage && `Dosage: ${dosage}`,
      ]
        .filter(Boolean)
        .join("\n\n")
        .slice(0, 2200);

      out.push({
        title: s.title,
        text,
        metadata: {
          source: "openFDA",
          tags: ["Drug Label", generic || brand || "Medication"],
          drug_generic: generic || null,
          drug_brand: brand || null,
        },
      });
    } catch {
      // ignore one seed failure, keep going
    }
  }

  return out;
}

export default function CyborgDemo() {
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const glowRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  // local vault fallback
  const localVaultRef = useRef([]); // [{ contents, metadata }]
  const toastTimerRef = useRef(null);

  const [question, setQuestion] = useState(
    "history of diabetes + recent ECG — summarize findings and next steps"
  );

  const [answer, setAnswer] = useState("");
  const [hits, setHits] = useState([]);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  // whether backend cyborg is working (auto-detected)
  const [retrievalMode, setRetrievalMode] = useState("auto"); // "auto" | "backend" | "local"

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "(proxy /api → 8000)",
    []
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }
      );

      gsap.fromTo(
        [leftRef.current, rightRef.current],
        { y: 22, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.15,
        }
      );

      gsap.to(glowRef.current, {
        opacity: 0.9,
        duration: 1.2,
        ease: "sine.out",
      });

      gsap.to(glowRef.current, {
        rotate: 360,
        duration: 18,
        ease: "none",
        repeat: -1,
      });
    }, rootRef);

    return () => {
      ctx.revert();
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(""), 1400);
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("✅ Copied");
    } catch {
      showToast("❌ Copy failed");
    }
  };

  // -------------------- Seed records --------------------
  const seedSampleRecords = async () => {
    setBusy(true);
    setAnswer("");
    setHits([]);

    try {
      // 1) live open source docs
      const openDocs = await fetchOpenFdaDocs(1);

      // 2) local curated docs
      const docs = [...LOCAL_SAMPLE_RECORDS, ...openDocs].map((d) => ({
        title: d.title,
        contents: d.text,
        metadata: { ...(d.metadata || {}), title: d.title },
      }));

      // Always keep local fallback vault updated
      localVaultRef.current = docs.map((d) => ({
        contents: d.contents,
        metadata: d.metadata,
      }));

      // Try backend indexing (best effort)
      let backendOk = false;
      let indexed = 0;

      if (api?.cyborgIndex) {
        for (const d of docs) {
          try {
            await api.cyborgIndex(d.contents, d.metadata);
            indexed += 1;
            backendOk = true;
          } catch {
            // continue
          }
        }
      }

      setRetrievalMode(backendOk ? "backend" : "local");

      showToast(
        backendOk
          ? `✅ Seeded ${docs.length} docs (backend indexed: ${indexed})`
          : `✅ Seeded ${docs.length} docs (local vault fallback)`
      );
    } catch (e) {
      setRetrievalMode("local");
      showToast(`⚠️ ${e?.message || "Seed failed"} (using local fallback)`);
    } finally {
      setBusy(false);
    }
  };

  // -------------------- Search --------------------
  const localSearch = (q, topK = 5) => {
    const vault = localVaultRef.current || [];

    const scored = vault
      .map((d) => ({
        contents: d.contents,
        metadata: d.metadata || {},
        score: scoreDoc(q, d.contents),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    // match "hits" shape expected by UI
    return scored.map((s) => ({
      contents: s.contents,
      metadata: s.metadata,
      distance: 1 - Math.min(1, s.score), // pseudo distance
    }));
  };

  const normalizeHitsFromBackend = (data) => {
    // backend may respond as {results: ...}
    const raw = data?.results || data?.hits || data?.data || data || [];

    const arr = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.matches)
      ? raw.matches
      : Array.isArray(raw?.items)
      ? raw.items
      : [];

    return arr.map((h) => ({
      contents:
        h?.contents ||
        h?.text ||
        h?.document ||
        h?.documents?.[0] ||
        h?.content ||
        "",
      metadata: h?.metadata || h?.metadatas || {},
      distance: h?.distance ?? h?.score ?? null,
    }));
  };

  const searchOnly = async () => {
    const q = question.trim();
    if (!q) return showToast("Type a query first");

    setBusy(true);
    setAnswer("");
    setHits([]);

    try {
      // try backend search
      if (api?.cyborgSearch) {
        const data = await api.cyborgSearch(q, 5);
        const normalized = normalizeHitsFromBackend(data);

        if (normalized?.length) {
          setHits(normalized);
          setRetrievalMode("backend");
          showToast("🔎 Search (backend) complete");
          return;
        }
      }

      // fallback local
      const local = localSearch(q, 5);
      setHits(local);
      setRetrievalMode("local");
      showToast("🔎 Search (local fallback) complete");
    } catch (e) {
      const local = localSearch(q, 5);
      setHits(local);
      setRetrievalMode("local");
      showToast(`⚠️ ${e?.message || "Search failed"} (local fallback)`);
    } finally {
      setBusy(false);
    }
  };

  // -------------------- Ask (RAG) --------------------
  const buildRagPrompt = (q, hitList) => {
    const docs = (hitList || []).slice(0, 5);

    const ctx = docs
      .map((h, idx) => {
        const title = h?.metadata?.title || `DOC ${idx + 1}`;
        return `[DOC ${idx + 1}] ${title}\n${(h?.contents || "").trim()}`;
      })
      .join("\n\n");

    return `
You are MedGenie, a cautious medical assistant.
Rules:
- Use ONLY the provided docs for facts.
- If the docs do not contain enough info, say what is missing.
- Provide citations like [DOC 1], [DOC 2] after the sentences they support.
- End with a short "Next steps" bullet list.

Question:
${q}

Docs:
${ctx}

Answer:
`.trim();
  };

  const askRag = async () => {
    const q = question.trim();
    if (!q) return showToast("Type a question first");

    setBusy(true);
    setAnswer("");
    setHits([]);

    gsap.to(rightRef.current, {
      scale: 0.99,
      duration: 0.08,
      yoyo: true,
      repeat: 1,
    });

    try {
      // 1) get hits (backend → local fallback)
      let hitList = [];

      if (api?.cyborgSearch) {
        try {
          const data = await api.cyborgSearch(q, 5);
          hitList = normalizeHitsFromBackend(data);
        } catch {
          // fallback below
        }
      }

      if (!hitList?.length) {
        hitList = localSearch(q, 5);
        setRetrievalMode("local");
      } else {
        setRetrievalMode("backend");
      }

      setHits(hitList);

      // 2) call Groq via existing aiChat endpoint
      if (!api?.aiChat) throw new Error("api.aiChat() not found in apiConfig.js");

      const prompt = buildRagPrompt(q, hitList);
      const out = await api.aiChat(prompt, "qwen/qwen3-32b");
      const reply = out?.reply || "";

      setAnswer(reply || "AI returned empty reply.");
      showToast("✨ Answer ready");
    } catch (e) {
      setAnswer("");
      showToast(`⚠️ ${e?.message || "Ask failed"}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#050816] dark:text-slate-100"
    >
      {/* Top medtech glow */}
      <div className="relative overflow-hidden">
        <div
          ref={glowRef}
          className="pointer-events-none absolute -top-44 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-0"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(56,189,248,0.55), rgba(168,85,247,0.35), rgba(16,185,129,0.18), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background:
              "linear-gradient(to bottom, rgba(15,23,42,0.06), transparent)",
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 pt-24 pb-16">
        {/* HERO */}
        <div ref={heroRef} className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Pill>
              <span className="inline-flex items-center gap-2">
                <FiDatabase /> Cyborg Vault Demo
              </span>
            </Pill>

            <Pill>RAG Demo • Grounded Answers</Pill>

            <Pill>
              Backend: <Mono>{apiBase}</Mono>
            </Pill>

            <Pill>
              Retrieval:{" "}
              <span className="inline-flex items-center gap-1">
                {retrievalMode === "backend" ? <FiWifi /> : <FiHardDrive />}
                <Mono>{retrievalMode}</Mono>
              </span>
            </Pill>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
            MedTech RAG: <span className="text-sky-500">Ask</span> your vault
          </h1>

          <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">
            Demo flow: <b>Seed Records</b> → <b>Search</b> →{" "}
            <b>Ask AI (with citations)</b>. Seeding includes{" "}
            <b>live openFDA drug label snippets</b> + small clinical notes.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* LEFT */}
          <Card className="p-5">
            <div ref={leftRef}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-500/20 bg-sky-500/10">
                    <FiActivity className="text-sky-500" />
                  </div>

                  <div>
                    <div className="text-lg font-semibold">Query Console</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Try: <Mono>history of diabetes + recent ECG</Mono>
                    </div>
                  </div>
                </div>

                {toast && (
                  <div className="rounded-full bg-black px-3 py-1 text-xs text-white">
                    {toast}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="text-xs text-slate-500 dark:text-slate-400">
                  Question / Search Query
                </label>

                <textarea
                  className="mt-2 w-full min-h-[130px] rounded-2xl border border-slate-200 bg-white/80 p-4 outline-none focus:ring-2 focus:ring-sky-400 dark:border-slate-800 dark:bg-slate-950/40"
                  placeholder="e.g. summarize ECG and diabetes follow-up, suggest next steps"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={busy}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={seedSampleRecords}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50 active:scale-[0.99] disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900/50"
                  title="Seeds local clinical samples + live openFDA snippets; tries /api/cyborg/index/ then falls back locally"
                >
                  <FiDatabase /> Seed sample records
                </button>

                <button
                  onClick={searchOnly}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-white hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
                  title="Search vault (backend then local fallback)"
                >
                  <FiSearch /> Search
                </button>

                <button
                  onClick={askRag}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-500 px-4 py-3 text-white hover:opacity-95 active:scale-[0.99] disabled:opacity-60"
                  title="Retrieve hits then ask Groq via /api/ai/chat/ with citations"
                >
                  Ask AI <FiArrowRight />
                </button>
              </div>

              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Tip: click <b>Seed sample records</b> once, then try:
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => setQuestion("history of diabetes + recent ECG")}
                    className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 hover:bg-white disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950/40"
                    disabled={busy}
                  >
                    history of diabetes + recent ECG
                  </button>

                  <button
                    onClick={() =>
                      setQuestion("penicillin allergy alternative antibiotics")
                    }
                    className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 hover:bg-white disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950/40"
                    disabled={busy}
                  >
                    penicillin allergy alternatives
                  </button>

                  <button
                    onClick={() =>
                      setQuestion("aspirin warnings contraindications bleeding risk")
                    }
                    className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 hover:bg-white disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950/40"
                    disabled={busy}
                  >
                    aspirin warnings / bleeding risk
                  </button>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                If you see backend errors <Mono>500</Mono>, you can still demo: retrieval switches to{" "}
                <Mono>local</Mono> automatically.
              </div>
            </div>
          </Card>

          {/* RIGHT */}
          <Card className="p-5">
            <div ref={rightRef}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">AI Answer</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Should cite sources like <Mono>[DOC 1]</Mono>,{" "}
                    <Mono>[DOC 2]</Mono>…
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copy(answer || "")}
                    disabled={!answer}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900/50"
                  >
                    <FiClipboard /> Copy
                  </button>
                </div>
              </div>

              <div className="mt-4 min-h-[170px] rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                {busy && (
                  <div className="animate-pulse text-sm text-slate-600 dark:text-slate-300">
                    Processing… retrieving context + generating answer…
                  </div>
                )}

                {!busy && !answer && (
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Click <b>Ask AI</b> to run RAG using retrieved hits.
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      If backend Cyborg fails (500), demo continues with a local in-memory vault.
                    </div>
                  </div>
                )}

                {!busy && answer && (
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {answer}
                  </pre>
                )}
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">Retrieved Hits</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    showing top matches
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  {hits?.length === 0 && (
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      No hits yet. Use <b>Search</b> or <b>Ask AI</b>.
                    </div>
                  )}

                  {hits?.map((h, idx) => {
                    const text = (
                      h?.contents ||
                      h?.text ||
                      h?.document ||
                      h?.content ||
                      ""
                    )
                      .toString()
                      .trim();

                    const meta = h?.metadata || {};
                    const title = meta?.title || `DOC ${idx + 1}`;

                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">
                              [DOC {idx + 1}] {title}
                            </div>

                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
                              {meta?.patient_id && (
                                <Pill>patient_id: {meta.patient_id}</Pill>
                              )}
                              {meta?.visit_date && (
                                <Pill>visit: {meta.visit_date}</Pill>
                              )}
                              {meta?.source && <Pill>source: {meta.source}</Pill>}
                              {meta?.drug_generic && (
                                <Pill>generic: {meta.drug_generic}</Pill>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => copy(text)}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:bg-slate-900/50"
                            title="Copy snippet"
                          >
                            <FiClipboard />
                          </button>
                        </div>

                        {Array.isArray(meta?.tags) && meta.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {meta.tags.slice(0, 8).map((t, i2) => (
                              <Pill key={`${idx}-tag-${i2}`}>{t}</Pill>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">
                          {text
                            ? `${text.slice(0, 320)}${text.length > 320 ? "…" : ""}`
                            : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                  Note: openFDA data is public drug labeling content (not patient data).
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-10 text-xs text-slate-500 dark:text-slate-400">
          Pitch line: “Secure vault → retrieval → grounded answer with citations.”
        </div>
      </div>
    </div>
  );
}
