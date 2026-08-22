# Vue 3 Testing Reference

> ⚠️ **Pattern catalog** — pick the 1-3 patterns that match your target. Do NOT reproduce every pattern below for a single file. Respect the [DO NOT TEST](../SKILL.md#do-not-test) list and propose a Test Plan before writing.

## Stack

- **Vue 3** + TypeScript
- **Vitest** (recommended) — native ESM, Vite-powered, fast
- **@vue/test-utils** — mount/shallowMount components
- **@testing-library/vue** (alternative) — user-centric queries
- **happy-dom** or **jsdom** for DOM environment

## Setup

```bash
npm i --save-dev vitest @vue/test-utils happy-dom @testing-library/vue
# If using Pinia
npm i --save-dev @pinia/testing
# If using Vue Router
npm i --save-dev vue-router
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.spec.*', 'src/**/*.d.ts'],
    },
  },
})
```

## Directory Structure

```
src/
├── components/
│   ├── UserCard.vue
│   └── __tests__/
│       └── UserCard.spec.ts
├── composables/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.spec.ts
├── stores/
│   ├── user.store.ts
│   └── __tests__/
│       └── user.store.spec.ts
└── utils/
    └── __tests__/
        └── format.spec.ts
```

## Key Patterns

### 1. Component Testing with @vue/test-utils

```ts
// components/__tests__/UserCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from '../UserCard.vue'

describe('UserCard', () => {
  const defaultProps = {
    user: { id: 1, name: 'Alice', email: 'alice@test.com' },
  }

  it('renders user name and email', () => {
    // Source: src/components/UserCard.vue:1 — <UserCard> template
    // Behavior: displays user.name and user.email
    const wrapper = mount(UserCard, { props: defaultProps })

    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('alice@test.com')
  })

  it('emits edit event when edit button clicked', async () => {
    // Source: src/components/UserCard.vue:12 — edit button @click handler
    // Behavior: emits 'edit' with user object when button clicked
    const wrapper = mount(UserCard, { props: defaultProps })

    await wrapper.find('[data-test="edit-btn"]').trigger('click')

    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')![0]).toEqual([defaultProps.user])
  })

  it('shows admin badge when user is admin', () => {
    // Source: src/components/UserCard.vue:20 — v-if admin badge
    // Behavior: renders admin badge only when role === 'admin'
    const wrapper = mount(UserCard, {
      props: { user: { ...defaultProps.user, role: 'admin' } },
    })

    expect(wrapper.find('[data-test="admin-badge"]').exists()).toBe(true)
  })

  it('hides admin badge for regular user', () => {
    const wrapper = mount(UserCard, { props: defaultProps })

    expect(wrapper.find('[data-test="admin-badge"]').exists()).toBe(false)
  })
})
```

### 2. Testing with Slots and Provide/Inject

```ts
it('renders slot content', () => {
  const wrapper = mount(UserCard, {
    props: defaultProps,
    slots: {
      actions: '<button data-test="custom-action">Custom</button>',
    },
  })

  expect(wrapper.find('[data-test="custom-action"]').exists()).toBe(true)
})

it('receives injected theme', () => {
  const wrapper = mount(UserCard, {
    props: defaultProps,
    global: {
      provide: {
        theme: 'dark',
      },
    },
  })

  expect(wrapper.classes()).toContain('dark-theme')
})
```

### 3. Testing Composables

```ts
// composables/__tests__/useCounter.spec.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from '../useCounter'

describe('useCounter', () => {
  it('increments count', () => {
    const { count, increment } = useCounter()

    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })

  it('accepts initial value', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })

  it('does not go below min', () => {
    const { count, decrement } = useCounter(0, { min: 0 })
    decrement()
    expect(count.value).toBe(0)
  })
})

// Testing async composable with vi.fn
it('fetches user data', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ id: 1, name: 'Alice' })
  const { user, fetchUser, isLoading } = useUserFetch(mockFetch)

  expect(isLoading.value).toBe(false)

  const promise = fetchUser(1)
  expect(isLoading.value).toBe(true)

  await promise
  expect(isLoading.value).toBe(false)
  expect(user.value).toEqual({ id: 1, name: 'Alice' })
})
```

### 4. Testing Pinia Stores

```ts
// stores/__tests__/user.store.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user.store'

describe('UserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty user', () => {
    const store = useUserStore()
    expect(store.user).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })

  it('login sets user', () => {
    const store = useUserStore()
    store.setUser({ id: 1, name: 'Alice' })

    expect(store.isLoggedIn).toBe(true)
    expect(store.user?.name).toBe('Alice')
  })

  it('logout clears user', () => {
    const store = useUserStore()
    store.setUser({ id: 1, name: 'Alice' })
    store.logout()

    expect(store.user).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })
})

// With API mocking
import { createTestingPinia } from '@pinia/testing'

it('fetches users from API', async () => {
  const wrapper = mount(UserList, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          initialState: { users: [] },
        }),
      ],
    },
  })

  const store = useUserStore()
  ;(store.fetchUsers as vi.Mock).mockResolvedValue([
    { id: 1, name: 'Alice' },
  ])

  await store.fetchUsers()

  expect(store.users).toHaveLength(1)
})
```

### 5. Testing with Vue Router

```ts
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

it('navigates to user detail on click', async () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/users/:id', component: { template: '<div>User</div>' } },
    ],
  })

  const wrapper = mount(UserCard, {
    props: defaultProps,
    global: { plugins: [router] },
  })

  await wrapper.find('[data-test="view-btn"]').trigger('click')
  await router.isReady()

  expect(router.currentRoute.value.path).toBe('/users/1')
})
```

### 6. Testing with @testing-library/vue (Alternative)

```ts
import { render, screen, fireEvent } from '@testing-library/vue'
import UserCard from '../UserCard.vue'

it('shows user info and handles edit', async () => {
  render(UserCard, {
    props: { user: { id: 1, name: 'Alice', email: 'alice@test.com' } },
  })

  expect(screen.getByText('Alice')).toBeInTheDocument()
  expect(screen.getByText('alice@test.com')).toBeInTheDocument()

  await fireEvent.click(screen.getByRole('button', { name: /edit/i }))
})
```

## Common Pitfalls

| Issue | Solution |
|---|---|
| Component not found after `v-if` | Use `await wrapper.vm.$nextTick()` or `flushPromises()` |
| Auto-imports fail in tests | Configure `unplugin-vue-components` in vitest config |
| Pinia store not reset | Use `setActivePinia(createPinia())` in `beforeEach` |
| Router links fail | Use `createMemoryHistory()` + mock routes |
| `window` / DOM not available | Set `environment: 'happy-dom'` in vitest config |
| Async component rendering | Use `await flushPromises()` after triggering async actions |
