const express = require('express');
const router = express.Router();
const { db, auth } = require('../firebase-admin');

// 管理者チェックミドルウェア
async function checkAdmin(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: '認証が必要です' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);

        // ユーザー情報を取得
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        // 管理者権限チェック（emailベース）
        const adminEmails = ['l.erick@uubo.jp', 'ckho329@gmail.com'];
        if (!adminEmails.includes(userData.email)) {
            return res.status(403).json({ error: '管理者権限がありません' });
        }

        req.user = { uid: decodedToken.uid, ...userData };
        next();
    } catch (error) {
        console.error('認証エラー:', error);
        res.status(401).json({ error: '認証に失敗しました' });
    }
}

// サイト設定を取得
router.get('/settings', checkAdmin, async (req, res) => {
    try {
        const settingsDoc = await db.collection('site_settings').doc('main').get();

        if (!settingsDoc.exists) {
            // デフォルト設定を返す
            const defaultSettings = {
                hero: {
                    images: [
                        '/images/hero1.jpg',
                        '/images/hero2.jpg',
                        '/images/hero3.jpg'
                    ]
                },
                sections: {
                    news: {
                        title: 'お知らせ',
                        items: []
                    },
                    products: {
                        title: '商品・サービス',
                        items: []
                    }
                },
                links: {
                    onlineShop: 'https://ccconekuto.com/',
                    recycle: '#',
                    buyback: '#'
                }
            };
            return res.json(defaultSettings);
        }

        res.json(settingsDoc.data());
    } catch (error) {
        console.error('設定取得エラー:', error);
        res.status(500).json({ error: '設定の取得に失敗しました' });
    }
});

// サイト設定を更新
router.post('/settings', checkAdmin, async (req, res) => {
    try {
        const settings = req.body;

        await db.collection('site_settings').doc('main').set(settings, { merge: true });

        res.json({ success: true, message: '設定を更新しました' });
    } catch (error) {
        console.error('設定更新エラー:', error);
        res.status(500).json({ error: '設定の更新に失敗しました' });
    }
});

// ページコンテンツを取得
router.get('/pages/:pageId', checkAdmin, async (req, res) => {
    try {
        const { pageId } = req.params;
        const pageDoc = await db.collection('pages').doc(pageId).get();

        if (!pageDoc.exists) {
            return res.status(404).json({ error: 'ページが見つかりません' });
        }

        res.json(pageDoc.data());
    } catch (error) {
        console.error('ページ取得エラー:', error);
        res.status(500).json({ error: 'ページの取得に失敗しました' });
    }
});

// ページコンテンツを更新
router.post('/pages/:pageId', checkAdmin, async (req, res) => {
    try {
        const { pageId } = req.params;
        const content = req.body;

        await db.collection('pages').doc(pageId).set({
            ...content,
            updatedAt: new Date().toISOString(),
            updatedBy: req.user.email
        }, { merge: true });

        res.json({ success: true, message: 'ページを更新しました' });
    } catch (error) {
        console.error('ページ更新エラー:', error);
        res.status(500).json({ error: 'ページの更新に失敗しました' });
    }
});

// 全ページ一覧を取得
router.get('/pages', checkAdmin, async (req, res) => {
    try {
        const pagesSnapshot = await db.collection('pages').get();
        const pages = [];

        pagesSnapshot.forEach(doc => {
            pages.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json(pages);
    } catch (error) {
        console.error('ページ一覧取得エラー:', error);
        res.status(500).json({ error: 'ページ一覧の取得に失敗しました' });
    }
});

// 画像をアップロード（Base64形式で受け取る）
router.post('/upload-image', checkAdmin, async (req, res) => {
    try {
        const { imageData, fileName } = req.body;

        // 実際の実装ではFirebase Storageにアップロードする
        // ここではFirestoreに保存する簡易版
        const imageDoc = await db.collection('images').add({
            fileName,
            data: imageData,
            uploadedAt: new Date().toISOString(),
            uploadedBy: req.user.email
        });

        res.json({
            success: true,
            imageId: imageDoc.id,
            url: `/api/admin/images/${imageDoc.id}`
        });
    } catch (error) {
        console.error('画像アップロードエラー:', error);
        res.status(500).json({ error: '画像のアップロードに失敗しました' });
    }
});

module.exports = router;
