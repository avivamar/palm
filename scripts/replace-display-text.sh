#!/bin/bash

# Replace/* Thepalmistrylife with Thepalmistrylife in display text only (locales and visible content)
# This script preserves internal code structure and package names

echo "🔄 Starting replacement of display text from 'Rolitt' to 'Thepalmistrylife'..."

# Replace in all locale files
echo "🌍 Updating locale files..."
find src/locales -name "*.json" -type f | while read -r file; do
    echo "  Processing: $file"
    
    # Replace variations in display text
    sed -i '' \
        -e 's/"Rolitt"/"Thepalmistrylife"/g' \
        -e 's/"rolitt"/"thepalmistrylife"/g' \
        -e 's/Rolitt AI/Thepalmistrylife/g' \
        -e 's/Rolittai/Thepalmistrylife/g' \
        -e 's/ROLITT/THEPALMISTRYLIFE/g' \
        -e "s/Rolitt's/Thepalmistrylife's/g" \
        -e 's/Rolitt was/Thepalmistrylife was/g' \
        -e 's/Rolitt offers/Thepalmistrylife offers/g' \
        -e 's/Rolitt provide/Thepalmistrylife provides/g' \
        -e 's/At/* Thepalmistrylife/At Thepalmistrylife/g' \
        -e 's/Thepalmistrylife Team/Thepalmistrylife Team/g' \
        -e 's/Rolitt サポート/Thepalmistrylife サポート/g' \
        -e 's/Rolitt 知的感情AIコンパニオン/Thepalmistrylife プロフェッショナル手相占いサービス/g' \
        -e 's/Rolitt – /Thepalmistrylife – /g' \
        -e 's/Rolitt：/Thepalmistrylife：/g' \
        "$file"
done

# Update blog content configuration
echo "📝 Updating blog content configuration..."
if [ -f "src/app/[locale]/(marketing)/blog/content/config.ts" ]; then
    sed -i '' \
        -e 's/Rolitt/Thepalmistrylife/g' \
        -e 's/rolitt/thepalmistrylife/g' \
        "src/app/[locale]/(marketing)/blog/content/config.ts"
fi

# Update terms page
echo "📜 Updating terms page..."
if [ -f "src/app/[locale]/(marketing)/terms/page.tsx" ]; then
    sed -i '' \
        -e 's/"Rolitt"/"Thepalmistrylife"/g' \
        -e 's/>Rolitt/>Thepalmistrylife/g' \
        -e "s/'Rolitt'/'Thepalmistrylife'/g" \
        "src/app/[locale]/(marketing)/terms/page.tsx"
fi

# Update privacy page if exists
echo "🔒 Checking for privacy page..."
if [ -f "src/app/[locale]/(marketing)/privacy/page.tsx" ]; then
    sed -i '' \
        -e 's/"Rolitt"/"Thepalmistrylife"/g' \
        -e 's/>Rolitt/>Thepalmistrylife/g' \
        -e "s/'Rolitt'/'Thepalmistrylife'/g" \
        "src/app/[locale]/(marketing)/privacy/page.tsx"
fi

# Update any hardcoded display text in components (only in strings, not imports)
echo "🎨 Updating component display text..."
find src/components -name "*.tsx" -o -name "*.jsx" | while read -r file; do
    # Only replace in string literals, not in imports or package references
    sed -i '' \
        -e 's/"Rolitt"/"Thepalmistrylife"/g' \
        -e "s/'Rolitt'/'Thepalmistrylife'/g" \
        -e 's/>Rolitt</>Thepalmistrylife</g' \
        -e 's/{`Rolitt/{`Thepalmistrylife/g' \
        "$file" 2>/dev/null || true
done

echo "✅ Display text replacement complete!"
echo ""
echo "📋 Summary:"
echo "  - All locale files updated"
echo "  - Blog content configuration updated"
echo "  - Terms and privacy pages updated"
echo "  - Component display text updated"
echo ""
echo "⚠️  Note: Internal package names (@rolitt/*) remain unchanged"
echo "    This preserves system functionality while updating user-visible text."