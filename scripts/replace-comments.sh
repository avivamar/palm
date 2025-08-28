#!/bin/bash

# Replace/* Thepalmistrylife with Thepalmistrylife in code comments and documentation

echo "🔄 Replacing 'Rolitt' with 'Thepalmistrylife' in comments and documentation..."

# Replace in TypeScript/JavaScript comments
echo "📝 Updating TypeScript/JavaScript comments..."
find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | while read -r file; do
    # Replace in single-line comments
    sed -i '' \
        -e 's|//.*Rolitt|// Thepalmistrylife|g' \
        -e 's|// Thepalmistrylife|// Thepalmistrylife|g' \
        -e 's|/*/* Thepalmistrylife|/* Thepalmistrylife|g' \
        -e 's|*/* Thepalmistrylife|* Thepalmistrylife|g' \
        -e 's|<!--/* Thepalmistrylife|<!-- Thepalmistrylife|g' \
        -e 's|Rolitt brand|Thepalmistrylife brand|g' \
        -e 's|Rolitt-synced|Thepalmistrylife-synced|g' \
        -e 's|Thepalmistrylife Team|Thepalmistrylife Team|g' \
        "$file" 2>/dev/null || true
done

# Replace in CSS comments
echo "🎨 Updating CSS comments..."
find src -type f \( -name "*.css" -o -name "*.scss" \) | while read -r file; do
    sed -i '' \
        -e 's|/*/* Thepalmistrylife|/* Thepalmistrylife|g' \
        -e 's|Rolitt brand|Thepalmistrylife brand|g' \
        "$file" 2>/dev/null || true
done

# Replace in public folder files
echo "📁 Updating public folder files..."
if [ -d "public" ]; then
    find public -type f \( -name "*.html" -o -name "*.xml" -o -name "*.txt" -o -name "*.json" \) | while read -r file; do
        sed -i '' \
            -e 's/Rolitt/Thepalmistrylife/g' \
            -e 's/rolitt/thepalmistrylife/g' \
            "$file" 2>/dev/null || true
    done
fi

# Replace in scripts folder
echo "🔧 Updating script comments..."
find scripts -type f \( -name "*.sh" -o -name "*.js" -o -name "*.ts" \) | while read -r file; do
    sed -i '' \
        -e 's|# Thepalmistrylife|# Thepalmistrylife|g' \
        -e 's|// Thepalmistrylife|// Thepalmistrylife|g' \
        -e 's|/*/* Thepalmistrylife|/* Thepalmistrylife|g' \
        -e 's|Thepalmistrylife Team|Thepalmistrylife Team|g' \
        "$file" 2>/dev/null || true
done

# Replace in README and documentation (but not package names)
echo "📚 Updating documentation..."
for file in README.md CLAUDE.md; do
    if [ -f "$file" ]; then
        # Only replace display text, not @rolitt package names
        sed -i '' \
            -e 's/Rolitt AI/Thepalmistrylife/g' \
            -e 's/Rolitt官方/Thepalmistrylife官方/g' \
            -e 's/为Rolitt/为Thepalmistrylife/g' \
            -e 's/Rolitt开发规范/Thepalmistrylife开发规范/g' \
            "$file" 2>/dev/null || true
    fi
done

echo "✅ Comment replacement complete!"