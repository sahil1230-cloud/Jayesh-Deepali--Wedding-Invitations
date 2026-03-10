import { useState, useEffect, useRef } from "react";

// ── Google Fonts via style injection ──
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cormorant:ital,wght@0,300;0,400;1,300;1,400&family=Tenor+Sans&display=swap";
document.head.appendChild(fontLink);

const globalStyles = `
  * { margin:0; padding:0; box-sizing:border-box; }
  html { scroll-behavior: smooth; }
  body { background:#0a0608; overflow-x:hidden; cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='24' viewBox='0 0 16 24'%3E%3Cpath d='M0 0 L0 20 L4 16 L7 23 L9 22 L6 15 L11 15 Z' fill='white' stroke='%23333' stroke-width='1'/%3E%3C/svg%3E") 0 0, auto; }
  a, button { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='24' viewBox='0 0 16 24'%3E%3Cpath d='M0 0 L0 20 L4 16 L7 23 L9 22 L6 15 L11 15 Z' fill='white' stroke='%23333' stroke-width='1'/%3E%3C/svg%3E") 0 0, pointer; }

  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:#0a0608; }
  ::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#c8956c,#e8c5a0); border-radius:2px; }

  @keyframes floatUp {
    0%   { transform: translateY(0px) rotate(0deg); opacity:0.7; }
    50%  { opacity:1; }
    100% { transform: translateY(-120vh) rotate(360deg); opacity:0; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes pulse-ring {
    0%   { transform:scale(1); opacity:0.6; }
    100% { transform:scale(1.8); opacity:0; }
  }
  @keyframes fadeSlideUp {
    from { opacity:0; transform:translateY(40px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes fadeSlideLeft {
    from { opacity:0; transform:translateX(40px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes fadeSlideRight {
    from { opacity:0; transform:translateX(-40px); }
    to   { opacity:1; transform:translateX(0); }
  }
  @keyframes tickFlip {
    0%   { transform: rotateX(0deg); }
    50%  { transform: rotateX(-90deg); }
    100% { transform: rotateX(0deg); }
  }
  @keyframes drawLine {
    from { width:0; }
    to   { width:100%; }
  }
  @keyframes heartbeat {
    0%,100% { transform:scale(1); }
    14%     { transform:scale(1.3); }
    28%     { transform:scale(1); }
    42%     { transform:scale(1.2); }
    70%     { transform:scale(1); }
  }
  @keyframes gradientShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes rotateOrbit {
    from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
  }
  @keyframes glow {
    0%,100% { box-shadow: 0 0 20px rgba(200,149,108,0.3); }
    50%     { box-shadow: 0 0 60px rgba(200,149,108,0.7), 0 0 100px rgba(200,149,108,0.3); }
  }
`;

const styleEl = document.createElement("style");
styleEl.textContent = globalStyles;
document.head.appendChild(styleEl);

// ── Floating Particles ──
function Particles() {
  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: Math.random() * 4 + 2,
    delay: Math.random() * 12,
    duration: Math.random() * 12 + 10,
    type: i % 4,
  }));

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            bottom: "-20px",
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            borderRadius: p.type === 0 ? "50%" : p.type === 1 ? "0" : "50% 0",
            background:
              p.type === 2
                ? "rgba(232,197,160,0.5)"
                : "rgba(200,149,108,0.4)",
            animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
            transform: p.type === 1 ? "rotate(45deg)" : "none",
          }}
        />
      ))}
    </div>
  );
}

// ── Intersection Observer Hook ──
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ── Section Wrapper with reveal ──
function Reveal({ children, delay = 0, dir = "up", style = {} }) {
  const [ref, visible] = useReveal();
  const anim = dir === "up" ? "fadeSlideUp" : dir === "left" ? "fadeSlideLeft" : "fadeSlideRight";
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      animation: visible ? `${anim} 0.9s ${delay}s both ease` : "none",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Countdown ──
function useCountdown() {
  const target = new Date("2026-04-18T00:00:00");
  const [time, setTime] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = target - new Date();
      if (diff <= 0) { setTime({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function CountUnit({ val, label }) {
  const str = String(val ?? "0").padStart(2, "0");
  return (
    <div style={{ textAlign: "center", minWidth: 70 }}>
      <div style={{
        background: "linear-gradient(145deg,#1a0e12,#120a0d)",
        border: "1px solid rgba(200,149,108,0.3)",
        borderRadius: 2,
        padding: "16px 12px 10px",
        position: "relative",
        overflow: "hidden",
        animation: "glow 3s ease infinite",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,#c8956c,transparent)",
        }} />
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(2rem,5vw,2.8rem)",
          fontWeight: 700,
          background: "linear-gradient(135deg,#e8c5a0 0%,#c8956c 40%,#f0d4b4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundSize: "200% auto",
          animation: "shimmer 3s linear infinite",
          display: "block",
          lineHeight: 1,
        }}>{str}</span>
      </div>
      <span style={{
        fontFamily: "'Tenor Sans', sans-serif",
        fontSize: "0.58rem",
        letterSpacing: "0.35em",
        color: "rgba(200,149,108,0.6)",
        textTransform: "uppercase",
        marginTop: 8,
        display: "block",
      }}>{label}</span>
    </div>
  );
}

// ── Ornamental Divider ──
function GoldDivider({ wide = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", margin: "28px auto", maxWidth: wide ? 400 : 240 }}>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(200,149,108,0.6))" }} />
      <svg width="22" height="22" viewBox="0 0 22 22">
        <path d="M11 1 L13.5 8.5 L21 11 L13.5 13.5 L11 21 L8.5 13.5 L1 11 L8.5 8.5 Z"
          fill="none" stroke="#c8956c" strokeWidth="1" />
        <circle cx="11" cy="11" r="2" fill="#c8956c" />
      </svg>
      <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,rgba(200,149,108,0.6),transparent)" }} />
    </div>
  );
}

// ── Section Label ──
function SectionLabel({ children }) {
  return (
    <p style={{
      fontFamily: "'Tenor Sans', sans-serif",
      fontSize: "0.62rem",
      letterSpacing: "0.45em",
      color: "rgba(200,149,108,0.7)",
      textTransform: "uppercase",
      marginBottom: 16,
    }}>{children}</p>
  );
}

// ── Main Component ──
export default function WeddingInvitation() {
  const time = useCountdown();
  const [rsvpDone, setRsvpDone] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const events = [
    { day: "18", suffix: "th", month: "April 2026", title: "Wedding Eve", desc: "Pre-wedding celebration, Mehendi & Sangeet ceremony with family and friends." },
    { day: "19", suffix: "th", month: "April 2026", title: "Wedding Day", desc: "The grand wedding ceremony followed by reception dinner." },
  ];

  return (
    <div style={{ background: "#0a0608", minHeight: "100vh", position: "relative" }}>
      <Particles />
      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 24px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
      }}>
        {/* background radial glow */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "80vw", height: "80vw",
          maxWidth: 700, maxHeight: 700,
          borderRadius: "50%",
          background: "radial-gradient(ellipse,rgba(200,149,108,0.08) 0%,transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Orbiting rings */}
        {[120, 180, 240].map((r, i) => (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: r * 2, height: r * 2,
            marginTop: -r, marginLeft: -r,
            borderRadius: "50%",
            border: `1px solid rgba(200,149,108,${0.12 - i * 0.03})`,
            pointerEvents: "none",
          }} />
        ))}

        {/* floating petal dots on orbit */}
        {[0, 120, 240].map((deg, i) => (
          <div key={i} style={{
            position: "absolute",
            top: "50%", left: "50%",
            width: 6, height: 6,
            marginTop: -3, marginLeft: -3,
            borderRadius: "50%",
            background: "rgba(200,149,108,0.6)",
            animation: `rotateOrbit ${14 + i * 3}s ${i * 2}s linear infinite`,
            transformOrigin: "3px 3px",
          }} />
        ))}

        {/* Monogram badge */}
        <div style={{
          width: 120, height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#1a0e12,#0f080a)",
          border: "1.5px solid rgba(200,149,108,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 32,
          position: "relative",
          animation: "glow 3s ease infinite",
          animationDelay: "0s",
        }}>
          <div style={{
            position: "absolute", inset: 6,
            borderRadius: "50%",
            border: "0.5px solid rgba(200,149,108,0.2)",
          }} />
          {/* pulse ring */}
          <div style={{
            position: "absolute", inset: -12,
            borderRadius: "50%",
            border: "1px solid rgba(200,149,108,0.3)",
            animation: "pulse-ring 2.5s ease-out infinite",
          }} />
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "2.2rem",
            fontStyle: "italic",
            background: "linear-gradient(135deg,#e8c5a0,#c8956c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>D&J</span>
        </div>

        {/* eyebrow */}
        <p style={{
          fontFamily: "'Tenor Sans', sans-serif",
          fontSize: "0.62rem",
          letterSpacing: "0.5em",
          color: "rgba(200,149,108,0.6)",
          textTransform: "uppercase",
          marginBottom: 20,
          animation: "fadeSlideUp 1s 0.2s both ease",
        }}>
          Together With Their Families
        </p>

        {/* Couple name — ultra-large */}
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(3.5rem,13vw,9rem)",
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          color: "#f5ede0",
          animation: "fadeSlideUp 1s 0.35s both ease",
          position: "relative",
        }}>
          <span style={{
            background: "linear-gradient(135deg,#f5ede0 0%,#e8c5a0 40%,#c8956c 70%,#f5ede0 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 5s linear infinite",
          }}>Deepali</span>
        </h1>

        <div style={{
          display: "flex", alignItems: "center", gap: 20, margin: "8px 0",
          animation: "fadeSlideUp 1s 0.5s both ease",
        }}>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,transparent,rgba(200,149,108,0.6))" }} />
          <span style={{
            fontFamily: "'Cormorant', serif",
            fontStyle: "italic",
            fontSize: "clamp(1.8rem,5vw,3rem)",
            color: "#c8956c",
            animation: "heartbeat 2.5s 1.5s ease infinite",
            display: "inline-block",
          }}>& </span>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg,rgba(200,149,108,0.6),transparent)" }} />
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(3.5rem,13vw,9rem)",
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.02em",
          animation: "fadeSlideUp 1s 0.65s both ease",
        }}>
          <span style={{
            background: "linear-gradient(135deg,#f5ede0 0%,#e8c5a0 40%,#c8956c 70%,#f5ede0 100%)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 5s 1s linear infinite",
          }}>Jayesh</span>
        </h1>

        {/* quote */}
        <p style={{
          fontFamily: "'Cormorant', serif",
          fontStyle: "italic",
          fontSize: "clamp(1rem,2.5vw,1.3rem)",
          color: "rgba(232,197,160,0.65)",
          maxWidth: 480,
          lineHeight: 1.8,
          marginTop: 28,
          animation: "fadeSlideUp 1s 0.8s both ease",
        }}>
          "In your smile, I see something more beautiful than the stars."
        </p>

        {/* date badge */}
        <div style={{
          marginTop: 36,
          padding: "14px 36px",
          border: "1px solid rgba(200,149,108,0.4)",
          background: "linear-gradient(135deg,rgba(200,149,108,0.06),rgba(200,149,108,0.02))",
          fontFamily: "'Tenor Sans', sans-serif",
          fontSize: "0.82rem",
          letterSpacing: "0.35em",
          color: "#e8c5a0",
          textTransform: "uppercase",
          position: "relative",
          animation: "fadeSlideUp 1s 1s both ease",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg,transparent,#c8956c,transparent)",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 1,
            background: "linear-gradient(90deg,transparent,#c8956c,transparent)",
          }} />
          18th &amp; 19th April, 2026
        </div>

        {/* scroll hint */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          animation: "fadeSlideUp 1s 1.5s both ease",
        }}>
          <span style={{ fontFamily: "'Tenor Sans'", fontSize: "0.55rem", letterSpacing: "0.4em", color: "rgba(200,149,108,0.4)", textTransform: "uppercase" }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: "linear-gradient(180deg,rgba(200,149,108,0.6),transparent)" }} />
        </div>
      </section>

      {/* ── COUNTDOWN ── */}
      <section style={{
        padding: "80px 24px",
        textAlign: "center",
        position: "relative",
        borderTop: "1px solid rgba(200,149,108,0.1)",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg,transparent,rgba(200,149,108,0.03),transparent)",
          pointerEvents: "none",
        }} />
        <Reveal>
          <SectionLabel>The Big Day Approaches</SectionLabel>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(2rem,5vw,3rem)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "#f5ede0",
            marginBottom: 40,
          }}>Counting Every Moment</h2>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(10px,3vw,24px)", flexWrap: "wrap" }}>
            <CountUnit val={time.d} label="Days" />
            <div style={{ alignSelf: "center", marginTop: -16 }}>
              <span style={{ fontFamily: "'Playfair Display'", fontSize: "2rem", color: "rgba(200,149,108,0.4)" }}>:</span>
            </div>
            <CountUnit val={time.h} label="Hours" />
            <div style={{ alignSelf: "center", marginTop: -16 }}>
              <span style={{ fontFamily: "'Playfair Display'", fontSize: "2rem", color: "rgba(200,149,108,0.4)" }}>:</span>
            </div>
            <CountUnit val={time.m} label="Minutes" />
            <div style={{ alignSelf: "center", marginTop: -16 }}>
              <span style={{ fontFamily: "'Playfair Display'", fontSize: "2rem", color: "rgba(200,149,108,0.4)" }}>:</span>
            </div>
            <CountUnit val={time.s} label="Seconds" />
          </div>
        </Reveal>
      </section>

      {/* ── EVENTS ── */}
      <section style={{
        padding: "80px 24px",
        position: "relative",
        borderTop: "1px solid rgba(200,149,108,0.1)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center" }}>
            <SectionLabel>Celebration Schedule</SectionLabel>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem,5vw,3rem)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "#f5ede0",
              marginBottom: 40,
            }}>The Wedding Programme</h2>
          </Reveal>

          {/* tab toggles */}
          <Reveal delay={0.15} style={{ display: "flex", justifyContent: "center", gap: 0, marginBottom: 40 }}>
            {events.map((e, i) => (
              <button
                key={i}
                data-hover
                onClick={() => setActiveDay(i)}
                style={{
                  fontFamily: "'Tenor Sans', sans-serif",
                  fontSize: "0.65rem",
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  padding: "12px 30px",
                  border: `1px solid ${activeDay === i ? "#c8956c" : "rgba(200,149,108,0.2)"}`,
                  background: activeDay === i
                    ? "linear-gradient(135deg,rgba(200,149,108,0.15),rgba(200,149,108,0.05))"
                    : "transparent",
                  color: activeDay === i ? "#e8c5a0" : "rgba(200,149,108,0.4)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                {e.title}
              </button>
            ))}
          </Reveal>

          {/* event detail card */}
          <Reveal delay={0.25}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,1fr) minmax(0,1.6fr)",
              gap: 0,
              border: "1px solid rgba(200,149,108,0.2)",
              overflow: "hidden",
              maxWidth: 700,
              margin: "0 auto",
            }}>
              {/* date column */}
              <div style={{
                padding: "50px 30px",
                background: "linear-gradient(135deg,rgba(200,149,108,0.12),rgba(200,149,108,0.04))",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderRight: "1px solid rgba(200,149,108,0.2)",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 2,
                  background: "linear-gradient(90deg,transparent,#c8956c,transparent)",
                }} />
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(4rem,12vw,6rem)",
                  fontWeight: 900,
                  lineHeight: 1,
                  background: "linear-gradient(135deg,#f5ede0,#c8956c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>{events[activeDay].day}</span>
                <span style={{
                  fontFamily: "'Cormorant', serif",
                  fontStyle: "italic",
                  fontSize: "1.1rem",
                  color: "rgba(232,197,160,0.7)",
                  marginTop: 4,
                }}>{events[activeDay].month}</span>
                <div style={{
                  width: 40, height: 1,
                  background: "linear-gradient(90deg,transparent,#c8956c,transparent)",
                  margin: "16px auto",
                }} />
                <span style={{
                  fontFamily: "'Tenor Sans', sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.35em",
                  color: "#c8956c",
                  textTransform: "uppercase",
                }}>Saturday</span>
              </div>

              {/* info column */}
              <div style={{ padding: "40px 32px" }}>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1.6rem",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "#f5ede0",
                  marginBottom: 12,
                }}>{events[activeDay].title}</h3>
                <p style={{
                  fontFamily: "'Cormorant', serif",
                  fontSize: "1.05rem",
                  color: "rgba(232,197,160,0.6)",
                  lineHeight: 1.8,
                  marginBottom: 24,
                }}>{events[activeDay].desc}</p>

                <div style={{ borderTop: "1px solid rgba(200,149,108,0.15)", paddingTop: 20, marginTop: 4 }}>
                  {[
                    { icon: "📍", label: "Venue", val: "Grand Palace Banquet Hall" },
                    { icon: "📍", label: "Address", val: "123 Wedding Lane, Mumbai" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: "0.85rem", marginTop: 2 }}>{item.icon}</span>
                      <div>
                        <span style={{
                          fontFamily: "'Tenor Sans'",
                          fontSize: "0.55rem",
                          letterSpacing: "0.3em",
                          color: "rgba(200,149,108,0.5)",
                          textTransform: "uppercase",
                          display: "block",
                          marginBottom: 2,
                        }}>{item.label}</span>
                        <span style={{
                          fontFamily: "'Cormorant', serif",
                          fontSize: "0.98rem",
                          color: "rgba(232,197,160,0.75)",
                        }}>{item.val}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VENUE ── */}
      <section style={{
        padding: "80px 24px",
        borderTop: "1px solid rgba(200,149,108,0.1)",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg,rgba(200,149,108,0.04) 0%,transparent 60%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center" }}>
            <SectionLabel>Location</SectionLabel>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem,5vw,3rem)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "#f5ede0",
              marginBottom: 40,
            }}>Wedding Venue</h2>
          </Reveal>

          <div style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)",
            gap: 0,
            border: "1px solid rgba(200,149,108,0.2)",
            overflow: "hidden",
          }}>
            {/* image */}
            <Reveal dir="right">
              <div style={{ position: "relative", overflow: "hidden", height: "100%", minHeight: 280 }}>
                <img
                  src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop"
                  alt="Grand Palace Banquet Hall"
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    filter: "sepia(20%) brightness(0.75) saturate(0.9)",
                    transition: "transform 0.6s ease",
                    display: "block",
                  }}
                  onMouseOver={e => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={e => e.target.style.transform = "scale(1)"}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(135deg,rgba(10,6,8,0.4),transparent)",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", top: 16, left: 16,
                  padding: "6px 14px",
                  background: "rgba(10,6,8,0.7)",
                  border: "1px solid rgba(200,149,108,0.4)",
                  fontFamily: "'Tenor Sans'",
                  fontSize: "0.55rem",
                  letterSpacing: "0.35em",
                  color: "#c8956c",
                  textTransform: "uppercase",
                }}>Mumbai · Maharashtra</div>
              </div>
            </Reveal>

            {/* details */}
            <Reveal dir="left" style={{ padding: "44px 36px" }}>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#f5ede0",
                marginBottom: 8,
              }}>Grand Palace<br />Banquet Hall</h3>
              <GoldDivider />
              <p style={{
                fontFamily: "'Cormorant', serif",
                fontStyle: "italic",
                fontSize: "1rem",
                color: "rgba(232,197,160,0.65)",
                lineHeight: 1.8,
                marginBottom: 28,
              }}>123 Wedding Lane, Mumbai,<br />Maharashtra 400001</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <a
                  href="https://maps.app.goo.gl/efbZwan4yvY9EmzS9"
                  target="_blank"
                  rel="noreferrer"
                  data-hover
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "13px 24px",
                    border: "1px solid rgba(200,149,108,0.5)",
                    background: "transparent",
                    fontFamily: "'Tenor Sans', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "#e8c5a0",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.background = "rgba(200,149,108,0.12)";
                    e.currentTarget.style.borderColor = "#c8956c";
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "rgba(200,149,108,0.5)";
                  }}
                >
                  📍 View on Google Maps
                </a>
                <a
                  href="https://www.google.com"
                  target="_blank"
                  rel="noreferrer"
                  data-hover
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "13px 24px",
                    background: "linear-gradient(135deg,#c8956c,#e8c5a0,#c8956c)",
                    backgroundSize: "200% auto",
                    animation: "gradientShift 4s ease infinite",
                    fontFamily: "'Tenor Sans', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    color: "#0a0608",
                    textDecoration: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "opacity 0.3s",
                  }}
                  onMouseOver={e => e.currentTarget.style.opacity = "0.9"}
                  onMouseOut={e => e.currentTarget.style.opacity = "1"}
                >
                  ❤️ Confirm Your Presence
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section style={{
        padding: "80px 24px",
        borderTop: "1px solid rgba(200,149,108,0.1)",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel>Reach Out</SectionLabel>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem,5vw,3rem)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "#f5ede0",
              marginBottom: 10,
            }}>Have Questions?</h2>
            <p style={{
              fontFamily: "'Cormorant', serif",
              fontStyle: "italic",
              fontSize: "1.05rem",
              color: "rgba(232,197,160,0.55)",
              lineHeight: 1.7,
              marginBottom: 40,
            }}>
              Please contact one of our loving family members for any queries:
            </p>
          </Reveal>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 20,
          }}>
            {[
              { name: "Jayesh Asnani", phone: "+91 86197 49055", wa: "918619749055", role: "Groom's Family" },
              { name: "Abhishek Mittal", phone: "+91 78912 65360", wa: "917891265360", role: "Family Contact" },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div style={{
                  padding: "32px 24px",
                  border: "1px solid rgba(200,149,108,0.2)",
                  background: "linear-gradient(135deg,rgba(200,149,108,0.05),rgba(200,149,108,0.01))",
                  position: "relative",
                  transition: "border-color 0.3s",
                }}
                  onMouseOver={e => e.currentTarget.style.borderColor = "rgba(200,149,108,0.4)"}
                  onMouseOut={e => e.currentTarget.style.borderColor = "rgba(200,149,108,0.2)"}
                >
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: "linear-gradient(90deg,transparent,#c8956c,transparent)",
                  }} />
                  <div style={{
                    width: 52, height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,rgba(200,149,108,0.2),rgba(200,149,108,0.05))",
                    border: "1px solid rgba(200,149,108,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 16px",
                    fontFamily: "'Playfair Display'",
                    fontSize: "1.2rem",
                    fontStyle: "italic",
                    color: "#c8956c",
                  }}>
                    {c.name.charAt(0)}
                  </div>
                  <p style={{
                    fontFamily: "'Tenor Sans', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.3em",
                    color: "rgba(200,149,108,0.5)",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}>{c.role}</p>
                  <h4 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: "#f5ede0",
                    marginBottom: 6,
                  }}>{c.name}</h4>
                  <p style={{
                    fontFamily: "'Cormorant', serif",
                    fontSize: "1rem",
                    color: "rgba(232,197,160,0.6)",
                    marginBottom: 16,
                  }}>{c.phone}</p>
                  <a
                    href={`https://wa.me/${c.wa}`}
                    target="_blank"
                    rel="noreferrer"
                    data-hover
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontFamily: "'Tenor Sans'",
                      fontSize: "0.6rem",
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      color: "#c8956c",
                      textDecoration: "none",
                      borderBottom: "1px solid rgba(200,149,108,0.3)",
                      paddingBottom: 2,
                      cursor: "pointer",
                      transition: "color 0.2s, border-color 0.2s",
                    }}
                    onMouseOver={e => { e.currentTarget.style.color = "#e8c5a0"; e.currentTarget.style.borderColor = "rgba(232,197,160,0.6)"; }}
                    onMouseOut={e => { e.currentTarget.style.color = "#c8956c"; e.currentTarget.style.borderColor = "rgba(200,149,108,0.3)"; }}
                  >
                    💬 WhatsApp
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: "48px 24px",
        borderTop: "1px solid rgba(200,149,108,0.15)",
        textAlign: "center",
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg,transparent,#c8956c,transparent)",
        }} />
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(1.8rem,5vw,2.8rem)",
          fontStyle: "italic",
          fontWeight: 400,
          background: "linear-gradient(135deg,#f5ede0,#c8956c,#f5ede0)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer 4s linear infinite",
          marginBottom: 12,
        }}>Deepali & Jayesh</div>
        <p style={{
          fontFamily: "'Tenor Sans', sans-serif",
          fontSize: "0.62rem",
          letterSpacing: "0.4em",
          color: "rgba(200,149,108,0.35)",
          textTransform: "uppercase",
          marginBottom: 24,
        }}>18th &amp; 19th April, 2026 · Mumbai</p>
        <GoldDivider />
        <p style={{
          fontFamily: "'Cormorant', serif",
          fontStyle: "italic",
          fontSize: "0.9rem",
          color: "rgba(200,149,108,0.3)",
          marginTop: 16,
        }}>Made with ♥ for Deepali &amp; Jayesh</p>
      </footer>
    </div>
)};