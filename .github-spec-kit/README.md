# GitHub Monolithic Spec Kit

**Universal GitHub governance and automation system with BOM integration**

Safely configure and sync across all repositories in:
- `@ramzimalhas` (personal)
- `@Life-Hackers-inc` (organization)
- `@Maestro-AI-Labs-LLC-FZ` (organization)

---

## 🎯 Overview

This spec kit provides:

1. **Unified Governance** - Consistent policies across all repos
2. **BOM Integration** - Automatic SBOM, CBOM, OBOM, WBOM tracking
3. **Bidirectional Sync** - Changes propagate safely in both directions
4. **Safety Mechanisms** - Dry-run, validation, rollback capabilities
5. **Telemetry** - Full observability of all operations
6. **Zero-Config** - Works out of the box with sensible defaults

---

## 🚀 Quick Start

### 1. Install Across All Repos

```bash
# Dry-run first (safe, no changes)
./scripts/install-spec-kit.sh --dry-run --all-repos

# Review the plan, then apply
./scripts/install-spec-kit.sh --apply --all-repos
```

### 2. Install on Specific Org

```bash
# Just Maestro-AI-Labs repos
./scripts/install-spec-kit.sh --apply --org Maestro-AI-Labs-LLC-FZ

# Just personal repos
./scripts/install-spec-kit.sh --apply --org ramzimalhas
```

### 3. Install on Single Repo

```bash
# Specific repo
./scripts/install-spec-kit.sh --apply --repo ramzimalhas/build-your-own-x
```

---

## 📁 Structure

```
.github-spec-kit/
├── README.md                      # This file
├── configs/
│   ├── spec-kit.config.json       # Main configuration
│   ├── repo-overrides.json        # Per-repo customizations
│   └── safety-rules.json          # Rollback and validation rules
├── workflows/
│   ├── bom-tracker.yml            # Daily BOM scans (SBOM, CBOM, OBOM, WBOM)
│   ├── security-scan.yml          # CVE scanning, Dependabot
│   ├── compliance-check.yml       # PDPL, GDPR compliance
│   ├── quality-gate.yml           # Linting, testing, coverage
│   ├── telemetry-push.yml         # Push metrics to BOM system
│   └── sync-spec-kit.yml          # Bidirectional sync
├── templates/
│   ├── .github/                   # GitHub-specific files
│   │   ├── CODEOWNERS             # Code ownership
│   │   ├── PULL_REQUEST_TEMPLATE.md
│   │   ├── ISSUE_TEMPLATE/
│   │   └── dependabot.yml         # Dependency updates
│   ├── .gitignore                 # Standard ignores
│   ├── .editorconfig              # Editor settings
│   └── LICENSE                    # Default license (MIT)
├── policies/
│   ├── branch-protection.json     # Branch rules (main, develop, etc.)
│   ├── required-checks.json       # CI/CD requirements
│   ├── security-policy.json       # Security settings
│   └── merge-rules.json           # PR merge requirements
└── scripts/
    ├── install-spec-kit.sh        # Installation script
    ├── validate-config.sh         # Config validation
    ├── sync-repos.sh              # Bidirectional sync
    ├── rollback.sh                # Safe rollback
    └── telemetry-collector.sh     # Metrics collection
```

---

## ⚙️ Configuration

### Main Config (`configs/spec-kit.config.json`)

```json
{
  "version": "1.0.0",
  "organizations": {
    "ramzimalhas": {
      "type": "personal",
      "default_visibility": "public",
      "default_branch": "main",
      "apply_to": "all",
      "exclude_repos": []
    },
    "Life-Hackers-inc": {
      "type": "organization",
      "default_visibility": "private",
      "default_branch": "main",
      "apply_to": "all",
      "exclude_repos": ["archive-*"]
    },
    "Maestro-AI-Labs-LLC-FZ": {
      "type": "organization",
      "default_visibility": "private",
      "default_branch": "main",
      "apply_to": "all",
      "exclude_repos": []
    }
  },

  "features": {
    "bom_tracking": {
      "enabled": true,
      "types": ["sbom", "abom", "pbom", "hbom", "ibom", "dbom", "cbom", "obom", "wbom"],
      "frequency": "daily",
      "alert_on_changes": true
    },
    "security_scanning": {
      "enabled": true,
      "dependabot": true,
      "code_scanning": true,
      "secret_scanning": true
    },
    "compliance": {
      "enabled": true,
      "jurisdictions": ["UAE", "EU", "US"],
      "privacy_score_threshold": 85
    },
    "quality_gates": {
      "enabled": true,
      "linting": true,
      "testing": true,
      "coverage_threshold": 80
    },
    "telemetry": {
      "enabled": true,
      "endpoint": "https://telemetry.maestro.ae/api/v1/ingest",
      "push_frequency": "hourly"
    }
  },

  "branch_protection": {
    "main": {
      "required_reviews": 1,
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": true,
      "required_status_checks": [
        "ci",
        "security-scan",
        "bom-tracker",
        "compliance-check"
      ],
      "enforce_admins": false,
      "allow_force_pushes": false,
      "allow_deletions": false
    },
    "develop": {
      "required_reviews": 0,
      "dismiss_stale_reviews": false,
      "require_code_owner_reviews": false,
      "required_status_checks": ["ci"],
      "enforce_admins": false,
      "allow_force_pushes": true,
      "allow_deletions": false
    }
  },

  "pr_requirements": {
    "require_linear_issue": true,
    "require_description": true,
    "require_changelog": true,
    "block_on_failed_checks": true,
    "require_bom_update": true
  },

  "sync_config": {
    "bidirectional": true,
    "conflict_resolution": "manual",
    "auto_create_pr": true,
    "sync_frequency": "weekly"
  },

  "safety": {
    "dry_run_first": true,
    "require_approval": true,
    "max_repos_per_batch": 10,
    "rollback_on_failure": true,
    "validation_required": true
  }
}
```

---

## 🔄 Workflows

### 1. BOM Tracker (`workflows/bom-tracker.yml`)

Automatically tracks all 9 BOM types daily:

```yaml
name: BOM Tracker
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:

jobs:
  track-boms:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run SBOM scan
        run: |
          node ../meta-templates/query-runner.js sbom_audit \
            --repo ${{ github.repository }} \
            --format json > sbom-report.json

      - name: Check for CVEs
        run: |
          if grep -q "CRITICAL\|HIGH" sbom-report.json; then
            echo "🚨 Critical vulnerabilities found!"
            gh issue create \
              --title "🔒 Security: CVEs in dependencies" \
              --body "$(cat sbom-report.json)" \
              --label security,urgent
          fi

      - name: Run CBOM compliance check
        run: |
          node ../meta-templates/query-runner.js cbom_compliance \
            --jurisdiction UAE \
            --format json > cbom-report.json

      - name: Run OBOM metrics
        run: |
          node ../meta-templates/query-runner.js obom_metrics \
            --service ${{ github.repository }} \
            --format json > obom-report.json

      - name: Run WBOM pipeline health
        run: |
          node ../meta-templates/query-runner.js wbom_pipelines \
            --workflows ${{ github.repository }} \
            --format json > wbom-report.json

      - name: Push to telemetry
        run: |
          curl -X POST https://telemetry.maestro.ae/api/v1/ingest \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer ${{ secrets.TELEMETRY_TOKEN }}" \
            -d @combined-bom-report.json
```

### 2. Security Scan (`workflows/security-scan.yml`)

```yaml
name: Security Scan
on:
  push:
    branches: [main, develop]
  pull_request:
  schedule:
    - cron: '0 6 * * *'

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          severity: 'CRITICAL,HIGH'

      - name: Run SBOM audit
        run: node ../meta-templates/query-runner.js sbom_audit

      - name: Check secrets
        uses: trufflesecurity/trufflehog@main
```

### 3. Compliance Check (`workflows/compliance-check.yml`)

```yaml
name: Compliance Check
on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly on Monday
  workflow_dispatch:

jobs:
  compliance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check UAE PDPL
        run: |
          node ../meta-templates/query-runner.js cbom_compliance \
            --jurisdiction UAE \
            --format markdown > uae-compliance.md

      - name: Check GDPR
        run: |
          node ../meta-templates/query-runner.js cbom_compliance \
            --jurisdiction EU \
            --format markdown > eu-compliance.md

      - name: Generate report
        run: |
          cat uae-compliance.md eu-compliance.md > compliance-report.md

      - name: Create issue if non-compliant
        if: failure()
        run: |
          gh issue create \
            --title "⚖️ Compliance: Issues found" \
            --body "$(cat compliance-report.md)" \
            --label compliance,urgent
```

---

## 🔐 Safety Mechanisms

### 1. Dry-Run Mode

All operations support dry-run to preview changes:

```bash
# See what would happen without making changes
./scripts/install-spec-kit.sh --dry-run --all-repos

# Output:
# DRY RUN: Would install workflows to:
#   - ramzimalhas/build-your-own-x
#   - ramzimalhas/project-a
#   - Life-Hackers-inc/product-b
#   - Maestro-AI-Labs-LLC-FZ/maestro-backend
# Total: 47 repos
# Affected files: .github/workflows/* (5 files per repo)
```

### 2. Validation

Automatic validation before any changes:

```bash
# Validates all configs
./scripts/validate-config.sh

# Checks:
# ✅ JSON schema valid
# ✅ All referenced workflows exist
# ✅ No circular dependencies
# ✅ Branch protection rules valid
# ✅ Required secrets available
```

### 3. Rollback

Safe rollback if anything goes wrong:

```bash
# Rollback last installation
./scripts/rollback.sh --last

# Rollback specific batch
./scripts/rollback.sh --batch batch-2024-02-01-14-30

# Rollback specific repos
./scripts/rollback.sh --repos "ramzimalhas/repo-a,Life-Hackers-inc/repo-b"
```

### 4. Phased Rollout

Install in batches with validation between:

```bash
# Install to 10% of repos first
./scripts/install-spec-kit.sh --apply --all-repos --phased 10

# If successful, continue to next 20%
./scripts/install-spec-kit.sh --apply --all-repos --phased 20

# Or abort if issues found
./scripts/rollback.sh --last
```

---

## 🔄 Bidirectional Sync

### How It Works

1. **Local Changes → GitHub:**
   - Edit files in `.github-spec-kit/`
   - Run `./scripts/sync-repos.sh --push`
   - Creates PRs in all target repos

2. **GitHub → Local:**
   - Repos can override configs via `.github/spec-kit-overrides.json`
   - Run `./scripts/sync-repos.sh --pull`
   - Fetches and merges overrides

3. **Conflict Resolution:**
   - Manual: Creates issue for human review
   - Auto: Uses priority rules (local > remote for policies, remote > local for metrics)

### Example: Push Changes

```bash
# 1. Edit local config
vim .github-spec-kit/configs/spec-kit.config.json

# 2. Validate
./scripts/validate-config.sh

# 3. Dry-run sync
./scripts/sync-repos.sh --push --dry-run

# 4. Apply to all repos
./scripts/sync-repos.sh --push --all-repos

# Output:
# Creating PRs in 47 repos...
# ✅ ramzimalhas/build-your-own-x: PR #42 created
# ✅ Life-Hackers-inc/product-a: PR #18 created
# ✅ Maestro-AI-Labs-LLC-FZ/maestro-backend: PR #7 created
# ...
# Done! 47 PRs created, 0 conflicts
```

### Example: Pull Overrides

```bash
# Fetch repo-specific overrides
./scripts/sync-repos.sh --pull --all-repos

# Output:
# Fetching overrides from 47 repos...
# ✅ maestro-backend: Increased coverage_threshold to 90%
# ✅ project-a: Disabled telemetry (privacy-sensitive)
# ⚠️  project-b: Conflicting branch protection rule (manual review needed)
# ...
# Done! 45 synced, 2 conflicts (created issues)
```

---

## 📊 Telemetry

### What's Tracked

All operations send telemetry to centralized endpoint:

```json
{
  "timestamp": "2024-02-01T14:30:00Z",
  "event": "spec_kit_install",
  "repo": "ramzimalhas/build-your-own-x",
  "org": "ramzimalhas",
  "success": true,
  "duration_ms": 3420,
  "files_changed": 12,
  "workflows_added": 5,
  "bom_types": ["sbom", "cbom", "obom", "wbom"],
  "metadata": {
    "dry_run": false,
    "validation_passed": true,
    "user": "ramzimalhas"
  }
}
```

### Aggregated Metrics

Query telemetry via BOM system:

```bash
# Get OBOM metrics for all GitHub operations
node query-runner.js obom_metrics --service github-spec-kit --days 30

# Output:
{
  "total_installations": 47,
  "success_rate": 0.98,
  "avg_duration_ms": 3200,
  "total_prs_created": 134,
  "total_issues_created": 8,
  "bom_scans": {
    "sbom": 47,
    "cbom": 47,
    "obom": 47,
    "wbom": 47
  },
  "cost_usd": 0  # GitHub Actions free tier
}
```

---

## 🎯 Per-Repo Overrides

Repos can override global config via `.github/spec-kit-overrides.json`:

```json
{
  "branch_protection": {
    "main": {
      "required_reviews": 2  // Override: require 2 reviews instead of 1
    }
  },
  "features": {
    "telemetry": {
      "enabled": false  // Override: disable telemetry for this repo
    }
  },
  "pr_requirements": {
    "require_linear_issue": false  // Override: don't require Linear issue
  }
}
```

Overrides are:
- **Validated** before application
- **Synced bidirectionally** (local config updated if valid)
- **Versioned** (changes tracked in git)
- **Reviewable** (overrides create PRs to spec-kit repo)

---

## 🚢 Deployment Strategy

### Phase 1: Pilot (Week 1)

```bash
# Install on 3 pilot repos
./scripts/install-spec-kit.sh --apply \
  --repos "ramzimalhas/build-your-own-x,Life-Hackers-inc/test-repo,Maestro-AI-Labs-LLC-FZ/maestro-docs"

# Monitor for 1 week
# Review BOM reports, telemetry, PR throughput
```

### Phase 2: Staged Rollout (Weeks 2-4)

```bash
# Week 2: 10% of repos (5 repos)
./scripts/install-spec-kit.sh --apply --all-repos --phased 10

# Week 3: 50% of repos (24 repos)
./scripts/install-spec-kit.sh --apply --all-repos --phased 50

# Week 4: 100% of repos (47 repos)
./scripts/install-spec-kit.sh --apply --all-repos --phased 100
```

### Phase 3: Continuous Sync (Ongoing)

```bash
# Weekly sync (via cron or GitHub Actions)
./scripts/sync-repos.sh --push --all-repos
./scripts/sync-repos.sh --pull --all-repos
```

---

## 🔧 Maintenance

### Weekly Tasks

```bash
# 1. Update BOM reports
./scripts/telemetry-collector.sh --all-repos

# 2. Review security issues
gh issue list --label security --repo <all-repos>

# 3. Sync overrides
./scripts/sync-repos.sh --pull --all-repos
```

### Monthly Tasks

```bash
# 1. Update workflows to latest versions
git pull origin main
./scripts/sync-repos.sh --push --all-repos

# 2. Review compliance
node query-runner.js cbom_compliance --jurisdiction UAE --all-repos

# 3. Audit permissions
./scripts/audit-permissions.sh
```

---

## 📈 Success Metrics

Track adoption and health:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Repos with spec-kit | 100% | `gh repo list --json name,hasIssues` |
| BOM scan success rate | >98% | OBOM query on `bom-tracker` workflow |
| Security issues resolved | <7 days | GitHub Issues API |
| Compliance score | >90 | CBOM query across all repos |
| PR merge time | <24 hours | GitHub API `pull_requests` |

---

## 🎓 Examples

### Example 1: Install on Personal Repos

```bash
# All personal repos
./scripts/install-spec-kit.sh --apply --org ramzimalhas

# Output:
# Installing spec-kit on ramzimalhas repos...
# ✅ ramzimalhas/build-your-own-x
# ✅ ramzimalhas/project-a
# ✅ ramzimalhas/dotfiles
# Done! 3 repos updated
```

### Example 2: Install on Maestro Org

```bash
# All Maestro repos
./scripts/install-spec-kit.sh --apply --org Maestro-AI-Labs-LLC-FZ

# Output:
# Installing spec-kit on Maestro-AI-Labs-LLC-FZ repos...
# ✅ Maestro-AI-Labs-LLC-FZ/maestro-backend
# ✅ Maestro-AI-Labs-LLC-FZ/maestro-mobile
# ✅ Maestro-AI-Labs-LLC-FZ/maestro-ar
# Done! 3 repos updated
```

### Example 3: Security Audit Across All Repos

```bash
# Run SBOM audit on all repos
for repo in $(gh repo list --limit 1000 --json name -q '.[].name'); do
  node query-runner.js sbom_audit --repo $repo
done

# Aggregate results
node query-runner.js sbom_audit --all-repos --aggregate
```

---

## ❓ FAQ

**Q: What happens if a repo already has workflows?**
A: Existing workflows are preserved. Spec-kit adds new files with `spec-kit-` prefix.

**Q: Can I disable features for specific repos?**
A: Yes, use `.github/spec-kit-overrides.json` in the repo.

**Q: How do I rollback a bad deployment?**
A: Run `./scripts/rollback.sh --last` to undo the last batch.

**Q: Does this work with private repos?**
A: Yes, requires a GitHub token with `repo` scope.

**Q: How are secrets managed?**
A: Secrets are stored in GitHub Secrets, never in configs.

**Q: What if two repos have conflicting overrides?**
A: Conflicts create issues for manual review. No automatic resolution.

---

## 🔗 Integration with BOM System

This spec-kit is fully integrated with the BOM meta-template:

```bash
# SBOM: Track dependencies across all repos
node query-runner.js sbom_audit --all-repos

# CBOM: Check compliance across all repos
node query-runner.js cbom_compliance --all-repos

# OBOM: Monitor GitHub Actions costs
node query-runner.js obom_metrics --service github-actions

# WBOM: Track workflow health
node query-runner.js wbom_pipelines --all-repos
```

---

## 📞 Support

**Issues?** Run diagnostics:
```bash
./scripts/validate-config.sh
./scripts/test-connectivity.sh
```

**Need help?** Check logs:
```bash
tail -f ~/.github-spec-kit/logs/install.log
```

---

## ✅ Next Steps

1. **Review config:** Edit `configs/spec-kit.config.json` for your needs
2. **Dry-run:** Test on pilot repos first
3. **Deploy:** Roll out in phases (10% → 50% → 100%)
4. **Monitor:** Watch BOM reports and telemetry
5. **Iterate:** Adjust based on feedback

**Status:** ✅ Ready for deployment across all 47 repos
