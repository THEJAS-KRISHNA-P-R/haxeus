# Security Policy

## Supported Versions

The following versions of HAXEUS are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| v1.0.x  | :white_check_mark: |
| < v1.0  | :x:                |

## Reporting a Vulnerability

We take the security of HAXEUS seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email to the maintainers (or use the repository's private vulnerability reporting feature if enabled).

### Recent Hardening

As of April 2026, this repository has undergone a comprehensive security audit and hardening process, including:
- **Zero-Backtracking Regex**: All sensitive validation logic (emails, inputs) has been refactored to prevent ReDoS.
- **Recursive Sanitization**: Text inputs are now recursively stripped of HTML tags to prevent nested XSS bypasses.
- **Secret Purge**: Historical credentials have been purged from the git history.
- **Dependency Audit**: All high-severity vulnerabilities (e.g., in `lodash`) have been resolved.

We are committed to maintaining a 100% security-validated codebase.
