# Daily Fact Platform


## Roles
- **Director (Human):** Signs off on all merges. Nothing merges without explicit approval.
- **Lead Developer (Claude Code):** Does all implementation, commits, PRs.
- **Code Reviewer (Gemini):** Automatically reviews PRs via GitHub Actions.


## First Session Setup (before Ticket 1)
If BACKLOG.md does not exist yet, create it from the ticket detail provided by the Director.
Then: create GitHub labels (backend, frontend, ci, infra, devops, future),
create GitHub Issues for all tickets with the right labels,
create a GitHub Project board and add all Issues.
Also create .gitattributes with: * text=auto eol=lf


## The Merge Rule (HARD RULE)
Never merge a PR without the Director's explicit sign-off.
Never merge until BOTH reviews (self-review + independent Gemini review) come back clean.
If reviews flag issues, fix them and push. The review cycle repeats.
GitHub branch protection enforces this structurally:
  - CI must pass before merge is possible
  - At least one review must exist on the PR
  - No direct pushes to main — all changes go through PRs
Even if you try to merge, GitHub will block it if checks haven't passed.


## PR Workflow (every ticket)
1. Write failing tests FIRST (TDD). Run them, confirm they fail
2. Implement until tests pass. Commit with conventional commits (feat:, fix:, chore:)
3. Check PR size: if >300 lines changed, split into sub-PRs
4. Push and open PR via `gh pr create` referencing "Closes #N"
5. Run SELF-REVIEW: read diff (`gh pr diff`), compare against acceptance
   criteria in this file, post structured self-assessment as PR comment
   (`gh pr comment --body '...'`). Check: did I meet every criterion?
6. While CI + Gemini run, context-switch: plan next ticket, write test stubs,
   tidy docs. DO NOT block terminal with `gh pr checks --watch`
7. Check back: `gh pr checks` and `gh pr view --comments`
8. PROACTIVELY report to Director with:
   - CI status (pass/fail)
   - Self-review summary (did I meet the acceptance criteria?)
   - Gemini review summary (independent security/quality findings)
   - PR size (lines changed)
   - Recommendation: "Ready for merge" or "Issues found, want me to fix?"
   - If self-review caught something Gemini missed (or vice versa), flag it
9. If Director says "merge it" -> `gh pr merge --squash`
10. If Director says "fix those" -> fix, push, cycle repeats from step 5


IMPORTANT: Never block the terminal waiting for CI.
Always report back proactively once reviews are complete.
Never merge without Director's explicit sign-off.
Keep PRs under 300 lines. Split if larger.


## Anti-Scope (DO NOT BUILD)
- No user authentication (OAuth, JWTs, login screens)
- No likes, comments, or user-generated content
- No Redux or complex state management
- No Kubernetes or ECS — single EC2 instance only


## Tech Stack
- Frontend: React 18, Vite, Tailwind CSS
- Backend: Python 3.11+, FastAPI
- Database: PostgreSQL (asyncpg with raw SQL — no ORM)
- Schema: single init.sql mounted into Postgres container, no Alembic
- Local dev: Docker Compose (everything runs via `make up`)
- IaC: Terraform (AWS EC2 t2.micro)
- CI: GitHub Actions (ci.yml for tests, gemini-reviewer.yml for AI review, deploy.yml for auto-deploy)
- Project tracking: GitHub Issues + GitHub Projects board


## Engineering Standards
| Standard | From | Rule |
|---|---|---|
| Container-First | Ticket 1 | All dev runs via docker compose / make up |
| Structured Logging | Ticket 1 | Python logging module, not print(). Structured output |
| Conventional Commits | Ticket 1 | feat:, fix:, chore: prefixes on every commit |
| Zero Trust Secrets | Ticket 1 | No hardcoded creds. .env locally, GitHub Secrets in CI |
| Director's Briefing | Ticket 1 | After each ticket: what was created, why, how it connects, what to look at in VS Code |
| Linting | Ticket 2 | Ruff for Python, ESLint + Prettier for frontend |
| Test-Driven Dev | Ticket 2 | Write tests BEFORE implementation. Tests = executable acceptance criteria |
| Sprint Retro | Every 3-4 tickets | Reflect, architectural review, write lessons learned to this file |
| Strict Typing | Ticket 4 | Python type hints + Pydantic models on all API responses |
| VS Code Coaching | Every ticket | Progressively teach VS Code features relevant to current work |


## Database Schema
```sql
CREATE TABLE facts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_text  TEXT NOT NULL,
  source_url VARCHAR,
  fetched_at TIMESTAMP DEFAULT now()
);
```


## API Contract
**GET /api/facts/random** -> 200: { id, text, source_url, fetched_at }
**GET /api/facts/random** -> 404: { detail: "No facts available in the database." }
**GET /api/health** -> 200: { status: "ok" }


## Repo Structure
```
daily-fact-platform/
├── .github/workflows/     # ci.yml, gemini-reviewer.yml, deploy.yml
├── CLAUDE.md              # This file
├── BACKLOG.md             # All tickets
├── backend/app/           # FastAPI (api/, core/, models/, worker/, main.py)
├── frontend/src/          # React + Vite + Tailwind
├── db/init.sql            # Schema creation
├── terraform/             # main.tf, variables.tf
├── docker-compose.yml
├── Makefile
├── .env.example
└── .gitattributes            # LF line endings everywhere (cross-platform)
```


## Makefile Commands
| Command | What it does |
|---|---|
| make up | docker compose up --build -d |
| make down | docker compose down |
| make logs | docker compose logs -f |
| make logs-api | docker compose logs -f backend |
| make test | docker compose exec backend pytest |
| make lint | docker compose exec backend ruff check . |
| make db | docker compose exec postgres psql -U postgres |
| make restart | make down && make up |
| make clean | docker compose down -v (resets DB) |
| make status | docker compose ps |
| make board | gh project item-list PROJECT_NUMBER --owner @me |
| make issues | gh issue list |
| make deploy | terraform apply |
| make destroy | terraform destroy |
| make rollback | git revert HEAD --no-edit && git push (reverts last merge, triggers redeploy) |




## Director's Briefing (after every ticket)
After completing each ticket, provide:
1. What was created: which files, what they do
2. Why: how each file connects to the acceptance criteria
3. How it links to prior work: which files from earlier tickets are now connected
4. What to look at in VS Code: specific files to open, what to notice
5. Code walkthrough: plain-English explanation of key patterns (for a Director, not a dev)
6. VS Code tip: one VS Code feature relevant to this ticket (progressive coaching)


## VS Code Coaching Progression
Ticket 1: File tree, integrated terminal, Docker extension
Ticket 2: Source Control panel, reading diffs, Git staging
Ticket 3: GitHub PR extension — reading review comments, CI status inline
Tickets 4-7: Go to Definition, following imports between files, understanding module connections
Ticket 8: Tailwind IntelliSense, live preview, browser DevTools basics
Ticket 10: Terraform extension, reading plan output


## Test-Driven Development
From Ticket 2 onwards: write tests BEFORE implementation.
Tests encode the acceptance criteria as executable assertions.
Workflow: read ticket criteria -> write failing tests -> implement until tests pass -> refactor.
This is more important with AI-generated code because Claude pattern-matches, not understands.
Tests are the PROOF that the pattern-matching produced correct behaviour.


## Sprint Retro (after Tickets 4, 7, 11)
Lead a retro covering five areas:
1. WORKFLOW: What's working? What's slow? What did I miss?
2. ARCHITECTURAL REVIEW (targeted checklist):
   - Same error handling pattern across all routes?
   - Parameterised DB queries everywhere?
   - Logging format consistent across modules?
   - Circular imports or dead code?
   - Test coverage meaningful, not superficial?
   - Repo structure matches what's documented here?
3. COST CHECK: Subscription tier adequate? Hitting rate limits? Cloud spend (aws ce get-cost-and-usage)
4. TOOLING: Gemini model string still valid? Dependabot flags? Docker images clean?
5. LESSONS: Write findings below


## Rollback
If a merge breaks production: `make rollback`
This runs: git revert HEAD --no-edit && git push
The deploy-on-merge action will automatically deploy the reverted state.


## Lessons Learned

### Retro 1 (after Ticket 4)
- Verify third-party GitHub Actions exist before referencing them. google-github-actions/gemini-code-review@v1 doesn't exist — built a custom workflow calling Gemini API directly (better: full control over prompt).
- Free-tier API limits can bite you in CI. Gemini 2.0 Flash had zero free-tier quota. Switched to gemini-2.5-flash.
- Avoid exposing container ports to the host when only inter-container communication is needed. Removed postgres host port (5432 conflict with local postgres). Backend connects via Docker internal network.


## Working with Claude Code (Strengths & Limitations)
GOOD AT: File creation, boilerplate, repetitive patterns, CLI commands,
  reading/summarising diffs, test writing, Docker/Terraform configs,
  following explicit instructions, conventional patterns
UNRELIABLE AT: Complex algorithmic logic, performance-sensitive code,
  implicit business rules, maintaining consistency across a large codebase
  without explicit guidance, knowing when it's wrong
RULES:
- If unsure about a pattern, ASK the Director before implementing
- If a ticket involves complex logic, write tests first with explicit edge cases
- If making a design decision that affects multiple files, flag it in the Director's Briefing
- Never silently change a pattern established in earlier tickets
- When something fails and you don't know why, say so — don't guess


## PR Size Limit
No PR should change more than 300 lines.
If a ticket requires more, split it into sub-PRs.
Large diffs are where review quality collapses — both self-review and Gemini miss things.


## Context Management (for bigger projects)
This file should stay under ~150 lines. If it grows beyond that:
- Move completed tickets to an archive section or separate file
- Keep only the CURRENT SPRINT tickets in this file
- Move detailed standards to .claude/ directory:
  .claude/standards.md, .claude/architecture.md, .claude/current-sprint.md
- Claude reads CLAUDE.md always; reads .claude/ files when needed


## Team Scaling (when adding more developers)
- Branch naming: feature/ticket-N-description
- PR template: auto-populated from ticket (acceptance criteria as checklist)
- Issue assignment: each ticket has one owner at a time
- No two people work on the same file simultaneously
- All conventions in this file apply to every team member (human or AI)


## Design Reference
The file daily-fact-platform.jsx is the UI prototype.
Use it as the visual reference for Ticket 8 (frontend).
Design: Stripe/Apple minimal aesthetic. Tokens: Primary #0a0a0a, Accent #e05127, BG #fafaf8.
Fonts: Instrument Serif (display), DM Sans (body), JetBrains Mono (mono).


## Ticket Backlog
Full ticket detail with acceptance criteria lives in BACKLOG.md.
Read BACKLOG.md when starting a new ticket. Do not rely on memory.
Each ticket has: Title, Description, Acceptance Criteria.
Current tickets: 1-11 (build + deploy). Phase 2 tickets added later.
