# Realtime Chat (MVP)

## 專案目標
建立一個可擴展的即時聊天室 + 通知系統 MVP，示範：
- WebSocket 即時通訊（Socket.IO / ws）
- 後端：Node.js + Express (或 NestJS)
- DB：Postgres（訊息持久化）
- 快取 / pubsub：Redis
- 訊息佇列：RabbitMQ
- CI/CD：GitHub Actions / GitLab CI

## 技術選型
- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: PostgreSQL
- Cache / PubSub: Redis
- Message Queue: RabbitMQ
- Container: Docker / Docker Compose

## 快速啟動（本地）
1. 複製 repo 並建立環境變數
```bash
git clone git@github.com:YOUR_ORG/realtime-chat.git
cd realtime-chat
cp .env.example .env
# 修改 .env 裡的變數（例如 DB 密碼）

#----自己看的
分支策略建議（規則）
	•	main：穩定可上線的版本（保護分支、PR 要過 CI）
	•	develop：整合開發分支，feature 完成後合到 develop
	•	feature/<topic>：每個新功能一個 feature 分支（例如 feature/auth-jwt）
	•	hotfix/<issue>：緊急修補直接從 main 出 hotfix，完成後合回 main & develop

PR 流程：
	1.	每個 feature 開 PR 到 develop（title, description, link to issue）
	2.	CI：lint + unit tests 必過
	3.	2 位 reviewer approve 後 merge（squash or merge commit 規則依團隊決定）
	4.	release：從 develop 合併到 main，tag 與部署 pipeline 觸發