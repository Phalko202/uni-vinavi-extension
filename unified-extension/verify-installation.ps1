# Installation Verification Script
# Run this PowerShell script to verify the unified extension structure

$ExtensionPath = "c:\Users\PHALK\Documents\Coding files\vinavi universal extenion\unified-extension"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Unified Extension Installation Verification  " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Check main files
Write-Host "Checking main extension files..." -ForegroundColor Yellow
$mainFiles = @(
    "manifest.json",
    "popup.html",
    "popup.js",
    "background.js",
    "README.md"
)

foreach ($file in $mainFiles) {
    $path = Join-Path $ExtensionPath $file
    if (Test-Path $path) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file MISSING!" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

# Check modules
Write-Host "Checking modules..." -ForegroundColor Yellow

# Module 1: Lab Extractor
Write-Host "  Module 1: Lab Test Extractor" -ForegroundColor Cyan
$labExtractorFiles = @(
    "modules\lab-extractor\extractor.html",
    "modules\lab-extractor\extractor.js",
    "modules\lab-extractor\extractor.css"
)

foreach ($file in $labExtractorFiles) {
    $path = Join-Path $ExtensionPath $file
    if (Test-Path $path) {
        Write-Host "    ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "    ✗ $file MISSING!" -ForegroundColor Red
        $allGood = $false
    }
}

# Module 2: QuickText
Write-Host "  Module 2: QuickText Templates" -ForegroundColor Cyan
$quicktextPath = Join-Path $ExtensionPath "modules\quicktext"
if (Test-Path $quicktextPath) {
    $quicktextFiles = Get-ChildItem -Path $quicktextPath -File | Measure-Object
    Write-Host "    ✓ QuickText module exists ($($quicktextFiles.Count) files)" -ForegroundColor Green
} else {
    Write-Host "    ✗ QuickText module MISSING!" -ForegroundColor Red
    $allGood = $false
}

# Module 3: Lab Vinavi
Write-Host "  Module 3: Lab Test Ordering" -ForegroundColor Cyan
$labVinaviPath = Join-Path $ExtensionPath "modules\lab-vinavi"
if (Test-Path $labVinaviPath) {
    $labVinaviFiles = Get-ChildItem -Path $labVinaviPath -Recurse -File | Measure-Object
    Write-Host "    ✓ Lab Vinavi module exists ($($labVinaviFiles.Count) files)" -ForegroundColor Green
} else {
    Write-Host "    ✗ Lab Vinavi module MISSING!" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""

# Check icons
Write-Host "Checking icons..." -ForegroundColor Yellow
$iconsPath = Join-Path $ExtensionPath "icons"
if (Test-Path $iconsPath) {
    $iconFiles = Get-ChildItem -Path $iconsPath -Filter "*.png" | Measure-Object
    if ($iconFiles.Count -gt 0) {
        Write-Host "  ✓ Icons folder exists ($($iconFiles.Count) icon files)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Icons folder exists but no PNG files found" -ForegroundColor Yellow
        Write-Host "    Note: Icons are optional but recommended" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠ Icons folder not found" -ForegroundColor Yellow
    Write-Host "    Note: Icons are optional but recommended" -ForegroundColor Gray
}

Write-Host ""

# Validate manifest.json
Write-Host "Validating manifest.json..." -ForegroundColor Yellow
$manifestPath = Join-Path $ExtensionPath "manifest.json"
if (Test-Path $manifestPath) {
    try {
        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        
        # Check required fields
        if ($manifest.manifest_version -eq 3) {
            Write-Host "  ✓ Manifest version 3" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Wrong manifest version!" -ForegroundColor Red
            $allGood = $false
        }
        
        if ($manifest.name) {
            Write-Host "  ✓ Extension name: $($manifest.name)" -ForegroundColor Green
        }
        
        if ($manifest.version) {
            Write-Host "  ✓ Version: $($manifest.version)" -ForegroundColor Green
        }
        
        if ($manifest.permissions) {
            Write-Host "  ✓ Permissions: $($manifest.permissions.Count) declared" -ForegroundColor Green
        }
        
        if ($manifest.host_permissions) {
            Write-Host "  ✓ Host permissions: $($manifest.host_permissions.Count) declared" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "  ✗ manifest.json is not valid JSON!" -ForegroundColor Red
        $allGood = $false
    }
} else {
    Write-Host "  ✗ manifest.json not found!" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan

if ($allGood) {
    Write-Host "  ✓ ALL CHECKS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your extension is ready to install!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Open Chrome and go to chrome://extensions/" -ForegroundColor White
    Write-Host "2. Enable 'Developer mode' (top-right toggle)" -ForegroundColor White
    Write-Host "3. Click 'Load unpacked'" -ForegroundColor White
    Write-Host "4. Select folder: $ExtensionPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Note: If icons are missing, the extension will still work but" -ForegroundColor Gray
    Write-Host "      will use default Chrome extension icon." -ForegroundColor Gray
} else {
    Write-Host "  ✗ SOME CHECKS FAILED!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please fix the issues above before installing." -ForegroundColor Red
}

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Offer to open the folder
$response = Read-Host "Do you want to open the extension folder? (y/n)"
if ($response -eq 'y' -or $response -eq 'Y') {
    Start-Process explorer.exe $ExtensionPath
}
