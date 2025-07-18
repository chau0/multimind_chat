.PHONY: venv install dev test lint clean format check requirements

venv:
	uv venv
	@echo "Virtual environment created. Activate with: source .venv/bin/activate"

install: venv
	uv pip install -r requirements/dev.txt

dev: install
	uv run uvicorn app.main:app --reload --port 8000

test:
	uv run pytest -v --cov=app

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

help:
	@echo "Available commands:"
	@echo "  venv        - Create virtual environment"
	@echo "  install     - Install dependencies"
	@echo "  dev         - Run development server"
	@echo "  test        - Run tests with coverage"
	@echo "  lint        - Run all linting tools"
	@echo "  format      - Format code with isort and black"
	@echo "  check       - Run lint and test"
	@echo "  requirements - Generate requirements.txt"
	@echo "  clean       - Remove virtual environment and cache files"
	@echo "  help        - Show this help message"
