// Firebase Admin SDK設定
const admin = require('firebase-admin');
require('dotenv').config();

// Firebase Admin SDKを初期化
if (!admin.apps.length) {
    try {
        // Vercel環境: 環境変数からJSON文字列を読み込む
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin SDK initialized with service account from env variable');
        }
        // ローカル環境: ファイルパスから読み込む
        else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
            const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log('✅ Firebase Admin SDK initialized with service account from file');
        }
        // フォールバック: プロジェクトIDのみで初期化（制限付き）
        else {
            admin.initializeApp({
                projectId: process.env.FIREBASE_PROJECT_ID
            });
            console.log('⚠️  Firebase Admin SDK initialized with project ID only (limited functionality)');
        }
    } catch (error) {
        console.error('❌ Firebase Admin SDK initialization error:', error.message);
        console.log('⚠️  サービスアカウントキーが必要です。');
        console.log('   Firebaseコンソール > プロジェクト設定 > サービスアカウント > 新しい秘密鍵の生成');
        throw error;
    }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
    admin,
    db,
    auth
};
