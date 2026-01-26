# BOM Query Examples

A comprehensive guide to using the Bill of Materials (BOM) query system across Linear, GitHub, and Maestroverse.

## Table of Contents

- [Overview](#overview)
- [SBOM Examples](#sbom-examples-📦)
- [ABOM Examples](#abom-examples-📱)
- [PBOM Examples](#pbom-examples-🧍)
- [HBOM Examples](#hbom-examples-🏠)
- [IBOM Examples](#ibom-examples-🔐)
- [DBOM Examples](#dbom-examples-🗄️)
- [CBOM Examples](#cbom-examples-📋)
- [OBOM Examples](#obom-examples-📡)
- [WBOM Examples](#wbom-examples-🔄)
- [Cross-BOM Analysis](#cross-bom-analysis)

---

## Overview

The BOM taxonomy provides 9 different inventory types to track various aspects of your development ecosystem:

| BOM | Purpose | Key Data |
|-----|---------|----------|
| SBOM 📦 | Software dependencies | Versions, licenses, CVEs |
| ABOM 📱 | App/service catalog | Projects, frameworks used |
| PBOM 🧍 | Developer behaviors | Usage patterns, contributions |
| HBOM 🏠 | Device inventory | Compatibility, OS versions |
| IBOM 🔐 | Identity/auth | Permissions, TCC mappings |
| DBOM 🗄️ | Dataset lineage | Data provenance, transformations |
| CBOM 📋 | Compliance | Regulations, privacy scores |
| OBOM 📡 | Observability | Metrics, costs, performance |
| WBOM 🔄 | Workflows | Pipelines, orchestrations |

---

## SBOM Examples 📦

### Get All Dependencies with CVE Check

```bash
node query-runner.js sbom_audit --format markdown
```

**What it tracks:**
- All dependencies in your repositories
- Known CVEs and security vulnerabilities
- License information
- Package versions and suppliers

**Example Output:**
```json
{
  "service": "github",
  "data": {
    "dependencies": [
      {
        "name": "lodash",
        "version": "4.17.20",
        "license": "MIT",
        "vulnerabilities": [
          {
            "cve_id": "CVE-2021-23337",
            "severity": "HIGH",
            "fixed_version": "4.17.21"
          }
        ]
      }
    ]
  }
}
```

### Track Framework Versions Across Projects

```bash
# Check which version of SwiftUI framework is used
node query-runner.js sbom_audit --query "SwiftUI framework version"
```

**Use Cases:**
- Audit outdated dependencies
- Track license compliance
- Security vulnerability scanning
- Supplier/maintainer verification

---

## ABOM Examples 📱

### Get Complete App Catalog

```bash
node query-runner.js abom_catalog
```

**What it tracks:**
- All Xcode projects
- Which frameworks each app uses
- Deployment targets (iOS 17+, macOS 14+)
- Repository locations
- Owner teams

**Example Output:**
```json
{
  "apps": [
    {
      "name": "MyiOSApp",
      "type": "ios",
      "frameworks_used": ["UIKit", "CoreData", "Combine"],
      "xcode_project": "ios/MyApp.xcodeproj",
      "deployment_targets": {
        "ios": "15.0",
        "macos": null
      },
      "owner_team": "Mobile Team"
    }
  ]
}
```

### Find Apps Using Specific Framework

```bash
# Find all apps using CoreLocation
node query-runner.js abom_catalog --query "CoreLocation framework"
```

**Use Cases:**
- Framework adoption tracking
- Migration planning (UIKit → SwiftUI)
- Identify unmaintained apps
- Service dependency mapping

---

## PBOM Examples 🧍

### Get Developer Adoption Patterns

```bash
node query-runner.js pbom_insights
```

**What it tracks:**
- Which developers use which frameworks
- Early adopters vs late adopters
- Contribution statistics
- Expertise areas

**Example Output:**
```json
{
  "developers": [
    {
      "name": "Sarah Chen",
      "framework_usage": ["SwiftUI", "Combine", "async/await"],
      "adoption_patterns": {
        "early_adopter": true,
        "avg_adoption_delay": 2.5
      },
      "contribution_stats": {
        "commits": 342,
        "prs": 67,
        "issues": 23
      },
      "expertise_areas": ["ios", "swiftui", "architecture"]
    }
  ]
}
```

### Identify Knowledge Gaps

```bash
# Find teams with low async/await adoption
node query-runner.js pbom_insights --query "async/await expertise"
```

**Use Cases:**
- Team velocity tracking
- Training needs identification
- Expertise mapping
- Adoption rate analysis

---

## HBOM Examples 🏠

### Device Compatibility Matrix

```bash
node query-runner.js hbom_inventory
```

**What it tracks:**
- Test device inventory
- OS versions supported
- Framework compatibility by device
- Simulator configurations

**Example Output:**
```json
{
  "devices": [
    {
      "model": "iPhone 15 Pro",
      "os_version": "iOS 17.2",
      "supported_frameworks": [
        "SwiftUI 5.0",
        "WidgetKit",
        "VisionKit"
      ],
      "minimum_deployment": {
        "ios": "17.0"
      },
      "availability": "current"
    }
  ]
}
```

**Use Cases:**
- Verify framework device support
- Plan iOS version drops
- Test coverage by device
- Identify obsolete device support

---

## IBOM Examples 🔐

### Permission Audit

```bash
node query-runner.js ibom_permissions
```

**What it tracks:**
- All permission requests
- TCC service mappings
- Entitlement keys
- Privacy impact scores

**Example Output:**
```json
{
  "permissions": [
    {
      "permission_type": "camera",
      "tcc_service": "kTCCServiceCamera",
      "entitlement": "com.apple.security.device.camera",
      "usage_description": "We need camera access to scan QR codes",
      "required_by": ["MyApp", "ScannerFramework"],
      "privacy_impact": "high"
    },
    {
      "permission_type": "location",
      "tcc_service": "kTCCServiceLocationWhenInUse",
      "entitlement": "com.apple.security.personal-information.location",
      "usage_description": "Location is used to show nearby stores",
      "required_by": ["MyApp"],
      "privacy_impact": "medium"
    }
  ]
}
```

### TCC to Entitlement Mapping

```bash
# Map all TCC services to their entitlements
node query-runner.js ibom_permissions --format markdown
```

**Use Cases:**
- Privacy manifest creation
- Over-privileged app detection
- Permission request optimization
- App Review preparation

---

## DBOM Examples 🗄️

### Dataset Lineage Tracking

```bash
node query-runner.js dbom_lineage
```

**What it tracks:**
- Data sources (CSV, JSON, APIs)
- Transformation pipeline
- Destination formats (DuckDB, SQLite)
- PII field locations

**Example Output:**
```json
{
  "datasets": [
    {
      "name": "user_analytics",
      "source_format": "csv",
      "destination_format": "duckdb",
      "lineage": [
        {
          "step": "Extract from CSV",
          "tool": "pandas",
          "timestamp": "2024-01-15T10:00:00Z"
        },
        {
          "step": "Clean and normalize",
          "tool": "semantic_engine",
          "timestamp": "2024-01-15T10:05:00Z"
        },
        {
          "step": "Load to DuckDB",
          "tool": "duckdb",
          "timestamp": "2024-01-15T10:10:00Z"
        }
      ],
      "size_bytes": 15728640,
      "row_count": 50000,
      "pii_fields": ["email", "phone_number", "address"]
    }
  ]
}
```

**Use Cases:**
- Data provenance tracking
- PII inventory for compliance
- Pipeline optimization
- Debug data quality issues

---

## CBOM Examples 📋

### Compliance Status Dashboard

```bash
node query-runner.js cbom_compliance
```

**What it tracks:**
- Regulatory compliance (GDPR, UAE PDPL, CCPA)
- Privacy scores
- Audit findings
- Requirement status

**Example Output:**
```json
{
  "compliance": [
    {
      "regulation": "GDPR",
      "jurisdiction": "EU",
      "compliance_status": "compliant",
      "privacy_score": 92,
      "requirements": [
        {
          "requirement": "Right to erasure",
          "status": "implemented",
          "evidence": "Delete account feature in Settings"
        },
        {
          "requirement": "Data portability",
          "status": "implemented",
          "evidence": "Export data API endpoint"
        }
      ],
      "audit_date": "2024-01-10",
      "violations": []
    },
    {
      "regulation": "UAE Data Protection Law",
      "jurisdiction": "UAE",
      "compliance_status": "in_progress",
      "privacy_score": 78,
      "requirements": [
        {
          "requirement": "Data localization",
          "status": "in_progress",
          "evidence": "UAE region deployment planned Q2"
        }
      ],
      "violations": [
        {
          "description": "User consent not explicit for marketing emails",
          "severity": "medium",
          "remediation": "Update consent flow in onboarding"
        }
      ]
    }
  ]
}
```

**Use Cases:**
- Multi-jurisdiction compliance tracking
- Audit preparation
- Privacy score improvement
- Violation remediation

---

## OBOM Examples 📡

### Performance & Cost Metrics

```bash
node query-runner.js obom_metrics --days 7
```

**What it tracks:**
- Cell execution times (Jupyter notebooks)
- Token usage and costs
- CI/CD pipeline metrics
- Error rates and SLO status

**Example Output:**
```json
{
  "metrics": [
    {
      "metric_name": "notebook_cell_execution",
      "metric_type": "timer",
      "execution_time": {
        "p50": 120,
        "p95": 450,
        "p99": 890
      },
      "resource_usage": {
        "cpu": 45,
        "memory": 2048,
        "tokens": 15000,
        "cost_usd": 0.023
      },
      "cell_executions": 1247,
      "error_rate": 0.02,
      "slo_status": "met"
    },
    {
      "metric_name": "github_actions_workflow",
      "execution_time": {
        "p50": 180,
        "p95": 320,
        "p99": 480
      },
      "resource_usage": {
        "cost_usd": 12.50
      },
      "error_rate": 0.05
    }
  ]
}
```

**Use Cases:**
- Cost attribution by team
- Performance optimization
- SLO monitoring
- Resource usage tracking

---

## WBOM Examples 🔄

### Workflow Pipeline Inventory

```bash
node query-runner.js wbom_pipelines
```

**What it tracks:**
- CI/CD workflows
- Data pipelines (semantic_engine → DuckDB)
- Automation workflows
- Pipeline dependencies

**Example Output:**
```json
{
  "workflows": [
    {
      "workflow_name": "data_ingestion_pipeline",
      "workflow_type": "data_pipeline",
      "steps": [
        {
          "name": "Fetch CSV from S3",
          "tool": "boto3",
          "dependencies": []
        },
        {
          "name": "Semantic analysis",
          "tool": "semantic_engine",
          "dependencies": ["Fetch CSV from S3"]
        },
        {
          "name": "Load to DuckDB",
          "tool": "duckdb",
          "dependencies": ["Semantic analysis"]
        },
        {
          "name": "Generate reports",
          "tool": "custom_script",
          "dependencies": ["Load to DuckDB"]
        }
      ],
      "pipeline_stages": [
        "S3 → semantic_engine → DuckDB → Reports"
      ],
      "trigger": {
        "type": "schedule",
        "schedule": "0 2 * * *"
      },
      "success_rate": 0.98
    }
  ]
}
```

**Use Cases:**
- Pipeline dependency mapping
- Workflow health monitoring
- Automation coverage
- Pipeline optimization

---

## Cross-BOM Analysis

### Impact Analysis: Framework Update

**Scenario:** You want to update SwiftUI from 4.0 to 5.0

```bash
# 1. Check current framework usage (SBOM)
node query-runner.js sbom_audit --query "SwiftUI"

# 2. Find affected apps (ABOM)
node query-runner.js abom_catalog --query "apps using SwiftUI"

# 3. Identify developers who need to update (PBOM)
node query-runner.js pbom_insights --query "SwiftUI developers"

# 4. Check device compatibility (HBOM)
node query-runner.js hbom_inventory --query "SwiftUI 5.0 support"

# 5. Review affected workflows (WBOM)
node query-runner.js wbom_pipelines --query "SwiftUI tests"
```

**Output:**
```
Impact Analysis: SwiftUI 4.0 → 5.0
- 12 apps affected (ABOM)
- 8 developers need training (PBOM)
- Requires iOS 17+ (drops iOS 15 support) (HBOM)
- 5 CI workflows need updates (WBOM)
- Estimated effort: 3 sprints
```

### Security Audit: CVE Response

**Scenario:** A critical CVE is discovered in a dependency

```bash
# Cross-reference vulnerability across BOMs
node query-runner.js sbom_audit | \
  node analyze-impact.js --cross-bom \
    --check-apps (ABOM) \
    --check-permissions (IBOM) \
    --check-compliance (CBOM)
```

**Output:**
```
Security Impact:
- Vulnerable package: lodash@4.17.20 (SBOM)
- 5 apps affected (ABOM)
- 2 apps with elevated permissions (IBOM)
- Compliance violation: UAE PDPL Article 10 (CBOM)
- Remediation: Upgrade to 4.17.21 immediately
```

### Compliance Dashboard

**Scenario:** Prepare for GDPR audit

```bash
# Aggregate compliance data
node query-runner.js cbom_compliance && \
node query-runner.js dbom_lineage --query "PII" && \
node query-runner.js ibom_permissions --query "data access"
```

**Output:**
```
GDPR Compliance Status:
- Overall score: 85/100 (CBOM)
- PII fields tracked: 12 datasets (DBOM)
- Permissions requiring consent: 8 (IBOM)
- Apps compliant: 9/12 (ABOM)
- Action items: 3 (documented in Linear)
```

### Cost Attribution

**Scenario:** Allocate infrastructure costs to teams

```bash
# Map costs to teams
node query-runner.js obom_metrics --cost-breakdown | \
  join abom_catalog --on service_name | \
  join pbom_insights --on owner_team
```

**Output:**
```
Monthly Cost Breakdown:
- Mobile Team: $1,250 (5 services)
- Backend Team: $3,800 (12 services)
- Data Team: $890 (3 pipelines)
- Top cost driver: CI/CD workflows ($2,100)
```

---

## Query Cheat Sheet

| Want to... | Use this BOM | Command |
|------------|--------------|---------|
| Audit dependencies | SBOM | `sbom_audit` |
| Find apps using framework X | ABOM | `abom_catalog --query "framework X"` |
| Track developer adoption | PBOM | `pbom_insights` |
| Check device compatibility | HBOM | `hbom_inventory` |
| Review app permissions | IBOM | `ibom_permissions` |
| Trace data lineage | DBOM | `dbom_lineage` |
| Check compliance status | CBOM | `cbom_compliance` |
| Analyze costs | OBOM | `obom_metrics` |
| Review pipelines | WBOM | `wbom_pipelines` |
| Complete inventory | ALL | `bom_complete_inventory` |

---

## Next Steps

1. **Set up environment variables**
   ```bash
   export LINEAR_API_KEY="lin_api_xxxxx"
   export GITHUB_TOKEN="ghp_xxxxx"
   export MAESTROVERSE_API_KEY="mv_xxxxx"
   ```

2. **Run your first BOM query**
   ```bash
   node query-runner.js sbom_audit --format markdown
   ```

3. **Customize queries**
   - Edit `query-config.json` for new templates
   - Add service-specific queries in `schemas/bom-queries.json`

4. **Set up automation**
   - Schedule weekly SBOM vulnerability scans
   - Monthly compliance dashboard generation
   - Daily OBOM cost tracking

5. **Explore cross-BOM analysis**
   - Impact analysis for major changes
   - Security audits
   - Cost attribution

---

## Additional Resources

- [BOM Taxonomy](./bom-taxonomy.json) - Complete BOM type definitions
- [Query Config](./query-config.json) - Main configuration
- [BOM Queries](./schemas/bom-queries.json) - Service-specific queries
- [Query Runner](./query-runner.js) - CLI tool

For support, see the [main README](./README.md).
