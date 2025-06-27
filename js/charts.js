class ChartsManager {
    constructor() {
        this.charts = {};
    }

    async loadCharts() {
        const data = await app.githubAPI.getAllData();
        
        this.createWeightChart(data);
        this.createSleepChart(data);
        this.createPerformanceChart(data);
        this.createMoodChart(data);
    }

    createWeightChart(data) {
        const weightData = data
            .filter(item => item.question_id === 'weight')
            .map(item => ({
                date: item.date,
                weight: parseFloat(item.answer)
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const ctx = document.getElementById('weightChart').getContext('2d');
        
        this.charts.weight = new Chart(ctx, {
            type: 'line',
            data: {
                labels: weightData.map(d => d.date),
                datasets: [{
                    label: 'Poids (kg)',
                    data: weightData.map(d => d.weight),
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
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
                        color: '#ffffff'
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }

    createSleepChart(data) {
        const sleepData = data
            .filter(item => item.question_id === 'sleep_quality')
            .map(item => ({
                date: item.date,
                quality: parseInt(item.answer)
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const ctx = document.getElementById('sleepChart').getContext('2d');
        
        this.charts.sleep = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sleepData.map(d => d.date),
                datasets: [{
                    label: 'Qualité Sommeil',
                    data: sleepData.map(d => d.quality),
                    backgroundColor: sleepData.map(d => 
                        d.quality >= 7 ? '#10b981' : 
                        d.quality >= 5 ? '#f59e0b' : '#dc2626'
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
                        color: '#ffffff'
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        min: 0,
                        max: 10,
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }

    createPerformanceChart(data) {
        const recoveryData = data
            .filter(item => item.question_id === 'recovery')
            .map(item => ({
                date: item.date,
                recovery: parseInt(item.answer)
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const ctx = document.getElementById('performanceChart').getContext('2d');
        
        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: recoveryData.map(d => d.date),
                datasets: [{
                    label: 'Récupération',
                    data: recoveryData.map(d => d.recovery),
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
                        color: '#ffffff'
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    y: {
                        min: 0,
                        max: 10,
                        ticks: { color: '#ffffff' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }

    createMoodChart(data) {
        const moodData = data
            .filter(item => item.question_id === 'day_rating')
            .map(item => ({
                date: item.date,
                rating: parseInt(item.answer)
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        const ctx = document.getElementById('moodChart').getContext('2d');
        
        this.charts.mood = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Excellent (8-10)', 'Bon (6-7)', 'Moyen (4-5)', 'Faible (1-3)'],
                datasets: [{
                    data: [
                        moodData.filter(d => d.rating >= 8).length,
                        moodData.filter(d => d.rating >= 6 && d.rating < 8).length,
                        moodData.filter(d => d.rating >= 4 && d.rating < 6).length,
                        moodData.filter(d => d.rating < 4).length
                    ],
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
                        color: '#ffffff'
                    },
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }
}
