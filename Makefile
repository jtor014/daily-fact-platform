.PHONY: up down logs logs-api test lint db restart clean status board issues deploy destroy rollback

up:
	docker compose up --build -d

down:
	docker compose down

logs:
	docker compose logs -f

logs-api:
	docker compose logs -f backend

test:
	docker compose exec backend pytest

lint:
	docker compose exec backend ruff check .

db:
	docker compose exec postgres psql -U postgres

restart: down up

clean:
	docker compose down -v

status:
	docker compose ps

board:
	gh project item-list 1 --owner @me

issues:
	gh issue list

deploy:
	terraform apply

destroy:
	terraform destroy

rollback:
	git revert HEAD --no-edit && git push
