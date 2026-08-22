# Testing Guardrails — Detailed Examples

> This reference contains detailed anti-pattern examples for the rules defined in SKILL.md → "Apply Guardrails".
> Load this file for concrete DO/DON'T code examples. Rules 6 & 7 are the primary defense against test bloat.

## Rule 1: NEVER Modify Source Code When Tests Fail

### When test fails, follow this protocol:

```
□ Read the error message carefully — what exactly failed?
□ Is the test assertion correct? (Does it match intended behavior?)
□ Is the test data realistic? (Not 'aaa', 0, null when real data is different)
□ Is the mock returning realistic data? (Not hardcoded to match assertion)
□ Is the source code genuinely wrong, or is the test wrong?
□ If source is wrong → REPORT to user, don't fix
□ If test is wrong → FIX the test, explain what changed and why
```

### Example: Correct failure report

```
❌ Test failed: user.service.spec.ts > "calculates total with tax"
Expected: 275
Received: 250

Root cause: PriceCalculator.calculate() does not apply tax rate.
This looks like a bug in the source code.

Options:
a) Fix source code: add tax calculation in PriceCalculator.calculate()
b) Adjust test: if tax is intentionally excluded, update expected value

How would you like to proceed?
```

### Why this matters

Tests exist to catch bugs. If you silently fix the source code every time a test fails:
- The test never actually caught anything useful
- Real bugs get hidden because the "fix" might not be correct
- User loses trust in the test suite
- The test becomes a self-fulfilling prophecy, not a safety net

---

## Rule 2: NEVER Over-Mock to Make Tests Pass

### Mocking boundaries (strict)

| Layer | Mock? | Examples |
|---|---|---|
| External APIs / HTTP calls | ✅ Mock | `vi.mock('$fetch')`, `vi.mock('axios')`, MSW handlers |
| Database | ✅ Mock or test DB | `vi.mock('prisma')`, or `RefreshDatabase` with test DB |
| File system | ✅ Mock | `vi.mock('fs')`, Laravel `Storage::fake()` |
| Email / Notifications | ✅ Mock | Laravel `Mail::fake()`, `Notification::fake()` |
| Third-party SDKs | ✅ Mock | `vi.mock('stripe')`, `vi.mock('aws-sdk')` |
| Date/Time | ✅ Mock | `vi.useFakeTimers()`, `Carbon::setTestNow()` |
| **Business logic functions** | ❌ **NEVER** | Don't mock the function you're testing |
| **Validation logic** | ❌ **NEVER** | Don't mock `validate()` — test the real validation |
| **Data transformation** | ❌ **NEVER** | Don't mock mappers, formatters, calculators |
| **Internal service methods** | ❌ **NEVER** | Don't mock `UserService.create()` when testing `UserService.create()` |

### Anti-pattern: Over-mocking

```ts
// ❌ BAD: Mocking the logic under test
vi.mock('../price-calculator')
it('calculates total', () => {
  const result = calculatePrice(items)  // This calls a mock — tests nothing!
  expect(result).toBe(275)              // Of course it "passes" — we told it to
})

// ❌ BAD: Hardcoding mock to match assertion
vi.mock('../user.service')
;(UserService.create as vi.Mock).mockResolvedValue({ id: 1, name: 'Alice' })
it('creates user', () => {
  const result = await createAndFetch({ name: 'Alice' })
  expect(result.name).toBe('Alice')  // Trivially passes — mock returns exactly what we assert
})

// ❌ BAD: Mocking validation to always return true
vi.mock('../validate')
;(validate as vi.Mock).mockReturnValue(true)
it('validates input', () => {
  expect(validate(badInput)).toBe(true)  // Tests nothing — validation is bypassed
})

// ❌ BAD: Mocking internal helper instead of testing it
vi.mock('../helpers/formatDate')
;(formatDate as vi.Mock).mockReturnValue('2024-01-15')
it('formats and displays date', () => {
  expect(displayDate(new Date('2024-01-15'))).toBe('2024-01-15')
  // formatDate is the logic under test — but it's mocked! Tests nothing.
})

// ❌ BAD: Spying on and overriding the method under test
const spy = vi.spyOn(service, 'calculate').mockReturnValue(100)
it('returns calculated value', () => {
  expect(service.calculate(input)).toBe(100)  // Always passes — we set the return value
})
```

### Correct approach: Mock only boundaries

```ts
// ✅ GOOD: Mock DB (external boundary), test real business logic
vi.mock('#server/utils/prisma')
;(prisma.user.create as vi.Mock).mockResolvedValue({ id: 1, name: 'Alice' })

it('hashes password before saving', async () => {
  await UserService.create({ name: 'Alice', password: 'plaintext' })

  const savedData = (prisma.user.create as vi.Mock).mock.calls[0][0]
  expect(savedData.password).not.toBe('plaintext')  // Tests REAL hashing logic
  expect(savedData.name).toBe('Alice')
})

// ✅ GOOD: Mock external API, test real transformation
vi.mock('~/lib/api')
;(fetchUsers as vi.Mock).mockResolvedValue([
  { id: 1, first_name: 'Alice', last_name: 'Smith' }
])

it('maps API response to display format', () => {
  const result = await getUserList()
  expect(result[0].fullName).toBe('Alice Smith')  // Tests REAL mapping logic
})

// ✅ GOOD: Use test DB for integration test (no mocks at all)
it('persists user to database', async () => {
  const user = await UserService.create({ name: 'Alice' })

  const found = await prisma.user.findUnique({ where: { id: user.id } })
  expect(found.name).toBe('Alice')  // Tests REAL DB interaction
})
```

---

## Rule 3: Test Real Behavior, Not Implementation Details

```ts
// ❌ BAD: Testing that a specific function was called (fragile to refactoring)
it('sends email', () => {
  welcomeUser(user)
  expect(mailer.send).toHaveBeenCalledWith('welcome-template', user.email)
})

// ✅ GOOD: Testing observable outcome
it('user receives welcome email', async () => {
  await welcomeUser(user)
  const sent = mailer.send.mock.calls[0]
  expect(sent[0]).toBe(user.email)
  expect(sent[1]).toMatch(/welcome/i)
})

// ❌ BAD: Testing component internal state
it('sets loading to true', async () => {
  const wrapper = mount(UserList)
  expect(wrapper.vm.isLoading).toBe(true)  // Tests implementation detail
})

// ✅ GOOD: Testing what user sees
it('shows loading indicator', async () => {
  const wrapper = mount(UserList)
  expect(wrapper.find('[data-test="loading"]').exists()).toBe(true)
})
```

---

## Rule 4: Use Realistic Test Data

```ts
// ❌ BAD: Fake data that doesn't resemble real usage
it('validates user', () => {
  expect(validate({ name: 'a', email: 'b' })).toBe(true)
  // Would this input even pass in production? Probably not.
})

// ✅ GOOD: Realistic data matching real-world usage
it('validates user', () => {
  expect(validate({
    name: 'Nguyen Van A',
    email: 'nguyenvana@example.com',
    phone: '+84901234567',
  })).toBe(true)
})

// ✅ GOOD: Use factories for consistent realistic data
const userData = UserFactory.make()
// Generates: { name: 'John Smith', email: 'john.smith@example.com', ... }
```

### Factory patterns for realistic data

```ts
// JavaScript/TypeScript
function createMockUser(overrides = {}) {
  return {
    id: faker.number.int({ min: 1, max: 9999 }),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    role: 'user',
    createdAt: faker.date.recent(),
    ...overrides,  // Allow tests to override specific fields
  }
}

// PHP (Laravel Factory)
class UserFactory extends Factory {
  public function definition(): array {
    return [
      'name' => fake()->name(),
      'email' => fake()->unique()->safeEmail(),
      'phone' => fake()->numerify('+84#########'),
      'role' => 'user',
    ];
  }
}
```

---

## Rule 5: Don't Write Trivially Passing Tests

```ts
// ❌ BAD: Test that can never fail
it('returns true', () => {
  const result = true
  expect(result).toBe(true)
})

// ❌ BAD: Catching and swallowing errors
it('handles errors', () => {
  try { riskyOperation() } catch {}
  // No assertion — test always passes
})

// ❌ BAD: Asserting mock setup instead of behavior
it('calls the API', () => {
  vi.mock('axios')
  fetchData()
  expect(axios.get).toHaveBeenCalled()
  // So what? Did we get the right data? Did errors get handled?
})

// ✅ GOOD: Assert specific, meaningful behavior
it('throws ValidationError for invalid input', () => {
  expect(() => processInput({ age: -1 }))
    .toThrow(ValidationError)
})

// ✅ GOOD: Assert complete outcome
it('fetches and transforms user data', async () => {
  vi.mock('axios')
  ;(axios.get as vi.Mock).mockResolvedValue({
    data: { first_name: 'Alice', last_name: 'Smith' }
  })

  const result = await fetchAndTransformUser(1)

  expect(result).toEqual({ fullName: 'Alice Smith' })
})
```

---

## Rule 6: Right-Size the Test Suite (anti-bloat)

**Core principle:** 1 test = 1 meaningful behavior that can FAIL if the code is wrong.

Before writing a test, ask: **"If I delete this test, what bug would go unnoticed?"**
- If the answer is "nothing" → don't write it.
- If the answer is "a refactor might break it" but no real behavior is at risk → it's testing implementation details, delete it.

Coverage is a *poor* guide for what to test. Measure value by "bugs this test would catch", not by lines covered.

### Anti-patterns by stack (real bloat examples)

**PHP / Laravel — testing a getter:**
```php
// ❌ BAD: pure getter, catches nothing
public function test_get_name_returns_name(): void
{
    $user = new User(['name' => 'Alice']);
    $this->assertEquals('Alice', $user->name);  // PHP does this for free
}

// ✅ Skip entirely. Test behavior that uses name (e.g. slug generation, display).
```

**NestJS — testing a controller that only delegates:**
```ts
// ❌ BAD: controller just calls service and returns — 0 logic added
it('findAll returns service result', async () => {
  service.findAll.mockResolvedValue([])
  expect(await controller.findAll()).toEqual([])  // Tests the mock, not behavior
})
// ✅ Skip unless controller transforms/validates/has guards that matter.
//    Cover this path via e2e (Supertest) instead.
```

**Express — testing route wiring:**
```ts
// ❌ BAD: asserting app.use('/users', router) — framework's job
// ✅ Test the handler logic / middleware behavior, not registration.
```

**Vue 3 / React — testing a dumb presentational component:**
```ts
// ❌ BAD: asserting every prop renders verbatim
it('renders name', () => expect(text).toContain('Alice'))
it('renders email', () => expect(text).toContain('a@b.c'))
it('renders phone', () => expect(text).toContain('123'))
// 3 tests that catch only a typo. ✅ 1 test or snapshot, focus on interaction.
```

### Parametrized tests: only for variations with business meaning

```ts
// ❌ BAD: parametrized over values that don't change behavior
it.each([1, 2, 3, 4, 5])('works for id %i', (id) => { ... })

// ✅ GOOD: parametrized over equivalence classes (valid / invalid / boundary)
it.each([
  ['user@example.com', true],
  ['no-at-sign', false],
  ['', false],
])('validates email %s as %s', (email, valid) => { ... })
```

---

## Rule 7: Coverage Is a Signal, Not a Target

| Mindset | |
|---|---|
| ❌ Wrong | "Coverage is 78%, I need to write tests to reach 100%." |
| ✅ Right | "Coverage shows line 42 of `price.ts` is untested — is there real behavior there worth covering?" |

### Hard rules

1. **Never write a test just to raise coverage %** — especially for [DO NOT TEST](../SKILL.md#do-not-test) items.
2. **100% coverage is an anti-pattern** — it usually means trivially-passing tests on boilerplate.
3. **~80% line / ~70% branch is a healthy target** for most apps; critical paths deserve more.
4. **Use coverage to find untested suspicious code**, not to enforce blanket coverage.
5. **CI gates, if any**: set realistic thresholds (70-80%) on meaningful paths only — exclude config, types, migrations, generated code.

### Using coverage correctly

```bash
# Run coverage, then READ the report — look for:
# 1. Untested branches in business logic (validation, error handling)
# 2. Untested public functions with real behavior
# Ignore:
# 1. Getters, type files, config, generated code
# 2. 100% on trivial modules — meaningless
```

---

## Rule 8: Reference Every Test to Its Source

**Core principle:** Every test must carry a header pointing to the exact source it verifies — so a reader can jump from a failing test to the responsible code in seconds.

### Mandatory header format

```ts
// JavaScript / TypeScript (Vitest, Jest)
/**
 * Source: src/services/user.service.ts:42
 * Target: UserService.findAll()
 * Behavior: maps DB rows → DTOs, strips password_hash
 */
it('maps entities to DTOs', async () => { /* ... */ })
```

```php
// PHP (PHPUnit / Pest)
/**
 * Source: app/Services/PriceCalculator.php:24
 * Target: PriceCalculator::calculate()
 * Behavior: applies tax rate to item subtotal
 */
it('calculates total with tax', function () { /* ... */ });
```

### Hard rules

1. **`Source` = real `file:line`.** Read the file and use the line where the function/component/class is **declared** (not called). Never guess or copy from another test.
2. **One header per `it()`/`test()`**, not per `describe()`. Two tests on the same target still get separate headers — they verify different behaviors.
3. **`Target` = fully-qualified symbol.** `ClassName.method()`, `ComponentName`, or `functionName()`. Include the class so the symbol is grep-able.
4. **`Behavior` = one line** stating what THIS test verifies (not what the function does in general).
5. **Line drift is acceptable** — when source changes, the header may go stale. That's fine; the file + symbol still resolve. Do NOT omit the header just because lines might drift.
6. **Parametrized tests** (`it.each`, `->with()`): one header above the block is enough — all cases share the same source location.

### Why this matters

| Without header | With header |
|---|---|
| Test fails → grep the test name → guess which function → read test → find source | Test fails → read header → `Ctrl+P file:line` → at the source in 2 seconds |
| Reviewer can't tell if a test is redundant | Reviewer sees `Target` column, spots duplicates instantly |
| "What does this test cover?" → open the test, read it | Answer is in the `Behavior` line, no reading needed |

### Anti-patterns

```ts
// ❌ BAD: no header — reader has to reverse-engineer the target
it('works correctly', () => { /* ... */ })

// ❌ BAD: header at describe level — tests inside cover different targets
describe('UserService', () => {
  // no per-test headers
  it('findAll maps', ...)
  it('create hashes', ...)  // different target! header at describe is misleading
})

// ❌ BAD: guessed/vague line
/**
 * Source: src/services/user.service.ts  ← no line number
 * Target: user stuff                     ← not a real symbol
 */

// ✅ GOOD
/**
 * Source: src/services/user.service.ts:42
 * Target: UserService.findAll()
 * Behavior: maps DB rows → DTOs, strips password_hash
 */
it('maps entities to DTOs', async () => { /* ... */ })
```

### Keep headers accurate over time

- When you **edit source** near a tested function → no action needed (line drift is tolerated).
- When you **add a new test** → read the file fresh, use current line.
- When you **move/rename a function** → update `Source` + `Target` in affected tests in the same commit.
- When the line number in a header is clearly wrong by 50+ lines → refresh it.

---

## Summary: Quick Self-Check Before Writing Any Test

Before writing a test, ask:

1. **What real behavior am I verifying?** (If you can't name it, don't write it)
2. **Can this test actually fail?** (If not, it's worthless)
3. **Am I mocking the thing I'm supposed to be testing?** (If yes, remove that mock)
4. **Is my test data realistic?** (Use factories/fakers, not `'aaa'` and `123`)
5. **If I refactor the source code, would this test break?** (If yes for a valid refactor, it's testing implementation details)
6. **If I delete this test, what bug goes unnoticed?** (If "nothing" → it's bloat, drop it)
7. **Am I writing this to bump coverage?** (If yes → stop, see Rule 7)
8. **Does this test have a Reference Header with real `file:line`?** (If not → add it, see Rule 8)

After a test fails:

1. **Did I touch source code?** (If yes, revert — fix the test or report to user)
2. **Is my mock returning hardcoded data matching my assertion?** (If yes, use realistic data)
3. **Does the failure reveal a real bug?** (If yes, report it — don't silently fix it)
