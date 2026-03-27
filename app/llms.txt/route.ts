const LLMS_TXT = `# Joey Chen — Developer & Builder

> Personal website of Joey Chen — blockchain developer, AI development specialist, and creator. Focused on Claude Code workflows, AI agent design patterns, and Web3 development.

## About
- [About Joey Chen](https://0xjoeytw.xyz/about): Background, skills, and experience

## Blog Posts
- [Claude Code Dev Workflow](https://0xjoeytw.xyz/blog/claude-code-dev-workflow): Complete workflow design for AI-assisted development with cross-session memory management
- [Three-Layer AI Agent Enforcement](https://0xjoeytw.xyz/blog/three-layer-ai-agent-enforcement): Framework for controlling AI assistant behavior using text rules, automation hooks, and permission systems
- [Claude Code Session Memory](https://0xjoeytw.xyz/blog/claude-code-session-memory): External memory system design for maintaining AI context across development sessions
- [Claude Code Cheat Sheet Guide](https://0xjoeytw.xyz/blog/claude-code-cheatsheet-guide): Comprehensive command and configuration reference for Claude Code
- [Claude Code Command Reference](https://0xjoeytw.xyz/blog/claude-code-command-reference): Detailed CLI command reference
- [AI Session to Content Pipeline](https://0xjoeytw.xyz/blog/ai-session-to-content-pipeline): Automated pipeline for converting AI coding sessions into publishable content

## Projects
- [Projects](https://0xjoeytw.xyz/projects): Portfolio of development projects

## Resources
- [Skills Hub](https://0xjoeytw.xyz/skills): Technical skills and Claude Code skill marketplace
- [Cheat Sheet](https://0xjoeytw.xyz/cheatsheet): Developer reference materials
`

export function GET() {
  return new Response(LLMS_TXT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
