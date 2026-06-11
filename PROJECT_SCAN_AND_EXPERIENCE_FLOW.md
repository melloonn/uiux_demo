# CultureFlow 專案盤點與使用者體驗流程

更新時間：2026-04-24

## 1. 專案目前狀態

### 基本判斷
- 這是一個放在 `app/` 內的 React + Vite 前端 prototype。
- 介面以手機 App mockup 為主，桌面版只是用 `IOSFrame` 包起來做展示。
- 資料來源全部是前端 mock data，沒有看到後端 API、登入、資料庫或真實同步。
- 互動狀態目前存在 React state 裡。
  - `saved / planned` 不會跨重新整理保存。
  - 訊息內容可在當次 session 內新增，但也不會持久化。
- 專案有中英文切換。
- 主題很明確：在台北探索文化活動，結合發現、地圖、收藏、規劃、社交分享。

### 技術觀察
- 主要入口：`app/src/main.jsx`
- 路由集中在：`app/src/App.jsx`
- 主 tab 有 5 個：
  - `/` Home
  - `/reels`
  - `/map`
  - `/plan`
  - `/me`
- 額外細節頁與功能頁：
  - `/event/:id`
  - `/category/:categoryId`
  - `/messages`
  - `/messages/:chatId`
  - `/friends`
  - `/friends/:id`
  - `/following`
  - `/saved`
  - `/settings`
  - `/vibes`

### 內容資料量
- 共有 31 個 mock events。
- 分類數量：
  - festivals: 5
  - night-markets: 6
  - live-music: 5
  - temples-heritage: 5
  - art-markets: 5
  - exhibitions: 5
- 社交資料：
  - 8 位朋友
  - 20 個 following 項目
  - 多組群聊與私訊範例

### 驗證結果
- `npm run build` 可成功通過。
- `docs/screenshots/REPORT.md` 已記錄主要 routes 的截圖驗證。

## 2. 頁面地圖與可達性

### A. 可自然走到的主流程頁

| 頁面 | 路徑 | 主要用途 | 自然入口 |
|---|---|---|---|
| Home | `/` | 搜尋、篩選、Nearby、分類、事件列表 | TabBar |
| Reels | `/reels` | 短影音式探索活動 | TabBar |
| Map | `/map` | 地圖探索、圖層、地圖篩選、pin peek | TabBar |
| My Plan | `/plan` | 已計畫/已收藏/過去活動、路線產生 | TabBar |
| Profile / My Hub | `/me` | 個人中心、Saved、Friends、Following、Settings | TabBar |

### B. 從主流程延伸的功能頁

| 頁面 | 路徑 | 主要用途 | 入口 |
|---|---|---|---|
| Event Detail | `/event/:id` | 詳細資訊、加入收藏、加入計畫、分享 | Home/Reels/Map/Plan/Profile/Chat |
| Category Detail | `/category/:categoryId` | 類型專頁與活動列表 | Home category tile、`/vibes` |
| Messages | `/messages` | 訊息列表、群聊與私訊 | Home 右上角訊息按鈕 |
| Chat Detail | `/messages/:chatId` | 對話、傳文字、分享活動 | Messages、ShareSheet |
| Saved | `/saved` | 已收藏活動完整列表 | Profile Saved 區塊 |
| Friends | `/friends` | 朋友列表 | Profile Friends 區塊 |
| Following | `/following` | 已追蹤場地/主辦方 | Profile Following 區塊 |
| Settings | `/settings` | 語言、偏好、隱私、版本 | Profile 右上設定鈕 |

### C. 存在但入口較弱或未接好的頁

| 頁面 | 路徑 | 狀態 |
|---|---|---|
| Vibe Discovery | `/vibes` | 有完整頁面，也有截圖，但目前看不到明顯導向入口 |
| Friend Profile | `/friends/:id` | Route 已存在，但 Friends 列表目前只有「傳訊息」按鈕，沒有點進朋友 profile 的自然入口 |

結論：
- 如果只靠現在 UI 直接走，幾乎可以把大多數功能跑完。
- 但如果你要「真的走到全部頁面」，需要主持人在 demo 中補兩個 QA 入口：
  - 手動打開 `/vibes`
  - 手動打開任一 `/friends/:id`

## 3. 目前產品體驗定位

這個 prototype 比較像「文化活動探索 + 社交分享 + 輕量行程規劃」的手機 App 概念驗證，不像完整產品。

它的核心價值大概是：
- 快速看到有趣活動
- 用不同視角發現活動
  - list
  - reels
  - map
  - category
- 把活動存起來或加入計畫
- 分享給朋友、在聊天裡討論
- 最後整理成自己的行程

## 4. 建議的課堂體驗目標

這次不是要讓同學「把任務做完」，而是讓同學自然感受：
- 第一次進來，會不會很快理解這是什麼 app
- 他們偏好哪種探索方式
  - Home list
  - Reels
  - Map
- 收藏、加入計畫、分享、聊天，流程是否順
- My Plan 是否真的讓人感覺「有被幫忙整理」
- Profile 與社交區塊是否有價值

## 5. 建議帶使用者體驗的完整流程

這條流程的設計原則是：
- 先從最容易理解的入口開始
- 再慢慢擴展到探索、規劃、社交
- 儘量讓每一步都像正常使用，不像硬切畫面
- 最後再補目前 UI 裡較隱藏的頁面

---

## 6. 主持人 demo script

### Phase 1：先讓使用者理解產品
起點：`/`

引導語：
「你今天想在台北找一個有文化感、值得去的活動，等等也可能想分享給朋友，請你先隨便看看這個 app。」

請他做：
- 看首頁第一眼，說出他覺得這是什麼 app
- 點中英文切換
- 看 `For You / Nearby`
- 滑幾個 event card

你要觀察：
- 他是否立刻理解 Home 是探索首頁
- logo、搜尋、filter、訊息、語言切換是否太擁擠
- 他第一眼會不會先看活動卡，而不是 top controls

### Phase 2：用 Home 完成第一次探索
繼續在 `/`

請他做：
- 用搜尋找一個自己有興趣的活動
- 打開 filter sheet
- 切換 `Nearby`
- 點一個 category tile 進類別頁
- 再從類別頁點進 event detail

會經過頁面：
- Home
- Category Detail
- Event Detail

你要觀察：
- 搜尋和 filter 是否直覺
- category tile 是否像「主功能」還是「附加功能」
- event detail 的資訊量是否剛好

### Phase 3：在 Event Detail 做決策
停留在 `/event/:id`

請他做：
- 收藏這個活動
- 加入計畫
- 打開 share sheet 看分享方式

會經過功能：
- save
- add to plan
- share sheet

你要觀察：
- CTA 是否清楚
- 收藏和加入計畫的差異是否一眼可懂
- 分享選項是否符合預期

### Phase 4：改用 Reels 找下一個活動
切到 `/reels`

引導語：
「如果你不是用列表找，而是想快速刷感覺，試試看這裡。」

請他做：
- 上下滑看幾個活動
- 點一次 logo refresh
- 對某個活動做 save 或 add to plan
- 點 `Map` action 直接跳去地圖
- 試一次 share

會經過頁面：
- Reels
- Map

你要觀察：
- Reels 是否讓人覺得更有吸引力
- 操作 rail 是否容易理解
- 從 Reels 跳 Map 的連續感好不好

### Phase 5：用 Map 做空間判斷
停留在 `/map`

請他做：
- 搜尋附近活動
- 切 category chip
- 開 filter
- 切 `Free only`
- 切 layers
- 點 pin 打開 peek card
- 從 peek card 進 event detail

會經過功能：
- 地圖搜尋
- 地圖篩選
- pin selection
- Event Peek
- Event Detail

你要觀察：
- 地圖是否真的能幫助選擇
- pin 和 peek card 是否足夠清楚
- recenter / layers 這種次要控制是否容易被理解

### Phase 6：去 My Plan 感受「被整理」
切到 `/plan`

引導語：
「現在假設你已經挑了幾個想去的活動，看看這裡能不能幫你整理。」

請他做：
- 看 date strip
- 看 `Planned / Saved / Past`
- 在 Planned 中查看路線與節點
- 點 `Generate route`
- 切去 Saved 分段
- 嘗試把一個 saved event 加進 plan

你要觀察：
- 他是否理解這裡是行程整理中心
- AI summary card 是否有幫助
- route modal 是否讓人覺得真有規劃價值

### Phase 7：走社交與個人中心
切到 `/me`

請他做：
- 看個人卡與統計
- 進 `Saved`
- 返回 Profile
- 進 `Friends`
- 從 Friends 傳訊息給某位朋友
- 再返回 Profile，進 `Following`
- 再進 `Settings`

會經過頁面：
- Profile
- Saved
- Friends
- Messages / Chat Detail
- Following
- Settings

你要觀察：
- My Hub 是否像有價值的「個人中心」
- Friends / Following 是否被理解成社交功能
- Settings 的語言切換是否自然

### Phase 8：在聊天室完成分享閉環
停留在 `/messages` 或 `/messages/:chatId`

請他做：
- 打開一個 chat
- 傳一句文字
- 用 `+` 打開 attachment menu
- 分享一個 event 到聊天室
- 再點 event bubble 回 event detail

這一段很重要，因為它串起：
- 發現活動
- 分享活動
- 對話討論
- 回到活動詳情

你要觀察：
- 使用者是否能理解 `+` 是分享入口
- event bubble 是否夠像「可點擊卡片」
- 分享給朋友的動機是否成立

---

## 7. 為了覆蓋全部頁面，最後補的兩段

### 補頁 1：Vibe Discovery
打開：`/vibes`

原因：
- 這頁有實作、有截圖，但目前 UI 裡看不到自然入口。
- 它比較像「完整類型瀏覽頁」，和 Home 的 category tiles 不同。

建議主持人說法：
「如果把活動類型做成一個獨立入口，你會想不想從這裡開始找？」

### 補頁 2：Friend Profile
打開：任一 `/friends/:id`
例如：`/friends/emma`

原因：
- route 已存在，但 Friends 頁目前沒有點進 profile 的互動。
- 所以這頁不能算自然可達，只能當 QA 補看。

建議主持人說法：
「如果朋友有個人頁，你覺得這些資訊夠不夠？」

## 8. 最推薦的實測順序

如果你真的要帶同學完整跑一次，我建議順序固定如下：

1. Home
2. Category Detail
3. Event Detail
4. Reels
5. Map
6. Event Detail from Map
7. My Plan
8. Profile
9. Saved
10. Friends
11. Messages
12. Chat Detail
13. Following
14. Settings
15. `/vibes` 補頁
16. `/friends/:id` 補頁

這樣的好處是：
- 故事順
- 不會一直跳來跳去
- 從發現到規劃到社交有完整閉環

## 9. 建議你收集 feedback 的問題

每位同學跑完後，可以問這幾題：

1. 你最喜歡哪個探索入口？Home、Reels 還是 Map？
2. 哪一頁最讓你有「這個 app 很有價值」的感覺？
3. 哪一頁資訊太多、太亂，或不知道下一步要幹嘛？
4. 收藏、加入計畫、分享，這三個動作的差異清不清楚？
5. 你會不會想真的用這個 app 規劃週末活動？為什麼？

## 10. 目前最重要的設計結論

### 優勢
- 產品概念一致，主題很聚焦。
- 三種探索模式很完整：list / reels / map。
- 活動到規劃再到聊天分享，形成一條完整故事線。
- 視覺語言整體一致，像同一個產品。

### 目前明顯問題
- `/vibes` 沒有自然入口。
- `/friends/:id` 沒有自然入口。
- Saved / Planned 狀態不持久，課堂 demo 要注意重新整理會清空。
- Settings、Following 偏靜態展示，互動深度較弱。
- `react-router-dom` 有裝，但整體仍偏 prototype，某些頁面是概念展示多於完整產品流程。

## 11. 下次可直接接續的方向

下次如果要延續這份文件，可以直接做三件事：
- 根據這份流程做課堂主持腳本
- 把所有頁面分成「正式版必留 / 可合併 / 可刪除」
- 針對兩個孤島頁面補入口設計

