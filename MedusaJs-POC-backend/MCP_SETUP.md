# MCP Server Setup for Medusa Backend

## Overview
This document describes the Model Context Protocol (MCP) server setup for the Medusa telecom e-commerce backend project.

## What is MCP?
The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context to LLMs. It allows AI assistants to securely access your local development environment and codebase.

## Configuration

The MCP server configuration is defined in `mcp-server.json` and provides:
- **Filesystem access** to the entire Medusa backend project
- **Read/write capabilities** for code files, configuration, and documentation
- **Project context** for AI-assisted development

## Setup Instructions

### Option 1: Add to Global MCP Configuration

1. Open your global MCP configuration file (typically at `~/.config/mcp/mcp.json` or similar)
2. Add the following server configuration:

```json
{
  "mcpServers": {
    "medusa-backend": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/ridam.chhapiya/Documents/medusa/MedusaJs-POC"
      ],
      "description": "MCP server for Medusa backend project"
    }
  }
}
```

### Option 2: Use Project-Specific Configuration

The `mcp-server.json` file in this directory can be used directly by MCP-compatible tools.

## Usage with AI Assistants

Once configured, AI assistants with MCP support can:
- Browse and understand your Medusa project structure
- Read configuration files (`medusa-config.ts`, `.env`, etc.)
- Access source code in `src/` directory
- Review scripts, tests, and documentation
- Suggest code improvements and help debug issues
- Assist with Medusa-specific development tasks

## Project Structure Access

The MCP server provides access to:
- `/src` - Source code (API routes, workflows, modules, scripts)
- `/integration-tests` - Integration test suites
- Configuration files (`medusa-config.ts`, `tsconfig.json`, etc.)
- Package management (`package.json`, `yarn.lock`)
- Documentation (`README.md`, this file)

## Security Notes

- The MCP server only provides access to this specific project directory
- No access to parent directories or system files outside the project
- All file operations are logged and can be audited
- Consider using read-only mode if you only need code analysis

## Troubleshooting

### Server Not Starting
- Ensure Node.js version >= 20 (check with `node --version`)
- Verify `npx` is available in your PATH
- Check that the project path is correct

### Permission Issues
- Ensure you have read/write permissions for the project directory
- On macOS, you may need to grant terminal/IDE permissions in System Preferences

## Related Documentation

- [Medusa Documentation](https://docs.medusajs.com)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Project README](./README.md)

## Support

For issues specific to:
- **Medusa**: Check [Medusa GitHub Discussions](https://github.com/medusajs/medusa/discussions)
- **MCP**: Refer to the [MCP documentation](https://modelcontextprotocol.io/docs)
