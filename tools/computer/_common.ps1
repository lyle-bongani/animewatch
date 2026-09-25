# Shared helpers for the use-computer scripts. Dot-source with:  . "$PSScriptRoot\_common.ps1"
# The process is made DPI-aware, so every coordinate these scripts print or accept is a
# PHYSICAL screen pixel (UI Automation reports physical pixels too, so the two agree).
$ErrorActionPreference = 'Stop'

if (-not ('UcNative' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

public static class UcNative {
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
    [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X, Y; }
    [StructLayout(LayoutKind.Sequential)] public struct MOUSEINPUT { public int dx, dy; public uint mouseData, dwFlags, time; public IntPtr extra; }
    [StructLayout(LayoutKind.Sequential)] public struct KEYBDINPUT { public ushort wVk, wScan; public uint dwFlags, time; public IntPtr extra; }
    [StructLayout(LayoutKind.Explicit)] public struct INPUTUNION { [FieldOffset(0)] public MOUSEINPUT mi; [FieldOffset(0)] public KEYBDINPUT ki; }
    [StructLayout(LayoutKind.Sequential)] public struct INPUT { public uint type; public INPUTUNION u; }
    public delegate bool EnumProc(IntPtr h, IntPtr l);

    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
    [DllImport("user32.dll")] public static extern void SwitchToThisWindow(IntPtr h, bool altTab);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
    [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
    [DllImport("user32.dll")] public static extern bool IsZoomed(IntPtr h);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
    [DllImport("user32.dll")] public static extern int GetWindowTextLength(IntPtr h);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
    [DllImport("user32.dll", EntryPoint = "GetWindowLongW")] public static extern int GetWindowLong32(IntPtr h, int i);
    [DllImport("user32.dll", EntryPoint = "GetWindowLongPtrW")] public static extern IntPtr GetWindowLong64(IntPtr h, int i);
    [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int a, out RECT r, int size);
    [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int a, out int v, int size);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc cb, IntPtr l);
    [DllImport("user32.dll")] public static extern int GetSystemMetrics(int n);
    [DllImport("user32.dll")] public static extern uint GetDpiForSystem();
    [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
    [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT p);
    [DllImport("user32.dll", SetLastError = true)] public static extern uint SendInput(uint n, INPUT[] inputs, int size);
    [DllImport("user32.dll")] public static extern short VkKeyScan(char c);
    [DllImport("user32.dll")] public static extern bool AttachThreadInput(uint a, uint b, bool attach);
    [DllImport("kernel32.dll")] public static extern uint GetCurrentThreadId();

    public static string Title(IntPtr h) {
        var sb = new StringBuilder(GetWindowTextLength(h) + 1);
        GetWindowText(h, sb, sb.Capacity);
        return sb.ToString();
    }
    // Visible frame bounds (excludes the invisible resize border that GetWindowRect includes).
    public static RECT Bounds(IntPtr h) {
        RECT r;
        if (DwmGetWindowAttribute(h, 9, out r, Marshal.SizeOf(typeof(RECT))) != 0) GetWindowRect(h, out r);
        return r;
    }
    public static bool IsCloaked(IntPtr h) { int v; return DwmGetWindowAttribute(h, 14, out v, 4) == 0 && v != 0; }
    static long ExStyle(IntPtr h) { return IntPtr.Size == 8 ? GetWindowLong64(h, -20).ToInt64() : GetWindowLong32(h, -20); }
    // Visible, titled, uncloaked, non-tool top-level windows in z-order (front-most first).
    public static List<IntPtr> TopWindows() {
        var list = new List<IntPtr>();
        EnumWindows(delegate(IntPtr h, IntPtr l) {
            if (IsWindowVisible(h) && GetWindowTextLength(h) > 0 && !IsCloaked(h) && (ExStyle(h) & 0x80) == 0) list.Add(h);
            return true;
        }, IntPtr.Zero);
        return list;
    }

    static readonly int InputSize = Marshal.SizeOf(typeof(INPUT));
    static readonly HashSet<int> ExtendedKeys = new HashSet<int> { 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x2C, 0x2D, 0x2E, 0x5B, 0x5C, 0x5D, 0x6F, 0x90, 0xA3, 0xA5 };
    static void Send(params INPUT[] a) { SendInput((uint)a.Length, a, InputSize); }
    static INPUT MouseInput(uint flags, int data) { var i = new INPUT(); i.type = 0; i.u.mi.dwFlags = flags; i.u.mi.mouseData = unchecked((uint)data); return i; }
    static INPUT KeyInput(ushort vk, ushort scan, uint flags) { var i = new INPUT(); i.type = 1; i.u.ki.wVk = vk; i.u.ki.wScan = scan; i.u.ki.dwFlags = flags; return i; }

    public static void Nudge() { Send(MouseInput(0x0001, 0)); }
    public static void Button(string button, bool down) {
        uint f = button == "right" ? (down ? 0x0008u : 0x0010u) : button == "middle" ? (down ? 0x0020u : 0x0040u) : (down ? 0x0002u : 0x0004u);
        Send(MouseInput(f, 0));
    }
    // Positive notches scroll up (or right when horizontal).
    public static void Wheel(int notches, bool horizontal) { Send(MouseInput(horizontal ? 0x1000u : 0x0800u, notches * 120)); }
    public static void Key(int vk, bool down) {
        uint f = (ExtendedKeys.Contains(vk) ? 1u : 0u) | (down ? 0u : 2u);
        Send(KeyInput((ushort)vk, 0, f));
    }
    public static int VkForChar(char c) { short r = VkKeyScan(c); return r == -1 ? -1 : (r & 0xFF); }
    // Unicode injection types any character regardless of keyboard layout.
    public static void TypeText(string s, int delayMs) {
        foreach (char c in s) {
            if (c == '\r') continue;
            if (c == '\n') { Key(0x0D, true); Key(0x0D, false); }
            else if (c == '\t') { Key(0x09, true); Key(0x09, false); }
            else Send(KeyInput(0, c, 4), KeyInput(0, c, 6));
            if (delayMs > 0) Thread.Sleep(delayMs);
        }
    }
    // Bring a window to the front, working around Windows' foreground-lock rules.
    public static bool Focus(IntPtr h) {
        if (IsIconic(h)) { ShowWindow(h, 9); Thread.Sleep(250); }
        if (GetForegroundWindow() == h) return true;
        Nudge(); // our process now owns the last input event, which permits SetForegroundWindow
        uint ignored;
        uint fgThread = GetWindowThreadProcessId(GetForegroundWindow(), out ignored);
        uint me = GetCurrentThreadId();
        bool attached = fgThread != 0 && fgThread != me && AttachThreadInput(me, fgThread, true);
        BringWindowToTop(h);
        SetForegroundWindow(h);
        if (attached) AttachThreadInput(me, fgThread, false);
        for (int i = 0; i < 12 && GetForegroundWindow() != h; i++) { if (i == 4) SwitchToThisWindow(h, true); Thread.Sleep(50); }
        return GetForegroundWindow() == h;
    }
}
'@
}
[void][UcNative]::SetProcessDPIAware()

$UcStateDir = Join-Path $env:TEMP 'use-computer'
New-Item -ItemType Directory -Force -Path $UcStateDir | Out-Null  # -Force: no race when scripts run in parallel
$UcShotFile = Join-Path $UcStateDir 'last-shot.json'

function Test-UcMatch([string]$Text, [string]$Needle) {
    return [bool]($Text -and $Needle -and $Text.IndexOf($Needle, [StringComparison]::OrdinalIgnoreCase) -ge 0)
}

function Get-UcWindowInfo([IntPtr]$Handle) {
    $procId = [uint32]0
    [void][UcNative]::GetWindowThreadProcessId($Handle, [ref]$procId)
    $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
    $r = [UcNative]::Bounds($Handle)
    $state = if ([UcNative]::IsIconic($Handle)) { 'minimized' } elseif ([UcNative]::IsZoomed($Handle)) { 'maximized' } else { 'normal' }
    [pscustomobject]@{
        Handle     = $Handle.ToInt64()
        Process    = $(if ($proc) { $proc.ProcessName } else { '?' })
        ProcId     = $procId
        Title      = [UcNative]::Title($Handle)
        State      = $state
        X          = $r.Left
        Y          = $r.Top
        Width      = $r.Right - $r.Left
        Height     = $r.Bottom - $r.Top
        Foreground = ($Handle -eq [UcNative]::GetForegroundWindow())
    }
}

function Get-UcWindows { foreach ($h in [UcNative]::TopWindows()) { Get-UcWindowInfo $h } }

# Resolve a -Window value: a handle number, an exact process name ("notepad"), or a title
# substring. The front-most match wins. Empty means the current foreground window.
function Resolve-UcWindow([string]$Window) {
    if (-not $Window) { return Get-UcWindowInfo ([UcNative]::GetForegroundWindow()) }
    $all = @(Get-UcWindows)
    $hit = $null
    if ($Window -match '^\d+$') { $hit = $all | Where-Object { $_.Handle -eq [int64]$Window } | Select-Object -First 1 }
    if (-not $hit) { $hit = $all | Where-Object { $_.Process -ieq $Window } | Select-Object -First 1 }
    if (-not $hit) { $hit = $all | Where-Object { Test-UcMatch $_.Title $Window } | Select-Object -First 1 }
    if (-not $hit) { throw "No visible window matches '$Window'. List windows with: windows.ps1 list" }
    $hit
}

# Input safety: refuse to send keystrokes unless the foreground window is the intended one.
function Assert-UcForeground([string]$Expect) {
    $fg = Get-UcWindowInfo ([UcNative]::GetForegroundWindow())
    $ok = ($fg.Process -ieq $Expect) -or (Test-UcMatch $fg.Title $Expect) -or ("$($fg.Handle)" -eq $Expect)
    if (-not $ok) {
        throw "Foreground window is '$($fg.Title)' [$($fg.Process)], not '$Expect' - input NOT sent. Focus it first: windows.ps1 focus -Window '$Expect'"
    }
    $fg
}

function Get-UcLastShot { if (Test-Path $UcShotFile) { Get-Content $UcShotFile -Raw | ConvertFrom-Json } }

# Convert a point to physical screen pixels. Space 'image' means a pixel in the most recent
# screenshot.ps1 image; 'screen' means the value is already a physical screen pixel.
function ConvertTo-UcScreenPoint([double]$X, [double]$Y, [string]$Space) {
    if ($Space -eq 'image') {
        $shot = Get-UcLastShot
        if (-not $shot) { throw "No screenshot mapping yet. Run screenshot.ps1 first, or pass -Space screen." }
        $X = $shot.OriginX + $X / $shot.Scale
        $Y = $shot.OriginY + $Y / $shot.Scale
    }
    [pscustomobject]@{ X = [int][math]::Round($X); Y = [int][math]::Round($Y) }
}
