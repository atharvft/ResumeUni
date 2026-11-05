import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { UniverseCanvas } from "./UniverseScene";
import { demoUniverse } from "./types";
import { audioEngine } from "./components/AudioEngine";
import { AIAssistant } from "./components/AIAssistant";
import { EasterEggs } from "./components/EasterEggs";
import API_BASE_URL from "../config/api";

const palettes = ["nebula", "aurora", "solar", "mono"];
const sessionId =
  typeof window !== "undefined"
    ? localStorage.getItem("universe-session") ??
      (() => {
        const value = `anon-${crypto.randomUUID()}`;
        localStorage.setItem("universe-session", value);
        return value;
      })()
    : "server";

function TerminalLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([
    "INITIALIZING QUANTUM CORE...",
    "CALIBRATING GRAVITATIONAL LENS...",
    "HYDRATING STAR SYSTEMS & PLANETS...",
    "ESTABLISHING NEURAL ASSISTANT LINK..."
  ]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    const logTimer = setInterval(() => {
      setCurrentStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 450);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, [onComplete]);

  return _jsxs("div", {
    className: "terminal-loader-screen",
    children: [
      _jsxs("div", {
        className: "terminal-box",
        children: [
          _jsxs("div", {
            className: "terminal-header",
            children: [
              _jsx("span", { className: "terminal-dot red" }),
              _jsx("span", { className: "terminal-dot yellow" }),
              _jsx("span", { className: "terminal-dot green" }),
              _jsx("span", { className: "terminal-title", children: "UNIVERSE-OS v3.6" })
            ]
          }),
          _jsx("div", {
            className: "terminal-logs",
            children: logs.map((log, idx) =>
              _jsx(
                "div",
                {
                  className: `log-line ${idx <= currentStep ? "active" : ""}`,
                  children: `> ${log} ${idx <= currentStep ? "✔ [OK]" : "..."}`
                },
                idx
              )
            )
          }),
          _jsx("div", {
            className: "terminal-progress-bar",
            children: _jsx("div", {
              className: "terminal-progress-fill",
              style: { width: `${progress}%` }
            })
          })
        ]
      })
    ]
  });
}

export function UniverseViewer({ slug }) {
  const [universe, setUniverse] = useState(slug === "demo" ? demoUniverse : null);
  const [loading, setLoading] = useState(true);
  const [terminalComplete, setTerminalComplete] = useState(false);
  const [error, setError] = useState(false);
  const [selection, setSelection] = useState(null);
  const [audioMuted, setAudioMuted] = useState(true);
  const [objectMessage, setObjectMessage] = useState(null);
  const [liteMode, setLiteMode] = useState(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
  );
  const [tourActive, setTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  const selected = selection?.data;

  const track = (eventType, targetId, metadata, resumeId = universe?.id) => {
    if (!resumeId) return;
    fetch(`${API_BASE_URL}/api/analytics/${resumeId}/event`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventType,
        targetId,
        sessionId,
        metadata: { device: window.innerWidth < 760 ? "mobile" : "desktop", ...metadata }
      })
    }).catch(() => undefined);
  };

  useEffect(() => {
    if (slug === "demo") return;
    setLoading(true);
    setError(false);
    fetch(`${API_BASE_URL}/api/public/${slug}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        setUniverse(data);
        track("view", undefined, undefined, data.id);
      })
      .catch(() => {
        setError(true);
        setUniverse(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (universe) document.title = `${universe.title} | Universe Resume`;
  }, [universe]);

  const toggleAudio = () => {
    const nextState = !audioMuted;
    setAudioMuted(nextState);
    audioEngine.setMuted(nextState);
    if (!nextState) {
      audioEngine.startAmbient();
      audioEngine.playAIPing();
    }
  };

  const onSelect = (item) => {
    setSelection(item);
    audioEngine.playWarp();
    track(
      item.kind === "project"
        ? "click_planet"
        : item.kind === "skill"
        ? "click_star"
        : "click_waypoint",
      item.data.id
    );
  };

  const handleObjectInteract = (msg) => {
    setObjectMessage(msg);
    setTimeout(() => setObjectMessage(null), 4000);
  };

  const beginTour = () => {
    setTourActive(true);
    setTourIndex(0);
    audioEngine.playWarp();
    track("tour_started");
  };

  const nextTourStop = () => {
    if (tourIndex >= 3) {
      setTourActive(false);
      track("tour_completed");
    } else {
      setTourIndex((value) => value + 1);
      audioEngine.playWarp();
    }
  };

  const palette = useMemo(() => universe?.theme.palette ?? "nebula", [universe]);

  if (!terminalComplete || loading) {
    return _jsx(TerminalLoader, {
      onComplete: () => {
        setTerminalComplete(true);
        audioEngine.init();
      }
    });
  }

  if (error || !universe) {
    return _jsxs("main", {
      className: "viewer-state",
      children: [
        _jsx("p", { className: "eyebrow", children: "Signal lost" }),
        _jsx("h1", { children: "This universe is unavailable." }),
        _jsx("p", { children: "It may be unpublished or the link may be incorrect." }),
        _jsx("a", { className: "button primary", href: "/", children: "Return home" })
      ]
    });
  }

  return _jsxs("main", {
    className: `viewer palette-${palette}`,
    children: [
      /* 3D Canvas Scene */
      _jsx(UniverseCanvas, {
        universe: universe,
        onSelect: onSelect,
        liteMode: liteMode,
        tourActive: tourActive,
        tourIndex: tourIndex,
        onObjectInteract: handleObjectInteract
      }),

      /* Top Glass Navigation Bar */
      _jsxs("div", {
        className: "viewer-top",
        children: [
          _jsxs("a", {
            className: "brand",
            href: "/",
            children: ["UNIVERSE", _jsx("span", { children: "·" }), "RESUME"]
          }),
          _jsxs("span", {
            className: "viewer-status",
            children: ["PUBLIC UNIVERSE / ", slug]
          }),

          /* Audio Engine Synthesizer Toggle */
          _jsxs("button", {
            className: "audio-toggle-btn",
            onClick: toggleAudio,
            children: [
              _jsxs("div", {
                className: `audio-bars ${audioMuted ? "muted" : ""}`,
                children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})]
              }),
              _jsx("span", { children: audioMuted ? "Sound OFF" : "Space Audio ON" })
            ]
          }),

          _jsx("a", {
            className: "plain-link",
            href: `/u/${slug}/plain`,
            children: "Plain view ↗"
          })
        ]
      }),

      /* Intro Copy */
      _jsxs("div", {
        className: "viewer-intro",
        children: [
          _jsx("p", { className: "eyebrow", children: "Welcome to the universe" }),
          _jsx("h1", { children: universe.title }),
          _jsx("p", { children: universe.bio }),
          _jsx("span", {
            className: "hint",
            children: "Drag to orbit · Scroll to zoom · Click planets, astronaut & satellite"
          })
        ]
      }),

      /* Object Notification Toast */
      objectMessage &&
        _jsx("div", {
          className: "rocket-launch-banner",
          style: { top: "20%", padding: "16px 28px" },
          children: _jsx("p", { style: { color: "#38bdf8", fontSize: "14px" }, children: objectMessage })
        }),

      /* Viewer Controls */
      _jsxs("div", {
        className: "viewer-controls",
        children: [
          _jsx("button", {
            onClick: () => setLiteMode((value) => !value),
            children: liteMode ? "Full mode" : "Lite mode"
          }),
          _jsx("button", {
            onClick: tourActive ? nextTourStop : beginTour,
            children: tourActive
              ? `Next stop ${Math.min(tourIndex + 1, 4)}/4`
              : "Start guided tour"
          }),
          _jsx("div", {
            className: "palette-picker",
            children: palettes.map((name) =>
              _jsx(
                "button",
                {
                  className: name === palette ? "active" : "",
                  onClick: () => {
                    audioEngine.playClick();
                    setUniverse({
                      ...universe,
                      theme: { ...universe.theme, palette: name }
                    });
                  },
                  "aria-label": `Use ${name} palette`
                },
                name
              )
            )
          })
        ]
      }),

      /* Legend Bar */
      _jsxs("div", {
        className: "viewer-legend",
        children: [
          _jsxs("span", {
            children: [_jsx("i", { className: "legend-dot star-dot" }), " skills"]
          }),
          _jsxs("span", {
            children: [_jsx("i", { className: "legend-dot planet-dot" }), " projects"]
          }),
          _jsxs("span", {
            children: [_jsx("i", { className: "legend-dot route-dot" }), " experience"]
          })
        ]
      }),

      /* Planet / Star / Waypoint Landing View Dedicated Overlay */
      selected &&
        _jsxs("aside", {
          className: "planet-landing-overlay glass-panel",
          children: [
            _jsx("button", {
              className: "close-landing",
              onClick: () => setSelection(null),
              "aria-label": "Close details",
              children: "✕"
            }),
            _jsx("p", { className: "eyebrow", children: selection.kind.toUpperCase() }),
            selection.kind === "skill" &&
              _jsxs(_Fragment, {
                children: [
                  _jsx("h2", { children: selected.name }),
                  _jsxs("p", {
                    children: [
                      selected.category,
                      " constellation · ",
                      selected.proficiency,
                      "% proficiency"
                    ]
                  }),
                  _jsx("div", {
                    className: "meter",
                    children: _jsx("span", {
                      style: { width: `${selected.proficiency}%` }
                    })
                  })
                ]
              }),
            selection.kind === "project" &&
              _jsxs(_Fragment, {
                children: [
                  _jsx("h2", { children: selected.title }),
                  _jsx("p", { children: selected.description }),
                  _jsx("div", {
                    className: "tags",
                    children: (selected.techStack || []).map((tag) =>
                      _jsx("span", { children: tag }, tag)
                    )
                  }),
                  _jsxs("div", {
                    className: "project-links",
                    children: [
                      _jsx("a", {
                        className: "project-link-btn repo",
                        href: selected.links?.github || selected.links?.repo || "https://github.com",
                        target: "_blank",
                        rel: "noreferrer",
                        children: "⭐ GitHub Repository ↗"
                      }),
                      _jsx("a", {
                        className: "project-link-btn live",
                        href: selected.links?.live || selected.links?.demo || "https://google.com",
                        target: "_blank",
                        rel: "noreferrer",
                        children: "🚀 Live Site ↗"
                      })
                    ]
                  })
                ]
              }),
            selection.kind === "experience" &&
              _jsxs(_Fragment, {
                children: [
                  _jsx("h2", { children: selected.role }),
                  _jsxs("p", {
                    children: [
                      selected.company,
                      " · ",
                      selected.startDate?.slice(0, 4),
                      " — ",
                      selected.endDate?.slice(0, 4) ?? "Present"
                    ]
                  }),
                  _jsx("p", { children: selected.description }),
                  _jsx("ul", {
                    children: (selected.achievements || []).map((achievement) =>
                      _jsx("li", { children: achievement }, achievement)
                    )
                  })
                ]
              })
          ]
        }),

      /* AI Assistant Bot Widget */
      _jsx(AIAssistant, { universe: universe }),

      /* Easter Egg Konami Code Detector */
      _jsx(EasterEggs, {})
    ]
  });
}
