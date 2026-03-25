'use client'

import { useState, useEffect, useCallback } from 'react'

type OS = 'mac' | 'win'

// ── Data ──────────────────────────────────────────────

interface Row { key: string; keyMac?: string; keyWin?: string; val: string; os?: 'mac' | 'win' }
interface Section { title: string; rows: Row[] }
interface Card { id: string; title: string; color: string; sections: Section[] }

const CARDS: Card[] = [
  {
    id: 'shortcuts', title: 'Keyboard Shortcuts', color: 'var(--blue, #64b5f6)',
    sections: [
      { title: 'General Controls', rows: [
        { key: 'Ctrl+C', keyMac: '^C', keyWin: 'Ctrl+C', val: 'Cancel input or generation' },
        { key: 'Ctrl+D', keyMac: '^D', keyWin: 'Ctrl+D', val: 'Exit session' },
        { key: 'Ctrl+F', keyMac: '^F', keyWin: 'Ctrl+F', val: 'Kill all background agents (2x)' },
        { key: 'Ctrl+G', keyMac: '^G', keyWin: 'Ctrl+G', val: 'Open in text editor' },
        { key: 'Ctrl+L', keyMac: '^L', keyWin: 'Ctrl+L', val: 'Clear terminal screen' },
        { key: 'Ctrl+O', keyMac: '^O', keyWin: 'Ctrl+O', val: 'Toggle verbose output' },
        { key: 'Ctrl+R', keyMac: '^R', keyWin: 'Ctrl+R', val: 'Reverse search history' },
        { key: 'Ctrl+B', keyMac: '^B', keyWin: 'Ctrl+B', val: 'Background running tasks' },
        { key: 'Ctrl+T', keyMac: '^T', keyWin: 'Ctrl+T', val: 'Toggle task list' },
        { key: 'Esc Esc', val: 'Rewind / summarize' },
        { key: 'Shift+Tab', keyMac: '\u21E7Tab', keyWin: 'Shift+Tab', val: 'Cycle permission modes' },
      ]},
      { title: 'Model & Thinking', rows: [
        { key: 'Alt+P', keyMac: '\u2325P', keyWin: 'Alt+P', val: 'Switch model' },
        { key: 'Alt+T', keyMac: '\u2325T', keyWin: 'Alt+T', val: 'Toggle extended thinking' },
        { key: 'Alt+M', keyMac: '\u2325M', keyWin: 'Alt+M', val: 'Cycle permission modes (alt)' },
      ]},
      { title: 'Multiline Input', rows: [
        { key: '\\ + Enter', val: 'Quick escape newline' },
        { key: 'Option+Enter', keyMac: '\u2325Enter', keyWin: 'Alt+Enter', val: 'New line (macOS default)' },
        { key: 'Shift+Enter', keyMac: '\u21E7Enter', keyWin: 'Shift+Enter', val: 'New line (iTerm2/WezTerm/Ghostty/Kitty)' },
        { key: 'Ctrl+J', keyMac: '^J', keyWin: 'Ctrl+J', val: 'New line (control sequence)' },
      ]},
      { title: 'Text Editing', rows: [
        { key: 'Ctrl+K', keyMac: '^K', keyWin: 'Ctrl+K', val: 'Delete to end of line' },
        { key: 'Ctrl+U', keyMac: '^U', keyWin: 'Ctrl+U', val: 'Delete entire line' },
        { key: 'Ctrl+Y', keyMac: '^Y', keyWin: 'Ctrl+Y', val: 'Paste deleted text' },
        { key: 'Alt+B', keyMac: '\u2325B', keyWin: 'Alt+B', val: 'Move cursor back one word' },
        { key: 'Alt+F', keyMac: '\u2325F', keyWin: 'Alt+F', val: 'Move cursor forward one word' },
      ]},
      { title: 'Clipboard & Images', rows: [
        { key: 'Cmd+V', keyMac: '\u2318V', keyWin: 'Ctrl+V', val: 'Paste image from clipboard' },
      ]},
      { title: 'Quick Prefixes', rows: [
        { key: '/', val: 'Slash command or skill' },
        { key: '!', val: 'Run bash command directly' },
        { key: '@', val: 'File path mention (autocomplete)' },
      ]},
    ],
  },
  {
    id: 'commands', title: 'Slash Commands', color: 'var(--purple, #bf00ff)',
    sections: [
      { title: 'Session', rows: [
        { key: '/clear', val: 'Clear conversation (alias: /reset, /new)' },
        { key: '/compact', val: 'Compact conversation with optional focus' },
        { key: '/resume', val: 'Resume past session (alias: /continue)' },
        { key: '/branch', val: 'Fork conversation (alias: /fork)' },
        { key: '/rename', val: 'Rename current session' },
        { key: '/rewind', val: 'Rewind to checkpoint (alias: /checkpoint)' },
        { key: '/export', val: 'Export conversation as text' },
        { key: '/exit', val: 'Exit CLI (alias: /quit)' },
      ]},
      { title: 'Model & Config', rows: [
        { key: '/model', val: 'Select or change AI model' },
        { key: '/fast', val: 'Toggle fast mode' },
        { key: '/effort', val: 'Set effort level (low/med/high/max)' },
        { key: '/config', val: 'Open settings (alias: /settings)' },
        { key: '/permissions', val: 'View / update permissions' },
        { key: '/theme', val: 'Change color theme' },
        { key: '/vim', val: 'Toggle Vim editing mode' },
        { key: '/voice', val: 'Toggle push-to-talk dictation' },
        { key: '/color', val: 'Set prompt bar color' },
      ]},
      { title: 'Information', rows: [
        { key: '/help', val: 'Show help' },
        { key: '/cost', val: 'Show token usage & cost' },
        { key: '/usage', val: 'Show plan usage & rate limits' },
        { key: '/status', val: 'Version, model, account info' },
        { key: '/context', val: 'Visualize context usage' },
        { key: '/stats', val: 'Daily usage, streaks, model prefs' },
        { key: '/diff', val: 'Open interactive diff viewer' },
        { key: '/copy', val: 'Copy last response to clipboard' },
        { key: '/release-notes', val: 'View full changelog' },
      ]},
      { title: 'Project & Tools', rows: [
        { key: '/init', val: 'Initialize project with CLAUDE.md' },
        { key: '/add-dir', val: 'Add working directory to session' },
        { key: '/memory', val: 'Edit CLAUDE.md & auto-memory' },
        { key: '/mcp', val: 'Manage MCP server connections' },
        { key: '/hooks', val: 'View hook configurations' },
        { key: '/skills', val: 'List available skills' },
        { key: '/tasks', val: 'List & manage background tasks' },
        { key: '/plan', val: 'Enter plan mode' },
        { key: '/sandbox', val: 'Toggle sandbox mode' },
        { key: '/schedule', val: 'Create / manage scheduled tasks' },
      ]},
      { title: 'Account & Setup', rows: [
        { key: '/login', val: 'Sign in to Anthropic' },
        { key: '/logout', val: 'Sign out' },
        { key: '/doctor', val: 'Diagnose installation' },
        { key: '/feedback', val: 'Submit feedback (alias: /bug)' },
        { key: '/upgrade', val: 'Switch plan tier' },
        { key: '/terminal-setup', val: 'Configure terminal keybindings' },
        { key: '/ide', val: 'Manage IDE integrations' },
        { key: '/plugin', val: 'Manage plugins' },
        { key: '/keybindings', val: 'Open keybindings config file' },
      ]},
      { title: 'Collaboration', rows: [
        { key: '/btw', val: 'Quick side question' },
        { key: '/pr-comments', val: 'Fetch GitHub PR comments' },
        { key: '/security-review', val: 'Analyze pending changes' },
        { key: '/remote-control', val: 'Remote control from claude.ai' },
        { key: '/desktop', val: 'Continue in Desktop app' },
        { key: '/install-github-app', val: 'Set up GitHub Actions app' },
        { key: '/install-slack-app', val: 'Install Slack app' },
      ]},
    ],
  },
  {
    id: 'cli', title: 'CLI Flags', color: 'var(--green, #69f0ae)',
    sections: [
      { title: 'Session & Startup', rows: [
        { key: '-c, --continue', val: 'Load most recent conversation' },
        { key: '-r, --resume ID', val: 'Resume specific session' },
        { key: '-n, --name', val: 'Set session display name' },
        { key: '-p, --print', val: 'One-shot print mode (non-interactive)' },
        { key: '--bare', val: 'Minimal mode, skip auto-discovery' },
        { key: '-w, --worktree', val: 'Start in isolated git worktree' },
        { key: '--init', val: 'Run init hooks + start interactive' },
        { key: '--remote', val: 'Create web session on claude.ai' },
        { key: '--teleport', val: 'Resume web session in local terminal' },
        { key: '--from-pr 123', val: 'Resume sessions linked to PR' },
      ]},
      { title: 'Model & Effort', rows: [
        { key: '--model MODEL', val: 'Set model (or use sonnet/opus)' },
        { key: '--effort LEVEL', val: 'low / medium / high / max' },
        { key: '--fallback-model', val: 'Enable fallback when overloaded' },
      ]},
      { title: 'Permissions', rows: [
        { key: '--permission-mode', val: 'default / acceptEdits / plan / auto / bypassPermissions' },
        { key: '--allowedTools', val: 'Tools allowed without prompt' },
        { key: '--disallowedTools', val: 'Remove tools from context' },
        { key: '--dangerously-skip-permissions', val: 'Skip all prompts (caution!)' },
      ]},
      { title: 'System Prompt', rows: [
        { key: '--system-prompt', val: 'Replace default system prompt' },
        { key: '--append-system-prompt', val: 'Append to default prompt' },
        { key: '--system-prompt-file', val: 'Load prompt from file' },
      ]},
      { title: 'Output', rows: [
        { key: '--output-format', val: 'text / json / stream-json' },
        { key: '--json-schema', val: 'Get validated JSON output' },
        { key: '--max-turns N', val: 'Limit agentic turns' },
        { key: '--max-budget-usd N', val: 'Max dollar amount' },
        { key: '-v, --version', val: 'Print version' },
      ]},
      { title: 'MCP & Plugins', rows: [
        { key: '--mcp-config FILE', val: 'Load MCP servers from JSON' },
        { key: '--strict-mcp-config', val: 'Only use specified MCP config' },
        { key: '--chrome / --no-chrome', val: 'Enable / disable Chrome integration' },
        { key: '--plugin-dir DIR', val: 'Load plugins from directory' },
        { key: '--agent NAME', val: 'Specify agent for session' },
        { key: '--add-dir PATH', val: 'Add working directories' },
        { key: '--settings FILE', val: 'Load additional settings' },
        { key: '--debug', val: 'Enable debug mode' },
      ]},
      { title: 'Auth Commands', rows: [
        { key: 'claude auth login', val: 'Sign in' },
        { key: 'claude auth logout', val: 'Sign out' },
        { key: 'claude auth status', val: 'Show auth status' },
        { key: 'claude update', val: 'Update to latest version' },
        { key: 'claude mcp', val: 'Configure MCP servers' },
      ]},
    ],
  },
  {
    id: 'permissions', title: 'Permission Modes', color: '#ffd740',
    sections: [
      { title: 'Cycle with Shift+Tab', rows: [
        { key: 'default', val: 'Read files only, ask for everything else' },
        { key: 'acceptEdits', val: 'Read + edit files without asking' },
        { key: 'plan', val: 'Read only, no edits allowed' },
        { key: 'auto', val: 'All actions (with background safety checks)' },
        { key: 'bypassPermissions', val: 'All actions, no checks (VMs only!)' },
        { key: 'dontAsk', val: 'Only pre-approved tools' },
      ]},
    ],
  },
  {
    id: 'memory', title: 'Memory & Files', color: '#ff9100',
    sections: [
      { title: 'CLAUDE.md Locations', rows: [
        { key: '~/.claude/CLAUDE.md', val: 'Global instructions (all projects)' },
        { key: '.claude/CLAUDE.md', val: 'Project-specific instructions' },
        { key: '.claude/rules/', val: 'Path-specific rules' },
      ]},
      { title: 'Settings Locations', rows: [
        { key: '~/.claude/settings.json', val: 'User settings (all projects)' },
        { key: '.claude/settings.json', val: 'Project settings (committed)' },
        { key: '.claude/settings.local.json', val: 'Project settings (local only)' },
      ]},
      { title: 'Auto Memory', rows: [
        { key: '~/.claude/projects/<path>/memory/', val: 'Auto-memory files per project' },
        { key: 'MEMORY.md', val: 'Memory index file (auto-loaded)' },
      ]},
      { title: 'Other Files', rows: [
        { key: '~/.claude/keybindings.json', val: 'Keybinding overrides' },
        { key: '~/.claude/mcp.json', val: 'MCP server config (global)' },
        { key: '.claude/mcp.json', val: 'MCP server config (project)' },
        { key: '~/.claude/hooks/', val: 'Global hook scripts' },
      ]},
    ],
  },
  {
    id: 'hooks', title: 'Hook Events', color: '#ff5252',
    sections: [
      { title: 'Session Lifecycle', rows: [
        { key: 'SessionStart', val: 'Session begins or resumes' },
        { key: 'SessionEnd', val: 'Session terminates' },
        { key: 'Stop', val: 'Claude finishes responding' },
        { key: 'StopFailure', val: 'Turn ends due to API error' },
      ]},
      { title: 'User Input', rows: [
        { key: 'UserPromptSubmit', val: 'User submits a prompt' },
        { key: 'Notification', val: 'Claude needs attention' },
      ]},
      { title: 'Tool Execution', rows: [
        { key: 'PreToolUse', val: 'Before tool call (can block)' },
        { key: 'PostToolUse', val: 'After tool call succeeds' },
        { key: 'PostToolUseFailure', val: 'After tool call fails' },
        { key: 'PermissionRequest', val: 'Permission dialog appears' },
      ]},
      { title: 'Agents & Tasks', rows: [
        { key: 'SubagentStart', val: 'Subagent spawned' },
        { key: 'SubagentStop', val: 'Subagent finished' },
        { key: 'TeammateIdle', val: 'Team member goes idle' },
        { key: 'TaskCompleted', val: 'Task marked completed' },
      ]},
      { title: 'Context & Config', rows: [
        { key: 'PreCompact', val: 'Before context compaction' },
        { key: 'PostCompact', val: 'After context compaction' },
        { key: 'InstructionsLoaded', val: 'CLAUDE.md / rules loaded' },
        { key: 'ConfigChange', val: 'Config file changes' },
      ]},
      { title: 'Worktree & MCP', rows: [
        { key: 'WorktreeCreate', val: 'Worktree created' },
        { key: 'WorktreeRemove', val: 'Worktree removed' },
        { key: 'Elicitation', val: 'MCP requests user input' },
        { key: 'ElicitationResult', val: 'User responds to MCP input' },
      ]},
      { title: 'Hook Types', rows: [
        { key: 'command', val: 'Shell command' },
        { key: 'http', val: 'POST to URL' },
        { key: 'prompt', val: 'LLM prompt' },
        { key: 'agent', val: 'Subagent invocation' },
      ]},
    ],
  },
  {
    id: 'env', title: 'Environment Variables', color: 'var(--cyan, #00d4ff)',
    sections: [
      { title: 'Authentication & API', rows: [
        { key: 'ANTHROPIC_API_KEY', val: 'API key (overrides subscription)' },
        { key: 'ANTHROPIC_BASE_URL', val: 'Override API endpoint' },
        { key: 'ANTHROPIC_MODEL', val: 'Model setting' },
      ]},
      { title: 'Cloud Providers', rows: [
        { key: 'CLAUDE_CODE_USE_BEDROCK', val: 'Use AWS Bedrock' },
        { key: 'CLAUDE_CODE_USE_VERTEX', val: 'Use Google Vertex AI' },
        { key: 'CLAUDE_CODE_USE_FOUNDRY', val: 'Use Microsoft Foundry' },
      ]},
      { title: 'Model Behavior', rows: [
        { key: 'CLAUDE_CODE_EFFORT_LEVEL', val: 'Effort: low / medium / high / max' },
        { key: 'MAX_THINKING_TOKENS', val: 'Extended thinking token budget' },
        { key: 'CLAUDE_CODE_MAX_OUTPUT_TOKENS', val: 'Max output tokens' },
        { key: 'CLAUDE_CODE_AUTO_COMPACT_WINDOW', val: 'Auto-compaction threshold' },
      ]},
      { title: 'Feature Toggles', rows: [
        { key: 'CLAUDE_CODE_DISABLE_AUTO_MEMORY', val: 'Disable auto memory' },
        { key: 'CLAUDE_CODE_DISABLE_FAST_MODE', val: 'Disable fast mode' },
        { key: 'CLAUDE_CODE_DISABLE_1M_CONTEXT', val: 'Disable 1M context' },
        { key: 'CLAUDE_CODE_DISABLE_BACKGROUND_TASKS', val: 'Disable background tasks' },
        { key: 'CLAUDE_CODE_DISABLE_CRON', val: 'Disable scheduled tasks' },
      ]},
      { title: 'Bash & Commands', rows: [
        { key: 'BASH_DEFAULT_TIMEOUT_MS', val: 'Default command timeout' },
        { key: 'BASH_MAX_TIMEOUT_MS', val: 'Max command timeout' },
        { key: 'BASH_MAX_OUTPUT_LENGTH', val: 'Max output chars before truncation' },
        { key: 'CLAUDE_CODE_SHELL', val: 'Override shell detection' },
      ]},
      { title: 'MCP', rows: [
        { key: 'MCP_TIMEOUT', val: 'MCP server startup timeout (ms)' },
        { key: 'MCP_TOOL_TIMEOUT', val: 'MCP tool execution timeout' },
        { key: 'MAX_MCP_OUTPUT_TOKENS', val: 'Max tokens in MCP responses' },
      ]},
      { title: 'Network', rows: [
        { key: 'HTTP_PROXY', val: 'HTTP proxy server' },
        { key: 'HTTPS_PROXY', val: 'HTTPS proxy server' },
        { key: 'CLAUDE_CONFIG_DIR', val: 'Custom config directory' },
      ]},
      { title: 'Telemetry (Disable)', rows: [
        { key: 'DISABLE_TELEMETRY', val: 'Opt out of telemetry' },
        { key: 'DISABLE_ERROR_REPORTING', val: 'Opt out of Sentry' },
        { key: 'DISABLE_AUTOUPDATER', val: 'Disable auto updates' },
      ]},
    ],
  },
  {
    id: 'terminal', title: 'Terminal Shortcuts', color: '#4dd0e1',
    sections: [
      { title: 'macOS Terminal / iTerm2', rows: [
        { key: '\u2318T', val: 'New tab', os: 'mac' },
        { key: '\u2318N', val: 'New window', os: 'mac' },
        { key: '\u2318W', val: 'Close tab / pane', os: 'mac' },
        { key: '\u2318D', val: 'Split pane vertically (iTerm2)', os: 'mac' },
        { key: '\u2318\u21E7D', val: 'Split pane horizontally (iTerm2)', os: 'mac' },
        { key: '\u2318[ / \u2318]', val: 'Switch panes (iTerm2)', os: 'mac' },
        { key: '\u2318K', val: 'Clear terminal buffer', os: 'mac' },
        { key: '\u2318\u21E7Left/Right', val: 'Switch tabs', os: 'mac' },
        { key: '\u2318F', val: 'Find in terminal', os: 'mac' },
        { key: '\u2318+ / \u2318-', val: 'Zoom in / out', os: 'mac' },
        { key: '\u2318,', val: 'Open preferences', os: 'mac' },
      ]},
      { title: 'Windows Terminal / PowerShell', rows: [
        { key: 'Ctrl+Shift+T', val: 'New tab', os: 'win' },
        { key: 'Ctrl+Shift+N', val: 'New window', os: 'win' },
        { key: 'Ctrl+Shift+W', val: 'Close tab / pane', os: 'win' },
        { key: 'Alt+Shift+D', val: 'Split pane (auto direction)', os: 'win' },
        { key: 'Alt+Shift+-', val: 'Split pane horizontally', os: 'win' },
        { key: 'Alt+Shift+=', val: 'Split pane vertically', os: 'win' },
        { key: 'Alt+Arrow', val: 'Switch panes', os: 'win' },
        { key: 'Ctrl+Shift+F', val: 'Find in terminal', os: 'win' },
        { key: 'Ctrl+Shift+1~9', val: 'Switch to tab by number', os: 'win' },
        { key: 'Ctrl+= / Ctrl+-', val: 'Zoom in / out', os: 'win' },
        { key: 'Ctrl+,', val: 'Open settings', os: 'win' },
      ]},
      { title: 'Shared (Bash / Zsh)', rows: [
        { key: 'Ctrl+A', val: 'Move cursor to start of line' },
        { key: 'Ctrl+E', val: 'Move cursor to end of line' },
        { key: 'Ctrl+W', val: 'Delete word before cursor' },
        { key: 'Ctrl+Z', val: 'Suspend process (fg to resume)' },
        { key: 'Tab', val: 'Autocomplete path / command' },
        { key: 'Tab Tab', val: 'Show all completions' },
        { key: '!!', val: 'Repeat last command' },
        { key: '!$', val: 'Last argument of previous command' },
      ]},
    ],
  },
  {
    id: 'keybindings', title: 'Keybinding Contexts', color: 'var(--pink, #ff00a8)',
    sections: [
      { title: '~/.claude/keybindings.json', rows: [
        { key: 'Global', val: 'Applies everywhere' },
        { key: 'Chat', val: 'Main chat input area' },
        { key: 'Autocomplete', val: 'Autocomplete menu open' },
        { key: 'Settings', val: 'Settings menu' },
        { key: 'Confirmation', val: 'Permission / confirmation dialogs' },
        { key: 'Tabs', val: 'Tab navigation' },
        { key: 'Help', val: 'Help menu visible' },
        { key: 'Transcript', val: 'Transcript viewer' },
        { key: 'HistorySearch', val: 'History search mode (Ctrl+R)' },
        { key: 'Task', val: 'Background task running' },
        { key: 'DiffDialog', val: 'Diff viewer' },
        { key: 'ModelPicker', val: 'Model picker' },
        { key: 'Plugin', val: 'Plugin dialog' },
        { key: 'Select', val: 'Generic select / list' },
        { key: 'Attachments', val: 'Image / attachment bar' },
      ]},
    ],
  },
]

// ── Component ─────────────────────────────────────────

export default function CheatSheet() {
  const [os, setOs] = useState<OS>('mac')
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (typeof navigator !== 'undefined' && !navigator.platform?.includes('Mac')) {
      setOs('win')
    }
  }, [])

  const getKey = useCallback((row: Row) => {
    if (row.keyMac && row.keyWin) return os === 'mac' ? row.keyMac : row.keyWin
    return row.key
  }, [os])

  const matchesQuery = useCallback((row: Row) => {
    if (!query) return true
    const q = query.toLowerCase()
    return row.key.toLowerCase().includes(q) || row.val.toLowerCase().includes(q)
      || (row.keyMac?.toLowerCase().includes(q)) || (row.keyWin?.toLowerCase().includes(q))
  }, [query])

  const isRowVisible = useCallback((row: Row) => {
    if (row.os && row.os !== os) return false
    return matchesQuery(row)
  }, [os, matchesQuery])

  const isSectionVisible = useCallback((section: Section) => {
    // Hide OS-specific section headers when wrong OS
    if (section.title.includes('macOS') && os === 'win') return false
    if (section.title.includes('Windows') && os === 'mac') return false
    return section.rows.some(isRowVisible)
  }, [os, isRowVisible])

  const isCardVisible = useCallback((card: Card) => {
    return card.sections.some(isSectionVisible)
  }, [isSectionVisible])

  return (
    <>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <div
          className="inline-flex rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--glass)' }}
        >
          {(['mac', 'win'] as const).map(o => (
            <button
              key={o}
              onClick={() => setOs(o)}
              className="px-5 py-2 text-xs font-semibold transition-all"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                background: os === o ? 'var(--cyan)' : 'transparent',
                color: os === o ? '#000' : 'var(--text-muted)',
                boxShadow: os === o ? '0 0 12px rgba(0,212,255,0.4)' : 'none',
              }}
            >
              {o === 'mac' ? 'macOS' : 'Windows / Linux'}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search commands, shortcuts, flags..."
          className="w-full sm:w-80 px-3 py-2 rounded-lg text-sm outline-none transition-all"
          style={{
            border: '1px solid var(--border)',
            background: 'var(--glass)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {CARDS.map(card => !isCardVisible(card) ? null : (
          <div
            key={card.id}
            className="rounded-xl overflow-hidden transition-all"
            style={{
              background: 'var(--glass)',
              border: '1px solid var(--glass-border, var(--border))',
            }}
          >
            {/* Header */}
            <div
              className="px-3 py-2 text-xs font-bold uppercase tracking-widest"
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                background: card.color,
                color: '#000',
                boxShadow: `0 2px 12px ${card.color}40`,
              }}
            >
              {card.title}
            </div>

            {/* Body */}
            <div className="px-3 py-2">
              {card.sections.map(section => !isSectionVisible(section) ? null : (
                <div key={section.title}>
                  <div
                    className="text-[0.65rem] font-bold uppercase tracking-wider mt-3 mb-1 pb-1 first:mt-0"
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {section.title}
                  </div>
                  {section.rows.map(row => !isRowVisible(row) ? null : (
                    <div
                      key={row.key + row.val}
                      className="flex gap-2 py-1 items-baseline"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <span
                        className="font-mono text-xs font-medium whitespace-nowrap shrink-0"
                        style={{ color: 'var(--cyan)' }}
                      >
                        {getKey(row)}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {row.val}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
