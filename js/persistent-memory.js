// js/persistent-memory.js - NOUVEAU FICHIER
class PersistentMemory {
    constructor() {
        this.apiKey = localStorage.getItem('openai_key');
        this.vectorStoreId = localStorage.getItem('memory-store-id');
        this.assistantId = localStorage.getItem('assistant-id');
    }

    // Sauvegarder une information importante
    async saveMemory(category, information) {
        const memoryEntry = {
            date: new Date().toISOString(),
            category: category, // "preferences", "habits", "goals", etc.
            content: information,
            user: "Arnaud"
        };

        // Créer un document dans le Vector Store
        await fetch('https://api.openai.com/v1/vector_stores/' + this.vectorStoreId + '/files', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
                file_id: await this.createMemoryFile(memoryEntry)
            })
        });
    }

    // L'assistant se souvient automatiquement grâce au Vector Store
    async getContextualResponse(userMessage) {
        // L'assistant accède automatiquement à toute la mémoire
        const response = await fetch('https://api.openai.com/v1/threads/' + this.threadId + '/messages', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
                role: 'user',
                content: userMessage
            })
        });

        // L'assistant cherche automatiquement dans sa mémoire
        return this.runAssistant();
    }
}
