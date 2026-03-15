Ticket 1: Docker Compose & FastAPI Skeleton
First working container. Standards introduced: Container-First, Conventional Commits, Zero Trust Secrets, Structured Logging.
Acceptance Criteria:
Create docker-compose.yml to orchestrate backend and postgres services.
Create backend/Dockerfile using a slim Python 3.11+ image.
Create backend/app/main.py with a GET /api/health route.
Create db/init.sql with the facts table schema. Mount into the Postgres container.
Create Makefile with standard commands: up, down, logs, test, lint, db, restart, clean, status (see Section 7).
Create .env.example with dummy values (POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, DATABASE_URL). Commit to Git.
Create .env from the example with real local values. Add to .gitignore.
Create .gitattributes with * text=auto eol=lf to normalise line endings across WSL and macOS.
Running make up builds and starts all services; healthcheck accessible on localhost:8000.
Configure Python's logging module with structured output (timestamp, level, message). All subsequent tickets must use logging — not print().

Ticket 2: CI Pipeline with Ruff & Pytest
Standards introduced: Linting & Formatting, Test-Driven Development.
Acceptance Criteria:
Add ruff and pytest to backend dependencies.
Create .github/workflows/ci.yml targeting Pull Requests.
CI must: checkout code, setup Python, run ruff check ., and run pytest.
Ensure the FastAPI skeleton passes the linter.
Write a pytest test for the /api/health endpoint (test-first: write the test, verify it runs).
Locally, make lint and make test should pass before pushing.
TDD standard begins here: from this ticket onwards, write tests BEFORE implementation. Tests encode acceptance criteria as executable assertions.

Ticket 3: Gemini AI Reviewer & Branch Protection
The automated reviewer plus structural enforcement — GitHub itself blocks merges if checks haven't passed.
Acceptance Criteria:
Create .github/workflows/gemini-reviewer.yml.
Triggers on pull_request: [opened, synchronize].
Uses google-github-actions/gemini-code-review@v1.
Prompt instructs Gemini to check for hardcoded secrets, vulnerabilities, and best practices.
Gemini posts either "Looks good to merge" or actionable Action Required CLI commands.
Configure branch protection on main via the GitHub API (gh api):
— Require status checks to pass: ci.yml must be green before merge is possible.
— Require a review before merging: at least one review comment must exist on the PR.
— Require conversation resolution: if a review requests changes, they must be resolved.
— No direct pushes to main: all changes must go through a PR.
Verify: try to merge a PR with failing CI or no review — GitHub should block it.

➔ Check the action's README for the current recommended model string before committing.
➔ Branch protection means even if Claude ran gh pr merge, GitHub would reject it if checks haven't passed. The merge rule is enforced at the platform level, not just by convention.

Ticket 4: PostgreSQL Connection (asyncpg + Raw SQL)
Standard introduced: Strict Typing. Uses asyncpg directly — no ORM.
Acceptance Criteria:
Add asyncpg to backend dependencies.
Create a connection pool in app startup/shutdown lifecycle hooks.
Map DB credentials securely via Docker environment variables from .env.
Verify the facts table (created by init.sql in Ticket 1) is accessible from FastAPI.
Create Pydantic model for the Fact response schema with full type hints.

Ticket 5: Fact Fetcher Module (httpx)
Acceptance Criteria:
Add httpx to backend dependencies.
Create backend/app/worker/fetcher.py.
Implement an async function that GETs uselessfacts.jsph.pl/api/v2/facts/random, parses the JSON, and returns a typed Pydantic model.
Handle HTTP timeouts and exceptions gracefully (log errors, don't crash).

Ticket 6: Background Worker Scheduler
Acceptance Criteria:
Use apscheduler or a simple async background loop (FastAPI lifespan).
Job triggers every 5 minutes while the FastAPI server runs.
Job calls the fetcher from Ticket 5 and inserts the result into the facts table via asyncpg.
Duplicate facts (same fact_text) are handled gracefully (skip or upsert).

Ticket 7: GET /api/facts/random Endpoint
Acceptance Criteria:
Create a route handler in FastAPI for GET /api/facts/random.
Query Postgres: SELECT * FROM facts ORDER BY RANDOM() LIMIT 1.
Return the validated Pydantic model.
Return 404 HTTPException if the table is empty.
Add a pytest test covering both the 200 and 404 cases.

Ticket 8: React SPA in Docker & UI Design
The frontend comes to life. Use the prototype as the visual spec.
Acceptance Criteria:
Initialise a Vite + React app in frontend/ with Tailwind CSS configured.
Create frontend/Dockerfile (Node 20 slim). Update docker-compose.yml to include the frontend service (port 5173).
Add Tailwind config with the design tokens: primary #0a0a0a, accent #e05127, background #fafaf8.
Load Google Fonts in index.html: Instrument Serif (display), DM Sans (body), JetBrains Mono (mono).
Locate daily-fact-platform.jsx (provided by the Director) and use it as the design reference.
Create a FactCard component matching the prototype's markup, spacing, shadows, and hover states.
Create the "Next Fact" button with the shuffle icon, dark fill, accent hover, and loading spinner.
Create the status pill ("Worker syncing" with pulsing green dot).
Create source link component (mono font, muted, accent on hover, external-link icon).
Render with a hardcoded fact to verify everything looks right.
Add ESLint + Prettier config. make lint should pass.

Ticket 9: Connect Frontend to Backend API
The app is now end-to-end functional: user clicks a button, API serves a fact from Postgres.
Acceptance Criteria:
Configure Vite's proxy in vite.config.js to forward /api requests to the backend Docker service (avoids CORS entirely).
FactCard manages state via useState: fact (object | null), loading (boolean), error (string | null).
On mount: fetch /api/facts/random. On "Next Fact" click: fetch again.
Loading state: button shows spinner, card content fades or shows skeleton.
Error state: display a clear message if the API is unreachable or returns 404 (no facts yet).
Empty state on first load before worker has populated any facts: friendly message, not a blank screen.
Verify the full flow: make up → wait for worker to fetch first fact → click "Next Fact" → see a real fact from the database.

Ticket 10: Deploy to AWS with Terraform
The app goes live. Claude writes the infrastructure, provisions it, and deploys your containers to a real server.
Acceptance Criteria:
Create terraform/main.tf and terraform/variables.tf.
Define Terraform resources: aws_instance (t2.micro, Amazon Linux 2023), aws_security_group (HTTP 80, SSH 22), aws_key_pair (for SSH access).
Variables: aws_region, instance_type, my_ip (for SSH security group rule), key_name. All with sensible defaults.
user_data script: install Docker, Docker Compose, Git. Enable and start Docker service.
Add Terraform outputs: public_ip, ssh_command (convenience output showing the full ssh command).
Run terraform plan — review the output with the Director before applying.
After Director sign-off, run terraform apply to provision the instance.
SSH into the instance, clone the repo, copy .env, run make up — the app is live on the public IP.
Verify: open http://PUBLIC_IP in a browser — the React frontend loads and "Next Fact" works.
CRITICAL: Absolute zero hardcoded credentials. AWS credentials from aws configure locally; DB secrets from .env on the server.

➔ The t2.micro is free-tier eligible for 12 months. When you're done, Claude runs terraform destroy to tear it all down cleanly.
➔ You'll need the AWS CLI installed and configured (aws configure) on whichever machine you run Terraform from. Claude can walk you through it.

Ticket 11: Deploy-on-Merge GitHub Action
The final piece: when you sign off on a PR and Claude merges it, the live server updates automatically. This closes the full loop.
Acceptance Criteria:
Create .github/workflows/deploy.yml triggered on push to main.
Workflow steps: checkout → SSH into EC2 → cd daily-fact-platform && git pull && make up.
Use appleboy/ssh-action or equivalent for the SSH step.
Store EC2_SSH_KEY (private key) and EC2_HOST (server IP) as GitHub Secrets.
Store EC2_USER as a secret (e.g. ec2-user for Amazon Linux).
Add a health check step after deploy: curl the /api/health endpoint and fail the workflow if it doesn't return 200.
Test the full loop: Claude opens a PR with a small visible change (e.g. update the page title) → CI passes → Gemini approves → you say "merge it" → deploy action runs → refresh the browser → change is live.
CRITICAL: All secrets via GitHub Secrets. Zero credentials in code or workflow files.
