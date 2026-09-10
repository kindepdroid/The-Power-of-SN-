# Security notes

- Authorize every mutation at the server and PostgreSQL layers. Do not grant direct table writes to `anon`/`authenticated`.
- Keep email confirmation enabled. Check roles from `profiles`, never signup metadata.
- Keep `service_role`, SMTP credentials, database passwords, and `.env.local` out of Git.
- Admins can publish their own articles by product decision; this is intentional, not an authorization bypass.
- Public media is deliberately public. Use only approved image assets. This release checks image signatures and size but does not strip EXIF or provide a malware scanning service.
- Markdown raw HTML and inline images are disabled. Do not add `rehype-raw` without a separate sanitization review.
- Disable compromised accounts through Super Admin, revoke provider sessions where appropriate, inspect editorial/access logs, and rotate affected service credentials.
- Keep production authentication email/rate limits and service-account MFA configured. App-level admin MFA is not implemented in this MVP.
- Follow privacy requests through the organization's contact channel. Define retention and deletion procedures before launch.
- Report suspected vulnerabilities privately to the repository owner; do not post private contributor data or credentials in public issues.
