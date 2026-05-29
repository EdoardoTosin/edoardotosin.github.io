---
layout: post
title: 'Email Collision DoS: When Poor Validation Locks Users Out'
description: How a missing email uniqueness check on the update endpoint enables account lockout via email collision in a cloud portal
date: 2026-05-21 20:00:00 +0200
last_modified_at: 2026-05-29 15:00:00 +0200
short_url: vdp-email-2026
image: https://raw.githubusercontent.com/EdoardoTosin/web-assets/refs/heads/main/blog/Cybersecurity/2026-05-21-email-collision-dos-when-poor-validation-locks-users-out.webp
topic: cybersecurity
tags:
  - bug-bounty
  - web-security
  - account-security
  - dos
  - authentication
keywords:
  - email collision attack
  - email uniqueness vulnerability
  - duplicate email accounts
  - account lockout vulnerability
  - denial of service attack
  - password reset misdirection
  - input validation
  - email change security
featured: true
mermaid: true
---

Account lockout does not always require brute force or stolen credentials. A missing uniqueness check on the email update endpoint is enough. This is what I found in a cloud portal.

## Background

While managing my own accounts on a cloud data portal associated with a consumer electronics device, I noticed that the email change functionality accepted any email address without validation. Email changes went through a `PUT /portal/user` request. To test boundary conditions, I tried changing my email to the address of a second personal test account.

It responded with HTTP 200:

```json
{
  "status": "OK",
  "user": {
    "email": "victim@example.com"
  }
}
```

The vulnerability exists because the email update flow fails to check whether the new email address is already registered, despite the same validation being enforced during account creation.

## How It Works

Two conditions make this exploitable: the attacker must know the target's email address, and their account must predate the target's. The system resolves email collisions by creation order, so the older account always wins.

1. **Setup**: Account A (attacker, older): `attacker@example.com`. Account B (victim, newer): `victim@example.com`.
2. **Collision**: The attacker changes Account A's email to `victim@example.com` via the standard update endpoint. It goes through without error, and the system sends an email change notification to `victim@example.com`. The victim receives it but has no context for it and will likely ignore or dismiss it as spam.
3. **Lockout**: On login, `victim@example.com` resolves to Account A (the older record), so the victim's password doesn't match and authentication fails. Account B's data stays untouched; the attacker can only access their own Account A.

Password reset doesn't help by default. Requesting a reset for `victim@example.com` again resolves to Account A, so the link arrives in the victim's inbox (they own that address). They click it, set a new password, log in, and land inside Account A. No error appears; the only symptom is that their cloud data seems to have changed.

**Recovery**: If the victim pieces together what happened, they can change Account A's email to something else while in that session, which frees `victim@example.com` and makes Account B reachable again.

```mermaid
%%{init: {'themeVariables': {'fontSize':'13px','fontFamily':'ui-sans-serif, system-ui, sans-serif'}}}%%

sequenceDiagram
    autonumber
    participant A as Attacker<br/>(Account A)
    participant P as Portal
    participant V as Victim<br/>(Account B)

    Note over A: attacker@example.com (older account)
    Note over V: victim@example.com (newer account)

    rect rgb(240, 240, 245)
        Note over A,P: Attack: Email Collision
        A->>P: Change email to victim@example.com
        P-->>A: Accepted (no uniqueness check)
    end

    rect rgb(255, 240, 240)
        Note over V,P: Victim Lockout
        V->>P: Login with victim@example.com
        P-->>V: Authentication Failed
    end

    rect rgb(240, 255, 240)
        Note over A,P: Attacker's access unaffected
        A->>P: Login with victim@example.com
        P-->>A: Login Success (Account A only)
    end

    rect rgb(255, 250, 240)
        Note over V,P: Password Reset Misdirected
        V->>P: Request password reset
        P-->>V: Reset link sent to victim@example.com
        V->>P: Submit new password
        P-->>V: Login succeeds, but lands inside Account A
    end
```

## Impact

- **Account lockout**: The victim can't log in until the collision is resolved.
- **Silent misdirection**: Password reset completes without errors but lands the victim inside Account A. Their cloud data appears to have changed; nothing signals they're in the wrong account.

An endpoint that accepts email changes without checking for conflicts undoes whatever validation the registration flow enforces. I reported the finding through a third-party intermediary, who confirmed it was fixed.
