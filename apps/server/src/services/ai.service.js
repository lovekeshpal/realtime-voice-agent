import fetch from "node-fetch";

export const streamFromAI = async (text, onToken) => {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            messages: [
                {
                    role: "system",
                    content: "You are a concise AI voice assistant. Respond clearly and briefly."
                },
                {
                    role: "user",
                    content: text
                }
            ],
            stream: true
        })
    });

    for await (const chunk of res.body) {
        const str = chunk.toString();

        const lines = str.split("\n").filter(l => l.startsWith("data:"));

        for (const line of lines) {
            const json = line.replace("data: ", "").trim();
            if (json === "[DONE]") return;

            try {
                const parsed = JSON.parse(json);
                const token = parsed.choices?.[0]?.delta?.content;
                if (token) onToken(token);
            } catch { }
        }
    }
};