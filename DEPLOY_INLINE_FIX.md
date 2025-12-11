# Quick Deploy: Inline Images Fix

## What Was Fixed

### The Problem
Emails sent via `send-welcome-email` function showed only text in Apple Mail—no inline images appeared despite proper HTML structure.

### The Solution
Fixed two critical bugs in [supabase/functions/send-welcome-email/index.ts](supabase/functions/send-welcome-email/index.ts):

1. **Changed CID format** from `cid_${uuid}` → `${uuid}` (cleaner, Apple Mail compatible)
2. **Fixed Resend API fields** from camelCase → snake_case:
   - `contentType` → `content_type` ✅
   - `contentId` → `content_id` ✅

The snake_case issue was **critical**: Resend silently ignored camelCase fields, so the `Content-ID` MIME headers were never set, breaking the `cid:` image references.

## Deploy Now

### Option 1: Use Existing Script (Recommended)
```bash
./deploy-and-test-email.sh
```

This will:
1. Deploy the updated function to Supabase
2. Send a test email to info@mommymilkbar.nl
3. You can then check if images appear correctly

### Option 2: Manual Deployment
```bash
# Deploy function
npx supabase functions deploy send-welcome-email --project-ref lqmnkdqyoxytyyxuglhx

# Send test email
curl -X POST 'https://lqmnkdqyoxytyyxuglhx.supabase.co/functions/v1/send-welcome-email' \
  -H "Authorization: Bearer $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"email":"YOUR_EMAIL","motherName":"Test User","verificationToken":"test-123"}'
```

### Option 3: Test with Custom Script
```bash
# Test with your own email
TO_EMAIL=your@email.com node test-email-inline-images.js
```

## What to Verify

After deploying, check the test email in:
- ✅ **Apple Mail** (the primary problem client)
- ✅ Gmail web/app
- ✅ Outlook

### Expected Results:
1. **Mimi mascot** appears in header
2. **3 iPhone mockups** show in features section
3. **App Store + Instagram icons** visible in footer
4. All images load **automatically** (no "Load Images" button needed)

## Troubleshooting

### If images still don't show:

1. **Check raw email source** (Apple Mail: View → Message → Raw Source):
   ```
   Look for these headers in attachments:
   Content-Type: image/png
   Content-ID: <some-uuid-here>
   Content-Disposition: inline
   ```

2. **Verify Resend API key** is set:
   ```bash
   npx supabase secrets list --project-ref lqmnkdqyoxytyyxuglhx
   ```

3. **Check function logs**:
   ```bash
   # Via Supabase Dashboard:
   # Project → Edge Functions → send-welcome-email → Logs
   ```

4. **Try the alternative approach**: Host images on CDN instead of inline
   - See [INLINE_IMAGES_FIX.md](INLINE_IMAGES_FIX.md) for details

## Technical Summary

| Before | After | Impact |
|--------|-------|--------|
| `contentType: 'image/png'` | `content_type: 'image/png'` | Resend now sets MIME headers correctly |
| `contentId: asset.cid` | `content_id: asset.cid` | Email clients can match CID references |
| `cid: 'cid_uuid'` | `cid: 'uuid'` | Cleaner format, better compatibility |

## Files Changed
- ✏️ [supabase/functions/send-welcome-email/index.ts](supabase/functions/send-welcome-email/index.ts) (Lines 44, 277-282)

## References
- 📄 [Full technical details](INLINE_IMAGES_FIX.md)
- 🔗 [Resend Attachments API Docs](https://resend.com/docs/api-reference/emails/send-email#body-parameters)
