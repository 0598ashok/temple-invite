$src = "C:\Users\0598a\.gemini\antigravity-ide\brain\dc9d2c7a-6cc3-44b5-8751-fce3f137d7b6"
$dst = "C:\Users\0598a\OneDrive\Desktop\Temple theme"

[System.IO.File]::Copy("$src\temple_hero_new_1784287128931.png",  "$dst\temple_bg.png",       $true)
[System.IO.File]::Copy("$src\bride_portrait_1784285523076.png",    "$dst\bride.png",           $true)
[System.IO.File]::Copy("$src\groom_portrait_1784285534290.png",    "$dst\groom.png",           $true)
[System.IO.File]::Copy("$src\temple_venue_1784285553157.png",      "$dst\temple_venue.png",    $true)
[System.IO.File]::Copy("$src\reception_venue_1784285563365.png",   "$dst\reception_venue.png", $true)

Write-Output "All images copied successfully."
Get-ChildItem $dst -Filter "*.png" | Select-Object Name, Length
