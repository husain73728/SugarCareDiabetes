document.addEventListener('DOMContentLoaded', () => {
    // 1. Precise Cleanup of Legacy Static Chatbots
    const oldChats = document.querySelectorAll('div.fixed.bottom-8, div.fixed.bottom-10, button.fixed.bottom-8');
    oldChats.forEach(el => {
        if(el.id !== 'ai-chatbot-app' && el.innerHTML.includes('smart_toy')) {
            el.remove();
        }
    });

    // 2. Add Animations for Chat Bubbles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .glass-chat {
            background: rgba(255, 255, 255, 0.98);
            border: 1px solid rgba(255, 255, 255, 0.7);
            box-shadow: 0 24px 60px rgba(27, 67, 50, 0.16);
        }
        @media (prefers-color-scheme: dark) {
            .glass-chat {
                background: rgba(248, 252, 250, 0.98);
                border: 1px solid rgba(255, 255, 255, 0.82);
            }
        }
    `;
    document.head.appendChild(style);

    // 3. Inject New Interactive Chatbot UI
    const chatHTML = `
        <div id="ai-chatbot-app" class="fixed bottom-8 right-8 z-[9999] flex flex-col items-end pointer-events-none font-body">
            
            <!-- Chat Window -->
            <div id="chat-window" class="glass-chat backdrop-blur-3xl w-[350px] sm:w-[380px] max-h-[600px] h-[70vh] rounded-[2rem] shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden transition-all duration-300 transform scale-0 origin-bottom-right opacity-0 pointer-events-auto mb-4">
                
                <!-- Header -->
                <div class="bg-gradient-to-r from-primary-container/75 to-white/95 border-b border-outline-variant/20 px-6 py-4 flex justify-between items-center backdrop-blur-md">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-dark-green rounded-full flex items-center justify-center shadow-md">
                            <span class="material-symbols-outlined text-white text-xl" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
                        </div>
                        <div>
                            <h3 class="font-headline font-bold text-dark-green text-sm">SugarCareDiabetes AI</h3>
                            <p class="text-[10px] text-dark-green/75 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online Pipeline</p>
                        </div>
                    </div>
                    <button id="close-chat" class="w-8 h-8 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center transition-colors">
                        <span class="material-symbols-outlined text-on-surface-variant text-sm">close</span>
                    </button>
                </div>

                <!-- Chat Log -->
                <div id="chat-log" class="flex-1 overflow-y-auto p-6 space-y-5 bg-gradient-to-b from-transparent to-surface-container-lowest/50 flex flex-col">
                    <div class="flex gap-3 max-w-[85%]">
                        <div class="w-8 h-8 rounded-full bg-primary/20 shrink-0 flex items-center justify-center mt-1">
                            <span class="material-symbols-outlined text-primary text-sm">smart_toy</span>
                        </div>
                        <div class="bg-surface-container shadow-sm p-4 rounded-2xl rounded-tl-sm text-sm text-on-surface leading-relaxed">
                            Hello! I am your SugarCareDiabetes clinical assistant. How can I map your health journey today?
                        </div>
                    </div>
                </div>
                
                <!-- Input Area -->
                <div class="p-4 bg-surface-container-lowest border-t border-outline-variant/20">
                    <form id="chat-form" class="flex gap-2 relative">
                        <input id="chat-input" type="text" placeholder="Type a message..." class="w-full bg-surface-container-low text-on-surface border-none rounded-full py-3.5 pl-6 pr-14 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all hover:bg-surface-variant outline-none placeholder:text-outline" autocomplete="off">
                        <button type="submit" class="absolute right-1 top-1 bottom-1 w-11 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:scale-[1.05] active:scale-95 transition-all outline-none">
                            <span class="material-symbols-outlined text-sm translate-x-[1px]">send</span>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Floating Toggle Button -->
            <button id="chat-toggle" class="relative group w-[68px] h-[68px] bg-dark-green text-white rounded-full shadow-[0_12px_40px_rgba(27,67,50,0.35)] flex items-center justify-center hover:scale-[1.05] active:scale-95 transition-all pointer-events-auto border border-white/10 z-50">
                <span class="absolute inset-0 bg-dark-green rounded-full animate-ping opacity-20 group-hover:opacity-40 transition-opacity"></span>
                <span class="material-symbols-outlined text-[32px] transition-transform duration-300" id="chat-icon-toggle" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
            </button>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatHTML);

    // 4. Interface State Management
    const toggleBtn = document.getElementById('chat-toggle');
    const closeBtn = document.getElementById('close-chat');
    const windowEl = document.getElementById('chat-window');
    const iconEl = document.getElementById('chat-icon-toggle');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatLog = document.getElementById('chat-log');
    let isOpen = false;

    const toggleChat = () => {
        isOpen = !isOpen;
        if (isOpen) {
            windowEl.classList.remove('scale-0', 'opacity-0');
            windowEl.classList.add('scale-100', 'opacity-100');
            iconEl.textContent = 'keyboard_arrow_down';
            iconEl.classList.add('rotate-180');
            setTimeout(() => chatInput.focus(), 300);
        } else {
            windowEl.classList.add('scale-0', 'opacity-0');
            windowEl.classList.remove('scale-100', 'opacity-100');
            iconEl.textContent = 'smart_toy';
            iconEl.classList.remove('rotate-180');
        }
    };

    toggleBtn.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);

    // 5. Message Processing
    const appendMessage = (text, isUser = false) => {
        const bubble = document.createElement('div');
        bubble.className = `flex gap-3 max-w-[85%] animate-fade-in-up ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`;
        
        let avatar = '';
        if (!isUser) {
            avatar = `<div class="w-8 h-8 rounded-full bg-primary/20 shrink-0 flex items-center justify-center mt-1"><span class="material-symbols-outlined text-primary text-sm">smart_toy</span></div>`;
        }

        bubble.innerHTML = `
            ${avatar}
            <div class="${isUser ? 'bg-primary text-white rounded-tr-sm shadow-md' : 'bg-surface-container shadow-sm text-on-surface rounded-tl-sm'} px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed break-words">
                ${text}
            </div>
        `;
        
        chatLog.appendChild(bubble);
        chatLog.scrollTop = chatLog.scrollHeight;
    };

    const showTypingIndicator = () => {
        const id = 'typing-' + Date.now();
        const bubble = document.createElement('div');
        bubble.id = id;
        bubble.className = `flex gap-3 max-w-[85%] self-start animate-fade-in-up`;
        bubble.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-primary/20 shrink-0 flex items-center justify-center mt-1"><span class="material-symbols-outlined text-primary text-sm">smart_toy</span></div>
            <div class="bg-surface-container shadow-sm px-4 py-4 rounded-2xl rounded-tl-sm text-sm flex items-center gap-1.5 min-w-[70px] justify-center">
                <span class="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
                <span class="w-1.5 h-1.5 bg-on-surface-variant/50 rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
            </div>
        `;
        chatLog.appendChild(bubble);
        chatLog.scrollTop = chatLog.scrollHeight;
        return id;
    };

    const removeTypingIndicator = (id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
    };

    // 6. Simulated AI Intelligence (kept commented out for fallback/reference)
    /*
    const getMockAIResponse = (query) => {
        const q = query.toLowerCase();
        if (q.includes('hello')) return "Greetings! I'm here to help manage your health. Should we look into adjusting your diet or adding an exercise routine?";
        if (q.includes('diet') || q.includes('food') || q.includes('eat')) return "Based on contemporary neurological nutrition data, adopting a Mediterranean-style diet high in omega-3s drastically supports cognitive function and stabilizes circulating glucose.";
        if (q.includes('exercise') || q.includes('workout') || q.includes('gym')) return "Just 20 minutes of moderate aerobic workouts like swimming or cycling effectively increases insulin sensitivity. Visit our Exercise tab for step-by-step guides!";
        if (q.includes('sugar') || q.includes('diabetes') || q.includes('blood')) return "Your biometrics look stable, but if you want robust forecasting, navigate to our Prediction model to analyze exact statistical risks.";
        if (q.includes('price') || q.includes('cost') || q.includes('pro')) return "We offer a Free basic tier to track daily variables, and a $29/mo Pro tier that streams data directly from Apple Health and Garmin wearables.";
        if (q.includes('low')||q.includes('low risk')||q.includes('reason for low risk')) return "Your current health metrics indicate a low risk of diabetes complications. This is likely due to your consistent physical activity and balanced diet, which help maintain stable blood sugar levels.";
        if (q.includes('high')||q.includes('high risk')||q.includes('reason for high risk')) return "Your current health metrics indicate a high risk of diabetes complications. This may be due to elevated blood sugar levels and low physical activity. I recommend consulting with a healthcare provider for personalized advice.";
        if (q.includes('moderate')||q.includes('moderate risk')||q.includes('reason for moderate risk')) return "Your current health metrics indicate a moderate risk of diabetes complications. This could be due to occasional elevated blood sugar levels or inconsistent physical activity. Consider making lifestyle adjustments and consulting with a healthcare provider for personalized advice.";
        return "That's an excellent question. While I'm operating as a simulated assistant right now to demonstrate the UI, you can seamlessly plug a real LLM API (like OpenAI) into my code to generate live inferences!";
    };
    */

    const API_ENDPOINT = window.CHATBOT_API_ENDPOINT || 'http://127.0.0.1:3001/api/chat';
    const conversationHistory = [];

    const getAIResponse = async (query) => {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: query,
                history: conversationHistory
            })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const detail = data && data.error ? ` (${data.error})` : '';
            throw new Error(`Chat API error: ${response.status}${detail}`);
        }

        if (!data.reply || typeof data.reply !== 'string') {
            throw new Error('Invalid AI response format from backend.');
        }

        return data.reply;
    };

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg) return;
        
        // Disable input
        chatInput.value = '';
        chatInput.disabled = true;

        // User message
        appendMessage(msg, true);

        // UI Loading State
        const typingId = showTypingIndicator();

        try {
            const response = await getAIResponse(msg);
            conversationHistory.push({ role: 'user', content: msg });
            conversationHistory.push({ role: 'assistant', content: response });
            if (conversationHistory.length > 20) {
                conversationHistory.splice(0, conversationHistory.length - 20);
            }

            removeTypingIndicator(typingId);
            appendMessage(response, false);
        } catch (error) {
            console.error('Chat request failed:', error);
            removeTypingIndicator(typingId);
            const details = String(error && error.message ? error.message : '').toLowerCase();
            let userFacingError = "I couldn't reach the AI service right now. Please try again in a moment.";

            if (details.includes('429') || details.includes('quota') || details.includes('rate limit')) {
                userFacingError = 'The AI API quota/rate limit was reached. Please check your provider billing/limits and try again.';
            } else if (details.includes('401') || details.includes('incorrect api key') || details.includes('unauthorized')) {
                userFacingError = 'The AI provider API key is invalid or expired. Update your .env key and restart the API server.';
            }

            appendMessage(userFacingError, false);
        } finally {
            // Re-enable
            chatInput.disabled = false;
            chatInput.focus();
        }
    });
});
