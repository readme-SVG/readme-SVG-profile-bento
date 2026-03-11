# Contributing Guide

Thanks for wanting to contribute. You’re awesome.

This repo is a dynamic SVG card generator for GitHub profile READMEs, with a serverless API and lightweight web preview UI. Good contributions here are usually one of these: bug fixes, new slide types, UX improvements for preview flow, or API reliability/perf upgrades.

## I Have a Question

Please do **not** use GitHub Issues for general usage questions.

Use one of these channels instead:

- GitHub Discussions (preferred, if enabled in repo)
- Project maintainer social channels listed in `README.md`
- Developer communities where GitHub API/serverless topics are discussed

Use Issues only for actionable bugs or feature requests.

## Reporting Bugs

Before opening a bug report:

1. Check existing open and closed issues to avoid duplicates.
2. Confirm the issue is reproducible on the latest `main` branch.
3. Re-test with and without `GITHUB_TOKEN` to rule out rate-limit noise.

When creating a bug report, include:

- **Environment**
  - OS + version
  - Node.js version
  - Python version (if bug touches `process_event.py` or workflow tooling)
  - Deployment target (`vercel dev`, production Vercel, etc.)
- **Steps to Reproduce**
  - Exact request URL/query parameters
  - Expected output
  - Actual output
- **Logs and Artifacts**
  - API response body (if safe)
  - Terminal logs
  - Screenshot if it’s UI-related

Strong bug report template:

```md
### Environment
- OS: Ubuntu 22.04
- Node: 20.x
- Runtime: vercel dev

### Steps to Reproduce
1. Run `vercel dev`
2. Open `/api/card?user=<username>&slides=repos,stars`
3. Refresh multiple times

### Expected Behavior
Card rotates between selected slides.

### Actual Behavior
Card always stays on first slide.

### Extra Context
Attached SVG payload + console logs.
```

## Suggesting Enhancements

Feature requests should be problem-first, not implementation-first.

Include:

- **Problem statement**: what pain point exists today?
- **Proposed enhancement**: what behavior should be added/changed?
- **Use cases**: real scenarios where this unlocks value.
- **Trade-offs**: perf, complexity, compatibility considerations.

Example high-signal requests:

- New slide module for contribution heat summary.
- Better error card detail for rate-limit responses.
- Optional theming support in query params.

## Local Development Setup

```bash
# 1) Fork this repo on GitHub
# 2) Clone your fork
git clone https://github.com/<your-user>/readme-SVG-profile-bento.git
cd readme-SVG-profile-bento

# 3) Add upstream remote
git remote add upstream https://github.com/readme-SVG/readme-SVG-profile-bento.git

# 4) Python deps (workflow tooling)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 5) Optional env vars
cp .env.example .env 2>/dev/null || true
# Then set GITHUB_TOKEN manually if .env.example is missing

# 6) Run locally
vercel dev
```

If `vercel` is not installed globally:

```bash
npm i -g vercel
```

## Pull Request Process

### Branch Naming

Use descriptive branch names:

- `feature/<short-feature-name>`
- `bugfix/<issue-id-or-short-name>`
- `docs/<scope>`
- `chore/<scope>`

### Commit Messages

Use **Conventional Commits**:

- `feat: add spotlight fallback when repos are empty`
- `fix: handle null language field in langlist slide`
- `docs: rewrite README with deployment notes`

### Keep in Sync With Upstream

Before opening PR:

```bash
git fetch upstream
git checkout main
git rebase upstream/main
```

Then rebase your branch on updated `main` if needed.

### PR Description Requirements

A solid PR description should include:

- What changed and why.
- Linked issue(s): `Closes #123` when applicable.
- Validation notes: commands run and results.
- Screenshots/GIFs for UI changes (`index.html`, `styles.css`, `app.js` updates).

## Styleguides

Keep changes minimal, explicit, and production-minded.

- Follow existing JavaScript style in `api/` and root frontend files.
- Keep slide modules deterministic and side-effect free.
- Avoid heavy dependencies for simple transformations.
- Prefer readable data-mapping over clever one-liners.

Suggested local quality tools (optional but recommended):

```bash
# JS lint/format (if configured in your environment)
npx eslint .
npx prettier -w .

# Python formatting/linting
black process_event.py
flake8 process_event.py
```

## Testing

Every functional change should include validation.

Baseline checks:

```bash
# API smoke test
vercel dev
curl "http://localhost:3000/api/card?user=octocat" -o card.svg

# Basic output check
test -s card.svg && echo "SVG OK"

# Python syntax check
python -m py_compile process_event.py
```

If you add or modify slide logic, test:

- Default rotation path
- `slides=` filtering
- `_slide=` override
- Missing `user` error SVG

## Code Review Process

- Maintainers review all incoming PRs.
- At least one maintainer approval is expected before merge.
- Address review comments with follow-up commits or force-push updates.
- Resolve conversations only after the requested changes are done.

Fast-track tips:

- Keep PR scope focused.
- Include reproducible test evidence.
- Avoid mixing refactors with feature fixes in one PR.
