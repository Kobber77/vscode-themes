# 🎃 Halloween for Neovim

Same palette as the VS Code theme: midnight purple, pumpkin keywords, slime strings, candy corn functions, witch purple types, blood red numbers. Covers Vim syntax, Treesitter, LSP semantic tokens, diagnostics, and common plugins (telescope, nvim-cmp, blink, nvim-tree, neo-tree, oil, gitsigns, indent-blankline, rainbow-delimiters, which-key, lazy, mason, notify, noice, flash, leap, bufferline, trouble, todo-comments, render-markdown, mini, snacks). Needs Neovim 0.8+ and `termguicolors`.

## Install

### Quick (single file)
```bash
mkdir -p ~/.config/nvim/colors
curl -fsSL -o ~/.config/nvim/colors/halloween.lua \
  https://raw.githubusercontent.com/Kobber77/vscode-themes/main/halloween-theme/neovim/colors/halloween.lua
```
Then in `init.lua`:
```lua
vim.cmd.colorscheme("halloween")
```

### lazy.nvim
```lua
{
  "Kobber77/vscode-themes",
  lazy = false,
  priority = 1000,
  config = function(plugin)
    vim.opt.rtp:append(plugin.dir .. "/halloween-theme/neovim")
    vim.cmd.colorscheme("halloween")
  end,
}
```

### lualine
```lua
require("lualine").setup({ options = { theme = "halloween" } })
```
Requires the lazy.nvim install (or copying `lua/lualine/themes/halloween.lua` into your config's `lua/lualine/themes/`).

## Not ported
The emoji typing effects, comment emojis, gutter icons and countdown live in the VS Code extension. For comment keywords, `todo-comments.nvim` picks up the themed `TodoBg*`/`TodoFg*` groups.
