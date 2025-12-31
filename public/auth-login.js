// ログインページのJavaScript

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

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const alertContainer = document.getElementById('alertContainer');

    // すでにログイン済みの場合、プロフィールページにリダイレクト
    checkAuthAndRedirect();

    function checkAuthAndRedirect() {
        const user = Auth.getCurrentUser();
        if (user) {
            window.location.href = '/profile.html';
        }
    }

    // フォーム送信処理
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // エラーメッセージをクリア
        clearErrors();
        clearAlert();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // バリデーション
        let isValid = true;

        if (!email || !isValidEmail(email)) {
            showError('emailError');
            emailInput.classList.add('error');
            isValid = false;
        }

        if (!password) {
            showError('passwordError');
            passwordInput.classList.add('error');
            isValid = false;
        }

        if (!isValid) return;

        // ローディング状態
        setLoading(true);

        // ログイン処理
        const result = await Auth.signIn(email, password);

        if (result.success) {
            showAlert('ログインしました', 'success');
            setTimeout(() => {
                window.location.href = '/profile.html';
            }, 1000);
        } else {
            setLoading(false);
            showAlert(result.error || 'ログインに失敗しました', 'error');
        }
    });

    // メールアドレスのバリデーション
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // エラー表示
    function showError(errorId) {
        const errorElement = document.getElementById(errorId);
        if (errorElement) {
            errorElement.classList.add('show');
        }
    }

    // エラークリア
    function clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
        });
        document.querySelectorAll('.form-input').forEach(el => {
            el.classList.remove('error');
        });
    }

    // アラート表示
    function showAlert(message, type = 'error') {
        const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
        alertContainer.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    }

    // アラートクリア
    function clearAlert() {
        alertContainer.innerHTML = '';
    }

    // ローディング状態の切り替え
    function setLoading(loading) {
        if (loading) {
            loginBtn.disabled = true;
            loginBtnText.innerHTML = '<span class="spinner"></span>';
        } else {
            loginBtn.disabled = false;
            loginBtnText.textContent = 'ログイン';
        }
    }

    // 入力時にエラーをクリア
    emailInput.addEventListener('input', () => {
        emailInput.classList.remove('error');
        document.getElementById('emailError').classList.remove('show');
    });

    passwordInput.addEventListener('input', () => {
        passwordInput.classList.remove('error');
        document.getElementById('passwordError').classList.remove('show');
    });
});
