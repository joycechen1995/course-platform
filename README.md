# 我的線上課程平台（MVP）

個人講師用的線上課程平台範例，涵蓋課程展示、會員註冊登入、購買流程（含優惠碼）、影片播放與學習進度追蹤、講師後台管理。這是可以在本機直接跑起來的 MVP，方便你先體驗完整流程，之後再決定要不要接上真實金流、真實影音服務並部署上線。

## 快速開始

需要 Node.js 20 以上，以及一個可連線的 **PostgreSQL** 資料庫（本專案透過 `pg` 這個純 JS 的
PostgreSQL client 連線，不需要編譯任何原生模組）。

1. 準備一個 Postgres 資料庫。本機開發可以用 Docker 快速起一個：

   ```bash
   docker run -d --name course-platform-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres
   ```

   也可以直接使用 Render / Supabase / Neon 等服務提供的免費 Postgres 執行個體。

2. 複製 `.env.example` 為 `.env`，並填入你的 `DATABASE_URL`（與可選的 `SESSION_SECRET`）：

   ```bash
   cp .env.example .env
   ```

3. 安裝套件並啟動：

   ```bash
   npm install
   npm run dev
   ```

開啟 http://localhost:3000 即可使用。第一次啟動時會自動在你指定的 Postgres 資料庫中建立資料表
（`CREATE TABLE IF NOT EXISTS ...`）並帶入範例資料，不需要手動建表或匯入資料。

### 測試帳號

- 講師（後台管理）：`instructor@example.com` / `teach1234`
- 學生：`student@example.com` / `student1234`
- 也可以直接在網站上註冊新帳號

### 範例優惠碼

結帳時可以輸入 `WELCOME10` 體驗 9 折優惠。

## 這個 MVP 做了什麼

- **前台**：首頁、課程列表、課程詳情（大綱、講師介紹）
- **會員系統**：Email/密碼註冊登入（自製 session，未使用第三方套件）
- **購買流程**：建立訂單 → 模擬付款頁 → 付款完成自動開通課程權限
- **學習頁面**：章節/單元導覽、影片播放、學習進度條、標記單元完成
- **會員中心**：我的課程、訂單紀錄
- **講師後台**：課程建立/編輯、章節與單元管理、上架/下架、訂單查詢、學生名單、優惠券管理、簡易營收數據

## 刻意簡化、上線前要換掉的地方

這是本機可跑的示範版本，以下幾個地方是刻意用「模擬/簡化」版本頂替，方便你在沒有金流商店代號、沒有影音託管帳號的情況下就能完整體驗流程：

1. **金流是模擬的**：結帳頁按下「模擬完成付款」就會直接標記付款成功。正式上線前要換成真實金流（綠界／藍新等）的信用卡/超商/ATM 付款頁面，並在收到金流的「付款成功通知」（Server Notify）驗證後才觸發開通課程權限，不能只靠前端按鈕。
2. **影片是公開的示範影片**：目前所有課程單元都指向同一支公開的示範影片，只是讓你看到播放器如何運作。正式上線要換成你自己上傳到 Bunny Stream / Cloudflare Stream / Mux 等影音託管服務的簽署網址（signed URL），避免影片被盜連。
3. ~~**資料庫是本機 SQLite 檔案**~~：已改用 PostgreSQL（透過 `DATABASE_URL` 連線），資料存放在雲端資料庫而不是伺服器本機的檔案，適合部署到 Render 這類沒有持久化檔案系統的平台，重啟／重新部署也不會遺失資料。
4. **Session 是自製的簡化版**：用簽章 cookie 做登入狀態，沒有記住裝置、雙因素驗證等進階功能，功能足夠但安全機制比商用方案簡單。上線前建議設定環境變數 `SESSION_SECRET`（一組隨機字串），否則會使用內建的預設值。

## 專案結構

```
src/
  app/            Next.js App Router 頁面（前台、會員中心、結帳、講師後台）
  components/     可重複使用的表單與 UI 元件
  lib/
    db.ts         PostgreSQL 連線池、資料表定義與種子資料
    auth.ts       登入 session 處理
    data/         資料庫查詢函式
    actions/      Server Actions（註冊登入、購買、學習進度、後台管理）
```

## 技術棧

Next.js 16（App Router + Server Actions）、TypeScript、Tailwind CSS、PostgreSQL（透過純 JS 的 `pg` 套件連線，不需要 Prisma 等額外的查詢建構工具或原生二進位檔）。需要設定環境變數 `DATABASE_URL` 指向一個 Postgres 資料庫；建議另外設定 `SESSION_SECRET` 用於簽署登入 cookie。
