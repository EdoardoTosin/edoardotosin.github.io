---
layout: post
title: 'Estimating Artemis II Spacecraft Distance from Earth Using EXIF Metadata'
description: "Estimating the distance of Artemis II from Earth using NASA's photograph and its EXIF metadata."
date: 2026-04-07 23:00:00 +0200
last_modified_at: 2026-04-17 12:30:00 +0200
short_url: art2-exif
image: https://raw.githubusercontent.com/EdoardoTosin/web-assets/refs/heads/main/blog/Astrophotography/art002e000192.webp
topic: astrophotography
tags:
  - exif
  - osint
  - space
  - artemis-ii
  - orbital-geometry
  - photography
keywords:
  - rectilinear projection
  - angular diameter
  - exif metadata
  - nasa artemis ii
  - orbital analysis
featured: true
math: true
cited_by:
  - '[Hello, World! Ma la foto è vera o falsa? | Butac - Bufale Un Tanto Al Chilo](https://www.butac.it/hello-world-ai/)'
  - '[Artemis II: Hello, World! Foto è vera o falsa?](https://www.chiccheinformatiche.com/artemis-ii-hello-world-la-foto-e-vera-o-falsa/)'
---

## Estimating Distance from a NASA Image

On April 2, 2026, NASA released a photograph of Earth taken from the Orion spacecraft during Artemis II.[^1]

Using only the image file and its EXIF metadata, we can estimate how far the spacecraft was from Earth at the moment the picture was taken. This is a practical example of combining metadata, optics, and geometry.

![Earth photographed from Orion spacecraft during Artemis II](https://www.nasa.gov/wp-content/uploads/2026/04/art002e000192.jpg)

_Image credit: NASA / Reid Wiseman. Public domain._

## Key Metadata

From the original image file ([art002e000192.jpg](https://www.nasa.gov/wp-content/uploads/2026/04/art002e000192.jpg)):

- Resolution: 5568 x 3712 px
- Measured Earth diameter: 2896 px
- Camera: Nikon D5 (full-frame sensor)
- Lens: 14-24 mm f/2.8
- Focal length: 22.0 mm
- Horizontal field of view (derived): $\approx 78.58^\circ$

> [!NOTE]
> The field of view is derived from focal length and sensor size using:
>
> FOV = 2 x arctan(_sensor_width_ / (2 x _focal_length_))
>
> For a 36 mm full-frame sensor and 22 mm focal length, this yields $\approx 78.58^\circ$, matching EXIF.

## Angular Diameter of Earth

For a rectilinear lens, the angular size is:

$$
\theta = 2 \arctan\left(\frac{D_e}{W} \cdot \tan\left(\frac{\mathrm{FOV}}{2}\right)\right)
$$

Where:

- $D_e$ = Earth diameter in pixels
- $W$ = image width in pixels

Substitute values:

$$
\frac{D_e}{W} = \frac{2896}{5568} \approx 0.5201
$$

$$
\tan(39.29^\circ) \approx 0.8182
$$

$$
\theta \approx 2 \arctan(0.5201 \cdot 0.8182) \approx 46.1^\circ
$$

## Distance from Earth's Center

Using Earth radius $R = 6371\,\mathrm{km}$:

$$
d = \frac{R}{\tan(\theta/2)}
$$

$$
\tan(23.052^\circ) \approx 0.4255
$$

$$
d \approx \frac{6371}{0.4255} \approx 14972\,\mathrm{km}
$$

## Altitude

$$
h = d - R \approx 14972 - 6371 \approx 8601\,\mathrm{km}
$$

## Final Results

- Angular diameter: $\approx 46^\circ$
- Distance from Earth center: $\approx 14972\,\mathrm{km}$
- Altitude: $\approx 8601\,\mathrm{km}$

## Interpretation

The measured angular size places the spacecraft well above Low Earth Orbit ($\approx 400\,\mathrm{km}$), yet still far from the Moon ($\approx 384000\,\mathrm{km}$). This corresponds to a high Earth orbit, consistent with an early translunar phase.

## Assumptions and Uncertainty

This estimate relies on a few simplifying assumptions:

- Rectilinear projection for the lens
- Earth approximated as a sphere
- Minor influence from atmosphere, clouds, and lens distortion

Estimated uncertainty: $\pm 2-5 \%$ ($\approx \pm 300-750\,\mathrm{km}$)

## Conclusion

From the EXIF metadata and the measured size of Earth in the frame, it is possible to infer:

- The angular size of Earth in the image
- The spacecraft’s distance from Earth
- A plausible point along its trajectory

The image itself contains enough information to approximate the spacecraft’s position at the moment it was taken.

[^1]: Source of the NASA photograph: [Hello, World - NASA](https://www.nasa.gov/image-article/hello-world/). Photo by NASA / Reid Wiseman. Public domain.
