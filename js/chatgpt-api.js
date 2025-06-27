class ChatGPTAPI {
    constructor() {
        console.log('ChatGPTAPI initialisé (mode démo)');
    }
    
    async getFeedback(prompt) {
        const responses = [
            "⚔️ Bien reçu soldat ! Continue ! 🔥",
            "🎯 Parfait ! Garde le rythme ! 💪",
            "🔥 Excellent ! En avant ! ⚔️"
        ];
        return Promise.resolve(responses[Math.floor(Math.random() * responses.length)]);
    }
}
