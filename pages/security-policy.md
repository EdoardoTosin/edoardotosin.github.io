---
permalink: /security-policy
layout: Post
content-type: static
title: Security Policy
description: "An overview of the security measures and responsible disclosure policy for this website."
date: 2023-01-29
last_modified_at: 2024-11-13
sitemap: false
noindex: nofollow
---

*Last updated on {{ page.last_modified_at | date: "%d %b %Y" }}.*

<br>

Thanks for visiting my website! I take your security and privacy seriously, and while this is a personal site primarily for sharing content, I still work to keep things secure. This page outlines the measures I take to safeguard this site and any data involved. 

---

## Security Approach

This website is hosted as an open-source project on GitHub using Jekyll, which is a static site generator. Because it's a static site, there is minimal user data collection or complex server interaction. Here are the main points I follow to keep things secure:

- **HTTPS Encryption:** The site is served over HTTPS, ensuring that the connection between you and my website is encrypted.
- **No User Accounts or Sensitive Data:** This website does not have user accounts, forms, or login requirements, so no sensitive user data is collected or stored.
- **Data on GitHub:** The source code for this site is available on GitHub at [EdoardoTosin/edoardotosin.github.io](https://github.com/EdoardoTosin/edoardotosin.github.io). Only publicly accessible content is hosted here, and no personal information is stored.

## Vulnerability Management

Even though this is a static site, I still keep an eye on potential vulnerabilities:

- **Regular Updates:** I regularly update the Jekyll platform and any dependencies to make sure they include the latest security patches.
- **Dependency Management:** I use GitHub's Dependabot alerts to stay informed of any security issues in the dependencies and address them promptly.

## Responsible Disclosure

If you discover a security issue on this site, I would appreciate it if you let me know. Here's how you can do that:

- **Report the Issue:** You can open an issue on GitHub if it's a non-sensitive matter, or you can email me directly at [edoardotosindev@proton.me](mailto:edoardotosindev@proton.me) for more serious issues.
- **Please Don't Publicly Disclose:** Give me a chance to fix the issue before disclosing it publicly.
- **Recognition:** If your report helps me improve security, I'd be happy to credit you here on the Security Policy page (with your permission).

## Scope

This Security Policy applies only to my website at [{{ site.url | split: "//" | last }}]({{ '/' | relative_url }}). If I link to external websites or services, please refer to their own security and privacy policies, as I don't control their security practices.

## Contact

If you have any questions about this Security Policy or want to report a security concern, feel free to [contact me]({{ '/contact' | relative_url }}).

---

Thank you for helping me keep this website secure for everyone!
