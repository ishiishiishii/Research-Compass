# Research Compass

論文・研究手法を「地図（グラフ）」として可視化し、学習メモ・理解度を管理して、ゼミのメンバー同士で共有できる Web アプリです。

「論文を探すツール」ではなく、**自分やゼミの研究学習を可視化・共有する** ことを目的としています。

---

## このアプリでできること

- **論文グラフの作成** — 論文・手法を「ノード（点）」として追加し、「エッジ（矢印）」で関係を結んで地図を作る
- **メモ・理解度の管理** — 各ノードに概要・わからない点・メモ・理解度（◎○△×）を記録する
- **関連 / 非関連の切り替え** — 今の研究テーマと関係ないノードを薄く表示・非表示にする
- **グループ共有** — ゼミなどのグループを作り、招待コードでメンバーを集め、各自の論文マップを閲覧し合う（閲覧は読み取り専用）
- **フィード投稿** — グループ内に、その時点の論文マップのスナップショット付きで投稿する

---

## 主な機能と使い方の流れ

1. **アカウント登録・ログイン**
2. **マイ論文グラフ** (`/graph`) でノードを追加し、ドラッグで配置、ノード同士を矢印で結ぶ
3. **ノードをクリック** して詳細パネルを開き、概要・理解度・メモを保存
4. **理解度一覧** (`/dashboard`) で全ノードの理解状況を俯瞰
5. **グループ** (`/groups`) を作成、または招待コードで参加
6. **メンバーの論文マップ** を閲覧（編集は本人のみ）
7. **フィード** (`/feed`) でグループ内にグラフ付きの投稿を共有

---

## 技術スタック

| 分類 | 使用技術 |
|------|----------|
| 言語 | TypeScript, SQL |
| フロントエンド | React, React Router, React Flow（@xyflow/react）, Tailwind CSS |
| ビルド | Vite |
| バックエンド / DB | Supabase（PostgreSQL, Auth, RLS, RPC） |
| 開発環境 | Docker Compose, Dev Container |
| CI | GitHub Actions（lint + build） |

自前の API サーバーは持たず、フロントエンドから Supabase に直接アクセスし、アクセス制御は PostgreSQL の RLS（Row Level Security）で行う構成です。

---

## ディレクトリ構成

```
ResearchCompass/
├── docs/                    # 企画・設計・解説ドキュメント
├── frontend/                # React + Vite + TypeScript（画面・UI・API呼び出し）
│   └── src/
│       ├── pages/           # 画面単位のコンポーネント
│       ├── components/      # 再利用する UI 部品（グラフ関連など）
│       ├── contexts/        # 認証などの全体共有state
│       ├── hooks/           # カスタムフック
│       ├── lib/             # Supabase クライアント・API 関数・ユーティリティ
│       │   └── api/         # テーブルごとの DB 操作
│       └── types/           # TypeScript 型定義
├── supabase/
│   ├── migrations/          # DB スキーマ・RLS・RPC の変更履歴（SQL）
│   └── seed.sql             # デモ用の初期データ
├── scripts/                 # 起動・停止スクリプト
├── docker-compose.yml       # 開発用フルスタック
└── .github/workflows/       # GitHub Actions CI
```

---

## セットアップ（ローカルで再現する）

### 前提

- Node.js
- Docker Desktop（Supabase ローカル環境に必要）

### 手順

```powershell
# 1. リポジトリを取得
git clone https://github.com/ishiishiishii/Research-Compass.git
cd Research-Compass

# 2. 環境変数を用意
cp .env.example .env

# 3. Supabase ローカル環境を起動し、マイグレーションを適用
npm run db:start
npm run db:reset

# 4. フロントエンドを起動
cd frontend
npm install
npm run dev
```

起動後、ブラウザで http://localhost:5173 を開きます。

### 主なローカルサービス

| サービス | URL |
|----------|-----|
| フロントエンド | http://localhost:5173 |
| Supabase API | http://localhost:54321 |
| Supabase Studio（DB 管理画面） | http://localhost:54323 |
| PostgreSQL | localhost:54322 |

### Docker でまとめて起動する場合

```powershell
.\scripts\up.ps1        # または npm run docker:up
docker compose down     # 停止
```

---

## npm スクリプト

| コマンド | 説明 |
|----------|------|
| `npm run dev` | フロントエンドの開発サーバー起動 |
| `npm run build` | 本番用ビルド |
| `npm run lint` | ESLint |
| `npm run db:start` | Supabase ローカル起動 |
| `npm run db:reset` | マイグレーション + シード適用 |
| `npm run db:stop` | Supabase ローカル停止 |

---

## 環境変数

`.env`（およびフロントエンド）に以下を設定します。

| 変数 | 説明 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase の API URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase の公開用 anon キー |

ローカル開発では `.env.example` の既定値をそのまま利用できます。

---

## ドキュメント

- [企画・要件定義書](docs/01_企画・要件定義書.md)
- [プロダクト解説・技術入門](docs/03_プロダクト解説・技術入門.md) — 機能とアーキテクチャの全体像
- [コードの仕組み・ライブラリ完全入門](docs/04_コードの仕組み・ライブラリ完全入門.md) — React / ライブラリ / 行ごとの解説
- [開発手順ガイド](docs/05_開発手順ガイド.md) — 機能の実装順序とコード解説
