# Research Compass

研究論文・手法をグラフで可視化し、学習メモ・理解度を管理する Web アプリ（ハッカソン MVP）。

## ドキュメント

- [企画・要件定義書](docs/01_企画・要件定義書.md)

## ディレクトリ構成

```
ResearchCompass/
├── docs/                    # 企画・設計ドキュメント
├── frontend/                # React + Vite + TypeScript
├── supabase/                # DB マイグレーション・Supabase 設定
├── docker/                  # Docker 関連（Supabase オーケストレータ等）
├── scripts/                 # 起動・停止スクリプト
├── docker-compose.yml       # 開発用フルスタック（Day 1–7 共通）
├── docker-compose.prod.yml  # 本番ビルド用
└── .github/workflows/       # GitHub Actions CI
```

---

## Docker で全部起動（推奨）

**Day 1 だけでなく、プロジェクト全体（Day 1–7）で使う開発環境です。**

1 コマンドで以下がすべて起動します:

| サービス | URL | 用途 |
|----------|-----|------|
| **Frontend** | http://localhost:5173 | React アプリ（Day 2–7 グラフ・認証・グループ） |
| **Supabase API** | http://localhost:54321 | Auth + REST API（Day 1–7 バックエンド） |
| **Supabase Studio** | http://localhost:54323 | DB 管理 UI |
| **PostgreSQL** | localhost:54322 | 直接 DB 接続 |

### 前提条件

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)（インストール済み・起動中）
- Git

### 起動手順

```powershell
# 1. 環境変数ファイルを作成
cp .env.example .env
cp frontend/.env.example frontend/.env

# 2. フルスタック起動（Supabase + Frontend + マイグレーション）
docker compose up --build

# または PowerShell スクリプト
.\scripts\up.ps1 --build
```

初回起動は Supabase イメージのダウンロードで **5〜10 分** かかることがあります。

### 停止

```powershell
docker compose down
.\scripts\down.ps1
```

### その他 Docker コマンド

| コマンド | 説明 |
|----------|------|
| `npm run docker:up` | フルスタック起動 |
| `npm run docker:up:build` | イメージ再ビルドして起動 |
| `npm run docker:down` | 停止 |
| `npm run docker:lint` | Docker 内で ESLint |
| `npm run docker:build:prod` | 本番用 nginx イメージビルド |

---

## ローカル開発（Docker なし）

Docker を使わず直接起動する場合:

```powershell
npm run db:start          # Supabase ローカル（Docker Desktop 必須）
npm run db:reset          # マイグレーション適用
cd frontend; npm install; npm run dev
```

---

## GitHub 連携

### リポジトリ

- GitHub: [ishiishiishii/Research-Compass](https://github.com/ishiishiishii/Research-Compass)

### clone

```powershell
git clone https://github.com/ishiishiishii/Research-Compass.git
cd Research-Compass
```

### CI（GitHub Actions）

`main` / `develop` への push / PR で自動 lint + build（`.github/workflows/ci.yml`）。

### Vercel デプロイ（Day 7）

1. https://vercel.com → GitHub 連携 → `Research-Compass` を Import
2. Root Directory: `frontend`
3. Environment Variables:
   - `VITE_SUPABASE_URL` = Supabase Cloud の Project URL
   - `VITE_SUPABASE_ANON_KEY` = Supabase Cloud の anon key

---

## 1 週間の開発と Docker

| Day | 内容 | Docker の役割 |
|-----|------|---------------|
| Day 1 | 環境構築・認証 | Supabase Auth + DB |
| Day 2 | ノード CRUD・React Flow | 同上 + Frontend |
| Day 3 | エッジ・メモ | 同上 |
| Day 4 | 理解度・関連トグル | 同上 |
| Day 5 | グループ機能 | 同上 |
| Day 6 | メンバー閲覧・RLS・シード | 同上 + Studio で DB 確認 |
| Day 7 | UI polish・デプロイ | `docker-compose.prod.yml` で本番ビルド確認 |

**同じ `docker compose up` を Day 1–7 ずっと使います。**

---

## 技術スタック

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Flow, React Router
- **Backend**: Supabase（Auth + PostgreSQL + RLS）
- **Dev**: Docker Compose
- **Hosting**: Vercel + Supabase Cloud
