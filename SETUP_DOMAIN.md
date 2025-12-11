# Verify Your Domain in Resend

To send emails from `welcome@mail.mommymilkbar.nl` (or any @mommymilkbar.nl address), you need to verify your domain in Resend.

## Steps to Verify Domain

### 1. Add Your Domain in Resend

1. Go to https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `mommymilkbar.nl`
4. Click **"Add"**

### 2. Add DNS Records

Resend will provide you with DNS records to add. You need to add these to your domain's DNS settings (wherever your domain is hosted - likely TransIP, Cloudflare, or similar).

You'll need to add:
- **SPF record** (TXT record) - Proves you authorize Resend to send emails
- **DKIM record** (TXT record) - Cryptographic signature for email authentication
- **DMARC record** (TXT record) - Email authentication policy
- **MX records** (optional, only if you want to receive emails via Resend)

### 3. Verify in Resend

After adding the DNS records:
1. Wait 5-10 minutes for DNS propagation
2. Go back to https://resend.com/domains
3. Click **"Verify"** next to your domain
4. If successful, you'll see a green checkmark ✅

## Using Verified Domain

Once verified, update your FROM address:

```typescript
// In Supabase Edge Function
const fromEmail = 'Mommy Milk Bar <welcome@mail.mommymilkbar.nl>';
```

## Current Status

- ✅ API Key created: `re_fBMcuxA3_Bnx3vBLZ2dy8rDAaoHGqHv8v`
- ✅ API Key set in Supabase secrets
- ⏳ Domain verification pending
- ⏳ Deploy function after domain verification

## Testing Before Domain Verification

For now, emails can be sent to your verified email: `beervhaagen@icloud.com`

To send to other addresses (like `info@mommymilkbar.nl`), you must complete domain verification first.

## Need Help?

Resend documentation: https://resend.com/docs/dashboard/domains/introduction
