# Essential Productivity & Developer Tools Installer
# Run this script as administrator

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Installing Essential Productivity & Dev Tools" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Accept Microsoft Store terms first
Write-Host "Accepting Microsoft Store terms..." -ForegroundColor Yellow
winget source update

# Install PowerToys
Write-Host "Installing Microsoft PowerToys..." -ForegroundColor Cyan
winget install --id Microsoft.PowerToys -e --accept-source-agreements --accept-package-agreements

# Install Visual Studio Code
Write-Host "Installing Visual Studio Code..." -ForegroundColor Cyan
winget install --id Microsoft.VisualStudioCode -e --accept-source-agreements --accept-package-agreements

# Install Notion
Write-Host "Installing Notion..." -ForegroundColor Cyan
winget install --id Notion.Notion -e --accept-source-agreements --accept-package-agreements

# Install Docker Desktop
Write-Host "Installing Docker Desktop..." -ForegroundColor Cyan
winget install --id Docker.DockerDesktop -e --accept-source-agreements --accept-package-agreements

# Install Git
Write-Host "Installing Git..." -ForegroundColor Cyan
winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements

# Install Node.js (LTS)
Write-Host "Installing Node.js (LTS)..." -ForegroundColor Cyan
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements

# Install Python 3
Write-Host "Installing Python 3..." -ForegroundColor Cyan
winget install --id Python.Python.3 -e --accept-source-agreements --accept-package-agreements

# Install Google Chrome
Write-Host "Installing Google Chrome..." -ForegroundColor Cyan
winget install --id Google.Chrome -e --accept-source-agreements --accept-package-agreements

# Install 7-Zip
Write-Host "Installing 7-Zip..." -ForegroundColor Cyan
winget install --id 7zip.7zip -e --accept-source-agreements --accept-package-agreements

Write-Host "=========================================" -ForegroundColor Green
Write-Host "All essential software installation completed!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

Read-Host "Press Enter to continue" 