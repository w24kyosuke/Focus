// ==========================================
// 6. UI操作
// ==========================================
const UIManager = {
    init() {
        // アプリ起動時は常にUIを描画する
        this.renderTags();
        ChartManager.updateAll();

        // 過去の同期IDがあれば自動読み込みを試みる
        if (appState.syncId && CloudManager.isAvailable) {
            DOM.syncIdInput.value = appState.syncId;
            CloudManager.loadData(appState.syncId);
        }
    },

    renderTags() {
        const checkedBoxes = Array.from(DOM.tagsContainer.querySelectorAll('input:checked')).map(cb => cb.value);

        let html = '';
        for (const [category, tagsList] of Object.entries(appState.tags)) {
            html += `
            <div class="tag-category-group">
                <div class="category-title">📁 ${category}</div>
                <div class="checkbox-group">
                    ${tagsList.length > 0
                        ? tagsList.map(t => {
                            const isChecked = checkedBoxes.includes(t) ? 'checked' : '';
                            return `<label class="cb-label"><input type="checkbox" value="${t}" ${isChecked}> ${t}</label>`;
                        }).join('')
                        : `<span class="empty-msg">（まだタグがありません）</span>`
                    }
                </div>
            </div>`;
        }
        DOM.tagsContainer.innerHTML = html;

        const currentCat = DOM.addCategorySelect.value;
        DOM.addCategorySelect.innerHTML = Object.keys(appState.tags).map(c => `<option value="${c}">${c}</option>`).join('');
        if (appState.tags[currentCat]) DOM.addCategorySelect.value = currentCat;
    },

    addNewTag() {
        const category = DOM.addCategorySelect.value;
        const newTag = DOM.newTagInput.value.trim();

        if (category && newTag) {
            const allExisting = Object.values(appState.tags).flat();
            if (!allExisting.includes(newTag)) {
                appState.tags[category].push(newTag);
                CloudManager.saveData();
                DOM.newTagInput.value = '';
                this.renderTags();

                setTimeout(() => {
                    const newCheckbox = Array.from(DOM.tagsContainer.querySelectorAll('input')).find(cb => cb.value === newTag);
                    if (newCheckbox) newCheckbox.checked = true;
                }, 50);
            } else {
                alert("そのタグは既に存在しています。");
            }
        }
    },

    addNewCategory() {
        const newCat = DOM.newCategoryInput.value.trim();
        if (newCat && !appState.tags[newCat]) {
            appState.tags[newCat] = [];
            CloudManager.saveData();
            DOM.newCategoryInput.value = '';
            this.renderTags();
            DOM.addCategorySelect.value = newCat;
        }
    },

    updateTimerButtons(status) {
        const { btnStart, btnPause, btnFinish } = DOM;
        const checkboxes = DOM.tagsContainer.querySelectorAll('input');

        if (status === 'running') {
            btnStart.style.display = 'none';
            btnPause.style.display = 'block';
            btnFinish.style.display = 'block';
            checkboxes.forEach(cb => cb.disabled = true);
        } else if (status === 'paused') {
            btnStart.style.display = 'block';
            btnStart.textContent = '再開';
            btnPause.style.display = 'none';
        } else if (status === 'stopped') {
            btnStart.style.display = 'block';
            btnStart.textContent = 'スタート';
            btnPause.style.display = 'none';
            btnFinish.style.display = 'none';
            checkboxes.forEach(cb => cb.disabled = false);
        }
    },

    changePeriod(days) {
        appState.periodDays = days;
        DOM.btn7d.classList.toggle('active', days === 7);
        DOM.btn30d.classList.toggle('active', days === 30);
        ChartManager.updateBarChart();
    }
};
