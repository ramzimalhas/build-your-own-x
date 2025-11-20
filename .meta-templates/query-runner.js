#!/usr/bin/env node

/**
 * Meta Template Query Runner
 *
 * A unified interface for querying across Linear, GitHub, Maestroverse,
 * and other configured tools.
 *
 * Usage:
 *   node query-runner.js <template> [options]
 *
 * Examples:
 *   node query-runner.js all_open_items
 *   node query-runner.js my_assignments --format json
 *   node query-runner.js search --query "authentication"
 *   node query-runner.js recent_activity --days 14
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load configuration
const configPath = path.join(__dirname, 'query-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Load tool schemas
const schemas = {};
for (const [service, serviceConfig] of Object.entries(config.services)) {
  if (serviceConfig.enabled) {
    const schemaPath = path.join(__dirname, serviceConfig.schema_file);
    if (fs.existsSync(schemaPath)) {
      schemas[service] = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    }
  }
}

/**
 * Make HTTP/HTTPS request
 */
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * Replace template variables in a string
 */
function replaceVariables(str, params) {
  if (typeof str !== 'string') return str;

  return str.replace(/\$\{(\w+)\}/g, (match, varName) => {
    if (params[varName] !== undefined) {
      return params[varName];
    }
    if (process.env[varName]) {
      return process.env[varName];
    }
    return match;
  });
}

/**
 * Deep replace variables in an object
 */
function replaceVariablesDeep(obj, params) {
  if (typeof obj === 'string') {
    return replaceVariables(obj, params);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => replaceVariablesDeep(item, params));
  }
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = replaceVariablesDeep(value, params);
    }
    return result;
  }
  return obj;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  if (!path || path === '.') return obj;

  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;

    // Handle array notation like "nodes[]"
    if (part.endsWith('[]')) {
      const key = part.slice(0, -2);
      current = current[key];
      if (Array.isArray(current)) {
        // This is a simplification - in real use, handle array mapping
        continue;
      }
    } else {
      current = current[part];
    }
  }

  return current;
}

/**
 * Execute a Linear GraphQL query
 */
async function executeLinearQuery(queryDef, params) {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey) {
    throw new Error('LINEAR_API_KEY environment variable not set');
  }

  const variables = replaceVariablesDeep(queryDef.variables || {}, params);

  const body = {
    query: queryDef.query || queryDef.mutation,
    variables
  };

  const options = {
    hostname: 'api.linear.app',
    path: '/graphql',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey
    }
  };

  const response = await makeRequest(options, body);
  return getNestedValue(response, queryDef.response_path);
}

/**
 * Execute a GitHub query (GraphQL or REST)
 */
async function executeGitHubQuery(queryDef, params) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable not set');
  }

  // Add defaults
  params = {
    OWNER: process.env.DEFAULT_OWNER || params.OWNER,
    REPO: process.env.DEFAULT_REPO || params.REPO,
    ...params
  };

  if (queryDef.type === 'graphql') {
    const variables = replaceVariablesDeep(queryDef.variables || {}, params);

    const body = {
      query: queryDef.query,
      variables
    };

    const options = {
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Meta-Template-Query-Runner'
      }
    };

    const response = await makeRequest(options, body);
    return getNestedValue(response, queryDef.response_path);
  } else {
    // REST API
    const endpoint = replaceVariables(queryDef.endpoint, params);
    const queryParams = new URLSearchParams(
      replaceVariablesDeep(queryDef.params || {}, params)
    ).toString();

    const options = {
      hostname: 'api.github.com',
      path: queryParams ? `${endpoint}?${queryParams}` : endpoint,
      method: queryDef.method || 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Meta-Template-Query-Runner',
        'X-GitHub-Api-Version': '2022-11-28'
      }
    };

    const response = await makeRequest(options, queryDef.body);
    return getNestedValue(response, queryDef.response_path);
  }
}

/**
 * Execute a Maestroverse query
 */
async function executeMaestroverseQuery(queryDef, params) {
  const apiKey = process.env.MAESTROVERSE_API_KEY;
  if (!apiKey) {
    throw new Error('MAESTROVERSE_API_KEY environment variable not set');
  }

  const endpoint = replaceVariables(queryDef.endpoint, params);
  const queryParams = new URLSearchParams(
    replaceVariablesDeep(queryDef.params || {}, params)
  ).toString();

  const url = new URL(`https://api.maestroverse.io/v1${endpoint}`);

  const options = {
    hostname: url.hostname,
    path: queryParams ? `${url.pathname}?${queryParams}` : url.pathname,
    method: queryDef.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      'X-Workspace-ID': process.env.WORKSPACE_ID || ''
    }
  };

  const body = queryDef.body ? replaceVariablesDeep(queryDef.body, params) : null;
  const response = await makeRequest(options, body);
  return getNestedValue(response, queryDef.response_path);
}

/**
 * Execute a query for a specific service
 */
async function executeServiceQuery(service, templateName, params) {
  const schema = schemas[service];
  if (!schema) {
    throw new Error(`Schema not found for service: ${service}`);
  }

  const queryDef = schema.queries[templateName];
  if (!queryDef) {
    throw new Error(`Query template '${templateName}' not found for service: ${service}`);
  }

  switch (service) {
    case 'linear':
      return executeLinearQuery(queryDef, params);
    case 'github':
      return executeGitHubQuery(queryDef, params);
    case 'maestroverse':
      return executeMaestroverseQuery(queryDef, params);
    default:
      throw new Error(`Unknown service: ${service}`);
  }
}

/**
 * Run a query template across all configured services
 */
async function runQueryTemplate(templateName, params = {}) {
  const template = config.query_templates[templateName];
  if (!template) {
    throw new Error(`Query template not found: ${templateName}`);
  }

  // Merge template params with provided params
  const mergedParams = { ...template.params, ...params };

  const results = [];

  for (const query of template.queries) {
    if (!config.services[query.service]?.enabled) {
      continue;
    }

    try {
      const data = await executeServiceQuery(
        query.service,
        query.template,
        mergedParams
      );

      results.push({
        service: query.service,
        template: query.template,
        data,
        success: true
      });
    } catch (error) {
      results.push({
        service: query.service,
        template: query.template,
        error: error.message,
        success: false
      });
    }
  }

  return results;
}

/**
 * Format output based on specified format
 */
function formatOutput(results, format) {
  switch (format) {
    case 'json':
      return JSON.stringify(results, null, 2);

    case 'yaml':
      // Simple YAML-like output
      return results.map(r =>
        `service: ${r.service}\ntemplate: ${r.template}\nsuccess: ${r.success}\ndata: ${JSON.stringify(r.data, null, 2)}`
      ).join('\n---\n');

    case 'markdown':
      let md = '# Query Results\n\n';
      for (const result of results) {
        md += `## ${result.service} - ${result.template}\n\n`;
        if (result.success) {
          if (Array.isArray(result.data)) {
            md += `Found ${result.data.length} items\n\n`;
          }
          md += '```json\n' + JSON.stringify(result.data, null, 2) + '\n```\n\n';
        } else {
          md += `**Error:** ${result.error}\n\n`;
        }
      }
      return md;

    default:
      return JSON.stringify(results, null, 2);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(args) {
  const result = {
    template: args[0],
    format: 'json',
    params: {}
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--format' && args[i + 1]) {
      result.format = args[++i];
    } else if (arg === '--query' && args[i + 1]) {
      result.params.SEARCH_QUERY = args[++i];
    } else if (arg === '--days' && args[i + 1]) {
      const days = parseInt(args[++i]);
      const date = new Date();
      date.setDate(date.getDate() - days);
      result.params.DAYS_AGO = date.toISOString();
    } else if (arg === '--owner' && args[i + 1]) {
      result.params.OWNER = args[++i];
    } else if (arg === '--repo' && args[i + 1]) {
      result.params.REPO = args[++i];
    } else if (arg.startsWith('--') && args[i + 1]) {
      const key = arg.slice(2).toUpperCase().replace(/-/g, '_');
      result.params[key] = args[++i];
    }
  }

  return result;
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
Meta Template Query Runner

Usage:
  node query-runner.js <template> [options]

Templates:
  all_open_items    Get all open items across all services
  my_assignments    Get all items assigned to me
  recent_activity   Get recent activity
  search            Search across all services
  sprint_status     Get current sprint/cycle status
  blocked_items     Get all blocked items

Options:
  --format <fmt>    Output format: json, yaml, markdown (default: json)
  --query <text>    Search query (for search template)
  --days <n>        Number of days to look back (default: 7)
  --owner <name>    GitHub owner/org
  --repo <name>     GitHub repository

Environment Variables:
  LINEAR_API_KEY        Linear API key
  GITHUB_TOKEN          GitHub personal access token
  MAESTROVERSE_API_KEY  Maestroverse API key
  DEFAULT_OWNER         Default GitHub owner
  DEFAULT_REPO          Default GitHub repository

Examples:
  node query-runner.js all_open_items
  node query-runner.js my_assignments --format markdown
  node query-runner.js search --query "authentication bug"
  node query-runner.js recent_activity --days 14
`);
}

/**
 * Main entry point
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(0);
  }

  const { template, format, params } = parseArgs(args);

  if (!template) {
    console.error('Error: No template specified');
    printUsage();
    process.exit(1);
  }

  try {
    console.error(`Running template: ${template}...`);
    const results = await runQueryTemplate(template, params);
    console.log(formatOutput(results, format));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

// Export for use as module
module.exports = {
  runQueryTemplate,
  executeServiceQuery,
  config,
  schemas
};
