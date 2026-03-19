# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
npm run dev          # Next.js local dev (localhost:3000)
npm run build        # Next.js production build
npm run lint         # ESLint
npm run preview      # Build for Cloudflare + wrangler dev (tests CF runtime locally)
npm run deploy       # Build for Cloudflare + wrangler deploy (production)
```

No test suite is configured.

## Architecture

**Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase + Cloudflare Workers (via `@opennextjs/cloudflare`)

**Route groups**:
- `app/(site)/` — public-facing pages (home, about, blog, projects)
- `app/admin/` — password-protected admin dashboard
- `app/api/` — REST API routes consumed by the admin dashboard

**Auth flow**: Admin routes are protected via Supabase Auth. `lib/api-auth.ts` validates session tokens on API routes. `lib/supabase/client.ts` is for browser, `lib/supabase/server.ts` is for server components/routes.

**Data flow**: All content (posts, projects, about info) lives in Supabase. The public site fetches directly from Supabase server-side; the admin UI calls `/api/*` routes which re-validate auth before mutating data.

**Analytics**: `PageViewTracker` component (`app/PageViewTracker.tsx`) posts to `/api/analytics/track` on every navigation. Admin dashboard reads aggregated stats from `/api/analytics/stats`.

**Deployment**: `wrangler.jsonc` targets `0xjoeytw.xyz`. Secrets are stored via `wrangler secret put`, never in `.env` committed to repo. The `nodejs_compat` compatibility flag is required.

**Cloudflare constraint**: Do not use Node.js-specific APIs (`fs`, `path`, native modules). The `nodejs_compat` flag covers most Node built-ins but native addons are not available.

---

## 工作流程規範

> 核心原則：所有開發決策以 PRD 為唯一依據，沒有規格不得實作。

### 文件角色

| 文件 | 角色 | Agent 權限 |
|------|------|-----------|
| `PRD.md` | 功能規格 + 完成狀態快照 | 讀＋寫 |
| `TODO.md` | 實作任務清單 + 進度追蹤 | 讀＋寫 |
| `DECISION.md` | 跨 session 技術決策記錄 | 讀＋新增 |

### 啟動流程

1. 讀 TODO.md → 選群組：有 `[~]` 優先；否則選 F 編號最小含 `[ ]` 的群組
2. 讀 PRD 對應 F 編號章節 → 確認規格
3. 讀 DECISION.md 核心守則 + 對應 F 群組
4. 宣告「準備實作 FXXX」→ 等人類確認後執行

### 任務狀態

| PRD 狀態 | 意義 | TODO 對應 |
|---------|------|----------|
| `📋 待開發` | 規格已定，未開始 | 全部 `[ ]` |
| `🔄 進行中` | 部分任務完成 | 有 `[x]` 也有 `[ ]` |
| `✅ 已完成` | 實作並驗收 | 全部 `[x]` |
| `[-] 已移除` | 功能取消，ID 保留 | 群組整體 `[-]` |

TODO 任務標記：`[ ]` 未開始 / `[~]` 進行中 / `[R]` 待審核 / `[x]` 已完成 / `[-]` 擱置

### 執行規則

**開始任務**：標 `[~]`；若 PRD 為 `📋` → 改 `🔄`（目錄 + 章節標題兩處同步）

**完成任務前必跑 Checklist**（全部確認才能標 `[R]`）：
- [ ] 對應 TODO 任務已標 `[x]`
- [ ] PRD 該功能驗收條件已打勾
- [ ] 若有新決策 → DECISION.md 已新增記錄
- [ ] 若群組全 `[x]` → PRD 目錄 + 章節標題兩處已改 `✅`
- [ ] git diff 確認沒有超出 PRD 範圍的改動

**[PAUSE] 暫停條件**（遇到以下任一情況，輸出 `[PAUSE]` 並說明原因，等人類回應後才繼續）：
- 需要安裝任何 npm 套件
- PRD 驗收條件有歧義，不確定「完成」長什麼樣子
- 發現規格與現有 code 矛盾
- 需要存取 PRD 未列出的外部 API
- 需求有變動

不是暫停條件（可自行決定）：Tailwind class 選擇、函式拆分方式、變數命名

**DECISION.md 寫入觸發清單**（對清單打勾，不需判斷「算不算重要」）：

✅ 必須寫：
- 引入新 npm 套件（任何套件）
- 兩個以上方案選擇其中一個
- 刻意不實作某優化
- Workaround（不按正常路徑實作）
- DB schema 結構決策
- API 限制導致設計改變

❌ 不寫：變數命名、元件拆分、照 PRD 直接實作、Bug 修復

### 新功能 SOP（嚴格順序）

1. 人類提出需求（Agent 不得自行新增 F 編號）
2. Agent 草擬規格（使用者能做什麼 / 驗收條件 / 範圍限制），等人類確認
3. 確認後 → PRD 寫入（`📋`，目錄 + 章節）+ TODO 新增 `[ ]` 群組
4. 宣告「準備實作 FXXX」→ 等人類確認後執行

### 閱讀規範

- 禁止載入整份 PRD，只讀當前 F 編號章節
- DECISION.md：`核心守則` 每次必讀；`F 群組` 只讀當前對應；`跨功能` 需要時才讀
