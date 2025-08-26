#!/bin/bash

# Initialize git
git init

# Install dependencies
npm install

# Setup husky
npm run prepare

# Create husky hooks
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg "npx commitlint --edit \$1"

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg

# Create license file
echo "Adding Apache 2.0 License..."
# Download or create Apache 2.0 license
curl -o LICENSE https://www.apache.org/licenses/LICENSE-2.0.txt

echo "Setup complete! Don't forget to:"
echo "1. Update the LICENSE file with your copyright information"
echo "2. Set your remote repository: git remote add origin <your-repo-url>"
echo "3. Make initial commit: npm run commit"