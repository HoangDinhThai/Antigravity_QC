# Docker Testing Reference

Run test commands inside Docker containers while capturing logs and coverage data.

## When to Use

Use this reference when the project runs in Docker. Indicators:
- `docker-compose.yml` / `compose.yml` exists
- `Dockerfile` exists
- `.devcontainer/` exists
- `docker ps` shows running app containers

## Step 1: Discover Docker Setup

### Find service names

```bash
# List services defined in compose file
docker compose config --services

# List running containers with names and images
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'

# Check if containers are running
docker compose ps
```

### Identify the app service

Common service names in compose files:

| Pattern | Likely service name |
|---|---|
| Node.js app | `app`, `web`, `api`, `server`, `frontend`, `backend` |
| Laravel app | `app`, `php`, `api` |
| Fullstack | `app` (Nuxt/Next), or separate `client` + `server` |

**Read `docker-compose.yml` to confirm:**
```bash
cat docker-compose.yml | grep -A3 'service\|build\|image'
```

### Check if app uses Dockerfile or pre-built image

```bash
# If Dockerfile exists → source code is bind-mounted
ls Dockerfile

# Check mount volumes in compose
docker compose config | grep -A5 volumes
```

**Key insight:** If source is bind-mounted (volume `./src:/app/src`), files created on host are immediately visible in container. Config files, test files, directories can all be created on the host.

## Step 2: Run Commands in Docker

### Running container (docker compose exec)

**Preferred** — uses already-running container, preserves state:

```bash
# Node.js tests
docker compose exec app npm test
docker compose exec app npm run test:coverage
docker compose exec app npx vitest run src/path/to/file.spec.ts

# PHP tests
docker compose exec app php artisan test
docker compose exec app php artisan test --filter=TestName
docker compose exec app vendor/bin/pest

# Install packages
docker compose exec app npm install --save-dev vitest @vue/test-utils
docker compose exec app composer require --dev pestphp/pest
```

### Running container (docker exec)

If not using docker compose:

```bash
# Find container name
docker ps --format '{{.Names}}'

# Run command
docker exec <container_name> npm test
docker exec <container_name> php artisan test
```

### Container not running? Start it first

```bash
# Start in background
docker compose up -d

# Wait for service to be ready
docker compose exec app sh -c 'until node -e "process.exit(0)" 2>/dev/null; do sleep 1; done'

# Or for PHP
docker compose exec app sh -c 'until php -v > /dev/null 2>&1; do sleep 1; done'
```

### One-off execution (docker compose run)

**For one-off commands** when container is not running:

```bash
# Run tests in a fresh container (starts dependencies like DB)
docker compose run --rm app npm test

# Run with build (if Dockerfile changed)
docker compose run --rm --build app npm test
```

> **Note:** `docker compose run` creates a new container. `docker compose exec` uses the running one. Prefer `exec` for speed.

## Step 3: Capture Logs & Output

### Redirect output to host file

```bash
# Capture test output to host file
docker compose exec app npm test 2>&1 | tee test-output.log

# With coverage
docker compose exec app npm run test:coverage 2>&1 | tee coverage-output.log

# PHP
docker compose exec app php artisan test 2>&1 | tee test-output.log
```

### Copy output files from container

```bash
# Copy coverage report from container to host
docker compose exec app cat /app/coverage/lcov-report/index.html > coverage-report.html

# Copy entire coverage directory
docker cp $(docker compose ps -q app):/app/coverage ./coverage

# Copy test results XML (JUnit format)
docker cp $(docker compose ps -q app):/app/test-results.xml ./
```

### Capture exit code

```bash
# Docker exec preserves exit code
docker compose exec app sh -c "npm test; echo EXIT_CODE=\$?"

# Or check directly
docker compose exec app npm test
echo "Exit code: $?"
```

### Parse test output for analysis

```bash
# Extract failed test names
docker compose exec app npm test 2>&1 | grep -E '(FAIL|✗|×|Error|FAILED)'

# Extract summary line
docker compose exec app npm test 2>&1 | grep -E '(Tests:|Test Suites:|passed|failed)'

# Extract PHP test results
docker compose exec app php artisan test 2>&1 | grep -E '(FAILURES|OK|Tests:|Assertions:)'
```

## Step 4: Install Test Packages in Docker

### Node.js packages

```bash
# Install inside running container
docker compose exec app sh -c "npm install --save-dev vitest @vue/test-utils happy-dom"

# If package.json is bind-mounted, the change persists on host
# Verify
cat package.json | grep vitest
```

### PHP packages

```bash
docker compose exec app composer require --dev pestphp/pest pestphp/pest-plugin-laravel
```

### If `package.json` is NOT bind-mounted

Some Docker setups copy code into image (no volume mount). In this case:

1. **Edit `package.json` on host** (add devDependencies manually)
2. **Rebuild container:**
   ```bash
   docker compose build app
   docker compose up -d app
   ```

Or use a Dockerfile approach:

```dockerfile
# Add to Dockerfile (dev stage only)
RUN if [ "$NODE_ENV" = "development" ]; then \
    npm install --save-dev vitest @vue/test-utils happy-dom; \
    fi
```

## Step 5: Coverage in Docker

### Generate coverage report

```bash
# Vitest — generates lcov in /app/coverage/
docker compose exec app npx vitest run --coverage

# Jest — generates in /app/coverage/
docker compose exec app npx jest --coverage

# PHPUnit
docker compose exec app php artisan test --coverage-html=coverage
```

### Extract coverage data to host

```bash
# Copy coverage directory
docker cp $(docker compose ps -q app):/app/coverage ./coverage-report

# Quick terminal summary (no file copy needed)
docker compose exec app sh -c "cat coverage/coverage-summary.txt"
# or for Vitest
docker compose exec app sh -c "npx vitest run --coverage 2>&1" | grep -A20 "Coverage report"
```

### Coverage with lcov for CI

```bash
# Generate lcov inside container
docker compose exec app npx vitest run --coverage

# Copy lcov.info to host
docker cp $(docker compose ps -q app):/app/coverage/lcov.info ./lcov.info

# Quick summary on host
cat lcov.info | grep -E "^SF:|^DA:" | head -50
```

## Step 6: Interactive Debugging in Docker

### Shell into container for debugging

```bash
# Interactive shell
docker compose exec app sh
# or bash
docker compose exec app bash

# Run tests interactively (watch mode)
docker compose exec app npx vitest --watch
```

### Run single test file for debugging

```bash
# Vitest — single file
docker compose exec app npx vitest run src/services/__tests__/user.service.spec.ts

# Jest — single file
docker compose exec app npx jest src/services/__tests__/user.service.spec.ts

# PHPUnit — single test
docker compose exec app php artisan test --filter=UserTest
docker compose exec app vendor/bin/phpunit --filter=test_can_create_user
```

### Environment variables for testing

```bash
# Pass env vars to container
docker compose exec -e NODE_ENV=test app npm test

# Or use .env.testing (Laravel)
docker compose exec -e APP_ENV=testing app php artisan test
```

## Common Docker Compose Patterns

### Typical Node.js compose with test support

```yaml
# docker-compose.yml
services:
  app:
    build: .
    volumes:
      - .:/app              # Bind mount — host edits visible in container
      - /app/node_modules   # Prevent host node_modules overwrite
    environment:
      - NODE_ENV=development
    command: npm run dev

  # Optional: test runner service
  test:
    build: .
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=test
    command: npx vitest run
```

### Running the test service

```bash
# Run dedicated test service
docker compose run --rm test

# With coverage
docker compose run --rm test npx vitest run --coverage
```

### Typical PHP/Laravel compose

```yaml
services:
  app:
    build: .
    volumes:
      - .:/var/www/html
    depends_on:
      - mysql
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: testing
```

```bash
# Run tests with testing database
docker compose exec app php artisan test --env=testing
```

## Troubleshooting

| Problem | Solution |
|---|---|
| `Cannot find module` in container | Source not bind-mounted → rebuild image after adding deps |
| Permission denied on test files | `docker compose exec app sh -c "chmod +x node_modules/.bin/*"` |
| Container not running | `docker compose up -d` then wait for ready |
| `node_modules` empty in container | Volume mount conflict → add `- /app/node_modules` anonymous volume |
| Tests can't connect to DB | Use Docker network: `docker compose exec app npm test` (same network) |
| Coverage dir not on host | Use `docker cp` to extract, or check volume mounts |
| Test output truncated | Use `2>&1 \| tee` to capture full output |
| Container exits before tests finish | Use `docker compose run --rm` instead of `exec` for long-running |
| TTY not available | Add `-T` flag: `docker compose exec -T app npm test` |
| Multi-service (FE + BE) | Run tests per service: `docker compose exec api npm test` then `docker compose exec web npm test` |

## Quick Reference: Local vs Docker

| Action | Local | Docker |
|---|---|---|
| Install deps | `npm i --save-dev vitest` | `docker compose exec app npm i --save-dev vitest` |
| Create config file | Write to host (auto-mounted) | Same — write to host |
| Create test file | Write to host | Same — write to host |
| Run tests | `npm test` | `docker compose exec app npm test` |
| Run single file | `npx vitest run file.spec.ts` | `docker compose exec app npx vitest run file.spec.ts` |
| Coverage | `npm run test:coverage` | `docker compose exec app npm run test:coverage` + `docker cp` |
| View output | Direct terminal | `docker compose exec app npm test 2>&1 \| tee output.log` |
| Debug shell | `cd /project && sh` | `docker compose exec app sh` |
