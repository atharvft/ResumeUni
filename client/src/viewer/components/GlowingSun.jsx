import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// In-memory procedural canvas texture for the animated solar plasma surface
function generateSunCanvasTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Base golden-orange plasma
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, "#FF4500");
  grad.addColorStop(0.5, "#FF7A18");
  grad.addColorStop(1, "#FF9900");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Convection plasma cells & solar flare patches
  for (let i = 0; i < 180; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    const r = Math.random() * 35 + 5;
    ctx.fillStyle = Math.random() > 0.4 ? "#FFC857" : "#FFFFFF";
    ctx.globalAlpha = Math.random() * 0.45 + 0.15;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export function GlowingSun({ position = [0, 0, 0], scale = 1.35 }) {
  const sunCoreRef = useRef();
  const coronaRef = useRef();
  const outerGlowRef = useRef();
  const flaresRef = useRef();

  const sunTexture = useMemo(() => generateSunCanvasTexture(), []);

  // Solar wind particles emanating from the Sun
  const solarParticles = useMemo(() => {
    const count = 400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 1.4 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (sunCoreRef.current) {
      sunCoreRef.current.rotation.y += delta * 0.15;
    }
    if (coronaRef.current) {
      coronaRef.current.rotation.z -= delta * 0.25;
      coronaRef.current.scale.setScalar(1.08 + Math.sin(time * 3) * 0.03);
    }
    if (outerGlowRef.current) {
      outerGlowRef.current.scale.setScalar(1.25 + Math.cos(time * 2) * 0.04);
    }
    if (flaresRef.current) {
      flaresRef.current.rotation.y += delta * 0.3;
    }
  });

  return _jsxs("group", {
    position: position,
    scale: [scale, scale, scale],
    children: [
      /* Central High-Intensity Solar Light Source */
      _jsx("pointLight", {
        position: [0, 0, 0],
        intensity: 8,
        color: "#FFD700",
        distance: 25,
        decay: 1.5
      }),

      /* 1. Photorealistic Sun Core */
      _jsxs("mesh", {
        ref: sunCoreRef,
        children: [
          _jsx("sphereGeometry", { args: [1.0, 48, 48] }),
          _jsx("meshStandardMaterial", {
            map: sunTexture,
            color: "#FF7A18",
            emissive: "#FFC857",
            emissiveIntensity: 2.8,
            roughness: 0.2
          })
        ]
      }),

      /* 2. Inner Solar Corona Atmosphere Shell */
      _jsxs("mesh", {
        ref: coronaRef,
        children: [
          _jsx("sphereGeometry", { args: [1.08, 32, 32] }),
          _jsx("meshBasicMaterial", {
            color: "#FF7A18",
            transparent: true,
            opacity: 0.75,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
          })
        ]
      }),

      /* 3. Volumetric Outer Corona Glow Shell */
      _jsxs("mesh", {
        ref: outerGlowRef,
        children: [
          _jsx("sphereGeometry", { args: [1.3, 32, 32] }),
          _jsx("meshBasicMaterial", {
            color: "#FFC857",
            transparent: true,
            opacity: 0.4,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
          })
        ]
      }),

      /* 4. Solar Flares & Dynamic Prominences */
      _jsxs("group", {
        ref: flaresRef,
        children: [
          _jsxs("mesh", {
            rotation: [Math.PI / 4, Math.PI / 3, 0],
            children: [
              _jsx("torusGeometry", { args: [1.15, 0.03, 8, 32, Math.PI * 0.8] }),
              _jsx("meshBasicMaterial", {
                color: "#FFFFFF",
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending
              })
            ]
          }),
          _jsxs("mesh", {
            rotation: [-Math.PI / 3, -Math.PI / 4, 0],
            children: [
              _jsx("torusGeometry", { args: [1.2, 0.035, 8, 32, Math.PI * 0.7] }),
              _jsx("meshBasicMaterial", {
                color: "#FF7A18",
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
              })
            ]
          })
        ]
      }),

      /* 5. Solar Wind Plasma Particles */
      _jsxs("points", {
        children: [
          _jsx("bufferGeometry", {
            children: _jsx("bufferAttribute", {
              attach: "attributes-position",
              args: [solarParticles, 3]
            })
          }),
          _jsx("pointsMaterial", {
            size: 0.04,
            color: "#FFC857",
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        ]
      })
    ]
  });
}
