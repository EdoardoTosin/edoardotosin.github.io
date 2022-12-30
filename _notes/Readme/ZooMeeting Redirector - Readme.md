---
title: ZooMeeting Redirector - Readme
feed: show
date: 21-05-2021
---

A web extension that redirects zoom meetings to the web client version.

## Description

This project was intended to make it easier to redirect Zoom meetings links to the web client page.  
This browser addon works by replacing a portion of the url with `*/wc/join/*` so that it loads the meeting joining page. For example `https://zoom.us/j/0123456789` would be converted to `https://zoom.us/wc/join/0123456789`.  
The web client is preferable over the desktop app because of the restriction that web browsers places on web pages, protecting your computer against malicious attacks and unauthorized access of your machine.  
For more information about best practices for securing your Zoom meetings read this blog post: [10 tips for Zoom security and privacy](https://www.kaspersky.com/blog/zoom-security-ten-tips/34729).

## Features

### Extension toggle

When opening the dashboard there is a toggle to enable/disable the extension to better control the behaviour whenever wanted.

### Dark mode

According to system settings the extension's dashboard has the corresponding background.

## Installation

<table>
    <thead align="center">
        <tr>
            <th>Mozilla Firefox Add-on</th>
            <th>Chromium*</th>
            <th>Microsoft Edge</th>
        </tr>
    </thead>
    <tbody align="center">
        <tr>
          <td><a href="https://addons.mozilla.org/firefox/addon/zoomeeting-redirector">
         <img alt="Mozilla Firefox" src="https://img.shields.io/amo/v/zoomeeting-redirector?label=firefox&logo=Firefox&style=for-the-badge"></a></td>
          <td><a href="https://github.com/EdoardoTosin/ZooMeeting-Redirector/releases" href_x="https://chrome.google.com/webstore/detail/zoom-web-client-redirecto/ommndciompclncigoffdnipifnfnaclj">
          <img alt_x="Chromium" src_x="https://img.shields.io/chrome-web-store/v/ommndciompclncigoffdnipifnfnaclj?label=chrome&logo=google-chrome&style=for-the-badge">Only available here</a></td>
          <td><a href="https://microsoftedge.microsoft.com/addons/detail/kfpmepjfaolgcgabdmbpkfnicejbiggn">
       <img alt="Microsoft Edge" src="https://img.shields.io/badge/dynamic/json?label=Edge%09%09&logo=microsoft-edge&style=for-the-badge&prefix=v&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fkfpmepjfaolgcgabdmbpkfnicejbiggn"></a></td>
        </tr>
    </tbody>
</table>

\* Only compatible with Chromium-based browsers that support Manifest V2 (included Chrome until the end of 2023).

## Dashboard

<table>
    <thead align="center">
        <tr>
            <th colspan=2>Light Mode</th>
            <th colspan=2>Dark Mode</th>
        </tr>
    </thead>
    <tbody align="center">
        <tr>
            <td>Toggle Off</td>
            <td>Toggle On<br>(Default)</td>
            <td>Toggle Off</td>
            <td>Toggle On<br>(Default)</td>
        </tr>
        <tr>
          <td><img alt="Toggle Off - Light Mode" src="https://raw.githubusercontent.com/EdoardoTosin/ZooMeeting-Redirector/main/assets/dashboard/off-light.png"></td>
          <td><img alt="Toggle On - Light Mode" src="https://raw.githubusercontent.com/EdoardoTosin/ZooMeeting-Redirector/main/assets/dashboard/on-light.png"></td>
          <td><img alt="Toggle Off - Dark Mode" src="https://raw.githubusercontent.com/EdoardoTosin/ZooMeeting-Redirector/main/assets/dashboard/off-dark.png"></td>
          <td><img alt="Toggle On - Dark Mode" src="https://raw.githubusercontent.com/EdoardoTosin/ZooMeeting-Redirector/main/assets/dashboard/on-dark.png"></td>
        </tr>
    </tbody>
</table>

## Redirect example

![Gif](https://raw.githubusercontent.com/EdoardoTosin/ZooMeeting-Redirector/main/assets/example/redirect_clip.gif)

## Privacy policy

ZooMeeting Redirector does **NOT** collect any data of any kind.

## Permissions

``` json
"permissions": [
  "activeTab",
  "storage",
  "*://*.zoom.us/*",
  "*://*.zoomgov.com/*"
],
```

- ``activeTab`` is necessary to be able to open hyperlinks in the dashboard.
- ``storage`` is used to store the status of the slide checkbox.  
- ``*://*.zoom.us/*`` and ``*://*.zoomgov.com/*`` are necessary to get the url and modify it to redirect to the web client page.

## Release History

See the [releases pages](https://github.com/EdoardoTosin/ZooMeeting-Redirector/releases) for a history of releases and highlights for each release.

## Changelog

For more details see the [CHANGELOG](https://github.com/EdoardoTosin/ZooMeeting-Redirector/tree/main/CHANGELOG.md) file.

## Contributing

[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.0-4baaaa.svg?style=for-the-badge)](https://github.com/EdoardoTosin/ZooMeeting-Redirector/tree/main/CODE_OF_CONDUCT.md)  
When contributing to this repository, please first discuss the change you wish to make via issue, discussion, or any other method with the owner of this repository before making a change.

**Read carefully the [contributing guidelines](https://github.com/EdoardoTosin/ZooMeeting-Redirector/tree/main/CONTRIBUTING.md).**

## Security Policy

For more details see the [SECURITY](https://github.com/EdoardoTosin/ZooMeeting-Redirector/blob/main/SECURITY.md) file.

## License

This software is released under the terms of the GNU General Public License v3.0. See the [LICENSE](https://github.com/EdoardoTosin/ZooMeeting-Redirector/tree/main/LICENSE) file for further information.
