---
title: DNS server installation and configuration (Part 5) - Pi-Hole configuration (EN)
description: Welcome to this comprehensive guide on setting up a robust and secure DNS server using Ubuntu, Pi-Hole, and Unbound. This setup enhances your privacy and gives you better control over your network traffic.
date: 2024-01-02 14:00:00 +0100
last_modified_at: 2024-08-07 16:30:08 +0200
lang: en
ogimg: https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_1.jpg
tags:
  - ubuntu
  - unbound
  - pi-hole
  - dns
  - server
  - adblocker
---

*In the [previous part]({% post_url 2022-12-31-ubuntu-server-pihole-unbound-part-4 %}) it was explained how to install Unbound.*

## Pi-Hole Web Interface Configuration

Open the browser and enter the IP of the computer where Ubuntu Server is installed followed by `/admin` as shown in the following figure. When the page loads, click the `Login` item present in the left vertical menu.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_2.jpg" title="Pi-Hole Web Interface 2" %}

The Pi-Hole web interface password will be asked. Enter it and click `Login` to confirm and enter.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_3.jpg" title="Pi-Hole Web Interface 3" %}

The following screen is the one before logging in. The difference is that now there is the possibility of configuring Pi-Hole.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_4.jpg" title="Pi-Hole Web Interface 4" %}

Click the `Settings` item in the left menu.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_5.jpg" title="Pi-Hole Web Interface 5" %}

Click `DNS` from the items present at the top.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_6.jpg" title="Pi-Hole Web Interface 6" %}

In the block titled `Upstream DNS Servers` on the left, deselect any tick present. Instead, in the homonymous block on the right, select `Custom 1 (IPv4)` and enter `127.0.0.1#5353` which are the interface and the port that were previously entered in the Unbound configuration file. This will make Pi-Hole ask Unbound for DNS resolution instead of using an external server outside the network.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_7.jpg" title="Pi-Hole Web Interface 7" %}

In the block titled `Interface settings`, click the `Bind only to interface ...` voice.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_8.jpg" title="Pi-Hole Web Interface 8" %}

To save all this, scroll down with the mouse and click `Save` located at the bottom right of the screen.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_9.jpg" title="Pi-Hole Web Interface 9" %}

### Backup Pi-Hole Settings

For safety, download the current Pi-Hole configuration so that in case of need to restore the settings it is faster to do it from a file.
To do this, press click from the horizontal menu present at the top the `Teleporter` voice. Finally, click `Backup` and confirm the file save.

{% include Image.html src="https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/5_Pi-Hole_Web_Interface/Pi-Hole_Web_Interface_10.jpg" title="Pi-Hole Web Interface 10" %}

## Router Configuration

Now from the router settings (refer to the router manual to understand where to find the setting), you can change the DNS to the IP of the computer where Ubuntu Server is installed. This will make every device connected to the network with automatic DNS make a resolution request to the router which in turn will forward the packets to the system filtering most of the advertising from websites and also dangerous content.

