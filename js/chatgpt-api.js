// js/chatgpt-api.js - OPTIMISÉ
class ChatGPTAPI {
    constructor() {
        this.apiKey = localStorage.getItem('openai_key') || null;
        this.feedbackCache = new Map();
    }

    async getFeedback(prompt) {
        // ✅ Cache des réponses similaires
        const promptHash = this.hashPrompt(prompt);
        if (this.feedbackCache.has(promptHash)) {
            console.log('💨 Feedback depuis cache');
            return this.feedbackCache.get(promptHash);
        }

        try {
            // ✅ Timeout de 5 secondes max
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo', // ✅ Plus rapide que GPT-4
                    messages: [
                        {
                            role: 'system',
                            content: 'Coach militaire français. Réponse en 50 mots max. Vocabulaire militaire, tutoiement, emojis ⚔️🎯💪🔥.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 80, // ✅ Limité pour plus de rapidité
                    temperature: 0.7
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            const feedback = data.choices[0].message.content.trim();
            
            // ✅ Mettre en cache
            this.feedbackCache.set(promptHash, feedback);
            
            return feedback;
            
        } catch (error) {
            console.error('Erreur ChatGPT:', error);
            return this.getDefaultFeedback();
        }
    }

    hashPrompt(prompt) {
        // Simple hash pour cache
        return prompt.substring(0, 50).replace(/\s+/g, '');
    }

    getDefaultFeedback() {
        const responses = [
            "⚔️ Reçu soldat ! Continue ! 🔥",
            "🎯 Bien ! Garde le rythme ! 💪",
            "🔥 Parfait ! En avant ! ⚔️"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }
}
