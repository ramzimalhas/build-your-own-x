#!/bin/bash

set -euo pipefail

# GitHub Spec Kit Installer
# Safely installs and configures GitHub spec kit across repositories

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$ROOT_DIR/configs/spec-kit.config.json"

# Default values
DRY_RUN=false
ALL_REPOS=false
ORG=""
REPOS=()
PHASED_PERCENT=100
APPROVE=false

# Usage
usage() {
  cat <<EOF
Usage: $0 [OPTIONS]

Install GitHub spec kit across repositories safely.

OPTIONS:
  --dry-run              Preview changes without applying (default: false)
  --apply                Apply changes (requires explicit flag)
  --all-repos            Install on all repos across all orgs
  --org <name>           Install on specific org (ramzimalhas, Life-Hackers-inc, Maestro-AI-Labs-LLC-FZ)
  --repo <owner/name>    Install on specific repo (can specify multiple)
  --phased <percent>     Phased rollout (10, 20, 50, 100)
  --approve              Skip approval prompt (use with caution)
  --help                 Show this help message

EXAMPLES:
  # Dry-run on all repos
  $0 --dry-run --all-repos

  # Apply to specific org
  $0 --apply --org Maestro-AI-Labs-LLC-FZ

  # Apply to specific repos
  $0 --apply --repo ramzimalhas/build-your-own-x --repo Life-Hackers-inc/project-a

  # Phased rollout (10% first)
  $0 --apply --all-repos --phased 10

EOF
  exit 1
}

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --apply)
      DRY_RUN=false
      shift
      ;;
    --all-repos)
      ALL_REPOS=true
      shift
      ;;
    --org)
      ORG="$2"
      shift 2
      ;;
    --repo)
      REPOS+=("$2")
      shift 2
      ;;
    --phased)
      PHASED_PERCENT="$2"
      shift 2
      ;;
    --approve)
      APPROVE=true
      shift
      ;;
    --help)
      usage
      ;;
    *)
      echo -e "${RED}Error: Unknown option $1${NC}"
      usage
      ;;
  esac
done

# Validate config
echo -e "${BLUE}Validating configuration...${NC}"
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo -e "${RED}Error: Config file not found: $CONFIG_FILE${NC}"
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo -e "${RED}Error: jq is required but not installed${NC}"
  exit 1
fi

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo -e "${RED}Error: GitHub CLI (gh) is required but not installed${NC}"
  exit 1
fi

# Validate JSON
if ! jq empty "$CONFIG_FILE" 2>/dev/null; then
  echo -e "${RED}Error: Invalid JSON in config file${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Configuration valid${NC}"

# Get list of target repos
get_target_repos() {
  local target_repos=()

  if [[ "$ALL_REPOS" == true ]]; then
    # Get all orgs from config
    local orgs=$(jq -r '.organizations | keys[]' "$CONFIG_FILE")

    for org in $orgs; do
      echo -e "${BLUE}Fetching repos for org: $org${NC}"

      # Get repos from GitHub
      local repos=$(gh repo list "$org" --limit 1000 --json name -q '.[].name')

      # Get exclusions from config
      local exclusions=$(jq -r ".organizations[\"$org\"].exclude_repos[]" "$CONFIG_FILE" 2>/dev/null || echo "")

      for repo in $repos; do
        local full_name="$org/$repo"

        # Check if excluded
        local excluded=false
        for pattern in $exclusions; do
          if [[ "$repo" == $pattern ]]; then
            excluded=true
            break
          fi
        done

        if [[ "$excluded" == false ]]; then
          target_repos+=("$full_name")
        fi
      done
    done
  elif [[ -n "$ORG" ]]; then
    # Specific org
    echo -e "${BLUE}Fetching repos for org: $ORG${NC}"

    local repos=$(gh repo list "$ORG" --limit 1000 --json name -q '.[].name')
    local exclusions=$(jq -r ".organizations[\"$ORG\"].exclude_repos[]" "$CONFIG_FILE" 2>/dev/null || echo "")

    for repo in $repos; do
      local full_name="$ORG/$repo"

      local excluded=false
      for pattern in $exclusions; do
        if [[ "$repo" == $pattern ]]; then
          excluded=true
          break
        fi
      done

      if [[ "$excluded" == false ]]; then
        target_repos+=("$full_name")
      fi
    done
  else
    # Specific repos
    target_repos=("${REPOS[@]}")
  fi

  # Apply phased rollout
  if [[ "$PHASED_PERCENT" -lt 100 ]]; then
    local total=${#target_repos[@]}
    local subset_size=$((total * PHASED_PERCENT / 100))
    echo -e "${YELLOW}Phased rollout: $subset_size of $total repos ($PHASED_PERCENT%)${NC}"
    target_repos=("${target_repos[@]:0:$subset_size}")
  fi

  echo "${target_repos[@]}"
}

# Install spec kit on a single repo
install_on_repo() {
  local repo=$1

  echo -e "${BLUE}Installing on $repo...${NC}"

  if [[ "$DRY_RUN" == true ]]; then
    echo -e "${YELLOW}[DRY RUN] Would install on $repo${NC}"
    return 0
  fi

  # Clone or use existing repo
  local repo_dir="/tmp/spec-kit-install/$repo"
  mkdir -p "$(dirname "$repo_dir")"

  if [[ ! -d "$repo_dir/.git" ]]; then
    echo "  Cloning $repo..."
    gh repo clone "$repo" "$repo_dir" -- --depth=1 || {
      echo -e "${RED}  Failed to clone $repo${NC}"
      return 1
    }
  fi

  cd "$repo_dir"

  # Create feature branch
  local branch="spec-kit/install-$(date +%Y%m%d-%H%M%S)"
  git checkout -b "$branch"

  # Copy workflows
  mkdir -p .github/workflows
  cp -r "$ROOT_DIR/workflows/"* .github/workflows/

  # Copy templates
  cp -r "$ROOT_DIR/templates/.github/"* .github/ 2>/dev/null || true

  # Add .gitignore if missing
  if [[ ! -f .gitignore ]]; then
    cp "$ROOT_DIR/templates/.gitignore" .gitignore
  fi

  # Commit changes
  git add .
  git commit -m "Add GitHub spec kit

- Add BOM tracking workflows (SBOM, CBOM, OBOM, WBOM)
- Add security scanning (Trivy, CodeQL, secret scanning)
- Add compliance checks (UAE PDPL, GDPR)
- Add quality gates (linting, testing, coverage)
- Add telemetry integration

Installed via spec-kit v$(jq -r '.version' "$CONFIG_FILE")" || {
    echo -e "${YELLOW}  No changes to commit${NC}"
    return 0
  }

  # Push branch
  git push -u origin "$branch"

  # Create PR
  gh pr create \
    --title "[spec-kit] Install GitHub spec kit" \
    --body "$(cat <<EOF
# GitHub Spec Kit Installation

This PR installs the monolithic GitHub spec kit with:

## ✨ Features Added

- **BOM Tracking**: Daily scans for SBOM, CBOM, OBOM, WBOM
- **Security Scanning**: Trivy, CodeQL, Dependabot, secret scanning
- **Compliance**: UAE PDPL, GDPR, SOC 2 checks
- **Quality Gates**: Linting, testing, coverage requirements
- **Telemetry**: Metrics collection and monitoring

## 📊 Workflows Added

- \`.github/workflows/bom-tracker.yml\`
- \`.github/workflows/security-scan.yml\`
- \`.github/workflows/compliance-check.yml\`
- \`.github/workflows/quality-gate.yml\`
- \`.github/workflows/telemetry-push.yml\`

## 🔧 Configuration

Default configuration from spec-kit. To override:

1. Create \`.github/spec-kit-overrides.json\`
2. Add your custom settings
3. Changes will sync back to main spec-kit

## ✅ Next Steps

1. Review workflows
2. Add required secrets:
   - \`TELEMETRY_TOKEN\`
   - \`SLACK_WEBHOOK_URL\` (optional)
3. Merge PR
4. Monitor first runs

---
*Installed by spec-kit v$(jq -r '.version' "$CONFIG_FILE")*
EOF
)" \
    --label "spec-kit,automation" || {
      echo -e "${RED}  Failed to create PR for $repo${NC}"
      return 1
    }

  echo -e "${GREEN}  ✓ PR created for $repo${NC}"

  cd - > /dev/null
  return 0
}

# Main execution
main() {
  echo -e "${BLUE}=== GitHub Spec Kit Installer ===${NC}"
  echo ""

  # Get target repos
  TARGET_REPOS=($(get_target_repos))

  echo ""
  echo -e "${BLUE}Target repositories: ${#TARGET_REPOS[@]}${NC}"
  for repo in "${TARGET_REPOS[@]}"; do
    echo "  - $repo"
  done
  echo ""

  # Approval prompt
  if [[ "$DRY_RUN" == false ]] && [[ "$APPROVE" == false ]]; then
    echo -e "${YELLOW}This will create PRs in ${#TARGET_REPOS[@]} repositories.${NC}"
    read -p "Continue? (yes/no): " confirm

    if [[ "$confirm" != "yes" ]]; then
      echo "Aborted."
      exit 0
    fi
  fi

  # Install on each repo
  local success_count=0
  local fail_count=0
  local failed_repos=()

  for repo in "${TARGET_REPOS[@]}"; do
    if install_on_repo "$repo"; then
      ((success_count++))
    else
      ((fail_count++))
      failed_repos+=("$repo")
    fi
  done

  # Summary
  echo ""
  echo -e "${BLUE}=== Summary ===${NC}"
  echo -e "${GREEN}Success: $success_count${NC}"
  echo -e "${RED}Failed: $fail_count${NC}"

  if [[ ${#failed_repos[@]} -gt 0 ]]; then
    echo ""
    echo "Failed repos:"
    for repo in "${failed_repos[@]}"; do
      echo "  - $repo"
    done
  fi

  if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo -e "${YELLOW}DRY RUN complete. No changes made.${NC}"
    echo "Run with --apply to make changes."
  else
    echo ""
    echo -e "${GREEN}Installation complete!${NC}"
    echo "Check created PRs: gh pr list --search 'author:@me [spec-kit]'"
  fi
}

# Run
main
