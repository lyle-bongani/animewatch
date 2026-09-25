<#
.SYNOPSIS
  Say a short line out loud with Windows' built-in offline speech voice, for voice-driven
  sessions where the user is talking to Claude instead of reading the chat.
.EXAMPLE
  speak.ps1 -Text "Opening Calculator."
  speak.ps1 -Text "Ready to send hie to Meta AI. Should I send it, yes or no?"
  speak.ps1 -Text "Done." -Voice Zira -Rate 2
  speak.ps1 -ListVoices
#>
param(
    [string]$Text,
    [int]$Rate = 1,        # -10 (slow) to 10 (fast)
    [string]$Voice,        # part of an installed voice name, e.g. "Zira" or "David"
    [switch]$ListVoices
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
    $voices = @($synth.GetInstalledVoices() | Where-Object { $_.Enabled })
    if ($ListVoices) {
        foreach ($v in $voices) { $i = $v.VoiceInfo; "$($i.Name) ($($i.Culture), $($i.Gender))" }
        return
    }
    if (-not $Text) { throw 'speak.ps1 needs -Text' }
    if ($Voice) {
        $match = $voices | Where-Object { $_.VoiceInfo.Name -like "*$Voice*" } | Select-Object -First 1
        if ($match) { $synth.SelectVoice($match.VoiceInfo.Name) } else { "No installed voice matches '$Voice'; using the default." }
    }
    $synth.Rate = [math]::Max(-10, [math]::Min(10, $Rate))
    $synth.SetOutputToDefaultAudioDevice()
    $synth.Speak($Text)   # blocks until finished, so the next step starts after the sentence
    "Spoke $($Text.Length) characters with $($synth.Voice.Name)."
} finally {
    $synth.Dispose()
}
