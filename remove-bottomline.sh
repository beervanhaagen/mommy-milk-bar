#!/bin/bash

# Script to remove all bottomLine references from tsx files

files=$(find app -name "*.tsx" -type f -exec grep -l "bottomLine" {} \;)

for file in $files; do
  echo "Processing $file..."

  # Remove the bottomLine View component (with various spacing patterns)
  sed -i '' '/<View style={styles\.bottomLine} \/>/d' "$file"
  sed -i '' '/^[[:space:]]*<View style={styles\.bottomLine} \/>$/d' "$file"

  # Remove bottomLine style definition (multi-line)
  # This removes lines starting with 'bottomLine:' until the closing brace
  sed -i '' '/^[[:space:]]*bottomLine: {$/,/^[[:space:]]*},$/d' "$file"

  echo "✓ Processed $file"
done

echo ""
echo "✅ All bottomLine references removed!"
