# Laravel Testing Reference (PHPUnit / Pest)

> ⚠️ **Pattern catalog** — pick the 1-3 patterns that match your target. Do NOT reproduce every pattern below for a single file. Respect the [DO NOT TEST](../SKILL.md#do-not-test) list and propose a Test Plan before writing.

## Stack

- **PHP 8.1+**, Laravel 10/11/12
- **PHPUnit** (default) or **Pest PHP** (elegant syntax, built on PHPUnit)
- **Database:** MySQL/PostgreSQL with `RefreshDatabase` trait (transactions per test)

## Setup

### PHPUnit (default)

Laravel ships with PHPUnit. Config in `phpunit.xml`.

```bash
composer require --dev phpunit/phpunit
php artisan test              # Runs via PHPUnit
php artisan test --parallel   # Parallel execution
```

### Pest PHP (recommended for new projects)

```bash
composer require --dev pestphp/pest pestphp/pest-plugin-laravel
php artisan pest:install      # Creates Pest.php config
php artisan test              # Auto-detects Pest
```

## Directory Structure

```
tests/
├── Unit/                     # Pure unit tests (no DB, no HTTP)
│   ├── Services/
│   │   └── UserServiceTest.php
│   └── Models/
│       └── UserTest.php
├── Feature/                  # Integration tests (DB, HTTP, full request cycle)
│   ├── Auth/
│   │   └── LoginTest.php
│   └── Api/
│       └── UserApiTest.php
└── TestCase.php              # Base test class (extends Laravel TestCase)
```

**Pest equivalent:** Same dirs, files are `describe/it/test` without classes.

## Key Patterns

### 1. Base TestCase

```php
// tests/TestCase.php
namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();
        // Common setup
    }
}
```

### 2. Database Testing with RefreshDatabase

```php
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;

class UserApiTest extends TestCase
{
    use RefreshDatabase;  // Wraps each test in a DB transaction

    public function test_can_create_user(): void
    {
        // Arrange — use factories for minimal data
        $userData = User::factory()->make()->toArray();
        $userData['password'] = 'password123';

        // Act
        $response = $this->postJson('/api/users', $userData);

        // Assert
        $response->assertCreated()
            ->assertJsonPath('data.email', $userData['email']);

        $this->assertDatabaseHas('users', [
            'email' => $userData['email'],
        ]);
    }
}
```

### 3. Model Factories

```php
// database/factories/UserFactory.php
class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => bcrypt('password'),
            'role' => 'user',
        ];
    }

    // State modifiers
    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }
}

// Usage in tests
$user = User::factory()->create();           // Persisted
$user = User::factory()->admin()->create();  // Admin user
$user = User::factory()->make();             // Not persisted (in-memory)
$users = User::factory()->count(5)->create(); // Multiple
```

### 4. HTTP/API Testing

```php
// GET with auth
public function test_authenticated_user_can_list_orders(): void
{
    $user = User::factory()->create();
    Order::factory()->count(3)->for($user)->create();

    $response = $this->actingAs($user)
        ->getJson('/api/orders');

    $response->assertOk()
        ->assertJsonCount(3, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'status', 'total', 'created_at']
            ]
        ]);
}

// POST with validation
public function test_create_order_validates_input(): void
{
    $response = $this->postJson('/api/orders', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['items', 'shipping_address']);
}

// File upload
public function test_can_upload_avatar(): void
{
    $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);

    $response = $this->actingAs($user)
        ->postJson('/api/profile/avatar', ['avatar' => $file]);

    $response->assertOk();
    Storage::disk('public')->assertExists('avatars/' . $file->hashName());
}
```

### 5. Service Unit Testing (No DB)

```php
class PriceCalculatorTest extends TestCase
{
    private PriceCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->calculator = new PriceCalculator();
    }

    public function test_calculates_total_with_tax(): void
    {
        // Source: app/Services/PriceCalculator.php:24 — PriceCalculator::calculate()
        // Behavior: applies tax rate to item subtotal
        $items = collect([
            ['price' => 100, 'quantity' => 2],
            ['price' => 50, 'quantity' => 1],
        ]);

        $total = $this->calculator->calculate($items, taxRate: 0.1);

        $this->assertEquals(275.0, $total); // (200 + 50) * 1.1
    }

    public function test_throws_on_negative_price(): void
    {
        // Source: app/Services/PriceCalculator.php:31 — PriceCalculator::calculate()
        // Behavior: rejects negative prices with InvalidArgumentException
        $items = collect([['price' => -10, 'quantity' => 1]]);

        $this->expectException(InvalidArgumentException::class);
        $this->calculator->calculate($items);
    }
}
```

### 6. Mocking Dependencies

```php
use Mockery;

class NotificationServiceTest extends TestCase
{
    public function test_sends_welcome_email_on_registration(): void
    {
        $mailer = Mockery::mock(MailerInterface::class);
        $mailer->shouldReceive('send')
            ->once()
            ->withArgs(fn ($to, $subject) => str_contains($subject, 'Welcome'));

        $this->app->instance(MailerInterface::class, $mailer);

        $service = $this->app->make(NotificationService::class);
        $service->sendWelcome(new User(['email' => 'test@example.com']));
    }
}
```

### 7. Pest PHP Syntax (Alternative)

```php
// tests/Feature/UserApiTest.php
uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('can list users', function () {
    // Source: app/Http/Controllers/UserController.php:18 — UserController::index()
    // Behavior: returns paginated user list for authenticated user
    $response = $this->actingAs($this->user)
        ->getJson('/api/users');

    $response->assertOk();
});

it('validates required fields on create', function () {
    // Source: app/Http/Controllers/UserController.php:34 — UserController::store()
    // Behavior: rejects empty payload with 422 + validation errors
    $this->postJson('/api/users', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email']);
});

it('creates user with valid data', function () {
    // Source: app/Http/Controllers/UserController.php:34 — UserController::store()
    // Behavior: persists user and returns 201
    $data = User::factory()->make()->only(['name', 'email']);

    $this->postJson('/api/users', $data)
        ->assertCreated();

    expect(User::where('email', $data['email'])->exists())->toBeTrue();
});

// Parametrized
it('validates email format', function (string $email, bool $valid) {
    $response = $this->postJson('/api/users', [
        'name' => 'Test',
        'email' => $email,
    ]);

    if ($valid) {
        $response->assertCreated();
    } else {
        $response->assertUnprocessable();
    }
})->with([
    ['valid@email.com', true],
    ['invalid', false],
    ['no@domain', false],
]);
```

## Coverage

```bash
php artisan test --coverage                    # Terminal output
php artisan test --coverage-html=coverage      # HTML report
XDEBUG_MODE=coverage php artisan test --coverage  # With Xdebug
```

`phpunit.xml` coverage config:
```xml
<coverage>
    <include>
        <directory suffix=".php">app/</directory>
    </include>
    <report>
        <threshold>
            <line>80</line>
        </threshold>
    </report>
</coverage>
```

## Common Pitfalls

| Issue | Solution |
|---|---|
| Tests share DB state | Always use `RefreshDatabase` trait |
| Factory missing states | Define all needed states in factory |
| Time-dependent tests | Use `$this->travelTo()` / `Carbon::setTestNow()` |
| File upload tests fail | Use `Storage::fake('disk')` before upload |
| Event listeners fire in tests | Use `WithoutEvents` trait to disable |
| Queue jobs run during tests | Use `Queue::fake()` to prevent |
| Mail sent during tests | Use `Mail::fake()` / `Notification::fake()` |
