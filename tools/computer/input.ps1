<#
.SYNOPSIS
  Mouse and keyboard input for the use-computer skill, for sessions with no computer-use tool.
  -Space image (default): X/Y are pixels in the latest screenshot.ps1 image.
  -Space screen: X/Y are physical screen pixels (what uia.ps1 and windows.ps1 print).
.EXAMPLE
  input.ps1 click -X 640 -Y 360
  input.ps1 right -X 1210 -Y 88 -Space screen
  input.ps1 type -Text "Hello" -ExpectWindow notepad
  input.ps1 key -Keys "ctrl+s" -ExpectWindow notepad
  input.ps1 key -Keys "tab tab enter" -ExpectWindow "Save As"
  input.ps1 scroll -X 900 -Y 500 -Amount -5          # negative scrolls down
  input.ps1 drag -X 100 -Y 100 -ToX 400 -ToY 100
#>
param(
    [Parameter(Position = 0, Mandatory = $true)]
    [ValidateSet('click', 'double', 'right', 'middle', 'move', 'drag', 'scroll', 'type', 'key', 'cursor')]
    [string]$Action,
    [double]$X, [double]$Y, [double]$ToX, [double]$ToY,
    [ValidateSet('image', 'screen')][string]$Space = 'image',
    [string]$Text,
    [string]$Keys,
    [int]$Amount = -3,
    [switch]$Horizontal,
    [string]$ExpectWindow,
    [int]$DelayMs = 0,
    [int]$Repeat = 1
)
. "$PSScriptRoot\_common.ps1"

$VkNames = @{
    ctrl = 0x11; control = 0x11; shift = 0x10; alt = 0x12; win = 0x5B; windows = 0x5B; meta = 0x5B
    enter = 0x0D; return = 0x0D; esc = 0x1B; escape = 0x1B; tab = 0x09; space = 0x20; backspace = 0x08
    delete = 0x2E; del = 0x2E; insert = 0x2D; home = 0x24; end = 0x23
    pageup = 0x21; pgup = 0x21; pagedown = 0x22; pgdn = 0x22
    left = 0x25; up = 0x26; right = 0x27; down = 0x28
    capslock = 0x14; printscreen = 0x2C; apps = 0x5D; menu = 0x5D
}
function Get-Vk([string]$Name) {
    $n = $Name.Trim().ToLowerInvariant()
    if ($VkNames.ContainsKey($n)) { return $VkNames[$n] }
    if ($n -match '^f([1-9]|1[0-9]|2[0-4])$') { return 0x6F + [int]$Matches[1] }
    if ($n.Length -eq 1) { $vk = [UcNative]::VkForChar($n[0]); if ($vk -ge 0) { return $vk } }
    throw "Unknown key '$Name'. Use names like ctrl, shift, alt, win, enter, esc, tab, f2, up, pagedown, a, 1."
}
function Move-UcCursor([double]$PX, [double]$PY) {
    $p = ConvertTo-UcScreenPoint $PX $PY $Space
    [void][UcNative]::SetCursorPos($p.X, $p.Y)
    Start-Sleep -Milliseconds 60
    $p
}

# Keystrokes go to whatever has focus, so they always need a foreground guard.
if ($Action -in 'type', 'key') {
    if (-not $ExpectWindow) {
        throw "$Action needs -ExpectWindow (process name or title text of the window that must be in front) so input cannot land in the wrong app."
    }
}
if ($ExpectWindow) { [void](Assert-UcForeground $ExpectWindow) }

switch ($Action) {
    'cursor' {
        $c = New-Object 'UcNative+POINT'
        [void][UcNative]::GetCursorPos([ref]$c)
        "Cursor at screen $($c.X),$($c.Y)"
    }
    'move' {
        $p = Move-UcCursor $X $Y
        "Moved to screen $($p.X),$($p.Y)"
    }
    { $_ -in 'click', 'double', 'right', 'middle' } {
        $btn = if ($Action -in 'right', 'middle') { $Action } else { 'left' }
        $count = if ($Action -eq 'double') { 2 } else { $Repeat }
        $p = Move-UcCursor $X $Y
        for ($i = 0; $i -lt $count; $i++) {
            [UcNative]::Button($btn, $true); Start-Sleep -Milliseconds 30; [UcNative]::Button($btn, $false)
            if ($i -lt $count - 1) { Start-Sleep -Milliseconds 70 }
        }
        "$Action at screen $($p.X),$($p.Y)"
    }
    'drag' {
        $p = Move-UcCursor $X $Y
        $to = ConvertTo-UcScreenPoint $ToX $ToY $Space
        [UcNative]::Button('left', $true)
        $steps = 12
        for ($i = 1; $i -le $steps; $i++) {
            [void][UcNative]::SetCursorPos([int]($p.X + ($to.X - $p.X) * $i / $steps), [int]($p.Y + ($to.Y - $p.Y) * $i / $steps))
            Start-Sleep -Milliseconds 25
        }
        [UcNative]::Button('left', $false)
        "Dragged screen $($p.X),$($p.Y) -> $($to.X),$($to.Y)"
    }
    'scroll' {
        $p = Move-UcCursor $X $Y
        [UcNative]::Wheel($Amount, [bool]$Horizontal)
        "Scrolled $Amount notch(es)$(if ($Horizontal) { ' horizontally' }) at screen $($p.X),$($p.Y)"
    }
    'type' {
        if ($null -eq $Text) { throw 'type needs -Text' }
        [UcNative]::TypeText($Text, $DelayMs)
        "Typed $($Text.Length) character(s)"
    }
    'key' {
        if (-not $Keys) { throw 'key needs -Keys, e.g. "ctrl+s", "alt+f4", or "tab tab enter"' }
        foreach ($round in 1..$Repeat) {
            foreach ($chord in ($Keys -split '\s+' | Where-Object { $_ })) {
                $vks = @($chord -split '\+' | ForEach-Object { Get-Vk $_ })
                foreach ($vk in $vks) { [UcNative]::Key($vk, $true); Start-Sleep -Milliseconds 15 }
                [array]::Reverse($vks)
                foreach ($vk in $vks) { [UcNative]::Key($vk, $false); Start-Sleep -Milliseconds 15 }
                Start-Sleep -Milliseconds 40
            }
        }
        "Pressed $Keys$(if ($Repeat -gt 1) { " x$Repeat" })"
    }
}
