# マイスケジュール

TimeTree と連携した「今日の予定」表示、日々の「やること」チェックリスト（未完了は翌日に自動繰越）、
クライアントワークのタスク管理を1つにまとめた、個人用の Web アプリです。

## 機能

- **今日の予定**: 設定した TimeTree の ICS 購読URLから、当日の予定を取得して表示します（繰り返し予定にも対応）。
- **やること**: 日々やりたいことを追加し、完了/未完了をチェックできます。未完了の項目は翌日開いたときに自動的に繰り越されます。
- **クライアント**: クライアントごとにタスクを登録し、未着手/進行中/完了のステータスを管理できます。
- ログイン機能付き（個人利用を想定した単一ユーザー）。

## セットアップ

```bash
npm install
cp .env.example .env
# .env を編集: AUTH_SECRET, APP_USER_EMAIL, APP_USER_PASSWORD などを設定
npx prisma migrate dev
npx prisma db seed
npm run dev
```

http://localhost:3000 を開いてログインしてください。

### TimeTree との連携方法

1. TimeTreeアプリで対象のカレンダーを開く
2. カレンダー設定 →「エクスポート」からICS(iCal)形式の購読用URLを発行
3. アプリ内の「⚙️ 設定」画面にそのURLを貼り付けて保存

TimeTreeは新規開発者向けの公式APIキー発行を停止しているため、本アプリはICS購読フィード経由で連携しています。
そのため予定の反映にはTimeTree側の同期タイミングによる多少のラグが生じる場合があります。

## 技術スタック

- Next.js (App Router) / TypeScript / Tailwind CSS
- Prisma + SQLite
- Auth.js (NextAuth v5, Credentials provider)
- node-ical (TimeTree ICSフィードの取得・解析)
