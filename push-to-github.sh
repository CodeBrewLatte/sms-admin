#!/bin/bash

# Script to push SMS Admin to GitHub
# Usage: ./push-to-github.sh <your-github-username> <repo-name>

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./push-to-github.sh <your-github-username> <repo-name>"
  echo "Example: ./push-to-github.sh steve sms-admin"
  exit 1
fi

GITHUB_USER=$1
REPO_NAME=$2

echo "Adding remote origin..."
git remote add origin https://github.com/${GITHUB_USER}/${REPO_NAME}.git 2>/dev/null || git remote set-url origin https://github.com/${GITHUB_USER}/${REPO_NAME}.git

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "Done! Your repo is now at: https://github.com/${GITHUB_USER}/${REPO_NAME}"

