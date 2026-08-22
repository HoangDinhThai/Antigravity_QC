---
name: pi:unit-test
description: "Multi-framework unit testing with phased commands. Bootstraps test environment, writes tests, runs suites with coverage. Supports PHP/Laravel (PHPUnit/Pest), Node.js (Nuxt, Next, Nest, Express), Vue 3, React."
user-invocable: true
when_to_use: "Invoke to write unit tests, bootstrap test env, run test suites, or check coverage."
category: testing
keywords: [unit-test, testing, vitest, jest, phpunit, pest, coverage, TDD, mock]
argument-hint: "[init|run|coverage|<file-path>|<description>]"
---

# `/pi:unit-test` — Phased Multi-Framework Testing

Command-based testing skill. Route to correct phase based on args.

## Command Routing

```
/pi:unit-test init           → Phase 1: Init test environment
/pi:unit-test <file-path>    → Phase 2: Write tests for specific file
/pi:unit-test <description>  → Phase 2: Write tests by feature description
/pi:unit-test run            → Phase 3: Run tests + report results
/pi:unit-test run <path>     → Phase 3: Run single test file
/pi:unit-test coverage       → Phase 3: Run with coverage report
```

**No args?** → Ask user: "Init environment or write tests? Provide file path or description."

## Phase 1: Init (`init`)

Bootstrap test environment. Load [test-env-init.md](references/test-env-init.md) for details.

### 1.1 Detect Runtime

```bash
# Check Docker
docker compose ps 2>/dev/null && echo "DOCKER" || echo "LOCAL"
```

| Indicator | Runtime | Commands via |
|---|---|---|
| `docker-compose.yml` + containers running | Docker | `docker compose exec <service> <cmd>` |
| `.devcontainer/` exists | Dev Container | Direct (already inside) |
| None of above | Local | Direct on host |

> Docker details: [docker-testing.md](references/docker-testing.md)

### 1.2 Detect Framework

| File exists | Framework | Test runner | Reference |
|---|---|---|---|
| `artisan`, `composer.json` + `laravel` | Laravel | PHPUnit / Pest | [laravel-testing.md](references/laravel-testing.md) |
| `nest-cli.json` | NestJS | Jest | [nestjs-testing.md](references/nestjs-testing.md) |
| `package.json` + express dep | Express | Jest/Vitest + Supertest | [express-testing.md](references/express-testing.md) |
| `nuxt.config.ts` | Nuxt.js | Vitest + @nuxt/test-utils | [nuxtjs-testing.md](references/nuxtjs-testing.md) |
| `next.config.*` | Next.js | Vitest + RTL | [nextjs-testing.md](references/nextjs-testing.md) |
| `package.json` + vue dep | Vue 3 | Vitest + @vue/test-utils | [vue3-testing.md](references/vue3-testing.md) |
| `package.json` + react dep | React | Vitest/Jest + RTL | [react-testing.md](references/react-testing.md) |

**Mixed stack?** Detect all, init each separately.

### 1.3 Install & Configure

1. Check existing test deps in `package.json`/`composer.json`
2. If missing → install packages (see table in [test-env-init.md](references/test-env-init.md))
3. Create config file (`vitest.config.ts`, `jest.config.js`, `phpunit.xml`)
4. Create directory structure (`__tests__/`, `tests/Unit/`, etc.)
5. Add scripts to `package.json`/`composer.json`: `test`, `test:watch`, `test:coverage`

### 1.4 Smoke Test

Create minimal test, run it, confirm pass:
```ts
// smoke.spec.ts
it('verifies test infrastructure', () => { expect(1 + 1).toBe(2) })
```

> **Cleanup:** Smoke test only verifies the setup. After init succeeds → **delete the smoke file** (or fold it into the first real test). Do not leave it behind as a permanent `1+1=2` test.

**Report:** ✅ Init complete — [framework] with [test-runner] ready. Or ❌ Issues found + how to fix.

---

## Phase 2: Write Tests (`<path>` or `<description>`)

Write tests for a specific target. **MUST propose scope and WAIT for user confirm before writing** — see [testing-guardrails.md](references/testing-guardrails.md) Rule 6 & 7 for anti-bloat rationale.

### 2.1 Analyze Target & Filter

1. Read the source file (or understand the description)
2. Identify: exports, dependencies, side effects, error paths, edge cases
3. Determine test level: unit | integration | component
4. **Filter OUT code not worth testing** (apply [DO NOT TEST](#do-not-test) list below) — this is what prevents test bloat

### <a id="do-not-test"></a> DO NOT TEST (writing tests here only wastes time)

Skip these — they cannot reveal bugs and bloat the suite:

| Skip | Why |
|---|---|
| Getter/setter/property with no logic | Trivially passes, catches nothing |
| Pure types, interfaces, enum constants | No runtime behavior |
| Constructor that only assigns fields | No logic to verify |
| Pass-through wrappers (no transform) | Delegates to another unit already tested |
| Framework boilerplate: NestJS decorator registration, Express route wiring, Laravel route/model binding | Framework's job, not yours |
| Third-party library functions | Test your boundary usage, not their internals |
| Config files (`vitest.config.ts`, `phpunit.xml`) | Validated by framework at load |
| Dumb/presentational component that only renders props | Assert via parent or snapshot at most |

When unsure → include in test plan as `SKIP` and explain, let user override.

### 2.2 Apply Guardrails (MANDATORY)

Load [testing-guardrails.md](references/testing-guardrails.md) for detailed examples.

**8 hard rules:**

1. **NEVER modify source code** when tests fail → report to user, don't fix
2. **NEVER mock business logic under test** → mock only external boundaries (DB, API, filesystem, email, SDKs)
3. **NEVER hardcode mock returns to match assertions** → use realistic data / factories
4. **NEVER write trivially passing tests** → every test must be able to fail
5. **When in doubt → ask user** → don't silently choose between fixing test vs source
6. **RIGHT-SIZE the suite** → 1 test = 1 meaningful behavior; if deleting a test reveals nothing, don't write it (see [testing-guardrails.md](references/testing-guardrails.md) Rule 6)
7. **Coverage is a signal, NOT a target** → never write a test just to bump % (see [testing-guardrails.md](references/testing-guardrails.md) Rule 7)
8. **REFERENCE every test to its source** → each test gets a header with `Source: file:line`, `Target`, `Behavior`; line must be read from the real file, never guessed (see [testing-guardrails.md](references/testing-guardrails.md) Rule 8)

### 2.3 Propose Test Plan → WAIT for Confirm (MANDATORY)

**Do NOT write test code yet.** Produce a one-line-per-case plan and stop. Format:

```
## Test Plan: <file>  (N case dự kiến)

| # | Test case (1 dòng)              | Priority | Source (file:line)                  | Lý do                    |
|---|---------------------------------|----------|-------------------------------------|--------------------------|
| 1 | tính tổng có thuế               | MUST     | app/Services/PriceCalculator.php:24 | happy path, output chính |
| 2 | ném lỗi khi giá âm              | SHOULD   | app/Services/PriceCalculator.php:31 | error path có business   |
| 3 | quantity = 0 → bỏ qua item      | SHOULD   | app/Services/PriceCalculator.php:42 | branch có ý nghĩa        |
| 4 | format output BigInt → String   | SKIP     | —                                   | framework helper, không đáng |

Bỏ qua (DO NOT TEST): getter getName(), constructor, PriceCalculator types.
→ Reply "ok" / sửa / "thêm X" / "bớt Y". Mặc định chỉ viết MUST + SHOULD.
```

> **Source column is mandatory** for MUST/SHOULD rows. Read the real source file and use the **actual line number** where the function/component lives. For SKIP/DO NOT TEST rows, use `—`. This column seeds the reference headers written in §2.4.

**Priority levels (drives scope discipline):**

| Level | Meaning | Default |
|---|---|---|
| **MUST** | Happy path — verifies the main output/behavior | Always write |
| **SHOULD** | Error path or branch with business meaning (validation, not-found, auth) | Write unless user trims |
| **SKIP** | Parametrized variants of no business value, pixel UI, DO NOT TEST items | Do NOT write unless user asks |

> **Wait for user response.** Only after confirm, proceed to 2.4. If user says "ok" or silent-accepts default → write MUST + SHOULD only.

### 2.4 Write Tests (AAA Pattern — after confirm)

**MANDATORY: every test gets a Reference Header** linking it to the source it verifies. Format per language:

```ts
// JavaScript / TypeScript (Vitest, Jest)
/**
 * Source: src/services/user.service.ts:42
 * Target: UserService.findAll()
 * Behavior: maps DB rows → DTOs, strips password_hash
 */
it('maps entities to DTOs', async () => {
  // Arrange — set up inputs and dependencies
  // Act — execute the function/component under test
  // Assert — verify the outcome
})
```

```php
// PHP (PHPUnit / Pest)
/**
 * Source: app/Services/PriceCalculator.php:24
 * Target: PriceCalculator::calculate()
 * Behavior: applies tax rate to item subtotal
 */
it('calculates total with tax', function () {
    // Arrange / Act / Assert
});
```

**Header rules:**
- `Source` — `file:line` of the function/component under test. **Read the real file** and use the actual line (see Rule 8).
- `Target` — fully-qualified symbol: `ClassName.method()` for methods, `ComponentName` for components, `functionName()` for plain functions.
- `Behavior` — one line describing the behavior this specific test verifies.
- One header per `it()`/`test()` — NOT per `describe()`. Tests sharing the same target still each get their own header (they verify different behaviors).
- For parametrized tests (`it.each` / `->with()`), one header above the parametrized block is enough.

### 2.5 Target Resolution

**File path given (Node.js — `__tests__/` subfolder convention):**
- `server/services/user.service.ts` → test at `server/services/__tests__/user.service.spec.ts`
- `app/components/UserCard.vue` → test at `app/components/__tests__/UserCard.spec.ts`
- `src/user/user.service.ts` → test at `src/user/__tests__/user.service.spec.ts`
- All Node.js frameworks (Nuxt, Next, Nest, Express, Vue, React) use `__tests__/` subfolder.
- PHP (Laravel) uses centralized `tests/Unit/` and `tests/Feature/` — see `laravel-testing.md`.

**Description given:**
- Parse description to identify what to test
- Find relevant source files via `glob` / `grep`
- Write tests for all related files

---

## Phase 3: Run & Report (`run` / `coverage`)

Execute tests, capture output, report results.

> **Mindset:** Coverage is a *signal*, never a target. See [testing-guardrails.md](references/testing-guardrails.md) Rule 7.

### 3.1 Run Command

| Stack | Local | Docker |
|---|---|---|
| Laravel | `php artisan test` | `docker compose exec app php artisan test` |
| NestJS | `npm test` | `docker compose exec app npm test` |
| Express | `npm test` | `docker compose exec app npm test` |
| Vue/Nuxt | `npm run test` | `docker compose exec app npm run test` |
| React/Next | `npm test` | `docker compose exec app npm test` |

Single file: append `-- <file-path>` or `--filter=<name>`.

### 3.2 Capture & Analyze Output

```bash
# Capture full output
docker compose exec app npm test 2>&1 | tee test-output.log
```

Parse for:
- ❌ Failed tests → extract name + error message
- ✅ Passed count
- Coverage % if `--coverage`

### 3.3 Handle Failures

When tests fail → **follow guardrails protocol:**

```
□ Read error message — what exactly failed?
□ Test assertion correct? (matches intended behavior?)
□ Test data realistic? (not 'aaa', 0, null)
□ Mock returns realistic data? (not hardcoded to match assertion)
□ Source genuinely buggy, or test wrong?
□ Source bug → REPORT to user with options, do NOT fix
□ Test bug → FIX test, explain what changed and why
```

### 3.4 Report Format

```
## Test Results

| Status | Tests | Passed | Failed |
|--------|-------|--------|--------|
| ✅/❌  | 15    | 14     | 1      |

### Failed Tests
- `user.service.spec.ts > "calculates tax"` — Expected 275, got 250
  Root cause: PriceCalculator doesn't apply tax. Source bug or test bug?

### Coverage (if requested — reference only, NOT a target)
- Statements: 85% | Branches: 78% | Functions: 90% | Lines: 84%
- Low coverage on `[file]` — check if it's worth testing; do NOT write tests just to bump it (see Rule 7).
```

---

## References (Load as Needed)

| Reference | When to Load |
|---|---|
| [test-env-init.md](references/test-env-init.md) | Phase 1 — install, config, directory structure |
| [docker-testing.md](references/docker-testing.md) | Any phase — Docker commands, log capture |
| [testing-guardrails.md](references/testing-guardrails.md) | Phase 2 — anti-patterns, mock boundaries, failure protocol |
| [laravel-testing.md](references/laravel-testing.md) | Phase 2 — Laravel patterns (PHPUnit/Pest) |
| [nestjs-testing.md](references/nestjs-testing.md) | Phase 2 — NestJS patterns (TestingModule) |
| [express-testing.md](references/express-testing.md) | Phase 2 — Express patterns (Supertest) |
| [vue3-testing.md](references/vue3-testing.md) | Phase 2 — Vue 3 patterns (@vue/test-utils) |
| [react-testing.md](references/react-testing.md) | Phase 2 — React patterns (RTL) |
| [nextjs-testing.md](references/nextjs-testing.md) | Phase 2 — Next.js patterns |
| [nuxtjs-testing.md](references/nuxtjs-testing.md) | Phase 2 — Nuxt.js patterns |
