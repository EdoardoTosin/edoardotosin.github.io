---
layout: post
title: Detection of Early Fire Signal in Monte Faeta Using Sentinel-2
description: Identification of the earliest detectable wildfire-related pixel in Monte Faeta, Tuscany, using Sentinel-2 L2A imagery and spectral indices (29 April 2026).
date: 2026-05-02 23:00:00 +0200
last_modified_at: 2026-05-06 14:00:00 +0200
short_url: monte-faeta-wildfire
image: https://raw.githubusercontent.com/EdoardoTosin/web-assets/refs/heads/main/blog/Earth-Observation/2026-05-02-monte-faeta-wildfire.webp
topic: earth-observation
tags:
  - wildfire
  - sentinel-2
  - swir
  - remote-sensing
  - burn-index
  - tuscany
keywords:
  - sentinel-2 wildfire origin
  - monte faeta fire tuscany
  - SWIR false color
  - NBR burn severity
  - Copernicus Data Space
featured: true
---

This study analyses a Sentinel-2 Level-2A image acquired over Monte Faeta, Tuscany, on 29 April 2026.

The objective is to identify the earliest detectable fire-related signal in the satellite scene using spectral indices.

This analysis does not determine the cause or exact ignition point of the wildfire. It only evaluates spatial patterns of fire-related spectral signals at the time of satellite acquisition.

## Data source and processing

- Satellite: Sentinel-2 L2A (Copernicus Data Space Ecosystem)
- Sensor: MSI (Multispectral Instrument)
- Resolution: 10 m (bands resampled where needed)
- Processing: OpenEO Python workflow
- Area: 2 km by 2 km region over Monte Faeta

All spectral bands were resampled to a common 10 m grid before index calculation.

All imagery and derived products are based on Copernicus Sentinel-2 data provided by the European Space Agency (ESA) through the Copernicus Data Space Ecosystem. © European Union / ESA, contains modified Copernicus Sentinel data (2026). [^sentinel]

## True colour image

![Sentinel-2 true colour composite](https://raw.githubusercontent.com/EdoardoTosin/Monte-Faeta-Wildfire-Early-Fire-Signal-Sentinel2-2026/refs/heads/main/outputs/figures/monte-faeta_2026_true_color_low_res.jpg)

_Figure 1: True colour composite (B04, B03, B02). [^sentinel]_

The true colour composite shows vegetation, smoke presence, and surface disturbance. Active fire is not clearly visible due to atmospheric effects and band sensitivity.

## SWIR response

![Sentinel-2 SWIR composite](https://raw.githubusercontent.com/EdoardoTosin/Monte-Faeta-Wildfire-Early-Fire-Signal-Sentinel2-2026/refs/heads/main/outputs/figures/monte-faeta_2026_swir_low_res.jpg)

_Figure 2: SWIR composite highlighting thermal disturbance. [^sentinel]_

Shortwave infrared bands (especially B12) are sensitive to high temperature surfaces and burned vegetation.

Elevated SWIR reflectance in the study area indicates fire-related thermal disturbance or recent burning.

## Burn detection index

The Normalized Burn Ratio (NBR) is used to detect burned or fire-affected vegetation:

![Sentinel-2 NBR severity](https://raw.githubusercontent.com/EdoardoTosin/Monte-Faeta-Wildfire-Early-Fire-Signal-Sentinel2-2026/refs/heads/main/outputs/figures/monte-faeta_2026_nbr_low_res.jpg)

_Figure 3: Normalized Burn Ratio (NBR). [^sentinel]_

Lower values of NBR indicate burned or heat-affected surfaces.

## Earliest detected fire signal

A single pixel shows the strongest and most consistent fire-related spectral response in the scene.

**Location:** 43.7714°N, 10.4765°E  
**Spatial resolution:** 10 m (Sentinel-2 MSI)

At this location:

- SWIR reflectance is elevated, consistent with thermal disturbance
- NBR is strongly negative, consistent with burned vegetation
- MIRBI is positive, consistent with fire-related surface conditions

These indicators are spatially aligned within the same pixel.

## Interpretation

This pixel represents:

> The earliest detectable fire-related signal in the Sentinel-2 observation of this area.

This does not indicate the ignition point.

Limitations:

- Sentinel-2 does not measure temperature directly
- Each pixel represents a mixed 10 m ground area
- Fire spread dynamics can shift peak signal location
- Only a single satellite overpass is available

## Conclusion

Within the analysed Sentinel-2 scene:

- One pixel shows a consistent and strong fire-related spectral signature
- Multiple independent indices agree on this location
- This pixel is the highest-confidence fire signal in the dataset

Therefore, it is the **earliest detectable fire signal at satellite resolution** in this image.

[^sentinel]: Contains modified Copernicus Sentinel-2 data (2026), processed in a custom workflow. Data sourced from the Copernicus Data Space Ecosystem. © European Union / ESA.
