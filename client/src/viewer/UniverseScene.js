import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

import { GlowingSun } from "./components/GlowingSun";
import { RealPlanet } from "./components/SolarSystemPlanets";
import { CosmicBackground } from "./components/CosmicBackground";
import { FloatingAstronaut, Satellite, SpaceStation } from "./components/SpaceObjects";
import { audioEngine } from "./components/AudioEngine";

// Configurations for all 8 real planets in the Solar System
const solarSystemConfigs = [
  { name: "Mercury", size: 0.22, orbitRadius: 2.6, speed: 0.12, color: "#8C857B", emissive: "#4A443B", index: 0, hasRings: false },
  { name: "Venus", size: 0.32, orbitRadius: 3.6, speed: 0.09, color: "#F0C987", emissive: "#B8863B", index: 1, hasRings: false },
  { name: "Earth", size: 0.38, orbitRadius: 4.8, speed: 0.07, color: "#1D4ED8", emissive: "#15803D", index: 2, hasRings: false },
  { name: "Mars", size: 0.28, orbitRadius: 6.0, speed: 0.055, color: "#B91C1C", emissive: "#991B1B", index: 3, hasRings: false },
  { name: "Jupiter", size: 0.72, orbitRadius: 7.6, speed: 0.04, color: "#F59E0B", emissive: "#C2410C", index: 4, hasRings: false },
  { name: "Saturn", size: 0.62, orbitRadius: 9.4, speed: 0.03, color: "#EAB308", emissive: "#CA8A04", index: 5, hasRings: true },
  { name: "Uranus", size: 0.48, orbitRadius: 11.2, speed: 0.022, color: "#06B6D4", emissive: "#0891B2", index: 6, hasRings: true },
  { name: "Neptune", size: 0.46, orbitRadius: 12.8, speed: 0.016, color: "#1E40AF", emissive: "#1D4ED8", index: 7, hasRings: false }
];

function SkillStar({ skill, index, onSelect }) {
  const ref = useRef(null);
  const radius = 2.0 + (index % 5) * 0.45;
  const yOffset = 0.25 + Math.sin(index * 1.8) * 0.35;
  const orbitSpeed = 0.045 + (index % 3) * 0.015;
  const size = 0.055 + (skill.proficiency || 70) / 1100;

  const orbitPoints = useMemo(() => {
    const points = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * radius, yOffset, Math.sin(theta) * radius));
    }
    return points;
  }, [radius, yOffset]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const angle = clock.getElapsedTime() * orbitSpeed + index * 1.4;
      ref.current.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius);
    }
  });

  const starColor = useMemo(() => {
    const colors = ["#FFFFFF", "#00F5FF", "#FFC857", "#7B61FF", "#FF7A18"];
    let hash = 0;
    for (let i = 0; i < (skill.name || "").length; i++) {
      hash = skill.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }, [skill.name]);

  return _jsxs("group", {
    children: [
      _jsx(Line, {
        points: orbitPoints,
        color: starColor,
        transparent: true,
        opacity: 0.18,
        lineWidth: 0.8,
        dashed: true,
        dashSize: 0.06,
        gapSize: 0.06
      }),
      _jsxs("group", {
        ref: ref,
        onClick: (event) => {
          event.stopPropagation();
          audioEngine.playClick();
          onSelect({ kind: "skill", data: skill });
        },
        onPointerOver: () => audioEngine.playHover(),
        children: [
          _jsxs("mesh", {
            children: [
              _jsx("sphereGeometry", { args: [size, 16, 16] }),
              _jsx("meshStandardMaterial", {
                color: starColor,
                emissive: starColor,
                emissiveIntensity: 3.5,
                roughness: 0.1
              })
            ]
          })
        ]
      })
    ]
  });
}

function Timeline({ experience, onSelect }) {
  const points = useMemo(
    () =>
      experience.map(
        (_, index) =>
          new THREE.Vector3(-5.2 + index * 3.0, -2.0 + Math.sin(index * 1.7) * 0.5, -1.5)
      ),
    [experience]
  );

  return _jsxs("group", {
    children: [
      points.length > 1 &&
        _jsx(Line, {
          points: points,
          color: "#FF7A18",
          transparent: true,
          opacity: 0.88,
          lineWidth: 1.6,
          dashed: true,
          dashSize: 0.16,
          gapSize: 0.1
        }),
      points.map((point, index) =>
        _jsxs(
          "mesh",
          {
            position: point,
            onClick: (event) => {
              event.stopPropagation();
              audioEngine.playClick();
              onSelect({ kind: "experience", data: experience[index] });
            },
            onPointerOver: () => audioEngine.playHover(),
            children: [
              _jsx("sphereGeometry", { args: [0.16, 16, 16] }),
              _jsx("meshStandardMaterial", {
                color: "#FF7A18",
                emissive: "#FFC857",
                emissiveIntensity: 1.4
              })
            ]
          },
          experience[index]?.company || index
        )
      )
    ]
  });
}

// Mouse Parallax & Camera Tour Controller
function MouseParallaxAndTour({ tourActive, tourIndex }) {
  const { camera } = useThree();
  const targets = useMemo(
    () => [
      new THREE.Vector3(0, 1.6, 11),
      new THREE.Vector3(6.5, 2.5, 6.5),
      new THREE.Vector3(-6.5, -0.2, 6.5),
      new THREE.Vector3(0, -3.0, 7.5)
    ],
    []
  );

  useFrame((state) => {
    if (tourActive) {
      camera.position.lerp(targets[tourIndex % targets.length], 0.04);
      camera.lookAt(0, 0, 0);
    } else {
      // Gentle mouse-parallax inertia shift
      const { x, y } = state.pointer;
      camera.position.x += (x * 0.7 - camera.position.x) * 0.02;
      camera.position.y += (-y * 0.5 + 1.6 - camera.position.y) * 0.02;
    }
  });

  return null;
}

export function UniverseCanvas({ universe, onSelect, liteMode, tourActive, tourIndex, onObjectInteract }) {
  return _jsxs(Canvas, {
    camera: { position: [0, 1.6, 11], fov: 52 },
    dpr: liteMode ? 1 : [1, 1.5],
    gl: { antialias: !liteMode },
    children: [
      _jsx("color", { attach: "background", args: ["#05060A"] }),
      _jsx("ambientLight", { intensity: 0.6 }),

      /* 1. Parallax Cosmic Background & Shooting Stars */
      _jsx(CosmicBackground, { liteMode: liteMode }),

      /* 2. Massive Ultra-Realistic Glowing Sun at Exact Center [0, 0, 0] */
      _jsx(GlowingSun, { position: [0, 0, 0], scale: 1.35 }),

      /* 3. The 8 Real Solar System Planets Orbiting on Illuminated Paths */
      solarSystemConfigs.map((cfg) => {
        const matchingProject = universe.projects[cfg.index] || {
          title: `${cfg.name} System`,
          description: `Exploring the ${cfg.name} world in Atharv's Solar System portfolio.`,
          techStack: ["Orbital Dynamics", "3D WebGL", "Solar Physics"]
        };
        return _jsx(
          RealPlanet,
          {
            config: cfg,
            onSelect: () => onSelect({ kind: "project", data: matchingProject })
          },
          cfg.name
        );
      }),

      /* 4. Interactive Space Objects (Astronaut, Satellite & Space Station) */
      _jsx(FloatingAstronaut, { position: [-6.2, 2.5, 1.8], onInteract: onObjectInteract }),
      _jsx(Satellite, { position: [6.8, -2.4, -2.8], onInteract: onObjectInteract }),
      _jsx(SpaceStation, { position: [-8.2, -3.8, -5.5] }),

      /* 5. Orbiting Skill Stars */
      universe.skills.map((skill, index) =>
        _jsx(SkillStar, { skill: skill, index: index, onSelect: onSelect }, `${skill.name}-${index}`)
      ),

      /* 6. Career Timeline Galaxy Path */
      _jsx(Timeline, { experience: universe.experience, onSelect: onSelect }),

      /* 7. Mouse Parallax Inertia & Tour Camera Controller */
      _jsx(MouseParallaxAndTour, { tourActive: tourActive, tourIndex: tourIndex }),

      /* Orbit Controls */
      _jsx(OrbitControls, {
        enablePan: !tourActive,
        minDistance: 4.0,
        maxDistance: 18.0,
        autoRotate: !liteMode && !tourActive,
        autoRotateSpeed: 0.15
      })
    ]
  });
}
