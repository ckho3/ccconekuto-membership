// Firebase Admin SDK設定
const admin = require('firebase-admin');
require('dotenv').config();

// Firebase Admin SDKを初期化
// 開発環境用: Application Default Credentials を使用
if (!admin.apps.length) {
    try {
        // 環境変数にサービスアカウントキーのパスがあれば使用
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
            const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            // 開発環境: プロジェクトIDのみで初期化（制限付き）
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID
            });
        }
        console.log('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
        console.error('❌ Firebase Admin SDK initialization error:', error.message);
        console.log('⚠️  サービスアカウントキーが必要です。');
        console.log('   Firebaseコンソール > プロジェクト設定 > サービスアカウント > 新しい秘密鍵の生成');
    }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
    admin,
    db,
    auth
};
