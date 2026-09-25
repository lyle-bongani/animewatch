<#
.SYNOPSIS
  Find and operate UI elements by name through Windows UI Automation: exact positions instead
  of pixel guessing, and most actions work without touching the mouse. Positions are physical
  pixels; norm=x,y is the element centre as a fraction of the primary screen (multiply by a
  screenshot's width/height to get the click point in that screenshot's coordinates).
.EXAMPLE
  uia.ps1 tree -Window notepad                                  # outline of named/interactive elements
  uia.ps1 find -Window notepad -Name save                       # case-insensitive substring
  uia.ps1 find -Window Calculator -Type Button
  uia.ps1 act -Window Calculator -AutomationId num7Button       # default -Do invoke
  uia.ps1 act -Window notepad -Type MenuItem -Name File -Do expand
  uia.ps1 act -Window "Save As" -Type Edit -Name "File name" -Do setvalue -Value "C:\temp\todo.txt"
  uia.ps1 act -Window notepad -Type Document -Do gettext
  uia.ps1 focused                                               # what has keyboard focus right now
#>
param(
    [Parameter(Position = 0)][ValidateSet('tree', 'find', 'act', 'focused')][string]$Action = 'find',
    [string]$Window,
    [string]$Name,
    [string]$AutomationId,
    [string]$Type,
    [switch]$Exact,
    [int]$Index = 0,
    [int]$Depth = 8,
    [int]$Max = 80,
    [ValidateSet('invoke', 'click', 'double', 'right', 'toggle', 'select', 'expand', 'collapse', 'focus', 'setvalue', 'gettext', 'scrollintoview')]
    [string]$Do = 'invoke',
    [string]$Value
)
. "$PSScriptRoot\_common.ps1"
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes

$AE = [System.Windows.Automation.AutomationElement]
$ScreenW = [UcNative]::GetSystemMetrics(0)
$ScreenH = [UcNative]::GetSystemMetrics(1)
$Cache = New-Object System.Windows.Automation.CacheRequest
foreach ($p in 'Name', 'ControlType', 'AutomationId', 'BoundingRectangle', 'IsEnabled', 'IsOffscreen', 'HasKeyboardFocus') {
    $field = "${p}Property"
    $Cache.Add($AE::$field)
}

function Get-TypeName($c) { $c.ControlType.ProgrammaticName -replace '^ControlType\.', '' }

function Format-Element($el, [int]$i = -1) {
    $c = $el.Cached
    $r = $c.BoundingRectangle
    $label = if ($c.Name) { " `"$($c.Name)`"" } else { '' }
    $id = if ($c.AutomationId) { " id=$($c.AutomationId)" } else { '' }
    $pos = ' (no position)'
    if (-not $r.IsEmpty -and $r.Width -gt 0 -and -not [double]::IsInfinity($r.X)) {
        $cx = [int]($r.X + $r.Width / 2); $cy = [int]($r.Y + $r.Height / 2)
        $pos = " center=$cx,$cy norm=$([math]::Round($cx / $ScreenW, 4)),$([math]::Round($cy / $ScreenH, 4)) size=$([int]$r.Width)x$([int]$r.Height)"
    }
    $flags = @()
    if (-not $c.IsEnabled) { $flags += 'disabled' }
    if ($c.IsOffscreen) { $flags += 'offscreen' }
    if ($c.HasKeyboardFocus) { $flags += 'focused' }
    $prefix = if ($i -ge 0) { "[$i] " } else { '' }
    "$prefix$(Get-TypeName $c)$label$id$pos$(if ($flags) { ' ' + ($flags -join ',') })"
}

function Get-Root {
    if ($Window -ieq 'desktop') { return $AE::RootElement }
    $AE::FromHandle([IntPtr](Resolve-UcWindow $Window).Handle)
}

function Test-Element($c) {
    if ($AutomationId -and $c.AutomationId -ine $AutomationId) { return $false }
    if ($Name) {
        if ($Exact) { if ($c.Name -ine $Name) { return $false } }
        elseif (-not (Test-UcMatch $c.Name $Name)) { return $false }
    }
    return $true
}

# Matching elements, on-screen and enabled ones first.
function Find-Elements {
    $root = Get-Root
    $cond = [System.Windows.Automation.Condition]::TrueCondition
    if ($Type) {
        $ct = [System.Windows.Automation.ControlType]::$Type
        if (-not $ct) { throw "Unknown -Type '$Type'. Common: Button, Edit, Text, MenuItem, ListItem, TreeItem, TabItem, CheckBox, RadioButton, ComboBox, Hyperlink, Document, Window" }
        $cond = New-Object System.Windows.Automation.PropertyCondition ($AE::ControlTypeProperty, $ct)
    }
    $scope = $Cache.Activate()
    try { $all = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, $cond) } finally { $scope.Dispose() }
    $hits = @($all | Where-Object { Test-Element $_.Cached })
    @($hits | Where-Object { -not $_.Cached.IsOffscreen -and $_.Cached.IsEnabled }) + @($hits | Where-Object { $_.Cached.IsOffscreen -or -not $_.Cached.IsEnabled })
}

function Get-Pattern($el, $patternType) {
    $pat = $null
    if ($el.TryGetCurrentPattern($patternType::Pattern, [ref]$pat)) { return $pat }
    $null
}

function Invoke-ElementClick($el, [string]$Button, [int]$Count) {
    if ($el.Cached.IsOffscreen) {
        $si = Get-Pattern $el ([System.Windows.Automation.ScrollItemPattern])
        if ($si) { $si.ScrollIntoView(); Start-Sleep -Milliseconds 250 }
    }
    if ($Window -ine 'desktop') { [void][UcNative]::Focus([IntPtr](Resolve-UcWindow $Window).Handle); Start-Sleep -Milliseconds 150 }
    $r = $el.Current.BoundingRectangle
    if ($r.IsEmpty -or $r.Width -le 0) { throw 'Element has no on-screen position to click.' }
    $x = [int]($r.X + $r.Width / 2); $y = [int]($r.Y + $r.Height / 2)
    [void][UcNative]::SetCursorPos($x, $y); Start-Sleep -Milliseconds 60
    for ($i = 0; $i -lt $Count; $i++) {
        [UcNative]::Button($Button, $true); Start-Sleep -Milliseconds 30; [UcNative]::Button($Button, $false); Start-Sleep -Milliseconds 70
    }
    "mouse $Button-click x$Count at screen $x,$y"
}

function Require-Pattern($el, $patternType, [string]$What) {
    $pat = Get-Pattern $el $patternType
    if (-not $pat) { throw "Element does not support $What. Try -Do click, or inspect with: uia.ps1 find" }
    $pat
}

switch ($Action) {
    'focused' {
        "Focused: $(Format-Element ($AE::FocusedElement.GetUpdatedCache($Cache)))"
        $fg = Resolve-UcWindow ''
        "In window: [$($fg.Process)] '$($fg.Title)'"
    }
    'tree' {
        $walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker
        $script:shown = 0
        $script:visited = 0
        # Depth counts printed levels only, so the unnamed wrapper panes that Chromium/Electron
        # apps nest dozens deep don't use it up. Unnamed containers are walked but not printed.
        function Show-Node($el, [int]$indent) {
            if ($script:shown -ge $Max -or $script:visited -ge 5000) { return }
            $script:visited++
            $c = $el.Cached
            if ($c.Name -or $c.AutomationId -or (Get-TypeName $c) -notmatch '^(Pane|Group|Custom)$') {
                ('  ' * $indent) + (Format-Element $el)
                $script:shown++; $indent++
                if ($indent -gt $Depth) { return }
            }
            $child = $walker.GetFirstChild($el, $Cache)
            while ($null -ne $child -and $script:shown -lt $Max) {
                Show-Node $child $indent
                $child = $walker.GetNextSibling($child, $Cache)
            }
        }
        Show-Node ((Get-Root).GetUpdatedCache($Cache)) 0
        if ($script:shown -ge $Max -or $script:visited -ge 5000) { "... stopped early (-Max $Max lines). Narrow it with: uia.ps1 find -Name ... / -Type ..." }
    }
    'find' {
        $hits = @(Find-Elements)
        if ($hits.Count -eq 0) { 'No matching elements. Loosen the filters, or look at: uia.ps1 tree'; break }
        $n = [math]::Min($hits.Count, $Max)
        for ($i = 0; $i -lt $n; $i++) { Format-Element $hits[$i] $i }
        if ($hits.Count -gt $n) { "... $($hits.Count - $n) more; raise -Max or add filters" }
    }
    'act' {
        $hits = @(Find-Elements)
        if ($hits.Count -eq 0) { throw 'No element matches. Loosen the filters, or look at: uia.ps1 tree' }
        if ($Index -ge $hits.Count) { throw "Only $($hits.Count) match(es); -Index $Index is out of range." }
        $el = $hits[$Index]
        Write-Host "Target: $(Format-Element $el $Index)"
        $pending = $false
        $how = switch ($Do) {
            'invoke' {
                if (Get-Pattern $el ([System.Windows.Automation.InvokePattern])) {
                    # Invoke can block until a modal dialog it opens is closed, so run it with a timeout.
                    $ps = [powershell]::Create().AddScript({ param($e) $e.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke() }).AddArgument($el)
                    $async = $ps.BeginInvoke()
                    if ($async.AsyncWaitHandle.WaitOne(4000)) { $ps.EndInvoke($async) | Out-Null; 'invoked' }
                    else { $pending = $true; 'invoked; the call is still blocked, which usually means a modal dialog opened - take a screenshot' }
                } elseif ($p = Get-Pattern $el ([System.Windows.Automation.TogglePattern])) { $p.Toggle(); "toggled -> $($p.Current.ToggleState)" }
                elseif ($p = Get-Pattern $el ([System.Windows.Automation.SelectionItemPattern])) { $p.Select(); 'selected' }
                elseif ($p = Get-Pattern $el ([System.Windows.Automation.ExpandCollapsePattern])) { $p.Expand(); 'expanded' }
                else { Invoke-ElementClick $el 'left' 1 }
            }
            'click' { Invoke-ElementClick $el 'left' 1 }
            'double' { Invoke-ElementClick $el 'left' 2 }
            'right' { Invoke-ElementClick $el 'right' 1 }
            'toggle' { $p = Require-Pattern $el ([System.Windows.Automation.TogglePattern]) 'toggling'; $p.Toggle(); "toggled -> $($p.Current.ToggleState)" }
            'select' { (Require-Pattern $el ([System.Windows.Automation.SelectionItemPattern]) 'selection').Select(); 'selected' }
            'expand' { (Require-Pattern $el ([System.Windows.Automation.ExpandCollapsePattern]) 'expand/collapse').Expand(); 'expanded' }
            'collapse' { (Require-Pattern $el ([System.Windows.Automation.ExpandCollapsePattern]) 'expand/collapse').Collapse(); 'collapsed' }
            'scrollintoview' { (Require-Pattern $el ([System.Windows.Automation.ScrollItemPattern]) 'scrolling into view').ScrollIntoView(); 'scrolled into view' }
            'focus' { $el.SetFocus(); 'focused' }
            'gettext' {
                if ($p = Get-Pattern $el ([System.Windows.Automation.TextPattern])) { $p.DocumentRange.GetText(20000) }
                elseif ($p = Get-Pattern $el ([System.Windows.Automation.ValuePattern])) { $p.Current.Value }
                else { $el.Current.Name }
            }
            'setvalue' {
                if ($null -eq $Value) { throw 'setvalue needs -Value' }
                $vp = Get-Pattern $el ([System.Windows.Automation.ValuePattern])
                if ($vp -and -not $vp.Current.IsReadOnly) { $vp.SetValue($Value); "value set; field now reads '$($vp.Current.Value)'" }
                else {
                    # No writable value pattern - typical of classic Win32 fields hosted in modern dialogs,
                    # which UI Automation reports as a non-focusable Pane. Click into the field instead,
                    # and only type if the element's own app actually came to the front.
                    $ownerPid = $el.Current.ProcessId
                    [void](Invoke-ElementClick $el 'left' 1)
                    Start-Sleep -Milliseconds 200
                    $fg = Get-UcWindowInfo ([UcNative]::GetForegroundWindow())
                    if ($fg.ProcId -ne $ownerPid) { throw "Clicked the field, but '$($fg.Title)' is in front, so nothing was typed." }
                    [UcNative]::Key(0x11, $true); [UcNative]::Key(0x41, $true); [UcNative]::Key(0x41, $false); [UcNative]::Key(0x11, $false)
                    [UcNative]::TypeText($Value, 0)
                    'clicked into the field and typed the value (no writable value pattern) - verify with a screenshot'
                }
            }
        }
        Write-Host "Result: $how"
        if ($pending) { [Environment]::Exit(0) }  # don't wait on the blocked Invoke thread
    }
}
