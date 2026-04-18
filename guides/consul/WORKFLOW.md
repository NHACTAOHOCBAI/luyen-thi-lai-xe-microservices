# Workflow Làm Việc

## Dev hằng ngày

- Bật infrastructure bằng Docker: PostgreSQL, RabbitMQ, Consul.
- Service đang code chạy local bằng `npm run start:dev`.
- Không cần rebuild Docker image sau mỗi lần sửa code.

Ví dụ:

```powershell
docker compose up -d consul consul-init rabbitmq db-user db-exam
```

Terminal 1:

```powershell
cd apps/user-service
npm run start:dev
```

Terminal 2:

```powershell
cd apps/exam-service
npm run start:dev
```

## Host và Docker

- Service chạy trong Docker dùng hostname Docker như `db-user`, `rabbitmq`, `consul`.
- Service chạy local trên máy dùng `localhost:<port đã expose>`.

Ví dụ:

- Trong Docker: `postgresql://user:password@db-user:5432/user_db`
- Chạy local: `postgresql://user:password@localhost:5433/user_db`

`db-user` chỉ tồn tại trong mạng nội bộ của Docker Compose. Máy host không biết tên này, chỉ biết các cổng đã map ra như `localhost:5433`.

## Vai trò của `.env`

- Mỗi service có `.env` riêng trên máy dev.
- `.env` dùng cho `PORT`, `DATABASE_URL`, `RABBITMQ_URL`, `CONSUL_URL`.
- `.env` được load khi service khởi động.

Thứ tự ưu tiên hiện tại:

1. Biến môi trường và `.env`
2. Consul
3. Default trong code

Nghĩa là local có thể dùng `.env` để đè giá trị seed trong Consul.

## Consul development để làm gì

Vẫn cần giữ `consul-seed-development.json`.

Mục đích:

- Là config dùng chung cho team
- Phù hợp khi chạy service trong Docker
- Giữ workflow gần production hơn

Quy ước:

- Local dev: `.env` của service đè lên Consul
- Full Docker: dùng config trong Consul

## Khi nào cần build Docker image

Chỉ build image khi:

- Muốn chạy service trong container
- Muốn test full Docker
- Chuẩn bị deploy

Ví dụ:

```powershell
docker compose build exam-service
docker compose up -d exam-service
```

## Production

- Build image cho từng service
- Push image lên registry
- Seed config production vào Consul
- Deploy container với `NODE_ENV=production` và `CONSUL_URL`

`consul-seed-production.json` không dùng để build image. Nó dùng để nạp config runtime vào Consul production trước hoặc trong lúc deploy.
