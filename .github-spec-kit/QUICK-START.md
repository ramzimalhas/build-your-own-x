# GitHub Spec Kit - Quick Start

**Get up and running in 5 minutes**

---

## Step 1: Prerequisites

```bash
# Install GitHub CLI
brew install gh  # macOS
# or: https://cli.github.com/

# Authenticate
gh auth login

# Install jq (JSON processor)
brew install jq  # macOS

# Verify
gh --version
jq --version
```

---

## Step 2: Configure

Edit `.github-spec-kit/configs/spec-kit.config.json`:

```json
{
  "organizations": {
    "ramzimalhas": {
      "apply_to": "all",
      "exclude_repos": ["archive-*"]  // Add repos to exclude
    },
    "Life-Hackers-inc": {
      "apply_to": "all"
    },
    "Maestro-AI-Labs-LLC-FZ": {
      "apply_to": "all"
    }
  }
}
```

---

## Step 3: Dry-Run Test

**Test on 1 repo first:**

```bash
cd .github-spec-kit

# Dry-run on current repo
./scripts/install-spec-kit.sh --dry-run --repo ramzimalhas/build-your-own-x

# Review output:
# DRY RUN: Would install on ramzimalhas/build-your-own-x
#   - .github/workflows/bom-tracker.yml
#   - .github/workflows/security-scan.yml
#   - .github/workflows/compliance-check.yml
#   - .github/workflows/quality-gate.yml
#   - .github/workflows/telemetry-push.yml
```

---

## Step 4: Install on Pilot Repo

**Apply to 1 repo to test:**

```bash
./scripts/install-spec-kit.sh --apply --repo ramzimalhas/build-your-own-x

# Output:
# Installing on ramzimalhas/build-your-own-x...
#   Cloning ramzimalhas/build-your-own-x...
#   Creating branch spec-kit/install-20240201-143000...
#   Copying workflows...
#   Committing changes...
#   Creating PR...
# ✓ PR created for ramzimalhas/build-your-own-x

# Check PR:
gh pr view --web --repo ramzimalhas/build-your-own-x
```

---

## Step 5: Review & Merge

1. **Review PR** on GitHub
2. **Check workflows** are valid
3. **Add secrets** (if needed):
   ```bash
   gh secret set TELEMETRY_TOKEN --repo ramzimalhas/build-your-own-x
   gh secret set SLACK_WEBHOOK_URL --repo ramzimalhas/build-your-own-x
   ```
4. **Merge PR**
5. **Watch first workflow run**:
   ```bash
   gh run list --repo ramzimalhas/build-your-own-x
   ```

---

## Step 6: Roll Out to All Repos

**Once pilot is successful:**

### Option A: All Repos at Once

```bash
./scripts/install-spec-kit.sh --apply --all-repos
```

### Option B: Phased Rollout (Recommended)

```bash
# Week 1: 10% (5 repos)
./scripts/install-spec-kit.sh --apply --all-repos --phased 10

# Week 2: 50% (25 repos)
./scripts/install-spec-kit.sh --apply --all-repos --phased 50

# Week 3: 100% (all repos)
./scripts/install-spec-kit.sh --apply --all-repos --phased 100
```

### Option C: Per Organization

```bash
# Personal repos first
./scripts/install-spec-kit.sh --apply --org ramzimalhas

# Then Life-Hackers
./scripts/install-spec-kit.sh --apply --org Life-Hackers-inc

# Finally Maestro
./scripts/install-spec-kit.sh --apply --org Maestro-AI-Labs-LLC-FZ
```

---

## Step 7: Monitor

### Check BOM Reports

```bash
# SBOM: Dependencies & CVEs
node ../meta-templates/query-runner.js sbom_audit --all-repos

# CBOM: Compliance status
node ../meta-templates/query-runner.js cbom_compliance --jurisdiction UAE --all-repos

# OBOM: Performance & costs
node ../meta-templates/query-runner.js obom_metrics --all-repos

# WBOM: Workflow health
node ../meta-templates/query-runner.js wbom_pipelines --all-repos
```

### Check PRs

```bash
# List all spec-kit PRs
gh pr list --search 'author:@me [spec-kit]' --limit 100

# Check PR status
gh pr status
```

### Check Workflow Runs

```bash
# List recent workflow runs
gh run list --limit 50

# Watch specific workflow
gh run watch <run-id>
```

---

## Troubleshooting

### Issue: PRs not created

**Check auth:**
```bash
gh auth status

# Re-authenticate if needed
gh auth login
```

### Issue: Workflows failing

**Check secrets:**
```bash
gh secret list --repo <owner/repo>

# Add missing secrets
gh secret set TELEMETRY_TOKEN --repo <owner/repo>
```

### Issue: Config invalid

**Validate:**
```bash
./scripts/validate-config.sh

# Fix JSON errors
jq empty configs/spec-kit.config.json
```

### Issue: Need to rollback

```bash
# Rollback last installation
./scripts/rollback.sh --last

# Rollback specific repos
./scripts/rollback.sh --repos "owner/repo1,owner/repo2"
```

---

## Next Steps

1. **Customize config** for your needs
2. **Set up telemetry endpoint** (or disable in config)
3. **Configure Slack notifications** (optional)
4. **Schedule weekly syncs** (to pull overrides from repos)
5. **Review first BOM reports** and create issues as needed

---

## Common Tasks

### Update Workflows Across All Repos

```bash
# Edit workflows locally
vim .github-spec-kit/workflows/bom-tracker.yml

# Validate
./scripts/validate-config.sh

# Sync to all repos (creates PRs)
./scripts/sync-repos.sh --push --all-repos
```

### Pull Repo Overrides

```bash
# Fetch customizations from repos
./scripts/sync-repos.sh --pull --all-repos

# Review changes
git diff configs/
```

### Disable Feature for Specific Repo

**In the repo, create `.github/spec-kit-overrides.json`:**

```json
{
  "features": {
    "telemetry": {
      "enabled": false
    }
  }
}
```

---

## Support

**Questions?**
- Check [README.md](./README.md) for full documentation
- Review [configs/spec-kit.config.json](./configs/spec-kit.config.json) for all options

**Issues?**
- Run diagnostics: `./scripts/validate-config.sh`
- Check logs: `tail -f ~/.github-spec-kit/logs/install.log`

---

## Success Metrics

After 1 week, check:

- ✅ All repos have spec-kit PRs
- ✅ BOM scans running daily
- ✅ No critical CVEs >7 days old
- ✅ Compliance score >85
- ✅ Workflow success rate >95%

**Congrats! Your GitHub repos are now fully governed with BOM tracking!** 🎉
