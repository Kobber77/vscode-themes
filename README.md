# 🎉 VS Code Themes

A collection of VS Code color themes. Each theme is its own extension with its own icon and `.vsix`, so you can install only the ones you want.

| Theme | Folder | Vibe |
|-------|--------|------|
| ☘️ St. Patrick's Day | [`st-patricks-day-theme/`](st-patricks-day-theme/) | Forest green, Irish orange, lucky gold |
| 🎃 Halloween | [`halloween-theme/`](halloween-theme/) | Midnight purple, pumpkin orange, slime green, emoji typing effects. Also a [Neovim port](halloween-theme/neovim/) |

## Installation

Each theme folder contains a prebuilt `.vsix`:

1. Open VS Code → Extensions (`Ctrl+Shift+X`)
2. Click `...` → **Install from VSIX...**
3. Pick the `.vsix` from the theme folder and reload
4. Command Palette → **Preferences: Color Theme** → choose the theme

## Development

```bash
code .
# Run and Debug → pick "St. Patrick's Day Theme" or "Halloween Theme" → F5
```

### Build a VSIX
```bash
npm install -g @vscode/vsce
cd halloween-theme      # or st-patricks-day-theme
vsce package
```

## Adding a new theme

1. Copy an existing theme folder, e.g. `cp -r halloween-theme my-new-theme`
2. Update `package.json` (`name`, `displayName`, `description`, `keywords`, `contributes.themes`, `repository.directory`)
3. Edit `themes/<name>-color-theme.json` and `icon.svg`, then render the icon:
   `rsvg-convert -w 128 -h 128 icon.svg -o icon.png`
4. Add a launch configuration in `.vscode/launch.json`
5. Add a row to the table above

## License

MIT
