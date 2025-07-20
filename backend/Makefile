.PHONY: venv install dev test lint clean format check requirements migrate seed docker-build docker-up docker-down docker-restart docker-logs docker-clean docker-stop-all

venv:
	uv venv
	@echo "Virtual environment created. Activate with: source .venv/bin/activate"

install: venv
	uv pip install -r requirements/dev.txt

dev: install
	uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

test:
	uv run pytest -v

lint:
	uv run flake8 app
	uv run isort app
	uv run black app
	uv run mypy app

clean:
	rm -rf .venv
	find . -type d -name __pycache__ -delete
	find . -type f -name "*.pyc" -delete

format:
	uv run isort app
	uv run black app

check: lint test

requirements:
	uv pip freeze > requirements.txt

# Database commands
migrate:
	uv run alembic upgrade head

seed:
	uv run python scripts/seed_agents.py

# Docker commands
docker-stop-all:
	@echo "Stopping all containers using port 8000..."
	@docker ps --filter "publish=8000" --format "table {{.ID}}\t{{.Names}}\t{{.Status}}" 2>/dev/null || true
	@docker stop $$(docker ps --filter "publish=8000" -q) 2>/dev/null || echo "No containers using port 8000"
	@echo "Checking for any remaining processes on port 8000..."
	@lsof -ti:8000 | xargs kill -9 2>/dev/null || echo "No processes found on port 8000"

docker-build:
	@echo "Building Docker image..."
	docker-compose build --no-cache

docker-clean-containers:
	@echo "Cleaning up old containers and images..."
	docker-compose down --remove-orphans 2>/dev/null || true
	docker container prune -f 2>/dev/null || true
	docker image prune -f 2>/dev/null || true

docker-up: docker-stop-all docker-clean-containers
	@echo "Starting containers..."
	docker-compose up --build -d --remove-orphans
	@echo "Containers started. View logs with: make docker-logs"

docker-down:
	@echo "Stopping containers..."
	docker-compose down --remove-orphans
	@echo "Containers stopped."

docker-restart: docker-down docker-up

docker-logs:
	docker-compose logs -f

docker-clean: docker-down
	@echo "Cleaning up Docker resources..."
	docker system prune -f
	docker volume prune -f
	docker container prune -f
	docker image prune -f
	@echo "Docker cleanup complete."

# Alternative using newer docker compose (without hyphen)
docker-up-v2: docker-stop-all docker-clean-containers
	@echo "Starting containers with Docker Compose V2..."
	docker compose up --build -d --remove-orphans
	@echo "Containers started. View logs with: make docker-logs-v2"

docker-logs-v2:
	docker compose logs -f

docker-down-v2:
	@echo "Stopping containers..."
	docker compose down --remove-orphans
	@echo "Containers stopped."

help:
	@echo "Available commands:"
	@echo ""
	@echo "Development:"
	@echo "  venv         - Create virtual environment"
	@echo "  install      - Install dependencies"
	@echo "  dev          - Run development server"
	@echo "  test         - Run tests with coverage"
	@echo "  lint         - Run all linting tools"
	@echo "  format       - Format code with isort and black"
	@echo "  check        - Run lint and test"
	@echo "  requirements - Generate requirements.txt"
	@echo "  clean        - Remove virtual environment and cache files"
	@echo ""
	@echo "Database:"
	@echo "  migrate      - Run database migrations"
	@echo "  seed         - Seed database with initial data"
	@echo ""
	@echo "Docker:"
	@echo "  docker-build           - Build Docker image"
	@echo "  docker-up              - Start containers (with cleanup)"
	@echo "  docker-up-v2           - Start containers (Docker Compose V2)"
	@echo "  docker-down            - Stop and remove containers"
	@echo "  docker-down-v2         - Stop containers (Docker Compose V2)"
	@echo "  docker-restart         - Restart containers"
	@echo "  docker-logs            - Show container logs (follow mode)"
	@echo "  docker-logs-v2         - Show logs (Docker Compose V2)"
	@echo "  docker-clean           - Clean up Docker resources"
	@echo "  docker-clean-containers- Clean up old containers/images"
	@echo "  docker-stop-all        - Stop all containers using port 8000"
	@echo ""
	@echo "  help         - Show this help message"
