class GitHubAPI {
    constructor() {
        console.log('GitHubAPI initialisé (mode démo)');
    }
    
    async saveData(data) {
        console.log('Sauvegarde simulée:', data);
        return Promise.resolve();
    }
    
    async getAllData() {
        return Promise.resolve([]);
    }
    
    async getDataForDate(date) {
        return Promise.resolve([]);
    }
}
