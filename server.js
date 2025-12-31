const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// スマレジAPIルーター
const smaregiRouter = require('./routes/smaregi');
app.use('/api/smaregi', smaregiRouter);

// ルートパス
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404エラーハンドリング
app.use((req, res) => {
    res.status(404).send('ページが見つかりません');
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`  CCコネクト会員システムが起動しました!`);
    console.log(`========================================`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  スマレジAPI: http://localhost:${PORT}/api/smaregi`);
    console.log(`========================================\n`);
    console.log(`ブラウザで http://localhost:${PORT} を開いてください。`);
    console.log(`サーバーを停止するには Ctrl+C を押してください。\n`);
});

// エラーハンドリング
process.on('uncaughtException', (err) => {
    console.error('予期しないエラーが発生しました:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('未処理のPromise拒否:', reason);
});
