import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const socketRef = useRef(null);
  const streamBufferRef = useRef("");

  const [stream, setStream] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "ai_stream") {
        streamBufferRef.current += data.token;
        setStream(streamBufferRef.current);
      }

      if (data.type === "done") {
        const finalMessage = streamBufferRef.current;

        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: "ai", text: finalMessage },
        ]);

        streamBufferRef.current = "";
        setStream("");
      }
    };

    return () => socket.close();
  }, []);

  const send = () => {
    socketRef.current.send(
      JSON.stringify({
        type: "text",
        text: "hello",
      })
    );
  };

  return (
    <div className="app">
      <div className="chat-container">
        <h1>🎙 Realtime Voice Agent</h1>

        <button onClick={send} className="btn">
          Test AI
        </button>

        <div className="messages">
          {messages.map((m) => (
            <div key={m.id} className="message ai">
              {m.text}
            </div>
          ))}

          {stream && (
            <div className="message streaming">
              {stream}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;