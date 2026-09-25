# Windows screen-control scripts - command reference

Five PowerShell scripts plus a shared helper. Run each one as:

```
powershell -NoProfile -ExecutionPolicy Bypass -File "tools\computer\<script>.ps1" <action> [options]
```

The same line works from Git Bash or any shell that can reach `powershell`. Each run takes about
1-2 seconds because it compiles a small helper at start-up, so prefer a few meaningful calls over
many tiny ones.

Requirements: Windows 10/11 and Windows PowerShell 5.1 (`powershell.exe` - the one that ships with
Windows). PowerShell 7 (`pwsh`) works for most commands but `uia.ps1` needs the .NET Framework UI
Automation assemblies, so always invoke `powershell`, not `pwsh`.

## Coordinates

- The scripts use **physical screen pixels** everywhere. With display scaling (150% is common on
  laptops) these differ from "logical" pixels, so never mix numbers from other tools with them.
- `screenshot.ps1` remembers how its latest image maps onto the screen. `input.ps1` defaults to
  `-Space image`, so you can pass a point read straight off the most recent screenshot image.
- `uia.ps1` prints `center=x,y` (physical - use with `input.ps1 -Space screen`) and `norm=x,y`
  (a fraction of the primary screen; multiply by an image's width and height to place it on any
  other screenshot).

## windows.ps1 - screen and windows

| Command | What it does |
|---|---|
| `info` | Scaling, monitors, cursor position, foreground window |
| `list` | Visible windows, front-most first; `*` marks the foreground one |
| `focus -Window X` | Restore and bring to front. X = process name, title text, or handle |
| `maximize` / `minimize` / `restore -Window X` | Change window state (and focus it) |
| `launch -Target T [-Arguments A] [-Window X]` | Start an exe, file, folder or URI, wait for its new window, focus it |

`-TimeoutSec` (default 15) bounds how long `launch` waits for the window to appear.

## screenshot.ps1 - see the screen

| Command | What it does |
|---|---|
| `screenshot.ps1` | Whole primary screen, downscaled to at most 1400 px wide |
| `screenshot.ps1 -Window X` | One window, brought to the front first |
| `screenshot.ps1 -Window X -Background` | The window's own pixels even when other windows cover it, without changing focus. Use it to check progress while the user works in another app. Not for minimized windows |
| `screenshot.ps1 -Window X -NoFocus` | That screen area exactly as it is, so it shows whatever is on top |
| `screenshot.ps1 -Region "x,y,w,h"` | A physical-pixel area at full detail, for reading small text |
| `-Out path` | Save somewhere specific (default: `%TEMP%\use-computer\shot-*.png`) |
| `-MaxWidth n` | Downscale ceiling (default 1400) |

The script prints the saved path and the pixel mapping. Open that PNG to look at it. Old shots pile
up in `%TEMP%\use-computer`; delete the ones you made when the task is done.

## uia.ps1 - find and operate elements by name

| Command | What it does |
|---|---|
| `tree -Window X [-Depth 8] [-Max 80]` | Outline of the named and interactive elements |
| `find -Window X [-Name text] [-Type Button] [-AutomationId id] [-Exact] [-Max 80]` | Numbered matches, on-screen and enabled ones first |
| `act <same filters> [-Index n] -Do <action> [-Value v]` | Act on match number n (default 0) |
| `focused` | The element that has keyboard focus, and its window |

`-Do` actions: `invoke` (default; falls back to toggle, select, expand, then a real click),
`click`, `double`, `right`, `toggle`, `select`, `expand`, `collapse`, `focus`,
`setvalue -Value ...` (falls back to clicking into the field and typing, but only if that app comes
to the front), `gettext`, `scrollintoview`.

- `-Name` is a case-insensitive substring unless you add `-Exact`.
- Common `-Type` values: Button, Edit, Text, MenuItem, Menu, ListItem, TreeItem, TabItem, CheckBox,
  RadioButton, ComboBox, Hyperlink, Document, DataItem, Window, Pane.
- Context menus, dropdown lists and some popups are separate top-level windows. If an element won't
  show up inside the app window, search `-Window desktop` (slower) or run `windows.ps1 list`.
- `invoke` on a button that opens a modal dialog can block; the script gives up after 4 seconds,
  says so, and exits. Take a screenshot to see the dialog.
- Classic Win32 controls inside modern dialogs often appear as `Pane` with no value or invoke
  support. In Save As / Open dialogs the File name box is `-AutomationId 1001` (beside the
  "File name:" label; the address bar reuses 1001) and the Save/Open button is `-AutomationId 1`.
  The keyboard is quicker there - see the example below.
- Coverage varies. Win32, WPF, WinForms, UWP/WinUI, Office, File Explorer and Settings expose rich
  trees; Chromium and Electron apps expose most controls; games, canvas-drawn apps and some Java
  apps expose very little, so fall back to screenshots there.

## input.ps1 - mouse and keyboard

| Command | What it does |
|---|---|
| `click` / `double` / `right` / `middle -X n -Y n` | Click at a point |
| `move -X n -Y n` | Move the pointer (hover) |
| `drag -X n -Y n -ToX n -ToY n` | Left-button drag |
| `scroll -X n -Y n -Amount n [-Horizontal]` | Wheel notches; negative scrolls down (or left) |
| `type -Text "..." -ExpectWindow X [-DelayMs n]` | Type text |
| `key -Keys "ctrl+s" -ExpectWindow X [-Repeat n]` | Chords joined with `+`, sequences with spaces: `"tab tab enter"` |
| `cursor` | Report the pointer position |

All point commands accept `-Space image` (default) or `-Space screen`.

- **The input guard.** `type` and `key` refuse to run without `-ExpectWindow`, and any command given
  `-ExpectWindow` refuses when a different window is in front. This is what stops keystrokes from
  landing in the user's chat or email window. Pass it on clicks too whenever you know the target.
- When the guard refuses because another app is in front, the user has probably taken the keyboard
  back. Pause and check in instead of refocusing on a loop.
- Key names: ctrl, shift, alt, win, enter, esc, tab, space, backspace, delete, insert, home, end,
  pageup, pagedown, up, down, left, right, f1-f24, capslock, printscreen, apps, or any single
  character (`a`, `1`, `/`).
- `type` sends Unicode, so any character works whatever the keyboard layout. A newline presses
  Enter, which sends the message in chat apps - treat that as a send and confirm first.
- `powershell -File` drops empty arguments, so never pass `-Text ""`.

## speak.ps1 - talk back out loud

| Command | What it does |
|---|---|
| `speak.ps1 -Text "Opening Calculator."` | Says the line through the default speakers, then returns |
| `-Rate n` | Speed from -10 (slow) to 10 (fast); default 1 |
| `-Voice Zira` | Pick an installed voice by part of its name |
| `-ListVoices` | Show the installed voices |

Uses Windows' offline speech engine, so nothing is sent anywhere. Keep lines short, and never speak
private content such as message text or codes.

## Example: the whole loop

```
windows.ps1 launch -Target notepad.exe -Window notepad
input.ps1 type -Text "Buy milk`nCall the bank" -ExpectWindow notepad
input.ps1 key -Keys "ctrl+s" -ExpectWindow notepad
input.ps1 key -Keys "alt+n ctrl+a" -ExpectWindow "Save As"      # File name box, select its text
input.ps1 type -Text "C:\Users\me\Desktop\todo.txt" -ExpectWindow "Save As"
input.ps1 key -Keys "enter" -ExpectWindow "Save As"
screenshot.ps1 -Window notepad -Background     # verify: the title should now read "todo.txt - Notepad"
```

In PowerShell a backtick-n inside double quotes is a newline; from Git Bash, pass real newlines.
Check each step's output before running the next; every guarded step stops cleanly if focus moved.
