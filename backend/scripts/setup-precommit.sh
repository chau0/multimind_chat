#!/bin/bash

# MultiMind Backend Pre-commit Setup Script
# This script sets up pre-commit hooks specifically for the backend Python code

set -e

echo "🚀 Setting up pre-commit hooks for MultiMind Backend ONLY..."

# Check if we're in the backend directory
if [ ! -f ".pre-commit-config.yaml" ]; then
    echo "❌ Error: .pre-commit-config.yaml not found. Please run this script from the backend/ directory."
    exit 1
fi

# Check if we're in the project root (should be in backend/)
if [ ! -f "../frontend/package.json" ]; then
    echo "❌ Error: This script should be run from the backend/ directory of the MultiMind project."
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed."
    exit 1
fi

# Install pre-commit if not already installed
if ! command -v pre-commit &> /dev/null; then
    echo "📦 Installing pre-commit..."
    # Use python -m pip to ensure we use the correct pip
    python -m pip install pre-commit
else
    echo "✅ pre-commit is already installed"
fi

# Check if we're in a virtual environment
if [[ "$VIRTUAL_ENV" != "" ]]; then
    echo "✅ Virtual environment detected: $VIRTUAL_ENV"
    echo "📦 Installing backend development dependencies..."
    # Use python -m pip to ensure we use the virtual environment's pip
    python -m pip install -r requirements/dev.txt
elif command -v uv &> /dev/null; then
    echo "📦 Installing backend development dependencies with uv..."
    uv pip install -r requirements/dev.txt
else
    echo "⚠️  No virtual environment detected and uv not found."
    echo "   Creating virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    echo "✅ Virtual environment created and activated"
    echo "📦 Installing backend development dependencies..."
    pip install -r requirements/dev.txt
    echo ""
    echo "🔔 IMPORTANT: Virtual environment created at .venv/"
    echo "   To activate it in the future, run: source .venv/bin/activate"
fi

# Install the git hook scripts
echo "🔧 Installing pre-commit hooks..."
pre-commit install

# Install commit-msg hook for commitizen
echo "📝 Installing commit-msg hook..."
pre-commit install --hook-type commit-msg

# Update hooks to latest versions
echo "🔄 Updating hooks to latest versions..."
pre-commit autoupdate

# Set up test environment for pytest in pre-commit
echo "🔧 Setting up test environment..."
if [ ! -f ".env.test" ]; then
    echo "Creating .env.test file..."
    cat > .env.test << EOF
ENVIRONMENT=test
DATABASE_URL=sqlite:///test.db
OPENAI_API_KEY=test-key
EOF
fi

# Run hooks on all backend files to ensure everything works
echo "🧪 Running pre-commit on all backend files (this may take a while)..."
echo "   This will run the same checks as the GitHub CI/CD pipeline..."
export ENVIRONMENT=test
export DATABASE_URL=sqlite:///test.db
export OPENAI_API_KEY=test-key
pre-commit run --all-files || {
    echo "⚠️  Some checks failed. This is normal for the first run."
    echo "   The hooks have been installed and will run on future commits."
    echo "   You can fix issues manually or run 'pre-commit run --all-files' again."
}

echo ""
echo "✅ Backend pre-commit setup complete!"
echo ""
echo "📋 What happens now:"
echo "   • Python code will be automatically checked before each commit"
echo "   • Black will format your Python code"
echo "   • isort will organize your imports"
echo "   • Flake8 will check for style and errors"
echo "   • MyPy will perform type checking"
echo "   • Bandit will scan for security issues"
echo "   • Failed checks will prevent the commit"
echo ""
echo "🛠️  Useful commands:"
echo "   • Run checks manually: pre-commit run --all-files"
echo "   • Format code: black ."
echo "   • Sort imports: isort ."
echo "   • Lint code: flake8 ."
echo "   • Type check: mypy ."
echo "   • Skip hooks (emergency): git commit --no-verify"
echo "   • Update hooks: pre-commit autoupdate"
echo ""
echo "🎉 Happy coding with better Python code quality!"
