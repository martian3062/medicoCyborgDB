import { useState, useEffect, useRef } from "react";

// -------------------------------------------
// LANGUAGE DETECTOR (Punjabi / Hindi / English)
// -------------------------------------------
const detectLang = (txt) => {
  if (/[\u0900-\u097F]/.test(txt)) return "hi"; // Hindi
  if (/[\u0A00-\u0A7F]/.test(txt)) return "pa"; // Punjabi
  return "en"; // English default
};

// -------------------------------------------
// TEXT-TO-SPEECH
// -------------------------------------------
const speakText = (text) => {
  let lang = detectLang(text);

  // User asking "speak in punjabi"
  if (text.toLowerCase().includes("punjabi")) lang = "pa";

  const msg = new SpeechSynthesisUtterance(text);

  msg.lang =
    lang === "hi"
      ? "hi-IN"
      : lang === "pa"
      ? "pa-IN"
      : "en-US";

  msg.rate = 1;
  msg.pitch = 1;

  window.speechSynthesis.speak(msg);
};

// -------------------------------------------
// CHATBOT COMPONENT
// -------------------------------------------
const ChatBot = () => {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState(() => {
    try {
      const saved = localStorage.getItem("chatHistory");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [model, setModel] = useState("qwen/qwen3-32b");
  const [fullscreen, setFullscreen] = useState(false);

  const endRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, typing]);

  // Save message history
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(chat));
  }, [chat]);

  // -------------------------------------------
  // SPEECH-TO-TEXT (MULTILINGUAL)
  // -------------------------------------------
  const startSTT = () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert("Your browser does not support voice input.");
        return;
      }

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      // Auto-select STT language
      const lang = detectLang(input || "ਹੈਲੋ");
      rec.lang = lang === "hi" ? "hi-IN" : lang === "pa" ? "pa-IN" : "en-US";

      rec.start();

      rec.onresult = (e) => {
        setInput(e.results[0][0].transcript);
      };
    } catch (err) {
      alert("Speech recognition not supported.");
    }
  };

  // -------------------------------------------
  // SEND MESSAGE
  // -------------------------------------------
  const sendMsg = async () => {
    if (!input.trim()) return;

    const userMsg = input;

    // Add user message to chat
    setChat((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setTyping(true);
    setLoading(true);

    setTimeout(async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/chat/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMsg,
            model: model
          }),
        });

        const data = await res.json();
        const reply = data.reply || "AI Error.";

        setChat((prev) => [...prev, { sender: "ai", text: reply }]);

        // AI Voice Output
        speakText(reply);
      } catch (error) {
        setChat((prev) => [
          ...prev,
          { sender: "ai", text: "⚠️ Server error." },
        ]);
      }

      setTyping(false);
      setLoading(false);
    }, 300);
  };

  return (
    <div
      className={`p-6 ${
        fullscreen ? "fixed inset-0 bg-white z-50" : "max-w-3xl mx-auto"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-3xl font-bold">🤖 MedGenie AI Chat</h1>

        <button
          onClick={() => setFullscreen(!fullscreen)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      {/* Model Selector */}
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        className="border p-2 mb-3 rounded"
      >
        <option value="qwen/qwen3-32b">Qwen 32B</option>
        <option value="llama3-70b">LLaMA3 70B</option>
        <option value="mixtral-8x7b">Mixtral 8x7B</option>
      </select>

      {/* CHAT WINDOW */}
      <div className="bg-gray-100 h-[500px] p-4 rounded shadow overflow-y-auto">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`flex my-3 gap-3 ${
              msg.sender === "user" ? "justify-end" : ""
            }`}
          >
            {msg.sender === "ai" && (
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center">
                🤖
              </div>
            )}

            <div
              className={`p-3 max-w-[70%] rounded-xl ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white border"
              }`}
            >
              {msg.text}
            </div>

            {msg.sender === "user" && (
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                🧑
              </div>
            )}
          </div>
        ))}

        {/* Typing Animation */}
        {typing && (
          <div className="flex items-center gap-3 mt-4">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center">
              🤖
            </div>
            <div className="bg-white px-3 py-2 rounded-xl animate-pulse border">
              AI is typing…
            </div>
          </div>
        )}

        <div ref={endRef}></div>
      </div>

      {/* INPUT BAR */}
      <div className="flex gap-3 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
          className="flex-1 border p-3 rounded-lg"
          placeholder="Speak or type — Supports Punjabi / Hindi / English"
        />

        {/* Voice Input */}
        <button
          onClick={startSTT}
          className="bg-gray-700 text-white px-4 py-3 rounded-lg"
        >
          🎤
        </button>

        <button
          onClick={sendMsg}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Send
        </button>
      </div>

      {loading && (
        <p className="text-center text-purple-600 mt-3">Thinking…</p>
      )}
    </div>
  );
};

export default ChatBot;
