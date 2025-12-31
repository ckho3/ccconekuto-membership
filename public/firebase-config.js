// Firebase Configuration
// ⚠️ このファイルはFirebaseコンソールから取得した設定情報で更新してください
// https://console.firebase.google.com/ → プロジェクト設定 → アプリ → Firebase SDK snippet

// Firebase SDKをインポート
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase設定（Firebaseコンソールから取得）
const firebaseConfig = {
    apiKey: "AIzaSyANlzYKtsr-MBGJyiR8cOiVUsFNnf2zEak",
    authDomain: "ccconekuto-membership.firebaseapp.com",
    projectId: "ccconekuto-membership",
    storageBucket: "ccconekuto-membership.firebasestorage.app",
    messagingSenderId: "860037735556",
    appId: "1:860037735556:web:222aaccbb3d70e6b3a0ed1",
    measurementId: "G-B79P636GH0"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 認証ヘルパー関数
const Auth = {
    // サインアップ
    async signUp(email, password, userData = {}) {
        try {
            // ユーザー作成
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // プロフィール更新
            if (userData.full_name) {
                await updateProfile(user, {
                    displayName: userData.full_name
                });
            }

            // Firestoreにユーザー情報を保存
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                full_name: userData.full_name || '',
                created_at: serverTimestamp(),
                updated_at: serverTimestamp()
            });

            return { success: true, user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: getErrorMessage(error.code) };
        }
    },

    // ログイン
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: getErrorMessage(error.code) };
        }
    },

    // ログアウト
    async signOut() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    },

    // 現在のユーザー取得
    getCurrentUser() {
        return auth.currentUser;
    },

    // 認証状態の変更をリッスン
    onAuthStateChange(callback) {
        return onAuthStateChanged(auth, callback);
    },

    // Firestoreからユーザー情報を取得
    async getUserData(uid) {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { success: true, data: docSnap.data() };
            } else {
                return { success: false, error: 'ユーザーデータが見つかりません' };
            }
        } catch (error) {
            console.error('Get user data error:', error);
            return { success: false, error: error.message };
        }
    },

    // Firestoreのユーザー情報を更新
    async updateUserData(uid, data) {
        try {
            const docRef = doc(db, 'users', uid);
            await updateDoc(docRef, {
                ...data,
                updated_at: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Update user data error:', error);
            return { success: false, error: error.message };
        }
    }
};

// エラーメッセージを日本語に変換
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
        'auth/invalid-email': 'メールアドレスの形式が正しくありません',
        'auth/operation-not-allowed': 'この操作は許可されていません',
        'auth/weak-password': 'パスワードが弱すぎます（6文字以上必要）',
        'auth/user-disabled': 'このアカウントは無効化されています',
        'auth/user-not-found': 'ユーザーが見つかりません',
        'auth/wrong-password': 'パスワードが間違っています',
        'auth/invalid-credential': 'メールアドレスまたはパスワードが間違っています',
        'auth/too-many-requests': 'リクエストが多すぎます。しばらく待ってから再試行してください',
        'auth/network-request-failed': 'ネットワークエラーが発生しました'
    };

    return errorMessages[errorCode] || 'エラーが発生しました';
}

// グローバルに公開
window.Auth = Auth;
window.auth = auth;
window.db = db;
