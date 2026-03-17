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

## Installation

### From VSIX (manual)
1. Download the `.vsix` file
2. Open VS Code → Extensions (`Ctrl+Shift+X`)
3. Click `...` → **Install from VSIX...**
4. Select the file and reload

### From source (development)
```bash
cd st-patricks-day-theme
code .
# Press F5 to launch Extension Development Host
# Then: Command Palette → Color Theme → ☘️ St. Patrick's Day
```

### Build VSIX
```bash
npm install -g @vscode/vsce
vsce package
```

## License

MIT
