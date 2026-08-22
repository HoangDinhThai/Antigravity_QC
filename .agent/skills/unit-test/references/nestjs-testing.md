# NestJS Testing Reference

> ⚠️ **Pattern catalog** — pick the 1-3 patterns that match your target. Do NOT reproduce every pattern below for a single file. Respect the [DO NOT TEST](../SKILL.md#do-not-test) list and propose a Test Plan before writing.

## Stack

- **Node.js** + TypeScript, NestJS 10+
- **Jest** (default test runner via `@nestjs/testing`)
- **supertest** for e2e HTTP testing

## Setup

NestJS ships with Jest. Config in `jest.config.js` or `package.json`.

```bash
# Already included with NestJS
npm i --save-dev @nestjs/testing jest
# For e2e
npm i --save-dev supertest @types/supertest
```

## Directory Structure

```
src/
├── user/
│   ├── user.service.ts
│   ├── user.controller.ts
│   ├── user.module.ts
│   └── __tests__/
│       ├── user.service.spec.ts      ← Unit tests
│       └── user.controller.spec.ts   ← Unit tests
test/
├── app.e2e-spec.ts                   ← E2E tests
└── jest-e2e.json                     ← E2E Jest config
```

## Key Patterns

### 1. Testing a Service (Unit)

```ts
// user/__tests__/user.service.spec.ts
import { Test } from '@nestjs/testing'
import { UserService } from '../user.service'
import { UserRepository } from '../user.repository'

describe('UserService', () => {
  let service: UserService
  let repo: jest.Mocked<UserRepository>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get(UserService)
    repo = module.get(UserRepository)
  })

  it('findAll returns mapped users', async () => {
    // Source: src/user/user.service.ts:18 — UserService.findAll()
    // Behavior: maps DB rows → DTOs, converts id to string
    repo.find.mockResolvedValue([
      { id: 1, name: 'Alice', email: 'alice@test.com' },
    ])

    const result = await service.findAll()

    expect(result).toEqual([{ id: '1', name: 'Alice' }])
    expect(repo.find).toHaveBeenCalledOnce()
  })

  it('findById throws NotFoundException when missing', async () => {
    // Source: src/user/user.service.ts:30 — UserService.findById()
    // Behavior: throws NotFoundException when repo returns null
    repo.findById.mockResolvedValue(null)

    await expect(service.findById('999')).rejects.toThrow(NotFoundException)
  })
})
```

### 2. Testing a Controller (Unit)

```ts
// user/__tests__/user.controller.spec.ts
import { Test } from '@nestjs/testing'
import { UserController } from '../user.controller'
import { UserService } from '../user.service'

describe('UserController', () => {
  let controller: UserController
  let service: jest.Mocked<UserService>

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get(UserController)
    service = module.get(UserService)
  })

  it('GET /users returns list', async () => {
    const users = [{ id: '1', name: 'Alice' }]
    service.findAll.mockResolvedValue(users)

    expect(await controller.findAll()).toEqual(users)
  })

  it('POST /users creates and returns 201', async () => {
    const dto = { name: 'Bob', email: 'bob@test.com' }
    const created = { id: '2', ...dto }
    service.create.mockResolvedValue(created)

    const result = await controller.create(dto)

    expect(result).toEqual(created)
    expect(service.create).toHaveBeenCalledWith(dto)
  })
})
```

### 3. Testing Guards and Middleware

```ts
// Test controller with guard bypassed
const module = await Test.createTestingModule({
  controllers: [AdminController],
  providers: [
    { provide: AdminGuard, useValue: { canActivate: () => true } },
    { provide: UserService, useValue: mockUserService },
  ],
}).compile()

// Override guard for specific test
const guard = module.get(AdminGuard)
jest.spyOn(guard, 'canActivate').mockResolvedValue(false)

await expect(controller.adminAction()).rejects.toThrow(ForbiddenException)
```

### 4. E2E Testing with Supertest

```ts
// test/app.e2e-spec.ts
import { Test } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('User API (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('POST /users creates a user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Alice', email: 'alice@test.com' })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('Alice')
        expect(res.body.id).toBeDefined()
      })
  })

  it('GET /users returns list', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true)
      })
  })

  it('POST /users with invalid data returns 400', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ name: '' })  // Missing email
      .expect(400)
  })
})
```

### 5. Mocking with Partial Mocking

```ts
// Use jest.spyOn for partial mocking
const module = await Test.createTestingModule({
  providers: [
    UserService,
    { provide: PrismaService, useValue: {} },
  ],
}).compile()

const service = module.get(UserService)
jest.spyOn(service, 'validateEmail').mockReturnValue(true)
```

### 6. Testing Pipes and DTOs

```ts
import { ValidationPipe, ArgumentMetadata } from '@nestjs/common'
import { CreateUserDto } from './create-user.dto'

describe('CreateUserDto validation', () => {
  let pipe: ValidationPipe

  beforeEach(() => {
    pipe = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
  })

  it('rejects missing required fields', async () => {
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: CreateUserDto,
      data: '',
    }

    await expect(
      pipe.transform({}, metadata)
    ).rejects.toThrow()
  })
})
```

## Jest Config

```js
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.spec.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/__tests__/**'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
}
```

## Coverage

```bash
npm test -- --coverage
npm test -- --coverage --watchAll=false  # CI mode
```

## Common Pitfalls

| Issue | Solution |
|---|---|
| Module not found in tests | Check `moduleFileExtensions` and path aliases |
| Dependency cycle in providers | Mock the dependency, don't import the real module |
| E2E tests share state | Reset DB between tests or use transactions |
| Guard/Interceptor not applied | E2E tests apply all pipes/guards. Unit tests must add manually |
| BigInt serialization | Use `.toString()` for IDs in expectations |
| Prisma client not mocked | Create `PrismaService` mock with all needed methods |
