---
title: DNS server installation and configuration (Part 3) - Pi-Hole installation (EN)
description: Welcome to this comprehensive guide on setting up a robust and secure DNS server using Ubuntu, Pi-Hole, and Unbound. This setup enhances your privacy and gives you better control over your network traffic.
date: 2024-01-02 12:00:00 +0100
last_modified_at: 2024-03-03 12:30:00 +0100
ogimg: "https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_7.jpg"
---

*In the [previous part]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-part-2 %}) it was explained how to add two-factor authentication (2FA) for SSH access.*

## Pi-Hole Installation

In this phase, Pi-Hole, an open-source software, will be installed. It acts as a [DNS sinkhole](https://it.wikipedia.org/wiki/DNS_sinkhole) and optionally as a DHCP server. This application filters DNS requests to drastically reduce advertising present in web pages.

### Download official repository

As the first step, download the Pi-Hole repository: `git clone --depth 1 https://github.com/pi-hole/pi-hole.git Pi-hole`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_2.jpg" title="Pi-Hole 2" %}

At the end of the download, enter the folder: `cd 'Pi-hole/automated install/'`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_4.jpg" title="Pi-Hole 4" %}

### Prepare Pi-Hole installation

From this directory, launch the bash script: `sudo bash basic-install.sh`.
It may ask for the user password as it is launched with administrator privileges.
If so, enter it and press `Enter`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_6.jpg" title="Pi-Hole 6" %}

Wait for a moment for compatibility checks and conflicts.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_7.jpg" title="Pi-Hole 7" %}

Press `Enter` for each of the two screens to start the configuration.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_8.jpg" title="Pi-Hole 8" %}

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_9.jpg" title="Pi-Hole 9" %}

### Configure Pi-Hole installation

Since the router has been set as a static IP, we can confirm by selecting `Continue` and pressing `Enter`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_10.jpg" title="Pi-Hole 10" %}

Select the same interface to which the IP used throughout the entire procedure was assigned. In this case, the first one. Press `Enter` to confirm.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_11.jpg" title="Pi-Hole 11" %}

Select a temporary DNS provider. Later it will be removed as the computer with Ubuntu Server will become its own DNS resolver at port `5353` and address `127.0.0.1`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_12.jpg" title="Pi-Hole 12" %}

Select `Yes` to include third-party lists to filter content and confirm by pressing `Enter`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_13.jpg" title="Pi-Hole 13" %}

Confirm the installation of the web interface for making further changes to the settings. Select `Yes` and press `Enter`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_14.jpg" title="Pi-Hole 14" %}

Confirm the installation of the lightweight web server lighttpd to make the web interface functional. Select `Yes` and press `Enter`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_15.jpg" title="Pi-Hole 15" %}

Enable logging of queries for potential debugging of problems. Select `Yes` and press `Enter`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_16.jpg" title="Pi-Hole 16" %}

In this screen, you can choose how many contents are visible from the admin web interface. Leave the default `Show everything`. Select `Continue` and press `Enter`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_17.jpg" title="Pi-Hole 17" %}

Here, the auto-generated password for logging into the web interface via the computer's IP will be displayed. It's not important to remember it since it will be changed with a longer one for security reasons later. Press `Enter` to continue.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_18.jpg" title="Pi-Hole 18" %}

Once the Pi-Hole configuration procedure is completed, you can proceed to change the admin interface password (not to be confused with the user password).

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_19.jpg" title="Pi-Hole 19" %}

To change the Pi-Hole web interface password, use the command `pihole -a -p`.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_20.jpg" title="Pi-Hole 20" %}

After pressing `Enter`, enter the password, press `Enter` again, re-enter the password, and finally confirm with the `Enter` key.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_21.jpg" title="Pi-Hole 21" %}

If the procedure was successful, the text `New password set` will appear.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/3_Pi-Hole/Pi-Hole_22.jpg" title="Pi-Hole 22" %}

**[Next part]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-part-4 %})**
