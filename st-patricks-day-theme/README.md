# ☘️ St. Patrick's Day Theme

A lucky VS Code color theme inspired by St. Patrick's Day — leprechauns, clovers, and shamrocks, built around the Irish flag palette.

## Color Palette

| Role | Color |
|------|-------|
| Background | `#0D2A14` — deep forest green |
| Activity Bar | `#009A44` — Irish green |
| Keywords | `#FF8200` — Irish orange |
| Strings | `#4CCA7A` — light green |
| Functions | `#FFB347` — soft orange |
| Types / Classes | `#009A44` — Irish green |
| Comments | `#3D7A52` — muted green (italic) |
| Numbers | `#FFD700` — lucky gold |
| Foreground | `#FFFFFF` — white |

## Lucky Details

- **Semantic highlighting** on: `self`/`cls` in Irish orange, dunder methods Irish green, deprecated symbols struck through
- **Ghost text** (inline suggestions) and dead code fade into the clover
- **Bracket pairs** cycle orange, Irish green, light green, gold, red, mint
- **Docstrings** in dim italic; string quotes dim to deep green
- **Menus, pickers, hovers, notebooks, debug, testing** all themed to match

## Effects

Effects only run while ☘️ St. Patrick's Day is the active color theme (setting `stpatricks.onlyWhenThemeActive`).

| Effect | What happens | Setting |
|--------|--------------|---------|
| Typing pops | Every 4th keystroke a ☘️ 🍀 🌈 🪙 🎩 🍺 pops after the cursor and vanishes | `stpatricks.typingEffects.*` |
| Comment emojis | 🍀 TODO, 🍺 FIXME, 🐍 BUG, 🎩 HACK, 🌈 XXX, 🪙 NOTE, 🍂 DEPRECATED / `@deprecated` | `stpatricks.commentEmojis.enabled` |
| Gutter icons | Snake on error lines (drive them out), pot of gold on warning lines | `stpatricks.gutterIcons.enabled` |
| Status bar | `☘️ 135 days to St. Patrick's Day`, click to cycle installed Kobber themes | `stpatricks.statusBar.enabled`, `stpatricks.cycleThemes` |
| Save messages | Occasional "🍀 Saved. Luck of the Irish." in the status bar | `stpatricks.saveMessages.enabled` |
| Snippets | `lucky` banner, `shamrock` ASCII art, `luck` TODO (any language with line comments) | |

Commands (`Cmd+Shift+P`): **St. Patrick's: Find the Pot of Gold**, **St. Patrick's: Toggle Typing Effects**, **St. Patrick's: Cycle Color Theme**.

## Installation

### From VSIX (manual)
1. Download the `.vsix` file
2. Open VS Code → Extensions (`Ctrl+Shift+X`)
3. Click `...` → **Install from VSIX...**
4. Select the file and reload

### From source (development)
```bash
cd vscode-themes
code .
# Run and Debug → "St. Patrick's Day Theme" → F5 to launch Extension Development Host
# Then: Command Palette → Color Theme → ☘️ St. Patrick's Day
```

### Build VSIX
```bash
npm install -g @vscode/vsce
cd st-patricks-day-theme
vsce package
```

## License

MIT
