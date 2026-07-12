@echo off
color 0A
echo ===================================================
echo   BOOKS AND NOTES CG BOARD - GitHub Push Script
echo ===================================================
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed on your system!
    echo Please install Git and try again.
    pause
    exit /b
)

:: Confirm git status
echo [INFO] Checking local files...
git status
echo.

:: Ask for commit message
set /p commit_msg="Enter commit message (Default: Update project files): "
if "%commit_msg%"=="" set commit_msg="Update project files"

:: Ask for remote repository URL
echo.
echo Please enter your GitHub Repository URL.
echo Format: https://github.com/username/repo-name.git
set /p repo_url="GitHub Repo URL: "

if "%repo_url%"=="" (
    echo [ERROR] GitHub repository URL is required!
    pause
    exit /b
)

:: Git commands execution
echo.
echo [INFO] Staging all files...
git add .

echo [INFO] Committing files...
git commit -m "%commit_msg%"

echo [INFO] Setting branch name to main...
git branch -M main

echo [INFO] Setting remote origin...
:: Remove existing origin if any
git remote remove origin >nul 2>nul
git remote add origin %repo_url%

echo [INFO] Pushing code to GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo  [SUCCESS] Code pushed to GitHub successfully!
    echo ===================================================
    echo.
    echo Now you can go to Vercel (https://vercel.com) and:
    echo 1. Import this repository.
    echo 2. Set Environment Variables:
    echo    - DATABASE_URL: (Your Turso DB url)
    echo    - DATABASE_AUTH_TOKEN: (Your Turso auth token)
    echo 3. Build and Deploy!
    echo.
) else (
    echo.
    echo [ERROR] Failed to push code to GitHub. Please check your credentials and repository URL.
)

pause
