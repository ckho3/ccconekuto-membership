// 新規登録ページのJavaScript

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

    const registerForm = document.getElementById('registerForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const registerBtn = document.getElementById('registerBtn');
    const registerBtnText = document.getElementById('registerBtnText');
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
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // エラーメッセージをクリア
        clearErrors();
        clearAlert();

        const fullName = fullNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        // バリデーション
        let isValid = true;

        if (!fullName) {
            showError('fullNameError');
            fullNameInput.classList.add('error');
            isValid = false;
        }

        if (!email || !isValidEmail(email)) {
            showError('emailError');
            emailInput.classList.add('error');
            isValid = false;
        }

        if (!password || password.length < 6) {
            showError('passwordError');
            passwordInput.classList.add('error');
            isValid = false;
        }

        if (password !== confirmPassword) {
            showError('confirmPasswordError');
            confirmPasswordInput.classList.add('error');
            isValid = false;
        }

        if (!isValid) return;

        // ローディング状態
        setLoading(true);

        // 新規登録処理
        const result = await Auth.signUp(email, password, {
            full_name: fullName
        });

        if (result.success) {
            showAlert('登録が完了しました。ログインページに移動します。', 'success');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        } else {
            setLoading(false);
            showAlert(result.error || '登録に失敗しました', 'error');
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
            registerBtn.disabled = true;
            registerBtnText.innerHTML = '<span class="spinner"></span>';
        } else {
            registerBtn.disabled = false;
            registerBtnText.textContent = '登録する';
        }
    }

    // 入力時にエラーをクリア
    fullNameInput.addEventListener('input', () => {
        fullNameInput.classList.remove('error');
        document.getElementById('fullNameError').classList.remove('show');
    });

    emailInput.addEventListener('input', () => {
        emailInput.classList.remove('error');
        document.getElementById('emailError').classList.remove('show');
    });

    passwordInput.addEventListener('input', () => {
        passwordInput.classList.remove('error');
        document.getElementById('passwordError').classList.remove('show');
    });

    confirmPasswordInput.addEventListener('input', () => {
        confirmPasswordInput.classList.remove('error');
        document.getElementById('confirmPasswordError').classList.remove('show');
    });
});
