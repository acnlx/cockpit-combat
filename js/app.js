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
                this.startBackgroundSync();
            });
        } else {
            this.setupEventListeners();
            this.initializeTheme();
            this.updateMissionProgress();
            this.showHomePage();
            this.startBackgroundSync();
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
                    } else if (checkType === 'semaine') {
                        this.showWeeklyPlanning();
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

    // ✅ NOUVELLE MÉTHODE: Affichage de la planification hebdomadaire
    async showWeeklyPlanning() {
        this.currentCheck = 'semaine';
        this.updateActiveNav();
        
        const container = document.getElementById('checkContainer');
        container.innerHTML = `
            <div class="weekly-container">
                <div class="week-header">
                    <h2><i class="fas fa-calendar-week"></i> PLANIFICATION SEMAINE</h2>
                    <div class="week-navigation">
                        <button class="week-nav-btn" onclick="app.changeWeek(-1)">
                            <i class="fas fa-chevron-left"></i> Semaine précédente
                        </button>
                        <span class="current-week" id="currentWeekDisplay">Semaine du ${this.getCurrentWeekRange()}</span>
                        <button class="week-nav-btn" onclick="app.changeWeek(1)">
                            Semaine suivante <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>

                <div class="weekly-objectives" id="weeklyObjectives">
                    <h3><i class="fas fa-target"></i> OBJECTIFS DE LA SEMAINE</h3>
                    <div class="loading-objectives">
                        <div class="loading"></div>
                        <p>Génération des objectifs hebdomadaires...</p>
                    </div>
                </div>

                <div class="weekly-kcal">
                    <h3><i class="fas fa-fire"></i> OBJECTIF KCAL SEMAINE</h3>
                    <div class="kcal-tracker">
                        <div class="kcal-goal">
                            <div class="kcal-value" id="weeklyKcalGoal">12,000</div>
                            <div class="kcal-label">Objectif kcal</div>
                        </div>
                        <div class="kcal-progress">
                            <div class="kcal-consumed">
                                <div class="kcal-value" id="weeklyKcalConsumed">8,400</div>
                                <div class="kcal-label">Consommées</div>
                            </div>
                            <div class="kcal-remaining">
                                <div class="kcal-value" id="weeklyKcalRemaining">3,600</div>
                                <div class="kcal-label">Restantes</div>
                            </div>
                        </div>
                        <div class="kcal-bar">
                            <div class="kcal-fill" id="weeklyKcalFill"></div>
                        </div>
                    </div>
                </div>

                <div class="weekly-sports">
                    <h3><i class="fas fa-dumbbell"></i> PLANNING SPORTIF</h3>
                    <div class="sports-grid" id="sportsGrid">
                        <!-- Généré dynamiquement -->
                    </div>
                </div>

                <div class="weekly-goals">
                    <h3><i class="fas fa-trophy"></i> OBJECTIFS SPÉCIFIQUES</h3>
                    <div class="goals-list" id="weeklyGoalsList">
                        <!-- Généré dynamiquement -->
                    </div>
                </div>

                <div class="week-actions">
                    <button class="submit-btn" onclick="app.generateWeeklyPlan()">
                        <i class="fas fa-magic"></i> Régénérer le planning
                    </button>
                    <button class="submit-btn" onclick="app.saveWeeklyPlan()">
                        <i class="fas fa-save"></i> Sauvegarder
                    </button>
                </div>
            </div>
        `;

        await this.loadWeeklyData();
    }

    // ✅ NOUVELLE MÉTHODE: Charger les données hebdomadaires
    async loadWeeklyData() {
        try {
            await Promise.all([
                this.generateWeeklyObjectives(),
                this.loadWeeklyKcal(),
                this.generateSportsPlanning(),
                this.generateWeeklyGoals()
            ]);
        } catch (error) {
            console.error('Erreur chargement données hebdomadaires:', error);
        }
    }

    // ✅ NOUVELLE MÉTHODE: Générer les objectifs hebdomadaires
    async generateWeeklyObjectives() {
        try {
            const weekNumber = this.getCurrentWeekNumber();
            const prompt = `Tu es un coach militaire français pour Arnaud, 18 ans, en mission de transformation de 90 jours.

Génère exactement 3 objectifs SMART pour la semaine ${weekNumber}. 

Format OBLIGATOIRE - Réponds UNIQUEMENT avec cette structure JSON :
{
  "objectives": [
    "Objectif 1 hebdomadaire précis",
    "Objectif 2 hebdomadaire précis", 
    "Objectif 3 hebdomadaire précis"
  ]
}

Règles:
- Objectifs sur 7 jours
- Vocabulaire militaire motivant
- Tutoiement
- Objectifs mesurables et réalisables
- Maximum 20 mots par objectif

Contexte: Semaine ${weekNumber}/13 de sa mission de 90 jours.`;

            const response = await this.chatGPT.getFeedback(prompt);
            
            let objectivesData;
            try {
                objectivesData = JSON.parse(response);
            } catch (e) {
                objectivesData = {
                    objectives: [
                        "Compléter 100% des checks quotidiens cette semaine",
                        "Perdre 0.5kg tout en maintenant la masse musculaire",
                        "Améliorer la qualité de sommeil moyenne à 8/10"
                    ]
                };
            }

            const savedObjectives = JSON.parse(localStorage.getItem('weekly-objectives') || '{}');
            const weekKey = this.getCurrentWeekKey();
            
            if (!savedObjectives[weekKey]) {
                savedObjectives[weekKey] = objectivesData.objectives.map(obj => ({
                    text: obj,
                    completed: false
                }));
                localStorage.setItem('weekly-objectives', JSON.stringify(savedObjectives));
            }

            this.renderWeeklyObjectivesList(savedObjectives[weekKey]);
            
        } catch (error) {
            console.error('Erreur génération objectifs hebdomadaires:', error);
            this.renderDefaultWeeklyObjectives();
        }
    }

    // ✅ NOUVELLE MÉTHODE: Afficher les objectifs hebdomadaires
    renderWeeklyObjectivesList(objectives) {
        document.getElementById('weeklyObjectives').innerHTML = `
            <h3><i class="fas fa-target"></i> OBJECTIFS DE LA SEMAINE</h3>
            <div class="objectives-list">
                ${objectives.map((obj, index) => `
                    <div class="objective-item ${obj.completed ? 'completed' : ''}">
                        <input type="checkbox" 
                               id="weekly-obj-${index}" 
                               ${obj.completed ? 'checked' : ''}
                               onchange="app.toggleWeeklyObjective(${index})">
                        <label for="weekly-obj-${index}">${obj.text}</label>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderDefaultWeeklyObjectives() {
        const defaultObjectives = [
            { text: "Compléter 100% des checks quotidiens cette semaine", completed: false },
            { text: "Perdre 0.5kg tout en maintenant la masse musculaire", completed: false },
            { text: "Améliorer la qualité de sommeil moyenne à 8/10", completed: false }
        ];
        
        const weekKey = this.getCurrentWeekKey();
        const savedObjectives = JSON.parse(localStorage.getItem('weekly-objectives') || '{}');
        savedObjectives[weekKey] = defaultObjectives;
        localStorage.setItem('weekly-objectives', JSON.stringify(savedObjectives));
        
        this.renderWeeklyObjectivesList(defaultObjectives);
    }

    // ✅ NOUVELLE MÉTHODE: Toggle objectif hebdomadaire
    toggleWeeklyObjective(index) {
        const weekKey = this.getCurrentWeekKey();
        const savedObjectives = JSON.parse(localStorage.getItem('weekly-objectives') || '{}');
        
        if (savedObjectives[weekKey] && savedObjectives[weekKey][index]) {
            savedObjectives[weekKey][index].completed = !savedObjectives[weekKey][index].completed;
            localStorage.setItem('weekly-objectives', JSON.stringify(savedObjectives));
            
            if (savedObjectives[weekKey][index].completed) {
                this.showAIFeedback("🎯 Objectif hebdomadaire accompli soldat ! Tu progresses bien ! ⚔️");
            }
            
            this.renderWeeklyObjectivesList(savedObjectives[weekKey]);
        }
    }

    // ✅ NOUVELLE MÉTHODE: Charger les données kcal hebdomadaires
    async loadWeeklyKcal() {
        // Données simulées - à remplacer par de vraies données
        const weeklyGoal = 12000;
        const consumed = 8400;
        const remaining = weeklyGoal - consumed;
        const percentage = (consumed / weeklyGoal) * 100;

        document.getElementById('weeklyKcalGoal').textContent = weeklyGoal.toLocaleString();
        document.getElementById('weeklyKcalConsumed').textContent = consumed.toLocaleString();
        document.getElementById('weeklyKcalRemaining').textContent = remaining.toLocaleString();
        document.getElementById('weeklyKcalFill').style.width = `${percentage}%`;
    }

    // ✅ NOUVELLE MÉTHODE: Générer le planning sportif
    async generateSportsPlanning() {
        const sportsPlanning = [
            { day: 'Lundi', type: 'Cardio', duration: '45min', intensity: 'Modérée', completed: true },
            { day: 'Mardi', type: 'Musculation', duration: '60min', intensity: 'Intense', completed: true },
            { day: 'Mercredi', type: 'Repos actif', duration: '30min', intensity: 'Légère', completed: false },
            { day: 'Jeudi', type: 'Cardio HIIT', duration: '30min', intensity: 'Très intense', completed: false },
            { day: 'Vendredi', type: 'Musculation', duration: '60min', intensity: 'Intense', completed: false },
            { day: 'Samedi', type: 'Sport libre', duration: '45min', intensity: 'Modérée', completed: false },
            { day: 'Dimanche', type: 'Repos', duration: '-', intensity: 'Repos', completed: false }
        ];

        const sportsGrid = document.getElementById('sportsGrid');
        sportsGrid.innerHTML = sportsPlanning.map(sport => `
            <div class="sport-card ${sport.completed ? 'completed' : ''}">
                <div class="sport-day">${sport.day}</div>
                <div class="sport-type">${sport.type}</div>
                <div class="sport-details">
                    <span class="sport-duration">${sport.duration}</span>
                    <span class="sport-intensity intensity-${sport.intensity.toLowerCase().replace(' ', '-')}">${sport.intensity}</span>
                </div>
                <button class="sport-toggle" onclick="app.toggleSportDay('${sport.day}')">
                    <i class="fas fa-${sport.completed ? 'check' : 'circle'}"></i>
                </button>
            </div>
        `).join('');
    }

    // ✅ NOUVELLE MÉTHODE: Générer les objectifs spécifiques
    async generateWeeklyGoals() {
        const goals = [
            { category: 'Poids', target: 'Perdre 0.5kg', current: '74.2kg', goal: '73.7kg', progress: 60 },
            { category: 'Sommeil', target: 'Moyenne 8h/nuit', current: '7.2h', goal: '8h', progress: 90 },
            { category: 'Cardio', target: '3 séances', current: '2/3', goal: '3', progress: 67 },
            { category: 'Discipline', target: '100% checks', current: '85%', goal: '100%', progress: 85 }
        ];

        const goalsList = document.getElementById('weeklyGoalsList');
        goalsList.innerHTML = goals.map(goal => `
            <div class="goal-item">
                <div class="goal-header">
                    <span class="goal-category">${goal.category}</span>
                    <span class="goal-progress">${goal.progress}%</span>
                </div>
                <div class="goal-target">${goal.target}</div>
                <div class="goal-status">
                    <span class="goal-current">${goal.current}</span>
                    <span class="goal-arrow">→</span>
                    <span class="goal-goal">${goal.goal}</span>
                </div>
                <div class="goal-bar">
                    <div class="goal-fill" style="width: ${goal.progress}%"></div>
                </div>
            </div>
        `).join('');
    }

    // ✅ NOUVELLE MÉTHODE: Utilitaires pour les semaines
    getCurrentWeekRange() {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        return `${monday.toLocaleDateString('fr-FR')} - ${sunday.toLocaleDateString('fr-FR')}`;
    }

    getCurrentWeekNumber() {
        const startDate = new Date('2025-06-26');
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
        return Math.min(diffWeeks, 13);
    }

    getCurrentWeekKey() {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        return monday.toISOString().split('T')[0];
    }

    changeWeek(direction) {
        // Logique pour changer de semaine
        console.log('Changement de semaine:', direction);
        // À implémenter selon tes besoins
    }

    async generateWeeklyPlan() {
        await this.loadWeeklyData();
        this.showAIFeedback("🎯 Nouveau planning généré soldat ! Prêt pour la bataille ! ⚔️");
    }

    async saveWeeklyPlan() {
        // Sauvegarder le planning hebdomadaire
        const weeklyData = {
            week: this.getCurrentWeekKey(),
            objectives: JSON.parse(localStorage.getItem('weekly-objectives') || '{}'),
            timestamp: new Date().toISOString()
        };
        
        try {
            await this.githubAPI.saveData(weeklyData);
            this.showAIFeedback("💾 Planning sauvegardé ! Mission en cours ! 🔥");
        } catch (error) {
            console.error('Erreur sauvegarde planning:', error);
        }
    }

    toggleSportDay(day) {
        // Toggle du jour sportif
        console.log('Toggle sport day:', day);
        // À implémenter selon tes besoins
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

    // ✅ MÉTHODE SUBMITANSWER OPTIMISÉE
    async submitAnswer() {
        const input = document.getElementById('questionInput');
        if (!input) return;

        const value = input.value.trim();
        const question = this.questions[this.currentCheck][this.currentQuestionIndex];
        
        if (!value && question.required) {
            alert('⚠️ Cette réponse est obligatoire, soldat !');
            return;
        }

        // Désactiver le bouton avec animation
        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading"></div> ENVOI...';
        }

        // Marquer visuellement comme complété IMMÉDIATEMENT
        const questionBlock = document.getElementById('currentQuestion');
        if (questionBlock) {
            questionBlock.classList.add('completed');
        }

        try {
            // ✅ OPTIMISATION 1: Sauvegarde locale immédiate
            this.saveToLocalCache(question.id, value);
            this.showNetworkStatus('saving');
            
            // ✅ NOUVEAU: Sauvegarder automatiquement dans la mémoire persistante
            const context = {
                checkType: this.currentCheck,
                missionDay: this.getMissionDay(),
                questionIndex: this.currentQuestionIndex
            };
            
            if (this.chatGPT && this.chatGPT.memory) {
                await this.chatGPT.memory.autoSavePreferences(question.label, value, context);
            }
            
            // ✅ OPTIMISATION 2: Passer à la question suivante SANS attendre
            setTimeout(() => {
                this.currentQuestionIndex++;
                this.renderCurrentQuestion();
            }, 500); // Réaction immédiate
            
            // ✅ OPTIMISATION 3: Sauvegarde et feedback en arrière-plan
            this.processAnswerInBackground(question.id, value, question.label, context);
            
        } catch (error) {
            console.error('Erreur submit:', error);
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'ENVOYER ⚔️';
            }
        }
    }

    // ✅ NOUVELLE MÉTHODE: Cache local
    saveToLocalCache(questionId, value) {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `cockpit-cache-${today}`;
        
        let cache = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        
        cache.push({
            date: today,
            check_type: this.currentCheck,
            question_id: questionId,
            answer: value,
            timestamp: new Date().toISOString(),
            synced: false
        });
        
        localStorage.setItem(cacheKey, JSON.stringify(cache));
        console.log('💾 Sauvé en cache local');
    }

    // ✅ NOUVELLE MÉTHODE: Traitement en arrière-plan
    async processAnswerInBackground(questionId, value, questionLabel, context) {
        try {
            // Lancer les deux opérations EN PARALLÈLE
            const [saveResult, feedbackResult] = await Promise.allSettled([
                this.saveAnswer(questionId, value),
                this.getAIFeedback(questionLabel, value, context)
            ]);
            
            // Afficher le feedback seulement s'il arrive
            if (feedbackResult.status === 'fulfilled') {
                this.showAIFeedback(feedbackResult.value);
            }
            
            this.showNetworkStatus('synced');
            console.log('✅ Traitement arrière-plan terminé');
            
        } catch (error) {
            console.error('❌ Erreur arrière-plan:', error);
            this.showNetworkStatus('offline');
        }
    }

    // ✅ NOUVELLE MÉTHODE: Sync batch
    startBackgroundSync() {
        setInterval(() => {
            this.syncLocalCache();
        }, 30000); // 30 secondes
    }

    async syncLocalCache() {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `cockpit-cache-${today}`;
        let cache = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        
        const unsyncedItems = cache.filter(item => !item.synced);
        
        if (unsyncedItems.length === 0) return;
        
        console.log(`🔄 Sync de ${unsyncedItems.length} éléments...`);
        this.showNetworkStatus('syncing');
        
        try {
            // Envoyer tous les éléments non synchronisés
            for (const item of unsyncedItems) {
                await this.githubAPI.saveData(item);
                item.synced = true;
            }
            
            localStorage.setItem(cacheKey, JSON.stringify(cache));
            this.showNetworkStatus('synced');
            console.log('✅ Synchronisation terminée');
            
        } catch (error) {
            console.error('❌ Erreur sync:', error);
            this.showNetworkStatus('offline');
        }
    }

    // ✅ NOUVELLE MÉTHODE: Indicateur de statut réseau
    showNetworkStatus(status) {
        const statusDiv = document.getElementById('networkStatus') || this.createNetworkStatus();
        
        switch(status) {
            case 'saving':
                statusDiv.innerHTML = '💾 Sauvegarde...';
                statusDiv.className = 'network-status saving';
                statusDiv.style.display = 'block';
                break;
            case 'syncing':
                statusDiv.innerHTML = '🔄 Synchronisation...';
                statusDiv.className = 'network-status syncing';
                statusDiv.style.display = 'block';
                break;
            case 'synced':
                statusDiv.innerHTML = '✅ Synchronisé';
                statusDiv.className = 'network-status synced';
                statusDiv.style.display = 'block';
                setTimeout(() => statusDiv.style.display = 'none', 2000);
                break;
            case 'offline':
                statusDiv.innerHTML = '📱 Mode hors ligne';
                statusDiv.className = 'network-status offline';
                statusDiv.style.display = 'block';
                break;
        }
    }

    createNetworkStatus() {
        const statusDiv = document.createElement('div');
        statusDiv.id = 'networkStatus';
        statusDiv.className = 'network-status';
        statusDiv.style.display = 'none';
        document.body.appendChild(statusDiv);
        return statusDiv;
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
            throw error;
        }
    }

    async getAIFeedback(question, answer, context = {}) {
        const prompt = `Question: ${question}
Réponse d'Arnaud: ${answer}

Donne un feedback de coach militaire direct et actionnable.`;
        
        try {
            const feedback = await this.chatGPT.getFeedback(prompt, context);
            return feedback;
        } catch (error) {
            console.error('❌ Erreur IA:', error);
            return "⚔️ Bien reçu soldat ! Continue sur ta lancée ! 🔥";
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
                { id: 'challenge
