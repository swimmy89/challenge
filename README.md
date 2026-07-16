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
# .env を編集: POSTGRES_URL, AUTH_SECRET, APP_USER_EMAIL, APP_USER_PASSWORD などを設定
npx prisma migrate dev
npx prisma db seed
npm run dev
```

http://localhost:3000 を開いてログインしてください。

データベースは PostgreSQL を利用します（ローカル開発では Docker などで用意するか、
下記の Vercel Postgres をローカルからも参照してください）。

### TimeTree との連携方法

1. TimeTreeアプリで対象のカレンダーを開く
2. カレンダー設定 →「エクスポート」からICS(iCal)形式の購読用URLを発行
3. アプリ内の「⚙️ 設定」画面にそのURLを貼り付けて保存

TimeTreeは新規開発者向けの公式APIキー発行を停止しているため、本アプリはICS購読フィード経由で連携しています。
そのため予定の反映にはTimeTree側の同期タイミングによる多少のラグが生じる場合があります。

## 技術スタック

- Next.js (App Router) / TypeScript / Tailwind CSS
- Prisma + PostgreSQL
- Auth.js (NextAuth v5, Credentials provider)
- node-ical (TimeTree ICSフィードの取得・解析)

## デプロイ（Vercel）

このアプリはログイン機能・データベース・Server Actions を使うため、GitHub Pages のような
静的ホスティングでは動作しません。Next.js のサーバー機能に対応した Vercel へのデプロイを想定しています。

1. https://vercel.com で GitHub アカウント連携し、このリポジトリを Import する
2. Project の **Storage** タブから **Prisma Postgres** を追加する（データベースを作成し、
   プロジェクトに接続すると `DATABASE_URL` / `PRISMA_DATABASE_URL` / `POSTGRES_URL` が自動で
   環境変数に設定されます。本アプリは Accelerate 拡張を使わず直接接続の `POSTGRES_URL` のみを利用します）
3. Project の **Settings → Environment Variables** に以下を追加する
   - `AUTH_SECRET`（`openssl rand -base64 32` などで生成）
   - `APP_USER_EMAIL` / `APP_USER_PASSWORD` / `APP_USER_NAME`（初回シード用）
4. Deploy を実行する。ビルド時に `prisma generate && prisma migrate deploy && prisma db seed && next build`
   が走り、Postgres へのスキーマ適用と、環境変数で指定したユーザーの作成/更新（upsert）が自動で行われます
5. 発行された `https://<project-name>.vercel.app` にアクセスし、`APP_USER_EMAIL` / `APP_USER_PASSWORD`
   でログインする

`APP_USER_EMAIL` / `APP_USER_PASSWORD` を Environment Variables で変更してから再デプロイすると、
その内容でログイン情報が上書きされます（パスワード変更などに利用できます）。
