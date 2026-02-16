const axios = require('axios');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

/**
 * Get an AI reply using Google Gemini REST API.
 *
 * @param {string} systemPrompt - How the AI should behave (tone, style, rules)
 * @param {string} context - Knowledge base the AI should use to answer questions
 * @param {Array<{role: string, content: string}>} conversationHistory - Past messages
 * @param {string} userMessage - The new incoming user message
 * @returns {Promise<string>} - The AI-generated reply text
 */
async function getReply(systemPrompt, context, conversationHistory, userMessage) {
    try {
        // Build the full system instruction combining prompt + context
        let systemInstruction = systemPrompt || 'You are a helpful assistant.';

        if (context && context.trim()) {
            systemInstruction += `\n\n--- KNOWLEDGE BASE ---\nUse the following information to answer questions. Only use this information when relevant:\n\n${context}`;
        }

        // Build conversation contents array
        const contents = [];

        // Add conversation history
        for (const msg of conversationHistory) {
            contents.push({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }],
            });
        }

        // Add the new user message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }],
        });

        // Call Gemini REST API
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

        // Extract the reply text
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        return reply || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (error) {
        const errMsg = error.response?.data?.error?.message || error.message;
        console.error('Gemini AI Error:', errMsg);

        if (errMsg?.includes('API key') || errMsg?.includes('API_KEY')) {
            return "I'm currently experiencing configuration issues. Please contact the page admin.";
        }

        if (errMsg?.includes('quota') || errMsg?.includes('429')) {
            return "I'm currently receiving too many requests. Please try again in a moment.";
        }

        return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.";
    }
}

module.exports = { getReply };
