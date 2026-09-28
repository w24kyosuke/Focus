// ==========================================
// 3. Firebase連携
// ==========================================
const CloudManager = {
    db: null,
    isAvailable: false,

    init() {
        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(CONFIG.firebase);
            }
            this.db = firebase.database();
            this.isAvailable = true;
        } catch (e) {
            console.error("Firebaseの初期化に失敗しました。ローカルモードで動作します:", e);
        }
    },

    handleLoadRequest() {
        const inputId = DOM.syncIdInput.value.trim();
        if (!inputId) return alert("同期IDを入力してください！");

        if (!this.isAvailable) {
            alert("データベースに接続できません。設定を確認してください。");
            return;
        }
        this.loadData(inputId);
    },

    loadData(syncId) {
        if (!this.isAvailable) return;
        appState.syncId = syncId;
        localStorage.setItem('lastSyncId', syncId);

        this.db.ref(`users/${syncId}`).once('value').then((snapshot) => {
            const data = snapshot.val() || {};

            // タグのマイグレーション
            let mergedTags = JSON.parse(JSON.stringify(CONFIG.defaultTags));
            if (data.tags) {
                if (Array.isArray(data.tags)) {
                    if (!mergedTags["その他"]) mergedTags["その他"] = [];
                    const allExisting = Object.values(mergedTags).flat();
                    data.tags.forEach(t => {
                        if (!allExisting.includes(t) && t !== "一般") {
                            mergedTags["その他"].push(t);
                        }
                    });
                } else {
                    Object.keys(data.tags).forEach(cat => {
                        if (cat === "-" || cat === "未分類") {
                            if (!mergedTags["その他"]) mergedTags["その他"] = [];
                            data.tags[cat].forEach(t => { if (!mergedTags["その他"].includes(t)) mergedTags["その他"].push(t); });
                        } else {
                            if (!mergedTags[cat]) mergedTags[cat] = [];
                            data.tags[cat].forEach(t => {
                                if (t !== "一般" && !mergedTags[cat].includes(t)) mergedTags[cat].push(t);
                            });
                        }
                    });
                }
            }
            appState.tags = mergedTags;

            // 記録データのマイグレーション
            appState.records = (data.records || []).map(r => {
                let currentTags = r.tags || [];
                if (currentTags.length === 0) {
                    if (r.mainTag && r.mainTag !== "未分類" && r.mainTag !== "-") currentTags.push(r.mainTag);
                    if (r.subTags) currentTags = currentTags.concat(r.subTags);
                    else if (r.subTag) currentTags.push(r.subTag);
                    if (r.tag) currentTags.push(r.tag);
                }
                r.tags = Array.from(new Set(currentTags.filter(t => t && t !== "一般")));
                if (r.tags.length === 0) r.tags = ["タグなし"];
                return r;
            });

            UIManager.renderTags();
            ChartManager.updateAll();
        }).catch(error => {
            console.error("データの読み込みに失敗しました:", error);
            alert("データベースからの読み込みに失敗しました。");
        });
    },

    saveData() {
        if (!this.isAvailable || !appState.syncId) return;

        const limitDate = new Date();
        limitDate.setDate(limitDate.getDate() - CONFIG.dataRetentionDays);
        const limitStr = limitDate.toISOString().split('T')[0];
        appState.records = appState.records.filter(r => r.date >= limitStr);

        this.db.ref(`users/${appState.syncId}`).set({
            records: appState.records,
            tags: appState.tags
        }).catch(error => {
            console.error("データの保存に失敗しました:", error);
        });
    }
};
