# Nuxt.js Testing Reference

> ⚠️ **Pattern catalog** — pick the 1-3 patterns that match your target. Do NOT reproduce every pattern below for a single file. Respect the [DO NOT TEST](../SKILL.md#do-not-test) list and propose a Test Plan before writing.

## Stack

- **Nuxt 3/4** + Vue 3 + TypeScript
- **Vitest** — primary test runner
- **@nuxt/test-utils** — official Nuxt testing utilities
- **@vue/test-utils** — component mounting
- **happy-dom** — DOM environment (recommended over jsdom)

## Setup

```bash
npm i --save-dev vitest @nuxt/test-utils @vue/test-utils happy-dom
# If using Pinia (auto-imported in Nuxt)
npm i --save-dev @pinia/testing
```

```ts
// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',           // Enables Nuxt auto-imports, components, composables
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['app/**/*.{ts,vue}', 'server/**/*.ts'],
      exclude: ['**/*.spec.*', '**/*.d.ts'],
    },
  },
})
```

## Directory Structure

```
├── app/  (or root for Nuxt 3)
│   ├── components/
│   │   ├── UserCard.vue
│   │   └── __tests__/
│   │       └── UserCard.spec.ts
│   ├── composables/
│   │   ├── useAuth.ts
│   │   └── __tests__/
│   │       └── useAuth.spec.ts
│   └── pages/
│       └── __tests__/
│           └── index.spec.ts
├── server/
│   ├── api/
│   │   ├── users.get.ts
│   │   └── __tests__/
│   │       └── users.get.spec.ts
│   ├── services/
│   │   ├── user.service.ts
│   │   └── __tests__/
│   │       └── user.service.spec.ts
│   └── utils/
│       └── __tests__/
│           └── validate.spec.ts
└── vitest.config.ts
```

## Key Patterns

### 1. Component Testing (with Nuxt Environment)

```ts
// components/__tests__/UserCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import UserCard from '../UserCard.vue'

describe('UserCard', () => {
  it('renders user name', async () => {
    // Source: app/components/UserCard.vue:1 — <UserCard> template
    // Behavior: displays user.name and user.email
    const wrapper = await mountSuspended(UserCard, {
      props: {
        user: { id: 1, name: 'Alice', email: 'alice@test.com' },
      },
    })

    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('alice@test.com')
  })

  it('emits edit event', async () => {
    // Source: app/components/UserCard.vue:12 — edit button @click handler
    // Behavior: emits 'edit' event when button clicked
    const wrapper = await mountSuspended(UserCard, {
      props: {
        user: { id: 1, name: 'Alice', email: 'alice@test.com' },
      },
    })

    await wrapper.find('[data-test="edit-btn"]').trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
  })
})
```

### 2. Testing Composables (with Nuxt context)

```ts
// composables/__tests__/useAuth.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'

describe('useAuth', () => {
  beforeEach(() => {
    // Reset state between tests if needed
  })

  it('returns null user initially', () => {
    const { user, isLoggedIn } = useAuth()

    expect(user.value).toBeNull()
    expect(isLoggedIn.value).toBe(false)
  })

  it('login sets user and calls API', async () => {
    const { user, login, isLoggedIn } = useAuth()

    // Mock $fetch (auto-provided by Nuxt)
    vi.mocked($fetch).mockResolvedValue({
      user: { id: 1, name: 'Alice' },
      token: 'jwt-token',
    })

    await login('alice@test.com', 'password')

    expect(isLoggedIn.value).toBe(true)
    expect(user.value?.name).toBe('Alice')
  })
})
```

### 3. Testing Server API Handlers

```ts
// server/api/__tests__/users.get.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setupTest } from '@nuxt/test-utils/e2e'

describe('GET /api/users', () => {
  beforeEach(() => {
    // Reset mocks
  })

  it('returns list of users', async () => {
    // Option 1: Test via $fetch with base URL
    const users = await $fetch('/api/users', {
      baseURL: 'http://localhost:3000',
    })

    expect(Array.isArray(users)).toBe(true)
  })
})

// Option 2: Test handler function directly (unit test)
// server/api/__tests__/users.get.unit.spec.ts
import { createEventHandler, getHeader, readBody } from 'h3'

describe('Users API handler', () => {
  it('returns users list', async () => {
    // Call the handler directly with mocked event
    const event = createEvent({
      node: { req: { method: 'GET' }, res: {} },
    })

    const result = await handler(event)

    expect(result).toBeDefined()
  })
})
```

### 4. Testing Server Services (Unit)

```ts
// server/services/__tests__/user.service.spec.ts
import { describe, it, expect, vi } from 'vitest'

// Mock Prisma
vi.mock('#server/utils/prisma', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { UserService } from '../user.service'
import { prisma } from '#server/utils/prisma'

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('findAll returns mapped users', async () => {
    const mockUsers = [
      { id: BigInt(1), name: 'Alice', email: 'alice@test.com' },
    ]
    vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers)

    const users = await UserService.findAll()

    expect(users).toHaveLength(1)
    expect(users[0].id).toBe('1')  // BigInt → String
    expect(users[0].name).toBe('Alice')
  })

  it('findById throws when user not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    await expect(UserService.findById('999')).rejects.toThrow()
  })
})
```

### 5. Testing Validation (Zod Schemas)

```ts
// server/schemas/__tests__/user.schema.spec.ts
import { describe, it, expect } from 'vitest'
import { createUserSchema } from '../user.schema'

describe('createUserSchema', () => {
  it('validates correct data', () => {
    const result = createUserSchema.safeParse({
      name: 'Alice',
      email: 'alice@test.com',
    })

    expect(result.success).toBe(true)
  })

  it('rejects missing name', () => {
    const result = createUserSchema.safeParse({
      email: 'alice@test.com',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('name')
    }
  })

  it('rejects invalid email', () => {
    const result = createUserSchema.safeParse({
      name: 'Alice',
      email: 'not-an-email',
    })

    expect(result.success).toBe(false)
  })
})
```

### 6. Testing with Mocked API Responses

```ts
// Mock $fetch globally for component tests
import { registerEndpoint } from '@nuxt/test-utils/runtime'

describe('UserList', () => {
  it('displays users from API', async () => {
    registerEndpoint('/api/users', {
      handler: () => [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ],
    })

    const wrapper = await mountSuspended(UserList)

    await nextTick()

    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
  })
})
```

## Common Pitfalls

| Issue | Solution |
|---|---|
| Auto-imports fail in tests | Use `environment: 'nuxt'` in vitest config (via `@nuxt/test-utils`) |
| `mountSuspended` not found | Import from `@nuxt/test-utils/runtime` |
| Prisma BigInt serialization | Use `.toString()` for BigInt IDs in expectations |
| `useFetch` / `$fetch` not mocked | Use `registerEndpoint()` from `@nuxt/test-utils/runtime` |
| Server-only code imported in FE test | Keep server and client tests in separate files |
| `definePageMeta` fails in tests | Mock or skip page meta in component tests |
| Nitro auto-imports missing | Import explicitly with `#imports` or `#server/utils/...` |
