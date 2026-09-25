<#
.SYNOPSIS
  Screen and window control for the use-computer skill. Coordinates are physical pixels.
.EXAMPLE
  windows.ps1 info                                   # monitors, scaling, cursor, foreground window
  windows.ps1 list                                   # visible windows, front-most first (* = foreground)
  windows.ps1 focus -Window notepad                  # process name, title text, or handle
  windows.ps1 maximize -Window "Untitled - Notepad"
  windows.ps1 launch -Target notepad.exe -Window notepad
  windows.ps1 launch -Target ms-settings:display -Window Settings
#>
param(
    [Parameter(Position = 0)]
    [ValidateSet('info', 'list', 'focus', 'maximize', 'minimize', 'restore', 'launch')]
    [string]$Action = 'info',
    [string]$Window,
    [string]$Target,
    [string]$Arguments,
    [int]$TimeoutSec = 15
)
. "$PSScriptRoot\_common.ps1"

function Format-UcWindow($w) {
    $mark = if ($w.Foreground) { '*' } else { ' ' }
    '{0} {1,-9} {2,-20} {3,-9} {4,5},{5,-5} {6,4}x{7,-4}  {8}' -f $mark, $w.Handle, $w.Process, $w.State, $w.X, $w.Y, $w.Width, $w.Height, $w.Title
}

switch ($Action) {
    'info' {
        Add-Type -AssemblyName System.Windows.Forms
        $dpi = [UcNative]::GetDpiForSystem()
        "Display scaling: $([math]::Round($dpi / 96 * 100))% (DPI $dpi). All coordinates below are physical pixels."
        foreach ($s in [System.Windows.Forms.Screen]::AllScreens) {
            $b = $s.Bounds
            "Monitor $($s.DeviceName): x=$($b.X) y=$($b.Y) size=$($b.Width)x$($b.Height)$(if ($s.Primary) { ' (primary)' })"
        }
        $c = New-Object 'UcNative+POINT'
        [void][UcNative]::GetCursorPos([ref]$c)
        "Cursor: $($c.X),$($c.Y)"
        $fg = Resolve-UcWindow ''
        "Foreground: [$($fg.Process)] '$($fg.Title)' handle=$($fg.Handle) at $($fg.X),$($fg.Y) size=$($fg.Width)x$($fg.Height)"
    }
    'list' {
        '  handle    process              state          x,y      size   title'
        foreach ($w in Get-UcWindows) { Format-UcWindow $w }
    }
    'launch' {
        if (-not $Target) { throw 'launch needs -Target: an exe, file, folder, or URI such as ms-settings:display' }
        $before = @(Get-UcWindows | ForEach-Object { $_.Handle })
        if ($Arguments) { Start-Process -FilePath $Target -ArgumentList $Arguments } else { Start-Process -FilePath $Target }
        $deadline = (Get-Date).AddSeconds($TimeoutSec)
        do {
            Start-Sleep -Milliseconds 400
            $new = @(Get-UcWindows | Where-Object {
                    ($before -notcontains $_.Handle) -and (-not $Window -or $_.Process -ieq $Window -or (Test-UcMatch $_.Title $Window))
                })
        } until ($new.Count -gt 0 -or (Get-Date) -gt $deadline)
        if ($new.Count -eq 0) {
            "Started '$Target' but no new matching window appeared within $TimeoutSec s (the app may have reused an existing window). Check: windows.ps1 list"
            break
        }
        $h = [IntPtr]$new[0].Handle
        [void][UcNative]::Focus($h)
        Start-Sleep -Milliseconds 150
        'New window:'
        Format-UcWindow (Get-UcWindowInfo $h)
    }
    default {
        $w = Resolve-UcWindow $Window
        $h = [IntPtr]$w.Handle
        switch ($Action) {
            'maximize' { [void][UcNative]::ShowWindow($h, 3) }
            'minimize' { [void][UcNative]::ShowWindow($h, 6) }
            'restore' { [void][UcNative]::ShowWindow($h, 9) }
        }
        if ($Action -ne 'minimize' -and -not [UcNative]::Focus($h)) {
            throw "Could not bring '$($w.Title)' to the front. An elevated (admin) window or a system dialog may be blocking it - ask the user."
        }
        Start-Sleep -Milliseconds 150
        Format-UcWindow (Get-UcWindowInfo $h)
    }
}
