const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
const openAIModel = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const geminiModelFallbacks = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];

if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY is missing. Set it in .env before using /api/chat.');
}

if (provider === 'gemini' && !process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is missing. Set it in .env before using /api/chat.');
}

const openAIClient = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => {
    res.json({ ok: true, provider });
});

const SYSTEM_PROMPT =
    'You are SugarCareDiabetes AI, a supportive assistant for diabetes awareness. Give practical, safe, concise advice and remind users to consult a healthcare professional for diagnosis or urgent concerns.';

const buildSafeHistory = (history) =>
    Array.isArray(history)
        ? history
            .filter(
                (item) =>
                    item &&
                    (item.role === 'user' || item.role === 'assistant') &&
                    typeof item.content === 'string'
            )
            .slice(-20)
        : [];

const requestOpenAIReply = async (message, safeHistory) => {
    if (!process.env.OPENAI_API_KEY || !openAIClient) {
        const error = new Error('Server API key is not configured for OpenAI.');
        error.status = 500;
        throw error;
    }

    const messages = [
        {
            role: 'system',
            content: SYSTEM_PROMPT
        },
        ...safeHistory,
        { role: 'user', content: message.trim() }
    ];

    const completion = await openAIClient.chat.completions.create({
        model: openAIModel,
        messages,
        temperature: 0.6
    });

    return completion?.choices?.[0]?.message?.content?.trim();
};

const requestGeminiReply = async (message, safeHistory) => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        const error = new Error('Server API key is not configured for Gemini.');
        error.status = 500;
        throw error;
    }

    const contents = [
        {
            role: 'user',
            parts: [{ text: `System instruction: ${SYSTEM_PROMPT}` }]
        },
        ...safeHistory.map((item) => ({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content }]
        })),
        {
            role: 'user',
            parts: [{ text: message.trim() }]
        }
    ];

    const normalizedConfiguredModel = String(geminiModel || '').replace(/^models\//, '');
    const modelCandidates = [normalizedConfiguredModel, ...geminiModelFallbacks].filter(
        (modelName, index, arr) => modelName && arr.indexOf(modelName) === index
    );

    let lastError = null;

    for (const apiVersion of ['v1', 'v1beta']) {
        for (const modelName of modelCandidates) {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/${apiVersion}/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents,
                        generationConfig: {
                            temperature: 0.6
                        }
                    })
                }
            );

            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                const parts = data?.candidates?.[0]?.content?.parts;
                if (!Array.isArray(parts)) {
                    return '';
                }

                return parts
                    .map((part) => (typeof part?.text === 'string' ? part.text : ''))
                    .join('')
                    .trim();
            }

            const error = new Error(
                data?.error?.message || data?.message || `Gemini API error: ${response.status}`
            );
            error.status = response.status;
            lastError = error;

            // Try the next model/version only for model-not-found style failures.
            const notFound =
                response.status === 404 ||
                /not found|not supported for generateContent/i.test(error.message || '');
            if (!notFound) {
                throw error;
            }
        }
    }

    throw lastError || new Error('Gemini API error: no supported model was available.');
};

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history } = req.body || {};

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'A valid message is required.' });
        }

        const safeHistory = buildSafeHistory(history);

        let reply = '';
        if (provider === 'gemini') {
            reply = await requestGeminiReply(message, safeHistory);
        } else {
            reply = await requestOpenAIReply(message, safeHistory);
        }

        if (!reply) {
            return res.status(502).json({ error: 'No response was returned by AI provider.' });
        }

        return res.json({ reply });
    } catch (error) {
        const statusCode = error && typeof error.status === 'number' ? error.status : 500;
        const errorMessage =
            error?.error?.message || error?.message || 'Unexpected server error while contacting AI.';

        console.error(`${provider.toUpperCase()} API error:`, errorMessage);
        return res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
            error: errorMessage
        });
    }
});

app.listen(port, () => {
    console.log(`Chat API server listening on http://127.0.0.1:${port}`);
});
