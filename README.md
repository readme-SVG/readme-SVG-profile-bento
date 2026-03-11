# readme-SVG-profile-bento

> GitHub profile cards as SVG, built for README embeds and shipped serverless.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue?style=for-the-badge)](LICENSE)
![Node >=18](https://img.shields.io/badge/Node-%3E%3D18-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

> [!NOTE]
> This project generates dynamic SVG cards from GitHub API data and rotates slides every 10 minutes by default.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Technical Notes](#technical-notes)
  - [Project Structure](#project-structure)
  - [Key Design Decisions](#key-design-decisions)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Usage](#usage)
- [Configuration](#configuration)
- [License](#license)
- [Contacts](#contacts)

## Features

- Multi-slide SVG card pipeline for GitHub profiles (`repos`, `stars`, `followers`, `langbar`, `toprepos`, `commits`, etc.).
- Slide rotation strategy based on 10-minute time buckets for cache-friendly dynamic content.
- Slide filtering via query params: include only specific slide IDs in render output.
- Web UI preview tool for card generation, slide toggling, and copy-paste embed snippets.
- Supports both Markdown and HTML embed snippets for README integration.
- Optional GitHub token support to jump from `60 req/hr` to `5000 req/hr` rate limit tier.
- Serverless-first deployment via Vercel with function-level memory and timeout config.
- Error-safe SVG response format (API always returns SVG, including fallback error payloads).

> [!TIP]
> If you are embedding this in a public profile README, always use a tokenized deployment to avoid rate-limit blowups during traffic spikes.

## Tech Stack

- **Runtime**: Node.js `>=18`.
- **Serverless API**: Vercel function (`api/card.js`).
- **Frontend**: Vanilla HTML/CSS/JS (`index.html`, `styles.css`, `app.js`).
- **GitHub Integration**: GitHub REST API (`fetch` + custom wrapper).
- **Automation Script**: Python (`process_event.py`) with `PyGithub`, `requests`, `python-dotenv`.
- **CI/CD**: GitHub Actions workflow for AI-assisted issue generation.

## Technical Notes

### Project Structure

```txt
.
├── api/
│   ├── card.js                # SVG card API handler
│   ├── lib/
│   │   ├── constants.js       # Theme and dimensions
│   │   ├── github.js          # GitHub REST wrapper
│   │   ├── helpers.js         # String/safe helpers
│   │   └── svg.js             # SVG utility builders
│   └── slides/                # Individual slide renderers
├── .github/workflows/
│   └── ai-issue.yml           # AI issue automation workflow
├── index.html                 # Preview and embed UI
├── app.js                     # Frontend logic for preview/snippets
├── styles.css                 # UI styling
├── process_event.py           # Workflow event processing script
├── vercel.json                # Vercel runtime and headers config
├── requirements.txt           # Python dependencies
└── package.json               # Node metadata + engine constraints
```

### Key Design Decisions

- **SVG-first output contract**: API returns `image/svg+xml` in both success and error paths, so embeds never hard-fail as broken JSON.
- **Cache-aware dynamic behavior**: non-preview requests are cached (`s-maxage=600`) and map to a deterministic bucket index.
- **Composable slide registry**: all slide modules are registered through `api/slides/index.js`, making extension straightforward.
- **Progressive data enrichment**: commits are aggregated from both repo commit endpoints and public push events for better coverage.
- **Zero-framework frontend**: keeps preview page lightweight, dependency-free, and portable.

> [!IMPORTANT]
> The API requires `?user=<github_username>`. Without it, it returns an SVG error card intentionally.

## Getting Started

### Prerequisites

Install these dependencies before local development:

- Node.js `>=18`
- npm (bundled with Node)
- Python `>=3.10` (recommended: `3.11`)
- A GitHub Personal Access Token (optional but strongly recommended)

### Installation

```bash
# 1) Clone repository
git clone https://github.com/readme-SVG/readme-SVG-profile-bento.git
cd readme-SVG-profile-bento

# 2) Install Python dependencies (for workflow script tooling)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# 3) Install Vercel CLI if you want local serverless emulation
npm i -g vercel

# 4) Configure env vars (token is optional but highly recommended)
export GITHUB_TOKEN="your_token_here"
```

> [!WARNING]
> Running without `GITHUB_TOKEN` will hit unauthenticated GitHub API limits quickly, especially with multiple embeds.

## Testing

There is currently no dedicated unit-test suite in this repository. Use these sanity checks before shipping changes:

```bash
# API smoke test (requires local Vercel dev server)
vercel dev
curl "http://localhost:3000/api/card?user=octocat" -o card.svg

# Validate SVG output is non-empty and renderable
test -s card.svg && echo "SVG generated"

# Optional: validate Python script import health
python -m py_compile process_event.py
```

If you add new slide modules, manually verify:

- Default rotation path.
- `slides=` filtering behavior.
- `_slide=` preview override behavior.
- Error SVG path for invalid usernames or missing params.

## Deployment

### Vercel (recommended)

```bash
# Authenticate and deploy
vercel
vercel --prod
```

`vercel.json` already defines:

- Function sizing for `api/card.js` (`memory: 256`, `maxDuration: 10`).
- CORS headers for `/api/*` GET endpoints.

### CI/CD Notes

- `.github/workflows/ai-issue.yml` runs on pushes to `main` and selected PR events.
- The workflow executes `process_event.py` and relies on repo secrets for tokenized operations.

## Usage

### Direct API

```bash
# Minimal
curl "https://your-domain.vercel.app/api/card?user=OstinUA"

# Restrict to selected slides
curl "https://your-domain.vercel.app/api/card?user=OstinUA&slides=repos,stars,commits"

# Force preview slide index (mostly for debugging/UI preview)
curl "https://your-domain.vercel.app/api/card?user=OstinUA&slides=repos,stars&_slide=1"
```

### README Embeds

```md
<!-- Markdown embed -->
![GitHub Stats](https://your-domain.vercel.app/api/card?user=OstinUA)

<!-- HTML embed with width control -->
<img src="https://your-domain.vercel.app/api/card?user=OstinUA" width="495" alt="GitHub Stats"/>
```

> [!CAUTION]
> Avoid setting tiny image widths in README markdown unless you want text clipping on specific slide layouts.

## Configuration

Environment variables used in this project:

| Variable | Required | Description |
|---|---:|---|
| `GITHUB_TOKEN` | No (but recommended) | Increases GitHub API rate limit and reduces request failures. |
| `REPOSITORY` | Workflow-only | Repository slug for `process_event.py` in CI contexts. |
| `EVENT_NAME` | Workflow-only | Event name consumed by automation script. |
| `COMMIT_SHA` | Workflow-only | Commit SHA passed from GitHub Actions. |
| `PR_NUMBER` | Workflow-only | Pull request number for PR event handling. |
| `GH_MODELS_TOKEN` | Workflow-only | Token for model-powered workflow steps. |
| `ALLOWED_USER` | Workflow-only | Optional identity gate in automation flow. |

API query parameters:

| Parameter | Required | Description |
|---|---:|---|
| `user` | Yes | GitHub username for data collection. |
| `slides` | No | Comma-separated slide IDs to include. |
| `_slide` | No | Preview index override (debug/preview use). |

## License

This project is licensed under **GPL-3.0**. See [`LICENSE`](LICENSE) for legal terms.

## Contacts

## ❤️ Support the Project

[![Patreon](https://img.shields.io/badge/Patreon-OstinFCT-f96854?style=flat-square&logo=patreon)](https://www.patreon.com/OstinFCT)
[![Ko-fi](https://img.shields.io/badge/Ko--fi-fctostin-29abe0?style=flat-square&logo=ko-fi)](https://ko-fi.com/fctostin)
[![Boosty](https://img.shields.io/badge/Boosty-Support-f15f2c?style=flat-square)](https://boosty.to/ostinfct)
[![YouTube](https://img.shields.io/badge/YouTube-FCT--Ostin-red?style=flat-square&logo=youtube)](https://www.youtube.com/@FCT-Ostin)
[![Telegram](https://img.shields.io/badge/Telegram-FCTostin-2ca5e0?style=flat-square&logo=telegram)](https://t.me/FCTostin)

If this project saves you time, drop a ⭐ on GitHub or support the author directly.
