# Context7 MCP Server Setup Documentation

## Overview
Context7 is an MCP (Model Context Protocol) server that provides access to up-to-date documentation and code examples for various libraries and frameworks.

## Setup Steps

1. **MCP Server Addition**
   - The Context7 MCP server was added to Claude Code's configuration
   - This enables access to library documentation directly within Claude Code

2. **Available Tools**
   The Context7 server provides two main tools:
   
   - `mcp__context7__resolve-library-id`: Resolves a package/product name to a Context7-compatible library ID
   - `mcp__context7__get-library-docs`: Fetches up-to-date documentation for a specified library

## Usage Examples

### Example 1: Getting React Documentation
```
1. First resolve the library ID:
   - Call resolve-library-id with "react"
   - Get the Context7-compatible ID (e.g., '/facebook/react')

2. Then fetch the documentation:
   - Call get-library-docs with the resolved ID
   - Optionally specify a topic (e.g., 'hooks', 'state management')
```

### Example 2: Getting Next.js Documentation
```
1. Resolve: resolve-library-id("nextjs") → '/vercel/next.js'
2. Fetch: get-library-docs("/vercel/next.js", topic="routing")
```

## Benefits
- Access to current, accurate documentation without leaving Claude Code
- Code snippets and examples from official sources
- Focused documentation retrieval by topic
- Supports multiple libraries and frameworks

## Notes
- Always use `resolve-library-id` first unless the user provides an exact library ID
- The library ID format is typically '/organization/project' or '/organization/project/version'
- Higher token limits provide more comprehensive documentation but consume more resources