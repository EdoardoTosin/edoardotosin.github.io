---
---

/* 
Copied from https://github.com/derekkedziora/jekyll-demo/blob/master/scripts/mode-switcher.js
https://github.com/derekkedziora/jekyll-demo
Creative Commons Attribution 4.0 International License
*/

(() => {
  const systemInitiatedDark = window.matchMedia("(prefers-color-scheme: dark)");
  let theme = localStorage.getItem("theme");

  const themeConfig = {
    icons: {
      light: "{{ '/assets/img/icons/sun-16.svg' | absolute_url }}",
      dark: "{{ '/assets/img/icons/moon-16.svg' | absolute_url }}",
    },
    errorImages: {
      light: "{{ '/assets/img/404_light.gif' | absolute_url }}",
      dark: "{{ '/assets/img/404.gif' | absolute_url }}",
    },
  };

  const ThemeManager = {
    setTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      this.updateAssets(theme);
    },

    updateAssets(theme) {
      this.changeImgSrc("theme-toggle-img", themeConfig.icons[theme]);
      this.changeImgSrc("theme-toggle-img--mobile", themeConfig.icons[theme]);
      this.changeImgSrc("error-404", themeConfig.errorImages[theme]);
    },

    changeImgSrc(id, src) {
      const element = document.getElementById(id);
      if (element) {
        element.setAttribute("src", src);
      }
    },

    determineTheme() {
      const userTheme = localStorage.getItem("theme");
      if (userTheme) {
        this.setTheme(userTheme);
      } else {
        this.setTheme(systemInitiatedDark.matches ? "dark" : "light");
      }
    },

    toggleTheme() {
      const currentTheme =
        localStorage.getItem("theme") === "dark" ? "light" : "dark";
      this.setTheme(currentTheme);
    },
  };

  function iconToggle() {
    let theme = localStorage.getItem("theme");
    if (theme === "dark") {
      ThemeManager.setTheme("dark");
    } else if (theme === "light") {
      ThemeManager.setTheme("light");
    } else {
      ThemeManager.setTheme(systemInitiatedDark.matches ? "dark" : "light");
    }
  }

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  document.addEventListener("DOMContentLoaded", () =>
    ThemeManager.determineTheme()
  );

  systemInitiatedDark.addEventListener(
    "change",
    debounce(() => {
      if (!localStorage.getItem("theme")) {
        ThemeManager.setTheme(systemInitiatedDark.matches ? "dark" : "light");
      }
    }, 300)
  );

  window.modeSwitcher = () => ThemeManager.toggleTheme();
  window.iconToggle = iconToggle;
})();
