// ヘッダーの認証状態管理

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

document.addEventListener('DOMContentLoaded', async () => {
    // Authの初期化を待つ
    await waitForAuth();

    const headerAuthBtn = document.getElementById('headerAuthBtn');
    const headerAuthText = document.getElementById('headerAuthText');

    if (!headerAuthBtn || !headerAuthText) {
        return; // 要素が存在しない場合は何もしない
    }

    // 認証状態の変更を監視
    Auth.onAuthStateChange((user) => {
        if (user) {
            // ログイン済みの場合
            const fullName = user.displayName || 'ユーザー';
            const firstName = fullName.split(' ')[0] || fullName.split('　')[0] || fullName;

            headerAuthBtn.href = '/profile.html';
            headerAuthText.textContent = `${firstName}さん`;
        } else {
            // 未ログインの場合
            headerAuthBtn.href = '/login.html';
            headerAuthText.textContent = 'ログインする';
        }
    });
});
