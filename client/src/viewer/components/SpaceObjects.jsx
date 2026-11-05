import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { audioEngine } from "./AudioEngine";

export function FloatingAstronaut({ position = [-6, 2.5, 2], onInteract }) {
  const groupRef = useRef();
  const [spinning, setSpinning] = useState(false);
  const spinVal = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    
    groupRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.28;
    groupRef.current.position.x = position[0] + Math.cos(time * 0.8) * 0.18;
    
    if (spinning) {
      spinVal.current += delta * 12;
      groupRef.current.rotation.y = spinVal.current;
      groupRef.current.rotation.z = Math.sin(spinVal.current * 0.5) * 0.35;
      if (spinVal.current > Math.PI * 4) {
        setSpinning(false);
        spinVal.current = 0;
        groupRef.current.rotation.y = 0;
        groupRef.current.rotation.z = 0;
      }
    } else {
      groupRef.current.rotation.z = Math.sin(time * 0.8) * 0.09;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    audioEngine.playHover();
    setSpinning(true);
    if (onInteract) onInteract("Astronaut: Floating through Atharv's Cinematic Universe!");
  };

  return _jsxs("group", {
    ref: groupRef,
    position: position,
    onClick: handleClick,
    onPointerOver: () => (document.body.style.cursor = "pointer"),
    onPointerOut: () => (document.body.style.cursor = "default"),
    children: [
      /* Helmet */
      _jsxs("mesh", {
        position: [0, 0.45, 0],
        children: [
          _jsx("sphereGeometry", { args: [0.22, 16, 16] }),
          _jsx("meshStandardMaterial", { color: "#FFFFFF", roughness: 0.2 })
        ]
      }),
      /* Gold Visor */
      _jsxs("mesh", {
        position: [0, 0.47, 0.14],
        rotation: [0.1, 0, 0],
        children: [
          _jsx("sphereGeometry", { args: [0.15, 16, 16] }),
          _jsx("meshStandardMaterial", {
            color: "#FFC857",
            metalness: 0.95,
            roughness: 0.1,
            emissive: "#FF7A18",
            emissiveIntensity: 0.5
          })
        ]
      }),
      /* Suit Body */
      _jsxs("mesh", {
        position: [0, 0, 0],
        children: [
          _jsx("capsuleGeometry", { args: [0.2, 0.35, 8, 16] }),
          _jsx("meshStandardMaterial", { color: "#ECF0F1", roughness: 0.4 })
        ]
      }),
      /* Jetpack */
      _jsxs("mesh", {
        position: [0, 0.05, -0.2],
        children: [
          _jsx("boxGeometry", { args: [0.32, 0.35, 0.15] }),
          _jsx("meshStandardMaterial", { color: "#95A5A6", roughness: 0.5 })
        ]
      }),
      /* Cyan Thruster LED */
      _jsxs("mesh", {
        position: [0, -0.15, -0.2],
        children: [
          _jsx("sphereGeometry", { args: [0.045, 8, 8] }),
          _jsx("meshBasicMaterial", { color: "#00F5FF" })
        ]
      })
    ]
  });
}

export function Satellite({ position = [6.2, -2.2, -2.8], onInteract }) {
  const satRef = useRef();

  useFrame((state, delta) => {
    if (satRef.current) {
      const time = state.clock.getElapsedTime();
      satRef.current.rotation.y += delta * 0.45;
      satRef.current.position.y = position[1] + Math.sin(time * 1.3) * 0.18;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    audioEngine.playAIPing();
    if (onInteract) onInteract("Satellite Telemetry: High-speed Neural Link established!");
  };

  return _jsxs("group", {
    ref: satRef,
    position: position,
    onClick: handleClick,
    onPointerOver: () => (document.body.style.cursor = "pointer"),
    onPointerOut: () => (document.body.style.cursor = "default"),
    children: [
      /* Central Cylinder Body */
      _jsxs("mesh", {
        children: [
          _jsx("cylinderGeometry", { args: [0.16, 0.16, 0.48, 12] }),
          _jsx("meshStandardMaterial", { color: "#BDC3C7", metalness: 0.85, roughness: 0.2 })
        ]
      }),
      /* Solar Panel Left */
      _jsxs("mesh", {
        position: [-0.68, 0, 0],
        children: [
          _jsx("boxGeometry", { args: [0.85, 0.24, 0.02] }),
          _jsx("meshStandardMaterial", { color: "#0B1E3F", emissive: "#00F5FF", emissiveIntensity: 0.5 })
        ]
      }),
      /* Solar Panel Right */
      _jsxs("mesh", {
        position: [0.68, 0, 0],
        children: [
          _jsx("boxGeometry", { args: [0.85, 0.24, 0.02] }),
          _jsx("meshStandardMaterial", { color: "#0B1E3F", emissive: "#00F5FF", emissiveIntensity: 0.5 })
        ]
      }),
      /* Antenna Dish */
      _jsxs("mesh", {
        position: [0, 0.35, 0],
        rotation: [-Math.PI / 4, 0, 0],
        children: [
          _jsx("coneGeometry", { args: [0.2, 0.12, 16] }),
          _jsx("meshStandardMaterial", { color: "#95A5A6", metalness: 0.9 })
        ]
      }),
      /* Red Beacon Light */
      _jsxs("mesh", {
        position: [0, 0.42, 0],
        children: [
          _jsx("sphereGeometry", { args: [0.04, 8, 8] }),
          _jsx("meshBasicMaterial", { color: "#FF7A18" })
        ]
      })
    ]
  });
}

export function SpaceStation({ position = [-7.5, -3.5, -5] }) {
  const stationRef = useRef();

  useFrame((_, delta) => {
    if (stationRef.current) {
      stationRef.current.rotation.y += delta * 0.15;
      stationRef.current.rotation.z += delta * 0.08;
    }
  });

  return _jsxs("group", {
    ref: stationRef,
    position: position,
    scale: [0.75, 0.75, 0.75],
    children: [
      /* Central Hub Sphere */
      _jsxs("mesh", {
        children: [
          _jsx("sphereGeometry", { args: [0.35, 16, 16] }),
          _jsx("meshStandardMaterial", { color: "#7F8C8D", metalness: 0.8 })
        ]
      }),
      /* Orbital Ring Truss */
      _jsxs("mesh", {
        children: [
          _jsx("torusGeometry", { args: [0.9, 0.04, 8, 32] }),
          _jsx("meshStandardMaterial", { color: "#7B61FF", emissive: "#7B61FF", emissiveIntensity: 0.6 })
        ]
      })
    ]
  });
}
