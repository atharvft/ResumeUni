import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";

function ShootingStar() {
  const ref = useRef();
  const speed = useRef(Math.random() * 0.18 + 0.14);
  const active = useRef(false);

  const resetPosition = () => {
    if (!ref.current) return;
    ref.current.position.set(
      (Math.random() - 0.5) * 40,
      14 + Math.random() * 10,
      (Math.random() - 0.5) * 25
    );
    active.current = Math.random() > 0.35;
  };

  useFrame((_, delta) => {
    if (!ref.current) return;
    if (active.current) {
      ref.current.position.x += speed.current * 2.0;
      ref.current.position.y -= speed.current * 1.4;
      ref.current.position.z -= speed.current * 0.6;

      if (ref.current.position.y < -18) {
        resetPosition();
      }
    } else {
      if (Math.random() < 0.006) {
        resetPosition();
      }
    }
  });

  return _jsxs("group", {
    ref: ref,
    position: [0, -25, 0],
    children: [
      /* Shooting Star Head */
      _jsxs("mesh", {
        children: [
          _jsx("sphereGeometry", { args: [0.07, 8, 8] }),
          _jsx("meshBasicMaterial", { color: "#FFFFFF" })
        ]
      }),
      /* Glowing Photon Streak Tail */
      _jsxs("mesh", {
        position: [-0.8, 0.5, 0.25],
        rotation: [0, 0, Math.PI / 4],
        children: [
          _jsx("cylinderGeometry", { args: [0.012, 0.06, 1.6, 8] }),
          _jsx("meshBasicMaterial", {
            color: "#00F5FF",
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
          })
        ]
      })
    ]
  });
}

function NebulaCloud({ color, position, scale }) {
  const ref = useRef();
  const particles = useMemo(() => {
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * scale;
      pos[i * 3 + 1] = (Math.random() - 0.5) * scale;
      pos[i * 3 + 2] = (Math.random() - 0.5) * scale;
    }
    return pos;
  }, [scale]);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.018;
    }
  });

  return _jsxs("points", {
    ref: ref,
    position: position,
    children: [
      _jsx("bufferGeometry", {
        children: _jsx("bufferAttribute", {
          attach: "attributes-position",
          args: [particles, 3]
        })
      }),
      _jsx("pointsMaterial", {
        size: scale * 0.16,
        color: color,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    ]
  });
}

export function CosmicBackground({ liteMode }) {
  return _jsxs("group", {
    children: [
      /* 2500+ Multi-layered Parallax Star Field */
      _jsx(Stars, {
        radius: 46,
        depth: 35,
        count: liteMode ? 500 : 2500,
        factor: 3.5,
        saturation: 0.4,
        fade: true,
        speed: liteMode ? 0 : 0.5
      }),

      /* Volumetric Space Nebulae Particle Clouds */
      _jsx(NebulaCloud, { color: "#7B61FF", position: [-14, 7, -22], scale: 16 }),
      _jsx(NebulaCloud, { color: "#00F5FF", position: [16, -6, -24], scale: 18 }),
      _jsx(NebulaCloud, { color: "#EC4899", position: [0, -12, -18], scale: 15 }),
      _jsx(NebulaCloud, { color: "#FFC857", position: [-8, -14, -20], scale: 14 }),

      /* Occasional Shooting Stars */
      !liteMode && _jsx(ShootingStar, {}),
      !liteMode && _jsx(ShootingStar, {}),
      !liteMode && _jsx(ShootingStar, {})
    ]
  });
}
