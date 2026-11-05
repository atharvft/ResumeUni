import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { audioEngine } from "./AudioEngine";

// High-fidelity procedural canvas textures for the 8 real planets
function generateRealPlanetCanvas(planetName) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  if (planetName === "Mercury") {
    ctx.fillStyle = "#70695E";
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#4A443B";
    for (let i = 0; i < 200; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 8 + 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetName === "Venus") {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#D4A359");
    grad.addColorStop(0.5, "#F0C987");
    grad.addColorStop(1, "#B8863B");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
  } else if (planetName === "Earth") {
    ctx.fillStyle = "#1D4ED8";
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#15803D";
    for (let i = 0; i < 40; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 45 + 15, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (planetName === "Mars") {
    ctx.fillStyle = "#B91C1C";
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#991B1B";
    for (let i = 0; i < 100; i++) {
      ctx.fillRect(Math.random() * 512, Math.random() * 256, Math.random() * 30, Math.random() * 20);
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, 512, 20);
  } else if (planetName === "Jupiter") {
    for (let i = 0; i < 25; i++) {
      const y = (i / 25) * 256;
      ctx.fillStyle = i % 2 === 0 ? "#C2410C" : "#F59E0B";
      ctx.fillRect(0, y, 512, 12);
    }
    ctx.fillStyle = "#991B1B";
    ctx.beginPath();
    ctx.ellipse(320, 160, 45, 25, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (planetName === "Saturn") {
    for (let i = 0; i < 20; i++) {
      const y = (i / 20) * 256;
      ctx.fillStyle = i % 2 === 0 ? "#EAB308" : "#CA8A04";
      ctx.fillRect(0, y, 512, 14);
    }
  } else if (planetName === "Uranus") {
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#06B6D4");
    grad.addColorStop(1, "#0891B2");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
  } else {
    // Neptune
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#1E40AF");
    grad.addColorStop(1, "#1D4ED8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "#0F172A";
    ctx.beginPath();
    ctx.ellipse(200, 120, 30, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function RealPlanet({ config, onSelect }) {
  const ref = useRef(null);
  const cloudsRef = useRef(null);
  const repoMoonRef = useRef(null);
  const liveMoonRef = useRef(null);

  const texture = useMemo(() => generateRealPlanetCanvas(config.name), [config.name]);

  const orbitPoints = useMemo(() => {
    const points = [];
    const segments = 96;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * config.orbitRadius, 0, Math.sin(theta) * config.orbitRadius));
    }
    return points;
  }, [config.orbitRadius]);

  useFrame(({ clock }, delta) => {
    const time = clock.getElapsedTime();
    if (ref.current) {
      const angle = time * config.speed + config.index * 1.2;
      ref.current.position.set(Math.cos(angle) * config.orbitRadius, 0, Math.sin(angle) * config.orbitRadius);
      ref.current.rotation.y += delta * 0.3;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.45;
    }
    // Rotate Repo Star & Live Site Star around the planet
    if (repoMoonRef.current) {
      const rAngle = time * 0.9;
      const rDist = config.size * 1.85;
      repoMoonRef.current.position.set(Math.cos(rAngle) * rDist, 0.12, Math.sin(rAngle) * rDist);
    }
    if (liveMoonRef.current) {
      const lAngle = -time * 0.7 + Math.PI;
      const lDist = config.size * 2.45;
      liveMoonRef.current.position.set(Math.cos(lAngle) * lDist, -0.12, Math.sin(lAngle) * lDist);
    }
  });

  const projectData = config.projectData || {};
  const repoUrl = projectData.links?.github || projectData.links?.repo || "https://github.com";
  const liveUrl = projectData.links?.live || projectData.links?.demo || "https://google.com";

  return _jsxs("group", {
    children: [
      /* Illuminated Orbit Path Line */
      _jsx(Line, {
        points: orbitPoints,
        color: config.color,
        transparent: true,
        opacity: 0.28,
        lineWidth: 1.2
      }),

      /* Planet Mesh Group */
      _jsxs("group", {
        ref: ref,
        onClick: (e) => {
          e.stopPropagation();
          audioEngine.playClick();
          if (onSelect) onSelect(config);
        },
        onPointerOver: () => {
          document.body.style.cursor = "pointer";
          audioEngine.playHover();
        },
        onPointerOut: () => {
          document.body.style.cursor = "default";
        },
        children: [
          /* Core Planet Sphere */
          _jsxs("mesh", {
            children: [
              _jsx("sphereGeometry", { args: [config.size, 32, 32] }),
              _jsx("meshStandardMaterial", {
                map: texture,
                color: config.color,
                emissive: config.emissive,
                emissiveIntensity: 0.5,
                roughness: 0.4
              })
            ]
          }),

          /* Earth Clouds Shell */
          config.name === "Earth" &&
            _jsxs("mesh", {
              ref: cloudsRef,
              children: [
                _jsx("sphereGeometry", { args: [config.size * 1.05, 32, 32] }),
                _jsx("meshBasicMaterial", {
                  color: "#FFFFFF",
                  transparent: true,
                  opacity: 0.35,
                  blending: THREE.AdditiveBlending
                })
              ]
            }),

          /* Atmosphere Glow Shell */
          _jsxs("mesh", {
            children: [
              _jsx("sphereGeometry", { args: [config.size * 1.15, 32, 32] }),
              _jsx("meshBasicMaterial", {
                color: config.color,
                transparent: true,
                opacity: 0.28,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide
              })
            ]
          }),

          /* Saturn Rings */
          config.hasRings &&
            _jsxs("mesh", {
              rotation: [Math.PI / 2.6, 0, 0],
              children: [
                _jsx("ringGeometry", { args: [config.size * 1.4, config.size * 2.2, 64] }),
                _jsx("meshStandardMaterial", {
                  color: "#EAB308",
                  emissive: "#CA8A04",
                  emissiveIntensity: 0.4,
                  transparent: true,
                  opacity: 0.75,
                  side: THREE.DoubleSide
                })
              ]
            }),

          /* ⭐ Interactive Orbiting Repository Star (Gold) */
          _jsxs("group", {
            ref: repoMoonRef,
            onClick: (e) => {
              e.stopPropagation();
              audioEngine.playAIPing();
              window.open(repoUrl, "_blank");
            },
            children: [
              _jsxs("mesh", {
                children: [
                  _jsx("sphereGeometry", { args: [0.07, 12, 12] }),
                  _jsx("meshStandardMaterial", {
                    color: "#FFC857",
                    emissive: "#FFC857",
                    emissiveIntensity: 2.5
                  })
                ]
              })
            ]
          }),

          /* 🚀 Interactive Orbiting Live Site Star (Cyan) */
          _jsxs("group", {
            ref: liveMoonRef,
            onClick: (e) => {
              e.stopPropagation();
              audioEngine.playAIPing();
              window.open(liveUrl, "_blank");
            },
            children: [
              _jsxs("mesh", {
                children: [
                  _jsx("sphereGeometry", { args: [0.075, 12, 12] }),
                  _jsx("meshStandardMaterial", {
                    color: "#00F5FF",
                    emissive: "#00F5FF",
                    emissiveIntensity: 2.5
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}
