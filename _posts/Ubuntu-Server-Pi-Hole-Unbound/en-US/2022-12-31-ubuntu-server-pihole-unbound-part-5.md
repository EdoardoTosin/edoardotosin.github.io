---
title: DNS server installation and configuration (Part 5) - Pi-Hole configuration (EN)
description: "How to configure Pi-Hole's web interface, manage blocklists, and wire it together with Unbound to complete your self-hosted, privacy-focused DNS server."
short_url: pihole-guide-5
date: 2024-01-02 14:00:00 +0100
last_modified_at: 2026-02-03 19:00:00 +0100
lang: en
image: https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_2.webp
topic: selfhosting
tags:
  - ubuntu
  - unbound
  - pi-hole
  - dns
  - server
  - adblocker
keywords:
  - pi-hole web interface
  - pi-hole configuration
  - dns server configuration
  - pi-hole unbound setup
  - router dns settings
  - network dns configuration
  - pi-hole admin panel
---

*In the [previous part]({% post_url Ubuntu-Server-Pi-Hole-Unbound/en-US/2022-12-31-ubuntu-server-pihole-unbound-part-4 %}) it was explained how to install Unbound.*

## Pi-Hole Web Interface Configuration

Open the browser and enter the IP of the computer where Ubuntu Server is installed followed by `/admin` as shown in the following figure. When the page loads, click the `Login` item present in the left vertical menu.

![Pi-Hole web interface - login page accessed via browser at server IP/admin](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_2.webp)

The Pi-Hole web interface password will be asked. Enter it and click `Login` to confirm and enter.

![Pi-Hole web interface - password entry screen for admin login](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_3.webp)

The following screen is the one before logging in. The difference is that now there is the possibility of configuring Pi-Hole.

![Pi-Hole web interface - dashboard after logging in, showing configuration options](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_4.webp)

Click the `Settings` item in the left menu.

![Pi-Hole web interface - Settings menu item highlighted in the left navigation panel](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_5.webp)

Click `DNS` from the items present at the top.

![Pi-Hole web interface - DNS tab selected within the Settings page](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_6.webp)

In the block titled `Upstream DNS Servers` on the left, deselect any tick present. Instead, in the homonymous block on the right, select `Custom 1 (IPv4)` and enter `127.0.0.1#5353` which are the interface and the port that were previously entered in the Unbound configuration file. This will make Pi-Hole ask Unbound for DNS resolution instead of using an external server outside the network.

![Pi-Hole web interface - DNS settings with Custom 1 (IPv4) set to 127.0.0.1#5353 (Unbound) as upstream DNS](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_7.webp)

In the block titled `Interface settings`, click the `Bind only to interface ...` voice.

![Pi-Hole web interface - Interface settings with "Bind only to interface" option selected](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_8.webp)

To save all this, scroll down with the mouse and click `Save` located at the bottom right of the screen.

![Pi-Hole web interface - Save button at bottom right to confirm DNS settings changes](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_9.webp)

### Backup Pi-Hole Settings

For safety, download the current Pi-Hole configuration so that in case of need to restore the settings it is faster to do it from a file.
To do this, press click from the horizontal menu present at the top the `Teleporter` voice. Finally, click `Backup` and confirm the file save.

![Pi-Hole web interface - Teleporter page for backing up current Pi-Hole configuration](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_10.webp)

## Router Configuration

Now from the router settings (refer to the router manual to understand where to find the setting), you can change the DNS to the IP of the computer where Ubuntu Server is installed. This will make every device connected to the network with automatic DNS make a resolution request to the router which in turn will forward the packets to the system filtering most of the advertising from websites and also dangerous content.
