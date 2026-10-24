.PHONY: help up down logs build test lint fmt dev-api dev-worker dev-web

help:            ## Show targets
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-12s %s\n", $$1, $$2}'

up:              ## Build and start everything (UI :3000, API :8000)
	docker compose up --build -d

down:            ## Stop everything (add -v to wipe data: docker compose down -v)
	docker compose down

logs:            ## Follow logs
	docker compose logs -f --tail=100 api worker event-consumer

build:           ## Rebuild images
	docker compose build

test:            ## Backend tests (needs: pip install -r backend/requirements-dev.txt)
	cd backend && python -m pytest -q

lint:            ## Lint backend + frontend
	cd backend && ruff check app tests
	cd frontend && npm run lint && npm run typecheck

fmt:             ## Auto-format backend
	cd backend && ruff check --fix app tests && ruff format app tests

dev-api:         ## Local API with reload (needs Redis: docker compose up -d redis)
	cd backend && DATA_DIR=../.data SAMPLE_DATA_DIR=../sample_data uvicorn app.main:app --reload --port 8000

dev-worker:      ## Local Celery worker
	cd backend && DATA_DIR=../.data celery -A app.workers.celery_app:celery_app worker -Q ingestion,maintenance -l INFO

dev-web:         ## Local Next.js dev server
	cd frontend && npm install && npm run dev
