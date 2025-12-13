/**
 * PhotoSwipe v5 Initialization Script
 */

(function() {
    'use strict';

    // Wait for DOM and PhotoSwipe libraries to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPhotoSwipe);
    } else {
        initPhotoSwipe();
    }

    function initPhotoSwipe() {
        // Check if PhotoSwipe libraries are loaded
        if (typeof PhotoSwipeLightbox === 'undefined') {
            console.error('PhotoSwipe library not loaded');
            return;
        }

        const galleries = document.querySelectorAll('[data-pswp-gallery]');

        if (galleries.length === 0) {
            return; // No galleries on this page
        }

        /**
         * Initialize PhotoSwipe Lightbox
         * Using PhotoSwipe v5 recommended configuration
         */
        const lightbox = new PhotoSwipeLightbox({
            // Gallery selectors
            gallery: '[data-pswp-gallery]',
            children: 'a',

            // PhotoSwipe module
            pswpModule: PhotoSwipe,

            // Zoom levels (PhotoSwipe v5 standard)
            // 'fit' automatically handles both small and large images correctly:
            // - Small images: displayed at 1:1 (no upscaling)
            // - Large images: fit to viewport
            initialZoomLevel: 'fit',

            // Secondary zoom: 1:1 pixel ratio
            // Used by zoom button, double-tap, and single click
            secondaryZoomLevel: 1,

            // Maximum zoom via pinch/wheel gestures
            maxZoomLevel: 2,

            // Click/tap behavior (PhotoSwipe v5 defaults - optimal for UX)
            // Single click on image: zoom if possible, else close
            imageClickAction: 'zoom-or-close',

            // Double-tap: zoom to secondaryZoomLevel
            doubleTapAction: 'zoom',

            // Single tap on viewport: toggle UI controls
            tapAction: 'toggle-controls',

            // Click on background: close gallery
            bgClickAction: 'close',

            // UI behavior
            showHideAnimationType: 'fade',
            bgOpacity: 0.95,
            spacing: 0.1,
            allowPanToNext: true,
            loop: true,

            // Gesture controls
            pinchToClose: false,
            closeOnVerticalDrag: true,

            // Padding for better touch target areas
            padding: {
                top: 20,
                bottom: 20,
                left: 20,
                right: 20
            },

            // Preload adjacent slides
            preload: [1, 2]
        });

        /**
         * Custom caption rendering
         * Displays markdown-formatted captions
         */
        lightbox.on('uiRegister', function() {
            lightbox.pswp.ui.registerElement({
                name: 'custom-caption',
                order: 9,
                isButton: false,
                appendTo: 'root',
                html: '',
                onInit: function(el, pswp) {
                    pswp.on('change', function() {
                        const currSlide = pswp.currSlide;
                        let captionHTML = '';

                        if (currSlide && currSlide.data && currSlide.data.element) {
                            const titleAttr = currSlide.data.element.getAttribute('data-pswp-caption');
                            if (titleAttr) {
                                captionHTML = titleAttr;
                            }
                        }

                        el.innerHTML = captionHTML || '';
                    });
                }
            });
        });

        /**
         * Optional: Keyboard shortcut 'Z' for zoom toggle
         * This is a custom enhancement, not part of PhotoSwipe v5 defaults
         */
        lightbox.on('bindEvents', function() {
            const pswp = lightbox.pswp;

            pswp.on('keydown', function(e) {
                const key = e.originalEvent.key;
                if (key === 'z' || key === 'Z') {
                    const slide = pswp.currSlide;
                    if (!slide) return;

                    const initialZoom = slide.zoomLevels.initial;
                    const secondaryZoom = slide.zoomLevels.secondary;
                    const currentZoom = slide.currZoomLevel;

                    // Toggle between initial and secondary zoom
                    const isAtInitial = Math.abs(currentZoom - initialZoom) < 0.01;
                    const targetZoom = isAtInitial ? secondaryZoom : initialZoom;

                    slide.zoomTo(targetZoom, {
                        x: slide.bounds.center.x,
                        y: slide.bounds.center.y
                    }, 333);
                }
            });
        });

        // Initialize the lightbox
        lightbox.init();

        // Store lightbox instance for potential external access
        window.photoSwipeLightbox = lightbox;
    }
})();
