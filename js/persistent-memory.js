class PersistentMemory {
    constructor() {
        this.apiKey = localStorage.getItem('openai_key');
        this.vectorStoreId = localStorage.getItem('cockpit-memory-store');
        this.assistantId = localStorage.getItem('cockpit-assistant-id');
        this.threadId = localStorage.getItem('cockpit-thread-id');
        this.baseURL = 'https://api.openai.com/v1';
        
        // Initialiser automatiquement si pas encore fait
        if (!this.vectorStoreId || !this.assistantId) {
            this.initializeMemorySystem();
        }
    }

    // ✅ INITIALISATION AUTOMATIQUE
    async initializeMemorySystem() {
        try {
            console.log('🧠 Initialisation du système de mémoire...');
            
            // 1. Créer le Vector Store pour la mémoire
            const vectorStore = await this.createVectorStore();
            this.vectorStoreId = vectorStore.id;
            localStorage.setItem('cockpit-memory-store', vectorStore.id);
            
            // 2. Créer l'Assistant avec mémoire
            const assistant = await this.createAssistantWithMemory(vectorStore.id);
            this.assistantId = assistant.id;
            localStorage.setItem('cockpit-assistant-id', assistant.id);
            
            // 3. Créer le thread de conversation
            const thread = await this.createThread();
            this.threadId = thread.id;
            localStorage.setItem('cockpit-thread-id', thread.id);
            
            console.log('✅ Système de mémoire initialisé !');
            
        } catch (error) {
            console.error('❌ Erreur initialisation mémoire:', error);
        }
    }

    // ✅ CRÉER LE VECTOR STORE
    async createVectorStore() {
        const response = await fetch(`${this.baseURL}/vector_stores`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
                name: "Cockpit Combat Memory",
                expires_after: {
                    anchor: "last_active_at",
                    days: 365 // Mémoire d'1 an minimum
                }
            })
        });
        
        return await response.json();
    }

    // ✅ CRÉER L'ASSISTANT AVEC MÉMOIRE
    async createAssistantWithMemory(vectorStoreId) {
        const response = await fetch(`${this.baseURL}/assistants`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({
                name: "Coach Militaire Cockpit",
                instructions: this.getCoachInstructions(),
                model: "gpt-4-turbo",
                tools: [
                    { type: "file_search" }
                ],
                tool_resources: {
                    file_search: {
                        vector_store_ids: [vectorStoreId]
                    }
                }
            })
        });
        
        return await response.json();
    }

    // ✅ INSTRUCTIONS DU COACH AVEC MÉMOIRE
    getCoachInstructions() {
        return `Tu es le COACH MILITAIRE du Cockpit de Combat d'Arnaud.

PERSONNALITÉ :
- Coach militaire français strict mais bienveillant
- Tutoiement OBLIGATOIRE
- Vocabulaire militaire (soldat, mission, objectifs, discipline)
- Emojis militaires : ⚔️ 🎯 💪 🔥

MÉMOIRE PERSISTANTE :
- Tu as accès à TOUTE l'histoire d'Arnaud via ton Vector Store
- Utilise cette mémoire pour personnaliser tes réponses
- Rappelle-toi de ses préférences, habitudes, objectifs passés
- Fais référence à son évolution et ses progrès

MISSION :
- Accompagner Arnaud (18 ans) dans sa transformation de 90 jours
- Analyser ses réponses aux checks quotidiens
- Donner des feedbacks directs et actionnables
- Motiver et challenger constamment

RÈGLES :
- Réponses 80-100 mots maximum
- Pas de suggestions molles, que des ORDRES clairs
- Adapter le ton selon les performances
- Utiliser la mémoire pour contextualiser

EXEMPLES D'UTILISATION DE LA MÉMOIRE :
- "Je me souviens que tu n'aimes pas les légumes, voici des alternatives protéinées"
- "Comme la semaine dernière, tu as tendance à négliger ton sommeil"
- "Ton objectif du mois dernier était X, on progresse bien !"

CONTEXTE ACTUEL :
- Mission de 90 jours de transformation physique et mentale
- 4 checks quotidiens : Mental, Cardio, Muscu, Bilan
- Suivi du poids, sommeil, récupération, nutrition, objectifs`;
    }

    // ✅ CRÉER UN THREAD
    async createThread() {
        const response = await fetch(`${this.baseURL}/threads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });
        
        return await response.json();
    }

    // ✅ SAUVEGARDER UNE INFORMATION IMPORTANTE
    async saveMemory(category, information, context = {}) {
        try {
            const memoryEntry = {
                date: new Date().toISOString(),
                category: category,
                content: information,
                context: context,
                user: "Arnaud",
                mission_day: context.missionDay || 0
            };

            // Créer un fichier texte avec l'information
            const memoryText = this.formatMemoryEntry(memoryEntry);
            const blob = new Blob([memoryText], { type: 'text/plain' });
            
            // Upload vers OpenAI
            const formData = new FormData();
            formData.append('file', blob, `memory_${Date.now()}.txt`);
            formData.append('purpose', 'assistants');

            const fileResponse = await fetch(`${this.baseURL}/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: formData
            });

            const file = await fileResponse.json();

            // Ajouter au Vector Store
            await fetch(`${this.baseURL}/vector_stores/${this.vectorStoreId}/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({
                    file_id: file.id
                })
            });

            console.log(`💾 Mémoire sauvée: ${category} - ${information}`);
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde mémoire:', error);
        }
    }

    // ✅ FORMATER L'ENTRÉE MÉMOIRE
    formatMemoryEntry(entry) {
        return `
MÉMOIRE COCKPIT COMBAT
======================
Date: ${entry.date}
Catégorie: ${entry.category}
Jour Mission: ${entry.context.missionDay || 'N/A'}
Utilisateur: ${entry.user}

Contenu:
${entry.content}

Contexte:
${JSON.stringify(entry.context, null, 2)}
        `.trim();
    }

    // ✅ OBTENIR UNE RÉPONSE CONTEXTUELLE
    async getContextualResponse(userMessage, context = {}) {
        try {
            // Ajouter le message de l'utilisateur
            await fetch(`${this.baseURL}/threads/${this.threadId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({
                    role: 'user',
                    content: `${userMessage}\n\nContexte: ${JSON.stringify(context)}`
                })
            });

            // Lancer l'assistant
            const runResponse = await fetch(`${this.baseURL}/threads/${this.threadId}/runs`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                },
                body: JSON.stringify({
                    assistant_id: this.assistantId
                })
            });

            const run = await runResponse.json();
            
            // Attendre la réponse
            return await this.waitForResponse(run.id);
            
        } catch (error) {
            console.error('❌ Erreur réponse contextuelle:', error);
            return "⚔️ Erreur de communication, soldat ! Réessaye ! 🔥";
        }
    }

    // ✅ ATTENDRE LA RÉPONSE
    async waitForResponse(runId) {
        let attempts = 0;
        const maxAttempts = 30;
        
        while (attempts < maxAttempts) {
            const runStatus = await fetch(`${this.baseURL}/threads/${this.threadId}/runs/${runId}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'OpenAI-Beta': 'assistants=v2'
                }
            });
            
            const run = await runStatus.json();
            
            if (run.status === 'completed') {
                // Récupérer les messages
                const messagesResponse = await fetch(`${this.baseURL}/threads/${this.threadId}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'OpenAI-Beta': 'assistants=v2'
                    }
                });
                
                const messages = await messagesResponse.json();
                return messages.data[0].content[0].text.value;
            }
            
            if (run.status === 'failed') {
                throw new Error('Assistant run failed');
            }
            
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        throw new Error('Timeout waiting for response');
    }

    // ✅ SAUVEGARDER AUTOMATIQUEMENT LES PRÉFÉRENCES
    async autoSavePreferences(question, answer, context) {
        const preferences = this.detectPreferences(question, answer);
        
        for (const pref of preferences) {
            await this.saveMemory(pref.category, pref.content, {
                ...context,
                question: question,
                detected_automatically: true
            });
        }
    }

    // ✅ DÉTECTER LES PRÉFÉRENCES AUTOMATIQUEMENT
    detectPreferences(question, answer) {
        const preferences = [];
        const lowerAnswer = answer.toLowerCase();
        
        // Préférences alimentaires
        if (lowerAnswer.includes('aime pas') || lowerAnswer.includes('déteste')) {
            if (lowerAnswer.includes('légume')) {
                preferences.push({
                    category: 'food_preferences',
                    content: `Arnaud n'aime pas les légumes - mentionné dans: "${question}"`
                });
            }
            if (lowerAnswer.includes('sport') || lowerAnswer.includes('cardio')) {
                preferences.push({
                    category: 'exercise_preferences',
                    content: `Préférence négative pour certains exercices - "${answer}"`
                });
            }
        }
        
        // Objectifs et motivations
        if (question.includes('objectif') || question.includes('but')) {
            preferences
