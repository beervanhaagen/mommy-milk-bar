# Why Inline Images Don't Work Reliably

## The Problem
Inline image attachments using `cid:` URLs are:
- ❌ Blocked by many email clients (security settings)
- ❌ Unreliable in Apple Mail / iCloud Mail
- ❌ Increase email size significantly (~500KB+ payload)
- ❌ Can trigger spam filters
- ❌ Don't work offline

## The Solution: Use Hosted Images

Host images on Supabase Storage or a CDN and use `https://` URLs instead.

### Benefits:
- ✅ Works reliably in ALL email clients
- ✅ Smaller email payload
- ✅ Can update images without resending
- ✅ Better caching
- ✅ Industry standard practice

## Implementation Steps

### 1. Upload Images to Supabase Storage

```bash
# Create a public bucket
npx supabase storage create email-assets --public

# Upload images
cd supabase/functions/send-welcome-email/assets
for file in *.png; do
  npx supabase storage upload email-assets "$file" "$file"
done
```

### 2. Get Public URLs

```bash
# List uploaded files and their URLs
npx supabase storage list email-assets
```

Example URLs will look like:
```
https://lqmnkdqyoxytyyxuglhx.supabase.co/storage/v1/object/public/email-assets/mimi_happy.png
```

### 3. Update Email Function

Replace the inline attachment approach with direct URLs:

```typescript
// Remove the loadAsset function and assets loading
// Remove the attachments array from resend.emails.send()

// In imageTag function, use direct URLs:
const imageTag = (imageUrl: string, alt: string, extra = '') =>
  `<img src="${imageUrl}" alt="${alt}" style="display:block;border:0;max-width:100%;${extra}" />`;

// In buildEmailHtml, use public URLs:
const STORAGE_BASE = 'https://lqmnkdqyoxytyyxuglhx.supabase.co/storage/v1/object/public/email-assets';

${imageTag(`${STORAGE_BASE}/mimi_happy.png`, 'Mimi', 'width:90px;...')}
${imageTag(`${STORAGE_BASE}/iphone_planlog_optimized.png`, 'Plannen of loggen', 'max-width:280px;...')}
// etc.

// In resend.emails.send(), remove attachments:
await resend.emails.send({
  from: fromEmail,
  to: email,
  subject: 'Welkom bij Mommy Milk Bar',
  html: buildEmailHtml(motherName, verificationUrl),
  text: buildEmailText(motherName, verificationUrl),
  // No attachments!
});
```

## Why This Works Better

### Email Client Compatibility
- Gmail: ✅ Shows images (after user enables)
- Apple Mail: ✅ Shows images reliably
- Outlook: ✅ Shows images
- Yahoo: ✅ Shows images
- Mobile clients: ✅ All work

### Performance
- Email size: ~5KB (instead of ~500KB)
- Send time: Faster
- Delivery success rate: Higher

### User Experience
- Images load from fast CDN
- Can be cached by browser
- Work across all devices
- "Load Images" button works properly

## Alternative: Use Resend's Own CDN

You can also upload images to Resend and they'll host them:

```typescript
// Upload once via Resend dashboard
// Then reference the Resend CDN URL
const imageUrl = 'https://resend.com/static/your-image.png';
```

## Quick Fix Script

Want to switch to hosted images? Run:

```bash
./switch-to-cdn-images.sh
```

This will:
1. Upload all assets to Supabase Storage
2. Update the email function
3. Deploy the changes
4. Send a test email

## Testing

After switching to CDN:
```bash
TO_EMAIL=your@email.com node test-email-inline-images.js
```

Images should now appear reliably in all email clients!
