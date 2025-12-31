// 管理者ページのJavaScript

let currentUser = null;
let currentToken = null;
let currentPageId = null;

// 初期化を待つ
function waitForAuth() {
    return new Promise((resolve) => {
        const checkAuth = () => {
            if (window.Auth) {
                resolve();
            } else {
                setTimeout(checkAuth, 100);
            }
        };
        checkAuth();
    });
}

// ページ読み込み時
document.addEventListener('DOMContentLoaded', async () => {
    await waitForAuth();

    // 認証チェック
    Auth.onAuthStateChange(async (user) => {
        if (!user) {
            window.location.href = '/login.html';
            return;
        }

        currentUser = user;
        currentToken = await user.getIdToken();

        // 管理者権限チェック
        const adminEmails = ['l.erick@uubo.jp', 'ckho329@gmail.com'];
        if (!adminEmails.includes(user.email)) {
            showAlert('管理者権限がありません', 'error');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
            return;
        }

        document.getElementById('adminUser').textContent = `管理者: ${user.email}`;

        // 設定を読み込む
        await loadSettings();
    });

    // ログアウトボタン
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await Auth.signOut();
        window.location.href = '/';
    });

    // タブ切り替え
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.dataset.tab);
        });
    });
});

// タブ切り替え
function switchTab(tabName) {
    // タブボタンの状態を更新
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // タブコンテンツの表示を更新
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// 設定を読み込む
async function loadSettings() {
    try {
        const response = await fetch('/api/admin/settings', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (!response.ok) {
            throw new Error('設定の読み込みに失敗しました');
        }

        const settings = await response.json();

        // ヒーロー画像
        if (settings.hero && settings.hero.images) {
            document.getElementById('heroImages').value = settings.hero.images.join(', ');
            updateHeroPreview();
        }

        // リンク
        if (settings.links) {
            document.getElementById('linkOnlineShop').value = settings.links.onlineShop || '';
            document.getElementById('linkRecycle').value = settings.links.recycle || '';
            document.getElementById('linkBuyback').value = settings.links.buyback || '';
        }
    } catch (error) {
        console.error('設定読み込みエラー:', error);
        showAlert('設定の読み込みに失敗しました', 'error');
    }
}

// ヒーロー画像のプレビューを更新
function updateHeroPreview() {
    const imagesText = document.getElementById('heroImages').value;
    const images = imagesText.split(',').map(img => img.trim()).filter(img => img);

    const preview = document.getElementById('heroPreview');
    preview.innerHTML = images.map(img => `<img src="${img}" alt="Hero Image">`).join('');
}

// ヒーロー画像の入力時にプレビュー更新
document.addEventListener('DOMContentLoaded', () => {
    const heroImagesInput = document.getElementById('heroImages');
    if (heroImagesInput) {
        heroImagesInput.addEventListener('input', updateHeroPreview);
    }
});

// ヒーロー設定を保存
async function saveHeroSettings() {
    try {
        const imagesText = document.getElementById('heroImages').value;
        const images = imagesText.split(',').map(img => img.trim()).filter(img => img);

        const response = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                hero: {
                    images: images
                }
            })
        });

        if (!response.ok) {
            throw new Error('保存に失敗しました');
        }

        showAlert('ヒーロー画像を保存しました', 'success');
    } catch (error) {
        console.error('保存エラー:', error);
        showAlert('保存に失敗しました', 'error');
    }
}

// リンク設定を保存
async function saveLinks() {
    try {
        const links = {
            onlineShop: document.getElementById('linkOnlineShop').value,
            recycle: document.getElementById('linkRecycle').value,
            buyback: document.getElementById('linkBuyback').value
        };

        const response = await fetch('/api/admin/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                links: links
            })
        });

        if (!response.ok) {
            throw new Error('保存に失敗しました');
        }

        showAlert('リンク設定を保存しました', 'success');
    } catch (error) {
        console.error('保存エラー:', error);
        showAlert('保存に失敗しました', 'error');
    }
}

// ページを編集
async function editPage(pageId) {
    currentPageId = pageId;

    try {
        const response = await fetch(`/api/admin/pages/${pageId}`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        let content = '';
        if (response.ok) {
            const data = await response.json();
            content = data.content || '';
        }

        document.getElementById('pageEditorTitle').textContent = `${pageId}.html を編集`;
        document.getElementById('pageContent').value = content;
        document.getElementById('pageEditor').style.display = 'block';

        // エディタまでスクロール
        document.getElementById('pageEditor').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('ページ読み込みエラー:', error);
        showAlert('ページの読み込みに失敗しました', 'error');
    }
}

// ページを保存
async function savePage() {
    if (!currentPageId) return;

    try {
        const content = document.getElementById('pageContent').value;

        const response = await fetch(`/api/admin/pages/${currentPageId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
                content: content
            })
        });

        if (!response.ok) {
            throw new Error('保存に失敗しました');
        }

        showAlert('ページを保存しました', 'success');
        cancelEdit();
    } catch (error) {
        console.error('保存エラー:', error);
        showAlert('保存に失敗しました', 'error');
    }
}

// 編集をキャンセル
function cancelEdit() {
    document.getElementById('pageEditor').style.display = 'none';
    document.getElementById('pageContent').value = '';
    currentPageId = null;
}

// アラート表示
function showAlert(message, type = 'success') {
    const alertContainer = document.getElementById('alertContainer');
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    alertContainer.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;

    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

// グローバルに公開
window.saveHeroSettings = saveHeroSettings;
window.saveLinks = saveLinks;
window.editPage = editPage;
window.savePage = savePage;
window.cancelEdit = cancelEdit;
