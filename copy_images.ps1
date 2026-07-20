$src_old = "C:\Users\0598a\.gemini\antigravity-ide\brain\dc9d2c7a-6cc3-44b5-8751-fce3f137d7b6"
$src_new = "C:\Users\0598a\.gemini\antigravity-ide\brain\69c08ad7-a44f-4a04-9d16-113ae0381560"
$dst     = "C:\Users\0598a\OneDrive\Desktop\Temple theme"

# Ensure destination directory exists
if (!(Test-Path -Path $dst)) {
    New-Item -ItemType Directory -Force -Path $dst | Out-Null
}

$src_temple_bg = "C:\Users\ADMIN\.gemini\antigravity-ide\brain\ccaa9753-80bf-4409-b6eb-3661cd5a8212\media__1784562266978.jpg"
$src_temple_venue = "C:\Users\ADMIN\.gemini\antigravity-ide\brain\ccaa9753-80bf-4409-b6eb-3661cd5a8212\temple_venue_1784566751435.png"
$src_reception_venue = "C:\Users\ADMIN\.gemini\antigravity-ide\brain\ccaa9753-80bf-4409-b6eb-3661cd5a8212\reception_venue_1784566772634.png"

[System.IO.File]::Copy($src_temple_bg,                             "$dst\temple_bg.png",       $true)
[System.IO.File]::Copy("$src_new\media__1784301838828.jpg",      "$dst\couple_bg.png",       $true)
[System.IO.File]::Copy("$src_old\bride_portrait_1784285523076.png",    "$dst\bride.png",           $true)
[System.IO.File]::Copy("$src_old\groom_portrait_1784285534290.png",    "$dst\groom.png",           $true)
[System.IO.File]::Copy($src_temple_venue,                          "$dst\temple_venue.png",    $true)
[System.IO.File]::Copy($src_reception_venue,                       "$dst\reception_venue.png", $true)

# Also copy them directly to the workspace folder if it differs from the desktop theme path
$workspace = "D:\Ashok\HTML Pages\temple-invite"
if (Test-Path -Path $workspace) {
    [System.IO.File]::Copy($src_temple_bg,                             "$workspace\temple_bg.png",       $true)
    [System.IO.File]::Copy("$src_new\media__1784301838828.jpg",      "$workspace\couple_bg.png",       $true)
    if (Test-Path -Path "$src_old\bride_portrait_1784285523076.png") {
        [System.IO.File]::Copy("$src_old\bride_portrait_1784285523076.png",    "$workspace\bride.png",           $true)
        [System.IO.File]::Copy("$src_old\groom_portrait_1784285534290.png",    "$workspace\groom.png",           $true)
        [System.IO.File]::Copy("$src_old\temple_venue_1784285553157.png",      "$workspace\temple_venue.png",    $true)
        [System.IO.File]::Copy("$src_old\reception_venue_1784285563365.png",   "$workspace\reception_venue.png", $true)
    }
}

Write-Output "All images copied successfully."
Get-ChildItem $dst -Filter "*.png" | Select-Object Name, Length
