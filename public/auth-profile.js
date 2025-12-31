// プロフィールページのJavaScript

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

    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileId = document.getElementById('profileId');
    const profileCreatedAt = document.getElementById('profileCreatedAt');
    const profileLastLogin = document.getElementById('profileLastLogin');
    const profileAvatar = document.getElementById('profileAvatar');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnText = document.getElementById('logoutBtnText');

    // 認証チェック
    Auth.onAuthStateChange(async (user) => {
        if (!user) {
            // 未ログインの場合、ログインページにリダイレクト
            window.location.href = '/login.html';
            return;
        }

        // ユーザー情報を表示
        await displayUserInfo(user);
    });

    // ログアウトボタンのイベントリスナー
    logoutBtn.addEventListener('click', async () => {
        if (confirm('ログアウトしますか？')) {
            await handleLogout();
        }
    });

    // ユーザー情報を表示
    async function displayUserInfo(user) {
        const fullName = user.displayName || 'ユーザー';
        const email = user.email;
        const userId = user.uid.substring(0, 8);

        // Firestoreからユーザーデータを取得
        const userData = await Auth.getUserData(user.uid);

        let createdAt = '不明';
        let lastSignIn = '不明';

        if (user.metadata) {
            if (user.metadata.creationTime) {
                createdAt = new Date(user.metadata.creationTime).toLocaleDateString('ja-JP');
            }
            if (user.metadata.lastSignInTime) {
                lastSignIn = new Date(user.metadata.lastSignInTime).toLocaleString('ja-JP');
            }
        }

        profileName.textContent = fullName;
        profileEmail.textContent = email;
        profileId.textContent = userId;
        profileCreatedAt.textContent = createdAt;
        profileLastLogin.textContent = lastSignIn;

        // アバターのイニシャルを設定
        const initial = fullName.charAt(0).toUpperCase();
        profileAvatar.textContent = initial;
    }

    // ログアウト処理
    async function handleLogout() {
        logoutBtn.disabled = true;
        logoutBtnText.innerHTML = '<span class="spinner"></span>';

        const result = await Auth.signOut();

        if (result.success) {
            window.location.href = '/login.html';
        } else {
            alert('ログアウトに失敗しました');
            logoutBtn.disabled = false;
            logoutBtnText.textContent = 'ログアウト';
        }
    }
});
