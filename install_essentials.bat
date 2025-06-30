@echo off
:: Essential Productivity & Developer Tools Installer
:: Run this script as administrator

echo =========================================
echo Installing Essential Productivity & Dev Tools
:: PowerToys
winget install --id Microsoft.PowerToys -e
:: Visual Studio Code
winget install --id Microsoft.VisualStudioCode -e
:: Notion
winget install --id Notion.Notion -e
:: Docker Desktop
winget install --id Docker.DockerDesktop -e
:: Git
winget install --id Git.Git -e
:: Node.js (LTS)
winget install --id OpenJS.NodeJS.LTS -e
:: Python 3
winget install --id Python.Python.3 -e
:: Google Chrome
winget install --id Google.Chrome -e
:: 7-Zip
winget install --id 7zip.7zip -e

echo =========================================
echo All essential software installation commands have been run.
echo If you see any errors, you may need to run this script as administrator.
pause 