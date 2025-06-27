class ChatGPTAPI {
    constructor() {
        this.apiKey = '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'; // À configurer
        this.baseURL = 'https://api.openai.com/v1/chat/completions';
    }

    async getFeedback(prompt) {
        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'Tu es un coach militaire français strict mais bienveillant. Tu tutoyez toujours, utilises un vocabulaire militaire, donnes des ordres clairs, maximum 80-100 mots par réponse, et utilises des emojis militaires (⚔️, 🎯, 💪, 🔥). Pas de suggestions molles, que des ordres directs et motivants.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.8
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API OpenAI: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content.trim();
        } catch (error) {
            console.error('Erreur ChatGPT:', error);
            // Feedback par défaut en cas d'erreur
            return this.getDefaultFeedback();
        }
    }

    getDefaultFeedback() {
        const defaultResponses = [
            "⚔️ Bien reçu soldat ! Continue sur ta lancée ! 🔥",
            "🎯 Parfait ! Garde cette discipline de fer ! 💪",
            "🔥 Excellent ! Tu es sur la bonne voie ! ⚔️",
            "💪 Solide performance ! Maintiens le cap ! 🎯",
            "⚔️ Impeccable ! Tu progresses bien ! 🔥"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
}
