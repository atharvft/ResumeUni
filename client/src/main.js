import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, StrictMode, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import API_BASE_URL from "./config/api";
const UniverseViewer = lazy(() => import("./viewer/UniverseViewer").then((module) => ({ default: module.UniverseViewer })));
const PlainResume = lazy(() => import("./viewer/PlainResume").then((module) => ({ default: module.PlainResume })));
const Dashboard = lazy(() => import("./dashboard/Dashboard").then((module) => ({ default: module.Dashboard })));
const ResumeImport = lazy(() => import("./dashboard/ResumeImport").then((module) => ({ default: module.ResumeImport })));
const highlights = [
    ["✦", "Skills as stars", "See the tools you use glow brighter with experience."],
    ["◉", "Projects as planets", "Give your best work an orbit people want to explore."],
    ["↗", "Experience as a route", "Turn your career timeline into a path with momentum."],
];
const appHosts = new Set(["localhost", "127.0.0.1"]);
function DomainResolver() {
    const [slug, setSlug] = useState(undefined);
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/public/domain/${window.location.hostname}`)
            .then((response) => (response.ok ? response.json() : Promise.reject()))
            .then((data) => setSlug(data.slug))
            .catch(() => setSlug(null));
    }, []);
    if (slug === undefined)
        return _jsx("main", { className: "viewer-state", children: _jsx("p", { children: "Loading universe\u2026" }) });
    return slug ? _jsx(UniverseViewer, { slug }) : null;
}
function App() {
    if (window.location.pathname === "/" && !appHosts.has(window.location.hostname) && !window.location.hostname.endsWith(".onrender.com") && !window.location.hostname.endsWith(".vercel.app"))
        return _jsx(Suspense, { fallback: null, children: _jsx(DomainResolver, {}) });
    if (window.location.pathname === "/dashboard/import")
        return _jsx(Suspense, { fallback: _jsx("main", { className: "viewer-state", children: _jsx("p", { children: "Loading importer\u2026" }) }), children: _jsx(ResumeImport, {}) });
    if (window.location.pathname === "/dashboard")
        return _jsx(Suspense, { fallback: _jsx("main", { className: "viewer-state", children: _jsx("p", { children: "Loading workspace\u2026" }) }), children: _jsx(Dashboard, {}) });
    const plainMatch = window.location.pathname.match(/^\/u\/([^/]+)\/plain$/);
    if (plainMatch)
        return _jsx(Suspense, { fallback: _jsx("main", { className: "viewer-state", children: _jsx("p", { children: "Loading resume\u2026" }) }), children: _jsx(PlainResume, { slug: plainMatch[1] }) });
    const viewerMatch = window.location.pathname.match(/^\/u\/([^/]+)/);
    if (viewerMatch)
        return _jsx(Suspense, { fallback: _jsx("main", { className: "viewer-state", children: _jsx("p", { children: "Loading universe\u2026" }) }), children: _jsx(UniverseViewer, { slug: viewerMatch[1] }) });
    return _jsxs("main", { className: "shell", children: [_jsxs("nav", { className: "nav", children: [_jsxs("a", { className: "brand", href: "/", children: ["UNIVERSE", _jsx("span", { children: "\u00B7" }), "RESUME"] }), _jsx("a", { className: "plain-link", href: "#how-it-works", children: "How it works" }), _jsx("a", { className: "button secondary", href: "/dashboard", children: "Sign in" })] }), _jsxs("section", { className: "hero", children: [_jsxs("div", { className: "hero-copy", children: [_jsx("p", { className: "eyebrow", children: "A resume with gravity" }), _jsxs("h1", { children: ["Your career,", _jsx("br", {}), _jsx("em", { children: "in orbit." })] }), _jsx("p", { className: "lede", children: "A living, navigable universe for the work you want people to remember." }), _jsxs("div", { className: "actions", children: [_jsxs("a", { className: "button primary", href: "/dashboard", children: ["Build your universe ", _jsx("span", { children: "\u2197" })] }), _jsx("a", { className: "text-link", href: "#how-it-works", children: "Explore the idea \u2193" })] })] }), _jsxs("div", { className: "orbit", "aria-label": "Decorative orbit visualization", children: [_jsx("div", { className: "planet", children: _jsx("span", { children: "YOU" }) }), _jsx("i", { className: "star star-a", children: "\u2726" }), _jsx("i", { className: "star star-b", children: "\u2726" }), _jsx("i", { className: "star star-c", children: "\u00B7" }), _jsx("div", { className: "orbit-line one" }), _jsx("div", { className: "orbit-line two" })] })] }), _jsxs("section", { id: "how-it-works", className: "features", children: [_jsx("p", { className: "eyebrow", children: "One universe. Every dimension." }), _jsx("div", { className: "feature-grid", children: highlights.map(([icon, title, body]) => _jsxs("article", { className: "feature", children: [_jsx("div", { className: "feature-icon", children: icon }), _jsx("h2", { children: title }), _jsx("p", { children: body })] }, title)) })] }), _jsxs("footer", { children: [_jsx("span", { children: "UNIVERSE RESUME / PHASE 0" }), _jsx("span", { children: "Make your work impossible to skim." })] })] });
}
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
