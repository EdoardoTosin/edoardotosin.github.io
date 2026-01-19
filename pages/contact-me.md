---
permalink: /contact
layout: Post
content-type: static
title: Contact Me
description: How to contact me
---

<br>

<div align="center">
<img src="{{ '/assets/img/favicon.png' | absolute_url }}" alt="Logo" style="witdh:12em;height:12em">
<h2>{{site.heading}}</h2>
</div>

<div class="icon-container">
	<div class="icon-row">
		<a class="icon-item no-external-link-icon" href="mailto:edoardotosindev@proton.me">
			<svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" viewBox="0 0 512 512"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
			<span class="icon-title">Email</span>
		</a>
		{%- for item in site.link.mastodon -%}
		<a class="icon-item no-external-link-icon" href="{{ item }}">
			<svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" viewBox="0 0 448 512"><path class="icon" fill="currentColor" d="M433 179.1c0-97.2-63.7-125.7-63.7-125.7-62.5-28.7-228.6-28.4-290.5 0 0 0-63.7 28.5-63.7 125.7 0 115.7-6.6 259.4 105.6 289.1 40.5 10.7 75.3 13 103.3 11.4 50.8-2.8 79.3-18.1 79.3-18.1l-1.7-36.9s-36.3 11.4-77.1 10.1c-40.4-1.4-83-4.4-89.6-54a102.5 102.5 0 0 1 -.9-13.9c85.6 20.9 158.7 9.1 178.8 6.7 56.1-6.7 105-41.3 111.2-72.9 9.8-49.8 9-121.5 9-121.5zm-75.1 125.2h-46.6v-114.2c0-49.7-64-51.6-64 6.9v62.5h-46.3V197c0-58.5-64-56.6-64-6.9v114.2H90.2c0-122.1-5.2-147.9 18.4-175 25.9-28.9 79.8-30.8 103.8 6.1l11.6 19.5 11.6-19.5c24.1-37.1 78.1-34.8 103.8-6.1 23.7 27.3 18.4 53 18.4 175z"/></svg>
			<span class="icon-title">Mastodon</span>
		</a>
		{%- endfor -%}
		<a class="icon-item no-external-link-icon" href="https://bsky.app/profile/edoardotosin.com">
			<svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" viewBox="0 0 256 256"><path class="icon" fill="currentColor" d="M55.4911549,15.1724797 C84.8410141,37.2065079 116.408338,81.8843671 128,105.858226 C139.591662,81.8843671 171.158986,37.2065079 200.508845,15.1724797 C221.686085,-0.726562511 256,-13.0280836 256,26.1164797 C256,33.9343952 251.517746,91.7899445 248.888789,101.183522 C239.750761,133.838395 206.452732,142.167409 176.832451,137.126283 C228.607099,145.938001 241.777577,175.125607 213.333183,204.313212 C159.311775,259.746226 135.689465,190.40493 129.636507,172.637268 C128.526873,169.380029 128.007662,167.856198 128,169.151973 C127.992338,167.856198 127.473127,169.380029 126.363493,172.637268 C120.310535,190.40493 96.6882254,259.746226 42.6668169,204.313212 C14.2224225,175.125607 27.3929014,145.938001 79.1675493,137.126283 C49.5472676,142.167409 16.2492394,133.838395 7.11121127,101.183522 C4.48225352,91.7899445 0,33.9343952 0,26.1164797 C0,-13.0280836 34.3139155,-0.726562511 55.4911549,15.1724797z"/></svg>
			<span class="icon-title">Bluesky</span>
		</a>
	</div>
	<div class="icon-row">
		<a class="icon-item no-external-link-icon" href="/security/signed-email-d2da678db99dc787.txt">
			<svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" viewBox="0 0 512 512"><path class="icon" fill="currentColor" d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17l0 80c0 13.3 10.7 24 24 24l80 0c13.3 0 24-10.7 24-24l0-40 40 0c13.3 0 24-10.7 24-24l0-40 40 0c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"/></svg>
			<span class="icon-title">eMail Signing</span>
		</a>
		<a class="icon-item no-external-link-icon" href="/security/signed-commits-b1f7877739614df0.txt">
			<svg xmlns="http://www.w3.org/2000/svg" class="svg-icon" viewBox="0 0 512 512"><path class="icon" fill="currentColor" d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17l0 80c0 13.3 10.7 24 24 24l80 0c13.3 0 24-10.7 24-24l0-40 40 0c13.3 0 24-10.7 24-24l0-40 40 0c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"/></svg>
			<span class="icon-title">Git Commits</span>
		</a>
	</div>
</div>

<br>
