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
├── .devcontainer/           # VS Code / Cursor Dev Container 設定
├── scripts/                 # 起動・停止スクリプト
├── docker-compose.yml       # 開発用フルスタック
├── docker-compose.prod.yml  # 本番ビルド用
└── .github/workflows/       # GitHub Actions CI
```

---

## Docker

| サービス | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Supabase API | http://localhost:54321 |
| Supabase Studio | http://localhost:54323 |
| PostgreSQL | localhost:54322 |

### 起動

```powershell
.\scripts\up.ps1
```

### Dev Container（VS Code / Cursor）

[Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers) 拡張機能を入れると、**コンテナ内で IDE が開き**、毎回 `docker exec` しなくても開発できます。

1. 拡張機能 **Dev Containers** をインストール
2. コマンドパレット → `Dev Containers: Reopen in Container`
3. 初回ビルド後、ターミナルで `npm run dev --prefix frontend`

ポート 5173 / 54321 / 54323 は自動転送されます。

### 停止

```powershell
docker compose down
```

### コマンド

| コマンド | 説明 |
|----------|------|
| `npm run docker:up` | 起動 |
| `npm run docker:up:build` | 再ビルドして起動 |
| `npm run docker:down` | 停止 |
| `npm run docker:lint` | ESLint |
| `npm run docker:build:prod` | 本番ビルド |

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

### Vercel デプロイ

1. https://vercel.com → GitHub 連携 → `Research-Compass` を Import
2. Root Directory: `frontend`
3. Environment Variables:
   - `VITE_SUPABASE_URL` = Supabase Cloud の Project URL
   - `VITE_SUPABASE_ANON_KEY` = Supabase Cloud の anon key

---

## 開発の流れ

1. 環境構築・認証（Supabase Auth）
2. ノード CRUD・React Flow によるグラフ表示
3. エッジ CRUD・ノード詳細・メモ
4. 理解度・関連/非関連トグル
5. グループ作成・招待・参加
6. メンバー論文図の閲覧（RLS）・デモ用シードデータ
7. UI 調整・Vercel / Supabase Cloud へのデプロイ

---

## 技術スタック

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, React Flow, React Router
- **Backend**: Supabase（Auth + PostgreSQL + RLS）
- **Dev**: Docker Compose
- **Hosting**: Vercel + Supabase Cloud
