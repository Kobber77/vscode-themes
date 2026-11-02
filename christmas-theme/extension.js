// Christmas effects: typing emoji pops, comment emojis, diagnostic gutter icons,
// countdown status bar with theme cycling, save messages, falling snow. No CSS injection.
const vscode = require('vscode');
const path = require('path');

const THEME_LABEL = '🎄 Christmas';
const POP_EMOJIS = ['🎄', '🎅', '❄️', '🎁', '⭐', '🦌', '🔔', '🍪', '☃️', '🧦', '🍭', '🕯️'];
const SAVE_MESSAGES = [
  '🎅 Saved. Santa saw that.',
  '🎁 Wrapped and saved.',
  '📜 Added to the nice list.',
  '🦌 Rudolph approves this commit.',
  '❄️ Frozen in time.',
  '🍪 Saved. Leave a cookie out for the build.',
  '🔔 Jingle all the way to prod.',
];
const COMMENT_EMOJIS = {
  TODO: '🎁',
  FIXME: '🔥',
  BUG: '🦌',
  HACK: '🧝',
  XXX: '🧨',
  NOTE: '📜',
  DEPRECATED: '❄️',
};
const KEYWORD_RE = new RegExp('(?:@(deprecated)\\b)|\\b(' + Object.keys(COMMENT_EMOJIS).join('|') + ')\\b', 'g');
const COMMENT_MARKER_RE = /(\/\/|#|\/\*|^\s*\*|--|<!--|;|"""|''')/;
const POP_MS = 650;
const MAX_LIVE_POPS = 8;
const SNOW_FLAKES = ['❄️', '❅', '❆', '·'];
const SNOW_COUNT = 18;
const SNOW_FRAME_MS = 90;

/** @type {vscode.TextEditorDecorationType[]} */
let livePops = [];
let keystrokes = 0;
let commentTypes = {};
let gutterTypes = {};
let snowType;
let snowTimer;
let statusItem;
let statusTimer;
let commentDebounce;
/** @type {vscode.Disposable[]} */
let subs = [];

// ---- helpers (pure) --------------------------------------------------------

function daysToChristmas(now = new Date()) {
  const year = now.getFullYear();
  let target = new Date(year, 11, 25);
  const today = new Date(year, now.getMonth(), now.getDate());
  if (today > target) target = new Date(year + 1, 11, 25);
  return Math.round((target - today) / 86400000);
}

function statusText(days) {
  if (days === 0) return '🎅 Merry Christmas!';
  if (days === 1) return '🎄 Christmas Eve!';
  return `🎄 ${days} days to Christmas`;
}

/** Find comment keywords in one line. Returns [{start, end, emoji}] */
function findCommentKeywords(line) {
  const out = [];
  KEYWORD_RE.lastIndex = 0;
  let m;
  while ((m = KEYWORD_RE.exec(line))) {
    const idx = m.index;
    const jsdoc = !!m[1];
    if (!jsdoc && !COMMENT_MARKER_RE.test(line.slice(0, idx))) continue;
    const key = jsdoc ? 'DEPRECATED' : m[2];
    out.push({ start: idx, end: idx + m[0].length, emoji: COMMENT_EMOJIS[key] });
  }
  return out;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---- settings ---------------------------------------------------------------

function cfg() {
  const c = vscode.workspace.getConfiguration('christmas');
  return {
    onlyWhenThemeActive: c.get('onlyWhenThemeActive', true),
    typingEnabled: c.get('typingEffects.enabled', true),
    typingEvery: Math.max(1, c.get('typingEffects.every', 4)),
    commentsEnabled: c.get('commentEmojis.enabled', true),
    gutterEnabled: c.get('gutterIcons.enabled', true),
    statusEnabled: c.get('statusBar.enabled', true),
    saveEnabled: c.get('saveMessages.enabled', true),
    cycleThemes: c.get('cycleThemes', []),
  };
}

function themeActive() {
  const s = cfg();
  if (!s.onlyWhenThemeActive) return true;
  return vscode.workspace.getConfiguration('workbench').get('colorTheme') === THEME_LABEL;
}

function isRealDoc(doc) {
  return ['file', 'untitled', 'vscode-notebook-cell'].includes(doc.uri.scheme);
}

// ---- typing pops ------------------------------------------------------------

function pop(editor, pos) {
  const type = vscode.window.createTextEditorDecorationType({
    after: {
      contentText: pick(POP_EMOJIS),
      margin: `0 0 0 ${4 + Math.floor(Math.random() * 10)}px`,
    },
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  });
  editor.setDecorations(type, [new vscode.Range(pos, pos)]);
  livePops.push(type);
  while (livePops.length > MAX_LIVE_POPS) livePops.shift().dispose();
  setTimeout(() => {
    type.dispose();
    livePops = livePops.filter((t) => t !== type);
  }, POP_MS);
}

function onTextChange(e) {
  const s = cfg();
  if (!s.typingEnabled || !themeActive()) return;
  const editor = vscode.window.activeTextEditor;
  if (!editor || editor.document !== e.document || !isRealDoc(e.document)) return;
  if (e.contentChanges.length !== 1) return;
  const change = e.contentChanges[0];
  if (!change.text || change.text.length > 2) return; // typing, not paste
  keystrokes += 1;
  if (keystrokes % s.typingEvery !== 0) return;
  setTimeout(() => {
    const ed = vscode.window.activeTextEditor;
    if (ed && ed.document === e.document) pop(ed, ed.selection.active);
  }, 0);
}

// ---- let it snow ------------------------------------------------------------

function stopSnow() {
  clearInterval(snowTimer);
  snowTimer = undefined;
  if (snowType) snowType.dispose();
  snowType = undefined;
}

/** Flakes fall one line per frame down the visible range, drifting a column now and then. */
function letItSnow() {
  const editor = vscode.window.activeTextEditor;
  if (!editor || !editor.visibleRanges.length) return;
  stopSnow();
  const doc = editor.document;
  const first = editor.visibleRanges[0].start.line;
  const last = Math.min(editor.visibleRanges[editor.visibleRanges.length - 1].end.line, doc.lineCount - 1);
  const flakes = [];
  for (let i = 0; i < SNOW_COUNT; i += 1) {
    flakes.push({ line: first - Math.floor(Math.random() * 12), col: Math.floor(Math.random() * 70), char: pick(SNOW_FLAKES) });
  }
  snowType = vscode.window.createTextEditorDecorationType({
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
  });
  const type = snowType;
  snowTimer = setInterval(() => {
    const opts = [];
    for (const f of flakes) {
      f.line += 1;
      if (Math.random() < 0.3) f.col = Math.max(0, f.col + (Math.random() < 0.5 ? -1 : 1));
      if (f.line < first || f.line > last) continue;
      const col = Math.min(f.col, doc.lineAt(f.line).text.length);
      opts.push({
        range: new vscode.Range(f.line, col, f.line, col),
        renderOptions: { after: { contentText: f.char, color: '#F2F6FC' } },
      });
    }
    if (snowType !== type) return;
    editor.setDecorations(type, opts);
    if (flakes.every((f) => f.line > last)) stopSnow();
  }, SNOW_FRAME_MS);
}

// ---- comment emojis ---------------------------------------------------------

function ensureCommentTypes() {
  if (Object.keys(commentTypes).length) return;
  for (const emoji of new Set(Object.values(COMMENT_EMOJIS))) {
    commentTypes[emoji] = vscode.window.createTextEditorDecorationType({
      after: { contentText: ` ${emoji}`, margin: '0 0 0 2px' },
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });
  }
}

function decorateComments(editor) {
  ensureCommentTypes();
  const s = cfg();
  const on = s.commentsEnabled && themeActive() && isRealDoc(editor.document);
  const byEmoji = {};
  for (const emoji of Object.keys(commentTypes)) byEmoji[emoji] = [];
  if (on) {
    const doc = editor.document;
    const max = Math.min(doc.lineCount, 5000);
    for (let ln = 0; ln < max; ln += 1) {
      const text = doc.lineAt(ln).text;
      if (!text) continue;
      for (const hit of findCommentKeywords(text)) {
        byEmoji[hit.emoji].push(new vscode.Range(ln, hit.start, ln, hit.end));
      }
    }
  }
  for (const [emoji, ranges] of Object.entries(byEmoji)) editor.setDecorations(commentTypes[emoji], ranges);
}

function scheduleComments(doc) {
  clearTimeout(commentDebounce);
  commentDebounce = setTimeout(() => {
    for (const ed of vscode.window.visibleTextEditors) {
      if (!doc || ed.document === doc) decorateComments(ed);
    }
  }, 200);
}

// ---- gutter icons from diagnostics ------------------------------------------

function ensureGutterTypes(ctx) {
  if (Object.keys(gutterTypes).length) return;
  const mk = (file) =>
    vscode.window.createTextEditorDecorationType({
      gutterIconPath: vscode.Uri.file(path.join(ctx.extensionPath, 'media', file)),
      gutterIconSize: 'contain',
    });
  gutterTypes.error = mk('coal.svg');
  gutterTypes.warning = mk('bell.svg');
}

function decorateGutter(ctx, editor) {
  ensureGutterTypes(ctx);
  const s = cfg();
  const on = s.gutterEnabled && themeActive() && isRealDoc(editor.document);
  const errors = [];
  const warnings = [];
  if (on) {
    const seenE = new Set();
    const seenW = new Set();
    for (const d of vscode.languages.getDiagnostics(editor.document.uri)) {
      const ln = d.range.start.line;
      if (d.severity === vscode.DiagnosticSeverity.Error && !seenE.has(ln)) {
        seenE.add(ln);
        errors.push(new vscode.Range(ln, 0, ln, 0));
      } else if (d.severity === vscode.DiagnosticSeverity.Warning && !seenW.has(ln) && !seenE.has(ln)) {
        seenW.add(ln);
        warnings.push(new vscode.Range(ln, 0, ln, 0));
      }
    }
  }
  editor.setDecorations(gutterTypes.error, errors);
  editor.setDecorations(gutterTypes.warning, warnings);
}

function refreshGutterAll(ctx) {
  for (const ed of vscode.window.visibleTextEditors) decorateGutter(ctx, ed);
}

// ---- status bar + theme cycling --------------------------------------------

function updateStatus() {
  if (!statusItem) return;
  const s = cfg();
  if (!s.statusEnabled) {
    statusItem.hide();
    return;
  }
  statusItem.text = themeActive() ? statusText(daysToChristmas()) : '🎄';
  statusItem.tooltip = 'Christmas: click to cycle color themes';
  statusItem.show();
}

function installedThemeLabels() {
  const s = cfg();
  if (Array.isArray(s.cycleThemes) && s.cycleThemes.length) return s.cycleThemes;
  const labels = [];
  for (const ext of vscode.extensions.all) {
    const pkg = ext.packageJSON || {};
    if (pkg.publisher !== 'Kobber') continue;
    for (const t of (pkg.contributes && pkg.contributes.themes) || []) labels.push(t.label || t.id);
  }
  return labels;
}

async function cycleTheme() {
  const labels = installedThemeLabels();
  if (labels.length < 2) {
    vscode.window.showInformationMessage('🎄 Only one theme to cycle. Install another from the vscode-themes repo or set christmas.cycleThemes.');
    return;
  }
  const wb = vscode.workspace.getConfiguration('workbench');
  const current = wb.get('colorTheme');
  const idx = labels.indexOf(current);
  const next = labels[(idx + 1) % labels.length];
  await wb.update('colorTheme', next, vscode.ConfigurationTarget.Global);
  vscode.window.setStatusBarMessage(`Switched to ${next}`, 2500);
}

// ---- save messages ----------------------------------------------------------

function onSave(doc) {
  const s = cfg();
  if (!s.saveEnabled || !themeActive() || !isRealDoc(doc)) return;
  if (Math.random() > 0.34) return;
  vscode.window.setStatusBarMessage(pick(SAVE_MESSAGES), 3000);
}

// ---- lifecycle --------------------------------------------------------------

async function toggleEffects() {
  const c = vscode.workspace.getConfiguration('christmas');
  const now = !c.get('typingEffects.enabled', true);
  await c.update('typingEffects.enabled', now, vscode.ConfigurationTarget.Global);
  vscode.window.setStatusBarMessage(now ? '🎄 Typing effects on' : '💤 Typing effects off', 2000);
}

function refreshAll(ctx) {
  for (const ed of vscode.window.visibleTextEditors) {
    decorateComments(ed);
    decorateGutter(ctx, ed);
  }
  updateStatus();
}

function activate(ctx) {
  statusItem = vscode.window.createStatusBarItem('christmas.countdown', vscode.StatusBarAlignment.Right, 100);
  statusItem.name = 'Christmas countdown';
  statusItem.command = 'christmas.cycleTheme';
  statusTimer = setInterval(updateStatus, 60 * 60 * 1000);

  subs = [
    statusItem,
    vscode.commands.registerCommand('christmas.cycleTheme', cycleTheme),
    vscode.commands.registerCommand('christmas.toggleEffects', toggleEffects),
    vscode.commands.registerCommand('christmas.letItSnow', letItSnow),
    vscode.workspace.onDidChangeTextDocument((e) => {
      onTextChange(e);
      scheduleComments(e.document);
    }),
    vscode.workspace.onDidSaveTextDocument(onSave),
    vscode.window.onDidChangeVisibleTextEditors(() => refreshAll(ctx)),
    vscode.window.onDidChangeActiveTextEditor(() => {
      stopSnow();
      refreshAll(ctx);
    }),
    vscode.languages.onDidChangeDiagnostics(() => refreshGutterAll(ctx)),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('christmas') || e.affectsConfiguration('workbench.colorTheme')) refreshAll(ctx);
    }),
  ];
  ctx.subscriptions.push(...subs);
  refreshAll(ctx);
}

function deactivate() {
  clearInterval(statusTimer);
  clearTimeout(commentDebounce);
  stopSnow();
  for (const t of livePops) t.dispose();
  for (const t of Object.values(commentTypes)) t.dispose();
  for (const t of Object.values(gutterTypes)) t.dispose();
  livePops = [];
  commentTypes = {};
  gutterTypes = {};
}

module.exports = { activate, deactivate, _internal: { daysToChristmas, statusText, findCommentKeywords } };
