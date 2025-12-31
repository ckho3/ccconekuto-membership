const express = require('express');
const router = express.Router();
const { db } = require('../firebase-admin');

// アクセストークン検証ミドルウェア
function verifySmaregiToken(req, res, next) {
    const token = req.headers['x-access-token'];
    const EXTERNAL_TOKEN = process.env.SMAREGI_EXTERNAL_ACCESS_TOKEN;

    if (token !== EXTERNAL_TOKEN) {
        return res.status(401).json({
            result: [],
            error: {
                code: "UNAUTHORIZED",
                message: "アクセストークンが無効です。"
            }
        });
    }

    next();
}

// エラーレスポンス送信ヘルパー
function sendSmaregiError(res, code, message, statusCode = 400) {
    res.status(statusCode).json({
        result: [],
        error: {
            code: code,
            message: message
        }
    });
}

// 会員一覧取得API
router.post('/customers/list', verifySmaregiToken, async (req, res) => {
    try {
        const { searchString, storeCode } = req.body;

        console.log(`[会員一覧取得] searchString: ${searchString}, storeCode: ${storeCode}`);

        if (!searchString) {
            return sendSmaregiError(res, "MISSING_PARAMETER", "検索文字列が入力されていません。");
        }

        // Firestoreから会員検索
        let query = db.collection('users');

        // 検索文字列で会員を検索（簡易実装: 名前で検索）
        // 本番環境では、複数フィールドでの検索を実装
        const snapshot = await query.limit(100).get();

        const customers = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            const fullName = (data.full_name || '').toLowerCase();
            const email = (data.email || '').toLowerCase();
            const customerCode = (data.customerCode || '').toLowerCase();
            const search = searchString.toLowerCase();

            // 簡易検索: 名前、メール、会員コードで部分一致
            if (fullName.includes(search) ||
                email.includes(search) ||
                customerCode.includes(search)) {

                customers.push({
                    customerId: data.customerId || parseInt(doc.id.substring(0, 10)),
                    customerCode: data.customerCode || doc.id,
                    lastName: data.lastName || '',
                    firstName: data.firstName || '',
                    status: data.status || "0"
                });
            }
        });

        res.status(200).json({
            result: {
                count: customers.length,
                customers: customers
            }
        });

    } catch (error) {
        console.error('[会員一覧取得エラー]', error);
        sendSmaregiError(res, "INTERNAL_ERROR", "内部エラーが発生しました。", 500);
    }
});

// 会員情報取得API
router.post('/customers/detail', verifySmaregiToken, async (req, res) => {
    try {
        const { customerCode, storeCode, terminalTranDateTime } = req.body;

        console.log(`[会員情報取得] customerCode: ${customerCode}, storeCode: ${storeCode}`);

        if (!customerCode) {
            return sendSmaregiError(res, "MISSING_PARAMETER", "会員コードが入力されていません。");
        }

        // Firestoreから会員検索
        const snapshot = await db.collection('users')
            .where('customerCode', '==', customerCode)
            .limit(1)
            .get();

        if (snapshot.empty) {
            // 会員が見つからない場合
            return res.status(200).json({
                result: null,
                error: {
                    code: "NOT_FOUND",
                    message: "会員が見つかりません。"
                }
            });
        }

        const doc = snapshot.docs[0];
        const data = doc.data();

        // スマレジ形式に変換（全フィールド対応）
        const customer = {
            // 必須フィールド
            customerId: data.customerId || parseInt(doc.id.substring(0, 10)),
            customerCode: data.customerCode || doc.id,
            status: data.status || "0",
            lastName: data.lastName || '',
            firstName: data.firstName || '',

            // レシート印字用
            customerNo: data.customerNo || null,
            pinCode: data.pinCode || null,

            // ランク情報
            rank: data.rank || null,
            staffRank: data.staffRank || null,

            // カナ氏名
            lastKana: data.lastKana || null,
            firstKana: data.firstKana || null,

            // 基本情報
            sex: data.sex || "0",
            birthDate: data.birthDate || null,

            // ポイント・マイル情報
            point: data.point || 0,
            pointExpireDate: data.pointExpireDate || null,
            mile: data.mile || 0,

            // ポイント付与設定
            pointGivingUnitPrice: data.pointGivingUnitPrice || null,
            pointGivingUnit: data.pointGivingUnit || null,

            // 日付情報
            lastComeDateTime: data.lastComeDateTime || null,
            entryDate: data.entryDate || null,
            leaveDate: data.leaveDate || null,

            // 連絡先情報
            postCode: data.postCode || null,
            address: data.address || null,
            phoneNumber: data.phoneNumber || null,
            mobileNumber: data.mobileNumber || null,
            faxNumber: data.faxNumber || null,
            mailAddress: data.email || null,

            // 備考
            note: data.note || null,
            note2: data.note2 || null
        };

        res.status(200).json({
            result: customer
        });

    } catch (error) {
        console.error('[会員情報取得エラー]', error);
        sendSmaregiError(res, "INTERNAL_ERROR", "内部エラーが発生しました。", 500);
    }
});

// Webhook: ポイント更新完了通知
router.post('/webhook/point-update', async (req, res) => {
    try {
        const { requestId, status, successCount, errorCount } = req.body;

        console.log(`[Webhook] requestId: ${requestId}, status: ${status}, success: ${successCount}, error: ${errorCount}`);

        // 同期ログを記録
        await db.collection('sync_logs').add({
            requestId: requestId,
            status: status,
            successCount: successCount || 0,
            errorCount: errorCount || 0,
            type: 'point_update',
            created_at: new Date()
        });

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('[Webhook処理エラー]', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
