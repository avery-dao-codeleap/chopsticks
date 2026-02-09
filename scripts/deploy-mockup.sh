#!/bin/bash

# Deploy Interactive Mockup to GitHub Pages
# Usage: ./scripts/deploy-mockup.sh

set -e

echo "📦 Deploying interactive mockup to GitHub Pages..."

# Copy latest mockup to docs/
echo "Copying mockup..."
cp prototype/mockups/interactive-mockups.html docs/index.html

# Check if there are changes
if git diff --quiet docs/index.html; then
  echo "✅ No changes detected. Mockup is already up to date."
  exit 0
fi

# Commit and push
echo "Committing changes..."
git add docs/
git commit -m "Update interactive mockup for GitHub Pages"

echo "Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Deployed successfully!"
echo ""
echo "🌐 Your mockup will be live at:"
echo "   https://averydd.github.io/chopsticks/"
echo ""
echo "⚙️  If this is your first time, enable GitHub Pages:"
echo "   1. Go to: https://github.com/averydd/chopsticks/settings/pages"
echo "   2. Source: Deploy from a branch"
echo "   3. Branch: main"
echo "   4. Folder: /docs"
echo "   5. Save"
echo ""
echo "   It may take 1-2 minutes to go live."
echo ""
