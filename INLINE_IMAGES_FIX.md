# Inline Images Fix for Welcome Email

## Problem Summary
Inline images in the welcome email were not displaying in Apple Mail, despite being embedded correctly. The email would arrive but show only text, with no visible images.

## Root Causes Identified

### 1. **Incorrect API Field Names**
Resend's API requires **snake_case** field names for attachments, but the code was using **camelCase**:
- ❌ `contentType` → ✅ `content_type`
- ❌ `contentId` → ✅ `content_id`

This caused Resend to not properly set the MIME `Content-ID` headers, preventing email clients from linking `cid:` references to attachments.

### 2. **CID Format**
Using `cid_${uuid}` as the Content-ID was unconventional. Changed to plain UUID format for better compatibility with strict email clients like Apple Mail.

## Changes Made

### File: `supabase/functions/send-welcome-email/index.ts`

#### Change 1: Simplified CID Generation (Line 44)
```typescript
// BEFORE:
cid: `cid_${crypto.randomUUID()}`

// AFTER:
cid: crypto.randomUUID()
```

**Why**: Apple Mail and other clients prefer simple, clean Content-ID values without prefixes.

#### Change 2: Fixed Resend API Field Names (Lines 277-282)
```typescript
// BEFORE:
.map((asset) => ({
  filename: asset.filename,
  content: asset.base64,
  contentType: 'image/png',        // ❌ Wrong field name
  disposition: 'inline',
  contentId: asset.cid,            // ❌ Wrong field name
}))

// AFTER:
.map((asset) => ({
  filename: asset.filename,
  content: asset.base64,
  content_type: 'image/png',       // ✅ Correct snake_case
  disposition: 'inline' as const,
  content_id: asset.cid,           // ✅ Correct snake_case
}))
```

**Why**: Resend's Node.js SDK (and API) expects snake_case field names. Using camelCase silently failed to set proper MIME headers.

## How It Works Now

1. **Asset Loading**: Images are loaded from local PNG files and base64-encoded
2. **CID Generation**: Each image gets a unique UUID as its Content-ID (e.g., `123e4567-e89b-12d3-a456-426614174000`)
3. **HTML Reference**: Images are referenced in HTML as `<img src="cid:123e4567-e89b-12d3-a456-426614174000">`
4. **MIME Attachment**: Resend creates inline attachments with proper `Content-ID` headers
5. **Email Client**: Matches `cid:` references to attachments and displays images inline

## Testing the Fix

### Option 1: Deploy to Production
```bash
# If project is linked:
npx supabase functions deploy send-welcome-email

# Or deploy manually via Supabase Dashboard
```

### Option 2: Test Locally
```bash
# Start local Supabase
npx supabase start

# In another terminal, deploy to local
npx supabase functions serve

# Test with script
TO_EMAIL=your@email.com node test-email-inline-images.js
```

### Option 3: Direct Test via Resend Dashboard
Use the Resend dashboard to send a test email with the same attachment structure to verify the fix.

## Verification Checklist

After deploying, test with:
- [ ] **Apple Mail** (macOS/iOS) - Was showing only text before
- [ ] **Gmail** (web/app) - Usually more forgiving
- [ ] **Outlook** (web/desktop) - Can be strict about MIME
- [ ] **Yahoo Mail** - Good for cross-client testing

### What to Check:
1. ✅ All images display automatically (no "Load Images" prompt)
2. ✅ Mimi mascot appears in header
3. ✅ Three iPhone mockups show in features section
4. ✅ App Store and Instagram icons visible in footer
5. ✅ Images maintain proper aspect ratio and styling

## Expected Behavior

### Before Fix:
- Email arrives with text only
- Images don't render
- No errors from Resend
- "Load Images" button doesn't help

### After Fix:
- Email displays fully formatted HTML
- All inline images render immediately
- No user action required
- Works across all major email clients

## Technical Details

### Content-ID Header Format
The fix ensures Resend generates proper MIME headers:
```
Content-Type: image/png
Content-Disposition: inline
Content-ID: <123e4567-e89b-12d3-a456-426614174000>
Content-Transfer-Encoding: base64
```

### CID URL Scheme
HTML references use the `cid:` URL scheme:
```html
<img src="cid:123e4567-e89b-12d3-a456-426614174000" />
```

Email clients parse the CID, look for a matching `Content-ID` header in attachments, and inline the image data.

## Alternative Approach (If Issues Persist)

If inline images still don't work after this fix, consider hosting images on a CDN:

### Pros of CDN Approach:
- More reliable across all email clients
- Smaller email payload size
- Easier to update images without redeploying
- Better analytics (can track image loads)

### Cons of CDN Approach:
- Requires public hosting
- Users see "Load Remote Images" prompt in some clients
- Privacy concerns (tracking pixels)
- Requires internet connection to view

### Implementation:
1. Upload images to Supabase Storage or CDN
2. Replace `cid:` URLs with `https://` URLs
3. Remove `attachments` array from email send

## References

- [Resend Attachments API](https://resend.com/docs/api-reference/emails/send-email#body-parameters)
- [RFC 2392: Content-ID and Message-ID URL](https://www.rfc-editor.org/rfc/rfc2392)
- [MIME Inline Images](https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html)

## Deployment Command

```bash
# Link project first (if not already linked)
npx supabase link --project-ref your-project-ref

# Deploy function
npx supabase functions deploy send-welcome-email

# Test it
node test-email-inline-images.js
```

## Support

If images still don't display after deploying this fix:
1. Check Resend logs for API errors
2. Inspect raw email source (View > Message > Raw Source in Apple Mail)
3. Verify `Content-ID` headers match `cid:` references
4. Consider the CDN alternative approach above
