// ==========================================
// 2. アプリ状態・DOM参照
// ==========================================
const appState = {
    syncId: localStorage.getItem('lastSyncId') || '',
    records: [],
    tags: JSON.parse(JSON.stringify(CONFIG.defaultTags)),
    periodDays: 7,
    timer: { intervalId: null, startTime: null, elapsedMs: 0, isRunning: false }
};

const DOM = {
    syncIdInput: document.getElementById('syncIdInput'),
    tagsContainer: document.getElementById('tagsContainer'),
    addCategorySelect: document.getElementById('addCategorySelect'),
    newTagInput: document.getElementById('newTagInput'),
    newCategoryInput: document.getElementById('newCategoryInput'),
    timeDisplay: document.getElementById('timeDisplay'),
    btnStart: document.getElementById('startBtn'),
    btnPause: document.getElementById('pauseBtn'),
    btnFinish: document.getElementById('finishBtn'),
    btn7d: document.getElementById('btn7d'),
    btn30d: document.getElementById('btn30d')
};
