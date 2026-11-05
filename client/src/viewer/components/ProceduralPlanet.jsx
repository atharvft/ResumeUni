import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// High-fidelity procedural canvas generator for 6 distinct planet themes
function generatePlanetCanvasTexture(planetType, baseHex, secHex) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 256);

  if (planetType === "lava") {
    // Fiery magma cracks and molten rivers
    ctx.strokeStyle = secHex;
    ctx.lineWidth = 6;
    ctx.shadowColor = secHex;
    ctx.shadowBlur = 12;
    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 512, Math.random() * 256);
      ctx.lineTo(Math.random() * 512, Math.random() * 256);
      ctx.lineTo(Math.random() * 512, Math.random() * 256);
      ctx.stroke();
    }
  } else if (planetType === "energy") {
    // Pulsing cyber energy circuit lines
    ctx.strokeStyle = secHex;
    ctx.lineWidth = 3;
    ctx.shadowColor = secHex;
    ctx.shadowBlur = 8;
    for (let x = 0; x < 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }
  } else if (planetType === "crystal") {
    // Geometric crystal facets
    ctx.fillStyle = secHex;
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      ctx.globalAlpha = Math.random() * 0.4 + 0.1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 25, y + 35);
      ctx.lineTo(x - 15, y + 45);
      ctx.closePath();
      ctx.fill();
    }
  } else if (planetType === "metallic") {
    // Metallic chrome plate segments
    ctx.fillStyle = secHex;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 16; i++) {
      ctx.fillRect(i * 32, 0, 16, 256);
    }
  } else if (planetType === "cloud") {
    // Swirling electric storm clouds
    for (let i = 0; i < 18; i++) {
      const y = Math.random() * 256;
      const h = Math.random() * 30 + 10;
      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.5, secHex);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(0, y, 512, h);
    }
  } else {
    // Cyber Neon Grid
    ctx.strokeStyle = secHex;
    ctx.lineWidth = 4;
    ctx.shadowColor = secHex;
    ctx.shadowBlur = 10;
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 512, Math.random() * 256, Math.random() * 40 + 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function ProceduralPlanet({
  size = 0.4,
  baseColor = "#00F5FF",
  secondaryColor = "#7B61FF",
  emissiveColor = "#0B1E3F",
  planetType = "energy",
  hasRings = false,
  moons = [],
  onClick,
  onPointerOver,
  onPointerOut
}) {
  const planetRef = useRef();
  const moonsGroupRef = useRef();
  const atmosphereRef = useRef();

  const texture = useMemo(
    () => generatePlanetCanvasTexture(planetType, baseColor, secondaryColor),
    [planetType, baseColor, secondaryColor]
  );

  useFrame((state, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.25;
    }
    if (moonsGroupRef.current) {
      moonsGroupRef.current.rotation.y += delta * 0.5;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.scale.setScalar(1.15 + Math.sin(state.clock.getElapsedTime() * 2) * 0.02);
    }
  });

  return _jsxs("group", {
    onClick: (e) => {
      e.stopPropagation();
      if (onClick) onClick();
    },
    onPointerOver: (e) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
      if (onPointerOver) onPointerOver();
    },
    onPointerOut: (e) => {
      document.body.style.cursor = "default";
      if (onPointerOut) onPointerOut();
    },
    children: [
      /* 1. Main Planet Core Mesh with Procedural Texture */
      _jsxs("mesh", {
        ref: planetRef,
        children: [
          _jsx("sphereGeometry", { args: [size, 32, 32] }),
          _jsx("meshStandardMaterial", {
            map: texture,
            color: baseColor,
            emissive: emissiveColor,
            emissiveIntensity: 0.7,
            roughness: planetType === "metallic" ? 0.1 : 0.4,
            metalness: planetType === "metallic" ? 0.9 : 0.2
          })
        ]
      }),

      /* 2. Atmospheric Scattering Volumetric Glow Shell */
      _jsxs("mesh", {
        ref: atmosphereRef,
        children: [
          _jsx("sphereGeometry", { args: [size * 1.15, 32, 32] }),
          _jsx("meshBasicMaterial", {
            color: secondaryColor,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide
          })
        ]
      }),

      /* 3. Optional Planetary Ring System */
      hasRings &&
        _jsxs("mesh", {
          rotation: [Math.PI / 2.6, 0, 0],
          children: [
            _jsx("ringGeometry", { args: [size * 1.45, size * 2.2, 64] }),
            _jsx("meshStandardMaterial", {
              color: secondaryColor,
              emissive: secondaryColor,
              emissiveIntensity: 0.4,
              transparent: true,
              opacity: 0.7,
              side: THREE.DoubleSide
            })
          ]
        }),

      /* 4. Orbiting Framework Moons */
      moons.length > 0 &&
        _jsx("group", {
          ref: moonsGroupRef,
          children: moons.map((moonName, i) => {
            const moonAngle = (i / moons.length) * Math.PI * 2;
            const moonDist = size * 2.3 + (i % 2) * 0.22;
            const mX = Math.cos(moonAngle) * moonDist;
            const mZ = Math.sin(moonAngle) * moonDist;
            return _jsxs("group", {
              position: [mX, (i % 2 ? 0.12 : -0.12), mZ],
              children: [
                _jsxs("mesh", {
                  children: [
                    _jsx("sphereGeometry", { args: [0.065, 16, 16] }),
                    _jsx("meshStandardMaterial", {
                      color: "#FFC857",
                      emissive: "#FF7A18",
                      emissiveIntensity: 1.1
                    })
                  ]
                })
              ]
            }, moonName + i);
          })
        })
    ]
  });
}
