#!/bin/bash

# MultiMind Frontend Pre-commit Setup Script
# This script sets up pre-commit hooks specifically for the frontend code

set -e

echo "🚀 Setting up pre-commit hooks for MultiMind Frontend ONLY..."

# Check if we're in the frontend directory
if [ ! -f ".pre-commit-config.yaml" ]; then
    echo "❌ Error: .pre-commit-config.yaml not found. Please run this script from the frontend/ directory."
    exit 1
fi

# Check if we're in the project root (should be in frontend/)
if [ ! -f "../backend/pyproject.toml" ]; then
    echo "❌ Error: This script should be run from the frontend/ directory of the MultiMind project."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is required but not installed."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is required but not installed."
    exit 1
fi

# Install pre-commit if not already installed
if ! command -v pre-commit &> /dev/null; then
    echo "📦 Installing pre-commit..."
    npm install -g pre-commit
else
    echo "✅ pre-commit is already installed"
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install the git hook scripts
echo "🔧 Installing pre-commit hooks..."
pre-commit install

# Install commit-msg hook for commitizen
echo "📝 Installing commit-msg hook..."
pre-commit install --hook-type commit-msg

# Update hooks to latest versions
echo "🔄 Updating hooks to latest versions..."
pre-commit autoupdate

# Run hooks on all frontend files to ensure everything works
echo "🧪 Running pre-commit on all frontend files (this may take a while)..."
echo "   This will run the same checks as the GitHub CI/CD pipeline..."
pre-commit run --all-files || {
    echo "⚠️  Some checks failed. This is normal for the first run."
    echo "   The hooks have been installed and will run on future commits."
    echo "   You can fix issues manually or run 'pre-commit run --all-files' again."
}

echo ""
echo "✅ Frontend pre-commit setup complete!"
echo ""
echo "📋 What happens now:"
echo "   • Frontend code will be automatically checked before each commit"
echo "   • ESLint will check TypeScript/JavaScript code"
echo "   • Prettier will format your code"
echo "   • TypeScript will be type-checked"
echo "   • Tests will run automatically"
echo "   • Build process will be verified"
echo "   • Failed checks will prevent the commit"
echo ""
echo "🛠️  Useful commands:"
echo "   • Run checks manually: pre-commit run --all-files"
echo "   • Type check: npm run check"
echo "   • Run tests: npm run test"
echo "   • Build: npm run build"
echo "   • Skip hooks (emergency): git commit --no-verify"
echo "   • Update hooks: pre-commit autoupdate"
echo ""
echo "🎉 Happy coding with better frontend code quality!"