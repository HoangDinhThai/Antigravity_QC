# Express.js Testing Reference

> ⚠️ **Pattern catalog** — pick the 1-3 patterns that match your target. Do NOT reproduce every pattern below for a single file. Respect the [DO NOT TEST](../SKILL.md#do-not-test) list and propose a Test Plan before writing.

## Stack

- **Node.js** + TypeScript (or plain JS)
- **Jest** or **Vitest** as test runner
- **supertest** for HTTP/route testing
- No built-in DI — use dependency injection pattern or module mocking

## Setup

```bash
npm i --save-dev jest ts-jest @types/jest supertest @types/supertest
# Or with Vitest
npm i --save-dev vitest supertest @types/supertest
```

## Directory Structure

```
src/
├── routes/
│   ├── user.route.ts
│   └── __tests__/
│       └── user.route.spec.ts     ← Route/API tests
├── services/
│   ├── user.service.ts
│   └── __tests__/
│       └── user.service.spec.ts   ← Unit tests
├── middleware/
│   ├── auth.middleware.ts
│   └── __tests__/
│       └── auth.middleware.spec.ts
└── app.ts                         ← Express app factory
```

## Key Patterns

### 1. App Factory Pattern (Critical for Testability)

```ts
// src/app.ts — Export a factory function, NOT a running server
import express from 'express'
import { userRouter } from './routes/user.route'

export function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/users', userRouter)
  // Don't call app.listen() here
  return app
}

// src/server.ts — Entry point (separate from app)
import { createApp } from './app'
const app = createApp()
app.listen(3000)
```

### 2. Route/API Testing with Supertest

```ts
// routes/__tests__/user.route.spec.ts
import request from 'supertest'
import { createApp } from '../../app'

// Mock the service layer
jest.mock('../../services/user.service')

const app = createApp()

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('GET /users returns user list', async () => {
    // Source: src/routes/user.route.ts:8 — GET /users handler
    // Behavior: delegates to UserService.findAll, returns 200 with list
    const mockUsers = [
      { id: 1, name: 'Alice', email: 'alice@test.com' },
    ]
    ;(UserService.findAll as jest.Mock).mockResolvedValue(mockUsers)

    const res = await request(app).get('/users')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(mockUsers)
  })

  it('POST /users creates a user', async () => {
    const newUser = { name: 'Bob', email: 'bob@test.com' }
    const created = { id: 2, ...newUser }
    ;(UserService.create as jest.Mock).mockResolvedValue(created)

    const res = await request(app)
      .post('/users')
      .send(newUser)

    expect(res.status).toBe(201)
    expect(res.body).toEqual(created)
  })

  it('POST /users validates required fields', async () => {
    const res = await request(app)
      .post('/users')
      .send({})  // Missing name and email

    expect(res.status).toBe(400)
    expect(res.body.errors).toBeDefined()
  })

  it('GET /users/:id returns 404 when not found', async () => {
    ;(UserService.findById as jest.Mock).mockResolvedValue(null)

    const res = await request(app).get('/users/999')

    expect(res.status).toBe(404)
  })
})
```

### 3. Service Unit Testing

```ts
// services/__tests__/user.service.spec.ts
import { UserService } from '../user.service'
import { UserRepository } from '../user.repository'

// Mock the repository
jest.mock('../user.repository')

describe('UserService', () => {
  let service: UserService
  let repo: jest.Mocked<typeof UserRepository>

  beforeEach(() => {
    service = new UserService()
    repo = jest.mocked(UserRepository)
  })

  it('findAll maps entities to DTOs', async () => {
    // Source: src/services/user.service.ts:12 — UserService.findAll()
    // Behavior: strips password_hash from repo rows
    repo.findAll.mockResolvedValue([
      { id: 1, name: 'Alice', password_hash: 'xxx', email: 'a@b.c' },
    ])

    const users = await service.findAll()

    expect(users).toEqual([{ id: 1, name: 'Alice', email: 'a@b.c' }])
    // Password hash must NOT be in the result
    expect(users[0]).not.toHaveProperty('password_hash')
  })

  it('create hashes password before saving', async () => {
    const dto = { name: 'Bob', email: 'bob@test.com', password: 'secret' }
    repo.create.mockResolvedValue({ id: 2, ...dto, password_hash: 'hashed' })

    await service.create(dto)

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ password: expect.not.stringContaining('secret') })
    )
  })
})
```

### 4. Middleware Testing

```ts
// middleware/__tests__/auth.middleware.spec.ts
import { authMiddleware } from '../auth.middleware'
import { Request, Response, NextFunction } from 'express'

describe('Auth Middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction

  beforeEach(() => {
    mockReq = { headers: {} }
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    }
    mockNext = jest.fn()
  })

  it('calls next() with valid token', () => {
    mockReq.headers = { authorization: 'Bearer valid-token' }
    jest.spyOn(jwt, 'verify').mockReturnValue({ userId: 1 })

    authMiddleware(mockReq as Request, mockRes as Response, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(mockReq.user).toEqual({ userId: 1 })
  })

  it('returns 401 with missing token', () => {
    mockReq.headers = {}

    authMiddleware(mockReq as Request, mockRes as Response, mockNext)

    expect(mockRes.status).toHaveBeenCalledWith(401)
    expect(mockNext).not.toHaveBeenCalled()
  })
})
```

### 5. Error Handler Testing

```ts
import { errorHandler } from '../error-handler'
import { AppError } from '../errors'

describe('Error Handler', () => {
  it('handles AppError with correct status', () => {
    const err = new AppError(404, 'User not found')
    const req = {} as Request
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response
    const next = jest.fn()

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'User not found' })
  })

  it('handles unexpected errors with 500', () => {
    const err = new Error('Something broke')
    const req = {} as Request
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response
    const next = jest.fn()

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
  })
})
```

### 6. Vitest Variant

Replace `jest` with `vi` from vitest:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../../app'

// Mock with vitest
vi.mock('../../services/user.service', () => ({
  UserService: {
    findAll: vi.fn(),
    create: vi.fn(),
  },
}))

const app = createApp()

it('GET /users returns list', async () => {
  const { UserService } = await import('../../services/user.service')
  vi.mocked(UserService.findAll).mockResolvedValue([])

  const res = await request(app).get('/users')
  expect(res.status).toBe(200)
})
```

## Jest Config

```js
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts'],
  coverageDirectory: 'coverage',
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80 } },
}
```

## Common Pitfalls

| Issue | Solution |
|---|---|
| Tests hang (server not closing) | Use app factory pattern, don't `listen()` in tests |
| Port conflicts | Supertest binds to ephemeral port automatically |
| Middleware order matters | Test with full app, not isolated routes |
| `jest.mock` hoisting issues | Use `jest.mock()` at top of file, not inside `describe` |
| Async middleware not awaited | Supertest handles this, but unit tests must `await` manually |
| Cookie/session testing | Use `agent = request.agent(app)` to persist cookies |
