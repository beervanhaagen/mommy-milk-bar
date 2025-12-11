#!/bin/bash

# Switch Welcome Email from Inline Attachments to Hosted Images
# This solves the Apple Mail / iCloud image display issue

set -e

echo "🔄 Switching to hosted images for better email client compatibility..."
echo ""

PROJECT_REF="lqmnkdqyoxytyyxuglhx"
BUCKET_NAME="email-assets"
ASSETS_DIR="supabase/functions/send-welcome-email/assets"

# Check if bucket exists, create if not
echo "📦 Checking if storage bucket exists..."
if ! npx supabase storage list "$BUCKET_NAME" --project-ref "$PROJECT_REF" &>/dev/null; then
    echo "Creating public storage bucket: $BUCKET_NAME"
    npx supabase storage create "$BUCKET_NAME" --public --project-ref "$PROJECT_REF"
else
    echo "✅ Bucket already exists"
fi

echo ""
echo "📤 Uploading optimized images to Supabase Storage..."

# Upload only the optimized images we actually use
IMAGES=(
    "mimi_happy.png"
    "plannenloggenbanner_v2.png"
    "iphone_planlog_optimized.png"
    "iphone_homescr_optimized.png"
    "iphone_planning_optimized.png"
    "appdownloadios.png"
    "Instagram_logo.png"
)

cd "$ASSETS_DIR"
for img in "${IMAGES[@]}"; do
    if [ -f "$img" ]; then
        echo "  Uploading $img..."
        # Upload to Supabase Storage
        npx supabase storage upload "$BUCKET_NAME" "$img" "$img" --project-ref "$PROJECT_REF" || echo "  (already exists, skipping)"
    else
        echo "  ⚠️  Warning: $img not found"
    fi
done

cd ../../..

echo ""
echo "✅ Images uploaded successfully!"
echo ""
echo "🔗 Your images are now available at:"
echo "   https://$PROJECT_REF.supabase.co/storage/v1/object/public/$BUCKET_NAME/"
echo ""
echo "📝 Next steps:"
echo "   1. Update index.ts to use hosted URLs instead of inline attachments"
echo "   2. Remove the loadAsset() function and assets loading code"
echo "   3. Remove attachments array from resend.emails.send()"
echo "   4. Deploy and test!"
echo ""
echo "See USE_CDN_IMAGES.md for detailed instructions."
