export const handleSocket = (ws) => {
    console.log("Client connected");

    ws.on("message", async (msg) => {
        try {
            const data = JSON.parse(msg.toString());

            if (data.type === "text") {
                const reply = "Hello. Real-time agent connected.";

                for (let char of reply) {
                    await new Promise(r => setTimeout(r, 25));
                    ws.send(JSON.stringify({
                        type: "ai_stream",
                        token: char
                    }));
                }

                ws.send(JSON.stringify({ type: "done" }));
            }
        } catch {
            console.log("Binary/audio received");
        }
    });

    ws.on("close", () => console.log("Disconnected"));
};