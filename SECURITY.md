# Security policy

PHOENIX Aid is designed to work without user accounts, API keys, or a backend.

## Publishing safeguards

- Never commit `.env` files, private keys, certificates, tokens, or credentials.
- Do not add exact household locations, names, medical records, or free-form emergency notes to the repository.
- Raw research captures and local snapshots are intentionally excluded by `.gitignore`; only reviewed, public, normalized data needed by the app may be published.
- Run `npm audit --audit-level=moderate` and the repository secret scan before each release.

## Reporting

Please report a potential security or privacy issue privately to the repository owner. Do not include personal or precise-location data in a public issue.
