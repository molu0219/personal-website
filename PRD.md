# PRD.md — Personal Website (0xjoeytw.xyz)

> 專案唯一事實來源。所有開發決策以本文件為依據，沒有規格不得實作。
> 功能狀態：📋 待開發 / 🔄 進行中 / ✅ 已完成 / [-] 已移除
> 功能 ID（F001、F002…）為專案級遞增，刪除功能不重排 ID。

## 目錄

| ID   | 功能名稱 | 狀態 |
|------|---------|------|
| F001 | 首頁（Hero + 輪播） | ✅ 已完成 |
| F002 | About 頁面 | ✅ 已完成 |
| F003 | Blog 系統（列表 + 文章頁） | ✅ 已完成 |
| F004 | Projects 系統（列表 + 詳情頁） | ✅ 已完成 |
| F005 | Admin 儀表板 | ✅ 已完成 |
| F006 | Admin 文章管理（CRUD） | ✅ 已完成 |
| F007 | Admin 專案管理（CRUD） | ✅ 已完成 |
| F008 | Admin About 編輯 | ✅ 已完成 |
| F009 | Admin Analytics 數據面板 | ✅ 已完成 |
| F010 | 認證與權限控制 | ✅ 已完成 |
| F011 | 圖片上傳 | ✅ 已完成 |
| F012 | 頁面瀏覽追蹤 | ✅ 已完成 |
| F013 | 佈局與主題系統（Navbar/Footer/Theme） | ✅ 已完成 |
| F014 | 視覺效果（Aurora/Neon/Mesh） | ✅ 已完成 |
| F015 | 廣告系統（CRT 終端機風格） | ✅ 已完成 |
| F016 | AI Skills Hub | ✅ 已完成 |

## 專案概述

**產品定位**：Joey Chen 的個人網站與作品集，展示 Blockchain/Web3 開發專案與技術文章
**目標用戶**：潛在雇主、合作夥伴、技術社群同好
**核心價值**：Cyberpunk 風格視覺設計 + 完整 CMS 後台自主管理內容
**MVP 範圍**：公開展示頁（首頁/About/Blog/Projects）+ Admin 後台（CRUD + Analytics）；不做多用戶系統、評論系統、RSS

## 技術規格

### 技術棧
- **Framework**：Next.js 16 (App Router) + TypeScript
- **Styling**：Tailwind CSS v4
- **動畫**：Framer Motion
- **資料庫**：Supabase PostgreSQL + Supabase Auth + Supabase Storage
- **部署**：Cloudflare Pages（via @opennextjs/cloudflare）
- **視覺效果**：p5.js（Aurora Canvas）

### 外部 API
| 來源 | 用途 | 認證方式（env var） |
|------|------|-------------------|
| Supabase | DB + Auth + Storage | NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY |

### 資料庫 Schema
| 表名 | 用途 | 關鍵欄位 |
|------|------|---------|
| about | 個人資訊 | name, title, bio, skills, social_links, hero_description, status_text, status_active |
| posts | 部落格文章 | id, slug, title, excerpt, content, tags, published, published_at, cover_url |
| projects | 專案作品 | id, slug, title, description, content, cover_url, tags, published, featured, url, github_url |
| page_views | 頁面瀏覽記錄 | path, referrer, user_agent, created_at |

### 環境變數
| 變數名稱 | 用途 | 必填 |
|---------|------|------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase 專案 URL | 是 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase 匿名金鑰 | 是 |
| SUPABASE_SERVICE_ROLE_KEY | Supabase 服務端金鑰（Admin 操作） | 是 |
| API_SECRET_KEY | API 路由認證金鑰 | 是 |

## 功能規格

### F001 首頁（Hero + 輪播） `✅ 已完成`

**使用者能做什麼**：訪客進入首頁看到打字機動畫名字、個人簡介、狀態標籤，向下滾動可瀏覽 Recent Posts 和 Featured Projects 橫向輪播卡片，點擊可跳轉至對應文章或專案

**驗收條件**：
- [x] Hero 區塊顯示打字機動畫名字（每 5 秒循環）
- [x] 從 Supabase `about` 表讀取 name, title, hero_description, status_text
- [x] Recent Posts 輪播顯示最新 5 篇已發布文章
- [x] Featured Projects 輪播顯示最多 5 個 featured 專案
- [x] 卡片點擊可跳轉至 `/blog/[slug]` 或 `/projects/[slug]`
- [x] Aurora Canvas 背景動畫

**範圍限制**：不做分頁、不做搜尋

---

### F002 About 頁面 `✅ 已完成`

**使用者能做什麼**：訪客查看 Joey 的個人簡介、技能列表（分類顯示）、社群連結

**驗收條件**：
- [x] 從 Supabase `about` 表讀取所有欄位
- [x] 技能自動分組顯示
- [x] 社群連結可點擊

**範圍限制**：不做 timeline、不做 resume 下載

---

### F003 Blog 系統（列表 + 文章頁） `✅ 已完成`

**使用者能做什麼**：訪客瀏覽文章列表（含封面、摘要、標籤），點擊進入文章詳情頁閱讀 Markdown 內容，文章頁有目錄導航

**驗收條件**：
- [x] 列表頁顯示所有已發布文章
- [x] 文章頁渲染 Markdown（支援 GFM、自動生成標題錨點）
- [x] 文章頁有 TableOfContents 側欄
- [x] ArticleLayout 提供統一排版

**範圍限制**：不做分類篩選、不做搜尋、不做評論

---

### F004 Projects 系統（列表 + 詳情頁） `✅ 已完成`

**使用者能做什麼**：訪客瀏覽專案列表（含封面、描述、標籤），點擊進入專案詳情頁查看完整介紹、GitHub/Demo 連結

**驗收條件**：
- [x] 列表頁顯示所有已發布專案
- [x] 詳情頁渲染 Markdown 內容
- [x] ProjectLayout 顯示 GitHub URL、Demo URL
- [x] 支援 featured 標記

**範圍限制**：不做篩選、不做排序

---

### F005 Admin 儀表板 `✅ 已完成`

**使用者能做什麼**：管理員登入後看到內容統計（總專案/文章數、已發布數），快速導航至各管理頁面

**驗收條件**：
- [x] 顯示 4 個統計卡片（Total/Published Projects/Posts）
- [x] 提供 Projects、Blog Posts、About 三個導航卡片
- [x] 資料從 Supabase 即時查詢

**範圍限制**：不做近期活動列表

---

### F006 Admin 文章管理（CRUD） `✅ 已完成`

**使用者能做什麼**：管理員新增、編輯、刪除部落格文章，設定 slug、標籤、封面圖、發布狀態

**驗收條件**：
- [x] 文章列表顯示所有文章（含草稿）
- [x] 新增/編輯表單含 title, slug, excerpt, content, tags, cover_url, published 欄位
- [x] 支援圖片上傳設定封面
- [x] 發布/取消發布切換
- [x] 刪除文章

**範圍限制**：不做版本歷史、不做排程發布

---

### F007 Admin 專案管理（CRUD） `✅ 已完成`

**使用者能做什麼**：管理員新增、編輯、刪除專案，設定 slug、標籤、封面圖、發布/featured 狀態、GitHub/Demo 連結

**驗收條件**：
- [x] 專案列表顯示所有專案
- [x] 新增/編輯表單含 title, slug, description, content, tags, cover_url, published, featured, url, github_url 欄位
- [x] 支援圖片上傳設定封面
- [x] 發布/取消發布 + featured 切換
- [x] 刪除專案

**範圍限制**：不做拖曳排序

---

### F008 Admin About 編輯 `✅ 已完成`

**使用者能做什麼**：管理員編輯個人資訊（名字、頭銜、Bio、Hero 描述、技能列表、社群連結、狀態標籤）

**驗收條件**：
- [x] 表單載入現有 `about` 資料
- [x] 可編輯 name, title, bio, hero_description, status_text, status_active, skills
- [x] 社群連結以 JSON 編輯
- [x] 儲存成功顯示確認訊息

**範圍限制**：不做頭像上傳

---

### F009 Admin Analytics 數據面板 `✅ 已完成`

**使用者能做什麼**：管理員查看網站流量數據：今日/本週/本月/總瀏覽量（含環比變化）、30 天折線圖、頁面排行（分 All/Blog/Projects 頁籤）、來源、裝置/瀏覽器分布、近期活動

**驗收條件**：
- [x] 4 個統計卡片含環比百分比變化
- [x] 30 天 SVG 折線圖
- [x] 內容分頁（All Pages / Blog / Projects）含瀏覽次數
- [x] Top Referrers 排行
- [x] Devices（Desktop/Mobile）比例條
- [x] Browsers 分布
- [x] Recent Activity 列表（最近 25 筆）

**範圍限制**：不做即時更新、不做匯出、不做自訂日期範圍

---

### F010 認證與權限控制 `✅ 已完成`

**使用者能做什麼**：管理員透過 Supabase Auth 登入 `/admin/login`，登入後可存取所有 Admin 頁面；API 路由透過 API Key 或 Supabase session 驗證

**驗收條件**：
- [x] `/admin/login` 登入頁面
- [x] Admin layout 檢查登入狀態，未登入重導至 login
- [x] API routes 使用 `lib/api-auth.ts` 驗證 `x-api-key` header
- [x] Upload API 使用 Supabase Auth 驗證 user

**範圍限制**：不做多用戶、不做角色權限

---

### F011 圖片上傳 `✅ 已完成`

**使用者能做什麼**：管理員在新增/編輯文章或專案時上傳圖片作為封面

**驗收條件**：
- [x] `/api/upload` 接收 multipart form data
- [x] 檔案存至 Supabase Storage `media` bucket
- [x] 回傳公開 URL
- [x] ImageUpload 元件提供拖放/點擊上傳 UI

**範圍限制**：不做圖片裁切、不做媒體庫管理

---

### F012 頁面瀏覽追蹤 `✅ 已完成`

**使用者能做什麼**：系統自動記錄每次頁面瀏覽（路徑、來源、UA），供 Analytics 面板使用。localhost 和 admin 登入用戶的瀏覽不記錄。

**驗收條件**：
- [x] `PageViewTracker` 元件在每次導航時發送 POST 至 `/api/analytics/track`
- [x] 記錄 path, referrer, user_agent 至 `page_views` 表
- [x] `/api/analytics/stats` 回傳聚合統計數據
- [x] localhost / 127.0.0.1 不追蹤
- [x] Admin 登入後設 localStorage 標記，有標記的不追蹤

**範圍限制**：不做 unique visitor 識別、不做 session 追蹤

---

### F013 佈局與主題系統（Navbar/Footer/Theme） `✅ 已完成`

**使用者能做什麼**：訪客看到一致的 Navbar（含導航連結）和 Footer（含動態社群連結），可切換 Dark/Light 主題

**驗收條件**：
- [x] Navbar 元件含導航連結
- [x] Footer 從 Supabase 讀取社群連結動態顯示
- [x] ThemeToggle 切換 Dark/Light
- [x] next-themes 持久化主題偏好

**範圍限制**：不做多主題色

---

### F014 視覺效果（Aurora/Neon/Mesh） `✅ 已完成`

**使用者能做什麼**：訪客體驗 Cyberpunk 風格視覺效果：Aurora 背景動畫、Neon 游標追蹤、Mesh 漸層

**驗收條件**：
- [x] AuroraCanvas 使用 p5.js 渲染動態背景
- [x] NeonCursor 追蹤滑鼠
- [x] MeshGradient 漸層效果
- [x] 效果不影響頁面互動效能

**範圍限制**：不做使用者自訂效果參數

---

### F015 廣告系統（CRT 終端機風格） `✅ 已完成`

**使用者能做什麼**：訪客在 Blog 列表、Blog 文章頁、Projects 列表、Project 詳情頁看到一個復古 CRT 終端機風格的廣告容器，內嵌 Google AdSense 廣告。桌面端為浮動視窗（可拖曳、可關閉），手機端為頁面底部內嵌區塊（可關閉）。關閉後該次 session 不再顯示。

**視覺設計**：
- 外框模擬老式 CRT 螢幕 / 終端機（圓角邊框、scanline overlay、微綠光暈）
- 頂部 title bar 顯示假終端標題（如 `ad_sponsor.exe`），含關閉按鈕 `[X]`
- 內容區放置 AdSense 廣告單元（不遮蓋、不修改廣告本身）
- 整體風格與網站 Cyberpunk 主題一致

**行為**：
- **桌面端（≥ 768px）**：fixed 浮動在頁面右下角，可拖曳（純 pointer events），不遮擋主內容
- **手機端（< 768px）**：頁面底部內嵌 CRT 區塊（不浮動、不可拖曳），寬度跟隨螢幕
- 關閉後存 `sessionStorage`，同一 session 不再顯示

**放置頁面**：
- `/blog` — Blog 列表頁
- `/blog/[slug]` — Blog 文章頁
- `/projects` — Projects 列表頁
- `/projects/[slug]` — Project 詳情頁

**驗收條件**：
- [x] 在 4 個目標頁面顯示 CRT 終端機廣告容器
- [x] 桌面端：浮動視窗可拖曳移動（純 pointer events，無新套件）
- [x] 點擊 `[X]` 關閉，sessionStorage 記住關閉狀態
- [x] 手機端（< 768px）：頁面底部內嵌 CRT 區塊，寬度跟隨螢幕，不浮動不可拖曳，可關閉
- [x] AdSense script 透過 `next/script` 載入（`afterInteractive`）
- [x] 廣告單元放在容器內容區，不遮蓋/不修改廣告元素（符合 AdSense TOS）
- [x] CRT 視覺效果：scanline overlay + 綠光暈 + monospace 標題列 + 圓角邊框
- [x] `/public/ads.txt` 已建立

**範圍限制**：不做多廣告位、不做 A/B 測試、不做廣告封鎖偵測、不做 self-hosted 廣告 slot

---

### F016 AI Skills Hub `✅ 已完成`

**使用者能做什麼**：訪客在 `/skills` 頁面（AI Skills Hub）瀏覽 AI Agent Skills 列表（table 格式），可按 Stars 排序，勾選多個 skills 後，右側 CRT 終端機面板即時產生安裝腳本，支援 Terminal 和 Script 兩種輸出格式，可一鍵複製。Description 欄位 hover 可展開完整內容。

**頁面佈局（左右分欄）**：
- **左側 Table**：checkbox、skill 名稱、description（hover tooltip）、⭐ stars（可排序）、🍴 forks、GitHub 連結
- **右側 Script Panel**：CRT 終端機風格 code block，含 Terminal / Script 模式切換 tab + 一鍵複製按鈕

**安裝方式（雙指令模式）**：
- 每個 skill 可同時有 CLI 安裝指令 (`install_command`) 和 Claude Code CLI 安裝指令 (`claude_install_command`)，兩者都可填或只填一個
- 前端 table 每行顯示支援的安裝方式標籤（`CLI` / `Claude Code`）
- Filter bar：All / CLI / Claude Code，含數量統計

**Script 輸出模式**：
- **Terminal 模式**（預設）：顯示 `$ command` 格式，複製純指令
- **Script 模式**：顯示 `#!/bin/bash` header + 完整腳本
- **Claude Code CLI 模式**：顯示 Claude Code CLI 安裝指令
- Tab 根據選中 skills 的共同可用安裝方式動態顯示
- 若選中 skills 無共同安裝方式，顯示警告提示

**Admin 後台 `/admin/skills`**：
- 新增時貼 GitHub repo URL → 自動抓 repo metadata（name, description, stars, forks）
- 兩個安裝指令輸入框：CLI + Claude Code CLI（都可填或只填一個）
- CRUD 管理（編輯、刪除、發布/下架）+ 安裝方式標籤（CLI / Claude Code）
- Admin sidebar 含 Skills 連結
- "Refresh Stars" 按鈕手動更新所有 skills 的 stars/forks

**Stars/Forks 更新**：手動觸發（Admin 頁面按鈕 或 `/api/skills/refresh` API）

**Supabase `skills` 表**：
- id, name, description, repo_url, install_command, claude_install_command, stars, forks, published, created_at, updated_at

**驗收條件**：
- [x] `/skills` 公開頁面：左右分欄佈局
- [x] 左側 table 含 checkbox、name、安裝方式標籤、description（hover tooltip）、stars（可排序）、forks、GitHub link
- [x] Filter bar（All / CLI / Claude Code）含數量統計
- [x] 勾選後右側即時產生安裝腳本
- [x] Script panel 根據選中 skills 共同可用方式動態顯示 tab + 一鍵複製
- [x] 無共同安裝方式時顯示警告
- [x] `/admin/skills` CRUD 管理頁面 + Admin sidebar 連結
- [x] Admin 兩個安裝指令輸入框（CLI + Claude Code CLI）
- [x] 貼 GitHub URL 自動抓 repo name、description、stars、forks
- [x] Supabase `skills` 表建立（含 claude_install_command 欄位）
- [x] `/api/skills` API route（CRUD）
- [x] `/api/skills/github` API route（抓 GitHub repo metadata）
- [x] `/api/skills/refresh` API route（手動更新 stars/forks）
- [x] Navbar 新增 Skills Hub 連結
- [x] `/skills` 頁面含 CRT 廣告終端機

**範圍限制**：不做使用者帳號、不做評分/評論、不做自動偵測已安裝、不做安裝指令自動解析、不做 Cron 自動更新（手動觸發）
