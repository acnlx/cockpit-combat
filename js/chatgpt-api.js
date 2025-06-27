class ChatGPTAPI {
    constructor() {
        this.apiKey = localStorage.getItem('openai_key') || null;
        this.memory = new PersistentMemory();
        this.feedbackCache = new Map();
    }

    async getFeedback(prompt, context = {}) {
        try {
            // Utiliser la mémoire persistante pour une réponse contextuelle
            const response = await this.memory.getContextualResponse(prompt, context);
            return response;
            
        } catch (error) {
            console.error('Erreur mémoire persistante:', error);
            // Fallback vers l'API classique
            return await this.getFallbackFeedback(prompt);
        }
    }

    async getFallbackFeedback(prompt) {
        // Timeout de 5 secondes max
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
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
                    max_tokens: 80,
                    temperature: 0.7
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const data = await response.json();
            return data.choices[0].message.content.trim();
            
        } catch (error) {
            console.error('Erreur ChatGPT fallback:', error);
            return this.getDefaultFeedback();
        }
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
