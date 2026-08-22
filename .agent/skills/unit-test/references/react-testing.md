# React Testing Reference

> ⚠️ **Pattern catalog** — pick the 1-3 patterns that match your target. Do NOT reproduce every pattern below for a single file. Respect the [DO NOT TEST](../SKILL.md#do-not-test) list and propose a Test Plan before writing.

## Stack

- **React 18/19** + TypeScript
- **Vitest** (recommended for Vite projects) or **Jest** ( CRA/Next.js)
- **React Testing Library (RTL)** — primary testing utility
- **user-event** — realistic user interaction simulation
- **jsdom** or **happy-dom** for DOM environment

## Setup

```bash
# Vitest setup
npm i --save-dev vitest @testing-library/react @testing-library/user-event jsdom
npm i --save-dev @testing-library/jest-dom  # Custom matchers
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.spec.*', 'src/**/*.d.ts', 'src/test/**'],
    },
  },
})
```

```ts
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
```

## Directory Structure

```
src/
├── components/
│   ├── UserCard.tsx
│   └── __tests__/
│       └── UserCard.spec.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.spec.ts
├── pages/
│   └── __tests__/
│       └── Dashboard.spec.tsx
└── test/
    ├── setup.ts
    └── render-with-providers.tsx  # Custom render wrapper
```

## Key Patterns

### 1. Component Testing (RTL — Recommended)

```tsx
// components/__tests__/UserCard.spec.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UserCard } from '../UserCard'

describe('UserCard', () => {
  const mockUser = { id: 1, name: 'Alice', email: 'alice@test.com', role: 'user' }

  it('renders user info', () => {
    // Source: src/components/UserCard.tsx:3 — <UserCard> render
    // Behavior: displays user.name and user.email
    render(<UserCard user={mockUser} />)

    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', async () => {
    // Source: src/components/UserCard.tsx:12 — onEdit callback
    // Behavior: invokes onEdit prop with the user when edit clicked
    const onEdit = vi.fn()
    render(<UserCard user={mockUser} onEdit={onEdit} />)

    await userEvent.click(screen.getByRole('button', { name: /edit/i }))

    expect(onEdit).toHaveBeenCalledWith(mockUser)
  })

  it('shows admin badge for admin role', () => {
    // Source: src/components/UserCard.tsx:18 — admin badge conditional
    // Behavior: renders 'Admin' badge only when role === 'admin'
    render(<UserCard user={{ ...mockUser, role: 'admin' }} />)

    expect(screen.getByText('Admin')).toBeInTheDocument()
  })

  it('hides admin badge for regular user', () => {
    render(<UserCard user={mockUser} />)

    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
  })
})
```

### 2. Testing Forms

```tsx
it('submits form with valid data', async () => {
  const onSubmit = vi.fn()
  render(<LoginForm onSubmit={onSubmit} />)

  const user = userEvent.setup()

  await user.type(screen.getByLabelText(/email/i), 'alice@test.com')
  await user.type(screen.getByLabelText(/password/i), 'secret123')
  await user.click(screen.getByRole('button', { name: /sign in/i }))

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'alice@test.com',
    password: 'secret123',
  })
})

it('shows validation errors for empty fields', async () => {
  render(<LoginForm onSubmit={vi.fn()} />)

  await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

  expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  expect(screen.getByText(/password is required/i)).toBeInTheDocument()
})
```

### 3. Testing Async Components (Data Fetching)

```tsx
import { render, screen, waitFor } from '@testing-library/react'

it('shows loading then user data', async () => {
  render(<UserProfile userId={1} />)

  // Loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument()

  // Wait for data
  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
})

it('shows error on fetch failure', async () => {
  // Mock fetch to fail
  vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'))

  render(<UserProfile userId={1} />)

  await waitFor(() => {
    expect(screen.getByText(/network error/i)).toBeInTheDocument()
  })
})
```

### 4. Testing Custom Hooks

```tsx
// hooks/__tests__/useAuth.spec.ts
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '../useAuth'

it('starts with null user', () => {
  const { result } = renderHook(() => useAuth())

  expect(result.current.user).toBeNull()
  expect(result.current.isLoggedIn).toBe(false)
})

it('login sets user', async () => {
  const { result } = renderHook(() => useAuth())

  await act(async () => {
    result.current.login('alice@test.com', 'password')
  })

  expect(result.current.isLoggedIn).toBe(true)
  expect(result.current.user?.email).toBe('alice@test.com')
})

it('logout clears user', async () => {
  const { result } = renderHook(() => useAuth())

  await act(async () => {
    result.current.login('alice@test.com', 'password')
  })

  act(() => {
    result.current.logout()
  })

  expect(result.current.user).toBeNull()
})
```

### 5. Testing with Context Providers

```tsx
// test/render-with-providers.tsx
import { render } from '@testing-library/react'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'

export function renderWithProviders(ui: React.ReactElement, options = {}) {
  const { theme = 'light', user = null, ...renderOptions } = options

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider initialTheme={theme}>
        <AuthProvider initialUser={user}>
          {children}
        </AuthProvider>
      </ThemeProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Usage
it('renders in dark mode', () => {
  renderWithProviders(<Dashboard />, { theme: 'dark' })
  expect(screen.getByTestId('dashboard')).toHaveClass('dark')
})
```

### 6. API Mocking with MSW

```tsx
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('/api/users/1', () => {
    return HttpResponse.json({ id: 1, name: 'Alice' })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('fetches and displays user', async () => {
  render(<UserProfile userId={1} />)

  await waitFor(() => {
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})

it('handles server error', async () => {
  server.use(
    http.get('/api/users/1', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )

  render(<UserProfile userId={1} />)

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

## Common Pitfalls

| Issue | Solution |
|---|---|
| `toBeInTheDocument` not found | Import `@testing-library/jest-dom/vitest` in setup |
| State not updating after click | Use `await userEvent.click()` (not `fireEvent`) |
| `act()` warnings | Wrap state updates in `act()` or use `waitFor()` |
| Queries find wrong element | Use specific queries: `getByRole`, `getByLabelText` over `getByText` |
| Context not available | Create `renderWithProviders` wrapper |
| Timer-dependent tests | Use `vi.useFakeTimers()` + `vi.advanceTimersByTime()` |
