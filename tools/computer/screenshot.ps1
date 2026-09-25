<#
.SYNOPSIS
  Capture the primary screen, one window, or a region to PNG, and remember the pixel mapping
  so `input.ps1 ... -Space image` can act on points read straight off the image.
.EXAMPLE
  screenshot.ps1                             # whole primary screen, downscaled to <= 1400 px wide
  screenshot.ps1 -Window notepad             # one window, brought to the front first
  screenshot.ps1 -Window notepad -Background # the window's own pixels even if covered; focus untouched
  screenshot.ps1 -Window notepad -NoFocus    # that screen area as-is (shows whatever is on top)
  screenshot.ps1 -Region "0,0,960,540"       # x,y,width,height in physical pixels, e.g. to read small text
#>
param(
    [string]$Window,
    [string]$Region,
    [string]$Out,
    [int]$MaxWidth = 1400,
    [switch]$NoFocus,
    [switch]$Background
)
. "$PSScriptRoot\_common.ps1"
Add-Type -AssemblyName System.Drawing, System.Windows.Forms

if (-not ('UcCapture' -as [type])) {
    Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Runtime.InteropServices;

public static class UcCapture {
    [StructLayout(LayoutKind.Sequential)] struct RECT { public int Left, Top, Right, Bottom; }
    [DllImport("user32.dll")] static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
    [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h, out RECT r);

    // Ask the window to render itself (PW_RENDERFULLCONTENT), so covered windows still come out
    // right. Cropped to the visible frame so the image lines up with the screen mapping.
    public static Bitmap Window(IntPtr h, Rectangle visible) {
        RECT full;
        GetWindowRect(h, out full);
        var bmp = new Bitmap(Math.Max(1, full.Right - full.Left), Math.Max(1, full.Bottom - full.Top));
        using (var g = Graphics.FromImage(bmp)) {
            IntPtr dc = g.GetHdc();
            PrintWindow(h, dc, 2);
            g.ReleaseHdc(dc);
        }
        var crop = new Rectangle(visible.X - full.Left, visible.Y - full.Top, visible.Width, visible.Height);
        crop.Intersect(new Rectangle(0, 0, bmp.Width, bmp.Height));
        var result = bmp.Clone(crop, bmp.PixelFormat);
        bmp.Dispose();
        return result;
    }
}
'@
}

if ($Window) {
    $w = Resolve-UcWindow $Window
    if ($Background) {
        if ($w.State -eq 'minimized') { throw 'A minimized window cannot be captured in the background. Restore it first, or ask the user.' }
    } elseif (-not $NoFocus) {
        [void][UcNative]::Focus([IntPtr]$w.Handle)
        Start-Sleep -Milliseconds 250
        $w = Get-UcWindowInfo ([IntPtr]$w.Handle)
    }
    $rect = New-Object System.Drawing.Rectangle $w.X, $w.Y, $w.Width, $w.Height
} elseif ($Background) {
    throw '-Background needs -Window.'
} elseif ($Region) {
    # A string rather than int[] so it survives `powershell -File`, which passes arguments as text.
    $n = @($Region -split '[,\s]+' | Where-Object { $_ } | ForEach-Object { [int]$_ })
    if ($n.Count -ne 4) { throw '-Region needs four numbers: "x,y,width,height"' }
    $rect = New-Object System.Drawing.Rectangle $n[0], $n[1], $n[2], $n[3]
} else {
    $rect = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
}
if ($rect.Width -le 0 -or $rect.Height -le 0) { throw 'Nothing to capture - is the window minimized or off-screen?' }

if ($Background) {
    $bmp = [UcCapture]::Window([IntPtr]$w.Handle, $rect)
} else {
    $bmp = New-Object System.Drawing.Bitmap $rect.Width, $rect.Height
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.CopyFromScreen($rect.Location, [System.Drawing.Point]::Empty, $rect.Size)
    $g.Dispose()
}

$scale = 1.0
if ($bmp.Width -gt $MaxWidth) {
    $w2 = $MaxWidth
    $h2 = [int][math]::Round($bmp.Height * $MaxWidth / $bmp.Width)
    $small = New-Object System.Drawing.Bitmap $w2, $h2
    $g = [System.Drawing.Graphics]::FromImage($small)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($bmp, 0, 0, $w2, $h2)
    $g.Dispose(); $bmp.Dispose(); $bmp = $small
    $scale = $w2 / $rect.Width
}

if (-not $Out) { $Out = Join-Path $UcStateDir ('shot-{0:yyyyMMdd-HHmmss-fff}.png' -f (Get-Date)) }
$bmp.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
$imgW = $bmp.Width; $imgH = $bmp.Height
$bmp.Dispose()

[pscustomobject]@{
    Path = $Out; OriginX = $rect.X; OriginY = $rect.Y; Scale = $scale
    ImageWidth = $imgW; ImageHeight = $imgH; Time = (Get-Date).ToString('o')
} | ConvertTo-Json | Set-Content -Encoding UTF8 $UcShotFile

"Saved: $Out"
"Image ${imgW}x${imgH} covers screen x=$($rect.X) y=$($rect.Y) size=$($rect.Width)x$($rect.Height) (scale $([math]::Round($scale, 4)))$(if ($Background) { ', rendered in the background' })."
'Read the PNG to look at it. Points read off this image can be passed to input.ps1 with -Space image.'
