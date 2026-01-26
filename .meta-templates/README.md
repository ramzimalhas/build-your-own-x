# Meta Template Query Tools

A unified query configuration for querying across Linear, GitHub, Maestroverse, and other development tools, with comprehensive Bill of Materials (BOM) tracking.

## Overview

This meta template provides a standardized way to:
- Query multiple services with consistent patterns
- Aggregate results from different tools
- Map fields between services
- Define reusable query templates
- **Track 9 types of Bill of Materials (BOM) across your entire tooling ecosystem**

### Bill of Materials (BOM) Support

Track inventory across 9 BOM types:

| BOM | Purpose | Missing Data Tracked |
|-----|---------|---------------------|
| SBOM 📦 | Software dependencies | Framework versions, licenses, CVEs |
| ABOM 📱 | App/service catalog | Xcode projects using frameworks |
| PBOM 🧍 | Developer behaviors | Usage patterns, adoption rates |
| HBOM 🏠 | Device inventory | Device support by framework |
| IBOM 🔐 | Identity/auth | Permission requirements, TCC mappings |
| DBOM 🗄️ | Dataset lineage | CSV → DuckDB provenance |
| CBOM 📋 | Compliance | UAE jurisdiction, GDPR, privacy scores |
| OBOM 📡 | Observability | Cell execution times, token costs |
| WBOM 🔄 | Workflows | Semantic engine → DuckDB pipelines |

See [BOM-EXAMPLES.md](./BOM-EXAMPLES.md) for detailed usage examples.

## Structure

```
.meta-templates/
├── query-config.json         # Main configuration file
├── tools-manifest.json       # Registry of all tools
├── bom-taxonomy.json         # BOM type definitions
├── query-runner.js           # Example runner script
├── README.md                 # This file
├── BOM-EXAMPLES.md           # Comprehensive BOM usage examples
└── schemas/
    ├── linear.schema.json    # Linear API queries
    ├── github.schema.json    # GitHub API queries
    ├── maestroverse.schema.json  # Maestroverse API queries
    └── bom-queries.json      # BOM-specific queries for all services
```

## Quick Start

### 1. Set Environment Variables

```bash
export LINEAR_API_KEY="lin_api_xxxxx"
export GITHUB_TOKEN="ghp_xxxxx"
export MAESTROVERSE_API_KEY="mv_xxxxx"
```

### 2. Configure Services

Edit `query-config.json` to set your defaults:

```json
{
  "services": {
    "github": {
      "default_owner": "your-org",
      "default_repo": "your-repo"
    },
    "linear": {
      "default_workspace": "your-workspace"
    }
  }
}
```

### 3. Run Queries

```bash
# Run with Node.js
node query-runner.js all_open_items

# Or use the query templates directly with your preferred tool
```

## Query Templates

### Built-in Templates

| Template | Description |
|----------|-------------|
| `all_open_items` | Get all open items across all services |
| `my_assignments` | Get all items assigned to me |
| `recent_activity` | Get recent activity (last 7 days) |
| `search` | Search across all services |
| `sprint_status` | Get current sprint/cycle status |
| `blocked_items` | Get all blocked items |

### BOM Query Templates

| Template | BOM Type | Description |
|----------|----------|-------------|
| `sbom_audit` | SBOM 📦 | Audit software dependencies, licenses, CVEs |
| `abom_catalog` | ABOM 📱 | Get app/service catalog with frameworks |
| `pbom_insights` | PBOM 🧍 | Developer behavior and adoption patterns |
| `hbom_inventory` | HBOM 🏠 | Device inventory and compatibility |
| `ibom_permissions` | IBOM 🔐 | Permission audit and TCC mappings |
| `dbom_lineage` | DBOM 🗄️ | Dataset lineage and provenance |
| `cbom_compliance` | CBOM 📋 | Compliance status (GDPR, UAE, etc.) |
| `obom_metrics` | OBOM 📡 | Performance metrics and costs |
| `wbom_pipelines` | WBOM 🔄 | Workflow and pipeline inventory |
| `bom_complete_inventory` | ALL | Complete inventory across all 9 BOMs |

See [BOM-EXAMPLES.md](./BOM-EXAMPLES.md) for detailed examples of each BOM type.

### Using Templates

```javascript
const config = require('./query-config.json');
const template = config.query_templates.my_assignments;

// Execute each query in the template
for (const query of template.queries) {
  const schema = require(`./schemas/${query.service}.schema.json`);
  const queryDef = schema.queries[query.template];
  // Execute queryDef...
}
```

## Service Schemas

### Linear (`schemas/linear.schema.json`)

Supports GraphQL queries for:
- Issues (open, assigned, blocked, search)
- Cycles/Sprints
- Teams and Projects
- Create/Update operations

### GitHub (`schemas/github.schema.json`)

Supports both REST and GraphQL:
- Issues and Pull Requests
- Commits and Code Search
- Milestones
- Repository info
- Create/Update operations

### Maestroverse (`schemas/maestroverse.schema.json`)

REST API for:
- Tasks and Projects
- Sprints and Workflows
- Automations
- AI Suggestions
- Metrics

## Field Mappings

Each schema includes field mappings to normalize data:

```json
{
  "field_mappings": {
    "id": "id",
    "title": "title",
    "status": "state.name",
    "assignee": "assignee.name",
    "created_at": "createdAt"
  }
}
```

## Custom Fields

### Priority Mapping

Different tools use different priority systems. The config normalizes them:

```json
{
  "priority_mapping": {
    "linear": { "1": "urgent", "2": "high", "3": "medium", "4": "low" },
    "github": { "labels": ["priority:critical", "priority:high", ...] },
    "maestroverse": { "P0": "critical", "P1": "high", ... }
  }
}
```

### Status Mapping

```json
{
  "status_mapping": {
    "open": ["Open", "Todo", "Backlog", "open"],
    "in_progress": ["In Progress", "In Review", "working"],
    "done": ["Done", "Closed", "merged"],
    "blocked": ["Blocked", "On Hold", "waiting"]
  }
}
```

## Adding Custom Tools

1. Create a schema file in `schemas/`:

```json
{
  "connection": {
    "type": "rest",
    "base_url": "https://api.yourtool.com",
    "headers": { "Authorization": "Bearer ${YOUR_TOOL_API_KEY}" }
  },
  "queries": {
    "my_query": {
      "method": "GET",
      "endpoint": "/items",
      "params": {},
      "response_path": "data.items"
    }
  }
}
```

2. Register in `query-config.json`:

```json
{
  "services": {
    "yourtool": {
      "enabled": true,
      "base_url": "https://api.yourtool.com",
      "auth": { "type": "bearer", "env_var": "YOUR_TOOL_API_KEY" },
      "schema_file": "./schemas/yourtool.schema.json"
    }
  }
}
```

3. Add to query templates as needed.

## Webhooks

Each service supports webhooks. Configure in the schema:

```json
{
  "webhooks": {
    "events": ["task.created", "task.updated"],
    "endpoint": "${WEBHOOK_URL}",
    "secret": "${WEBHOOK_SECRET}"
  }
}
```

## Output Formats

Supported formats:
- `json` - JSON (default)
- `yaml` - YAML
- `csv` - CSV for spreadsheets
- `markdown` - Markdown tables
- `html` - HTML tables

## Aggregation

Results can be aggregated across services:

```json
{
  "aggregation": {
    "merge_strategy": "unified",
    "sort_by": "updated_at",
    "sort_order": "desc",
    "dedup_by": ["external_url", "title"]
  }
}
```

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `LINEAR_API_KEY` | Linear API key |
| `GITHUB_TOKEN` | GitHub personal access token |
| `MAESTROVERSE_API_KEY` | Maestroverse API key |

### Optional

| Variable | Description |
|----------|-------------|
| `DEFAULT_OWNER` | Default GitHub owner/org |
| `DEFAULT_REPO` | Default GitHub repository |
| `WORKSPACE_ID` | Maestroverse workspace ID |
| `WEBHOOK_URL` | Webhook callback URL |

## Examples

### Get all my open items

```javascript
const results = await queryRunner.run('my_assignments');
console.log(results);
// [
//   { service: 'linear', items: [...] },
//   { service: 'github', items: [...] },
//   { service: 'maestroverse', items: [...] }
// ]
```

### Search across all services

```javascript
const results = await queryRunner.run('search', { query: 'authentication bug' });
```

### Get sprint status

```javascript
const results = await queryRunner.run('sprint_status');
```

## License

MIT
