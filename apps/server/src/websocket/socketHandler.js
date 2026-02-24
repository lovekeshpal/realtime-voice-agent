import { streamFromAI } from "../services/ai.service.js";

export const handleSocket = (ws) => {
    console.log("Client connected");

    ws.on("message", async (message) => {
        let data;

        // -------------------------
        // Safe JSON parsing
        // -------------------------
        try {
            data = JSON.parse(message.toString());
        } catch (err) {
            console.error("Invalid JSON received");
            return;
        }

        // -------------------------
        // TEXT MESSAGE FROM CLIENT
        // -------------------------
        if (data.type === "text") {
            const userText = data.text;
            if (!userText) return;

            console.log("User said:", userText);

            try {
                // -------------------------
                // STREAM FROM OPENROUTER
                // -------------------------
                await streamFromAI(userText, (token) => {
                    ws.send(JSON.stringify({
                        type: "ai_stream",
                        token
                    }));
                });

                // streaming finished
                ws.send(JSON.stringify({ type: "done" }));
            } catch (err) {
                console.error("Gemini streaming error:", err);

                // fallback response (so server never crashes)
                ws.send(
                    JSON.stringify({
                        type: "ai_stream",
                        token: "⚠️ AI error. Check API key or server logs.",
                    })
                );

                ws.send(JSON.stringify({ type: "done" }));
            }
        }
    });

    ws.on("close", () => {
        console.log("Client disconnected");
    });

    ws.on("error", (err) => {
        console.error("WebSocket error:", err);
    });
};