import {NeuroScan_Prompt} from "../utils/NeuroScan-prompt";

export async function NeuroScanWithGemini(imageBuffer, model = "gemini-2.0-flash") {
    try {
        const base64Image = imageBuffer.toString("base64");
        const GEMINI_API_KEY = 'YOUR_GEMINI'

        const body = {
            contents: [
                {
                    parts: [
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: base64Image,
                            },
                        },
                        {
                            text: NeuroScan_Prompt,
                        },
                    ],
                },
            ],
        };

        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const json = await res.json();

        if (!json?.candidates?.[0]?.content?.parts) {
            console.error("Gemini API error:", json);
            return null;
        }

        const text = json.candidates[0].content.parts
            .map((p) => p.text || "")
            .join("")
            .trim();

        return text;
    } catch (error) {
        console.error("Gemini Skin Classification failed:", error);
        return null;
    }
}