Get-ChildItem -Path "c:\Users\admin\design08\new-expnses-final\node_modules\@capacitor" -Recurse -Filter "build.gradle" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'JavaVersion\.VERSION_21', 'JavaVersion.VERSION_17'
    Set-Content -Path $_.FullName -Value $content -NoNewline
    Write-Host "Patched: $($_.FullName)"
}

Get-ChildItem -Path "c:\Users\admin\design08\new-expnses-final\node_modules\@capawesome" -Recurse -Filter "build.gradle" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace 'JavaVersion\.VERSION_21', 'JavaVersion.VERSION_17'
    Set-Content -Path $_.FullName -Value $content -NoNewline
    Write-Host "Patched: $($_.FullName)"
}

Write-Host "All build.gradle files patched to Java 17"
