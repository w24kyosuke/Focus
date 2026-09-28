// ==========================================
// 4. タイマー制御
// ==========================================
const TimerManager = {
    start() {
        if (appState.timer.isRunning) return;
        appState.timer.isRunning = true;
        appState.timer.startTime = Date.now();
        appState.timer.intervalId = setInterval(() => this.updateDisplay(), 100);
        UIManager.updateTimerButtons('running');
    },

    pause() {
        if (!appState.timer.isRunning) return;
        appState.timer.isRunning = false;
        appState.timer.elapsedMs += Date.now() - appState.timer.startTime;
        clearInterval(appState.timer.intervalId);
        UIManager.updateTimerButtons('paused');
    },

    finish() {
        if (appState.timer.isRunning) appState.timer.elapsedMs += Date.now() - appState.timer.startTime;
        clearInterval(appState.timer.intervalId);
        appState.timer.isRunning = false;

        if (appState.timer.elapsedMs > 1000) {
            const checkedInputs = Array.from(DOM.tagsContainer.querySelectorAll('input:checked'));
            const selectedTags = checkedInputs.map(input => input.value);
            if (selectedTags.length === 0) selectedTags.push("タグなし");

            appState.records.push({
                date: new Date().toISOString().split('T')[0],
                tags: selectedTags,
                duration: appState.timer.elapsedMs / (1000 * 60)
            });
            CloudManager.saveData();
            ChartManager.updateAll();
        }

        this.reset();
        UIManager.updateTimerButtons('stopped');
    },

    reset() {
        appState.timer.elapsedMs = 0;
        this.updateDisplay();
    },

    updateDisplay() {
        const { isRunning, elapsedMs, startTime } = appState.timer;
        const currentMs = isRunning ? elapsedMs + (Date.now() - startTime) : elapsedMs;
        DOM.timeDisplay.textContent = Utilities.formatTime(currentMs);
    }
};
