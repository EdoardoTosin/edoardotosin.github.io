---
permalink: /security-policy
layout: Post
content-type: static
title: Security Policy
description: "Security measures, vulnerability management, and responsible disclosure policy for this website."
date: 2023-01-29
last_modified_at: 2025-11-15
sitemap: false
noindex: nofollow
---

*Last updated on {{ page.last_modified_at | date: "%d %b %Y" }}.*

<br>

Thank you for visiting my website! Security and privacy are important to me, and while this is a personal static website, I maintain appropriate security measures to protect both the site and its visitors. This page outlines my security approach and provides guidance for reporting security issues.

---

## Website Architecture and Security Model

This website is built using a security-focused architecture:

- **Static Site Generation**: Built with Jekyll, eliminating server-side vulnerabilities
- **Version Control**: Source code hosted on GitHub with full transparency
- **Automated Deployment**: GitHub Actions builds and deploys the site automatically
- **No Dynamic Components**: No databases, user authentication, or server-side scripting
- **Minimal Attack Surface**: Static files only, reducing potential security risks

## Infrastructure Security

### GitHub Pages Security
- **Platform Security**: Benefit from GitHub's enterprise-grade security infrastructure
- **Automatic Updates**: Platform security patches applied automatically by GitHub
- **Access Controls**: Repository access controlled via GitHub's permission system
- **Audit Logging**: All changes tracked through Git version control

### Cloudflare Security Layer
- **DDoS Protection**: Automatic mitigation of distributed denial-of-service attacks
- **Web Application Firewall (WAF)**: Protection against common web vulnerabilities
- **Bot Management**: Advanced bot detection and mitigation
- **SSL/TLS Encryption**: Automatic HTTPS with modern TLS protocols
- **Security Headers**: Implementation of security headers (HSTS, CSP, etc.)
- **Rate Limiting**: Protection against abuse and excessive requests

## Transport Security

- **HTTPS Everywhere**: All traffic encrypted using TLS 1.2+ with strong cipher suites
- **HTTP Strict Transport Security (HSTS)**: Browser enforcement of HTTPS connections
- **Certificate Management**: Automated SSL certificate provisioning and renewal
- **Perfect Forward Secrecy**: Protection of past communications even if keys are compromised

## Content Security

### Dependency Management
- **Automated Scanning**: GitHub Dependabot monitors all dependencies for vulnerabilities
- **Regular Updates**: Jekyll, gems, and other dependencies updated promptly
- **Security Patches**: Critical security updates applied as soon as available
- **Minimal Dependencies**: Only essential dependencies used to reduce attack surface

### Content Security Policy (CSP)
- **Strict Policies**: Content Security Policy headers prevent XSS attacks
- **Resource Whitelisting**: Only approved external resources allowed
- **Inline Script Restrictions**: Prevention of malicious script injection

## Vulnerability Management

### Proactive Security Measures
- **Regular Security Reviews**: Periodic assessment of security configurations
- **Dependency Auditing**: Continuous monitoring of all project dependencies
- **Security Best Practices**: Following OWASP guidelines and security standards
- **Automated Testing**: Security checks integrated into deployment pipeline

### Vulnerability Assessment Scope
Security considerations apply to:
- Jekyll site configuration and build process
- All dependencies and gems used in the project
- Cloudflare security settings and configurations
- DNS and domain security settings
- Any client-side JavaScript (if present)

## Responsible Disclosure Policy

I appreciate security researchers who help identify and report vulnerabilities responsibly.

### Reporting Process
1. **Email Disclosure**: Send security reports to [edoardotosindev@proton.me](mailto:edoardotosindev@proton.me)
   - Use "Security Vulnerability Report" in the subject line
   - Encrypt sensitive reports using my [PGP key]({{ 'security/signed-email-d2da678db99dc787.txt' | absolute_url }})
   
2. **GitHub Issues**: For non-sensitive matters, open an issue at [EdoardoTosin/edoardotosin.github.io](https://github.com/EdoardoTosin/edoardotosin.github.io)

### Report Requirements
Please include:
- **Vulnerability Description**: Clear explanation of the security issue
- **Steps to Reproduce**: Detailed reproduction steps
- **Impact Assessment**: Potential security impact and affected components
- **Proof of Concept**: Evidence of the vulnerability (if applicable)
- **Suggested Fix**: Recommendations for remediation (if known)

### Disclosure Timeline
- **Initial Response**: Within 48-72 hours of report receipt
- **Investigation**: Up to 14 days for assessment and reproduction
- **Resolution**: Target fix deployment within 30 days for critical issues
- **Public Disclosure**: Coordinated after fix deployment, with reporter credit (if desired)

### Recognition
Security researchers who responsibly report valid vulnerabilities will be:
- Credited on this Security Policy page (with permission)
- Acknowledged in commit messages for security fixes
- Listed in security advisories (if applicable)

## Out of Scope

The following are outside the scope of this security policy:
- **Third-party Services**: External websites linked from this site
- **User Devices**: Client-side security issues not related to website content
- **Social Engineering**: Attacks targeting the site owner personally
- **Physical Security**: Non-digital security concerns

## Security Contacts and Resources

- **Primary Contact**: [edoardotosindev@proton.me](mailto:edoardotosindev@proton.me)
- **GitHub Repository**: [EdoardoTosin/edoardotosin.github.io](https://github.com/EdoardoTosin/edoardotosin.github.io)
- **General Contact**: [Contact page]({{ '/contact' | relative_url }})

## Compliance and Standards

This website aims to comply with:
- **OWASP Top 10**: Protection against common web application security risks
- **Security Headers**: Implementation of recommended HTTP security headers
- **TLS Best Practices**: Modern encryption standards and protocols
- **GDPR/Privacy**: Appropriate data protection measures (see Privacy Policy)

---

Thank you for helping maintain the security of this website. Your responsible disclosure helps protect all visitors and contributes to a safer internet for everyone.
