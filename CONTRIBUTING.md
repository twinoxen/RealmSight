# Contributing to RealmSight

## Branch Workflow

1. Always branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feat/your-feature
   ```
2. Open a PR — never push directly to `main`.
3. PR titles follow conventional commits: `type(scope): description`

## PR Format

**Title:** `type(scope): short imperative summary` (max 72 chars)

**Description:**
```
## What
What does this change do?

## Why
Why was it needed?

## How
What changed and where?

## Testing
How to verify it works.
```
