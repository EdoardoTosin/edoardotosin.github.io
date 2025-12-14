/**
 * PhotoSwipe v5 Initialization
 * Handles lightbox setup, theme detection, and caption interactions
 */

(function() {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        if (typeof PhotoSwipeLightbox === 'undefined') {
            return;
        }

        const galleries = document.querySelectorAll('[data-pswp-gallery]');
        if (galleries.length === 0) return;

        initializeLightbox();
        detectImageDimensions();
        observeThemeChanges();
    }

    /**
     * Initialize PhotoSwipe lightbox
     * PhotoSwipe automatically attaches click handlers to children elements
     */
    function initializeLightbox() {
        const lightbox = new PhotoSwipeLightbox({
            gallery: '[data-pswp-gallery]',
            children: 'a[data-pswp-slide]',
            pswpModule: PhotoSwipe,

            initialZoomLevel: 'fit',
            secondaryZoomLevel: 1,
            maxZoomLevel: 3,

            imageClickAction: 'zoom-or-close',
            tapAction: 'toggle-controls',
            doubleTapAction: 'zoom',
            bgClickAction: 'close',

            showHideAnimationType: 'fade',
            showAnimationDuration: 333,
            hideAnimationDuration: 333,
            bgOpacity: 1,
            spacing: 0.1,

            loop: true,
            allowPanToNext: true,

            pinchToClose: false,
            closeOnVerticalDrag: true,

            padding: {
                top: 20,
                bottom: 60,
                left: 20,
                right: 20
            },
            preload: [1, 2],
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        lightbox.on('init', () => {
            const galleries = document.querySelectorAll('[data-pswp-gallery]');
            let totalSlides = 0;

            galleries.forEach(gallery => {
                const slides = gallery.querySelectorAll('a[data-pswp-slide]');
                totalSlides += slides.length;
            });
        });

        /**
         * Detect single-image galleries and disable navigation
         */
        lightbox.on('beforeOpen', () => {
            const pswp = lightbox.pswp;
            if (!pswp) return;

            const numItems = pswp.getNumItems();

            if (numItems === 1) {
                setTimeout(() => {
                    if (pswp.element) {
                        pswp.element.classList.add('pswp--single-image');
                    }
                }, 0);

                pswp.options.loop = false;
                pswp.options.allowPanToNext = false;
            }
        });

        /**
         * Custom caption with clickable links
         */
        lightbox.on('uiRegister', function() {
            lightbox.pswp.ui.registerElement({
                name: 'custom-caption',
                order: 9,
                isButton: false,
                appendTo: 'root',
                html: '',
                onInit: (el, pswp) => {
                    pswp.on('change', () => {
                        updateCaption(el, pswp);
                    });
                    updateCaption(el, pswp);
                }
            });
        });

        /**
         * Keyboard shortcuts
         */
        lightbox.on('bindEvents', function() {
            const pswp = lightbox.pswp;

            pswp.on('keydown', (e) => {
                const key = e.originalEvent.key.toLowerCase();

                if (key === 'z') {
                    toggleZoom(pswp);
                }

                if (pswp.getNumItems() === 1) {
                    if (key === 'arrowleft' || key === 'arrowright') {
                        e.originalEvent.preventDefault();
                    }
                }
            });
        });

        /**
         * Return focus to trigger element on close
         */
        lightbox.on('close', () => {
            const trigger = lightbox.pswp?.options?.clickedElement;
            if (trigger && typeof trigger.focus === 'function') {
                setTimeout(() => trigger.focus(), 100);
            }
        });

        lightbox.on('open', () => {
            document.body.classList.add('pswp-open');
        });

        lightbox.on('close', () => {
            document.body.classList.remove('pswp-open');
        });

        lightbox.init();

        window.photoSwipeLightbox = lightbox;
    }

    /**
     * Update caption and make links safe to click
     * Prevents caption links from triggering PhotoSwipe navigation
     */
    function updateCaption(el, pswp) {
        const slide = pswp.currSlide;
        let captionHTML = '';

        if (slide?.data?.element) {
            const caption = slide.data.element.getAttribute('data-pswp-caption');
            if (caption) {
                captionHTML = caption;
            }
        }

        el.innerHTML = captionHTML || '';

        if (captionHTML) {
            const links = el.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.stopPropagation();
                });

                ['touchstart', 'touchmove', 'touchend'].forEach(eventType => {
                    link.addEventListener(eventType, (e) => {
                        e.stopPropagation();
                    });
                });

                link.addEventListener('focus', (e) => {
                    e.stopPropagation();
                });
            });
        }
    }

    /**
     * Toggle between initial and secondary zoom levels
     */
    function toggleZoom(pswp) {
        const slide = pswp.currSlide;
        if (!slide) return;

        const initial = slide.zoomLevels.initial;
        const secondary = slide.zoomLevels.secondary;
        const current = slide.currZoomLevel;

        const isAtInitial = Math.abs(current - initial) < 0.01;
        const target = isAtInitial ? secondary : initial;

        slide.zoomTo(target, {
            x: slide.bounds.center.x,
            y: slide.bounds.center.y
        }, 333);
    }

    /**
     * Detect and set natural image dimensions for PhotoSwipe
     * Handles edge case where image.complete is true but dimensions aren't available yet
     */
    function detectImageDimensions() {
        const links = document.querySelectorAll('a[data-pswp-slide][data-pswp-width="auto"]');

        links.forEach(link => {
            const img = link.querySelector('img');
            if (!img) return;

            const setDimensions = () => {
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                    link.setAttribute('data-pswp-width', img.naturalWidth);
                    link.setAttribute('data-pswp-height', img.naturalHeight);
                    return true;
                }
                return false;
            };

            if (img.complete && img.naturalWidth > 0) {
                setDimensions();
            } else {
                img.addEventListener('load', setDimensions, {
                    once: true
                });

                let attempts = 0;
                const maxAttempts = 50;
                const interval = setInterval(() => {
                    attempts++;
                    if (setDimensions() || attempts >= maxAttempts) {
                        clearInterval(interval);
                    }
                }, 100);
            }
        });
    }

    /**
     * Watch for theme changes and update PhotoSwipe
     * Supports data-theme attribute, CSS classes, and prefers-color-scheme
     */
    function observeThemeChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes') {
                    const attrName = mutation.attributeName;
                    if (attrName === 'data-theme' || attrName === 'class') {
                        handleThemeChange();
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme', 'class']
        });

        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        darkModeQuery.addEventListener('change', handleThemeChange);

        handleThemeChange();
    }

    /**
     * Force repaint when theme changes
     * PhotoSwipe inherits theme colors via CSS variables
     */
    function handleThemeChange() {
        if (!window.photoSwipeLightbox?.pswp) return;

        const pswp = window.photoSwipeLightbox.pswp;

        if (pswp.element) {
            pswp.element.style.display = 'none';
            void pswp.element.offsetHeight;
            pswp.element.style.display = '';
        }
    }

    /**
     * Public API for external control
     */
    window.PhotoSwipeAPI = {
        open: (galleryId, index = 0) => {
            const gallery = document.querySelector(`[data-pswp-gallery="${galleryId}"]`);
            if (!gallery || !window.photoSwipeLightbox) return;

            const slides = Array.from(gallery.querySelectorAll('a[data-pswp-slide]'));
            const slide = slides[index];

            if (slide) {
                slide.click();
            }
        },

        refresh: () => {
            if (window.photoSwipeLightbox) {
                window.photoSwipeLightbox.destroy();
                init();
            }
        },

        getTheme: () => {
            const html = document.documentElement;
            const body = document.body;

            const dataTheme = html.getAttribute('data-theme') || body.getAttribute('data-theme');
            if (dataTheme) return dataTheme;

            if (html.classList.contains('theme-dark') ||
                html.classList.contains('is-dark-theme') ||
                body.classList.contains('theme-dark') ||
                body.classList.contains('is-dark-theme')) {
                return 'dark';
            }

            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }

            return 'light';
        },

        isSingleImage: (galleryId) => {
            const gallery = document.querySelector(`[data-pswp-gallery="${galleryId}"]`);
            if (!gallery) return false;

            const slides = gallery.querySelectorAll('a[data-pswp-slide]');
            return slides.length === 1;
        },
    };
})();
