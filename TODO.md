# TODO.md

> Agent 工作入口。[ ] 未開始 / [~] 進行中 / [R] 待審核 / [x] 已完成 / [-] 擱置
> 群組標題對應 PRD 功能 ID。任務全部 [x] → 更新 PRD 狀態為 ✅（目錄 + 章節兩處）。

## F001 首頁（Hero + 輪播）

- [x] 建立 HeroSection 元件（打字機動畫名字、tagline、描述、狀態標籤）
- [x] 從 Supabase about 表讀取 Hero 資料
- [x] 建立 ScrollCarousel 元件
- [x] 首頁顯示 Recent Posts 輪播（最新 5 篇）
- [x] 首頁顯示 Featured Projects 輪播（最多 5 個）
- [x] 整合 AuroraCanvas 背景

## F002 About 頁面

- [x] 建立 About 頁面，從 Supabase 讀取資料
- [x] 技能分組顯示
- [x] 社群連結顯示

## F003 Blog 系統（列表 + 文章頁）

- [x] 建立 Blog 列表頁
- [x] 建立 Blog 文章頁（Markdown 渲染 + GFM + 標題錨點）
- [x] 建立 ArticleLayout 元件
- [x] 建立 TableOfContents 元件

## F004 Projects 系統（列表 + 詳情頁）

- [x] 建立 Projects 列表頁
- [x] 建立 Project 詳情頁（Markdown 渲染）
- [x] 建立 ProjectLayout 元件

## F005 Admin 儀表板

- [x] 建立 Admin Dashboard 頁面（統計卡片 + 導航）

## F006 Admin 文章管理（CRUD）

- [x] 建立 Admin Posts 頁面（列表 + 新增/編輯/刪除表單）
- [x] 建立 /api/posts 和 /api/posts/[id] API routes
- [x] 整合圖片上傳設定封面

## F007 Admin 專案管理（CRUD）

- [x] 建立 Admin Projects 頁面（列表 + 新增/編輯/刪除表單）
- [x] 建立 /api/projects 和 /api/projects/[id] API routes
- [x] 支援 featured 切換

## F008 Admin About 編輯

- [x] 建立 Admin About 編輯頁面
- [x] 建立 /api/about API route
- [x] 社群連結 JSON 編輯器

## F009 Admin Analytics 數據面板

- [x] 建立 Analytics 頁面（統計卡片 + 環比變化）
- [x] 建立 30 天 SVG 折線圖
- [x] 建立 ContentTabs 元件（All/Blog/Projects 分頁）
- [x] Referrers、Devices、Browsers 統計
- [x] Recent Activity 列表

## F010 認證與權限控制

- [x] 建立 /admin/login 登入頁
- [x] Admin layout 登入檢查 + 重導
- [x] lib/api-auth.ts API Key 驗證
- [x] Upload API Supabase Auth 驗證

## F011 圖片上傳

- [x] 建立 /api/upload route（Supabase Storage）
- [x] 建立 ImageUpload 元件（拖放/點擊上傳）

## F012 頁面瀏覽追蹤

- [x] 建立 PageViewTracker 元件
- [x] 建立 /api/analytics/track route
- [x] 建立 /api/analytics/stats route

## F013 佈局與主題系統（Navbar/Footer/Theme）

- [x] 建立 Navbar 元件
- [x] 建立 Footer 元件（動態社群連結）
- [x] 建立 ThemeToggle + ThemeProvider（next-themes）

## F014 視覺效果（Aurora/Neon/Mesh）

- [x] 建立 AuroraCanvas 元件（p5.js）
- [x] 建立 NeonCursor 元件
- [x] 建立 MeshGradient 元件

## F015 廣告系統（CRT 終端機風格）

- [x] 建立 CrtAdTerminal 元件（CRT 外框 + scanline overlay + 綠光暈 + title bar + 關閉按鈕）
- [x] 實作拖曳功能（純 pointer events，不引入新套件）
- [x] 實作關閉邏輯（sessionStorage 記住關閉狀態）
- [x] 手機端（< 768px）改為頁面底部內嵌 CRT 區塊（不浮動、不可拖曳、寬度跟隨螢幕、可關閉）
- [x] 在 root layout 或 `next/script` 載入 AdSense script（afterInteractive）
- [x] 在 CrtAdTerminal 內容區嵌入 AdSense 廣告單元
- [x] 在 /blog、/blog/[slug]、/projects、/projects/[slug] 四個頁面放置 CrtAdTerminal
- [x] 建立 /public/ads.txt

## F016 AI Skills Hub

- [x] 建立 Supabase `skills` 表（id, name, description, repo_url, install_command, stars, forks, published, created_at, updated_at）
- [x] 建立 `/api/skills` route（GET 列表 + POST/PUT/DELETE CRUD）
- [x] 建立 `/api/skills/github` route（貼 GitHub URL → 回傳 repo name, description, stars, forks）
- [x] 建立 `/api/skills/refresh` route（手動更新所有 skills 的 stars/forks）
- [x] 建立 `/admin/skills` 管理頁面（CRUD + GitHub URL 自動抓 metadata + 手動填安裝指令 + Refresh Stars 按鈕）
- [x] Admin sidebar 新增 Skills 連結
- [x] Admin dashboard 新增 Skills 卡片
- [x] 建立 `/skills` 公開頁面（左右分欄：左側 table + 右側 CRT script panel）
- [x] 頁面標題改為 AI Skills Hub
- [x] Description 欄位 hover 展開完整內容（title tooltip）
- [x] Stars 欄位可點擊排序（升序/降序）
- [x] 實作 table 勾選 → 右側即時合併安裝腳本
- [x] CRT script panel 含 Terminal / Script 模式切換 tab + 一鍵複製
- [x] Navbar 新增 Skills 連結
- [x] `/skills` 頁面納入 CRT 廣告終端機顯示範圍
- [~] Supabase `skills` 表新增 `skill_type` 欄位（預設 `general`，可選 `claude-code-cli`）
- [x] Admin 後台 skill 編輯表單新增類型選擇（general / claude-code-cli）
- [x] 前端 SkillsView：claude-code-cli 類型被選時 script panel 只顯示 Claude Code CLI 模式
- [x] 前端 SkillsView：混合選擇（general + claude-code-cli）時顯示錯誤提示
