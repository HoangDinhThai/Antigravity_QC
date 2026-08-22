# Next.js Testing Reference

> ⚠️ **Pattern catalog** — pick the 1-3 patterns that match your target. Do NOT reproduce every pattern below for a single file. Respect the [DO NOT TEST](../SKILL.md#do-not-test) list and propose a Test Plan before writing.

## Stack

- **Next.js 14/15** (App Router + Pages Router)
- **Vitest** (recommended) or **Jest**
- **React Testing Library** for component tests
- **MSW** or route handlers for API mocking

## Setup

```bash
npm i --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event
npm i --save-dev @testing-library/jest-dom @types/node
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.spec.{ts,tsx}', '**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest'

// Mock Next.js modules
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => '/'),
}))

vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

vi.mock('next/link', () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))
```

## Directory Structure

```
src/
├── app/
│   ├── page.tsx
│   ├── layout.tsx
│   └── __tests__/
│       └── home.spec.tsx
├── components/
│   ├── Navbar.tsx
│   └── __tests__/
│       └── Navbar.spec.tsx
├── lib/
│   ├── api.ts
│   └── __tests__/
│       └── api.spec.ts
└── middleware.ts
```

## Key Patterns

### 1. Testing Client Components

```tsx
// components/__tests__/SearchBar.spec.tsx
// The component must have 'use client' directive
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '../SearchBar'

it('calls onSearch with query on submit', async () => {
  // Source: src/components/SearchBar.tsx:5 — <SearchBar> onSearch
  // Behavior: invokes onSearch prop with trimmed query on submit
  const onSearch = vi.fn()
  render(<SearchBar onSearch={onSearch} />)

  const user = userEvent.setup()
  await user.type(screen.getByPlaceholderText(/search/i), 'react hooks')
  await user.click(screen.getByRole('button', { name: /search/i }))

  expect(onSearch).toHaveBeenCalledWith('react hooks')
})
```

### 2. Testing Server Components

Server components can't be rendered in jsdom directly. Test the logic separately:

```ts
// lib/__tests__/data-fetching.spec.ts
// Test the data fetching logic, not the component rendering
import { getUser } from '../api'

vi.mock('../api', () => ({
  getUser: vi.fn(),
}))

it('getUser returns user data', async () => {
  ;(getUser as vi.Mock).mockResolvedValue({ id: 1, name: 'Alice' })

  const user = await getUser(1)

  expect(user).toEqual({ id: 1, name: 'Alice' })
})
```

For rendering server components, extract client logic into separate functions/hooks and test those.

### 3. Testing API Route Handlers

```ts
// app/api/users/__tests__/route.spec.ts
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'

describe('GET /api/users', () => {
  it('returns user list', async () => {
    const request = new NextRequest('http://localhost:3000/api/users')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data)).toBe(true)
  })
})

describe('POST /api/users', () => {
  it('creates user and returns 201', async () => {
    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Alice', email: 'alice@test.com' }),
    })
    const response = await POST(request)

    expect(response.status).toBe(201)
  })

  it('returns 400 for invalid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    const response = await POST(request)

    expect(response.status).toBe(400)
  })
})
```

### 4. Testing Middleware

```ts
// __tests__/middleware.spec.ts
import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '../middleware'

it('redirects unauthenticated users to login', () => {
  const request = new NextRequest(new URL('/dashboard', 'http://localhost:3000'))
  // No auth cookie
  const response = middleware(request)

  expect(response.status).toBe(307)
  expect(response.headers.get('location')).toContain('/login')
})

it('allows authenticated users through', () => {
  const request = new NextRequest(new URL('/dashboard', 'http://localhost:3000'))
  request.cookies.set('token', 'valid-jwt-token')

  const response = middleware(request)

  expect(response).toBeInstanceOf(NextResponse)
  // Not redirected
  expect(response.headers.get('location')).toBeNull()
})
```

### 5. Testing with next/router and next/navigation

```tsx
import { useRouter } from 'next/navigation'

it('navigates to user page on click', async () => {
  const push = vi.fn()
  ;(useRouter as vi.Mock).mockReturnValue({ push })

  render(<UserLink userId={1} />)

  await userEvent.click(screen.getByRole('link'))

  expect(push).toHaveBeenCalledWith('/users/1')
})
```

### 6. Mocking Environment Variables

```ts
it('uses API URL from env', () => {
  process.env.NEXT_PUBLIC_API_URL = 'http://test-api:4000'

  const url = getApiUrl()
  expect(url).toBe('http://test-api:4000')

  delete process.env.NEXT_PUBLIC_API_URL
})
```

## Common Pitfalls

| Issue | Solution |
|---|---|
| `next/image` fails in tests | Mock it to return plain `<img>` |
| `next/link` fails in tests | Mock it to return plain `<a>` |
| Server components can't render | Test extracted logic/functions separately |
| `useSearchParams` fails | Mock `next/navigation` in setup file |
| CSS modules cause errors | Set `css: { modules: { classNameStrategy: 'non-scoped' } }` in vitest config |
| `fetch` not available in jsdom | Add `fetch` polyfill or mock `global.fetch` |
| App Router `cookies()` / `headers()` | Mock the function: `vi.mock('next/headers')` |
