import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useSpeechToText } from "./hooks/useSpeechToText";
import { useSpeech } from "./hooks/useSpeech";

function App() {
  const socketRef = useRef(null);
  const streamBufferRef = useRef("");
  const pendingQueueRef = useRef([]);

  const [stream, setStream] = useState("");
  const [messages, setMessages] = useState([]);
  const [socketReady, setSocketReady] = useState(false);

  // ----------------------------
  // WebSocket setup
  // ----------------------------
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
      setSocketReady(true);

      // flush queued messages
      pendingQueueRef.current.forEach((msg) => {
        socket.send(msg);
      });
      pendingQueueRef.current = [];
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "ai_stream") {
        streamBufferRef.current += data.token;
        setStream(streamBufferRef.current);
      }

      if (data.type === "done") {
        const final = streamBufferRef.current;

        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: "ai", text: final },
        ]);

        // 🔊 AI SPEAKS HERE
        speak(final);

        streamBufferRef.current = "";
        setStream("");
      }
    };

    socket.onclose = () => {
      console.log("Socket closed");
      setSocketReady(false);
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setSocketReady(false);
    };

    return () => socket.close();
  }, []);

  // ----------------------------
  // Send text safely
  // ----------------------------
  const sendTextToServer = (text) => {
    const payload = JSON.stringify({
      type: "text",
      text,
    });

    // add user bubble immediately
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text }]);

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(payload);
    } else {
      console.log("Socket not ready → queueing message");
      pendingQueueRef.current.push(payload);
    }
  };

  const sendTestMessage = () => {
    sendTextToServer("Hello from button");
  };

  // ----------------------------
  // speech hook
  // ----------------------------
  const { startListening, stopListening, listening } = useSpeechToText(
    (text) => {
      stop(); // stop AI voice when user speaks
      sendTextToServer(text);
    },
  );

  const { speak, stop } = useSpeech();

  return (
    <div className="app">
      <div className="chat-container">
        <h1>🎙 Realtime Voice Agent</h1>

        <button className="btn" onClick={sendTestMessage}>
          Test AI
        </button>

        <button className="btn" onClick={startListening}>
          {listening ? "🎙 Listening..." : "🎤 Start Talking"}
        </button>

        <button className="btn" onClick={stopListening}>
          ⛔ Stop
        </button>

        <div className="messages">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`message ${m.role === "user" ? "user" : "ai"}`}
            >
              {m.text}
            </div>
          ))}

          {stream && <div className="message streaming">{stream}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;
