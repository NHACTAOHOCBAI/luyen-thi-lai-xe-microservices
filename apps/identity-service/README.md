# Identity Service

Identity service handles login against Keycloak, first-login provisioning, and internal user profile synchronization.

## What changed

- Login is now handled by Keycloak direct grant through `POST /auth/login`.
- Kong validates access tokens using Keycloak JWKS (`RS256`).
- The service provisions a local `IdentityUser` on first login and publishes `identity.user.created`.
- Legacy local JWT minting has been removed.

## Local setup

Start the shared infrastructure from the repo root:

```bash
docker-compose up -d db-user rabbitmq consul consul-init
npm run consul:seed:local
```

Generate Prisma client and run the service:

```bash
cd apps/identity-service
npm run prisma:generate
npm run start:dev
```

## Environment / Consul keys

Identity service expects these config values:

- `keycloak.baseUrl` = `http://localhost:8080`
- `keycloak.realm` = `dev-realm`
- `keycloak.mobileClientId` = `mobile-client`
- `keycloak.webClientId` = `web-client`
- `keycloak.mobileClientSecret` = optional, stored outside git
- `keycloak.webClientSecret` = optional, stored outside git

## Login API

`POST /auth/login`

Request body:

```json
{
  "email": "student@example.com",
  "password": "secret",
  "client": "mobile-client"
}
```

Response shape:

```json
{
  "success": true,
  "code": "SUCCESS",
  "message": "OK",
  "data": {
    "message": "Login successful",
    "tokenType": "Bearer",
    "accessToken": "<keycloak-access-token>",
    "expiresAt": "2026-05-07T10:00:00.000Z",
    "user": {
      "id": "...",
      "email": "student@example.com",
      "name": "Student",
      "role": "STUDENT",
      "isActive": true,
      "lastLoginAt": "2026-05-07T09:00:00.000Z",
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

## Tests

```bash
npm test -- --runInBand login.use-case.spec.ts
npm test -- --runInBand auth.controller.spec.ts
npm run check-types
```

## Rollback & hardening

- If you need to roll back quickly, restore the previous `kong/kong.yaml` commit and re-enable the legacy HS256 consumer config.
- Keep Keycloak secrets out of git; store them in Consul, environment variables, or your secret manager.
- `POST /auth/login` is the only login entrypoint in this cutover.
- The Kong E2E smoke test requires the shared infra stack to be running; if the stack is not up, the service-level tests above are the supported verification path.

## Notes

- `AppController` now only exposes health and hello endpoints.
- `AppService` no longer mints tokens locally.
- If you add new roles, update the enum in `src/domain/identity-role.enum.ts` and the Prisma schema enum.
