/*
 * Jellyfin Slideshow by M0RPH3US v3.0.6
 * Modified by CodeDevMLH v1.1.0.0
 * 
 * New features:
 * - optional Trailer background video support
 * - option to make video backdrops full width
 * - SponsorBlock support to skip intro/outro segments
 * - option to always show arrows
 * - option to disable/enable keyboard controls
 * - option to show/hide trailer button if trailer as backdrop is disabled (opens in a modal)
 * - option to wait for trailer to end before loading next slide
 * - option to set a maximum for the pagination dots (will turn into a counter style if exceeded)
 * - option to disable loading screen
 * - option to put collection (boxsets) IDs into the slideshow to display their items
 */

//Core Module Configuration
const CONFIG = {
  IMAGE_SVG: {
    freshTomato:
      '<svg id="svg3390" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 138.75 141.25" width="18" version="1.1" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/"><metadata id="metadata3396"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title/></cc:Work></rdf:RDF></metadata><g id="layer1" fill="#f93208"><path id="path3412" d="m20.154 40.829c-28.149 27.622-13.657 61.011-5.734 71.931 35.254 41.954 92.792 25.339 111.89-5.9071 4.7608-8.2027 22.554-53.467-23.976-78.009z"/><path id="path3471" d="m39.613 39.265 4.7778-8.8607 28.406-5.0384 11.119 9.2082z"/></g><g id="layer2"><path id="path3437" d="m39.436 8.5696 8.9682-5.2826 6.7569 15.479c3.7925-6.3226 13.79-16.316 24.939-4.6684-4.7281 1.2636-7.5161 3.8553-7.7397 8.4768 15.145-4.1697 31.343 3.2127 33.539 9.0911-10.951-4.314-27.695 10.377-41.771 2.334 0.009 15.045-12.617 16.636-19.902 17.076 2.077-4.996 5.591-9.994 1.474-14.987-7.618 8.171-13.874 10.668-33.17 4.668 4.876-1.679 14.843-11.39 24.448-11.425-6.775-2.467-12.29-2.087-17.814-1.475 2.917-3.961 12.149-15.197 28.625-8.476z" fill="#02902e"/></g></svg>',
    rottenTomato:
      '<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" viewBox="0 0 145 140" width="20" height="18"><path fill="#0fc755" d="M47.4 35.342c-13.607-7.935-12.32-25.203 2.097-31.88 26.124-6.531 29.117 13.78 22.652 30.412-6.542 24.11 18.095 23.662 19.925 10.067 3.605-18.412 19.394-26.695 31.67-16.359 12.598 12.135 7.074 36.581-17.827 34.187-16.03-1.545-19.552 19.585.839 21.183 32.228 1.915 42.49 22.167 31.04 35.865-15.993 15.15-37.691-4.439-45.512-19.505-6.8-9.307-17.321.11-13.423 6.502 12.983 19.465 2.923 31.229-10.906 30.62-13.37-.85-20.96-9.06-13.214-29.15 3.897-12.481-8.595-15.386-16.57-5.45-11.707 19.61-28.865 13.68-33.976 4.19-3.243-7.621-2.921-25.846 24.119-23.696 16.688 4.137 11.776-12.561-.63-13.633-9.245-.443-30.501-7.304-22.86-24.54 7.34-11.056 24.958-11.768 33.348 6.293 3.037 4.232 8.361 11.042 18.037 5.033 3.51-5.197 1.21-13.9-8.809-20.135z"/></svg>',
  },
  shuffleInterval: 7000,
  retryInterval: 500,
  minSwipeDistance: 50,
  loadingCheckInterval: 100,
  maxPlotLength: 360,
  maxMovies: 15,
  maxTvShows: 15,
  maxItems: 500,
  preloadCount: 3,
  fadeTransitionDuration: 500,
  maxPaginationDots: 15,
  slideAnimationEnabled: true,
  enableVideoBackdrop: true,
  useSponsorBlock: true,
  waitForTrailerToEnd: true,
  startMuted: true,
  fullWidthVideo: true,
  enableMobileVideo: false,
  showTrailerButton: true,
  enableKeyboardControls: true,
  alwaysShowArrows: false,
  enableCustomMediaIds: true,
  enableSeasonalContent: false,
  customMediaIds: "",
  enableLoadingScreen: true,
};

// State management
const STATE = {
  jellyfinData: {
    userId: null,
    appName: null,
    appVersion: null,
    deviceName: null,
    deviceId: null,
    accessToken: null,
    serverAddress: null,
  },
  slideshow: {
    hasInitialized: false,
    isTransitioning: false,
    isPaused: false,
    currentSlideIndex: 0,
    focusedSlide: null,
    containerFocused: false,
    slideInterval: null,
    itemIds: [],
    loadedItems: {},
    createdSlides: {},
    totalItems: 0,
    isLoading: false,
    videoPlayers: {},
    sponsorBlockInterval: null,
    isMuted: CONFIG.startMuted,
  },
};

// Request throttling system
const requestQueue = [];
let isProcessingQueue = false;

/**
 * Process the next request in the queue with throttling
 */
const processNextRequest = () => {
  if (requestQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }

  isProcessingQueue = true;
  const { url, callback } = requestQueue.shift();

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response;
      }
      throw new Error(`Failed to fetch: ${response.status}`);
    })
    .then(callback)
    .catch((error) => {
      console.error("Error in throttled request:", error);
    })
    .finally(() => {
      setTimeout(processNextRequest, 100);
    });
};

/**
 * Add a request to the throttled queue
 * @param {string} url - URL to fetch
 * @param {Function} callback - Callback to run on successful fetch
 */
const addThrottledRequest = (url, callback) => {
  requestQueue.push({ url, callback });
  if (!isProcessingQueue) {
    processNextRequest();
  }
};

/**
 * Checks if the user is currently logged in
 * @returns {boolean} True if logged in, false otherwise
 */

const isUserLoggedIn = () => {
  try {
    return (
      window.ApiClient &&
      window.ApiClient._currentUser &&
      window.ApiClient._currentUser.Id &&
      window.ApiClient._serverInfo &&
      window.ApiClient._serverInfo.AccessToken
    );
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
};

/**
 * Initializes Jellyfin data from ApiClient
 * @param {Function} callback - Function to call once data is initialized
 */
const initJellyfinData = (callback) => {
  if (!window.ApiClient) {
    console.warn("⏳ window.ApiClient is not available yet. Retrying...");
    setTimeout(() => initJellyfinData(callback), CONFIG.retryInterval);
    return;
  }

  try {
    const apiClient = window.ApiClient;
    STATE.jellyfinData = {
      userId: apiClient.getCurrentUserId() || "Not Found",
      appName: apiClient._appName || "Not Found",
      appVersion: apiClient._appVersion || "Not Found",
      deviceName: apiClient._deviceName || "Not Found",
      deviceId: apiClient._deviceId || "Not Found",
      accessToken: apiClient._serverInfo.AccessToken || "Not Found",
      serverId: apiClient._serverInfo.Id || "Not Found",
      serverAddress: apiClient._serverAddress || "Not Found",
    };
    if (callback && typeof callback === "function") {
      callback();
    }
  } catch (error) {
    console.error("Error initializing Jellyfin data:", error);
    setTimeout(() => initJellyfinData(callback), CONFIG.retryInterval);
  }
};

/**
 * Initializes localization by loading translation chunks
 */
const initLocalization = async () => {
  try {
    const locale = await LocalizationUtils.getCurrentLocale();
    await LocalizationUtils.loadTranslations(locale);
    console.log("✅ Localization initialized");
  } catch (error) {
    console.error("Error initializing localization:", error);
  }
};

/**
 * Creates and displays loading screen
 */

const initLoadingScreen = () => {
  const currentPath = window.location.href.toLowerCase().replace(window.location.origin, "");
  const isHomePage =
    currentPath.includes("/web/#/home.html") ||
    currentPath.includes("/web/#/home") ||
    currentPath.includes("/web/index.html#/home.html") ||
    currentPath === "/web/index.html#/home" ||
    currentPath.endsWith("/web/");

  if (!isHomePage) return;

  // Check LocalStorage for cached preference to avoid flash
  const cachedSetting = localStorage.getItem('mediaBarEnhanced_enableLoadingScreen');
  if (cachedSetting === 'false') {
    return;
  }

  const loadingDiv = document.createElement("div");
  loadingDiv.className = "bar-loading";
  loadingDiv.id = "page-loader";
  loadingDiv.innerHTML = `
    <div class="loader-content">
      <h1>
        <div class="splashLogo"></div>
      </h1>
      <div class="progress-container">
        <div class="progress-bar" id="progress-bar"></div>
        <div class="progress-gap" id="progress-gap"></div>
        <div class="unfilled-bar" id="unfilled-bar"></div>
      </div>
    </div>
  `;
  document.body.appendChild(loadingDiv);

  requestAnimationFrame(() => {
    document.querySelector(".bar-loading h1 div").style.opacity = "1";
  });

  const progressBar = document.getElementById("progress-bar");
  const unfilledBar = document.getElementById("unfilled-bar");

  let progress = 0;
  let lastIncrement = 5;

  const progressInterval = setInterval(() => {
    if (progress < 95) {
      lastIncrement = Math.max(0.5, lastIncrement * 0.98);
      const randomFactor = 0.8 + Math.random() * 0.4;
      const increment = lastIncrement * randomFactor;
      progress += increment;
      progress = Math.min(progress, 95);

      progressBar.style.width = `${progress}%`;
      unfilledBar.style.width = `${100 - progress}%`;
    }
  }, 150);

  const checkInterval = setInterval(() => {
    const loginFormLoaded = document.querySelector(".manualLoginForm");
    const homePageLoaded =
      document.querySelector(".homeSectionsContainer") &&
      document.querySelector("#slides-container");

    if (loginFormLoaded || homePageLoaded) {
      clearInterval(progressInterval);
      clearInterval(checkInterval);

      progressBar.style.transition = "width 300ms ease-in-out";
      progressBar.style.width = "100%";
      unfilledBar.style.width = "0%";

      progressBar.addEventListener('transitionend', () => {
        requestAnimationFrame(() => {
          const loader = document.querySelector(".bar-loading");
          if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
              loader.remove();
            }, 300);
          }
        });
      })
    }
  }, CONFIG.loadingCheckInterval);
};

/**
 * Resets the slideshow state completely
 */
const resetSlideshowState = () => {
  console.log("🔄 Resetting slideshow state...");

  if (STATE.slideshow.slideInterval) {
    STATE.slideshow.slideInterval.stop();
  }

  // Destroy all video players
  if (STATE.slideshow.videoPlayers) {
    Object.values(STATE.slideshow.videoPlayers).forEach(player => {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    });
    STATE.slideshow.videoPlayers = {};
  }

  if (STATE.slideshow.sponsorBlockInterval) {
    clearInterval(STATE.slideshow.sponsorBlockInterval);
    STATE.slideshow.sponsorBlockInterval = null;
  }

  const container = document.getElementById("slides-container");
  if (container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  STATE.slideshow.hasInitialized = false;
  STATE.slideshow.isTransitioning = false;
  STATE.slideshow.isPaused = false;
  STATE.slideshow.currentSlideIndex = 0;
  STATE.slideshow.focusedSlide = null;
  STATE.slideshow.containerFocused = false;
  STATE.slideshow.slideInterval = null;
  STATE.slideshow.itemIds = [];
  STATE.slideshow.loadedItems = {};
  STATE.slideshow.createdSlides = {};
  STATE.slideshow.totalItems = 0;
  STATE.slideshow.isLoading = false;
};

/**
 * Watches for login status changes
 */
const startLoginStatusWatcher = () => {
  let wasLoggedIn = false;

  setInterval(() => {
    const isLoggedIn = isUserLoggedIn();

    if (isLoggedIn !== wasLoggedIn) {
      if (isLoggedIn) {
        console.log("👤 User logged in. Initializing slideshow...");
        if (!STATE.slideshow.hasInitialized) {
          waitForApiClientAndInitialize();
        } else {
          console.log("🔄 Slideshow already initialized, skipping");
        }
      } else {
        console.log("👋 User logged out. Stopping slideshow...");
        resetSlideshowState();
      }
      wasLoggedIn = isLoggedIn;
    }
  }, 2000);
};

/**
 * Wait for ApiClient to initialize before starting the slideshow
 */
const waitForApiClientAndInitialize = () => {
  if (window.slideshowCheckInterval) {
    clearInterval(window.slideshowCheckInterval);
  }

  window.slideshowCheckInterval = setInterval(() => {
    if (!window.ApiClient) {
      console.log("⏳ ApiClient not available yet. Waiting...");
      return;
    }

    if (
      window.ApiClient._currentUser &&
      window.ApiClient._currentUser.Id &&
      window.ApiClient._serverInfo &&
      window.ApiClient._serverInfo.AccessToken
    ) {
      console.log(
        "🔓 User is fully logged in. Starting slideshow initialization..."
      );
      clearInterval(window.slideshowCheckInterval);

      if (!STATE.slideshow.hasInitialized) {
        initJellyfinData(async () => {
          console.log("✅ Jellyfin API client initialized successfully");
          await initLocalization();
          await fetchPluginConfig();
          slidesInit();
        });
      } else {
        console.log("🔄 Slideshow already initialized, skipping");
      }
    } else {
      console.log(
        "🔒 Authentication incomplete. Waiting for complete login..."
      );
    }
  }, CONFIG.retryInterval);
};

const fetchPluginConfig = async () => {
  try {
    const response = await fetch('/MediaBarEnhanced/Config');
    if (response.ok) {
      const pluginConfig = await response.json();
      if (pluginConfig) {
        for (const key in pluginConfig) {
          const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
          if (CONFIG.hasOwnProperty(camelKey)) {
            CONFIG[camelKey] = pluginConfig[key];
          }
        }
        STATE.slideshow.isMuted = CONFIG.startMuted;

        if (!CONFIG.enableLoadingScreen) {
          const loader = document.querySelector(".bar-loading");
          if (loader) {
            loader.remove();
          }
        }

        // Sync to LocalStorage for next load
        localStorage.setItem('mediaBarEnhanced_enableLoadingScreen', CONFIG.enableLoadingScreen);

        console.log("✅ MediaBarEnhanced config loaded", CONFIG);
      }
    }
  } catch (e) {
    console.error("Failed to load MediaBarEnhanced config", e);
  }
};

waitForApiClientAndInitialize();

/**
 * Utility functions for slide creation and management
 */
const SlideUtils = {
  /**
   * Shuffles array elements randomly
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  /**
   * Truncates text to specified length and adds ellipsis
   * @param {HTMLElement} element - Element containing text to truncate
   * @param {number} maxLength - Maximum length before truncation
   */
  truncateText(element, maxLength) {
    if (!element) return;

    const text = element.innerText || element.textContent;
    if (text && text.length > maxLength) {
      element.innerText = text.substring(0, maxLength) + "...";
    }
  },

  /**
   * Creates a separator icon element
   * @returns {HTMLElement} Separator element
   */
  createSeparator() {
    const separator = document.createElement("i");
    separator.className = "material-icons fiber_manual_record separator-icon"; //material-icons radio_button_off
    return separator;
  },

  /**
   * Creates a DOM element with attributes and properties
   * @param {string} tag - Element tag name
   * @param {Object} attributes - Element attributes
   * @param {string|HTMLElement} [content] - Element content
   * @returns {HTMLElement} Created element
   */
  createElement(tag, attributes = {}, content = null) {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "style" && typeof value === "object") {
        Object.entries(value).forEach(([prop, val]) => {
          element.style[prop] = val;
        });
      } else if (key === "className") {
        element.className = value;
      } else if (key === "innerHTML") {
        element.innerHTML = value;
      } else if (key === "onclick" && typeof value === "function") {
        element.addEventListener("click", value);
      } else {
        element.setAttribute(key, value);
      }
    });

    if (content) {
      if (typeof content === "string") {
        element.textContent = content;
      } else {
        element.appendChild(content);
      }
    }

    return element;
  },

  /**
   * Find or create the slides container
   * @returns {HTMLElement} Slides container element
   */
  getOrCreateSlidesContainer() {
    let container = document.getElementById("slides-container");
    if (!container) {
      container = this.createElement("div", { id: "slides-container" });
      document.body.appendChild(container);
    }
    return container;
  },

  /**
   * Formats genres into a readable string
   * @param {Array} genresArray - Array of genre strings
   * @returns {string} Formatted genres string
   */
  parseGenres(genresArray) {
    if (Array.isArray(genresArray) && genresArray.length > 0) {
      return genresArray.slice(0, 3).join(this.createSeparator().outerHTML);
    }
    return "No Genre Available";
  },

  /**
   * Creates a loading indicator
   * @returns {HTMLElement} Loading indicator element
   */
  createLoadingIndicator() {
    const loadingIndicator = this.createElement("div", {
      className: "slide-loading-indicator",
      innerHTML: `
        <div class="spinner">
          <div class="bounce1"></div>
          <div class="bounce2"></div>
          <div class="bounce3"></div>
        </div>
      `,
    });
    return loadingIndicator;
  },

  /**
   * Loads the YouTube IFrame API if not already loaded
   * @returns {Promise<void>}
   */
  loadYouTubeIframeAPI() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      const previousOnYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousOnYouTubeIframeAPIReady) previousOnYouTubeIframeAPIReady();
        resolve();
      };
    });
  },

  /**
   * Opens a modal video player
   * @param {string} url - Video URL
   */
  openVideoModal(url) {
    const existingModal = document.getElementById('video-modal-overlay');
    if (existingModal) existingModal.remove();

    if (STATE.slideshow.slideInterval) {
      STATE.slideshow.slideInterval.stop();
    }
    STATE.slideshow.isPaused = true;

    const overlay = this.createElement('div', {
      id: 'video-modal-overlay'
    });

    const closeModal = () => {
      overlay.remove();
      STATE.slideshow.isPaused = false;
      if (STATE.slideshow.slideInterval) {
        STATE.slideshow.slideInterval.start();
      }
    };

    const closeButton = this.createElement('button', {
      className: 'modal-close-button',
      innerHTML: '<i class="material-icons">close</i>',
      onclick: closeModal
    });

    const contentContainer = this.createElement('div', {
      className: 'video-modal-content'
    });

    let videoId = null;
    let isYoutube = false;

    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        isYoutube = true;
        videoId = urlObj.searchParams.get('v');
        if (!videoId && urlObj.hostname.includes('youtu.be')) {
          videoId = urlObj.pathname.substring(1);
        }
      }
    } catch (e) {
      console.warn("Invalid URL for modal:", url);
    }

    if (isYoutube && videoId) {
      const playerDiv = this.createElement('div', { id: 'modal-yt-player' });
      contentContainer.appendChild(playerDiv);
      overlay.append(closeButton, contentContainer);
      document.body.appendChild(overlay);

      this.loadYouTubeIframeAPI().then(() => {
        new YT.Player('modal-yt-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            iv_load_policy: 3,
            rel: 0
          }
        });
      });
    } else {
      const video = this.createElement('video', {
        src: url,
        controls: true,
        autoplay: true,
        className: 'video-modal-player'
      });
      contentContainer.appendChild(video);
      overlay.append(closeButton, contentContainer);
      document.body.appendChild(overlay);
    }

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });
  },
};

/**
 * Localization utilities for fetching and using Jellyfin translations
 */
const LocalizationUtils = {
  translations: {},
  locale: null,
  isLoading: {},
  cachedLocale: null,
  chunkUrlCache: {},

  /**
   * Gets the current locale from user preference, server config, or HTML tag
   * @returns {Promise<string>} Locale code (e.g., "de", "en-us")
   */
  async getCurrentLocale() {
    if (this.cachedLocale) {
      return this.cachedLocale;
    }

    let locale = null;

    try {
      if (window.ApiClient && typeof window.ApiClient.deviceId === 'function') {
        const deviceId = window.ApiClient.deviceId();
        if (deviceId) {
          const deviceKey = `${deviceId}-language`;
          locale = localStorage.getItem(deviceKey).toLowerCase();
        }
      }
      if (!locale) {
        locale = localStorage.getItem("language").toLowerCase();
      }
    } catch (e) {
      console.warn("Could not access localStorage for language:", e);
    }

    if (!locale) {
      const langAttr = document.documentElement.getAttribute("lang");
      if (langAttr) {
        locale = langAttr.toLowerCase();
      }
    }

    if (window.ApiClient && STATE.jellyfinData?.accessToken) {
      try {
        const userId = window.ApiClient.getCurrentUserId();
        if (userId) {
          const userUrl = window.ApiClient.getUrl(`Users/${userId}`);
          const userResponse = await fetch(userUrl, {
            headers: ApiUtils.getAuthHeaders(),
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            if (userData.Configuration?.AudioLanguagePreference) {
              locale = userData.Configuration.AudioLanguagePreference.toLowerCase();
            }
          }
        }
      } catch (error) {
        console.warn("Could not fetch user audio language preference:", error);
      }
    }

    if (!locale && window.ApiClient && STATE.jellyfinData?.accessToken) {
      try {
        const configUrl = window.ApiClient.getUrl('System/Configuration');
        const configResponse = await fetch(configUrl, {
          headers: ApiUtils.getAuthHeaders(),
        });
        if (configResponse.ok) {
          const configData = await configResponse.json();
          if (configData.PreferredMetadataLanguage) {
            locale = configData.PreferredMetadataLanguage.toLowerCase();
            if (configData.MetadataCountryCode) {
              locale = `${locale}-${configData.MetadataCountryCode.toLowerCase()}`;
            }
          }
        }
      } catch (error) {
        console.warn("Could not fetch server metadata language preference:", error);
      }
    }

    if (!locale) {
      const navLang = navigator.language || navigator.userLanguage;
      locale = navLang ? navLang.toLowerCase() : "en-us";
    }

    // Convert 3-letter country codes to 2-letter if necessary
    if (locale.length === 3) {
      const countriesData = await window.ApiClient.getCountries();
      const countryData = Object.values(countriesData).find(countryData => countryData.ThreeLetterISORegionName === locale.toUpperCase());
      if (countryData) {
        locale = countryData.TwoLetterISORegionName.toLowerCase();
      }
    }

    this.cachedLocale = locale;
    return locale;
  },

  /**
   * Finds the translation chunk URL from performance entries
   * @param {string} locale - Locale code
   * @returns {string|null} URL to translation chunk or null
   */
  findTranslationChunkUrl(locale) {
    const localePrefix = locale.split('-')[0];

    if (this.chunkUrlCache[localePrefix]) {
      return this.chunkUrlCache[localePrefix];
    }

    if (window.performance && window.performance.getEntriesByType) {
      try {
        const resources = window.performance.getEntriesByType('resource');
        for (const resource of resources) {
          const url = resource.name || resource.url;
          if (url && url.includes(`${localePrefix}-json`) && url.includes('.chunk.js')) {
            this.chunkUrlCache[localePrefix] = url;
            return url;
          }
        }
      } catch (e) {
        console.warn("Error checking performance entries:", e);
      }
    }

    this.chunkUrlCache[localePrefix] = null;
    return null;
  },

  /**
   * Fetches and loads translations from the chunk JSON
   * @param {string} locale - Locale code
   * @returns {Promise<void>}
   */
  async loadTranslations(locale) {
    if (this.translations[locale]) return;
    if (this.isLoading[locale]) {
      await this.isLoading[locale];
      return;
    }

    const loadPromise = (async () => {
      try {
        const chunkUrl = this.findTranslationChunkUrl(locale);
        if (!chunkUrl) {
          return;
        }

        const response = await fetch(chunkUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch translations: ${response.statusText}`);
        }

        const chunkText = await response.text();

        let jsonMatch = chunkText.match(/JSON\.parse\(['"](.*?)['"]\)/);
        if (jsonMatch) {
          let jsonString = jsonMatch[1]
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\\\/g, '\\')
            .replace(/\\'/g, "'");
          try {
            this.translations[locale] = JSON.parse(jsonString);
            return;
          } catch (e) {
            // Try direct extraction
          }
        }

        const jsonStart = chunkText.indexOf('{');
        const jsonEnd = chunkText.lastIndexOf('}') + 1;
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          const jsonString = chunkText.substring(jsonStart, jsonEnd);
          try {
            this.translations[locale] = JSON.parse(jsonString);
          } catch (e) {
            console.error("Failed to parse JSON from chunk:", e);
          }
        }
      } catch (error) {
        console.error("Error loading translations:", error);
      } finally {
        delete this.isLoading[locale];
      }
    })();

    this.isLoading[locale] = loadPromise;
    await loadPromise;
  },

  /**
   * Gets a localized string (synchronous - translations must be loaded first)
   * @param {string} key - Localization key (e.g., "EndsAtValue", "Play")
   * @param {string} fallback - Fallback English string
   * @param {...any} args - Optional arguments for placeholders (e.g., {0}, {1})
   * @returns {string} Localized string or fallback
   */
  getLocalizedString(key, fallback, ...args) {
    const locale = this.cachedLocale || 'en-us';
    let translated = this.translations[locale]?.[key] || fallback;

    if (args.length > 0) {
      for (let i = 0; i < args.length; i++) {
        translated = translated.replace(new RegExp(`\\{${i}\\}`, 'g'), args[i]);
      }
    }

    return translated;
  }
};

/**
 * API utilities for fetching data from Jellyfin server
 */
const ApiUtils = {
  /**
   * Fetches details for a specific item by ID
   * @param {string} itemId - Item ID
   * @returns {Promise<Object>} Item details
   */
  async fetchItemDetails(itemId) {
    try {
      if (STATE.slideshow.loadedItems[itemId]) {
        return STATE.slideshow.loadedItems[itemId];
      }

      const response = await fetch(
        `${STATE.jellyfinData.serverAddress}/Items/${itemId}`,
        // `${STATE.jellyfinData.serverAddress}/Users/${STATE.jellyfinData.userId}/Items/${itemId}?Fields=Overview,RemoteTrailers,Genres,CommunityRating,CriticRating,OfficialRating,PremiereDate,RunTimeTicks,ProductionYear,MediaSources`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch item details: ${response.statusText}`);
      }

      const itemData = await response.json();

      STATE.slideshow.loadedItems[itemId] = itemData;

      return itemData;
    } catch (error) {
      console.error(`Error fetching details for item ${itemId}:`, error);
      return null;
    }
  },

  /**
   * Fetch item IDs from the list file
   * @returns {Promise<Array>} Array of item IDs
   */
  // MARK: LIST FILE
  async fetchItemIdsFromList() {
    try {
      const listFileName = `${STATE.jellyfinData.serverAddress}/web/avatars/list.txt?userId=${STATE.jellyfinData.userId}`;
      const response = await fetch(listFileName);

      if (!response.ok) {
        console.warn("list.txt not found or inaccessible. Using random items.");
        return [];
      }

      const text = await response.text();
      return text
        .split("\n")
        .map((id) => id.trim())
        .filter((id) => id)
        .slice(1);
    } catch (error) {
      console.error("Error fetching list.txt:", error);
      return [];
    }
  },

  /**
   * Fetches random items from the server
   * @returns {Promise<Array>} Array of item objects
   */
  async fetchItemIdsFromServer() {
    try {
      if (
        !STATE.jellyfinData.accessToken ||
        STATE.jellyfinData.accessToken === "Not Found"
      ) {
        console.warn("Access token not available. Delaying API request...");
        return [];
      }

      if (
        !STATE.jellyfinData.serverAddress ||
        STATE.jellyfinData.serverAddress === "Not Found"
      ) {
        console.warn("Server address not available. Delaying API request...");
        return [];
      }

      console.log("Fetching random items from server...");

      const response = await fetch(
        `${STATE.jellyfinData.serverAddress}/Items?IncludeItemTypes=Movie,Series&Recursive=true&hasOverview=true&imageTypes=Logo,Backdrop&sortBy=Random&isPlayed=False&enableUserData=true&Limit=${CONFIG.maxItems}&fields=Id`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        console.error(
          `Failed to fetch items: ${response.status} ${response.statusText}`
        );
        return [];
      }

      const data = await response.json();
      const items = data.Items || [];

      console.log(
        `Successfully fetched ${items.length} random items from server`
      );

      return items.map((item) => item.Id);
    } catch (error) {
      console.error("Error fetching item IDs:", error);
      return [];
    }
  },

  /**
   * Get authentication headers for API requests
   * @returns {Object} Headers object
   */
  getAuthHeaders() {
    return {
      Authorization: `MediaBrowser Client="${STATE.jellyfinData.appName}", Device="${STATE.jellyfinData.deviceName}", DeviceId="${STATE.jellyfinData.deviceId}", Version="${STATE.jellyfinData.appVersion}", Token="${STATE.jellyfinData.accessToken}"`,
    };
  },

  /**
   * Send a command to play an item
   * @param {string} itemId - Item ID to play
   * @returns {Promise<boolean>} Success status
   */
  async playItem(itemId) {
    try {
      const sessionId = await this.getSessionId();
      if (!sessionId) {
        console.error("Session ID not found.");
        return false;
      }

      const playUrl = `${STATE.jellyfinData.serverAddress}/Sessions/${sessionId}/Playing?playCommand=PlayNow&itemIds=${itemId}`;
      const playResponse = await fetch(playUrl, {
        method: "POST",
        headers: this.getAuthHeaders(),
      });

      if (!playResponse.ok) {
        throw new Error(
          `Failed to send play command: ${playResponse.statusText}`
        );
      }

      console.log("Play command sent successfully to session:", sessionId);
      return true;
    } catch (error) {
      console.error("Error sending play command:", error);
      return false;
    }
  },

  /**
   * Gets current session ID
   * @returns {Promise<string|null>} Session ID or null
   */
  async getSessionId() {
    try {
      const response = await fetch(
        `${STATE.jellyfinData.serverAddress
        }/Sessions?deviceId=${encodeURIComponent(STATE.jellyfinData.deviceId)}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch session data: ${response.statusText}`);
      }

      const sessions = await response.json();

      if (!sessions || sessions.length === 0) {
        console.warn(
          "No sessions found for deviceId:",
          STATE.jellyfinData.deviceId
        );
        return null;
      }

      return sessions[0].Id;
    } catch (error) {
      console.error("Error fetching session data:", error);
      return null;
    }
  },

  //Favorites

  async toggleFavorite(itemId, button) {
    try {
      const userId = STATE.jellyfinData.userId;
      const isFavorite = button.classList.contains("favorited");

      const url = `${STATE.jellyfinData.serverAddress}/Users/${userId}/FavoriteItems/${itemId}`;
      const method = isFavorite ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          ...ApiUtils.getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle favorite: ${response.statusText}`);
      }
      button.classList.toggle("favorited", !isFavorite);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  },

  /**
   * Fetches SponsorBlock segments for a YouTube video
   * @param {string} videoId - YouTube Video ID
   * @returns {Promise<Object>} Object containing intro and outro segments
   */
  async fetchSponsorBlockData(videoId) {
    if (!CONFIG.useSponsorBlock) return { intro: null, outro: null };
    try {
      const response = await fetch(`https://sponsor.ajay.app/api/skipSegments?videoID=${videoId}&categories=["intro","outro"]`);
      if (!response.ok) return { intro: null, outro: null };

      const segments = await response.json();
      let intro = null;
      let outro = null;

      segments.forEach(segment => {
        if (segment.category === "intro" && Array.isArray(segment.segment)) {
          intro = segment.segment;
        } else if (segment.category === "outro" && Array.isArray(segment.segment)) {
          outro = segment.segment;
        }
      });

      return { intro, outro };
    } catch (error) {
      console.warn('Error fetching SponsorBlock data:', error);
      return { intro: null, outro: null };
    }
  },

  /**
   * Searches for a Collection or Playlist by name
   * @param {string} name - Name to search for
   * @returns {Promise<string|null>} ID of the first match or null
   */
  async findCollectionOrPlaylistByName(name) {
    try {
      const response = await fetch(
        `${STATE.jellyfinData.serverAddress}/Items?IncludeItemTypes=BoxSet,Playlist&Recursive=true&searchTerm=${encodeURIComponent(name)}&Limit=1&fields=Id&userId=${STATE.jellyfinData.userId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        console.warn(`Failed to search for '${name}'`);
        return null;
      }

      const data = await response.json();
      if (data.Items && data.Items.length > 0) {
        return data.Items[0].Id;
      }
      return null;
    } catch (error) {
      console.error(`Error searching for '${name}':`, error);
      return null;
    }
  },

  /**
   * Fetches items belonging to a collection (BoxSet)
   * @param {string} collectionId - ID of the collection
   * @returns {Promise<Array>} Array of item IDs
   */
  async fetchCollectionItems(collectionId) {
    try {
      const response = await fetch(
        `${STATE.jellyfinData.serverAddress}/Items?ParentId=${collectionId}&Recursive=true&IncludeItemTypes=Movie,Series&fields=Id&userId=${STATE.jellyfinData.userId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        console.warn(`Failed to fetch collection items for ${collectionId}`);
        return [];
      }

      const data = await response.json();
      const items = data.Items || [];
      console.log(`Resolved collection ${collectionId} to ${items.length} items`);
      return items.map(i => i.Id);
    } catch (error) {
      console.error(`Error fetching collection items for ${collectionId}:`, error);
      return [];
    }
  }
};

/**
 * Class for managing slide timing
 */
class SlideTimer {
  /**
   * Creates a new slide timer
   * @param {Function} callback - Function to call on interval
   * @param {number} interval - Interval in milliseconds
   */
  constructor(callback, interval) {
    this.callback = callback;
    this.interval = interval;
    this.timerId = null;
    this.start();
  }

  /**
   * Stops the timer
   * @returns {SlideTimer} This instance for chaining
   */
  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    return this;
  }

  /**
   * Starts the timer
   * @returns {SlideTimer} This instance for chaining
   */
  start() {
    if (!this.timerId) {
      this.timerId = setInterval(this.callback, this.interval);
    }
    return this;
  }

  /**
   * Restarts the timer
   * @returns {SlideTimer} This instance for chaining
   */
  restart() {
    return this.stop().start();
  }
}

/**
 * Observer for handling slideshow visibility based on current page
 */
const VisibilityObserver = {
  updateVisibility() {
    const activeTab = document.querySelector(".emby-tab-button-active");
    const container = document.getElementById("slides-container");

    if (!container) return;

    const isVisible =
      (window.location.hash === "#/home.html" ||
        window.location.hash === "#/home") &&
      activeTab.getAttribute("data-index") === "0";

    container.style.display = isVisible ? "block" : "none";

    if (isVisible) {
      if (STATE.slideshow.slideInterval && !STATE.slideshow.isPaused) {
        STATE.slideshow.slideInterval.start();
      }
    } else {
      if (STATE.slideshow.slideInterval) {
        STATE.slideshow.slideInterval.stop();
      }
      SlideshowManager.stopAllPlayback();
    }
  },

  /**
   * Initializes visibility observer
   */
  init() {
    const observer = new MutationObserver(this.updateVisibility);
    observer.observe(document.body, { childList: true, subtree: true });

    document.body.addEventListener("click", this.updateVisibility);
    window.addEventListener("hashchange", this.updateVisibility);

    this.updateVisibility();
  },
};

/**
 * Slideshow UI creation and management
 */
const SlideCreator = {
  /**
   * Builds a tag-based image URL for cache-friendly image requests
   * @param {Object} item - Item data containing ImageTags
   * @param {string} imageType - Image type (Backdrop, Logo, Primary, etc.)
   * @param {number} [index] - Image index (for Backdrop, Primary, etc.)
   * @param {string} serverAddress - Server address
   * @param {number} [quality] - Image quality (0-100). If tag is available, both tag and quality are used.
   * @returns {string} Image URL with tag parameter (and quality if tag available), or quality-only fallback
   */
  buildImageUrl(item, imageType, index, serverAddress, quality) {
    const itemId = item.Id;
    let tag = null;

    // Handle Backdrop images
    if (imageType === "Backdrop") {
      // Check BackdropImageTags array first
      if (item.BackdropImageTags && Array.isArray(item.BackdropImageTags) && item.BackdropImageTags.length > 0) {
        const backdropIndex = index !== undefined ? index : 0;
        if (backdropIndex < item.BackdropImageTags.length) {
          tag = item.BackdropImageTags[backdropIndex];
        }
      }
      // Fallback to ImageTags.Backdrop if BackdropImageTags not available
      if (!tag && item.ImageTags && item.ImageTags.Backdrop) {
        tag = item.ImageTags.Backdrop;
      }
    } else {
      // For other image types (Logo, Primary, etc.), use ImageTags
      if (item.ImageTags && item.ImageTags[imageType]) {
        tag = item.ImageTags[imageType];
      }
    }

    // Build base URL path
    let baseUrl;
    if (index !== undefined) {
      baseUrl = `${serverAddress}/Items/${itemId}/Images/${imageType}/${index}`;
    } else {
      baseUrl = `${serverAddress}/Items/${itemId}/Images/${imageType}`;
    }

    // Build URL with tag and quality if tag is available, otherwise quality-only fallback
    if (tag) {
      // Use both tag and quality for cacheable, quality-controlled images
      const qualityParam = quality !== undefined ? `&quality=${quality}` : '';
      return `${baseUrl}?tag=${tag}${qualityParam}`;
    } else {
      // Fallback to quality-only URL if no tag is available
      const qualityParam = quality !== undefined ? quality : 90;
      return `${baseUrl}?quality=${qualityParam}`;
    }
  },

  /**
   * Creates a slide element for an item
   * @param {Object} item - Item data
   * @param {string} title - Title type (Movie/TV Show)
   * @returns {HTMLElement} Slide element
   */
  createSlideElement(item, title) {
    if (!item || !item.Id) {
      console.error("Invalid item data:", item);
      return null;
    }

    const itemId = item.Id;
    const serverAddress = STATE.jellyfinData.serverAddress;

    const slide = SlideUtils.createElement("a", {
      className: "slide",
      target: "_top",
      rel: "noreferrer",
      tabIndex: 0,
      "data-item-id": itemId,
    });

    let backdrop;
    let isVideo = false;
    let trailerUrl = null;

    // 1. Check for Remote Trailers (YouTube)
    if (item.RemoteTrailers && item.RemoteTrailers.length > 0) {
      trailerUrl = item.RemoteTrailers[0].Url;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const shouldPlayVideo = CONFIG.enableVideoBackdrop && (!isMobile || CONFIG.enableMobileVideo);

    if (trailerUrl && shouldPlayVideo) {
      let isYoutube = false;
      let videoId = null;

      try {
        const urlObj = new URL(trailerUrl);
        if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
          isYoutube = true;
          videoId = urlObj.searchParams.get('v');
          if (!videoId && urlObj.hostname.includes('youtu.be')) {
            videoId = urlObj.pathname.substring(1);
          }
        }
      } catch (e) {
        console.warn("Invalid trailer URL:", trailerUrl);
      }

      if (isYoutube && videoId) {
        isVideo = true;
        // Create container for YouTube API
        const videoClass = CONFIG.fullWidthVideo ? "video-backdrop-full" : "video-backdrop-default";

        backdrop = SlideUtils.createElement("div", {
          className: `backdrop video-backdrop ${videoClass}`,
          id: `youtube-player-${itemId}`
        });

        // Initialize YouTube Player
        SlideUtils.loadYouTubeIframeAPI().then(() => {
          // Fetch SponsorBlock data
          ApiUtils.fetchSponsorBlockData(videoId).then(segments => {
            const playerVars = {
              autoplay: 0,
              mute: STATE.slideshow.isMuted ? 1 : 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              iv_load_policy: 3,
              rel: 0,
              loop: 0
            };

            // Apply SponsorBlock start/end times
            if (segments.intro) {
              playerVars.start = Math.ceil(segments.intro[1]);
              console.info(`SponsorBlock intro detected for video ${videoId}: skipping to ${playerVars.start}s`);
            }
            if (segments.outro) {
              playerVars.end = Math.floor(segments.outro[0]);
              console.info(`SponsorBlock outro detected for video ${videoId}: ending at ${playerVars.end}s`);
            }

            STATE.slideshow.videoPlayers[itemId] = new YT.Player(`youtube-player-${itemId}`, {
              height: '100%',
              width: '100%',
              videoId: videoId,
              playerVars: playerVars,
              events: {
                'onReady': (event) => {
                  // Store start/end time and videoId for later use
                  event.target._startTime = playerVars.start || 0;
                  event.target._endTime = playerVars.end || undefined;
                  event.target._videoId = videoId;

                  if (STATE.slideshow.isMuted) {
                    event.target.mute();
                  } else {
                    event.target.unMute();
                    event.target.setVolume(40);
                  }

                  // Only play if this is the active slide
                  const slide = document.querySelector(`.slide[data-item-id="${itemId}"]`);
                  if (slide && slide.classList.contains('active')) {
                    event.target.playVideo();
                    // Check if it actually started playing after a short delay (handling autoplay blocks)
                    setTimeout(() => {
                      if (event.target.getPlayerState() !== YT.PlayerState.PLAYING &&
                        event.target.getPlayerState() !== YT.PlayerState.BUFFERING) {
                        console.warn(`Autoplay blocked for ${itemId}, attempting muted fallback`);
                        event.target.mute();
                        event.target.playVideo();
                      }
                    }, 1000);

                    // Pause slideshow timer when video starts if configured
                    if (CONFIG.waitForTrailerToEnd && STATE.slideshow.slideInterval) {
                      STATE.slideshow.slideInterval.stop();
                    }
                  }
                },
                'onStateChange': (event) => {
                  if (event.data === YT.PlayerState.ENDED) {
                    if (CONFIG.waitForTrailerToEnd) {
                      SlideshowManager.nextSlide();
                    } else {
                      event.target.playVideo(); // Loop if not waiting for end if trailer is shorter than slide duration
                    }
                  }
                },
                'onError': () => {
                  // Fallback to next slide on error
                  if (CONFIG.waitForTrailerToEnd) {
                    SlideshowManager.nextSlide();
                  }
                }
              }
            });
          });
        });

        // 2. Check for local video trailers in MediaSources if yt is not available
      } else if (!isYoutube) {
        isVideo = true;

        const videoAttributes = {
          className: "backdrop video-backdrop",
          src: trailerUrl,
          autoplay: false,
          loop: false,
          style: "object-fit: cover; width: 100%; height: 100%; pointer-events: none;"
        };

        if (STATE.slideshow.isMuted) {
          videoAttributes.muted = "";
        }

        backdrop = SlideUtils.createElement("video", videoAttributes);

        if (!STATE.slideshow.isMuted) {
          backdrop.volume = 0.4;
        }

        STATE.slideshow.videoPlayers[itemId] = backdrop;

        backdrop.addEventListener('play', () => {
          if (CONFIG.waitForTrailerToEnd && STATE.slideshow.slideInterval) {
            STATE.slideshow.slideInterval.stop();
          }
        });

        backdrop.addEventListener('ended', () => {
          if (CONFIG.waitForTrailerToEnd) {
            SlideshowManager.nextSlide();
          }
        });

        backdrop.addEventListener('error', () => {
          if (CONFIG.waitForTrailerToEnd) {
            SlideshowManager.nextSlide();
          }
        });
      }
    }

    if (!isVideo) {
      backdrop = SlideUtils.createElement("img", {
        className: "backdrop high-quality",
        src: this.buildImageUrl(item, "Backdrop", 0, serverAddress, 60),
        alt: LocalizationUtils.getLocalizedString('Backdrop', 'Backdrop'),
        loading: "eager",
      });
    }

    const backdropOverlay = SlideUtils.createElement("div", {
      className: "backdrop-overlay",
    });

    const backdropContainer = SlideUtils.createElement("div", {
      className: "backdrop-container" + (isVideo && CONFIG.fullWidthVideo ? " full-width-video" : ""),
    });
    backdropContainer.append(backdrop, backdropOverlay);

    const logo = SlideUtils.createElement("img", {
      className: "logo high-quality",
      src: this.buildImageUrl(item, "Logo", undefined, serverAddress, 40),
      alt: item.Name,
      loading: "eager",
    });

    const logoContainer = SlideUtils.createElement("div", {
      className: "logo-container",
    });
    logoContainer.appendChild(logo);

    const featuredContent = SlideUtils.createElement(
      "div",
      {
        className: "featured-content",
      },
      title
    );

    const plot = item.Overview || "No overview available";
    const plotElement = SlideUtils.createElement(
      "div",
      {
        className: "plot",
      },
      plot
    );
    SlideUtils.truncateText(plotElement, CONFIG.maxPlotLength);

    const plotContainer = SlideUtils.createElement("div", {
      className: "plot-container",
    });
    plotContainer.appendChild(plotElement);

    const gradientOverlay = SlideUtils.createElement("div", {
      className: "gradient-overlay" + (isVideo && CONFIG.fullWidthVideo ? " full-width-video" : ""),
    });

    const infoContainer = SlideUtils.createElement("div", {
      className: "info-container",
    });

    const ratingInfo = this.createRatingInfo(item);
    infoContainer.appendChild(ratingInfo);

    const genreElement = SlideUtils.createElement("div", {
      className: "genre",
      innerHTML: SlideUtils.parseGenres(item.Genres)
    });

    const buttonContainer = SlideUtils.createElement("div", {
      className: "button-container",
    });

    const playButton = this.createPlayButton(itemId);
    const detailButton = this.createDetailButton(itemId);
    const favoriteButton = this.createFavoriteButton(item);

    if (trailerUrl && !isVideo && CONFIG.showTrailerButton) {
      const trailerButton = this.createTrailerButton(trailerUrl);
      buttonContainer.append(detailButton, playButton, trailerButton, favoriteButton);
    } else {
      buttonContainer.append(detailButton, playButton, favoriteButton);
    }

    slide.append(
      logoContainer,
      backdropContainer,
      gradientOverlay,
      featuredContent,
      plotContainer,
      infoContainer,
      genreElement,
      buttonContainer
    );

    return slide;
  },

  /**
   * Creates the rating information element
   * @param {Object} item - Item data
   * @returns {HTMLElement} Rating information element
   */
  createRatingInfo(item) {
    const {
      CommunityRating: communityRating,
      CriticRating: criticRating,
      OfficialRating: ageRating,
      PremiereDate: premiereDate,
      RunTimeTicks: runtime,
      ChildCount: seasonCount,
    } = item;

    const miscInfo = SlideUtils.createElement("div", {
      className: "misc-info",
    });

    // Community Rating Section (IMDb)
    if (typeof communityRating === "number") {
      const container = SlideUtils.createElement("div", {
        className: "star-rating-container",
        innerHTML: `<span class="material-icons community-rating-star star" aria-hidden="true"></span>${communityRating.toFixed(1)}`,
      });
      miscInfo.appendChild(container);
      miscInfo.appendChild(SlideUtils.createSeparator());
    }

    // Critic Rating Section (Rotten Tomatoes)
    if (typeof criticRating === "number") {
      const svgIcon = criticRating < 60 ? CONFIG.IMAGE_SVG.rottenTomato : CONFIG.IMAGE_SVG.freshTomato;
      const container = SlideUtils.createElement("div", {
        className: "critic-rating",
        innerHTML: `${svgIcon}${criticRating.toFixed(0)}%`,
      })
      miscInfo.appendChild(container);
      miscInfo.appendChild(SlideUtils.createSeparator());
    };

    // Year Section
    if (typeof premiereDate === "string" && !isNaN(new Date(premiereDate))) {
      const container = SlideUtils.createElement("div", {
        className: "date",
        innerHTML: new Date(premiereDate).getFullYear(),
      });
      miscInfo.appendChild(container);
      miscInfo.appendChild(SlideUtils.createSeparator());
    };

    // Age Rating Section
    if (typeof ageRating === "string") {
      const container = SlideUtils.createElement("div", {
        className: "age-rating mediaInfoOfficialRating",
        rating: ageRating,
        ariaLabel: `Content rated ${ageRating}`,
        title: `Rating: ${ageRating}`,
        innerHTML: ageRating,
      });
      miscInfo.appendChild(container);
      miscInfo.appendChild(SlideUtils.createSeparator());
    };

    // Runtime / Seasons Section
    if (seasonCount !== undefined || runtime !== undefined) {
      const container = SlideUtils.createElement("div", {
        className: "runTime",
      });
      if (seasonCount) {
        const seasonText = seasonCount <= 1 ? LocalizationUtils.getLocalizedString('Season', 'Season') : LocalizationUtils.getLocalizedString('TypeOptionPluralSeason', 'Seasons');
        container.innerHTML = `${seasonCount} ${seasonText}`;
      } else {
        const milliseconds = runtime / 10000;
        const currentTime = new Date();
        const endTime = new Date(currentTime.getTime() + milliseconds);
        const options = { hour: "2-digit", minute: "2-digit", hour12: false };
        const formattedEndTime = endTime.toLocaleTimeString([], options);
        const endsAtText = LocalizationUtils.getLocalizedString('EndsAtValue', 'Ends at {0}', formattedEndTime);
        container.innerText = endsAtText;
      }
      miscInfo.appendChild(container);
    }

    return miscInfo;
  },

  /**
   * Creates a play button for an item
   * @param {string} itemId - Item ID
   * @returns {HTMLElement} Play button element
   */
  createPlayButton(itemId) {
    const playText = LocalizationUtils.getLocalizedString('Play', 'Play');
    return SlideUtils.createElement("button", {
      className: "detailButton btnPlay play-button",
      innerHTML: `
      <span class="play-text">${playText}</span>
    `,
      tabIndex: "0",
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        ApiUtils.playItem(itemId);
      },
    });
  },

  /**
   * Creates a detail button for an item
   * @param {string} itemId - Item ID
   * @returns {HTMLElement} Detail button element
   */
  createDetailButton(itemId) {
    return SlideUtils.createElement("button", {
      className: "detailButton detail-button",
      tabIndex: "0",
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.Emby && window.Emby.Page) {
          Emby.Page.show(
            `/details?id=${itemId}&serverId=${STATE.jellyfinData.serverId}`
          );
        } else {
          window.location.href = `#/details?id=${itemId}&serverId=${STATE.jellyfinData.serverId}`;
        }
      },
    });
  },

  /**
   * Creates a favorite button for an item
   * @param {string} itemId - Item ID
   * @returns {HTMLElement} Favorite button element
   */

  createFavoriteButton(item) {
    const isFavorite = item.UserData && item.UserData.IsFavorite === true;

    const button = SlideUtils.createElement("button", {
      className: `favorite-button ${isFavorite ? "favorited" : ""}`,
      tabIndex: "0",
      onclick: async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await ApiUtils.toggleFavorite(item.Id, button);
      },
    });

    return button;
  },

  /**
   * Creates a trailer button
   * @param {string} url - Trailer URL
   * @returns {HTMLElement} Trailer button element
   */
  createTrailerButton(url) {
    const trailerText = LocalizationUtils.getLocalizedString('Trailer', 'Trailer');
    return SlideUtils.createElement("button", {
      className: "detailButton trailer-button",
      innerHTML: `<span class="material-icons">movie</span> <span class="trailer-text">${trailerText}</span>`,
      tabIndex: "0",
      onclick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        SlideUtils.openVideoModal(url);
      },
    });
  },


  /**
   * Creates a placeholder slide for loading
   * @param {string} itemId - Item ID to load
   * @returns {HTMLElement} Placeholder slide element
   */
  createLoadingPlaceholder(itemId) {
    const placeholder = SlideUtils.createElement("a", {
      className: "slide placeholder",
      "data-item-id": itemId,
      style: {
        display: "none",
        opacity: "0",
        transition: `opacity ${CONFIG.fadeTransitionDuration}ms ease-in-out`,
      },
    });

    const loadingIndicator = SlideUtils.createLoadingIndicator();
    placeholder.appendChild(loadingIndicator);

    return placeholder;
  },

  /**
   * Creates a slide for an item and adds it to the container
   * @param {string} itemId - Item ID
   * @returns {Promise<HTMLElement>} Created slide element
   */
  async createSlideForItemId(itemId) {
    try {
      if (STATE.slideshow.createdSlides[itemId]) {
        return document.querySelector(`.slide[data-item-id="${itemId}"]`);
      }

      const container = SlideUtils.getOrCreateSlidesContainer();

      const item = await ApiUtils.fetchItemDetails(itemId);

      const slideElement = this.createSlideElement(
        item,
        item.Type === "Movie" ? "Movie" : "TV Show"
      );

      container.appendChild(slideElement);

      STATE.slideshow.createdSlides[itemId] = true;

      return slideElement;
    } catch (error) {
      console.error("Error creating slide for item:", error, itemId);
      return null;
    }
  },
};

/**
 * Manages slideshow functionality
 */
const SlideshowManager = {

  createPaginationDots() {
    let dotsContainer = document.querySelector(".dots-container");
    if (!dotsContainer) {
      dotsContainer = document.createElement("div");
      dotsContainer.className = "dots-container";
      document.getElementById("slides-container").appendChild(dotsContainer);
    }

    const totalItems = STATE.slideshow.totalItems || 0;

    // Switch to counter style if too many items
    if (totalItems > CONFIG.maxPaginationDots) {
      const counter = document.createElement("span");
      counter.className = "slide-counter";
      counter.id = "slide-counter";
      dotsContainer.appendChild(counter);
    } else {
      // Create dots for all items
      for (let i = 0; i < totalItems; i++) {
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.setAttribute("data-index", i);
        dotsContainer.appendChild(dot);
      }
    }

    this.updateDots();
  },

  /**
   * Updates active dot based on current slide
   * Maps current slide to one of the 5 dots
   */
  updateDots() {
    const currentIndex = STATE.slideshow.currentSlideIndex;
    const totalItems = STATE.slideshow.totalItems || 0;

    // Handle Large List Counter
    const counter = document.getElementById("slide-counter");
    if (counter) {
      counter.textContent = `${currentIndex + 1} / ${totalItems}`;
      return;
    }

    // Handle Dots
    const container = SlideUtils.getOrCreateSlidesContainer();
    const dots = container.querySelectorAll(".dot");

    // Fallback if dots exist but totalItems matched counter mode
    if (dots.length === 0) return;

    dots.forEach((dot, index) => {
      if (index === currentIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  },

  /**
   * Updates current slide to the specified index
   * @param {number} index - Slide index to display
   */

  async updateCurrentSlide(index) {
    if (STATE.slideshow.isTransitioning) {
      return;
    }

    STATE.slideshow.isTransitioning = true;

    let previousVisibleSlide;
    try {
      const container = SlideUtils.getOrCreateSlidesContainer();
      const totalItems = STATE.slideshow.totalItems;

      index = Math.max(0, Math.min(index, totalItems - 1));
      const currentItemId = STATE.slideshow.itemIds[index];

      let currentSlide = document.querySelector(
        `.slide[data-item-id="${currentItemId}"]`
      );
      if (!currentSlide) {
        currentSlide = await SlideCreator.createSlideForItemId(currentItemId);
        this.upgradeSlideImageQuality(currentSlide);

        if (!currentSlide) {
          console.error(`Failed to create slide for item ${currentItemId}`);
          STATE.slideshow.isTransitioning = false;
          setTimeout(() => this.nextSlide(), 500);
          return;
        }
      }

      previousVisibleSlide = container.querySelector(".slide.active");

      if (previousVisibleSlide) {
        previousVisibleSlide.classList.remove("active");
      }

      currentSlide.classList.add("active");

      // Manage Video Playback: Stop others, Play current

      // 1. Pause all other YouTube players
      if (STATE.slideshow.videoPlayers) {
        Object.keys(STATE.slideshow.videoPlayers).forEach(id => {
          if (id !== currentItemId) {
            const p = STATE.slideshow.videoPlayers[id];
            if (p && typeof p.pauseVideo === 'function') {
              p.pauseVideo();
            }
          }
        });
      }

      // 2. Pause all other HTML5 videos e.g. local trailers
      document.querySelectorAll('video').forEach(video => {
        if (!video.closest(`.slide[data-item-id="${currentItemId}"]`)) {
          video.pause();
        }
      });

      // 3. Play and Reset current video
      const videoBackdrop = currentSlide.querySelector('.video-backdrop');

      // Update mute button visibility
      const muteButton = document.querySelector('.mute-button');
      if (muteButton) {
        const hasVideo = !!videoBackdrop;
        muteButton.style.display = hasVideo ? 'block' : 'none';
      }

      if (videoBackdrop) {
        if (videoBackdrop.tagName === 'VIDEO') {
          videoBackdrop.currentTime = 0;

          videoBackdrop.muted = STATE.slideshow.isMuted;
          if (!STATE.slideshow.isMuted) {
            videoBackdrop.volume = 0.4;
          }

          videoBackdrop.play().catch(e => {
            // Check if it actually started playing after a short delay (handling autoplay blocks)
            setTimeout(() => {
              if (videoBackdrop.paused) {
                console.warn(`Autoplay blocked for ${itemId}, attempting muted fallback`);
                videoBackdrop.muted = true;
                videoBackdrop.play().catch(err => console.error("Muted fallback failed", err));
              }
            }, 1000);
          });
        } else if (STATE.slideshow.videoPlayers && STATE.slideshow.videoPlayers[currentItemId]) {
          const player = STATE.slideshow.videoPlayers[currentItemId];
          if (player && typeof player.loadVideoById === 'function' && player._videoId) {
            // Use loadVideoById to enforce start and end times
            player.loadVideoById({
              videoId: player._videoId,
              startSeconds: player._startTime || 0,
              endSeconds: player._endTime
            });

            if (STATE.slideshow.isMuted) {
              player.mute();
            } else {
              player.unMute();
              player.setVolume(40);
            }

            // Check if playback successfully started, otherwise fallback to muted
            setTimeout(() => {
              if (player.getPlayerState &&
                player.getPlayerState() !== YT.PlayerState.PLAYING &&
                player.getPlayerState() !== YT.PlayerState.BUFFERING) {
                console.log("YouTube loadVideoById didn't start playback, retrying muted...");
                player.mute();
                player.playVideo();
              }
            }, 1000);
          } else if (player && typeof player.seekTo === 'function') {
            // Fallback if loadVideoById is not available or videoId missing
            const startTime = player._startTime || 0;
            player.seekTo(startTime);
            player.playVideo();
          }
        }
      }

      if (CONFIG.slideAnimationEnabled) {
        const backdrop = currentSlide.querySelector(".backdrop");
        if (backdrop && !backdrop.classList.contains("video-backdrop")) {
          backdrop.classList.add("animate");
        }
        currentSlide.querySelector(".logo").classList.add("animate");
      }

      STATE.slideshow.currentSlideIndex = index;

      if (index === 0 || !previousVisibleSlide) {
        const dotsContainer = container.querySelector(".dots-container");
        if (dotsContainer) {
          dotsContainer.style.opacity = "1";
        }
      }

      setTimeout(() => {
        const allSlides = container.querySelectorAll(".slide");
        allSlides.forEach((slide) => {
          if (slide !== currentSlide) {
            slide.classList.remove("active");
          }
        });
      }, CONFIG.fadeTransitionDuration);

      this.preloadAdjacentSlides(index);
      this.updateDots();

      // Only restart interval if we are NOT waiting for a video to end
      const hasVideo = currentSlide.querySelector('.video-backdrop');
      if (STATE.slideshow.slideInterval && !STATE.slideshow.isPaused) {
        if (CONFIG.waitForTrailerToEnd && hasVideo) {
          STATE.slideshow.slideInterval.stop();
        } else {
          STATE.slideshow.slideInterval.restart();
        }
      }

      this.pruneSlideCache();
    } catch (error) {
      console.error("Error updating current slide:", error);
    } finally {
      setTimeout(() => {
        STATE.slideshow.isTransitioning = false;

        if (previousVisibleSlide && CONFIG.slideAnimationEnabled) {
          const prevBackdrop = previousVisibleSlide.querySelector(".backdrop");
          const prevLogo = previousVisibleSlide.querySelector(".logo");
          if (prevBackdrop) prevBackdrop.classList.remove("animate");
          if (prevLogo) prevLogo.classList.remove("animate");
        }
      }, CONFIG.fadeTransitionDuration);
    }
  },

  /**
   * Upgrades the image quality for all images in a slide
   * @param {HTMLElement} slide - The slide element containing images to upgrade
   */

  upgradeSlideImageQuality(slide) {
    if (!slide) return;

    const images = slide.querySelectorAll("img.low-quality");
    images.forEach((img) => {
      const highQualityUrl = img.getAttribute("data-high-quality");

      // Prevent duplicate requests if already using high quality
      if (highQualityUrl && img.src !== highQualityUrl) {
        addThrottledRequest(highQualityUrl, () => {
          img.src = highQualityUrl;
          img.classList.remove("low-quality");
          img.classList.add("high-quality");
        });
      }
    });
  },

  /**
   * Preloads adjacent slides for smoother transitions
   * @param {number} currentIndex - Current slide index
   */
  async preloadAdjacentSlides(currentIndex) {
    const totalItems = STATE.slideshow.totalItems;
    const preloadCount = CONFIG.preloadCount;

    const nextIndex = (currentIndex + 1) % totalItems;
    const itemId = STATE.slideshow.itemIds[nextIndex];

    await SlideCreator.createSlideForItemId(itemId);

    if (preloadCount > 1) {
      const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
      const prevItemId = STATE.slideshow.itemIds[prevIndex];

      SlideCreator.createSlideForItemId(prevItemId);
    }
  },

  nextSlide() {
    const currentIndex = STATE.slideshow.currentSlideIndex;
    const totalItems = STATE.slideshow.totalItems;

    const nextIndex = (currentIndex + 1) % totalItems;

    this.updateCurrentSlide(nextIndex);
  },

  prevSlide() {
    const currentIndex = STATE.slideshow.currentSlideIndex;
    const totalItems = STATE.slideshow.totalItems;

    const prevIndex = (currentIndex - 1 + totalItems) % totalItems;

    this.updateCurrentSlide(prevIndex);
  },

  /**
   * Prunes the slide cache to prevent memory bloat
   * Removes slides that are outside the viewing range
   */
  pruneSlideCache() {
    const currentIndex = STATE.slideshow.currentSlideIndex;
    const keepRange = 5;

    Object.keys(STATE.slideshow.createdSlides).forEach((itemId) => {
      const index = STATE.slideshow.itemIds.indexOf(itemId);
      if (index === -1) return;

      const distance = Math.abs(index - currentIndex);
      if (distance > keepRange) {
        // Destroy video player if exists
        if (STATE.slideshow.videoPlayers[itemId]) {
          const player = STATE.slideshow.videoPlayers[itemId];
          if (typeof player.destroy === 'function') {
            player.destroy();
          }
          delete STATE.slideshow.videoPlayers[itemId];
        }

        delete STATE.slideshow.loadedItems[itemId];

        const slide = document.querySelector(
          `.slide[data-item-id="${itemId}"]`
        );
        if (slide) slide.remove();

        delete STATE.slideshow.createdSlides[itemId];

        console.log(`Pruned slide ${itemId} at distance ${distance} from view`);
      }
    });
  },

  toggleMute() {
    STATE.slideshow.isMuted = !STATE.slideshow.isMuted;
    const isUnmuting = !STATE.slideshow.isMuted;
    const muteButton = document.querySelector('.mute-button');

    const updateIcon = () => {
      if (!muteButton) return;
      const isMuted = STATE.slideshow.isMuted;
      muteButton.innerHTML = `<i class="material-icons">${isMuted ? 'volume_off' : 'volume_up'}</i>`;
      const label = isMuted ? 'Unmute' : 'Mute';
      muteButton.setAttribute("aria-label", LocalizationUtils.getLocalizedString(label, label));
      muteButton.setAttribute("title", LocalizationUtils.getLocalizedString(label, label));
    };

    const currentItemId = STATE.slideshow.itemIds[STATE.slideshow.currentSlideIndex];
    const player = STATE.slideshow.videoPlayers ? STATE.slideshow.videoPlayers[currentItemId] : null;

    if (currentItemId) {
      const currentSlide = document.querySelector(`.slide[data-item-id="${currentItemId}"]`);
      const video = currentSlide?.querySelector('video');

      if (video) {
        video.muted = STATE.slideshow.isMuted;
        if (!STATE.slideshow.isMuted) {
          video.volume = 0.4;
        }

        video.play().catch(error => {
          console.warn("Unmuted play blocked, reverting to muted...");
          STATE.slideshow.isMuted = true;
          video.muted = true;
          video.play();
          updateIcon();
        });
      }

      if (player && typeof player.playVideo === 'function') {
        if (STATE.slideshow.isMuted) {
          player.mute();
        } else {
          player.unMute();
          player.setVolume(40);
        }

        player.playVideo();
        if (isUnmuting) {
          setTimeout(() => {
            const state = player.getPlayerState();
            if (state === 2) {
              console.log("Video was paused after unmute...");
              STATE.slideshow.isMuted = true;
              player.mute();
              player.playVideo();
              updateIcon();
            }
          }, 300);
        }
      }
    }

    updateIcon();
  },

  togglePause() {
    STATE.slideshow.isPaused = !STATE.slideshow.isPaused;
    const pauseButton = document.querySelector('.pause-button');

    // Handle current video playback
    const currentItemId = STATE.slideshow.itemIds[STATE.slideshow.currentSlideIndex];
    const currentSlide = document.querySelector(`.slide[data-item-id="${currentItemId}"]`);

    if (currentSlide) {
      // Try YouTube player
      const ytPlayer = STATE.slideshow.videoPlayers[currentItemId];
      if (ytPlayer && typeof ytPlayer.getPlayerState === 'function') {
        if (STATE.slideshow.isPaused) {
          ytPlayer.pauseVideo();
        } else {
          ytPlayer.playVideo();
        }
      }

      // Try HTML5 video
      const html5Video = currentSlide.querySelector('video');
      if (html5Video) {
        if (STATE.slideshow.isPaused) {
          html5Video.pause();
        } else {
          html5Video.play();
        }
      }
    }

    if (STATE.slideshow.isPaused) {
      STATE.slideshow.slideInterval.stop();
      pauseButton.innerHTML = '<i class="material-icons">play_arrow</i>';
      const playLabel = LocalizationUtils.getLocalizedString('Play', 'Play');
      pauseButton.setAttribute("aria-label", playLabel);
      pauseButton.setAttribute("title", playLabel);
    } else {
      // Only restart interval if we are NOT waiting for a video to end
      const currentItemId = STATE.slideshow.itemIds[STATE.slideshow.currentSlideIndex];
      const currentSlide = document.querySelector(`.slide[data-item-id="${currentItemId}"]`);
      const hasVideo = currentSlide && currentSlide.querySelector('.video-backdrop');

      if (!CONFIG.waitForTrailerToEnd || !hasVideo) {
        STATE.slideshow.slideInterval.start();
      }

      pauseButton.innerHTML = '<i class="material-icons">pause</i>';
      const pauseLabel = LocalizationUtils.getLocalizedString('ButtonPause', 'Pause');
      pauseButton.setAttribute("aria-label", pauseLabel);
      pauseButton.setAttribute("title", pauseLabel);
    }
  },

  /**
   * Stops all video playback (YouTube and HTML5)
   * Used when navigating away from the home screen
   */
  stopAllPlayback() {
    // 1. Pause all YouTube players
    if (STATE.slideshow.videoPlayers) {
      Object.values(STATE.slideshow.videoPlayers).forEach(player => {
        try {
          if (player && typeof player.pauseVideo === 'function') {
            player.pauseVideo();
          }
        } catch (e) {
          console.warn("Error pausing YouTube player:", e);
        }
      });
    }

    // 2. Pause all HTML5 videos
    const container = document.getElementById("slides-container");
    if (container) {
      container.querySelectorAll('video').forEach(video => {
        try {
          video.pause();
        } catch (e) {
          console.warn("Error pausing HTML5 video:", e);
        }
      });
    }
  },

  /**
   * Initializes touch events for swiping
   */
  initTouchEvents() {
    const container = SlideUtils.getOrCreateSlidesContainer();
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    container.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        this.handleSwipe(touchStartX, touchEndX);
      },
      { passive: true }
    );
  },

  /**
   * Handles swipe gestures
   * @param {number} startX - Starting X position
   * @param {number} endX - Ending X position
   */
  handleSwipe(startX, endX) {
    const diff = endX - startX;

    if (Math.abs(diff) < CONFIG.minSwipeDistance) {
      return;
    }

    if (diff > 0) {
      this.prevSlide();
    } else {
      this.nextSlide();
    }
  },

  /**
   * Initializes keyboard event listeners
   */
  initKeyboardEvents() {
    if (!CONFIG.enableKeyboardControls) return;

    document.addEventListener("keydown", (e) => {
      const container = document.getElementById("slides-container");
      // Allow interaction if container is visible, even if not strictly focused
      if (!container || container.style.display === "none") {
        return;
      }

      const focusElement = document.activeElement;

      switch (e.key) {
        case "ArrowRight":
          if (focusElement && focusElement.classList.contains("detail-button")) {
            focusElement.previousElementSibling.focus();
          } else {
            SlideshowManager.nextSlide();
          }
          e.preventDefault();
          break;

        case "ArrowLeft":
          if (focusElement && focusElement.classList.contains("play-button")) {
            focusElement.nextElementSibling.focus();
          } else {
            SlideshowManager.prevSlide();
          }
          e.preventDefault();
          break;

        case " ": // Space bar
          this.togglePause();
          e.preventDefault();
          break;

        case "m": // Mute toggle
        case "M":
          this.toggleMute();
          e.preventDefault();
          break;

        case "Enter":
          if (focusElement) {
            focusElement.click();
          }
          e.preventDefault();
          break;
      }
    });

    const container = SlideUtils.getOrCreateSlidesContainer();

    container.addEventListener("focus", () => {
      STATE.slideshow.containerFocused = true;
    });

    container.addEventListener("blur", () => {
      STATE.slideshow.containerFocused = false;
    });
  },

  /**
   * Parses custom media IDs, handling seasonal content if enabled
   * @returns {string[]} Array of media IDs
   */
  parseCustomIds() {
    if (!CONFIG.enableSeasonalContent) {
      return CONFIG.customMediaIds
        .split(/[\n,]/)         // Split by comma or newline
        .map((id) => id.trim()) // Remove whitespace
        .filter((id) => id);    // Remove empty strings
    } else {
      return this.parseSeasonalIds();
    }
  },

  /**
   * Parses custom media IDs, handling seasonal content if enabled
   * @returns {string[]} Array of media IDs
   */
  parseSeasonalIds() {
    console.log("Using Seasonal Content Mode");
    const lines = CONFIG.customMediaIds.split('\n');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentDay = currentDate.getDate(); // 1-31
    const rawIds = [];

    for (const line of lines) {
      const match = line.match(/^\s*(\d{1,2})\.(\d{1,2})-(\d{1,2})\.(\d{1,2})\s*\|.*\|(.*)$/) ||
        line.match(/^\s*(\d{1,2})\.(\d{1,2})-(\d{1,2})\.(\d{1,2})\s*\|(.*)$/);

      if (match) {
        const startDay = parseInt(match[1]);
        const startMonth = parseInt(match[2]);
        const endDay = parseInt(match[3]);
        const endMonth = parseInt(match[4]);
        const idsPart = match[5];

        let isInRange = false;

        if (startMonth === endMonth) {
          if (currentMonth === startMonth && currentDay >= startDay && currentDay <= endDay) {
            isInRange = true;
          }
        } else if (startMonth < endMonth) {
          // Normal range spanning months (e.g. 15.06 - 15.08)
          if (
            (currentMonth > startMonth && currentMonth < endMonth) ||
            (currentMonth === startMonth && currentDay >= startDay) ||
            (currentMonth === endMonth && currentDay <= endDay)
          ) {
            isInRange = true;
          }
        } else {
          // Wrap around year (e.g. 01.12 - 15.01)
          if (
            (currentMonth > startMonth || currentMonth < endMonth) ||
            (currentMonth === startMonth && currentDay >= startDay) ||
            (currentMonth === endMonth && currentDay <= endDay)
          ) {
            isInRange = true;
          }
        }

        if (isInRange) {
          console.log(`Seasonal match found: ${line}`);
          const ids = idsPart.split(/[,]/).map(id => id.trim()).filter(id => id);
          rawIds.push(...ids);
        }
      }
    }
    return rawIds;
  },

  /**
   * Resolves a list of IDs, expanding collections (BoxSets) into their children
   * @param {string[]} rawIds - List of input IDs
   * @returns {Promise<string[]>} Flattened list of item IDs
   */
  async resolveCollectionsAndItems(rawIds) {
    const finalIds = [];
    const guidRegex = /^([0-9a-f]{32})$/i;

    for (const rawId of rawIds) {
      try {
        let id = rawId;

        // If not a valid GUID, check if it starts with one (comments) or treat as a name
        if (!guidRegex.test(rawId)) {
          const guidMatch = rawId.match(/^([0-9a-f]{32})(?:[^0-9a-f]|$)/i);

          if (guidMatch) {
            id = guidMatch[1];
          } else {
            console.log(`Input '${rawId}' is not a GUID, searching for Collection/Playlist by name...`);
            const resolvedId = await ApiUtils.findCollectionOrPlaylistByName(rawId);

            if (resolvedId) {
              console.log(`Resolved name '${rawId}' to ID: ${resolvedId}`);
              id = resolvedId;
            } else {
              console.warn(`Could not find Collection or Playlist with name: '${rawId}'`);
              continue; // Skip if resolution failed
            }
          }
        }

        const item = await ApiUtils.fetchItemDetails(id);
        if (item && (item.Type === 'BoxSet' || item.Type === 'Playlist')) {
          console.log(`Found Collection/Playlist: ${id} (${item.Type}), fetching children...`);
          const children = await ApiUtils.fetchCollectionItems(id);
          finalIds.push(...children);
        } else if (item) {
          finalIds.push(id);
        }
      } catch (e) {
        console.warn(`Error resolving item ${id}:`, e);
      }
    }
    return finalIds;
  },

  /**
   * Loads slideshow data and initializes the slideshow
   */
  async loadSlideshowData() {
    try {
      STATE.slideshow.isLoading = true;
      let itemIds = [];

      // 1. Try Custom Media/Collection IDs from Config & seasonal content
      if (CONFIG.enableCustomMediaIds && CONFIG.customMediaIds) {
        console.log("Using Custom Media IDs from configuration");
        const rawIds = this.parseCustomIds();
        itemIds = await this.resolveCollectionsAndItems(rawIds);
      }

      // 2. Try Avatar List (list.txt)
      if (itemIds.length === 0) {
        itemIds = await ApiUtils.fetchItemIdsFromList();
      }

      // 3. Fallback to server query (Random)
      if (itemIds.length === 0) {
        console.log("No custom list found, fetching random items from server...");
        itemIds = await ApiUtils.fetchItemIdsFromServer();
      }

      itemIds = SlideUtils.shuffleArray(itemIds);

      STATE.slideshow.itemIds = itemIds;
      STATE.slideshow.totalItems = itemIds.length;

      this.createPaginationDots();

      await this.updateCurrentSlide(0);

      STATE.slideshow.slideInterval = new SlideTimer(() => {
        if (STATE.slideshow.isPaused) return;

        if (CONFIG.waitForTrailerToEnd) {
          const activeSlide = document.querySelector('.slide.active');
          const hasActiveVideo = !!(activeSlide && activeSlide.querySelector('.video-backdrop'));
          if (hasActiveVideo) return;
        }

        this.nextSlide();
      }, CONFIG.shuffleInterval);

      if (CONFIG.waitForTrailerToEnd && STATE.slideshow.slideInterval) {
        const activeSlide = document.querySelector('.slide.active');
        const hasActiveVideo = !!(activeSlide && activeSlide.querySelector('.video-backdrop'));
        if (hasActiveVideo) {
          STATE.slideshow.slideInterval.stop();
        }
      }
    } catch (error) {
      console.error("Error loading slideshow data:", error);
    } finally {
      STATE.slideshow.isLoading = false;
    }
  },
};

/**
 * Initializes arrow navigation elements
 */
const initArrowNavigation = () => {
  const container = SlideUtils.getOrCreateSlidesContainer();

  const leftArrow = SlideUtils.createElement("div", {
    className: "arrow left-arrow",
    innerHTML: '<i class="material-icons">chevron_left</i>',
    tabIndex: "0",
    onclick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      SlideshowManager.prevSlide();
    },
    style: {
      opacity: "0",
      transition: "opacity 0.3s ease",
      display: "none",
    },
  });

  const rightArrow = SlideUtils.createElement("div", {
    className: "arrow right-arrow",
    innerHTML: '<i class="material-icons">chevron_right</i>',
    tabIndex: "0",
    onclick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      SlideshowManager.nextSlide();
    },
    style: {
      opacity: "0",
      transition: "opacity 0.3s ease",
      display: "none",
    },
  });

  const pauseButton = SlideUtils.createElement("div", {
    className: "pause-button",
    innerHTML: '<i class="material-icons">pause</i>',
    tabIndex: "0",
    "aria-label": LocalizationUtils.getLocalizedString('ButtonPause', 'Pause'),
    title: LocalizationUtils.getLocalizedString('ButtonPause', 'Pause'),
    onclick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      SlideshowManager.togglePause();
    }
  });

  // Prevent touch events from bubbling to container
  pauseButton.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
  pauseButton.addEventListener("touchend", (e) => e.stopPropagation(), { passive: true });
  pauseButton.addEventListener("mousedown", (e) => e.stopPropagation());

  const muteButton = SlideUtils.createElement("div", {
    className: "mute-button",
    innerHTML: STATE.slideshow.isMuted ? '<i class="material-icons">volume_off</i>' : '<i class="material-icons">volume_up</i>',
    tabIndex: "0",
    "aria-label": STATE.slideshow.isMuted ? LocalizationUtils.getLocalizedString('Unmute', 'Unmute') : LocalizationUtils.getLocalizedString('Mute', 'Mute'),
    title: STATE.slideshow.isMuted ? LocalizationUtils.getLocalizedString('Unmute', 'Unmute') : LocalizationUtils.getLocalizedString('Mute', 'Mute'),
    style: { display: "none" },
    onclick: (e) => {
      e.preventDefault();
      e.stopPropagation();
      SlideshowManager.toggleMute();
    }
  });

  // Prevent touch events from bubbling to container
  muteButton.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
  muteButton.addEventListener("touchend", (e) => e.stopPropagation(), { passive: true });
  muteButton.addEventListener("mousedown", (e) => e.stopPropagation());

  container.appendChild(leftArrow);
  container.appendChild(rightArrow);
  container.appendChild(pauseButton);
  container.appendChild(muteButton);

  const showArrows = () => {
    leftArrow.style.display = "block";
    rightArrow.style.display = "block";

    void leftArrow.offsetWidth;
    void rightArrow.offsetWidth;

    leftArrow.style.opacity = "1";
    rightArrow.style.opacity = "1";
  };

  const hideArrows = () => {
    leftArrow.style.opacity = "0";
    rightArrow.style.opacity = "0";

    setTimeout(() => {
      if (leftArrow.style.opacity === "0") {
        leftArrow.style.display = "none";
        rightArrow.style.display = "none";
      }
    }, 300);
  };

  container.addEventListener("mouseenter", showArrows);

  container.addEventListener("mouseleave", hideArrows);

  if (CONFIG.alwaysShowArrows) {
    showArrows();
    // Remove listeners to keep them shown
    container.removeEventListener("mouseenter", showArrows);
    container.removeEventListener("mouseleave", hideArrows);
  }

  let arrowTimeout;
  container.addEventListener(
    "touchstart",
    () => {
      if (arrowTimeout) {
        clearTimeout(arrowTimeout);
      }

      showArrows();

      arrowTimeout = setTimeout(hideArrows, 2000);
    },
    { passive: true }
  );
};

/**
 * Initialize the slideshow
 */
const slidesInit = async () => {
  if (STATE.slideshow.hasInitialized) {
    console.log("⚠️ Slideshow already initialized, skipping");
    return;
  }
  STATE.slideshow.hasInitialized = true;

  /**
   * Initialize IntersectionObserver for lazy loading images
   */
  const initLazyLoading = () => {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const image = entry.target;
            const highQualityUrl = image.getAttribute("data-high-quality");

            if (
              highQualityUrl &&
              image.closest(".slide").style.opacity === "1"
            ) {
              requestQueue.push({
                url: highQualityUrl,
                callback: () => {
                  image.src = highQualityUrl;
                  image.classList.remove("low-quality");
                  image.classList.add("high-quality");
                },
              });

              if (requestQueue.length === 1) {
                processNextRequest();
              }
            }

            observer.unobserve(image);
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    const observeSlideImages = () => {
      const slides = document.querySelectorAll(".slide");
      slides.forEach((slide) => {
        const images = slide.querySelectorAll("img.low-quality");
        images.forEach((image) => {
          imageObserver.observe(image);
        });
      });
    };

    const slideObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains("slide")) {
              const images = node.querySelectorAll("img.low-quality");
              images.forEach((image) => {
                imageObserver.observe(image);
              });
            }
          });
        }
      });
    });

    const container = SlideUtils.getOrCreateSlidesContainer();
    slideObserver.observe(container, { childList: true });

    observeSlideImages();

    return imageObserver;
  };

  const lazyLoadObserver = initLazyLoading();

  try {
    console.log("🌟 Initializing Enhanced Jellyfin Slideshow");

    initArrowNavigation();

    await SlideshowManager.loadSlideshowData();

    SlideshowManager.initTouchEvents();

    SlideshowManager.initKeyboardEvents();

    VisibilityObserver.init();

    console.log("✅ Enhanced Jellyfin Slideshow initialized successfully");
  } catch (error) {
    console.error("Error initializing slideshow:", error);
    STATE.slideshow.hasInitialized = false;
  }
};

window.mediaBarEnhanced = {
  CONFIG,
  STATE,
  SlideUtils,
  ApiUtils,
  SlideCreator,
  SlideshowManager,
  VisibilityObserver,
  initSlideshowData: () => {
    SlideshowManager.loadSlideshowData();
  },
  nextSlide: () => {
    SlideshowManager.nextSlide();
  },
  prevSlide: () => {
    SlideshowManager.prevSlide();
  },
};

initLoadingScreen();

loadPluginConfig().then(() => {
  startLoginStatusWatcher();
});
