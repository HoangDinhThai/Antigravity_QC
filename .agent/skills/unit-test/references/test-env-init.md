# Test Environment Initialization Reference

Step-by-step guide to bootstrap testing environment for each framework.
Run these steps when a project has no test infrastructure yet.

## Init Workflow

### Step 1: Detect Current State

Check what's already installed:

```bash
# Node.js projects
cat package.json | grep -E '"(vitest|jest|@testing-library|@vue/test-utils|@nuxt/test-utils|supertest|@nestjs/testing|happy-dom|jsdom)"'

# PHP projects
cat composer.json | grep -E '"(phpunit|pest)"'

# Check for existing config files
ls vitest.config.* jest.config.* phpunit.xml Pest.php 2>/dev/null
```

### Step 2: Install Packages & Create Config

Pick the matching section below based on framework.

---

## Laravel (PHPUnit)

**Already included** with Laravel. Just verify:

```bash
# Verify PHPUnit is installed
php artisan test --version

# If missing
composer require --dev phpunit/phpunit
```

**Create directory structure if missing:**
```bash
mkdir -p tests/Unit/Services tests/Unit/Models tests/Feature/Api tests/Feature/Auth
```

**Verify `phpunit.xml` exists** (Laravel creates this automatically). If missing, run:
```bash
php artisan vendor:publish --tag=phpunit
```

**Add scripts to `composer.json`** (Laravel adds these by default):
```json
{
  "scripts": {
    "test": "php artisan test",
    "test:coverage": "php artisan test --coverage"
  }
}
```

---

## Laravel (Pest)

```bash
composer require --dev pestphp/pest pestphp/pest-plugin-laravel
php artisan pest:install
```

This creates `Pest.php` config and `tests/Pest.php`.

**Verify `composer.json` scripts:**
```json
{
  "scripts": {
    "test": "pest",
    "test:coverage": "pest --coverage"
  }
}
```

**Directory structure:**
```bash
mkdir -p tests/Unit tests/Feature
```

---

## NestJS

NestJS includes Jest by default. Verify:

```bash
# Check if @nestjs/testing is in package.json
cat package.json | grep '"@nestjs/testing"'
```

**If missing:**
```bash
npm i --save-dev @nestjs/testing jest ts-jest @types/jest
```

**Create `jest.config.js` if missing:**
```js
/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': 'ts-jest' },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  rootDir: 'src',
  testMatch: ['**/__tests__/**/*.spec.ts'],
  collectCoverageFrom: ['**/*.(t|j)s', '!**/__tests__/**'],
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
}
```

**Create `test/jest-e2e.json` if missing:**
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }
}
```

**Add scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

**Directory structure:**
```bash
mkdir -p test
```

---

## Express.js

```bash
npm i --save-dev jest ts-jest @types/jest supertest @types/supertest
```

**Create `jest.config.js`:**
```js
/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.spec.ts', '!src/server.ts'],
  coverageDirectory: 'coverage',
}
```

**Add scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Directory structure:**
```bash
mkdir -p src/routes/__tests__ src/services/__tests__ src/middleware/__tests__
```

### Express with Vitest (alternative)

```bash
npm i --save-dev vitest supertest @types/supertest
```

**Create `vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.spec.ts'],
    },
  },
})
```

**Add scripts:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Vue 3 (Vitest)

```bash
npm i --save-dev vitest @vue/test-utils happy-dom @testing-library/vue
```

**Create `vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,vue}'],
      exclude: ['src/**/*.spec.*', 'src/**/*.d.ts'],
    },
  },
})
```

**Create `src/test/setup.ts` if needed:**
```ts
// Global test setup
// Add any global mocks or configurations here
```

**Add scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Directory structure:**
```bash
mkdir -p src/components/__tests__ src/composables/__tests__ src/stores/__tests__ src/utils/__tests__
```

### With Pinia

```bash
npm i --save-dev @pinia/testing
```

### With Vue Router

```bash
npm i --save-dev vue-router
```

---

## React (Vitest)

```bash
npm i --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

**Create `vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.spec.*', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
```

**Create `vitest.setup.ts`:**
```ts
import '@testing-library/jest-dom/vitest'
```

**Add scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Directory structure:**
```bash
mkdir -p src/components/__tests__ src/hooks/__tests__ src/pages/__tests__ src/test
```

### With MSW (API mocking)

```bash
npm i --save-dev msw
npx msw init public/ --save  # For browser
```

---

## Next.js (Vitest)

```bash
npm i --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @types/node
```

**Create `vitest.config.ts`:**
```ts
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

**Create `vitest.setup.ts`:**
```ts
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
  default: (props: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))
```

**Add scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Directory structure:**
```bash
mkdir -p src/app/__tests__ src/components/__tests__ src/lib/__tests__
```

---

## Nuxt.js (Vitest)

```bash
npm i --save-dev vitest @nuxt/test-utils @vue/test-utils happy-dom
```

**Create `vitest.config.ts`:**
```ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['app/**/*.{ts,vue}', 'server/**/*.ts'],
      exclude: ['**/*.spec.*', '**/*.d.ts'],
    },
  },
})
```

> **IMPORTANT:** Use `defineVitestConfig` from `@nuxt/test-utils/config`, NOT regular `defineConfig` from vitest.
> This enables Nuxt auto-imports, components, composables in tests.

**Add scripts to `package.json`:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

**Directory structure:**
```bash
mkdir -p app/components/__tests__ app/composables/__tests__
mkdir -p server/api/__tests__ server/services/__tests__ server/schemas/__tests__
```

### With Pinia (auto-imported in Nuxt)

```bash
npm i --save-dev @pinia/testing
```

---

## Fullstack Projects (Frontend + Backend)

Many projects have both frontend and backend in one repo. Handle each separately:

```
project/
├── client/    ← React/Vue/Nuxt/Next → use frontend init
├── server/    ← NestJS/Express → use backend init
└── package.json  ← May need root-level test script
```

**Root `package.json` scripts:**
```json
{
  "scripts": {
    "test": "npm run test:server && npm run test:client",
    "test:server": "cd server && npm test",
    "test:client": "cd client && npm test"
  }
}
```

For monorepo (Nuxt fullstack like piranet-web-v2), frontend and server share one `package.json` — install all test deps together:

```bash
# Combined for Nuxt fullstack
npm i --save-dev vitest @nuxt/test-utils @vue/test-utils happy-dom @pinia/testing
```

---

## Verification Checklist

After init, verify everything works:

```bash
# 1. Config file exists
ls vitest.config.ts  # or jest.config.js, phpunit.xml

# 2. Test runner executes without errors (empty suite)
npm test 2>&1 | head -5
# Should show "No test files found" or similar — NOT module errors

# 3. Test scripts in package.json
cat package.json | grep -A5 '"scripts"' | grep test

# 4. Create a smoke test to verify setup
# See "Smoke Test" section below
```

### Smoke Test Template

**Node.js (vitest):**
```ts
// src/__tests__/smoke.spec.ts
import { describe, it, expect } from 'vitest'

describe('Test Infrastructure', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })
})
```

**Node.js (jest):**
```ts
// src/__tests__/smoke.spec.ts
describe('Test Infrastructure', () => {
  it('runs a basic assertion', () => {
    expect(1 + 1).toBe(2)
  })
})
```

**PHP (PHPUnit):**
```php
// tests/Unit/SmokeTest.php
class SmokeTest extends TestCase
{
    public function test_basic_assertion(): void
    {
        $this->assertEquals(2, 1 + 1);
    }
}
```

**PHP (Pest):**
```php
// tests/Unit/SmokeTest.php
it('runs a basic assertion', function () {
    expect(1 + 1)->toBe(2);
});
```

Run smoke test → if passes, init is complete.

> **Cleanup:** After verifying the setup, **delete the smoke test file** or fold its assertion into the first real test. Don't leave a permanent `1+1=2` test in the suite.
