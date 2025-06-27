class GitHubAPI {
    constructor() {
        // Configuration GitHub - À personnaliser
        this.config = {
            owner: 'acnlx',
            repo: 'cockpit-combat',
            token: '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',
            dataPath: 'data/cockpit-data.json'
        };
        
        this.baseURL = 'https://api.github.com';
    }

    async saveData(newData) {
        try {
            // Récupérer le fichier existant
            const existingData = await this.getExistingData();
            
            // Ajouter les nouvelles données
            existingData.push(newData);
            
            // Sauvegarder le fichier mis à jour
            await this.updateFile(existingData);
            
            return true;
        } catch (error) {
            console.error('Erreur sauvegarde GitHub:', error);
            throw error;
        }
    }

    async getExistingData() {
        try {
            const response = await fetch(`${this.baseURL}/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.dataPath}`, {
                headers: {
                    'Authorization': `token ${this.config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.status === 404) {
                // Fichier n'existe pas encore
                return [];
            }

            if (!response.ok) {
                throw new Error(`Erreur GitHub API: ${response.status}`);
            }

            const fileData = await response.json();
            const content = atob(fileData.content);
            return JSON.parse(content);
        } catch (error) {
            console.error('Erreur lecture données:', error);
            return [];
        }
    }

    async updateFile(data) {
        const content = btoa(JSON.stringify(data, null, 2));
        const message = `Update cockpit data - ${new Date().toISOString()}`;

        // Récupérer le SHA du fichier existant
        let sha = null;
        try {
            const response = await fetch(`${this.baseURL}/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.dataPath}`, {
                headers: {
                    'Authorization': `token ${this.config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const fileData = await response.json();
                sha = fileData.sha;
            }
        } catch (error) {
            console.log('Fichier n\'existe pas encore, création...');
        }

        // Créer ou mettre à jour le fichier
        const updateData = {
            message: message,
            content: content
        };

        if (sha) {
            updateData.sha = sha;
        }

        const response = await fetch(`${this.baseURL}/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.dataPath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.config.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            throw new Error(`Erreur mise à jour fichier: ${response.status}`);
        }

        return await response.json();
    }

    async getDataForDate(date) {
        const allData = await this.getExistingData();
        return allData.filter(item => item.date === date);
    }

    async getAllData() {
        return await this.getExistingData();
    }

    async checkRecoveryPattern() {
        const allData = await this.getExistingData();
        const recoveryData = allData
            .filter(item => item.question_id === 'recovery')
            .slice(-3) // 3 derniers jours
            .map(item => parseInt(item.answer));

        if (recoveryData.length === 3) {
            const average = recoveryData.reduce((a, b) => a + b, 0) / 3;
            return average < 4;
        }

        return false;
    }
}
