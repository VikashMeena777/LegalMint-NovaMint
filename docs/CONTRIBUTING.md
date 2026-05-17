# Contributing to LegalEase AI

Welcome! This guide covers everything you need to contribute to LegalEase AI, whether you're a human developer or an AI agent in the swarm.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Agent Swarm Workflow](#agent-swarm-workflow)
- [Testing](#testing)
- [Additional Resources](#additional-resources)

## Development Setup

### Prerequisites

- **Node.js** >= 20 (LTS)
- **npm** >= 10
- **Docker** and **Docker Compose**
- **PostgreSQL 16** (via Docker or local)
- **Redis 7** (via Docker or local)

### Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd LegalEase-AI

# 2. Copy environment variables
cp .env.example .env

# 3. Start infrastructure services (PostgreSQL, Redis, Mailpit)
docker-compose up -d

# 4. Install dependencies
npm install

# 5. Generate Prisma client
npx prisma generate

# 6. Run database migrations
npx prisma migrate dev

# 7. Seed the database with demo data
npx prisma db seed

# 8. Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`. Mailpit (email testing) is at `http://localhost:8025`.

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values. For local development, the default `DATABASE_URL` from `docker-compose.yml` works:

```
DATABASE_URL="postgresql://legalease:legalease_dev@localhost:5432/legalease"
REDIS_URL="redis://localhost:6379"
```

For AI features (document generation, compliance analysis), you will need a valid `OPENAI_API_KEY`. Stripe keys are only needed for billing testing.

## Project Structure

```
LegalEase-AI/
├── .github/workflows/    # CI/CD pipelines
├── agent-swarm/          # AI agent swarm definitions and task templates
├── apps/
│   └── web/              # Next.js application (pages router)
├── docs/                 # Architecture, PRD, API contracts, design docs
├── packages/
│   ├── ai/               # LLM integration, RAG pipeline, embeddings
│   ├── config/           # Shared configuration (ESLint, TypeScript, Tailwind)
│   ├── db/               # Prisma schema, migrations, client, seed scripts
│   └── lib/              # Shared utilities, validators, helpers
├── docker-compose.yml
└── AGENTS.md             # Agent swarm instructions
```

## Branch Naming Convention

All branches must follow the pattern:

| Prefix    | Purpose                            | Example                       |
|-----------|------------------------------------|-------------------------------|
| `feature/` | New feature or enhancement         | `feature/ai-document-generator` |
| `fix/`     | Bug fix                           | `fix/stripe-webhook-timeout`   |
| `docs/`    | Documentation only                | `docs/api-contract-update`    |
| `refactor/`| Code restructuring (no behavior change) | `refactor/onboarding-flow` |
| `test/`    | Adding or updating tests          | `test/compliance-matching`    |
| `chore/`   | CI, deps, config, tooling         | `chore/upgrade-prisma-v6`     |

Use lowercase, hyphen-separated names. Keep branch names short but descriptive.

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type       | Usage                                    |
|------------|------------------------------------------|
| `feat:`    | A new feature                            |
| `fix:`     | A bug fix                                |
| `docs:`    | Documentation changes                    |
| `refactor:`| Code refactoring (no feature/fix)        |
| `test:`    | Adding/updating tests                    |
| `chore:`   | Build process, dependencies, tooling      |
| `style:`   | Formatting, whitespace (no logic change)  |
| `perf:`    | Performance improvements                  |

### Examples

```
feat(ai): add RAG-based document generation pipeline
fix(db): resolve connection pool exhaustion on high load
docs(api): document v2 compliance check endpoint
refactor(onboarding): extract multi-step wizard to shared hook
test(compliance): add integration tests for GDPR matching
chore(deps): upgrade prisma to 6.x
```

### Rules

- Use imperative mood ("add" not "added" or "adds")
- Keep the first line under 72 characters
- Reference issues/PRs in the footer when applicable: `Refs #123`

## Pull Request Process

### Before You Open a PR

1. Ensure your branch is up to date with `main`: `git rebase main`
2. Run `npm run lint` and fix any issues
3. Run `npm run typecheck` and ensure no type errors
4. Run `npm run test` and ensure all tests pass
5. Update documentation if your changes affect APIs or user-facing behavior

### PR Description Template

```markdown
## Summary
Brief description of what this PR does and why.

## Type
- [ ] Feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactor
- [ ] Chore

## Changes
- Change 1
- Change 2

## Testing
Describe how the changes were tested.

## Screenshots (if applicable)
Add screenshots or screen recordings of UI changes.

## Checklist
- [ ] Lint passes
- [ ] Type check passes
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No secrets or sensitive data committed
```

### Reviewer Checklist

When reviewing a PR, check for:

1. **Correctness**: Does the code do what it's supposed to?
2. **Security**: Are there SQL injection, XSS, or auth vulnerabilities?
3. **Performance**: Any N+1 queries, unnecessary re-renders, or memory leaks?
4. **Error handling**: Are edge cases and error states handled?
5. **Test coverage**: Do tests cover the new/changed behavior?
6. **Code style**: Does it match our conventions?
7. **Documentation**: Are API changes documented?

### PR Workflow

1. Open a PR against `main`
2. Request review from at least one team member
3. CI must pass (lint, typecheck, test, build)
4. Address all review comments
5. Squash and merge once approved

## Code Style

### TypeScript

- **Strict mode enabled** in `tsconfig.json`
- Prefer `interface` over `type` for object shapes
- Use `readonly` arrays and objects where appropriate
- Avoid `any` — use `unknown` if the type is truly unknown
- Use `const` assertions (`as const`) for literal types

### ESLint + Prettier

Configuration is in `packages/config/eslint/`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/strict",
    "prettier"
  ]
}
```

Run formatting before committing:

```bash
npm run format       # Prettier fix all
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
```

### React / Next.js

- Use functional components with hooks
- Server components by default; add `"use client"` only when needed
- Keep components focused — one component, one responsibility
- Co-locate component-specific styles (CSS modules or Tailwind)
- Use `zod` for form validation and API input schemas
- Use `server-only` and `client-only` packages for environment-specific code

### Database (Prisma)

- All schema changes go in `packages/db/prisma/schema.prisma`
- Create migrations with `npx prisma migrate dev --name <description>`
- Never edit migrations manually
- Use `$transaction` for multi-table operations
- Seed scripts must be idempotent (safe to run multiple times)

### Naming

- **Files**: kebab-case (`compliance-checker.ts`, `use-onboarding.ts`)
- **Components**: PascalCase (`DocumentGenerator.tsx`, `ComplianceDashboard.tsx`)
- **Functions/variables**: camelCase (`fetchComplianceStatus`, `userProfile`)
- **Constants**: SCREAMING_SNAKE_CASE for top-level config (`MAX_RETRIES`)
- **Database tables**: PascalCase (Prisma convention)
- **Columns/fields**: camelCase

## Agent Swarm Workflow

LegalEase AI uses an agent swarm architecture for AI-assisted development. Agents are task-specific AI instances that work on isolated parts of the codebase.

### How Agents Are Delegated Tasks

1. **Task Definition**: Tasks are defined in `agent-swarm/tasks/` as Markdown files specifying the goal, scope, and acceptance criteria.

2. **Agent Invocation**: Agents are invoked with a task and context. See `AGENTS.md` for the full setup:
   ```bash
   kilo "Implement the compliance matching engine per agent-swarm/tasks/compliance-matching.md"
   ```

3. **Agent Output**: Each agent produces:
   - Code changes (committed to a feature branch)
   - A summary of what was done
   - Any decisions or assumptions made

4. **Human Review**: Agent output is reviewed like any other contribution — PR, code review, CI checks.

### Agent Types

| Agent          | Responsibility                                  |
|----------------|-------------------------------------------------|
| `frontend`     | React components, pages, styling, UX            |
| `backend`      | API routes, server logic, database queries       |
| `ai-engine`    | LLM integration, prompt engineering, RAG         |
| `fullstack`    | End-to-end features across frontend + backend    |
| `docs`         | Documentation, architecture diagrams, API specs  |
| `security`     | Auth, authorization, input validation, secrets   |
| `test`         | Unit tests, integration tests, E2E tests         |

### Agent Communication

When multiple agents work on related tasks, they communicate via:
- **Shared context files** in `agent-swarm/context/`
- **PR descriptions** that link to related agent outputs
- **Merge conflicts** resolved by the human coordinator

### Best Practices for Agents

- Work in isolated branches (`feature/agent-xxx`)
- Commit frequently with conventional commit messages
- Follow the same code style and conventions as human developers
- Reference the task file in PR descriptions
- Mark assumptions and decisions clearly in the PR body

## Testing

- **Unit tests**: `npm run test` (Vitest)
- **E2E tests**: `npm run test:e2e` (Playwright)
- **Test DB**: A separate test database is used (see CI config)

Write tests for:
- New features
- Bug fixes (regression test)
- Critical paths (auth, billing, document generation)

## Additional Resources

- [Architecture Overview](./ARCHITECTURE.md) — System design and data flow
- [API Contract](./API-CONTRACT.md) — REST API endpoints and schemas
- [Product Requirements](./PRD.md) — Feature specifications and roadmap
- [AI Engine Design](./AI-ENGINE.md) — LLM integration and RAG pipeline
- [Design System](./DESIGN.md) — UI components and design tokens