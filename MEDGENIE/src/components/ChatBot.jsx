import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/apiConfig";

const STORAGE_KEY = "chatHistory";

const ChatBot = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);

  // ✅ Keep model aligned with backend default
  const [model, setModel] = useState("qwen2.5-32b");

  const [fullscreen, setFullscreen] = useState(false);
  const [toast, setToast] = useState("");

  const endRef = useRef(null);
  const speechRef = useRef(null);
  const recRef = useRef(null);

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
    []
  );

  // Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, typing]);

  // Save chat history
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chat));
    } catch {}
  }, [chat]);

  // Small toast helper
  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(""), 1200);
  };

  // Speech-to-text
  const startSTT = () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Speech recognition not supported in this browser.");
        return;
      }

      // stop previous if running
      try {
        recRef.current?.stop?.();
      } catch {}

      const rec = new SpeechRecognition();
      recRef.current = rec;

      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onresult = (e) => {
        const t = e?.results?.[0]?.[0]?.transcript || "";
        if (t) setInput((prev) => (prev ? `${prev} ${t}` : t));
      };

      rec.onerror = () => showToast("🎤 STT error");
      rec.onend = () => {};

      rec.start();
      showToast("🎤 Listening…");
    } catch {
      alert("Speech recognition not supported.");
    }
  };

  // Text-to-speech
  const stopSpeak = () => {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  };

  const speak = (msg) => {
    try {
      stopSpeak();
      const u = new SpeechSynthesisUtterance(msg);
      u.rate = 1;
      u.pitch = 1;
      speechRef.current = u;
      window.speechSynthesis.speak(u);
    } catch {}
  };

  const clearChat = () => {
    stopSpeak();
    setChat([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    showToast("🧹 Cleared");
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast("✅ Copied");
    } catch {
      showToast("❌ Copy failed");
    }
  };

  const sendMsg = async () => {
    const userText = input.trim();
    if (!userText || loading) return;

    stopSpeak();
    setInput("");

    // push user msg
    setChat((p) => [...p, { sender: "user", text: userText }]);
    setTyping(true);
    setLoading(true);

    try {
      const data = await api.aiChat(userText, model);
      const aiReply = data?.reply || "AI returned empty reply.";

      setChat((p) => [...p, { sender: "ai", text: aiReply }]);
      speak(aiReply);
    } catch (e) {
      setChat((p) => [
        ...p,
        { sender: "ai", text: `⚠️ ${e?.message || "Server error"}` },
      ]);
    } finally {
      setTyping(false);
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  };

  return (
    <div
      className={`p-6 ${
        fullscreen ? "fixed inset-0 bg-white z-50" : "max-w-3xl mx-auto"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-3xl font-bold">🤖 MedGenie AI Chat</h1>
          <div className="text-xs text-gray-500 mt-1">
            Backend: <span className="font-mono">{apiBase}</span> • Model:{" "}
            <span className="font-mono">{model}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="bg-gray-200 text-gray-900 px-3 py-2 rounded"
            onClick={stopSpeak}
            title="Stop speaking"
          >
            🔇
          </button>

          <button
            className="bg-gray-200 text-gray-900 px-3 py-2 rounded"
            onClick={clearChat}
            title="Clear chat"
          >
            🧹
          </button>

          <button
            className="bg-gray-800 text-white px-4 py-2 rounded"
            onClick={() => setFullscreen(!fullscreen)}
          >
            {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-3 text-sm bg-black text-white inline-block px-3 py-1 rounded">
          {toast}
        </div>
      )}

      {/* Model Selector */}
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="border p-2 rounded mb-3 w-full"
      >
        <option value="qwen2.5-32b">Qwen 32B (qwen2.5-32b)</option>
        {/* add only models you actually have access to */}
      </select>

      {/* CHAT BOX */}
      <div className="bg-gray-100 h-[500px] p-4 rounded shadow overflow-y-auto">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 my-3 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "ai" && (
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center">
                🤖
              </div>
            )}

            <div
              className={`p-3 rounded-xl max-w-[75%] ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {msg.sender === "ai" && (
                <div className="mt-2 flex gap-2 text-xs">
                  <button
                    onClick={() => copyText(msg.text)}
                    className="px-2 py-1 rounded bg-gray-100 border"
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                🧑
              </div>
            )}
          </div>
        ))}

        {typing && (
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center">
              🤖
            </div>
            <div className="bg-white border px-3 py-2 rounded-xl animate-pulse">
              AI is typing…
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* INPUT BAR */}
      <div className="flex gap-3 mt-4">
        <textarea
          className="flex-1 border p-3 rounded-lg min-h-[52px]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
          disabled={loading}
        />

        <button
          onClick={startSTT}
          className="bg-gray-700 text-white px-4 py-3 rounded-lg"
          disabled={loading}
          title="Speech to text"
        >
          🎤
        </button>

        <button
          onClick={sendMsg}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
