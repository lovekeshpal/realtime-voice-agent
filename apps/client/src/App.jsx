import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useSpeechToText } from "./hooks/useSpeechToText";

function App() {
  const socketRef = useRef(null);
  const streamBufferRef = useRef("");

  const [stream, setStream] = useState("");
  const [messages, setMessages] = useState([]);

  // ----------------------------
  // WebSocket Setup
  // ----------------------------
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Streaming AI tokens
      if (data.type === "ai_stream") {
        streamBufferRef.current += data.token;
        setStream(streamBufferRef.current);
      }

      // AI finished streaming
      if (data.type === "done") {
        const finalMessage = streamBufferRef.current;

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            role: "ai",
            text: finalMessage,
          },
        ]);

        streamBufferRef.current = "";
        setStream("");
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => socket.close();
  }, []);

  // ----------------------------
  // Send Text to Server
  // ----------------------------
  const sendTextToServer = (text) => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      console.error("Socket not ready");
      return;
    }

    // Add user message to UI
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        role: "user",
        text,
      },
    ]);

    socketRef.current.send(
      JSON.stringify({
        type: "text",
        text,
      }),
    );
  };

  // ----------------------------
  // Manual Test Button
  // ----------------------------
  const sendTestMessage = () => {
    sendTextToServer("Hello");
  };

  // ----------------------------
  // Speech To Text Hook
  // ----------------------------
  const { startListening, stopListening, listening } =
    useSpeechToText(sendTextToServer);

  // ----------------------------
  // UI
  // ----------------------------
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
