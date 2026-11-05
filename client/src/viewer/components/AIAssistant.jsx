import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { audioEngine } from "./AudioEngine";

export function AIAssistant({ universe }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Greetings space explorer! I am AstroBot, your AI guide to Atharv's Universe. Ask me anything about skills, projects, or career history!"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateAIResponse = (query) => {
    const q = query.toLowerCase();
    const skillsList = universe?.skills?.map((s) => s.name).join(", ") || "React, Node.js, Three.js, MongoDB, JavaScript";
    const projectsList = universe?.projects?.map((p) => p.title).join(", ") || "Universe Resume, MERN Portfolio";
    const expList = universe?.experience?.map((e) => `${e.role} at ${e.company}`).join("; ") || "Software Engineer";

    if (q.includes("skill") || q.includes("tech") || q.includes("stack") || q.includes("know")) {
      return `Atharv's key technical skills include: ${skillsList}. Proficiency ranges up to 95% across modern full-stack web architectures!`;
    }
    if (q.includes("project") || q.includes("built") || q.includes("work") || q.includes("portfolio")) {
      return `Atharv has created stellar projects such as: ${projectsList}. You can click any planet in the scene to explore its full details!`;
    }
    if (q.includes("exp") || q.includes("history") || q.includes("career") || q.includes("job")) {
      return `Atharv's career experience includes: ${expList}. Check out the connected timeline path in space to trace the journey!`;
    }
    if (q.includes("contact") || q.includes("email") || q.includes("hire") || q.includes("reach")) {
      return `You can connect with Atharv directly or explore social links in the navigation bar!`;
    }
    return `Atharv Dalvi is a passionate full-stack & 3D web engineer. Feel free to explore the interactive planets and stars in this 3D universe!`;
  };

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    audioEngine.playAIPing();
    const userMsg = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateAIResponse(query);
      setMessages((prev) => [...prev, { sender: "ai", text: responseText }]);
      setIsTyping(false);
    }, 600);
  };

  return _jsxs("div", {
    className: "ai-assistant-wrapper",
    children: [
      /* Floating AstroBot Toggle Button */
      !isOpen &&
        _jsxs("button", {
          className: "ai-bot-trigger",
          onClick: () => {
            audioEngine.playClick();
            setIsOpen(true);
          },
          "aria-label": "Open AI Assistant",
          children: [
            _jsx("span", { className: "ai-bot-avatar", children: "🤖" }),
            _jsxs("div", {
              className: "ai-bot-badge",
              children: [
                _jsx("span", { className: "pulse-dot" }),
                _jsx("span", { children: "AstroBot AI" })
              ]
            })
          ]
        }),

      /* Glassmorphism Chat Window */
      isOpen &&
        _jsxs("div", {
          className: "ai-chat-window glass-panel",
          children: [
            /* Header */
            _jsxs("div", {
              className: "ai-chat-header",
              children: [
                _jsxs("div", {
                  className: "ai-title-group",
                  children: [
                    _jsx("span", { className: "ai-icon", children: "🤖" }),
                    _jsxs("div", {
                      children: [
                        _jsx("h3", { children: "AstroBot AI Guide" }),
                        _jsx("span", { className: "ai-status", children: "Online · Resume Context Active" })
                      ]
                    })
                  ]
                }),
                _jsx("button", {
                  className: "ai-close-btn",
                  onClick: () => setIsOpen(false),
                  children: "✕"
                })
              ]
            }),

            /* Message History */
            _jsxs("div", {
              className: "ai-messages-list",
              children: [
                messages.map((m, idx) =>
                  _jsx("div", {
                    className: `ai-message ${m.sender}`,
                    children: _jsx("p", { children: m.text })
                  }, idx)
                ),
                isTyping &&
                  _jsx("div", {
                    className: "ai-message ai typing",
                    children: _jsxs("div", {
                      className: "typing-indicator",
                      children: [
                        _jsx("span", {}),
                        _jsx("span", {}),
                        _jsx("span", {})
                      ]
                    })
                  }),
                _jsx("div", { ref: messagesEndRef })
              ]
            }),

            /* Quick Prompt Chips */
            _jsxs("div", {
              className: "ai-chips-group",
              children: [
                _jsx("button", {
                  onClick: () => handleSend("What are top skills?"),
                  children: "⚡ Top Skills"
                }),
                _jsx("button", {
                  onClick: () => handleSend("Show featured projects"),
                  children: "🪐 Featured Projects"
                }),
                _jsx("button", {
                  onClick: () => handleSend("Work history summary"),
                  children: "🚀 Work History"
                })
              ]
            }),

            /* Input Field & Form */
            _jsxs("form", {
              className: "ai-input-form",
              onSubmit: (e) => {
                e.preventDefault();
                handleSend();
              },
              children: [
                _jsx("input", {
                  type: "text",
                  placeholder: "Ask about Atharv's skills or projects...",
                  value: input,
                  onChange: (e) => setInput(e.target.value)
                }),
                _jsx("button", { type: "submit", children: "Send ➔" })
              ]
            })
          ]
        })
    ]
  });
}
