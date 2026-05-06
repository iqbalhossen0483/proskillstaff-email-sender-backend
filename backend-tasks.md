# Backend Tasks — Email Sender

Stack: NestJS · TypeORM · PostgreSQL · class-validator · Helmet · Redis · BullMQ · GCS · Resend · Swagger · CORS · Rate Limit · JWT · bcrypt

---

## Milestone 1 — Project Setup & Infrastructure ✅

### Project Scaffolding

- [x] Init NestJS app with TypeScript inside `email-sender-backend/` (`nest new .`)
- [x] Install all dependencies: `@nestjs/typeorm`, `typeorm`, `pg`, `class-validator`, `class-transformer`, `@nestjs/config`, `@nestjs/jwt`, `passport`, `passport-jwt`, `@nestjs/passport`, `bcrypt`, `@nestjs/throttler`, `helmet`, `@nestjs/swagger`, `swagger-ui-express`, `ioredis`, `@nestjs/bullmq`, `bullmq`, `@google-cloud/storage`, `resend`
- [x] Configure `ConfigModule.forRoot({ isGlobal: true })` with `.env` validation using `class-validator`
- [x] `.env` template variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REDIS_URL`, `GCS_BUCKET`, `GCS_KEY_FILE`, `RESEND_API_KEY`, `FRONTEND_URL`, `BCRYPT_ROUNDS` (default 12)
- [x] Enable global `ValidationPipe` with `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- [x] Enable global `ClassSerializerInterceptor` to auto-exclude `@Exclude()` fields (e.g. `password_hash`)

### Database Setup (TypeORM)

- [x] Configure `TypeOrmModule.forRootAsync` with `DataSource` options: `type: 'postgres'`, `url: process.env.DATABASE_URL`, `entities: [__dirname + '/**/*.entity{.ts,.js}']`, `migrations`, `synchronize: false` (use migrations only)
- [x] Create entities: `User`, `Layout`, `EmailTemplate`, `EmailSend`, `PasswordReset` (see data model section below)
- [x] Generate initial migration with all tables, indexes, and foreign keys
- [x] Write seed script that inserts the 2 `Layout` rows (`layout_a` / `layout_b`) — idempotent (upsert by slug)
- [x] Add `npm run migration:run`, `npm run migration:revert`, `npm run seed` scripts to `package.json`

### Entities

- [x] **User**: `id` (PrimaryGeneratedColum() type number), `name`, `email` (unique), `password_hash` (`@Exclude()`), `role` (enum: `admin | super_admin`), `status` (enum: `active | suspended`), `created_at`, `updated_at`, `last_login_at`
- [x] **Layout**: `id` (PrimaryGeneratedColum() type number), `slug` (unique: `layout_a | layout_b`), `name`, `description` — no timestamps, seeded only
- [x] **EmailTemplate**: `id` (PrimaryGeneratedColum() type number), `name`, `description` (nullable), `layout_id` (FK → Layout, not nullable, immutable after creation), `content_json` (jsonb), `created_by` (FK → User, nullable on user delete), `created_at`, `updated_at`, `deleted_at` (soft delete — add `@DeleteDateColumn`), `send_count` (int, default 0)
- [x] **EmailSend**: `id` (PrimaryGeneratedColum() type number), `template_id` (FK → EmailTemplate, nullable on template delete), `sent_by` (FK → User, nullable on user delete), `recipient_emails` (text array), `subject`, `status` (enum: `queued | sent | failed`), `sent_at`, `error_message` (nullable)
- [x] **PasswordReset**: `id` (PrimaryGeneratedColum() type number), `user_id` (FK → User), `token_hash`, `expires_at`, `used_at` (nullable)
- [x] Add DB indexes: `email_template(name)`, `email_template(layout_id)`, `email_template(created_by)`, `email_template(deleted_at)`, `email_send(template_id)`, `email_send(sent_by)`, `email_send(sent_at)`

### Security & Global Middleware

- [x] Apply `helmet()` in `main.ts`
- [x] Configure CORS: `origin: process.env.FRONTEND_URL`, `credentials: true`
- [x] Configure `ThrottlerModule` globally; apply stricter rate limit (`@Throttle`) on all auth endpoints: 10 req/min
- [x] Configure Swagger: `DocumentBuilder` with title, version, Bearer auth scheme; mount at `/api/docs`; disable in production env

### Redis

- [x] Configure `BullModule.forRoot` with Redis connection URL from env
- [x] Set up `ioredis` client as a custom provider for token blacklisting (logout invalidation) — lives in `src/redis/redis.module.ts` as `@Global()`

---

## Milestone 1 — Auth Module ✅

- [x] Create `AuthModule` with `AuthService`, `AuthController`, `JwtStrategy`
- [x] **`POST /auth/login`**: validate email + password, check `user.status !== 'suspended'` (throw 403 if suspended), update `last_login_at`, return `{ accessToken, user: { id, name, email, role } }`. JWT payload: `{ sub: user.id, role: user.role, jti: uuid }`
- [x] JWT signed with `JWT_SECRET`, expires per `JWT_EXPIRES_IN` (default `1h`)
- [x] `JwtAuthGuard` (extends `AuthGuard('jwt')`) — apply per route/controller; `JwtStrategy` validates token and attaches user to request
- [x] **`POST /auth/forgot-password`**: accept `{ email }`, look up user, generate a crypto-random token, hash it (sha256), store in `PasswordReset` with `expires_at = now + 30min`, enqueue Resend email via BullMQ with reset link (`FRONTEND_URL/reset-password?token=<raw>`). Always return 200 (never reveal whether email exists).
- [x] **`POST /auth/reset-password`**: accept `{ token, newPassword }`, hash token and look up unexpired unused `PasswordReset`, bcrypt hash new password (cost from env), update `User.password_hash`, set `PasswordReset.used_at = now`. Return 200.
- [x] **`POST /auth/logout`**: extract JWT from bearer header, add `jti` to Redis blacklist with TTL matching remaining token lifetime. `JwtStrategy` checks blacklist on every request.
- [x] **`GET /auth/me`**: return current user from JWT
- [x] Rate limit login and forgot-password endpoints: 10 req/min per IP

---

## Milestone 1 — Layouts Module ✅

- [x] Create `LayoutsModule` with `LayoutsController`, `LayoutsService`
- [x] **`GET /layouts`**: return all layouts (always 2 rows) — auth-required, role-agnostic
- [x] **`GET /layouts/:id`**: return a single layout by id
- [x] No create/update/delete endpoints — layouts are system-level, modified only via migrations + seed
- [x] Swagger decorators on all endpoints

---

## Milestone 2 — Templates Module

- [x] Create `TemplatesModule` with `TemplatesController`, `TemplatesService`
- [x] All endpoints require `JwtAuthGuard`

### CRUD

- [x] **`POST /templates`**: DTO — `name`, `description?`, `layout_id`, `content_json`. Set `created_by = req.user.id`. Validate `layout_id` exists (throw 404 if not). Return created entity.
- [x] **`GET /templates`**: paginated list (query params: `page`, `limit`, `search`, `layout_id`, `created_by`). Exclude soft-deleted (`deleted_at IS NULL`). Use TypeORM `createQueryBuilder` with `ILIKE` on name for search. Return `{ data, total, page, limit }`.
- [x] **`GET /templates/:id`**: return single template. Throw 404 if not found or soft-deleted.
- [x] **`PATCH /templates/:id`**: DTO — `name?`, `description?`, `content_json?`. `layout_id` must NOT be in the DTO (immutable). Update `updated_at`. Return updated entity.
- [x] **`DELETE /templates/:id`**: soft-delete using TypeORM's `softDelete()` (sets `deleted_at`). Return 204.
- [x] **`POST /templates/:id/duplicate`**: load source template, create new entity with `name = 'Copy of ' + source.name`, same `layout_id` and `content_json`, `send_count = 0`, `created_by = req.user.id`. Return new entity.

### Send History sub-resource

- [x] **`GET /templates/:id/sends`**: paginated list of `EmailSend` rows for this template. Return `{ data, total, page, limit }`.

---

## Milestone 3 — Email Send Module

- [x] Create `SendsModule` with `SendsController`, `SendsService`, and a `EmailDispatchProcessor` (BullMQ worker)

### Queue Setup

- [x] Register `BullModule.registerQueue({ name: 'email-dispatch' })` in `SendsModule`
- [x] Create `EmailDispatchProcessor` decorated with `@Processor('email-dispatch')`, handles `dispatch` job

### Send Flow

- [x] **`POST /sends`**: DTO — `template_id`, `recipient_emails[]` (array of valid email strings), `subject?` (overrides template's subject).
  1. Load template (404 if not found/deleted)
  2. Create `EmailSend` record with `status: 'queued'`
  3. Increment `EmailTemplate.send_count` atomically (`UPDATE ... SET send_count = send_count + 1`)
  4. Enqueue BullMQ job `{ sendId, templateId, recipientEmails, subject, contentJson, layoutSlug }`
  5. Return `{ sendId, status: 'queued' }`

### BullMQ Processor

- [x] `EmailDispatchProcessor.dispatch()`:
  1. Load `EmailSend` by `sendId`
  2. Render HTML from `content_json` + `layoutSlug` (call a shared `EmailRenderer` service that produces the email HTML string for either layout)
  3. Call Resend API: `resend.emails.send({ from, to: recipientEmails, subject, html })`
  4. On success: update `EmailSend.status = 'sent'`, set `sent_at = now`
  5. On failure: update `EmailSend.status = 'failed'`, store `error_message`
- [x] Configure BullMQ job retries: `attempts: 3`, `backoff: { type: 'exponential', delay: 2000 }`

### Email Renderer Service

- [x] Create `EmailRendererService` with methods `renderLayoutA(content: LayoutAContent): string` and `renderLayoutB(content: LayoutBContent): string`
- [x] Output is a self-contained HTML string with inline styles (email-client safe, no external CSS)
- [x] Used by the BullMQ processor for actual sending; also optionally exposed to a preview endpoint

---

## Milestone 3 — Dashboard Module

- [x] Create `DashboardModule` with `DashboardController`, `DashboardService`
- [x] All endpoints require `JwtAuthGuard`

- [x] **`GET /dashboard/stats`**: return `{ totalAllTime, thisMonth, today }` — counts of `EmailSend` rows with `status = 'sent'`
- [x] **`GET /dashboard/activity`** (query: `days=30`): return array of `{ date: 'YYYY-MM-DD', layoutA: n, layoutB: n }` for the last N days — join `EmailSend` → `EmailTemplate` → `Layout`, group by date and layout slug
- [x] **`GET /dashboard/layout-split`**: return `{ layoutA: n, layoutB: n }` total sent counts by layout
- [x] **`GET /dashboard/top-templates`**: return top 5 `EmailTemplate` rows ordered by `send_count DESC` (non-deleted only), fields: `id, name, send_count, layout.slug`
- [x] **`GET /dashboard/recent-sends`**: return last 10 `EmailSend` rows (status any) joined with `EmailTemplate`, `Layout`, and `User` (sent_by). Fields: `templateName, layoutSlug, recipientEmails, sentByName, sentAt, status`
- [x] **`GET /dashboard/user-activity`** (query: `userId?`, `from?`, `to?`): **Super Admin only** (`RolesGuard` check). Return paginated sends filterable by user and date range.

---

## Milestone 4 — Users Module (Super Admin only)

- [x] Create `UsersModule` with `UsersController`, `UsersService`
- [x] Apply `RolesGuard` with `@Roles('super_admin')` on the entire controller
- [x] Create `RolesGuard` that reads `user.role` from JWT and compares to `@Roles()` metadata

- [x] **`GET /users`**: paginated, searchable (name/email), filterable by `role` and `status`. Return `{ data, total, page, limit }`.
- [x] **`GET /users/:id`**: return single user (throw 404 if not found)
- [x] **`POST /users`**: DTO — `name`, `email`, `role`. Hash a random temp password, create user with `status: 'active'`. Enqueue invite email via BullMQ (sends a one-time password-set link using the same `PasswordReset` flow). Return created user (without password_hash).
- [x] **`PATCH /users/:id`**: DTO — `name?`, `email?`, `role?`. Guard: if changing role away from `super_admin`, check there is at least one other `super_admin` remaining (throw 422 if last one). Return updated user.
- [x] **`PATCH /users/:id/suspend`**: set `status = 'suspended'`. Optionally add active JWT to Redis blacklist (if token id is stored).
- [x] **`PATCH /users/:id/reactivate`**: set `status = 'active'`.
- [x] **`DELETE /users/:id`**: hard delete. Before deletion, null out `EmailSend.sent_by` and `EmailTemplate.created_by` FKs (or let DB handle with `SET NULL` on FK). Throw 422 if attempting to delete the last `super_admin`.
- [x] **`POST /users/:id/reset-password`**: trigger the same forgot-password token generation + Resend invite email on behalf of the user. Return 200.

---

## Milestone 4 — File Upload (GCS)

- [ ] Create `UploadsModule` with `UploadsController`, `UploadsService`
- [ ] **`POST /uploads/team-photo`**: accepts `multipart/form-data` with a single image file (max 5MB, accept `image/jpeg`, `image/png`, `image/webp`). Upload to GCS bucket with a uuid filename. Return `{ url: 'https://storage.googleapis.com/...' }`.
- [ ] Use `@google-cloud/storage` with key file path from env `GCS_KEY_FILE` and bucket from `GCS_BUCKET`
- [ ] Make uploaded objects publicly readable (or use signed URLs — decide based on whether photos are public)
- [ ] Endpoint requires `JwtAuthGuard`

---

## Milestone 5 — Transactional System Emails ✅

- [x] **Invite email**: sent when Super Admin creates a user — subject "You've been invited", contains one-time password-set link
- [x] **Password reset email**: sent on forgot-password request — subject "Reset your password", contains reset link valid 30 min
- [x] Create a `NotificationsService` with `sendInvite(email, name, resetLink)` and `sendPasswordReset(email, resetLink)` methods
- [x] These should be enqueued via a `notifications` BullMQ queue (separate from the `email-dispatch` queue) to keep system emails distinct from user-triggered sends

---

## Cross-Cutting

- [x] Create `PaginationDto` base class (query params: `page` default 1, `limit` default 20 max 100) reused across list endpoints
- [ ] Create `ApiResponse<T>` wrapper type for consistent response shape
- [x] All controller methods decorated with Swagger `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`
- [x] All DTOs have `@ApiProperty()` decorators for Swagger schema generation
- [x] Centralize error handling: global `HttpExceptionFilter` that returns `{ statusCode, message, error }` consistently
- [x] `GET /health` returns `{ status: 'ok' }` — no auth required (for uptime monitoring)
