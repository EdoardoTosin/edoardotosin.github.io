---
title: 'Pi-Hole & Unbound Setup - Part 2: Two-Factor Authentication'
description: How to set up two-factor authentication (2FA) on Ubuntu Server using Google Authenticator to secure SSH access before deploying Pi-Hole and Unbound.
short_url: pihole-guide-2
date: 2024-01-02 11:00:00 +0100
last_modified_at: 2024-08-07 16:30:08 +0200
lang: en
image: https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_13.webp
topic: selfhosting
tags:
  - ubuntu
  - unbound
  - pi-hole
  - dns
  - server
  - adblocker
keywords:
  - ubuntu 2fa setup
  - ssh two factor authentication
  - google authenticator ubuntu
  - ssh security
  - ubuntu server security
  - two factor authentication linux
  - ssh 2fa configuration
---

_In the [previous part]({% post_url Ubuntu-Server-Pi-Hole-Unbound/en-US/2022-12-31-ubuntu-server-pihole-unbound-part-1 %}) it was explained how to install the Ubuntu Server operating system._

## SSH

After installation, the system and installed packages are updated to their latest versions.

### Login via SSH

To access, open the terminal on another computer in the same network (Powershell in the case of Windows) and type the following command:

```shell
ssh USERNAME@IP
```

`USERNAME` is replaced with the username entered during the Ubuntu Server installation phase (Profile settings)
Replace `IP` with the IP address of the computer where Ubuntu Server is installed.
`-p 22` is optional since by default ssh connects to port 22 of the device.

![SSH login - connecting to Ubuntu Server via terminal using ssh command](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_1.webp)

After pressing enter, it will ask to save the SHA256 key. Write `y` and confirm by pressing the `Enter` key.

![SSH login - prompt to confirm saving the server's SHA256 host key](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_2.webp)

Now enter the password set during the Ubuntu Server installation phase (Profile settings).

![SSH login - entering user password for Ubuntu Server authentication](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_3.webp)

If everything has been entered correctly, it is possible to control Ubuntu Server remotely from CLI.

![SSH login - successful remote CLI access to Ubuntu Server](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_4.webp)

## System Update

![Ubuntu Server - running system update commands via SSH](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_5.webp)

### Update repositories and system

To start the update, just run the line `sudo apt update && sudo apt upgrade`. Running both commands with `sudo` will ask for the user's password (the same used for login).

![Ubuntu Server - running "sudo apt update && sudo apt upgrade" to update repositories and packages](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_6.webp)

### Confirm updates

To confirm the start of the updates, write `y` and press `Enter`.

![Ubuntu Server - confirming package upgrades by typing "y"](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_7.webp)

### Restart services

It is likely that a screen will appear asking which services to restart. Select `Ok` without changing anything from the list and then press `Enter` to confirm.

![Ubuntu Server - services restart dialog after system update, selecting Ok](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_8.webp)

Now you can restart the computer to verify that with the latest updates the system works before proceeding with the installation of applications.

![Ubuntu Server - rebooting system after completing updates](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_9.webp)

## 2FA Installation

In the following procedure, two-factor authentication will be added to reduce the risk of unauthorized access (Zero Trust).

### Package Installation

Log in again following the `Login via SSH` procedure without the paragraph regarding the key.

Execute the command `sudo apt install libpam-google-authenticator` to install the package required for two-factor authentication.

![2FA setup - installing libpam-google-authenticator package via apt](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_10.webp)

Enter the user password confirming it. Subsequently, you will be asked to confirm the installation of the package. Write `y` and press `Enter`.

### 2FA Configuration

Now proceed to configure authentication with the temporary 6-digit code (changes every 30 seconds).

![2FA configuration - google-authenticator prompt asking whether tokens should be time-based](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_11.webp)

It will be asked whether you want the tokens to be temporary. Write `y` and press `Enter`.

![2FA configuration - QR code and secret key displayed for authenticator app setup](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_12.webp)

A secret key (`Your new secret key is:`) will be created for generating time-based codes.
It is important to keep a backup of this key to reduce the risk of losing it.
Scan the QR-Code or insert the key into an application (for Debian distros and derivatives, Authenticator is suitable already present in the system repositories) and save it.
After saving, you can see the code. Insert it into the terminal and press `Enter` to confirm.

![2FA configuration - entering the verification code from the authenticator app](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_13.webp)

Subsequently, it will be asked whether you want to update the .google_authenticator file. Confirm by writing `y` and pressing `Enter`.

![2FA configuration - prompt to update the .google_authenticator file](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_14.webp)

To increase security, we add restrictions to login every 30 seconds (so only one successful login per each generated code).
To confirm, write `y` and press `Enter`.

![2FA configuration - enabling one successful login per 30-second window restriction](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_15.webp)

It will be asked whether you want to extend the login with the generated code beyond the time limit from 3 codes to 17 (8 previous, current and 8 subsequent). Since 3 are already enough, it does not need to be extended further so write `n` and press `Enter`.

![2FA configuration - declining extended time window (17 codes) for code validity](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_16.webp)

Now the addition of the rate-limit will be confirmed, so that only 3 login attempts are possible every 30 seconds. To do this, write `y` and press `Enter`.

![2FA configuration - enabling rate-limit of 3 login attempts per 30 seconds](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_17.webp)

### Adding 2FA to login

To add the just configured two-factor authentication, the common-session file must be modified with the command `sudo nano /etc/pan.d/common-session`. If the password is requested, enter the user password.

![2FA setup - opening /etc/pam.d/common-session in nano editor to add Google Authenticator](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_18.webp)

Pressing `Enter` the file to edit will appear. After the line `# end of pam-auth-update config` you must add a new line that contains `auth required pam_google_authenticator.so` as shown in the next screen.
To save the changes and exit the editor, press `CTRL+X` then write `y` and finally press `Enter` to confirm.

![2FA setup - common-session file with "auth required pam_google_authenticator.so" line added](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_19.webp)

Another file to modify is `sshd_config`. To do this, just open it again with the command `sudo nano /etc/ssh/sshd_config`. If it asks for the password, enter the user password.

![2FA setup - opening /etc/ssh/sshd_config in nano editor to enable keyboard-interactive authentication](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_20.webp)

If the `KbdInteractiveAuthentication` option is set to `no`, replace it with `yes`.
To save these changes and exit the editor, press `CTRL+X` then write `y` and finally press `Enter` to confirm.

![2FA setup - sshd_config with KbdInteractiveAuthentication set to yes](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_21.webp)

Restart the sshd.service service to load the changes with the command `sudo systemctl restart sshd.service`

![2FA setup - restarting sshd service to apply 2FA configuration changes](https://raw.githubusercontent.com/EdoardoTosin/Ubuntu-Server-Pi-Hole-Unbound/main/assets/2_2FA/2FA_22.webp)

**[Next part]({% post_url Ubuntu-Server-Pi-Hole-Unbound/en-US/2022-12-31-ubuntu-server-pihole-unbound-part-3 %})**
