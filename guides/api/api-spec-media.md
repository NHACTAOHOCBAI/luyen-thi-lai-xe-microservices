# Media Service API Specification

**Base URL (qua Kong):** `http://localhost:8000`
**Service path:** `/media`
**Direct (local dev):** `http://localhost:3010`
**Swagger UI:** `http://localhost:3010/api-docs`
**Version:** 1.0.0

---

## Tổng quan

`media-service` cung cấp khả năng lưu trữ file tập trung cho toàn hệ thống.  
File thực sự được lưu trên **Azure Blob Storage** (5GB free với Azure for Students).  
Database PostgreSQL chỉ lưu **metadata** (tên file, MIME type, kích thước, storage key, v.v.).

Các service khác (course-service, exam-service, v.v.) gọi media-service để upload file và nhận lại URL để lưu vào data của mình.

**Storage key format:** `uploads/YYYY/MM/<uuid>.<ext>`  
Ví dụ: `uploads/2026/05/3fa85f64-5717-4562-b3fc-2c963f66afa6.jpg`

---

## Xác thực

Tất cả các endpoint đều yêu cầu JWT hợp lệ do Keycloak phát hành.

Kong gateway:

1. Xác thực chữ ký JWT (`exp`, `iss`)
2. Inject các header vào request trước khi forward xuống service:
   - `x-user-id` — `sub` claim từ JWT (Keycloak user UUID)
   - `x-user-role` — role của user

**Header Authorization:**

```http
Authorization: Bearer <keycloak_access_token>
```

---

## Response Format

Tất cả response đều theo cấu trúc chuẩn của hệ thống:

```json
// Thành công
{
  "success": true,
  "code": "SUCCESS",
  "message": "OK",
  "timestamp": "2026-05-11T10:00:00.000Z",
  "path": "/media/files",
  "data": { ... }
}

// Lỗi
{
  "success": false,
  "code": "FILE_NOT_FOUND",
  "message": "File with id \"abc-123\" not found",
  "timestamp": "2026-05-11T10:00:00.000Z",
  "path": "/media/files/abc-123"
}
```

---

## Error Codes

| HTTP Status | Code                   | Nguyên nhân                                         |
| ----------- | ---------------------- | --------------------------------------------------- |
| 400         | `VALIDATION_ERROR`     | Request body/query không hợp lệ                     |
| 400         | `BAD_REQUEST`          | Không tìm thấy file trong request                   |
| 404         | `FILE_NOT_FOUND`       | Không tìm thấy file với ID đã cho                   |
| 422         | `FILE_TOO_LARGE`       | Kích thước file vượt quá 10MB                       |
| 422         | `INVALID_MIME_TYPE`    | MIME type không được phép                           |
| 502         | `FILE_UPLOAD_FAILED`   | Lỗi kết nối đến Azure Blob Storage                  |

---

## MIME Types Được Phép

| Loại     | MIME Types                                                                                                            |
| -------- | --------------------------------------------------------------------------------------------------------------------- |
| Ảnh      | `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`                                                 |
| Tài liệu | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`    |
| Video    | `video/mp4`, `video/webm`                                                                                             |
| Audio    | `audio/mpeg`, `audio/wav`                                                                                             |

**Kích thước tối đa:** 10MB per file

---

## File Object (Shared Response Type)

```json
{
  "id": "uuid",
  "storageKey": "uploads/2026/05/abc-123.jpg",
  "originalName": "avatar.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 204800,
  "bucketName": "media",
  "uploadedById": "keycloak-user-uuid",
  "isPublic": false,
  "createdAt": "2026-05-11T10:00:00.000Z"
}
```

---

## Endpoints

### POST /media/files — Upload file

Upload file mới lên Azure Blob Storage. File phải được gửi dưới dạng `multipart/form-data`.

**Request Headers:**

```http
Authorization: Bearer <jwt>
x-user-id: <uuid>          # Injected by Kong
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**

| Field | Type   | Required | Mô tả                   |
| ----- | ------ | -------- | ----------------------- |
| file  | binary | Yes      | File cần upload (≤10MB) |

**Response 201:**

```json
{
  "success": true,
  "code": "SUCCESS",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "storageKey": "uploads/2026/05/3fa85f64-5717-4562-b3fc-2c963f66afa6.jpg",
    "originalName": "document.pdf",
    "mimeType": "application/pdf",
    "fileSize": 512000,
    "bucketName": "media",
    "uploadedById": "keycloak-user-uuid",
    "isPublic": false,
    "createdAt": "2026-05-11T10:00:00.000Z"
  }
}
```

**Events Published:** `media.file.uploaded`

---

### GET /media/files — List files

Lấy danh sách files với phân trang và filter.

**Query Parameters:**

| Param          | Type   | Default | Mô tả                                         |
| -------------- | ------ | ------- | --------------------------------------------- |
| `page`         | number | 1       | Trang hiện tại                                |
| `size`         | number | 20      | Số items mỗi trang                            |
| `uploadedById` | string | —       | Filter theo user UUID đã upload               |
| `mimeType`     | string | —       | Filter theo MIME type prefix (e.g. `image/`)  |

**Response 200:**

```json
{
  "success": true,
  "code": "SUCCESS",
  "data": {
    "items": [ /* FileObject[] */ ],
    "total": 100,
    "page": 1,
    "size": 20
  }
}
```

---

### GET /media/files/:id — Get file metadata

Lấy thông tin metadata của một file theo ID.

**Path Params:** `id` — UUID của file

**Response 200:**

```json
{
  "success": true,
  "code": "SUCCESS",
  "data": { /* FileObject */ }
}
```

---

### GET /media/files/:id/url — Get presigned download URL

Tạo URL tạm thời (Azure Blob SAS) để download file trực tiếp từ Azure Blob Storage.  
URL có hiệu lực theo cấu hình `storage.presignedUrlExpiry` (mặc định: **1 giờ**).

**Path Params:** `id` — UUID của file

**Response 200:**

```json
{
  "success": true,
  "code": "SUCCESS",
  "data": {
    "url": "https://mediasvdev2026.blob.core.windows.net/media/uploads/2026/05/abc.jpg?sv=...&sig=...",
    "expiresAt": "2026-05-11T11:00:00.000Z"
  }
}
```

> **Tip:** Để hiển thị ảnh hoặc link download trong UI, dùng URL này. Không expose `storageKey` hay container name ra frontend.

---

### DELETE /media/files/:id — Delete file

Xóa metadata khỏi database trước, sau đó xóa blob khỏi Azure Blob Storage.  
Nếu storage delete thất bại, metadata đã bị xóa — blob trở thành orphan (có thể dọn thủ công trên Azure Portal).

**Request Headers:**

```http
Authorization: Bearer <jwt>
x-user-id: <uuid>   # Injected by Kong
```

**Path Params:** `id` — UUID của file

**Response 204:** No Content

**Events Published:** `media.file.deleted`

---

## Domain Events

### `media.file.uploaded`

Published sau khi file được upload thành công vào Azure và metadata được lưu vào DB.

```json
{
  "eventName": "media.file.uploaded",
  "fileId": "uuid",
  "storageKey": "uploads/2026/05/abc.jpg",
  "originalName": "avatar.jpg",
  "mimeType": "image/jpeg",
  "fileSize": 204800,
  "uploadedById": "keycloak-user-uuid"
}
```

**Consumers:** (optional, có thể thêm sau)

- `analytics-service` — thống kê tổng dung lượng upload

---

### `media.file.deleted`

Published sau khi metadata được xóa khỏi DB.

```json
{
  "eventName": "media.file.deleted",
  "fileId": "uuid",
  "storageKey": "uploads/2026/05/abc.jpg",
  "deletedById": "keycloak-user-uuid"
}
```

---

## Design Patterns Áp Dụng

| Pattern | Nơi áp dụng | Lợi ích |
| ------- | ----------- | ------- |
| **Port & Adapter (Hexagonal)** | `StoragePort` abstract class + `AzureBlobStorageProvider` impl | Swap storage provider (Azure/S3/MinIO) chỉ bằng đổi binding trong module, không đụng domain/application |
| **Repository Pattern** | `FileObjectRepository` (abstract) + `PrismaFileObjectRepository` | Domain layer không biết về Prisma; có thể swap sang MongoDB bằng cách viết impl khác |
| **Factory Method** | `FileObject.create()` — validate VOs + raise `FileUploadedEvent`; `FileObject.reconstitute()` — rebuild từ DB không raise event | Đảm bảo invariants luôn được kiểm tra khi tạo mới, bỏ qua khi restore |
| **Strategy Pattern** | `StoragePort` là strategy contract — `AzureBlobStorageProvider` là concrete strategy | Có thể inject strategy khác qua DI (e.g. `LocalStorageProvider` cho tests) |
| **Domain Events** | `FileUploadedEvent`, `FileDeletedEvent` — raised trong domain methods, published sau khi save thành công | Eventual consistency — analytics/notification service subscribe không cần biết về media-service |
| **CQRS (light)** | Commands (`UploadFileCommand`, `DeleteFileCommand`) tách khỏi Queries (`GetFileMetadataQuery`, `ListFilesQuery`, `GetPresignedUrlQuery`) | Read/write path rõ ràng; dễ scale read side độc lập |

---

## Cấu hình Azure Blob Storage

Lấy credentials từ **Azure Portal → Storage Account → Access Keys**:

| Consul Key | Mô tả |
| --- | --- |
| `storage.accountName` | Tên Storage Account (e.g. `mediasvdev2026`) |
| `storage.accountKey` | Access Key của Storage Account |
| `storage.containerName` | Tên container (mặc định: `media`) |
| `storage.presignedUrlExpiry` | Thời gian hết hạn SAS URL tính bằng giây (mặc định: `3600`) |

Container được tự động tạo khi service khởi động nếu chưa tồn tại (`onModuleInit`).

---

## Testing

```bash
# 1. Khởi động infra + migration
npm run infra:up
npm run consul:seed:local
cd apps/media-service && npx prisma generate && npx prisma migrate dev --name init

# 2. Chạy service
npm run dev --filter=media-service

# 3. Upload file (thay x-user-id bằng UUID thật hoặc bất kỳ UUID)
curl -X POST http://localhost:3010/media/files \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001" \
  -F "file=@/path/to/image.jpg"

# 4. Lấy presigned URL
curl http://localhost:3010/media/files/<id>/url

# 5. Xóa file
curl -X DELETE http://localhost:3010/media/files/<id> \
  -H "x-user-id: 00000000-0000-0000-0000-000000000001"

# 6. Test qua Kong (cần JWT từ Keycloak)
curl -X POST http://localhost:8000/media/files \
  -H "Authorization: Bearer <jwt>" \
  -F "file=@/path/to/image.jpg"
```
