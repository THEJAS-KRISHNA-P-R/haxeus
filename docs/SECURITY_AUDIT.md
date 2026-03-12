# Security Audit

Last updated: March 13, 2026

## Scope

This document records a manual code review of the HaxeuZ v26 Next.js ecommerce application.
It focuses on application-layer security, authentication and authorization flows, payment handling,
storage permissions, input validation, data exposure, and security-related configuration.

This is a source review, not a live penetration test. Findings should be validated again after code changes,
infrastructure changes, or dependency upgrades.

## Executive Summary

The application has solid security fundamentals overall:

- Server-side authentication checks are generally implemented correctly with `getUser()`.
- Admin access is protected server-side with role verification.
- Payment amount verification is performed server-side instead of trusting client input.
- Security headers and CSP are present in the Next.js configuration.
- Input sanitization and rate limiting exist across major user-facing routes.

The main problems are concentrated in a small number of high-impact areas:

1. A hardcoded API key appears to be committed in `.mcp.json`.
2. Supabase storage policies are too broad and appear to allow any authenticated user to upload or delete product images.
3. The OAuth redirect flow still carries a client-controlled redirect parameter through the sign-in initiation path.
4. Some supporting controls are weaker than they should be, especially upload restrictions, coupon throttling, and local cart validation.

## Severity Scale

- Critical: Immediate risk of compromise, unauthorized modification, or credential exposure.
- High: Significant security weakness with realistic exploitability or elevated business impact.
- Medium: Important weakness that should be addressed promptly but is not immediately catastrophic.
- Low: Defensive hardening or operational improvement.

## Findings

### Critical 1: Hardcoded API Key in `.mcp.json`

- Severity: Critical
- Evidence: `.mcp.json` contains a literal `API_KEY=...` argument.
- Risk:
  - The credential is exposed to anyone with repository access.
  - If this file was ever pushed to a remote, the secret should be treated as compromised.
  - Rotation is required even if the file is later removed.
- Impact:
  - Abuse of the external service tied to that API key.
  - Potential billing impact, quota exhaustion, or unauthorized API access.
- Recommended fix:
  - Remove the file from version control if it does not belong in the repo.
  - Rotate the exposed API key immediately.
  - Move the secret to `.env.local` or another secret manager.
  - Add `.mcp.json` to `.gitignore` if it is local-only tooling state.
- Suggested actions:
  - `git rm --cached .mcp.json`
  - rotate the key in the provider console
  - replace the inline value with an environment variable reference

### Critical 2: Broad Supabase Storage Policies for Product Images

- Severity: Critical
- Evidence: `supabase/FIX_STORAGE_RLS.sql` defines policies that allow authenticated users to insert, update, or delete objects in the product image bucket.
- Risk:
  - Any authenticated user may be able to upload arbitrary files.
  - Users may overwrite or delete product images.
  - This enables storefront defacement and weakens trust in catalog content.
  - If uploads are not strongly constrained elsewhere, this can expand into malicious file hosting.
- Impact:
  - Content tampering.
  - Admin workflow disruption.
  - Brand damage and potential abuse of storage resources.
- Recommended fix:
  - Restrict product image writes to admins only.
  - Enforce policy conditions using the `user_roles` table.
  - Review whether update and delete policies are needed at all.
- Example direction:

```sql
CREATE POLICY "Only admins can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### High 3: OAuth Redirect Parameter Still Flows Through Client Sign-In Initiation

- Severity: High
- Evidence:
  - `app/auth/page.tsx` reads a `redirect` query param.
  - `app/auth/callback/route.ts` validates the final redirect on the server.
- Risk:
  - The final callback appears to normalize unsafe redirects, which is good.
  - However, carrying client-controlled redirect data through the OAuth initiation path is unnecessary and increases complexity.
  - Any future regression in callback validation would turn this into a more direct open redirect issue.
- Impact:
  - Phishing or redirect-chain abuse if validation is weakened later.
  - Higher maintenance risk in auth flows.
- Recommended fix:
  - Do not pass arbitrary redirect values through the OAuth initiation options.
  - Keep post-login redirect handling server-side only.
  - If redirect support is needed, whitelist a small set of internal paths.

### High 4: Razorpay Webhook Relies on Signature Only

- Severity: High
- Evidence: `app/api/webhooks/razorpay/route.ts` verifies the signature with a timing-safe comparison.
- Risk:
  - Signature validation is the primary control and is correctly implemented.
  - There is no additional source-IP validation or provider-origin filtering.
  - This is not a signature-bypass vulnerability, but it is weaker than a defense-in-depth webhook implementation.
- Impact:
  - Larger attack surface for replay or probing attempts.
  - More pressure on secret handling because signature validation is the single trust boundary.
- Recommended fix:
  - Keep the current signature verification.
  - Add source IP allowlisting if Razorpay provides stable webhook IP ranges for the deployment environment.
  - Log and monitor rejected webhook attempts.

### Medium 5: File Upload Restrictions Are Incomplete

- Severity: Medium
- Evidence:
  - The storage policy review does not show file-type restrictions.
  - The current audit did not identify strict MIME and size validation in the upload path.
- Risk:
  - Even after fixing authorization, admins could unintentionally upload unsupported or dangerous file types.
  - Attackers who gain upload capability through some other flaw could abuse storage more easily.
- Impact:
  - Malicious file hosting.
  - Unbounded storage growth.
  - Operational issues with unsupported assets.
- Recommended fix:
  - Enforce MIME allowlists such as JPEG, PNG, and WebP.
  - Enforce file-size limits before upload.
  - Consider normalizing filenames and using server-generated object keys.

### Medium 6: Coupon Validation Rate Limit Is Too Permissive

- Severity: Medium
- Evidence: `app/api/coupons/validate/route.ts` allows 10 attempts per minute.
- Risk:
  - This supports coupon enumeration or automated guessing at a higher rate than necessary.
  - Coupon endpoints are often attractive brute-force targets because they reveal business logic rather than account data.
- Impact:
  - Abuse of promotional logic.
  - Increased bot traffic.
  - Discovery of valid coupon codes.
- Recommended fix:
  - Reduce the rate for anonymous callers.
  - Add a per-user limit for authenticated requests.
  - Consider backoff or temporary lockout behavior.

### Medium 7: Guest Cart Data Loaded from `localStorage` Without Structural Validation

- Severity: Medium
- Evidence: `contexts/CartContext.tsx` reads guest cart data from `localStorage` and parses it.
- Risk:
  - Local cart contents are user-controlled and should be treated as untrusted.
  - Server-side checkout validation appears to recalculate prices correctly, which reduces the risk of price tampering.
  - The remaining issue is UI inconsistency, malformed state, or exploitation if future client logic starts trusting those fields more heavily.
- Impact:
  - Broken client state.
  - Misleading cart display.
  - Higher blast radius if additional client-side trust is introduced later.
- Recommended fix:
  - Validate parsed structure before storing it in React state.
  - Reject entries with invalid product IDs, quantities, or shape.
  - Default to an empty cart on parse failure.

### Medium 8: Upload Security Depends Too Much on RLS Alone

- Severity: Medium
- Evidence: The current review found SQL policy changes but not a layered upload enforcement document.
- Risk:
  - RLS is necessary but not sufficient.
  - Upload endpoints should also validate type, size, ownership, and path conventions.
- Recommended fix:
  - Keep RLS strict.
  - Add application-layer validation in the upload handler.
  - Add audit logging for admin asset changes.

### Low 9: Search and Filtering Paths Should Continue Avoiding Error Leakage

- Severity: Low
- Evidence: admin search logic appears to sanitize terms before query construction.
- Risk:
  - Defensive sanitization exists, but complex filter construction can still leak schema details through verbose backend errors if future changes become less careful.
- Recommended fix:
  - Keep search inputs normalized.
  - Fail closed and avoid returning raw database error details to clients.

## Verified Strengths

### Authentication and Authorization

- API routes generally use server-validated `getUser()` rather than trusting raw session state.
- Admin access is enforced server-side against a role source rather than client-only UI state.
- The codebase appears to avoid authorization decisions based on `getSession()` alone.

### Payment Security

- Razorpay signatures are compared with `crypto.timingSafeEqual`.
- Payment amount checks are recalculated server-side rather than accepted from the client.
- Duplicate-payment and ownership validation logic is present in the order flow.

### Input Validation and Query Safety

- The project uses sanitization helpers for user-provided text.
- Supabase queries are structured through safe query builders rather than ad hoc SQL string interpolation.
- Mutation endpoints include rate limiting in several important places.

### CSRF and Browser Controls

- Origin checks are present on mutation endpoints reviewed during the audit.
- `next.config.mjs` includes a CSP and additional hardening headers.
- HSTS is enabled for production responses.
- Production browser source maps are disabled.

### Secret Exposure Boundaries

- `NEXT_PUBLIC_*` variables reviewed appear to be appropriately public configuration values.
- Privileged secrets such as service-role keys are intended for server-side use only.

## Recommended Remediation Order

### Priority 0

1. Remove `.mcp.json` from version control if it contains live secrets.
2. Rotate the exposed API key.
3. Restrict Supabase product-image storage policies to admins only.

### Priority 1

1. Simplify the OAuth redirect flow so redirect decisions remain server-side.
2. Add webhook source filtering or equivalent provider-origin hardening.
3. Review all upload paths for MIME, size, and filename restrictions.

### Priority 2

1. Tighten coupon rate limiting.
2. Validate guest cart payloads loaded from `localStorage`.
3. Add audit logging for privileged content changes.

## Suggested Validation Checklist After Fixes

- Confirm `.mcp.json` is absent from git history going forward.
- Confirm rotated credentials are deployed and old ones are invalid.
- Test that non-admin authenticated users cannot upload, update, or delete product images.
- Test that admin users still retain required asset-management access.
- Test OAuth login with safe and unsafe redirect values.
- Test Razorpay webhook handling with valid and invalid signatures.
- Test coupon validation throttling for anonymous and authenticated callers.
- Test malformed guest cart payloads in `localStorage`.

## Notes

- This document should be treated as the canonical workspace audit report.
- The repository memory summary should remain aligned with this file after future audits.