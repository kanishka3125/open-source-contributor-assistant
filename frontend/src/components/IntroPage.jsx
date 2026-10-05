import { useEffect, useRef, useState, useCallback } from "react";
import ThreeDHeroScene from "./ThreeDHeroScene";

/**
 * IntroPage — Cinematic Story Intro
 * -----------------------------------
 * Section 0  : Centered 3D GitHub logo + brand + "Scroll to explore" hint
 * Section 1–3: Scroll/drag reveals unique value-prop slides (story glide)
 * Section 4  : Final "Enter" CTA with mini 3D logo
 *
 * On Enter → smooth full-page wipe transition into the main workspace.
 */

const SLIDES = [
  {
    tag: "INSTANT UNDERSTANDING",
    title: ["Any Repo,", "Answered in Seconds"],
    body: "Drop any public GitHub URL and our RAG engine clones, chunks, and vector-embeds the entire codebase instantly — no setup, no config, no waiting.",
    accent: "#4b5563",
  },
  {
    tag: "AI CODEBASE COPILOT",
    title: ["Ask Anything About", "The Code"],
    body: "Natural-language Q&A grounded in real source files. Trace call paths, find architectural patterns, and understand design decisions — like having the original author beside you.",
    accent: "#374151",
  },
  {
    tag: "BUILT FOR CONTRIBUTORS",
    title: ["Go From Clone", "To First PR Faster"],
    body: "Identify good first issues, understand module boundaries, and generate contextual commit messages. Cut onboarding from days to minutes.",
    accent: "#1f2937",
  },
];

const TOTAL_SECTIONS = SLIDES.length + 2; // hero + slides + CTA

export default function IntroPage({ onEnter }) {
  const containerRef = useRef(null);
  // activeSlide: -1=hero, 0/1/2=slides, 3=CTA
  const [activeSlide, setActiveSlide] = useState(-1);
  const [isExiting, setIsExiting] = useState(false);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartSlide = useRef(-1);
  const isScrolling = useRef(false);

  /* ── Navigate to a section ────────────────────────────────────────── */
  const goTo = useCallback((idx) => {
    const clamped = Math.max(-1, Math.min(SLIDES.length, idx));
    setActiveSlide(clamped);
  }, []);

  /* ── Wheel handler ────────────────────────────────────────────────── */
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      if (isScrolling.current) return;
      if (Math.abs(e.deltaY) < 10) return;
      isScrolling.current = true;
      goTo(activeSlide + (e.deltaY > 0 ? 1 : -1));
      setTimeout(() => { isScrolling.current = false; }, 700);
    },
    [activeSlide, goTo]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  /* ── Keyboard nav ─────────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") goTo(activeSlide + 1);
      if (e.key === "ArrowUp"   || e.key === "PageUp")   goTo(activeSlide - 1);
      if (e.key === "Enter" && activeSlide === SLIDES.length) handleEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSlide, goTo]);

  /* ── Touch / pointer drag ─────────────────────────────────────────── */
  const onPointerDown = (e) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartSlide.current = activeSlide;
  };
  const onPointerMove = (e) => {
    if (!isDragging.current) return;
    const dy = dragStartY.current - e.clientY;
    if (Math.abs(dy) > 65) {
      goTo(dragStartSlide.current + (dy > 0 ? 1 : -1));
      isDragging.current = false;
    }
  };
  const onPointerUp = () => { isDragging.current = false; };

  /* ── Enter transition ─────────────────────────────────────────────── */
  const handleEnter = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => onEnter(), 850);
  };

  /* ── Scroll progress (0→1) ────────────────────────────────────────── */
  const progress = (activeSlide + 1) / TOTAL_SECTIONS;

  /* ── Per-slide style: slides translate in/out horizontally ─────────── */
  const getSlideStyle = (idx) => {
    // normalized position: negative = coming from right, positive = went left
    const pos = idx - activeSlide; // -1 = passed, 0 = active, +1 = upcoming
    return {
      transform: `translateX(${pos * 110}%)`,
      opacity: pos === 0 ? 1 : 0,
      transition: "transform 0.72s cubic-bezier(0.77, 0, 0.18, 1), opacity 0.5s ease",
      pointerEvents: pos === 0 ? "auto" : "none",
    };
  };

  /* ── Hero visibility ──────────────────────────────────────────────── */
  const heroVisible = activeSlide === -1;
  const ctaVisible  = activeSlide === SLIDES.length;

  return (
    <div
      ref={containerRef}
      className={`intro-root${isExiting ? " intro-root--exiting" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* ── Ambient background ────────────────────────────────────── */}
      <div className="intro-bg" aria-hidden="true">
        <div className="intro-bg-orb intro-bg-orb--cyan" />
        <div className="intro-bg-orb intro-bg-orb--violet" />
        <div className="intro-bg-orb intro-bg-orb--emerald" />
        <div className="intro-bg-grid" />
      </div>

      {/* ── Top progress bar ──────────────────────────────────────── */}
      <div className="intro-progress-bar" aria-hidden="true">
        <div className="intro-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      {/* ── Dot navigation ────────────────────────────────────────── */}
      <nav className="intro-dot-nav" aria-label="Intro sections">
        {[-1, 0, 1, 2, SLIDES.length].map((idx, i) => (
          <button
            key={i}
            className={`intro-dot${activeSlide === idx ? " intro-dot--active" : ""}`}
            onClick={() => goTo(idx)}
            aria-label={idx === -1 ? "Hero" : idx === SLIDES.length ? "Enter" : `Feature ${idx + 1}`}
          />
        ))}
      </nav>

      {/* ══════════════════════════════════════════════════════════
          HERO — 3D Logo centered
          ══════════════════════════════════════════════════════════ */}
      <section
        className={`intro-section intro-hero${heroVisible ? " intro-section--visible" : " intro-section--above"}`}
        aria-hidden={!heroVisible}
      >
        <div className="intro-3d-stage">
          <ThreeDHeroScene theme="light" />
        </div>

        <div className="intro-brand">
          <span className="intro-brand-eyebrow">Open Source Contributor Assistant</span>
          <h1 className="intro-brand-title">
            Repo<span className="intro-brand-accent">Intel</span>
          </h1>
          <p className="intro-brand-subtitle">AI-Powered Codebase Intelligence</p>
        </div>

        <div className="intro-scroll-hint">
          <div className="intro-scroll-mouse">
            <div className="intro-scroll-wheel" />
          </div>
          <span>Scroll or drag to explore</span>
          <div className="intro-chevrons">
            <span className="intro-chevron" />
            <span className="intro-chevron" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEATURE SLIDES (story glide)
          ══════════════════════════════════════════════════════════ */}
      <div className="intro-slides-stage" aria-live="polite">
        {SLIDES.map((slide, idx) => (
          <section
            key={idx}
            className="intro-slide"
            style={getSlideStyle(idx)}
            aria-hidden={activeSlide !== idx}
          >
            <div className="intro-slide-inner">
              <div
                className="intro-slide-glow"
                style={{ background: `radial-gradient(ellipse at 50% 50%, ${slide.accent}28 0%, transparent 70%)` }}
              />

              <div className="intro-slide-number">
                {String(idx + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
              </div>

              <span
                className="intro-slide-tag"
                style={{ color: slide.accent, borderColor: slide.accent + "44" }}
              >
                {slide.tag}
              </span>

              <h2 className="intro-slide-title">
                {slide.title[0]}
                <br />
                <span style={{ color: slide.accent }}>{slide.title[1]}</span>
              </h2>

              <p className="intro-slide-body">{slide.body}</p>

              <div className="intro-slide-footer">
                <div
                  className="intro-slide-accent-bar"
                  style={{ background: slide.accent }}
                />
                {idx < SLIDES.length - 1 ? (
                  <button
                    className="intro-slide-next-btn"
                    onClick={() => goTo(activeSlide + 1)}
                    style={{ color: slide.accent, borderColor: slide.accent + "44" }}
                  >
                    Next ↓
                  </button>
                ) : (
                  <button
                    className="intro-slide-next-btn"
                    onClick={() => goTo(SLIDES.length)}
                    style={{ color: slide.accent, borderColor: slide.accent + "44" }}
                  >
                    Get Started →
                  </button>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          CTA SECTION
          ══════════════════════════════════════════════════════════ */}
      <section
        className={`intro-section intro-cta-section${ctaVisible ? " intro-section--visible" : " intro-section--below"}`}
        aria-hidden={!ctaVisible}
      >
        <div className="intro-cta-logo-mini">
          <ThreeDHeroScene theme="light" />
        </div>

        <div className="intro-cta-copy">
          <h2 className="intro-cta-title">Ready to explore?</h2>
          <p className="intro-cta-subtitle">
            Drop any GitHub repository URL and start asking questions instantly.
            <br />No sign-up. No configuration.
          </p>
        </div>

        <button
          className="intro-enter-btn"
          onClick={handleEnter}
          id="intro-enter-btn"
          tabIndex={ctaVisible ? 0 : -1}
        >
          <span className="intro-enter-btn__label">Enter Workspace</span>
          <span className="intro-enter-btn__arrow">→</span>
          <div className="intro-enter-btn__shine" />
        </button>

        <div className="intro-cta-hint">
          Press <kbd>Enter ↵</kbd> to launch
        </div>

        <div className="intro-cta-perks">
          <span>Instant Ingestion</span>
          <span className="intro-perk-dot">•</span>
          <span>Client-Safe</span>
          <span className="intro-perk-dot">•</span>
          <span>Any Public Repo</span>
        </div>
      </section>

      {/* ── Wipe overlay for exit ──────────────────────────────────── */}
      <div className={`intro-exit-wipe${isExiting ? " intro-exit-wipe--active" : ""}`} />
    </div>
  );
}



