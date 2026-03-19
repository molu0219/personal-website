# DECISION.md

> 跨 session 決策記錄。回答「為什麼程式碼長這樣？」，讓下一個 Agent 不重蹈覆轍。
> 讀取：核心守則每次必讀；F 群組只讀當前任務對應區塊；跨功能需要時才讀。
> 寫入時機：兩方案選一、引入新依賴、不實作某優化、workaround、schema 決策、API 限制導致設計改變。
> 不寫：變數命名、元件拆分、照 PRD 直接實作、Bug 修復。

## 核心守則

> 每次 session 必讀。全域技術決策，控制在 10 條以內。

1. **部署目標為 Cloudflare Pages**：透過 `@opennextjs/cloudflare` 建置，禁止使用 Node.js native APIs（fs、path 等）
2. **Supabase 為唯一資料來源**：所有內容（posts、projects、about）存 Supabase PostgreSQL，前端直接 server-side 查詢，Admin 透過 API routes 操作
3. **雙重認證機制**：API routes 用 `x-api-key` header 驗證；Upload API 用 Supabase Auth session 驗證
4. **Secrets 管理**：所有敏感變數用 `wrangler secret put` 設定，禁止寫入 `.env` 提交至 repo

---

## 跨功能

> 影響多個功能但非全域守則的決策，需要時才讀。
