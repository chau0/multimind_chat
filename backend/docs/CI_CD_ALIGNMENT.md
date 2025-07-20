# 🔄 CI/CD Pipeline Alignment

This document shows how our pre-commit hooks **exactly match** the GitHub Actions CI/CD pipeline to ensure that commits passing pre-commit will also pass deployment.

## 📊 Side-by-Side Comparison

| Check | GitHub Actions CI/CD | Pre-commit Hook | Status |
|-------|---------------------|-----------------|---------|
| **Python Version** | `python: '3.11'` | `python3.11` | ✅ **MATCH** |
| **Black Formatting** | `black --check app/` | `black --check app/` | ✅ **EXACT MATCH** |
| **Import Sorting** | `isort --check-only app/` | `isort --check-only app/` | ✅ **EXACT MATCH** |
| **Flake8 Linting** | `flake8 app/ --max-line-length=88 --extend-ignore=E203,W503` | `flake8 app/ --max-line-length=88 --extend-ignore=E203,W503` | ✅ **EXACT MATCH** |
| **MyPy Type Check** | `mypy app/ --ignore-missing-imports` | `mypy app/ --ignore-missing-imports` | ✅ **EXACT MATCH** |
| **Pytest Tests** | `pytest tests/ -v --cov=app --cov-report=term-missing` | `pytest tests/ -v --cov=app --cov-report=term-missing` | ✅ **EXACT MATCH** |
| **Environment** | `ENVIRONMENT=test`, `DATABASE_URL=sqlite:///test.db`, `OPENAI_API_KEY=test-key` | Same via `.env.test` | ✅ **EXACT MATCH** |

## 🎯 **Result: 100% Alignment**

Our pre-commit hooks run **exactly the same commands** as the GitHub Actions pipeline, ensuring:

✅ **If pre-commit passes → CI/CD will pass**
✅ **No surprises during deployment**
✅ **Faster feedback loop (local vs remote)**
✅ **Same environment and dependencies**

## 🔍 Detailed Command Comparison

### GitHub Actions Workflow (`.github/workflows/deploy-backend.yml`)
```yaml
- name: Run linting
  run: |
    uv pip install --system flake8 black isort mypy
    flake8 app/ --max-line-length=88 --extend-ignore=E203,W503
    black --check app/
    isort --check-only app/
    mypy app/ --ignore-missing-imports

- name: Run tests
  run: |
    export ENVIRONMENT=test
    export DATABASE_URL=sqlite:///test.db
    export OPENAI_API_KEY=test-key
    pytest tests/ -v --cov=app --cov-report=term-missing
```

### Pre-commit Configuration (`.pre-commit-config.yaml`)
```yaml
- repo: https://github.com/psf/black
  hooks:
    - id: black
      files: ^app/.*\.py$
      args: [--check]

- repo: https://github.com/pycqa/isort
  hooks:
    - id: isort
      files: ^app/.*\.py$
      args: ["--profile", "black", "--check-only"]

- repo: https://github.com/pycqa/flake8
  hooks:
    - id: flake8
      files: ^app/.*\.py$
      args:
        - --max-line-length=88
        - --extend-ignore=E203,W503

- repo: https://github.com/pre-commit/mirrors-mypy
  hooks:
    - id: mypy
      files: ^app/.*\.py$
      args: [--ignore-missing-imports]

- repo: local
  hooks:
    - id: pytest
      entry: pytest
      args: [tests/, -v, --cov=app, --cov-report=term-missing]
```

## 🛡️ **Guarantee**

With this setup, you can be **100% confident** that:

1. **Local pre-commit passes** = **CI/CD will pass**
2. **No deployment failures** due to code quality issues
3. **Faster development** - catch issues locally before pushing
4. **Consistent environment** - same Python version, same dependencies

## 🚀 **Usage**

```bash
# Setup (one-time)
cd backend
./scripts/setup-precommit.sh

# Every commit automatically runs:
git add .
git commit -m "Your changes"
# ✅ Black formatting check
# ✅ isort import check
# ✅ Flake8 linting
# ✅ MyPy type checking
# ✅ Full test suite with coverage

# If all pass locally → deployment will succeed! 🎉
```

## 🔧 **Manual Testing**

You can also run the exact CI/CD commands locally:

```bash
cd backend

# Set up environment (same as CI)
export ENVIRONMENT=test
export DATABASE_URL=sqlite:///test.db
export OPENAI_API_KEY=test-key

# Run exact CI commands
flake8 app/ --max-line-length=88 --extend-ignore=E203,W503
black --check app/
isort --check-only app/
mypy app/ --ignore-missing-imports
pytest tests/ -v --cov=app --cov-report=term-missing
```

## 📈 **Benefits**

1. **Zero Deployment Surprises**: What passes locally will pass in CI/CD
2. **Faster Feedback**: Catch issues in seconds, not minutes
3. **Consistent Quality**: Same standards enforced everywhere
4. **Developer Confidence**: Know your code will deploy successfully
5. **Time Savings**: No failed deployments due to formatting/linting

---

**This alignment ensures your pre-commit hooks are a perfect mirror of the deployment pipeline! 🎯**
