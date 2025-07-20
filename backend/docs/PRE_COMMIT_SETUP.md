# 🔧 Backend Pre-commit Setup Guide

This guide will help you set up pre-commit hooks specifically for the MultiMind backend to ensure Python code quality and consistency.

## 🎯 What Pre-commit Does for Backend

Pre-commit hooks automatically run checks before each commit to:
- ✅ **Format Python code** with Black
- ✅ **Sort imports** with isort
- ✅ **Lint code** with Flake8
- ✅ **Type check** with MyPy
- ✅ **Security scan** with Bandit
- ✅ **Detect secrets** to prevent credential leaks
- ✅ **Validate files** (JSON, YAML, TOML)
- ✅ **Check Docker files** with Hadolint

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

```bash
# From the backend directory
cd backend
./scripts/setup-precommit.sh
```

### Option 2: Manual Setup

```bash
cd backend

# Install pre-commit
pip install pre-commit

# Install development dependencies
pip install -r requirements/dev.txt

# Install the hooks
pre-commit install
pre-commit install --hook-type commit-msg

# Run on all files initially
pre-commit run --all-files
```

## 🔍 What Gets Checked

### Python Code Quality
- **Black**: Automatic code formatting (line length: 88)
- **isort**: Import sorting and organization
- **Flake8**: Style guide enforcement (PEP 8) and error detection
- **MyPy**: Static type checking

### Security & Safety
- **Bandit**: Security vulnerability scanning
- **detect-secrets**: Prevents committing API keys, passwords, etc.

### File Quality
- **Trailing whitespace**: Removes extra spaces
- **End of file**: Ensures files end with newline
- **File validation**: Checks YAML, JSON, TOML syntax

### Docker
- **Hadolint**: Dockerfile best practices and linting

## 🛠️ Configuration Files

```
backend/
├── .pre-commit-config.yaml    # Pre-commit hook configuration
├── .secrets.baseline          # Secret detection baseline
├── .flake8                    # Python linting rules
├── pyproject.toml             # Python project config (Black, isort, MyPy)
└── scripts/setup-precommit.sh # Setup script
```

## 🚦 How It Works

### Before Each Commit
1. You run `git commit` from anywhere in the repository
2. Pre-commit detects backend Python file changes
3. Runs all configured hooks on changed files
4. Auto-fixes formatting issues (Black, isort)
5. Reports any remaining issues
6. Blocks commit if critical issues found

### Example Workflow
```bash
# Make changes to Python files
git add app/services/chat_service.py

# Attempt to commit
git commit -m "Update chat service"

# Pre-commit runs automatically:
# ✅ Black formats the code
# ✅ isort organizes imports
# ✅ Flake8 checks style
# ✅ MyPy checks types
# ❌ If issues found, commit is blocked

# Fix any remaining issues, then:
git add .  # Stage auto-fixed files
git commit -m "Update chat service"  # Commit again
```

## 🎛️ Useful Commands

### Manual Code Quality Checks
```bash
cd backend

# Format code
black .                    # Format all Python files
black app/services/        # Format specific directory
black app/main.py          # Format specific file

# Sort imports
isort .                    # Sort all imports
isort app/services/        # Sort specific directory

# Lint code
flake8 .                   # Lint all files
flake8 app/services/       # Lint specific directory

# Type checking
mypy .                     # Type check all files
mypy app/services/         # Type check specific directory

# Security scanning
bandit -r .                # Scan for security issues
```

### Pre-commit Commands
```bash
# Run all hooks manually
pre-commit run --all-files

# Run specific hook
pre-commit run black
pre-commit run flake8
pre-commit run mypy

# Run on specific files
pre-commit run --files app/main.py app/config.py

# Update hooks to latest versions
pre-commit autoupdate

# Skip hooks (emergency only)
git commit --no-verify -m "Emergency fix"

# Skip specific hook
SKIP=mypy git commit -m "Skip type checking"
```

## 🐛 Troubleshooting

### Common Issues

1. **Pre-commit not running**
   ```bash
   # Reinstall hooks
   cd backend
   pre-commit install
   ```

2. **Black/isort conflicts**
   ```bash
   # Both tools are configured to work together
   # Run both to fix formatting
   black .
   isort .
   ```

3. **MyPy type errors**
   ```bash
   # Install type stubs
   pip install types-requests types-python-dateutil

   # Or ignore specific errors temporarily
   # Add # type: ignore comment
   ```

4. **Flake8 line length errors**
   ```bash
   # Black handles line length (88 chars)
   # If you see E501 errors, run black first
   black .
   ```

5. **Bandit security warnings**
   ```bash
   # Review the warnings carefully
   # Add # nosec comment if false positive
   # Example: password = "test"  # nosec B105
   ```

### Performance Issues

If pre-commit is slow:
```bash
# Run only essential hooks for quick commits
SKIP=mypy,bandit git commit -m "Quick fix"

# Or run hooks in parallel (if supported)
pre-commit run --all-files --show-diff-on-failure
```

## 📋 Hook Details

### Code Formatting
- **black**: Formats Python code to consistent style (88 char line length)
- **isort**: Sorts imports alphabetically and by type

### Code Quality
- **flake8**: Checks PEP 8 compliance, finds errors, measures complexity
- **mypy**: Static type checking for better code reliability

### Security
- **bandit**: Scans for common security issues in Python code
- **detect-secrets**: Prevents committing API keys, passwords, tokens

### File Quality
- **trailing-whitespace**: Removes trailing spaces
- **end-of-file-fixer**: Ensures files end with newline
- **check-yaml/json/toml**: Validates configuration files

## ✅ Benefits

✅ **Consistent Style**: All Python code follows the same formatting
✅ **Early Error Detection**: Catch issues before they reach CI/CD
✅ **Security**: Prevent accidental credential commits
✅ **Type Safety**: Catch type-related bugs early
✅ **Automation**: Many issues are auto-fixed
✅ **Team Collaboration**: Everyone follows the same standards
✅ **Deployment Guarantee**: If pre-commit passes → CI/CD will pass

## 🔄 CI/CD Pipeline Alignment

Our pre-commit hooks run **exactly the same commands** as the GitHub Actions deployment pipeline:

| Check | Pre-commit | CI/CD | Status |
|-------|------------|-------|---------|
| Black | `black --check app/` | `black --check app/` | ✅ **EXACT MATCH** |
| isort | `isort --check-only app/` | `isort --check-only app/` | ✅ **EXACT MATCH** |
| Flake8 | `flake8 app/ --max-line-length=88 --extend-ignore=E203,W503` | Same | ✅ **EXACT MATCH** |
| MyPy | `mypy app/ --ignore-missing-imports` | Same | ✅ **EXACT MATCH** |
| Tests | `pytest tests/ -v --cov=app --cov-report=term-missing` | Same | ✅ **EXACT MATCH** |

**Result**: If your commit passes pre-commit → deployment will succeed! 🎯

See [CI_CD_ALIGNMENT.md](CI_CD_ALIGNMENT.md) for detailed comparison.

## 📚 Configuration Reference

### .pre-commit-config.yaml
Main configuration file defining which hooks to run and their settings.

### .flake8
Flake8 configuration:
- Max line length: 88 (matches Black)
- Ignores: E203, W503 (Black compatibility)
- Excludes: migrations, __pycache__, .venv

### pyproject.toml
Tool configurations:
- **Black**: Line length 88, Python 3.11 target
- **isort**: Black-compatible profile
- **MyPy**: Strict type checking with reasonable defaults

---

**Need help?** Check the [pre-commit documentation](https://pre-commit.com/) or the main project README!
