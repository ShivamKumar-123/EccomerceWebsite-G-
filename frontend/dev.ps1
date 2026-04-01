# Use this if `npm` is not recognized: merges Machine+User PATH, then starts Vite.
# Run from frontend folder:  .\dev.ps1
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
Set-Location $PSScriptRoot
npm run dev
