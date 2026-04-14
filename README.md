# Luyen Thi Lai Xe Microservices - Dev Guide

Tai lieu nay la file duy nhat de team dev hieu cach code va van hanh local cho repo.

File roadmap cac viec can lam tiep theo: [README.NEXT-STEPS.md](./README.NEXT-STEPS.md)

## 1. Tong quan kien truc

- Monorepo: npm workspaces + Turborepo
- Backend: NestJS microservices trong `apps/*`
- Gateway: Kong DB-less trong `kong/kong.yaml`
- Message broker: RabbitMQ
- Database: Postgres (database per service)

## 2. Cau truc thu muc

```text
apps/
  identity-service/
  user-service/
  exam-service/
  course-service/
  question-service/
  notification-service/
  analytics-service/
  simulation-service/
packages/
  common/              # Thu vien noi bo dung chung
  eslint-config/
  typescript-config/
kong/
  kong.yaml
docker-compose.yaml
```

## 3. Chay full stack bang Docker (khuyen nghi)

Yeu cau:
- Docker Desktop

Start:

```bash
docker compose up --build
```

URL quan trong:
- Kong Proxy: http://localhost:8000
- Kong Admin API: http://localhost:8001
- RabbitMQ UI: http://localhost:15672

Stop:

```bash
docker compose down
```

## 4. Route qua gateway

- /auth -> identity-service
- /users -> user-service
- /exams -> exam-service
- /questions -> question-service
- /courses -> course-service
- /notifications -> notification-service
- /analytics -> analytics-service
- /simulations -> simulation-service

## 5. Chay local de code/debug

Yeu cau:
- Node.js >= 18
- npm

Install dependencies:

```bash
npm install
```

Chay 1 service:

```bash
npm run start:dev -w identity-service
```

Luu y:
- Mac dinh service dung PORT=3000.
- Neu chay nhieu service local, set PORT rieng.

PowerShell example:

```powershell
$env:PORT=3001
npm run start:dev -w identity-service
```

Scripts o root:

```bash
npm run build
npm run dev
npm run lint
npm run check-types
npm run format
```

## 6. Cach tao service moi

Vi du service moi: payment-service

Buoc 1 - Scaffold service
- Co the clone tu service co san de giu convention.
- Hoac tao moi:

```bash
npx @nestjs/cli new apps/payment-service --package-manager npm --skip-git
```

Buoc 2 - Cap nhat package cua service
- Sua `name` trong `apps/payment-service/package.json`
- Neu can dung thu vien noi bo, them dependency `@repo/common`

Buoc 3 - Tao Dockerfile
- Copy pattern tu `apps/identity-service/Dockerfile`
- Sua filter thanh `payment-service`

Buoc 4 - Dang ky vao docker compose
- Them `db-payment` (neu can DB)
- Them service `payment-service` trong `docker-compose.yaml`

Buoc 5 - Dang ky route Kong
- Them service + route trong `kong/kong.yaml`
- Restart Kong:

```bash
docker compose restart kong
```

Buoc 6 - Smoke test

```bash
docker compose up --build -d
curl http://localhost:8000/payments
```

## 7. Su dung thu vien noi bo packages/common

Muc tieu cua `packages/common/src`:
- Chua constants, DTO, event contract, helper dung chung.

Quy trinh dung:
1. Tao file module dung chung trong `packages/common/src/...`
2. Re-export trong `packages/common/src/index.ts`
3. Import tu service:

```ts
import { USER_CREATED_EVENT } from '@repo/common';
```

4. Dam bao service co dependency `@repo/common` trong package.json.

Quy uoc:
- Event name format: `domain.action.v1`
- Breaking change thi tao version moi, khong sua de vo tuong thich.

## 8. Quy trinh code trong team

1. Keo code moi nhat.
2. Chay lint + typecheck truoc khi push.
3. Chay test service dang sua.
4. Smoke test qua Kong neu co thay doi API/event.
5. Cap nhat tai lieu neu thay doi route, contract hoac convention.

Lenh goi y:

```bash
npm run lint
npm run check-types
npm run test -w identity-service
```

## 9. Troubleshooting nhanh

Kong route khong nhan:
- Kiem tra route trong `kong/kong.yaml`
- Restart Kong

RabbitMQ khong nhan event:
- Kiem tra ten queue/event producer-consumer trung nhau
- Kiem tra host la `rabbitmq` khi chay trong docker network

Bi trung port local:
- Set PORT rieng cho tung service

## 10. Definition of Done cho feature/service

- Co validation input
- Co unit test cho business logic chinh
- Co e2e test cho endpoint quan trong
- Da dang ky gateway route neu la API moi
- Da cap nhat tai lieu lien quan
