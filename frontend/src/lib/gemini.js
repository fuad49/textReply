import axios from 'axios';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Get an AI reply using Google Gemini REST API.
 */
export async function getReply(systemPrompt, context, conversationHistory, userMessage) {
    try {
        let systemInstruction = systemPrompt || 'You are a helpful assistant.';

        if (context && context.trim()) {
            systemInstruction += `\n\n--- KNOWLEDGE BASE ---\nUse the following information to answer questions. Only use this information when relevant:\n\n${context}`;
        }

        const contents = [];

        for (const msg of conversationHistory) {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            });
        }

        contents.push({
            role: 'user',
            parts: [{ text: userMessage }],
        });

        const { data } = await axios.post(
            GEMINI_API_URL,
            {
                system_instruction: {
                    parts: [{ text: systemInstruction }],
                },
                contents,
                generationConfig: {
                    maxOutputTokens: 1024,
                    temperature: 0.7,
                    topP: 0.9,
                },
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': process.env.GEMINI_API_KEY,
                },
            }
        );

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return reply || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message;
        console.error('Gemini AI Error:', errMsg);

        if (errMsg?.includes('quota') || errMsg?.includes('429')) {
            return "I'm currently receiving too many requests. Please try again in a moment.";
        }

        return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.";
    }
}
