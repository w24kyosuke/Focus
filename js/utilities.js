// ==========================================
// 7. ユーティリティ関数
// ==========================================
const Utilities = {
    formatTime(ms) {
        const totalSec = Math.floor(ms / 1000);
        const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
        const s = String(totalSec % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    },

    exportCSV() {
        if (appState.records.length === 0) return alert('書き出すデータがありません。');

        let csvContent = "\uFEFF日付,タグ(複数),集中時間(分),集中時間(時間)\n";
        appState.records.forEach(r => {
            const hours = (r.duration / 60).toFixed(2);
            const tagsStr = (r.tags && r.tags.length > 0) ? r.tags.join(' & ') : 'タグなし';
            csvContent += `${r.date},${tagsStr},${r.duration.toFixed(1)},${hours}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `focus_time_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
};
