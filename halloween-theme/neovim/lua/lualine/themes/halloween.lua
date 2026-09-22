-- lualine theme matching the 🎃 Halloween colorscheme
-- require("lualine").setup({ options = { theme = "halloween" } })
local c = {
  bg = "#14091F", bg3 = "#1A0D2B", bg4 = "#22123A", bg5 = "#2A1245",
  ghost = "#F2ECF7", bone = "#E8DCC8", punct = "#A897BD",
  pumpkin = "#FF7518", fill = "#B8490B", purple_deep = "#7B2CBF",
  slime = "#8DF56B", candy = "#FFC93C", blood_deep = "#E0223B", teal = "#7FE0D6",
}

return {
  normal = {
    a = { fg = c.bg, bg = c.pumpkin, gui = "bold" },
    b = { fg = c.ghost, bg = c.fill },
    c = { fg = c.bone, bg = c.bg4 },
  },
  insert = {
    a = { fg = c.bg, bg = c.slime, gui = "bold" },
    b = { fg = c.ghost, bg = c.bg5 },
    c = { fg = c.bone, bg = c.bg4 },
  },
  visual = {
    a = { fg = c.ghost, bg = c.purple_deep, gui = "bold" },
    b = { fg = c.ghost, bg = c.bg5 },
    c = { fg = c.bone, bg = c.bg4 },
  },
  replace = {
    a = { fg = c.ghost, bg = c.blood_deep, gui = "bold" },
    b = { fg = c.ghost, bg = c.bg5 },
    c = { fg = c.bone, bg = c.bg4 },
  },
  command = {
    a = { fg = c.bg, bg = c.candy, gui = "bold" },
    b = { fg = c.ghost, bg = c.bg5 },
    c = { fg = c.bone, bg = c.bg4 },
  },
  terminal = {
    a = { fg = c.bg, bg = c.teal, gui = "bold" },
    b = { fg = c.ghost, bg = c.bg5 },
    c = { fg = c.bone, bg = c.bg4 },
  },
  inactive = {
    a = { fg = c.punct, bg = "#1E0B33" },
    b = { fg = c.punct, bg = "#1E0B33" },
    c = { fg = c.punct, bg = c.bg3 },
  },
}
