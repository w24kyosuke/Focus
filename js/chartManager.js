// ==========================================
// 5. グラフ描画
// ==========================================
const ChartManager = {
    barInstance: null,
    tagBarInstance: null,

    updateAll() {
        this.updateBarChart();
        this.updateTagChart();
    },

    updateBarChart() {
        const days = appState.periodDays;
        const dates = Array.from({length: days}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (days - 1 - i));
            return d.toISOString().split('T')[0];
        });

        const dataMap = dates.reduce((acc, date) => ({ ...acc, [date]: 0 }), {});
        appState.records.forEach(r => {
            if (dataMap[r.date] !== undefined) dataMap[r.date] += r.duration;
        });

        const labels = dates.map(d => d.split('-').slice(1).join('/'));
        const dataPoints = dates.map(d => (dataMap[d] / 60).toFixed(1));

        if (this.barInstance) this.barInstance.destroy();
        this.barInstance = new Chart(document.getElementById('timeChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '累計時間 (時間)',
                    data: dataPoints,
                    backgroundColor: CONFIG.chartColors[0],
                    borderRadius: days === 7 ? 4 : 2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    },

    updateTagChart() {
        const tagMap = {};
        appState.records.forEach(r => {
            const currentTags = r.tags || ['タグなし'];
            currentTags.forEach(tag => {
                tagMap[tag] = (tagMap[tag] || 0) + r.duration;
            });
        });

        const sortedTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
        const labels = sortedTags.map(item => item[0]);
        const dataPoints = sortedTags.map(item => (item[1] / 60).toFixed(1));

        if (this.tagBarInstance) this.tagBarInstance.destroy();
        this.tagBarInstance = new Chart(document.getElementById('tagChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['データなし'],
                datasets: [{
                    label: '累計時間 (時間)',
                    data: dataPoints.length ? dataPoints : [0],
                    backgroundColor: CONFIG.tagBarColor,
                    borderRadius: 4
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true } }
            }
        });
    }
};
