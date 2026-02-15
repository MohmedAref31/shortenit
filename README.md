# ShortenIt API

A URL shortener backend built with NestJS, MongoDB, JWT authentication, and i18n validation.

## Features

- User registration and login with hashed passwords (`bcrypt`)
- JWT-based authentication using Passport (`Bearer` tokens)
- Auth-protected URL creation endpoint
- Short URL redirection with permanent redirect (`308`)
- i18n-ready validation and error messages (`en`, `ar`)
- Dockerized development stack (API, MongoDB, Redis, Mongo Express)

## Tech Stack

- NestJS 11
- MongoDB + Mongoose
- Passport JWT (`@nestjs/passport`, `passport-jwt`)
- `class-validator` / `class-transformer`
- `nestjs-i18n`
- Docker & Docker Compose

## Environment Variables

Create a `.env.dev` file (or `.env.prod`) in the project root.

```env
PORT=3000

MONGO_URI=mongodb://root:password@localhost:27017/url-shortner?authSource=admin

JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d

MONGO_INITDB_ROOT_USERNAME=root
MONGO_INITDB_ROOT_PASSWORD=password
MONGO_EXPRESS_USERNAME=admin
MONGO_EXPRESS_PASSWORD=admin
```

## Run Locally

```bash
npm install
npm run start:dev
```

API runs on: `http://localhost:3000`

## Run with Docker

```bash
docker compose up --build
```

Services:

- API: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`
- Mongo Express: `http://localhost:8081`
- Redis: `localhost:6379`

## API Endpoints

### Health

- `GET /` → returns basic app greeting

### Auth

- `POST /auth/register`
- `POST /auth/login`

Example login response:

```json
{
  "message": "Login successful",
  "data": {
    "accessToken": "<jwt>",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "createdAt": "..."
    }
  }
}
```

### URL

- `POST /url` (Protected)
  - Headers: `Authorization: Bearer <accessToken>`
  - Body:

```json
{
  "originalUrl": "https://example.com/some/long/path"
}
```

- `GET /url/:shortCode`
  - Redirects permanently (`308`) to the original URL

## Validation & Localization

- Validation is enabled globally with whitelist and transformation.
- You can switch language using:
  - Query param: `?lang=en` or `?lang=ar`
  - `Accept-Language` header

## Available Scripts

```bash
npm run start
npm run start:dev
npm run start:prod
npm run build
npm run test
npm run test:e2e
npm run test:cov
```

## Project Structure

```text
src/
  modules/
    auth/
    url/
    user/
  i18n/
    en/
    ar/
```

## Notes

- URL short codes are generated with `nanoid(8)`.
- Collision checks are handled before persisting a new short URL.
- Click analytics fields exist in the model and can be extended in service logic.
