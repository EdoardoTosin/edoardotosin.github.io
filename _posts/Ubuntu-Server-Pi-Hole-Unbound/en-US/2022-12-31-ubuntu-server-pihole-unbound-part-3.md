---
title: 'Pi-Hole & Unbound Setup - Part 3: Pi-Hole Installation'
description: How to install Pi-Hole on Ubuntu Server to block ads and trackers at the DNS level across your entire network, as part of a self-hosted DNS stack with Unbound.
short_url: pihole-guide-3
date: 2024-01-02 12:00:00 +0100
last_modified_at: 2024-08-07 16:30:08 +0200
lang: en
image: https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_7.webp
topic: selfhosting
tags:
  - ubuntu
  - unbound
  - pi-hole
  - dns
  - server
  - adblocker
keywords:
  - pi-hole installation ubuntu
  - dns ad blocker setup
  - pi-hole ubuntu server
  - network ad blocking
  - dns pi-hole installation
  - pi-hole configuration
  - ad blocker server
---

_In the [previous part]({% post_url Ubuntu-Server-Pi-Hole-Unbound/en-US/2022-12-31-ubuntu-server-pihole-unbound-part-2 %}) it was explained how to add two-factor authentication (2FA) for SSH access._

## Pi-Hole Installation

In this phase, Pi-Hole, an open-source software, will be installed. It acts as a [DNS sinkhole](https://it.wikipedia.org/wiki/DNS_sinkhole) and optionally as a DHCP server. This application filters DNS requests to drastically reduce advertising present in web pages.

### Download official repository

As the first step, download the Pi-Hole repository: `git clone --depth 1 https://github.com/pi-hole/pi-hole.git Pi-hole`.

![Pi-Hole installation - cloning the official Pi-Hole GitHub repository](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_2.webp)

At the end of the download, enter the folder: `cd 'Pi-hole/automated install/'`.

![Pi-Hole installation - navigating into the Pi-hole automated install directory](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_4.webp)

### Prepare Pi-Hole installation

From this directory, launch the bash script: `sudo bash basic-install.sh`.
It may ask for the user password as it is launched with administrator privileges.
If so, enter it and press `Enter`.

![Pi-Hole installation - running basic-install.sh bash script with sudo privileges](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_6.webp)

Wait for a moment for compatibility checks and conflicts.

![Pi-Hole installation - compatibility checks and dependency verification in progress](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_7.webp)

Press `Enter` for each of the two screens to start the configuration.

![Pi-Hole installation - first informational screen, press Enter to continue](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_8.webp)

![Pi-Hole installation - second informational screen, press Enter to begin configuration](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_9.webp)

### Configure Pi-Hole installation

Since the router has been set as a static IP, we can confirm by selecting `Continue` and pressing `Enter`.

![Pi-Hole installation - static IP confirmation screen, selecting Continue](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_10.webp)

Select the same interface to which the IP used throughout the entire procedure was assigned. In this case, the first one. Press `Enter` to confirm.

![Pi-Hole installation - network interface selection screen](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_11.webp)

Select a temporary DNS provider. Later it will be removed as the computer with Ubuntu Server will become its own DNS resolver at port `5353` and address `127.0.0.1`.

![Pi-Hole installation - selecting a temporary upstream DNS provider](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_12.webp)

Select `Yes` to include third-party lists to filter content and confirm by pressing `Enter`.

![Pi-Hole installation - enabling third-party blocklists for ad and tracker filtering](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_13.webp)

Confirm the installation of the web interface for making further changes to the settings. Select `Yes` and press `Enter`.

![Pi-Hole installation - confirming installation of the Pi-Hole web admin interface](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_14.webp)

Confirm the installation of the lightweight web server lighttpd to make the web interface functional. Select `Yes` and press `Enter`.

![Pi-Hole installation - confirming installation of the lighttpd web server](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_15.webp)

Enable logging of queries for potential debugging of problems. Select `Yes` and press `Enter`.

![Pi-Hole installation - enabling DNS query logging for debugging purposes](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_16.webp)

In this screen, you can choose how many contents are visible from the admin web interface. Leave the default `Show everything`. Select `Continue` and press `Enter`.

![Pi-Hole installation - privacy mode selection for web interface, leaving "Show everything" as default](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_17.webp)

Here, the auto-generated password for logging into the web interface via the computer's IP will be displayed. It's not important to remember it since it will be changed with a longer one for security reasons later. Press `Enter` to continue.

![Pi-Hole installation - auto-generated admin web interface password displayed on completion](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_18.webp)

Once the Pi-Hole configuration procedure is completed, you can proceed to change the admin interface password (not to be confused with the user password).

![Pi-Hole installation - installation complete summary screen](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_19.webp)

To change the Pi-Hole web interface password, use the command `pihole -a -p`.

![Pi-Hole - running "pihole -a -p" command to change the admin web interface password](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_20.webp)

After pressing `Enter`, enter the password, press `Enter` again, re-enter the password, and finally confirm with the `Enter` key.

![Pi-Hole - entering and confirming the new admin web interface password](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_21.webp)

If the procedure was successful, the text `New password set` will appear.

![Pi-Hole - "New password set" confirmation message after successfully changing the password](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_22.webp)

**[Next part]({% post_url Ubuntu-Server-Pi-Hole-Unbound/en-US/2022-12-31-ubuntu-server-pihole-unbound-part-4 %})**
