class CockpitCombat {
    constructor() {
        this.currentCheck = null;
        this.questions = this.initializeQuestions();
        this.currentQuestionIndex = 0;
        this.githubAPI = new GitHubAPI();
        this.chatGPT = new ChatGPTAPI();
        this.charts = new ChartsManager();
        
        this.init();
    }

    init() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.initializeTheme();
                this.updateMissionProgress();
                this.showHomePage();
            });
        } else {
            this.setupEventListeners();
            this.initializeTheme();
            this.updateMissionProgress();
            this.showHomePage();
        }
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('cockpit-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (systemPrefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
        }
        
        this.updateThemeIcon();
    }

    setupEventListeners() {
        // Attendre que les éléments existent
        setTimeout(() => {
            // Navigation - CORRIGÉ
            const navBtns = document.querySelectorAll('.nav-btn');
            navBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const checkType = e.target.closest('.nav-btn').dataset.check;
                    console.log('Navigation vers:', checkType); // Debug
                    
                    if (checkType === 'stats') {
                        this.showStats();
                    } else if (checkType === 'home') {
                        this.showHomePage();
                    } else {
                        this.loadCheck(checkType);
                    }
                });
            });

            // Thème toggle - CORRIGÉ
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleTheme();
                });
            }

            // Modal - CORRIGÉ
            const closeBtn = document.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    document.getElementById('dataModal').style.display = 'none';
                });
            }
        }, 100);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('cockpit-theme', newTheme);
        
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const themeIcon = document.querySelector('#themeToggle i');
        
        if (currentTheme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    updateMissionProgress() {
        const startDate = new Date('2025-06-26');
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const missionDay = Math.min(diffDays, 90);
        
        document.getElementById('missionDay').textContent = missionDay;
        
        const progress = (missionDay / 90) * 100;
        document.getElementById('missionProgress').style.width = `${progress}%`;
    }

    determineCurrentCheck() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const currentTime = hour + minute / 60;

        if (currentTime >= 7 && currentTime < 8.5) {
            this.currentCheck = 'mental';
        } else if (currentTime >= 8.5 && currentTime < 13) {
            this.currentCheck = 'cardio';
        } else if (currentTime >= 13 && currentTime < 20) {
            this.currentCheck = 'muscu';
        } else if (currentTime >= 20 || currentTime < 7) {
            this.currentCheck = 'bilan';
        } else {
            this.currentCheck = 'mental'; // Par défaut
        }
    }

    async showHomePage() {
        this.currentCheck = 'home';
        this.updateActiveNav();
        
        const container = document.getElementById('checkContainer');
        container.innerHTML = `
            <div class="home-container">
                <div class="welcome-section">
                    <h2>BIENVENUE SOLDAT ARNAUD</h2>
                    <p class="mission-status">Mission en cours - Transformation 90 jours</p>
                </div>
                
                <div class="daily-objectives" id="dailyObjectives">
                    <h3><i class="fas fa-bullseye"></i> OBJECTIFS DU JOUR</h3>
                    <div class="loading-objectives">
                        <div class="loading"></div>
                        <p>Génération des objectifs par l'IA...</p>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <h3><i class="fas fa-rocket"></i> ACTIONS RAPIDES</h3>
                    <div class="action-grid">
                        <button class="action-card" onclick="app.loadCheck('mental')">
                            <i class="fas fa-brain"></i>
                            <span>Check Mental</span>
                            <small>07h00</small>
                        </button>
                        <button class="action-card" onclick="app.loadCheck('cardio')">
                            <i class="fas fa-heartbeat"></i>
                            <span>Cardio & Poids</span>
                            <small>08h30</small>
                        </button>
                        <button class="action-card" onclick="app.loadCheck('muscu')">
                            <i class="fas fa-dumbbell"></i>
                            <span>Musculation</span>
                            <small>13h00</small>
                        </button>
                        <button class="action-card" onclick="app.loadCheck('bilan')">
                            <i class="fas fa-chart-line"></i>
                            <span>Bilan Journée</span>
                            <small>20h00</small>
                        </button>
                    </div>
                </div>
                
                <div class="daily-stats">
                    <h3><i class="fas fa-chart-bar"></i> PROGRESSION AUJOURD'HUI</h3>
                    <div class="stats-cards" id="dailyStatsCards">
                        <div class="stat-card">
                            <div class="stat-value" id="completedChecks">0/4</div>
                            <div class="stat-label">Checks Complétés</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="currentStreak">0</div>
                            <div class="stat-label">Jours Consécutifs</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="weekProgress">0%</div>
                            <div class="stat-label">Semaine</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        await this.generateDailyObjectives();
        await this.loadDailyStats();
    }

    async generateDailyObjectives() {
        try {
            const today = new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });

            const prompt = `Tu es un coach militaire français strict mais bienveillant pour Arnaud, 18 ans, en mission de transformation de 90 jours.

Génère exactement 4 objectifs SMART pour aujourd'hui (${today}). 

Format OBLIGATOIRE - Réponds UNIQUEMENT avec cette structure JSON :
{
  "objectives": [
    "Objectif 1 précis et actionnable",
    "Objectif 2 précis et actionnable", 
    "Objectif 3 précis et actionnable",
    "Objectif 4 précis et actionnable"
  ]
}

Règles:
- Vocabulaire militaire motivant
- Tutoiement
- Objectifs concrets et mesurables
- Maximum 15 mots par objectif
- Pas d'emojis dans les objectifs (ils seront ajoutés automatiquement)

Contexte: C'est le jour ${this.getMissionDay()}/90 de sa mission.`;

            const response = await this.chatGPT.getFeedback(prompt);
            
            // Parser la réponse JSON
            let objectivesData;
            try {
                objectivesData = JSON.parse(response);
            } catch (e) {
                // Si l'IA ne respecte pas le format JSON, utiliser des objectifs par défaut
                objectivesData = {
                    objectives: [
                        "Compléter tous les checks quotidiens sans exception",
                        "Maintenir une discipline de fer toute la journée",
                        "Dépasser tes limites physiques et mentales",
                        "Progresser vers la version ultime de toi-même"
                    ]
                };
            }

            // Charger les objectifs sauvegardés
            const savedObjectives = JSON.parse(localStorage.getItem('daily-objectives') || '{}');
            const todayKey = new Date().toISOString().split('T')[0];
            
            if (!savedObjectives[todayKey]) {
                savedObjectives[todayKey] = objectivesData.objectives.map(obj => ({
                    text: obj,
                    completed: false
                }));
                localStorage.setItem('daily-objectives', JSON.stringify(savedObjectives));
            }

            this.renderObjectivesList(savedObjectives[todayKey]);
            
        } catch (error) {
            console.error('Erreur génération objectifs:', error);
            this.renderDefaultObjectives();
        }
    }

    renderObjectivesList(objectives) {
        document.getElementById('dailyObjectives').innerHTML = `
            <h3><i class="fas fa-bullseye"></i> OBJECTIFS DU JOUR</h3>
            <div class="objectives-list">
                ${objectives.map((obj, index) => `
                    <div class="objective-item ${obj.completed ? 'completed' : ''}">
                        <input type="checkbox" 
                               id="obj-${index}" 
                               ${obj.completed ? 'checked' : ''}
                               onchange="app.toggleObjective(${index})">
                        <label for="obj-${index}">${obj.text}</label>
                    </div>
                `).join('')}
            </div>
            <button class="refresh-objectives" onclick="app.regenerateObjectives()">
                <i class="fas fa-sync-alt"></i> Régénérer
            </button>
        `;
    }

    renderDefaultObjectives() {
        const defaultObjectives = [
            { text: "Compléter tous les checks quotidiens sans exception", completed: false },
            { text: "Maintenir une discipline de fer toute la journée", completed: false },
            { text: "Dépasser tes limites physiques et mentales", completed: false },
            { text: "Progresser vers la version ultime de toi-même", completed: false }
        ];
        
        const todayKey = new Date().toISOString().split('T')[0];
        const savedObjectives = JSON.parse(localStorage.getItem('daily-objectives') || '{}');
        savedObjectives[todayKey] = defaultObjectives;
        localStorage.setItem('daily-objectives', JSON.stringify(savedObjectives));
        
        this.renderObjectivesList(defaultObjectives);
    }

    toggleObjective(index) {
        const todayKey = new Date().toISOString().split('T')[0];
        const savedObjectives = JSON.parse(localStorage.getItem('daily-objectives') || '{}');
        
        if (savedObjectives[todayKey] && savedObjectives[todayKey][index]) {
            savedObjectives[todayKey][index].completed = !savedObjectives[todayKey][index].completed;
            localStorage.setItem('daily-objectives', JSON.stringify(savedObjectives));
            
            // Feedback IA pour féliciter ou motiver
            if (savedObjectives[todayKey][index].completed) {
                this.showAIFeedback("🎯 Excellent soldat ! Objectif accompli ! Continue sur ta lancée ! ⚔️");
            }
            
            // Mettre à jour l'affichage
            this.renderObjectivesList(savedObjectives[todayKey]);
        }
    }

    async regenerateObjectives() {
        const todayKey = new Date().toISOString().split('T')[0];
        const savedObjectives = JSON.parse(localStorage.getItem('daily-objectives') || '{}');
        delete savedObjectives[todayKey];
        localStorage.setItem('daily-objectives', JSON.stringify(savedObjectives));
        
        await this.generateDailyObjectives();
    }

    getMissionDay() {
        const startDate = new Date('2025-06-26');
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.min(diffDays, 90);
    }

    updateActiveNav() {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-check="${this.currentCheck}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    async loadDailyStats() {
        try {
            const today = new Date().toISOString().split('T')[0];
            const todayData = await this.githubAPI.getDataForDate(today);
            
            const checkTypes = ['mental', 'cardio', 'muscu', 'bilan'];
            const completedChecks = checkTypes.filter(type => 
                todayData.some(item => item.check_type === type)
            ).length;
            
            document.getElementById('completedChecks').textContent = `${completedChecks}/4`;
            document.getElementById('currentStreak').textContent = '5';
            
            const weekProgress = Math.round((completedChecks / 4) * 100);
            document.getElementById('weekProgress').textContent = `${weekProgress}%`;
            
        } catch (error) {
            console.error('Erreur chargement stats:', error);
        }
    }

    loadCheck(checkType) {
        this.currentCheck = checkType;
        this.currentQuestionIndex = 0;
        this.updateActiveNav();
        this.renderCurrentQuestion();
    }

    renderCurrentQuestion() {
        const container = document.getElementById('checkContainer');
        const questions = this.questions[this.currentCheck];
        
        if (this.currentQuestionIndex >= questions.length) {
            this.showCheckComplete();
            return;
        }

        const question = questions[this.currentQuestionIndex];
        const checkTitle = this.getCheckTitle(this.currentCheck);
        
        container.innerHTML = `
            <div class="check-header">
                <h2>${checkTitle}</h2>
                <div class="progress-indicator">
                    Question ${this.currentQuestionIndex + 1}/${questions.length}
                </div>
            </div>
            <div class="question-block" id="currentQuestion">
                <label class="question-label">${question.label}</label>
                ${this.renderInput(question)}
                <button class="submit-btn" onclick="app.submitAnswer()">
                    ENVOYER ⚔️
                </button>
            </div>
        `;
    }

    renderInput(question) {
        switch (question.type) {
            case 'textarea':
                return `<textarea class="form-input" id="questionInput" placeholder="Sois précis et honnête..." rows="4" ${question.required ? 'required' : ''}></textarea>`;
            
            case 'text':
                return `<input type="text" class="form-input" id="questionInput" placeholder="Tape ta réponse..." ${question.required ? 'required' : ''}>`;
            
            case 'number':
                return `<input type="number" class="form-input" id="questionInput" min="${question.min || ''}" max="${question.max || ''}" step="${question.step || 1}" ${question.required ? 'required' : ''}>`;
            
            case 'select':
                const options = question.options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
                return `<select class="form-input" id="questionInput" ${question.required ? 'required' : ''}>
                    <option value="">-- Choisis --</option>
                    ${options}
                </select>`;
            
            default:
                return `<input type="text" class="form-input" id="questionInput">`;
        }
    }

    async submitAnswer() {
        const input = document.getElementById('questionInput');
        if (!input) {
            console.error('Input non trouvé');
            return;
        }

        const value = input.value.trim();
        const question = this.questions[this.currentCheck][this.currentQuestionIndex];
        
        if (!value && question.required) {
            alert('⚠️ Cette réponse est obligatoire, soldat !');
            return;
        }

        // Désactiver le bouton pendant le traitement
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading"></div> ENVOI...';
        }

        try {
            // Marquer visuellement comme complété
            const questionBlock = document.getElementById('currentQuestion');
            if (questionBlock) {
                questionBlock.classList.add('completed');
            }
            
            // Sauvegarder et obtenir feedback
            await this.saveAnswer(question.id, value);
            await this.getAIFeedback(question.label, value);
            
            // Passer à la question suivante
            setTimeout(() => {
                this.currentQuestionIndex++;
                this.renderCurrentQuestion();
            }, 2000);
            
        } catch (error) {
            console.error('Erreur submit:', error);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'ENVOYER ⚔️';
            }
        }
    }

    async saveAnswer(questionId, value) {
        const today = new Date().toISOString().split('T')[0];
        const data = {
            date: today,
            check_type: this.currentCheck,
            question_id: questionId,
            answer: value,
            timestamp: new Date().toISOString()
        };

        try {
            await this.githubAPI.saveData(data);
            console.log('✅ Données sauvegardées:', data);
        } catch (error) {
            console.error('❌ Erreur sauvegarde:', error);
        }
    }

    async getAIFeedback(question, answer) {
        const prompt = `Tu es un coach militaire strict mais bienveillant. Réponds en français, tutoie, utilise un vocabulaire militaire, donne des ordres clairs, maximum 80-100 mots, utilise des emojis militaires (⚔️, 🎯, 💪, 🔥).

Question: ${question}
Réponse: ${answer}

Donne un feedback direct et actionnable pour Arnaud, 18 ans, en mission de transformation de 90 jours.`;
        
        try {
            const feedback = await this.chatGPT.getFeedback(prompt);
            this.showAIFeedback(feedback);
        } catch (error) {
            console.error('❌ Erreur IA:', error);
            this.showAIFeedback("⚔️ Bien reçu soldat ! Continue sur ta lancée ! 🔥");
        }
    }

    showAIFeedback(feedback) {
        const feedbackElement = document.getElementById('aiFeedback');
        const textElement = document.getElementById('feedbackText');
        
        textElement.textContent = feedback;
        feedbackElement.classList.add('show');
        
        setTimeout(() => {
            feedbackElement.classList.remove('show');
        }, 8000);
    }

    showCheckComplete() {
        const container = document.getElementById('checkContainer');
        const checkTitle = this.getCheckTitle(this.currentCheck);
        
        container.innerHTML = `
            <div class="check-complete">
                <h2>✅ ${checkTitle} TERMINÉ</h2>
                <p>Excellent travail soldat ! Toutes tes réponses ont été enregistrées.</p>
                <div class="completion-actions">
                    <button class="submit-btn" onclick="app.showStats()">📊 Voir les Stats</button>
                    <button class="submit-btn" onclick="app.showHomePage()">🏠 Retour Accueil</button>
                </div>
            </div>
        `;
    }

    getCheckTitle(checkType) {
        const titles = {
            mental: '🧠 CHECK MENTAL',
            cardio: '❤️ CHECK CARDIO & POIDS',
            muscu: '💪 CHECK MUSCULATION',
            bilan: '📊 BILAN JOURNÉE'
        };
        return titles[checkType] || 'CHECK';
    }

    async showStats() {
        this.currentCheck = 'stats';
        this.updateActiveNav();
        
        const container = document.getElementById('checkContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="stats-container">
                <h2>📈 STATISTIQUES DE MISSION</h2>
                <div class="loading-stats">
                    <div class="loading"></div>
                    <p>Chargement des statistiques...</p>
                </div>
                <div class="stats-grid" id="statsGrid" style="display: none;">
                    <div class="chart-container">
                        <canvas id="weightChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="sleepChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="performanceChart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="moodChart"></canvas>
                    </div>
                </div>
                <div class="data-actions">
                    <button class="submit-btn" onclick="app.exportData()">📥 Exporter Données</button>
                    <button class="submit-btn" onclick="app.showDataConsultation()">📋 Consulter Données</button>
                </div>
            </div>
        `;

        try {
            await this.loadChartsData();
            document.querySelector('.loading-stats').style.display = 'none';
            document.getElementById('statsGrid').style.display = 'grid';
        } catch (error) {
            console.error('Erreur chargement stats:', error);
            document.querySelector('.loading-stats').innerHTML = `
                <p>❌ Erreur de chargement des statistiques</p>
                <button class="submit-btn" onclick="app.showStats()">🔄 Réessayer</button>
            `;
        }
    }

    async loadChartsData() {
        try {
            const allData = await this.githubAPI.getAllData();
            
            // Créer des données de démonstration si pas de données
            if (!allData || allData.length === 0) {
                this.createDemoCharts();
                return;
            }
            
            // Charger les vrais graphiques
            if (this.charts) {
                await this.charts.loadCharts(allData);
            }
            
        } catch (error) {
            console.error('Erreur données graphiques:', error);
            this.createDemoCharts();
        }
    }

    createDemoCharts() {
        // Données de démonstration
        const demoData = {
            weight: [75.2, 74.8, 74.5, 74.1, 73.9],
            sleep: [7, 8, 6, 7, 8],
            recovery: [6, 7, 5, 8, 7],
            mood: [8, 7, 6, 8, 9]
        };

        const labels = ['J-4', 'J-3', 'J-2', 'J-1', 'Aujourd\'hui'];

        // Graphique poids
        const weightCtx = document.getElementById('weightChart');
        if (weightCtx) {
            new Chart(weightCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Poids (kg)',
                        data: demoData.weight,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '⚖️ Évolution du Poids',
                            color: '#f8fafc'
                        },
                        legend: {
                            labels: {
                                color: '#f8fafc'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#f8fafc' },
                            grid: { color: 'rgba(248, 250, 252, 0.1)' }
                        },
                        y: {
                            ticks: { color: '#f8fafc' },
                            grid: { color: 'rgba(248, 250, 252, 0.1)' }
                        }
                    }
                }
            });
        }

        // Graphique sommeil
        const sleepCtx = document.getElementById('sleepChart');
        if (sleepCtx) {
            new Chart(sleepCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Qualité Sommeil',
                        data: demoData.sleep,
                        backgroundColor: demoData.sleep.map(d => 
                            d >= 7 ? '#10b981' : 
                            d >= 5 ? '#f59e0b' : '#dc2626'
                        )
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '😴 Qualité du Sommeil',
                            color: '#f8fafc'
                        },
                        legend: {
                            labels: {
                                color: '#f8fafc'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#f8fafc' },
                            grid: { color: 'rgba(248, 250, 252, 0.1)' }
                        },
                        y: {
                            min: 0,
                            max: 10,
                            ticks: { color: '#f8fafc' },
                            grid: { color: 'rgba(248, 250, 252, 0.1)' }
                        }
                    }
                }
            });
        }

        // Graphique récupération
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Récupération',
                        data: demoData.recovery,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '⚡ Récupération Nerveuse',
                            color: '#f8fafc'
                        },
                        legend: {
                            labels: {
                                color: '#f8fafc'
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: { color: '#f8fafc' },
                            grid: { color: 'rgba(248, 250, 252, 0.1)' }
                        },
                        y: {
                            min: 0,
                            max: 10,
                            ticks: { color: '#f8fafc' },
                            grid: { color: 'rgba(248, 250, 252, 0.1)' }
                        }
                    }
                }
            });
        }

        // Graphique humeur
        const moodCtx = document.getElementById('moodChart');
        if (moodCtx) {
            new Chart(moodCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Excellent (8-10)', 'Bon (6-7)', 'Moyen (4-5)', 'Faible (1-3)'],
                    datasets: [{
                        data: [3, 1, 1, 0], // Données de démo
                        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#dc2626']
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '📊 Répartition Notes Journée',
                            color: '#f8fafc'
                        },
                        legend: {
                            labels: {
                                color: '#f8fafc'
                            }
                        }
                    }
                }
            });
        }
    }

    showDataConsultation() {
        document.getElementById('dataModal').style.display = 'block';
        document.getElementById('dateSelector').addEventListener('change', this.loadDataForDate.bind(this));
    }

    async loadDataForDate(event) {
        const selectedDate = event.target.value;
        if (!selectedDate) return;

        try {
            const data = await this.githubAPI.getDataForDate(selectedDate);
            this.displayDayData(data);
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
        }
    }

    displayDayData(data) {
        const display = document.getElementById('dataDisplay');
        if (!data || data.length === 0) {
            display.innerHTML = '<p>Aucune donnée pour cette date.</p>';
            return;
        }

        const groupedData = this.groupDataByCheck(data);
        let html = '';

        Object.keys(groupedData).forEach(checkType => {
            html += `<div class="day-check-data">
                <h3>${this.getCheckTitle(checkType)}</h3>
                <div class="check-answers">`;
            
            groupedData[checkType].forEach(item => {
                html += `<div class="answer-item">
                    <strong>${item.question_id}:</strong> ${item.answer}
                </div>`;
            });
            
            html += '</div></div>';
        });

        display.innerHTML = html;
    }

    groupDataByCheck(data) {
        return data.reduce((groups, item) => {
            const checkType = item.check_type;
            if (!groups[checkType]) groups[checkType] = [];
            groups[checkType].push(item);
            return groups;
        }, {});
    }

    async exportData() {
        try {
            const allData = await this.githubAPI.getAllData();
            const dataStr = JSON.stringify(allData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `cockpit-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
        } catch (error) {
            console.error('❌ Erreur export:', error);
        }
    }

    showError(message) {
        // Afficher une notification d'erreur
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    initializeQuestions() {
        return {
            mental: [
                { id: 'feeling', label: 'Comment tu te sens ce matin, soldat ?', type: 'textarea', required: true },
                { id: 'sleep_hours', label: 'Heures de sommeil (précis au quart d\'heure)', type: 'number', min: 0, max: 12, step: 0.25, required: true },
                { id: 'sleep_quality', label: 'Qualité du sommeil (1-10)', type: 'select', options: Array.from({length: 10}, (_, i) => i + 1), required: true },
                { id: 'recovery', label: 'Récupération nerveuse (1-10)', type: 'select', options: Array.from({length: 10}, (_, i) => i + 1), required: true },
                { id: 'daily_objective', label: 'Objectif prioritaire du jour', type: 'text', required: true }
            ],
            cardio: [
                { id: 'cardio_done', label: 'Cardio effectué ?', type: 'select', options: ['Oui', 'Non'], required: true },
                { id: 'cardio_performance', label: 'Performance (si oui)', type: 'textarea', required: false },
                { id: 'weight', label: 'Poids du jour (kg)', type: 'number', min: 40, max: 150, step: 0.1, required: true }
            ],
            muscu: [
                { id: 'muscu_done', label: 'Musculation effectuée ?', type: 'select', options: ['Oui', 'Non'], required: true },
                { id: 'muscu_duration', label: 'Durée/qualité (si oui)', type: 'textarea', required: false },
                { id: 'challenge_action', label: 'Action de dépassement réalisée', type: 'textarea', required: true }
            ],
            bilan: [
                { id: 'nutrition_respected', label: 'Nutrition respectée ?', type: 'select', options: ['Parfaitement', 'Globalement', 'Partiellement', 'Pas du tout'], required: true },
                { id: 'dominant_emotion', label: 'Émotion dominante de la journée', type: 'text', required: true },
                { id: 'day_rating', label: 'Note de la journée (1-10)', type: 'select', options: Array.from({length: 10}, (_, i) => i + 1), required: true },
                { id: 'rating_justification', label: 'Justification de ta note', type: 'textarea', required: true },
                { id: 'business_action', label: 'Action business/développement personnel', type: 'textarea', required: true }
            ]
        };
    }
}

// Initialisation globale
let app;

// S'assurer que l'app est disponible globalement
window.addEventListener('DOMContentLoaded', () => {
    app = new CockpitCombat();
    window.app = app; // Rendre accessible globalement
});

// Fallback si DOMContentLoaded a déjà été déclenché
if (document.readyState !== 'loading') {
    app = new CockpitCombat();
    window.app = app;
}
