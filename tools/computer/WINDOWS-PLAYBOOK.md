# Windows playbook

Practical shortcuts and app-specific moves. Skim the section for the app you are about to drive.

## Answer without the GUI when you can

Many "look in Settings" questions are one command away, which is faster and more reliable than
clicking through pages:

| Question | Command |
|---|---|
| Resolution and scaling | `tools\computer\windows.ps1 info` |
| Wi-Fi network and signal | `netsh wlan show interfaces` |
| Disk space | `Get-PSDrive -PSProvider FileSystem` |
| Battery | `Get-CimInstance Win32_Battery` |
| Installed apps | `Get-StartApps`, or `winget list` |
| Windows version | `Get-ComputerInfo -Property OsName, OsVersion` |
| What is running | `Get-Process`, `windows.ps1 list` |

Only read settings this way. Changing system settings needs the user's go-ahead, and security
settings (Defender, firewall, UAC, BitLocker) are for the user to change themselves.

## Open things directly

- Apps: `windows.ps1 launch -Target notepad.exe` (also `calc.exe`, `mspaint.exe`, `explorer.exe`
  with a folder path as `-Arguments`). For Store apps, `Get-StartApps` gives the AppID, which
  `launch -Target "shell:AppsFolder\<AppID>"` opens.
- Settings pages via URI: `ms-settings:display`, `ms-settings:sound`, `ms-settings:network-wifi`,
  `ms-settings:bluetooth`, `ms-settings:windowsupdate`, `ms-settings:appsfeatures`,
  `ms-settings:defaultapps`, `ms-settings:personalization-background`, `ms-settings:dateandtime`,
  `ms-settings:powersleep`, `ms-settings:printers`, `ms-settings:notifications`.
- Classic panels: `control`, `ncpa.cpl` (network adapters), `appwiz.cpl` (programs),
  `mmsys.cpl` (sound devices), `timedate.cpl`.

## Shortcuts that work almost everywhere

| Keys | Effect |
|---|---|
| Ctrl+S, Ctrl+O, Ctrl+N, Ctrl+P | Save, open, new, print |
| F12 or Ctrl+Shift+S | Save As (Office uses F12) |
| Ctrl+Z / Ctrl+Y | Undo / redo - your first move after a wrong action |
| Ctrl+F, Ctrl+H | Find, replace |
| Ctrl+W or Ctrl+F4 | Close the current tab or document |
| Alt+F4 | Close the window (it may ask to save - read the prompt) |
| Tab / Shift+Tab | Move focus between controls |
| Space / Enter | Press the focused button, tick the focused checkbox / activate the default button |
| Esc | Cancel or close a dialog or menu |
| Alt, then a letter | Open menus; in Office it shows Key Tips on the ribbon |
| Shift+F10 | Right-click menu for the focused item |
| F2 / F5 | Rename / refresh |
| Win+E, Win+R, Win+I | File Explorer, Run box, Settings |
| Win+Up, Win+Down, Win+Left/Right | Maximize, restore/minimize, snap |

## File Explorer

- Jump to a folder: Ctrl+L (or Alt+D), type the full path, Enter. Much faster than the tree.
- New folder: Ctrl+Shift+N, type the name, Enter. Rename: F2. Search: Ctrl+E.
- Delete sends items to the Recycle Bin. Shift+Delete deletes permanently - don't, unless the user
  explicitly asks and confirms.
- Most file chores (copy, move, rename, zip) are faster and safer in PowerShell. Use Explorer when
  the user wants to watch it happen or the job is inherently visual (for example dragging into an app).

## Open and Save As dialogs

- Type a full path such as `C:\Users\me\Documents\report.docx` into the "File name" box and press
  Enter; there's no need to click through folders. Alt+N jumps to that box and Ctrl+A selects what
  is already in it, so from the keyboard: `key "alt+n ctrl+a"`, `type` the path, `key enter`.
- UI Automation reports these classic fields as `Pane`s with no value or invoke support: the File
  name box is `-AutomationId 1001` (the one beside the "File name:" label - the address bar reuses
  1001) and the Save/Open button is `-AutomationId 1`. The keyboard route above is quicker.
- "Already exists - replace it?" is a checkpoint. Confirm with the user unless they asked to overwrite.
- These dialogs are their own windows: target them with `-Window "Save As"` or `-Window Open`.

## Microsoft Office

- Press and release Alt to show Key Tips, then type the letters shown. It's the most reliable way to
  reach ribbon commands.
- Excel: Ctrl+G (Go To) then a cell reference like `B7`; type values or formulas (`=SUM(B2:B10)`),
  then Enter. Ctrl+Arrow jumps to data edges; Ctrl+Shift+L toggles filters.
- Word: Ctrl+Home / Ctrl+End; Ctrl+Alt+1/2/3 apply Heading 1/2/3; Ctrl+H find and replace.
- Heavy editing or large data entry is often better done in the file itself with a script or library
  (openpyxl, python-docx), then opening the result for the user to see.

## Messaging and email apps (WhatsApp, Outlook, Teams, Slack desktop)

- Enter usually sends. Use Shift+Enter for line breaks, and treat the final Enter as a send that
  needs the user's confirmation.
- Prefer an MCP server (Gmail, Slack) when one is connected. Don't browse unrelated conversations.
- Apps that draw their window with WebView2 (WhatsApp, Teams, new Outlook) sometimes render blank in
  a `-Background` capture; use `-Window X` (front) or `-NoFocus` for those.

## Settings app

- Win+I, then type in the search box at the top.
- Toggles are usually named after the setting: `uia.ps1 act -Window Settings -Name "Night light" -Do toggle`.
  Check the state with a screenshot before and after, because the name doesn't show on/off.

## Browsers, terminals and code editors

- Web pages: use your browser tool rather than screen control. It sees the page structure, is
  faster, and respects site permissions.
- Terminals, VS Code, Antigravity itself: run commands in the terminal and edit files with file
  tools. Screen control there is for clicking a button or reading visible output only - and never
  type into the window you are being driven from.

## When automation gets blocked

| Blocker | What to do |
|---|---|
| UAC prompt or an app running as administrator | Ask the user to handle it; input can't reach it |
| Sign-in page, 2FA code, CAPTCHA | Hand over to the user, then continue |
| App not responding | Wait about 5 seconds and look again; ask before force-closing anything |
| A window stays blank or dark (common with WhatsApp and other WebView apps after a long idle) | Wait a few seconds; resize it (`windows.ps1 restore`, then `maximize`); if it is still blank, ask the user, then restart the app - close request first, and stop only that app's own processes |
| Window off-screen or on another monitor | `windows.ps1 maximize -Window X` |
| A notification covers the target | Wait a few seconds or press Esc, then look again |
| Another app jumped to the front, or your window vanished | The user is probably at the keyboard. The input guard blocks stray keystrokes; pause and ask before refocusing, then check what was already done before continuing |
| Remote desktop or VM window | UI Automation sees only the outer window; rely on screenshots and the keyboard |
