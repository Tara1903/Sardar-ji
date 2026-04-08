param(
  [string]$ProjectRoot = "C:\Sardar ji"
)

$ErrorActionPreference = 'Stop'

$googleServicesPath = Join-Path $ProjectRoot 'android\app\google-services.json'

if (-not (Test-Path $googleServicesPath)) {
  Write-Host "google-services.json not found. Skipping native push plugin wiring."
  exit 0
}

$settingsPath = Join-Path $ProjectRoot 'android\capacitor.settings.gradle'
$settingsContent = Get-Content -Raw -Path $settingsPath

if ($settingsContent -notmatch "capacitor-push-notifications") {
  $settingsContent = $settingsContent.TrimEnd() + "`r`n`r`ninclude ':capacitor-push-notifications'`r`nproject(':capacitor-push-notifications').projectDir = new File('../node_modules/@capacitor/push-notifications/android')`r`n"
  Set-Content -Path $settingsPath -Value $settingsContent
}

$buildPath = Join-Path $ProjectRoot 'android\app\capacitor.build.gradle'
$buildContent = Get-Content -Raw -Path $buildPath

if ($buildContent -notmatch "capacitor-push-notifications") {
  $updatedBuildContent = [regex]::Replace(
    $buildContent,
    "dependencies \{([\s\S]*?)\n\}",
    {
      param($match)
      $body = $match.Groups[1].Value.TrimEnd()
      return "dependencies {" + $body + "`r`n    implementation project(':capacitor-push-notifications')`r`n`r`n}"
    },
    1
  )

  Set-Content -Path $buildPath -Value $updatedBuildContent
}
