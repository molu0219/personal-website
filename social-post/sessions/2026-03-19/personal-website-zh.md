---
title: "幫個人網站加上 CRT 終端機廣告 + AI Skills Hub 市集頁面"
date: "2026-03-19"
project: "personal-website"
tags: [adsense, crt-terminal, skills-hub, cyberpunk, nextjs, supabase, cloudflare]
status: "captured"
---

## 做了什麼

- 重新初始化專案文件（PRD.md, TODO.md, DECISION.md）,逆向分析整個 codebase 建立完整功能清單（F001-F014 全標為已完成）
- 調查廣告提供商（Google AdSense, Carbon Ads, EthicalAds, BuySellAds）,分析哪些允許自訂容器包裝
- 實作 CRT 終端機風格浮動廣告系統（F015）:復古 scanline overlay, 綠光暈, 可拖曳, 可關閉
- 手機端改為頁面底部內嵌 CRT 區塊（RWD 支援）
- 整合 Google AdSense（Publisher ID: ca-pub-9548192708890896）,處理 hydration mismatch 問題
- 實作 AI Skills Hub 頁面（F016）:左右分欄, 左側 table list, 右側 CRT 風格安裝腳本面板
- Skills 支援 GitHub URL 自動抓取 metadata（stars, forks, description）
- Script panel 支援 Terminal / Script 雙模式切換
- Stars 欄位可排序, Description hover 展開
- Admin 後台新增 Skills 管理頁面（CRUD + Refresh Stars）
- 修復 TableOfContents 重複 heading ID 導致的 React key warning
- 總共部署了 v1.0.5 到 v1.0.7 三個版本

## 關鍵決策

- **AdSense 而非其他廣告商**: Carbon Ads 和 AdSense 都禁止自訂容器包裝, 但 AdSense 門檻最低且容器只是「裝飾框架」不修改廣告本身, 符合 TOS
- **CRT 終端機作為廣告容器**: 把廣告融入網站 Cyberpunk 主題, 而非突兀的標準廣告欄位。用純 CSS 實現 scanline + glow 效果, 不引入新套件
- **拖曳用純 pointer events**: 不引入 react-draggable, 用 setPointerCapture 實現, 減少依賴
- **Skills 安裝指令手動填寫**: 原本考慮自動解析 GitHub README, 但每個 repo 格式不同, 誤判率高, 改為 Admin 手動填一次
- **Script 放 head 用原生 script tag**: next/script 的 beforeInteractive 造成 hydration mismatch, 改用原生 `<script async>` 避免 SSR/client HTML 不一致
- **CRT shell 共用**: 廣告終端機和 Skills 頁面的 script panel 共用相同的視覺語言（scanline, 綠光暈, 圓點標題列）

## 成果

- 網站新增兩大功能模組: 廣告系統 + AI Skills Hub
- 廣告系統完整支援桌面（浮動可拖曳）和手機（底部內嵌）
- Skills Hub 提供完整的 CRUD 後台 + 公開展示頁 + 雙模式腳本輸出
- Google AdSense 驗證碼已部署, 等待 Google 審核通過
- 專案文件系統（PRD/TODO/DECISION）完整建立, 14 個既有功能 + 2 個新功能全部記錄

## 洞察與收穫

- **廣告 TOS 比想像中嚴格**: AdSense 和 Carbon Ads 都明確禁止修改廣告外觀/行為, 但「裝飾性容器」不修改廣告本身是允許的。關鍵在於廣告元素本身不被遮蓋或改變
- **next/script beforeInteractive 有坑**: 這個策略會在 SSR 時生成不同的 HTML, 導致 hydration mismatch。對於第三方腳本, 原生 `<script async>` 反而更安全
- **逆向建立 PRD 的價值**: 對既有 codebase 做完整功能清單, 不只是文檔化, 更是重新理解系統邊界的過程。知道「什麼已經做了」才能正確規劃「接下來做什麼」
- **CRT 視覺效果出奇簡單**: scanline 就是 repeating-linear-gradient, glow 就是 radial-gradient + box-shadow, 不需要 canvas 或複雜的 CSS animation

## 程式碼亮點

**純 CSS Scanline 效果**:
```css
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(0, 255, 136, 0.015) 2px,
  rgba(0, 255, 136, 0.015) 4px
);
```

**Pointer Events 拖曳（不需第三方套件）**:
```tsx
el.setPointerCapture(e.pointerId)  // 鎖定指標到元素
dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
```

**CrtAdLoader 路徑過濾**: 放在 root layout, 用 pathname 判斷是否顯示, 避免在每個頁面重複引入:
```tsx
const AD_PATHS = ['/blog', '/projects', '/skills']
const shouldShow = AD_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
```

## 原始筆記

- Google AdSense 審核中, GDPR 同意聲明選了 Google CMP 3 選項版（同意/不同意/管理）
- Skills Hub 的每日自動更新 stars/forks 還沒做（需要 Cron Trigger）, 目前是手動
- Supabase RLS 需要額外加 authenticated policy 才能讓 admin 頁面直接操作
- `ads.txt` 放在 `/public/` 下, Cloudflare 會自動 serve

## 可以講的故事角度

1. **「如何讓廣告融入 Cyberpunk 設計」**: 表面講 CRT 終端機效果實作, 底層帶出「廣告不一定要醜, 用設計把它變成體驗的一部分」的產品思維
2. **「用 Next.js 蓋一個 AI Skills 市集」**: 表面講技術實作（GitHub API + Supabase + CRT UI）, 底層帶出 Developer Tools Curation 的價值和 AI Agent 生態的興起
3. **「逆向工程自己的專案」**: 表面講如何對既有 codebase 建立 PRD, 底層帶出跨 session 開發的工作流管理方法論（PRD/TODO/DECISION 三件套）
