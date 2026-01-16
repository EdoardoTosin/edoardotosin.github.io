/**
 * Carousel Component
 * Handles carousel navigation, auto-play, and PhotoSwipe integration
 */
(function() {
  'use strict';
  
  // Initialize all carousels on page
  function initializeCarousels() {
    const carousels = document.querySelectorAll('.carousel-wrapper');
    
    carousels.forEach(function(carousel) {
      initializeCarousel(carousel);
    });
  }
  
  function initializeCarousel(carousel) {
    if (!carousel) return;
    
    const track = carousel.querySelector('[data-carousel-track]');
    const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const indicators = Array.from(carousel.querySelectorAll('.carousel-indicator'));
    
    let currentIndex = 0;
    let isTransitioning = false;
    let autoPlayInterval;
    
    // Set image dimensions for PhotoSwipe
    const links = carousel.querySelectorAll('a[data-pswp-width="auto"]');
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
      
      if (img.complete) {
        setDimensions();
      } else {
        img.addEventListener('load', setDimensions, { once: true });
      }
    });
    
    function goToSlide(index, direction) {
      direction = direction || 'next';
      
      if (isTransitioning || index === currentIndex) return;
      if (index < 0 || index >= slides.length) return;
      
      isTransitioning = true;
      
      const currentSlide = slides[currentIndex];
      const nextSlide = slides[index];
      
      // Update active states
      currentSlide.classList.remove('is-active');
      nextSlide.classList.add('is-active');
      
      if (indicators.length > 0) {
        indicators[currentIndex].classList.remove('is-active');
        indicators[currentIndex].setAttribute('aria-selected', 'false');
        indicators[index].classList.add('is-active');
        indicators[index].setAttribute('aria-selected', 'true');
      }
      
      // Smooth transition
      const offset = -index * 100;
      track.style.transform = 'translateX(' + offset + '%)';
      
      currentIndex = index;
      
      setTimeout(function() {
        isTransitioning = false;
      }, 500);
    }
    
    // Navigation controls
    if (prevBtn) {
      prevBtn.addEventListener('click', function() {
        const prevIndex = currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
        goToSlide(prevIndex, 'prev');
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', function() {
        const nextIndex = (currentIndex + 1) % slides.length;
        goToSlide(nextIndex, 'next');
      });
    }
    
    // Indicator controls
    indicators.forEach(function(indicator, index) {
      indicator.addEventListener('click', function() {
        goToSlide(index);
      });
    });
    
    // Keyboard navigation
    carousel.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevBtn && prevBtn.click();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextBtn && nextBtn.click();
      }
    });
    
    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    track.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    track.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          nextBtn && nextBtn.click();
        } else {
          prevBtn && prevBtn.click();
        }
      }
    }
    
    // Auto-play functionality
    const autoPlay = carousel.dataset.autoPlay === 'true';
    const duration = parseInt(carousel.dataset.duration) || 5;
    
    if (autoPlay) {
      function startAutoPlay() {
        autoPlayInterval = setInterval(function() {
          if (document.hidden) return;
          nextBtn && nextBtn.click();
        }, duration * 1000);
      }
      
      function stopAutoPlay() {
        clearInterval(autoPlayInterval);
      }
      
      // Start auto-play
      startAutoPlay();
      
      // Pause on hover/focus
      carousel.addEventListener('mouseenter', stopAutoPlay);
      carousel.addEventListener('mouseleave', startAutoPlay);
      carousel.addEventListener('focusin', stopAutoPlay);
      carousel.addEventListener('focusout', startAutoPlay);
      
      // Pause when page hidden
      document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
          stopAutoPlay();
        } else {
          startAutoPlay();
        }
      });
    }
    
    // Stop event propagation on caption clicks
    const captions = carousel.querySelectorAll('.carousel-caption');
    captions.forEach(function(caption) {
      caption.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCarousels);
  } else {
    initializeCarousels();
  }
})();
