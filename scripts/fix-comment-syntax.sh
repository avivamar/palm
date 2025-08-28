#!/bin/bash

# Fix incorrect comment syntax caused by wrong replacements

echo "🔧 Fixing incorrect comment syntax..."

# Find all TypeScript/JavaScript files with broken comments
files=$(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" -o -name "*.js" \) -exec grep -l "/\*.*Thepalmistrylife" {} \;)

for file in $files; do
    echo "  Fixing: $file"
    
    # Fix broken import statements
    sed -i '' \
        -e 's|import {/\* Thepalmistrylife|import { Rolitt|g' \
        -e 's|/\* ThepalmistrylifeKlaviyoEvents|RolittKlaviyoEvents|g' \
        -e 's|await/\* Thepalmistrylife|await Rolitt|g' \
        -e 's|/\* Thepalmistrylife brand|/* Thepalmistrylife brand|g' \
        "$file"
    
    # Fix comments that should remain as comments
    sed -i '' \
        -e 's|/\*/\* Thepalmistrylife|/* Thepalmistrylife|g' \
        -e 's|/\* \* Thepalmistrylife|/* Thepalmistrylife|g' \
        "$file"
done

echo "✅ Comment syntax fixed!"