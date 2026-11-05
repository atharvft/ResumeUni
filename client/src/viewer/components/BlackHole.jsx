import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function BlackHole({ position = [0, 0, 0], scale = 1.2 }) {
  const outerDiskRef = useRef();
  const innerDiskRef = useRef();
  const coreDiskRef = useRef();
  const whirlpoolRef = useRef();
  const lensRef = useRef();

  // Create 500 gravitational swirl particles
  const particles = useMemo(() => {
    const count = 550;
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const c1 = new THREE.Color("#FF7A18"); // Energy Orange
    const c2 = new THREE.Color("#FFC857"); // Gold
    const c3 = new THREE.Color("#00F5FF"); // Cyan Energy spark

    for (let i = 0; i < count; i++) {
      const radius = 1.1 + Math.random() * 2.8;
      const angle = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.25;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      const randColor = Math.random() > 0.7 ? c3 : Math.random() > 0.3 ? c1 : c2;
      colors[i * 3] = randColor.r;
      colors[i * 3 + 1] = randColor.g;
      colors[i * 3 + 2] = randColor.b;
    }
    return { pos, colors };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (outerDiskRef.current) outerDiskRef.current.rotation.z += delta * 0.35;
    if (innerDiskRef.current) innerDiskRef.current.rotation.z -= delta * 0.65;
    if (coreDiskRef.current) coreDiskRef.current.rotation.z += delta * 0.9;
    if (whirlpoolRef.current) whirlpoolRef.current.rotation.y += delta * 0.5;

    // Pulse lensing light distortion
    if (lensRef.current) {
      lensRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.03);
    }
  });

  return _jsxs("group", {
    position: position,
    scale: [scale, scale, scale],
    children: [
      /* 1. Singular Event Horizon Core */
      _jsxs("mesh", {
        children: [
          _jsx("sphereGeometry", { args: [0.92, 32, 32] }),
          _jsx("meshBasicMaterial", { color: "#000000" })
        ]
      }),

      /* 2. Gravitational Lensing distortion shell */
      _jsxs("mesh", {
        ref: lensRef,
        children: [
          _jsx("sphereGeometry", { args: [1.02, 32, 32] }),
          _jsx("meshBasicMaterial", {
            color: "#FF7A18",
            transparent: true,
            opacity: 0.85,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending
          })
        ]
      }),

      /* 3. Multi-Layer Accretion Plasma Disk (Interstellar-style) */
      _jsxs("group", {
        rotation: [Math.PI / 2.3, 0, 0],
        children: [
          /* Outer Dust & Energy Band */
          _jsxs("mesh", {
            ref: outerDiskRef,
            children: [
              _jsx("ringGeometry", { args: [1.05, 3.2, 96] }),
              _jsx("meshBasicMaterial", {
                color: "#FF7A18",
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.65,
                blending: THREE.AdditiveBlending
              })
            ]
          }),

          /* Middle Hot Plasma Band */
          _jsxs("mesh", {
            ref: innerDiskRef,
            children: [
              _jsx("ringGeometry", { args: [0.98, 2.2, 96] }),
              _jsx("meshBasicMaterial", {
                color: "#FFC857",
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending
              })
            ]
          }),

          /* Inner White-Hot Core Disk */
          _jsxs("mesh", {
            ref: coreDiskRef,
            children: [
              _jsx("ringGeometry", { args: [0.93, 1.4, 96] }),
              _jsx("meshBasicMaterial", {
                color: "#FFFFFF",
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending
              })
            ]
          })
        ]
      }),

      /* 4. Gravitational Particle Whirlpool */
      _jsxs("points", {
        ref: whirlpoolRef,
        children: [
          _jsxs("bufferGeometry", {
            children: [
              _jsx("bufferAttribute", {
                attach: "attributes-position",
                args: [particles.pos, 3]
              }),
              _jsx("bufferAttribute", {
                attach: "attributes-color",
                args: [particles.colors, 3]
              })
            ]
          }),
          _jsx("pointsMaterial", {
            size: 0.045,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        ]
      })
    ]
  });
}
