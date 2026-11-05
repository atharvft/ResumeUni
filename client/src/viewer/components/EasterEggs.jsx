import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { audioEngine } from "./AudioEngine";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a"
];

export function EasterEggs() {
  const [konamiProgress, setKonamiProgress] = useState(0);
  const [rocketLaunching, setRocketLaunching] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const target = KONAMI_CODE[konamiProgress];

      if (key === target) {
        const next = konamiProgress + 1;
        setKonamiProgress(next);
        if (next === KONAMI_CODE.length) {
          triggerRocketLaunch();
          setKonamiProgress(0);
        }
      } else {
        setKonamiProgress(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [konamiProgress]);

  const triggerRocketLaunch = () => {
    audioEngine.playWarp();
    setRocketLaunching(true);
    setTimeout(() => {
      setRocketLaunching(false);
    }, 4500);
  };

  return _jsxs("div", {
    className: "easter-eggs-overlay",
    children: [
      rocketLaunching &&
        _jsxs("div", {
          className: "rocket-launch-banner",
          children: [
            _jsx("div", { className: "rocket-anim", children: "🚀" }),
            _jsx("h2", { children: "SECRET EASTER EGG UNLOCKED!" }),
            _jsx("p", { children: "Konami Code Executed · Rocket Launch Sequence Initiated!" })
          ]
        })
    ]
  });
}
