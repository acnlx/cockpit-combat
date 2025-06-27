class CockpitCombat {
    constructor() {
        this.currentCheck = null;
        this.questions = this.initializeQuestions();
        this.currentQuestionIndex = 0;
        
        // Initialiser les APIs seulement si les classes existent
        this.githubAPI = typeof GitHubAPI !== 'undefined' ? new GitHubAPI() : null;
        this.chatGPT = typeof ChatGPTAPI !== 'undefined' ? new ChatGPTAPI() : null;
        this.charts = typeof ChartsManager !== 'undefined' ? new ChartsManager() : null;
        
        this.init();
    }

    init() {
        console.log('🚀 Initialisation du Cockpit de Combat...');
        
        // Attendre que le DOM soit complètement chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.startApp();
            });
        } else {
            this.startApp();
        }
    }

    startApp() {
        try {
            this.setupEventListeners();
            this.initializeTheme();
            this.updateMissionProgress();
            this.showHomePage();
            this.startBackgroundSync();
            console.log('✅ Cockpit de Combat initialisé avec succès !');
        } catch (error) {
            console.error('❌ Erreur initialisation:', error);
            this.showFallbackInterface();
        }
    }

    // ✅ INTERFACE DE SECOURS si erreur
    showFallbackInterface() {
        const container = document.getElementById('checkContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <h2>⚔️ COCKPIT DE COMBAT</h2>
                    <p>Interface de secours activée</p>
                    <button onclick="location.reload()" style="padding: 1rem 2rem; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        🔄 Recharger
                    </button>
                </div>
            `;
        }
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('cockpit-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon();
    }

    setupEventListeners() {
        // Attendre que les éléments existent
        setTimeout(() => {
            // Navigation
            const navBtns = document.querySelectorAll('.nav-btn');
            navBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const checkType = e.target.closest('.nav-btn').dataset.check;
                    console.log('Navigation vers:', checkType);
                    
                    try {
                        if (checkType === 'stats') {
                            this.showStats();
                        } else if (checkType === 'home') {
                            this.showHomePage();
                        } else if (checkType === 'semaine') {
                            this.showWeeklyPlanning();
                        } else {
                            this.loadCheck(checkType);
                        }
                    } catch (error) {
                        console.error('Erreur navigation:', error);
                    }
                });
            });

            // Thème toggle
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleTheme();
                });
            }

            // Modal
            const closeBtn = document.querySelector('.close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    const modal = document.getElementById('dataModal');
                    if (modal) modal.style.display = 'none';
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
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    updateMissionProgress() {
        try {
            const startDate = new Date('2025-06-26');
            const today = new Date();
            const diffTime = Math.abs(today - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const missionDay = Math.min(diffDays, 90);
            
            const missionDayElement = document.getElementById('missionDay');
            const missionProgressElement = document.getElementById('missionProgress');
            
            if (missionDayElement) {
                missionDayElement.textContent = missionDay;
            }
            
            if (missionProgressElement) {
                const progress = (missionDay / 90) * 100;
                missionProgressElement.style.width = `${progress}%`;
            }
        } catch (error) {
            console.error('Erreur mise à jour progression:', error);
        }
    }

    async showHomePage() {
        this.currentCheck = 'home';
        this.updateActiveNav();
        
        const container = document.getElementById('checkContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="home-container">
                <div class="welcome-section">
                    <h2>BIENVENUE SOLDAT ARNAUD</h2>
                    <p class="mission-status">Mission en cours - Transformation 90 jours</p>
                </div>
                
                <div class="daily-objectives" id="dailyObjectives">
                    <h3><i class="fas fa-bullseye"></i> OBJECTIFS DU JOUR</h3>
                    <div class="objectives-list">
                        <div class="objective-item">
                            <input type="checkbox" id="obj-0">
                            <label for="obj-0">Compléter tous les checks quotidiens sans exception</label>
                        </div>
                        <div class="objective-item">
                            <input type="checkbox" id="obj-1">
                            <label for="obj-1">Maintenir une discipline de fer toute la journée</label>
                        </div>
                        <div class="objective-item">
                            <input type="checkbox" id="obj-2">
                            <label for="obj-2">Dépasser tes limites physiques et mentales</label>
                        </div>
                        <div class="objective-item">
                            <input type="checkbox" id="obj-3">
                            <label for="obj-3">Progresser vers la version ultime de toi-même</label>
                        </div>
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
                    <div class="stats-cards">
                        <div class="stat-card">
                            <div class="stat-value">0/4</div>
                            <div class="stat-label">Checks Complétés</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">2</div>
                            <div class="stat-label">Jours Consécutifs</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">75%</div>
                            <div class="stat-label">Semaine</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showWeeklyPlanning() {
        this.currentCheck = 'semaine';
        this.updateActiveNav();
        
        const container = document.getElementById('checkContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="weekly-container">
                <div class="week-header">
                    <h2><i class="fas fa-calendar-week"></i> PLANIFICATION SEMAINE</h2>
                    <div class="current-week">Semaine du ${this.getCurrentWeekRange()}</div>
                </div>

                <div class="weekly-kcal">
                    <h3><i class="fas fa-fire"></i> OBJECTIF KCAL SEMAINE</h3>
                    <div class="kcal-tracker">
                        <div class="kcal-goal">
                            <div class="kcal-value">12,000</div>
                            <div class="kcal-label">Objectif kcal</div>
                        </div>
                        <div class="kcal-progress">
                            <div class="kcal-consumed">
                                <div class="kcal-value">8,400</div>
                                <div class="kcal-label">Consommées</div>
                            </div>
                            <div class="kcal-remaining">
                                <div class="kcal-value">3,600</div>
                                <div class="kcal-label">Restantes</div>
                            </div>
                        </div>
                        <div class="kcal-bar">
                            <div class="kcal-fill" style="width: 70%"></div>
                        </div>
                    </div>
                </div>

                <div class="weekly-sports">
                    <h3><i class="fas fa-dumbbell"></i> PLANNING SPORTIF</h3>
                    <div class="sports-grid">
                        <div class="sport-card completed">
                            <div class="sport-day">Lundi</div>
                            <div class="sport-type">Cardio</div>
                            <div class="sport-details">
                                <span class="sport-duration">45min</span>
                                <span class="sport-intensity">Modérée</span>
                            </div>
                        </div>
                        <div class="sport-card completed">
                            <div class="sport-day">Mardi</div>
                            <div class="sport-type">Musculation</div>
                            <div class="sport-details">
                                <span class="sport-duration">60min</span>
                                <span class="sport-intensity">Intense</span>
                            </div>
                        </div>
                        <div class="sport-card">
                            <div class="sport-day">Mercredi</div>
                            <div class="sport-type">Repos actif</div>
                            <div class="sport-details">
                                <span class="sport-duration">30min</span>
                                <span class="sport-intensity">Légère</span>
                            </div>
                        </div>
                        <div class="sport-card">
                            <div class="sport-day">Jeudi</div>
                            <div class="sport-type">Cardio HIIT</div>
                            <div class="sport-details">
                                <span class="sport-duration">30min</span>
                                <span class="sport-intensity">Très intense</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="weekly-goals">
                    <h3><i class="fas fa-trophy"></i> OBJECTIFS SPÉCIFIQUES</h3>
                    <div class="goals-list">
                        <div class="goal-item">
                            <div class="goal-header">
                                <span class="goal-category">Poids</span>
                                <span class="goal-progress">60%</span>
                            </div>
                            <div class="goal-target">Perdre 0.5kg</div>
                            <div class="goal-status">
                                <span class="goal-current">74.2kg</span>
                                <span class="goal-arrow">→</span>
                                <span class="goal-goal">73.7kg</span>
                            </div>
                            <div class="goal-bar">
                                <div class="goal-fill" style="width: 60%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    loadCheck(checkType) {
        this.currentCheck = checkType;
        this.currentQuestionIndex = 0;
        this.updateActiveNav();
        this.renderCurrentQuestion();
    }

    renderCurrentQuestion() {
        const container = document.getElementById('checkContainer');
        if (!container) return;
        
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
        if (!input) return;

        const value = input.value.trim();
        const question = this.questions[this.currentCheck][this.currentQuestionIndex];
        
        if (!value && question.required) {
            alert('⚠️ Cette réponse est obligatoire, soldat !');
            return;
        }

        const submitBtn = document.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="loading"></div> ENVOI...';
        }

        const questionBlock = document.getElementById('currentQuestion');
        if (questionBlock) {
            questionBlock.classList.add('completed');
        }

        // Simuler la sauvegarde
        console.log('💾 Réponse sauvée:', { question: question.label, answer: value });
        
        // Feedback IA simulé
        this.showAIFeedback("⚔️ Bien reçu soldat ! Continue sur ta lancée ! 🔥");

        setTimeout(() => {
            this.currentQuestionIndex++;
            this.renderCurrentQuestion();
        }, 1500);
    }

    showAIFeedback(feedback) {
        const feedbackElement = document.getElementById('aiFeedback');
        const textElement = document.getElementById('feedbackText');
        
        if (feedbackElement && textElement) {
            textElement.textContent = feedback;
            feedbackElement.classList.add('show');
            
            setTimeout(() => {
                feedbackElement.classList.remove('show');
            }, 5000);
        }
    }

    showCheckComplete() {
        const container = document.getElementById('checkContainer');
        if (!container) return;
        
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

    showStats() {
        this.currentCheck = 'stats';
        this.updateActiveNav();
        
        const container = document.getElementById('checkContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="stats-container">
                <h2>📈 STATISTIQUES DE MISSION</h2>
                <p>Interface de statistiques en cours de développement...</p>
                <div class="stats-preview">
                    <div class="stat-card">
                        <div class="stat-value">75.2kg</div>
                        <div class="stat-label">Poids actuel</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">7.5h</div>
                        <div class="stat-label">Sommeil moyen</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">85%</div>
                        <div class="stat-label">Discipline</div>
                    </div>
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

    updateActiveNav() {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-check="${this.currentCheck}"]`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    getCurrentWeekRange() {
        const today = new Date();
        const monday = new Date(today);
        monday.setDate(today.getDate() - today.getDay() + 1);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        return `${monday.toLocaleDateString('fr-FR')} - ${sunday.toLocaleDateString('fr-FR')}`;
    }

    startBackgroundSync() {
        console.log('🔄 Synchronisation en arrière-plan activée');
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

// ✅ INITIALISATION ROBUSTE
let app;

// Fonction d'initialisation sécurisée
function initializeCockpit() {
    try {
        app = new CockpitCombat();
        window.app = app; // Rendre accessible globalement
        console.log('✅ App initialisée et accessible globalement');
    } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
        
        // Interface de secours minimale
        const container = document.getElementById('checkContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; background: #1f2937; border-radius: 1rem; color: white;">
                    <h2>⚔️ COCKPIT DE COMBAT</h2>
                    <p>Mode de secours activé</p>
                    <p style="color: #ef4444; margin: 1rem 0;">Erreur: ${error.message}</p>
                    <button onclick="location.reload()" style="padding: 1rem 2rem; background: #dc2626; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 1rem;">
                        🔄 Recharger la page
                    </button>
                </div>
            `;
        }
    }
}

// Initialisation avec plusieurs tentatives
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCockpit);
} else {
    initializeCockpit();
}

// Fallback après 2 secondes si l'app n'est pas initialisée
setTimeout(() => {
    if (!window.app) {
        console.warn('⚠️ App non initialisée, tentative de récupération...');
        initializeCockpit();
    }
}, 2000);
