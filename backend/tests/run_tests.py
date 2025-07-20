#!/usr/bin/env python3
"""
Comprehensive test runner for Multimind backend.

This script runs all unit tests with coverage reporting and provides
detailed output for CI/CD and development environments.
"""

import sys
import subprocess
import os
from pathlib import Path


def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"{'='*60}")

    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running: {command}")
        print(f"Exit code: {e.returncode}")
        print(f"STDOUT: {e.stdout}")
        print(f"STDERR: {e.stderr}")
        return False


def main():
    """Main test runner function."""
    print("🧪 Multimind Backend Test Suite")
    print("=" * 60)

    # Change to backend directory
    backend_dir = Path(__file__).parent.parent
    os.chdir(backend_dir)

    # Set test environment
    os.environ['ENVIRONMENT'] = 'test'
    os.environ['DATABASE_URL'] = 'sqlite:///test.db'
    os.environ['OPENAI_API_KEY'] = 'test-key'

    success = True

    # 1. Install dependencies
    if not run_command(
        "uv pip install -r requirements/dev.txt",
        "Installing test dependencies"
    ):
        success = False

    # 2. Run linting
    print("\n🔍 Code Quality Checks")

    # Flake8
    if not run_command(
        "flake8 app/ tests/ --max-line-length=88 --extend-ignore=E203,W503",
        "Running flake8 linting"
    ):
        print("⚠️  Linting issues found, but continuing with tests...")

    # Black formatting check
    if not run_command(
        "black --check app/ tests/",
        "Checking code formatting with black"
    ):
        print("⚠️  Formatting issues found, but continuing with tests...")

    # isort import sorting check
    if not run_command(
        "isort --check-only app/ tests/",
        "Checking import sorting with isort"
    ):
        print("⚠️  Import sorting issues found, but continuing with tests...")

    # 3. Type checking
    if not run_command(
        "mypy app/ --ignore-missing-imports",
        "Running type checking with mypy"
    ):
        print("⚠️  Type checking issues found, but continuing with tests...")

    # 4. Run unit tests with coverage
    if not run_command(
        "pytest tests/unit/ -v --cov=app --cov-report=term-missing --cov-report=html --cov-fail-under=80",
        "Running unit tests with coverage"
    ):
        success = False

    # 5. Run integration tests
    if not run_command(
        "pytest tests/integration/ -v",
        "Running integration tests"
    ):
        success = False

    # 6. Run E2E tests
    if not run_command(
        "pytest tests/e2e/ -v",
        "Running end-to-end tests"
    ):
        success = False

    # 7. Security checks (if bandit is available)
    run_command(
        "bandit -r app/ -f json -o bandit-report.json || echo 'Bandit not available'",
        "Running security checks with bandit"
    )

    # 8. Generate test report
    print("\n📊 Test Summary")
    print("=" * 60)

    if success:
        print("✅ All tests passed!")
        print("\n📈 Coverage report generated in htmlcov/index.html")
        print("🔒 Security report generated in bandit-report.json")
        return 0
    else:
        print("❌ Some tests failed!")
        return 1


if __name__ == "__main__":
    sys.exit(main())
