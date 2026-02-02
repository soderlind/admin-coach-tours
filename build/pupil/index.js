/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/js/pupil/CoachPanel.jsx"
/*!****************************************!*\
  !*** ./assets/js/pupil/CoachPanel.jsx ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ CoachPanel)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/arrow-right.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
/**
 * Coach Panel Component.
 *
 * Floating panel showing step content and navigation controls.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */






/**
 * @typedef {import('../types/step.js').Step} Step
 */

/**
 * Coach Panel component.
 *
 * @param {Object}           props                          Component props.
 * @param {Step}             props.step                     Current step.
 * @param {number}           props.stepIndex                Current step index (0-based).
 * @param {number}           props.totalSteps               Total number of steps.
 * @param {string}           props.tourTitle                Tour title.
 * @param {HTMLElement|null} props.targetElement            Resolved target element.
 * @param {string|null}      props.resolutionError          Target resolution error.
 * @param {boolean}          props.isApplyingPreconditions  Whether preconditions are being applied.
 * @param {Function}         props.onContinue               Continue/complete handler.
 * @param {Function}         props.onRepeat                 Repeat step handler.
 * @param {Function}         props.onPrevious               Previous step handler.
 * @param {Function}         props.onNext                   Next step handler.
 * @param {Function}         props.onStop                   Stop tour handler.
 * @return {JSX.Element} Coach panel.
 */

function CoachPanel({
  step,
  stepIndex,
  totalSteps,
  tourTitle,
  targetElement,
  resolutionError,
  isApplyingPreconditions,
  onContinue,
  onRepeat,
  onPrevious,
  onNext,
  onStop
}) {
  const [position, setPosition] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    x: 20,
    y: 20
  });
  const [isDragging, setIsDragging] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [dragOffset, setDragOffset] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({
    x: 0,
    y: 0
  });
  const [positionKey, setPositionKey] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(0); // Force repositioning.
  const panelRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;
  const isManualCompletion = step?.completion?.type === 'manual';

  /**
   * Position panel relative to target element.
   */
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!targetElement || isDragging) {
      return;
    }
    const calculatePosition = () => {
      if (!targetElement?.isConnected) {
        return;
      }
      const rect = targetElement.getBoundingClientRect();

      // For elements in iframes, adjust rect to main window coordinates.
      const ownerDoc = targetElement.ownerDocument;
      let iframeOffset = {
        top: 0,
        left: 0
      };
      if (ownerDoc !== document) {
        const iframe = document.querySelector('iframe[name="editor-canvas"]');
        if (iframe) {
          const iframeRect = iframe.getBoundingClientRect();
          iframeOffset = {
            top: iframeRect.top,
            left: iframeRect.left
          };
        }
      }
      const adjustedRect = {
        top: rect.top + iframeOffset.top,
        bottom: rect.bottom + iframeOffset.top,
        left: rect.left + iframeOffset.left,
        right: rect.right + iframeOffset.left
      };
      const panelWidth = 320;
      const panelHeight = 200;
      const padding = 20;
      let x, y;

      // Try to position to the right of the element.
      if (adjustedRect.right + panelWidth + padding < window.innerWidth) {
        x = adjustedRect.right + padding;
        y = adjustedRect.top;
      }
      // Try to position to the left.
      else if (adjustedRect.left - panelWidth - padding > 0) {
        x = adjustedRect.left - panelWidth - padding;
        y = adjustedRect.top;
      }
      // Try below.
      else if (adjustedRect.bottom + panelHeight + padding < window.innerHeight) {
        x = Math.max(padding, adjustedRect.left);
        y = adjustedRect.bottom + padding;
      }
      // Try above.
      else if (adjustedRect.top - panelHeight - padding > 0) {
        x = Math.max(padding, adjustedRect.left);
        y = adjustedRect.top - panelHeight - padding;
      }
      // Default to bottom-right corner.
      else {
        x = window.innerWidth - panelWidth - padding;
        y = window.innerHeight - panelHeight - padding;
      }

      // Ensure panel stays within viewport.
      x = Math.max(padding, Math.min(x, window.innerWidth - panelWidth - padding));
      y = Math.max(padding, Math.min(y, window.innerHeight - panelHeight - padding));
      setPosition({
        x,
        y
      });
    };

    // Initial positioning.
    calculatePosition();

    // Listen to scroll and resize events.
    const handleScroll = () => {
      if (!isDragging) {
        calculatePosition();
      }
    };

    // Add listeners to main window.
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    window.addEventListener('resize', handleScroll, {
      passive: true
    });

    // Also listen to iframe window if element is inside iframe.
    const ownerDoc = targetElement.ownerDocument;
    const ownerWin = ownerDoc?.defaultView;
    if (ownerWin && ownerWin !== window) {
      ownerWin.addEventListener('scroll', handleScroll, {
        passive: true
      });
    }
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (ownerWin && ownerWin !== window) {
        try {
          ownerWin.removeEventListener('scroll', handleScroll);
        } catch (e) {
          // Window may be inaccessible.
        }
      }
    };
  }, [targetElement, isDragging, positionKey]);

  /**
   * Handle drag start.
   */
  const handleDragStart = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(event => {
    if (event.target.closest('button')) {
      return; // Don't drag when clicking buttons.
    }
    setIsDragging(true);
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    });
  }, []);

  /**
   * Handle drag move.
   */
  const handleDragMove = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(event => {
    if (!isDragging) {
      return;
    }
    const x = event.clientX - dragOffset.x;
    const y = event.clientY - dragOffset.y;

    // Keep panel within viewport.
    const panelRect = panelRef.current.getBoundingClientRect();
    const maxX = window.innerWidth - panelRect.width;
    const maxY = window.innerHeight - panelRect.height;
    setPosition({
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY))
    });
  }, [isDragging, dragOffset]);

  /**
   * Handle drag end.
   */
  const handleDragEnd = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setIsDragging(false);
  }, []);

  // Set up drag listeners.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  /**
   * Render step content.
   */
  const renderContent = () => {
    if (isApplyingPreconditions) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "act-panel-loading",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Spinner, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Preparing…', 'admin-coach-tours')
        })]
      });
    }
    if (resolutionError) {
      return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "act-panel-error",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Could not find the target element. The UI may have changed.', 'admin-coach-tours')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
          variant: "secondary",
          onClick: onRepeat,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Try Again', 'admin-coach-tours')
        })]
      });
    }
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
      children: step?.content && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        className: "act-panel-content",
        dangerouslySetInnerHTML: {
          __html: step.content
        }
      })
    });
  };

  /**
   * Render navigation controls.
   */
  const renderControls = () => {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "act-panel-controls",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Flex, {
        justify: "flex-end",
        align: "center",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
          children: isManualCompletion || isLastStep ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
            variant: "primary",
            onClick: onContinue,
            disabled: isApplyingPreconditions || !!resolutionError,
            size: "small",
            children: isLastStep ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Finish', 'admin-coach-tours') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Continue', 'admin-coach-tours')
          }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_3__["default"],
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Next', 'admin-coach-tours'),
            onClick: onNext,
            disabled: isApplyingPreconditions || !!resolutionError,
            size: "small"
          })
        })
      })
    });
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
    ref: panelRef,
    className: "act-coach-panel",
    style: {
      position: 'fixed',
      top: position.y,
      left: position.x,
      width: '320px',
      maxHeight: '400px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      zIndex: 9999990,
      display: 'flex',
      flexDirection: 'column',
      cursor: isDragging ? 'grabbing' : 'default'
    },
    onMouseDown: handleDragStart,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "act-panel-header",
      style: {
        padding: '12px 16px',
        borderBottom: '1px solid #e0e0e0',
        cursor: 'grab',
        userSelect: 'none'
      },
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Flex, {
        justify: "space-between",
        align: "center",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexBlock, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("strong", {
            className: "act-panel-title",
            children: step?.title || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Step', 'admin-coach-tours') + ` ${stepIndex + 1}`
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            className: "act-panel-progress",
            style: {
              fontSize: '12px',
              color: '#666'
            },
            children: [`${stepIndex + 1} / ${totalSteps}`, tourTitle && ` • ${tourTitle}`]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.FlexItem, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_2__.Button, {
            icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"],
            label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_1__.__)('Close tour', 'admin-coach-tours'),
            onClick: onStop,
            size: "small"
          })
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "act-panel-body",
      style: {
        padding: '16px',
        flex: 1,
        overflow: 'auto'
      },
      children: renderContent()
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
      className: "act-panel-footer",
      style: {
        padding: '12px 16px',
        borderTop: '1px solid #e0e0e0'
      },
      children: renderControls()
    })]
  });
}

/***/ },

/***/ "./assets/js/pupil/Highlighter.js"
/*!****************************************!*\
  !*** ./assets/js/pupil/Highlighter.js ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Highlighter)
/* harmony export */ });
/**
 * Highlighter Class.
 *
 * Manages visual highlighting of target elements during tour playback.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

/**
 * Default highlight styles.
 */
const DEFAULT_STYLES = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    transition: 'all 0.3s ease'
  },
  spotlight: {
    boxShadow: '0 0 0 4px #007cba, 0 0 0 9999px rgba(0, 0, 0, 0.5)',
    borderRadius: '4px',
    transition: 'all 0.3s ease'
  },
  pulse: {
    animation: 'act-pulse 2s infinite'
  }
};

/**
 * CSS keyframes for pulse animation.
 */
const PULSE_KEYFRAMES = `
@keyframes act-pulse {
	0% {
		box-shadow: 0 0 0 4px #007cba, 0 0 0 9999px rgba(0, 0, 0, 0.5);
	}
	50% {
		box-shadow: 0 0 0 8px rgba(0, 124, 186, 0.5), 0 0 0 9999px rgba(0, 0, 0, 0.5);
	}
	100% {
		box-shadow: 0 0 0 4px #007cba, 0 0 0 9999px rgba(0, 0, 0, 0.5);
	}
}
`;

/**
 * Highlighter class for managing element highlighting.
 */
class Highlighter {
  /**
   * Constructor.
   *
   * @param {Object} options Configuration options.
   */
  constructor(options = {}) {
    this.options = {
      usePulse: true,
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      highlightColor: '#007cba',
      transitionDuration: 300,
      ...options
    };
    this.spotlightElement = null;
    this.targetElement = null;
    this.resizeObserver = null;
    this.styleElement = null;
    this._isAnimating = false;
    this._init();
  }

  /**
   * Initialize the highlighter.
   *
   * @private
   */
  _init() {
    // Inject keyframes stylesheet.
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = PULSE_KEYFRAMES;
    document.head.appendChild(this.styleElement);

    // Create spotlight element.
    this.spotlightElement = document.createElement('div');
    this.spotlightElement.className = 'act-highlighter-spotlight';
    this.spotlightElement.setAttribute('aria-hidden', 'true');
    Object.assign(this.spotlightElement.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: 9999980,
      ...DEFAULT_STYLES.spotlight
    });

    // Hidden by default.
    this.spotlightElement.style.display = 'none';
    document.body.appendChild(this.spotlightElement);

    // Create resize observer.
    this.resizeObserver = new ResizeObserver(() => {
      this._updatePosition();
    });
  }

  /**
   * Highlight an element.
   *
   * @param {HTMLElement} element Element to highlight.
   */
  highlight(element) {
    if (!element || !element.isConnected) {
      this.clear();
      return;
    }

    // If already highlighting this exact element, skip.
    if (this.targetElement === element) {
      return;
    }

    // Clear previous target properly (including scroll listeners).
    if (this.targetElement) {
      this.resizeObserver.unobserve(this.targetElement);
      this._removeScrollListeners();
    }
    this.targetElement = element;

    // Observe for size changes.
    this.resizeObserver.observe(element);

    // Update position.
    this._updatePosition();

    // Show spotlight.
    this.spotlightElement.style.display = 'block';

    // Apply pulse animation if enabled (only if not already animating).
    if (this.options.usePulse && !this._isAnimating) {
      this.spotlightElement.style.animation = 'act-pulse 2s infinite';
      this._isAnimating = true;
    }

    // Add scroll listener to update position.
    this._addScrollListeners();
  }

  /**
   * Update spotlight position to match target.
   *
   * @private
   */
  _updatePosition() {
    if (!this.targetElement || !this.spotlightElement) {
      return;
    }
    const rect = this.targetElement.getBoundingClientRect();

    // Add padding around the element.
    const padding = 4;

    // Check if element is inside an iframe and get iframe offset.
    let iframeOffset = {
      top: 0,
      left: 0
    };
    const ownerDoc = this.targetElement.ownerDocument;
    if (ownerDoc !== document) {
      // Element is in an iframe - find the iframe element.
      const iframes = document.querySelectorAll('iframe');
      for (const iframe of iframes) {
        if (iframe.contentDocument === ownerDoc) {
          const iframeRect = iframe.getBoundingClientRect();
          iframeOffset = {
            top: iframeRect.top,
            left: iframeRect.left
          };
          break;
        }
      }
    }
    Object.assign(this.spotlightElement.style, {
      top: `${rect.top + iframeOffset.top - padding}px`,
      left: `${rect.left + iframeOffset.left - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`
    });
  }

  /**
   * Add scroll listeners to update position.
   *
   * @private
   */
  _addScrollListeners() {
    this._scrollHandler = () => {
      this._updatePosition();
    };

    // Track which windows we're listening to for cleanup.
    this._scrollWindows = [];

    // Listen to all scrollable ancestors in the element's document.
    let parent = this.targetElement?.parentElement;
    while (parent) {
      if (parent.scrollHeight > parent.clientHeight) {
        parent.addEventListener('scroll', this._scrollHandler, {
          passive: true
        });
      }
      parent = parent.parentElement;
    }

    // Check if element is inside an iframe.
    const ownerDoc = this.targetElement?.ownerDocument;
    const ownerWin = ownerDoc?.defaultView;
    if (ownerWin && ownerWin !== window) {
      // Element is in an iframe - listen to iframe window scroll.
      ownerWin.addEventListener('scroll', this._scrollHandler, {
        passive: true
      });
      ownerWin.addEventListener('resize', this._scrollHandler, {
        passive: true
      });
      this._scrollWindows.push(ownerWin);
    }

    // Also listen to main window scroll and resize.
    window.addEventListener('scroll', this._scrollHandler, {
      passive: true
    });
    window.addEventListener('resize', this._scrollHandler, {
      passive: true
    });
    this._scrollWindows.push(window);
  }

  /**
   * Remove scroll listeners.
   *
   * @private
   */
  _removeScrollListeners() {
    if (!this._scrollHandler) {
      return;
    }

    // Remove from parent elements.
    let parent = this.targetElement?.parentElement;
    while (parent) {
      parent.removeEventListener('scroll', this._scrollHandler);
      parent = parent.parentElement;
    }

    // Remove from all tracked windows (main window + any iframe windows).
    if (this._scrollWindows) {
      for (const win of this._scrollWindows) {
        try {
          win.removeEventListener('scroll', this._scrollHandler);
          win.removeEventListener('resize', this._scrollHandler);
        } catch (e) {
          // Window may have been closed or inaccessible.
        }
      }
      this._scrollWindows = [];
    }
    this._scrollHandler = null;
  }

  /**
   * Clear highlighting.
   */
  clear() {
    if (this.targetElement) {
      this.resizeObserver.unobserve(this.targetElement);
      this._removeScrollListeners();
      this.targetElement = null;
    }
    if (this.spotlightElement) {
      this.spotlightElement.style.display = 'none';
      this.spotlightElement.style.animation = 'none';
      this._isAnimating = false;
    }
  }

  /**
   * Transition highlight to a new element.
   *
   * @param {HTMLElement} element New element to highlight.
   * @return {Promise<void>} Promise that resolves when transition completes.
   */
  async transitionTo(element) {
    if (!this.targetElement) {
      this.highlight(element);
      return;
    }

    // Smooth transition by updating position.
    if (this.targetElement) {
      this.resizeObserver.unobserve(this.targetElement);
      this._removeScrollListeners();
    }
    this.targetElement = element;
    if (element && element.isConnected) {
      this.resizeObserver.observe(element);
      this._addScrollListeners();

      // Animate to new position.
      await new Promise(resolve => {
        requestAnimationFrame(() => {
          this._updatePosition();
          setTimeout(resolve, this.options.transitionDuration);
        });
      });
    } else {
      this.clear();
    }
  }

  /**
   * Set highlight style.
   *
   * @param {string} style Style name: 'default', 'success', 'warning', 'error'.
   */
  setStyle(style) {
    if (!this.spotlightElement) {
      return;
    }
    const colors = {
      default: '#007cba',
      success: '#00a32a',
      warning: '#dba617',
      error: '#d63638'
    };
    const color = colors[style] || colors.default;
    this.spotlightElement.style.boxShadow = `0 0 0 4px ${color}, 0 0 0 9999px rgba(0, 0, 0, 0.5)`;
  }

  /**
   * Flash the highlight (for completion feedback).
   *
   * @return {Promise<void>} Promise that resolves when flash completes.
   */
  async flash() {
    if (!this.spotlightElement) {
      return;
    }

    // Quick flash to success color.
    this.setStyle('success');
    await new Promise(resolve => {
      setTimeout(() => {
        this.setStyle('default');
        resolve();
      }, 300);
    });
  }

  /**
   * Destroy the highlighter and clean up.
   */
  destroy() {
    this.clear();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.spotlightElement && this.spotlightElement.parentNode) {
      this.spotlightElement.parentNode.removeChild(this.spotlightElement);
      this.spotlightElement = null;
    }
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
      this.styleElement = null;
    }
  }
}

/***/ },

/***/ "./assets/js/pupil/PupilLauncher.jsx"
/*!*******************************************!*\
  !*** ./assets/js/pupil/PupilLauncher.jsx ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PupilLauncher)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
/**
 * Pupil Launcher Component.
 *
 * Provides AI-powered tour generation for pupils with a dropdown of
 * predefined tasks and optional freeform chat.
 *
 * @package AdminCoachTours
 * @since   0.3.0
 */







const STORE_NAME = 'admin-coach-tours';

/**
 * Icons for task categories.
 */
const CATEGORY_ICONS = {
  media: '🖼️',
  content: '📝',
  layout: '📐',
  formatting: '✨',
  default: '📚'
};

/**
 * Pupil Launcher component.
 *
 * @return {JSX.Element|null} Launcher UI or null if hidden.
 */
function PupilLauncher() {
  const [isOpen, setIsOpen] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [tasks, setTasks] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)([]);
  const [isTasksLoading, setIsTasksLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [tasksError, setTasksError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [chatQuery, setChatQuery] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const [activeTab, setActiveTab] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('tasks');
  const [localLoading, setLocalLoading] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  // Track last request for retry functionality.
  const [lastRequest, setLastRequest] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const inputRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);

  // Get state from store.
  const {
    storeLoading,
    aiTourError,
    isPlaying,
    aiAvailable,
    lastFailureContext
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    var _store$isAiTourLoadin, _store$getAiTourError, _window$adminCoachTou, _store$getLastFailure;
    const store = select(STORE_NAME);
    return {
      storeLoading: (_store$isAiTourLoadin = store.isAiTourLoading?.()) !== null && _store$isAiTourLoadin !== void 0 ? _store$isAiTourLoadin : false,
      aiTourError: (_store$getAiTourError = store.getAiTourError?.()) !== null && _store$getAiTourError !== void 0 ? _store$getAiTourError : null,
      isPlaying: store.getCurrentTour() !== null,
      // Check if AI is available from localized data.
      aiAvailable: (_window$adminCoachTou = window.adminCoachTours?.aiAvailable) !== null && _window$adminCoachTou !== void 0 ? _window$adminCoachTou : false,
      // Failure context for contextual retry.
      lastFailureContext: (_store$getLastFailure = store.getLastFailureContext?.()) !== null && _store$getLastFailure !== void 0 ? _store$getLastFailure : null
    };
  }, []);

  // Combine local and store loading state.
  // Local state ensures immediate render before React batches updates.
  const isAiTourLoading = localLoading || storeLoading;

  // Clear local loading only when tour starts playing (not before).
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isPlaying && localLoading) {
      setLocalLoading(false);
    }
  }, [isPlaying, localLoading]);

  // Get dispatch actions.
  const {
    requestAiTour,
    clearEphemeralTour,
    setAiTourError,
    setLastFailureContext
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)(STORE_NAME);

  /**
   * Fetch available tasks when launcher opens.
   */
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isOpen && tasks.length === 0 && !isTasksLoading) {
      setIsTasksLoading(true);
      setTasksError(null);
      _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: '/admin-coach-tours/v1/ai/tasks'
      }).then(response => {
        if (response.available && response.tasks) {
          setTasks(response.tasks);
        } else {
          setTasksError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI is not available.', 'admin-coach-tours'));
        }
      }).catch(error => {
        setTasksError(error.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Failed to load tasks.', 'admin-coach-tours'));
      }).finally(() => {
        setIsTasksLoading(false);
      });
    }
  }, [isOpen, tasks.length, isTasksLoading]);

  /**
   * Focus input when chat tab opens.
   */
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (activeTab === 'chat' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTab]);

  /**
   * Handle task selection.
   */
  const handleTaskClick = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(taskId => {
    // Set local loading immediately to show overlay before React batches updates.
    setLocalLoading(true);
    setIsOpen(false);
    const postType = window.adminCoachTours?.postType || 'post';
    // Track request for retry.
    setLastRequest({
      type: 'task',
      taskId,
      postType
    });
    requestAiTour(taskId, '', postType);
  }, [requestAiTour]);

  /**
   * Handle freeform chat submission.
   */
  const handleChatSubmit = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(e => {
    e.preventDefault();
    if (!chatQuery.trim()) {
      return;
    }

    // Set local loading immediately to show overlay before React batches updates.
    setLocalLoading(true);
    setIsOpen(false);
    const postType = window.adminCoachTours?.postType || 'post';
    const query = chatQuery.trim();
    // Track request for retry.
    setLastRequest({
      type: 'chat',
      query,
      postType
    });
    requestAiTour('', query, postType);
    setChatQuery('');
  }, [chatQuery, requestAiTour]);

  /**
   * Retry last failed request.
   * Passes failure context to AI so it can learn from the error.
   */
  const handleRetry = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (!lastRequest) {
      return;
    }

    // Clear error and retry.
    setAiTourError(null);
    setLocalLoading(true);
    setIsOpen(false);

    // Pass failure context so AI can generate better selectors.
    if (lastRequest.type === 'task') {
      requestAiTour(lastRequest.taskId, '', lastRequest.postType, lastFailureContext);
    } else if (lastRequest.type === 'chat') {
      requestAiTour('', lastRequest.query, lastRequest.postType, lastFailureContext);
    }

    // Clear failure context after passing it.
    setLastFailureContext(null);
  }, [lastRequest, lastFailureContext, requestAiTour, setAiTourError, setLastFailureContext]);

  /**
   * Dismiss error and clear last request.
   */
  const handleDismissError = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setAiTourError(null);
    setLastRequest(null);
    setLastFailureContext(null);
    setLocalLoading(false);
  }, [setAiTourError, setLastFailureContext]);

  /**
   * Retry loading tasks.
   */
  const handleRetryTasks = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setTasksError(null);
    setTasks([]); // Clear to trigger re-fetch.
  }, []);

  /**
   * Toggle launcher open/closed.
   */
  const toggleLauncher = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setIsOpen(prev => !prev);
  }, []);

  /**
   * Close launcher.
   */
  const closeLauncher = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    setIsOpen(false);
  }, []);

  // Show configuration prompt if AI is not available.
  if (!aiAvailable) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "act-pupil-launcher",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
        className: "act-pupil-launcher__fab",
        onClick: toggleLauncher,
        "aria-expanded": isOpen,
        "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Open AI Coach', 'admin-coach-tours'),
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
          className: "act-pupil-launcher__icon",
          children: "\uD83D\uDCA1"
        })
      }), isOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "act-pupil-launcher__panel",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
          className: "act-pupil-launcher__header",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("h3", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Coach', 'admin-coach-tours')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
            className: "act-pupil-launcher__close",
            onClick: closeLauncher,
            "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Close', 'admin-coach-tours'),
            children: "\xD7"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
          className: "act-pupil-launcher__content",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            className: "act-pupil-launcher__not-configured",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI is not configured yet.', 'admin-coach-tours')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("p", {
              children: [(0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Go to ', 'admin-coach-tours'), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("a", {
                href: "/wp-admin/tools.php?page=admin-coach-tours",
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Tools → Coach Tours', 'admin-coach-tours')
              }), (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)(' to add your API key.', 'admin-coach-tours')]
            })]
          })
        })]
      })]
    });
  }

  // Group tasks by category.
  const tasksByCategory = tasks.reduce((acc, task) => {
    const category = task.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(task);
    return acc;
  }, {});

  // Render loading overlay via portal (always available, even when tour is playing).
  // This must be outside the isPlaying guard to persist during the transition.
  const loadingOverlay = isAiTourLoading && (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.createPortal)(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
    className: "act-ai-loading-overlay",
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "act-ai-loading-overlay__content",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
        className: "act-ai-loading-overlay__spinner"
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("h2", {
        className: "act-ai-loading-overlay__title",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Creating your guided tour...', 'admin-coach-tours')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
        className: "act-ai-loading-overlay__text",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI is analyzing the editor and generating step-by-step instructions.', 'admin-coach-tours')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
        className: "act-ai-loading-overlay__hint",
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('This usually takes a few seconds.', 'admin-coach-tours')
      })]
    })
  }), document.body);

  // Don't render launcher UI if a tour is playing, but keep the overlay.
  if (isPlaying) {
    return loadingOverlay || null;
  }
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.Fragment, {
    children: [loadingOverlay, /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
      className: "act-pupil-launcher",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
        className: "act-pupil-launcher__fab",
        onClick: toggleLauncher,
        "aria-expanded": isOpen,
        "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Open AI Coach', 'admin-coach-tours'),
        disabled: isAiTourLoading,
        children: isAiTourLoading ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
          className: "act-pupil-launcher__spinner"
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
          className: "act-pupil-launcher__icon",
          children: "\uD83D\uDCA1"
        })
      }), isOpen && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
        className: "act-pupil-launcher__panel",
        children: [isAiTourLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
          className: "act-pupil-launcher__ai-loading",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
            className: "act-pupil-launcher__ai-loading-spinner"
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
            className: "act-pupil-launcher__ai-loading-text",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Creating your tour...', 'admin-coach-tours')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
            className: "act-pupil-launcher__ai-loading-hint",
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI is generating step-by-step instructions', 'admin-coach-tours')
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
          className: "act-pupil-launcher__header",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("h3", {
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('What would you like to learn?', 'admin-coach-tours')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
            className: "act-pupil-launcher__close",
            onClick: closeLauncher,
            "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Close', 'admin-coach-tours'),
            children: "\xD7"
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
          className: "act-pupil-launcher__tabs",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
            className: `act-pupil-launcher__tab ${activeTab === 'tasks' ? 'is-active' : ''}`,
            onClick: () => setActiveTab('tasks'),
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Common Tasks', 'admin-coach-tours')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
            className: `act-pupil-launcher__tab ${activeTab === 'chat' ? 'is-active' : ''}`,
            onClick: () => setActiveTab('chat'),
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Ask a Question', 'admin-coach-tours')
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
          className: "act-pupil-launcher__content",
          children: [aiTourError && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            className: "act-pupil-launcher__error",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
              className: "act-pupil-launcher__error-message",
              children: aiTourError
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
              className: "act-pupil-launcher__error-hint",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('This might be a temporary issue.', 'admin-coach-tours')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
              className: "act-pupil-launcher__error-actions",
              children: [lastRequest && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
                className: "act-pupil-launcher__retry-btn",
                onClick: handleRetry,
                disabled: isAiTourLoading,
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Try Again', 'admin-coach-tours')
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
                className: "act-pupil-launcher__dismiss-btn",
                onClick: handleDismissError,
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Dismiss', 'admin-coach-tours')
              })]
            })]
          }), tasksError && !aiTourError && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            className: "act-pupil-launcher__error",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
              className: "act-pupil-launcher__error-message",
              children: tasksError
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
              className: "act-pupil-launcher__error-actions",
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
                className: "act-pupil-launcher__retry-btn",
                onClick: handleRetryTasks,
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Try Again', 'admin-coach-tours')
              })
            })]
          }), activeTab === 'tasks' && !tasksError && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            className: "act-pupil-launcher__tasks",
            children: [isTasksLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
              className: "act-pupil-launcher__loading",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Loading tasks...', 'admin-coach-tours')
            }), !isTasksLoading && Object.entries(tasksByCategory).map(([category, categoryTasks]) => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
              className: "act-pupil-launcher__category",
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("h4", {
                children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
                  className: "act-pupil-launcher__category-icon",
                  children: CATEGORY_ICONS[category] || CATEGORY_ICONS.default
                }), category.charAt(0).toUpperCase() + category.slice(1)]
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("div", {
                className: "act-pupil-launcher__task-list",
                children: categoryTasks.map(task => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("button", {
                  className: "act-pupil-launcher__task",
                  onClick: () => handleTaskClick(task.id),
                  disabled: isAiTourLoading,
                  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
                    className: "act-pupil-launcher__task-icon",
                    children: task.icon ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Dashicon, {
                      icon: task.icon
                    }) : '📌'
                  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("span", {
                    className: "act-pupil-launcher__task-label",
                    children: task.label
                  })]
                }, task.id))
              })]
            }, category))]
          }), activeTab === 'chat' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("div", {
            className: "act-pupil-launcher__chat",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
              className: "act-pupil-launcher__chat-hint",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Ask about the WordPress editor:', 'admin-coach-tours')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsxs)("form", {
              onSubmit: handleChatSubmit,
              children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("input", {
                ref: inputRef,
                type: "text",
                className: "act-pupil-launcher__chat-input",
                value: chatQuery,
                onChange: e => setChatQuery(e.target.value),
                placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('e.g., How do I add a gallery?', 'admin-coach-tours'),
                disabled: isAiTourLoading
              }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("button", {
                type: "submit",
                className: "act-pupil-launcher__chat-submit",
                disabled: isAiTourLoading || !chatQuery.trim(),
                children: isAiTourLoading ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generating...', 'admin-coach-tours') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Get Tour', 'admin-coach-tours')
              })]
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)("p", {
              className: "act-pupil-launcher__chat-note",
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI will create a step-by-step tour to guide you.', 'admin-coach-tours')
            })]
          })]
        })]
      })]
    })]
  });
}

/***/ },

/***/ "./assets/js/pupil/TourRunner.jsx"
/*!****************************************!*\
  !*** ./assets/js/pupil/TourRunner.jsx ***!
  \****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ TourRunner)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _CoachPanel_jsx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./CoachPanel.jsx */ "./assets/js/pupil/CoachPanel.jsx");
/* harmony import */ var _Highlighter_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Highlighter.js */ "./assets/js/pupil/Highlighter.js");
/* harmony import */ var _runtime_resolveTarget_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../runtime/resolveTarget.js */ "./assets/js/runtime/resolveTarget.js");
/* harmony import */ var _runtime_applyPreconditions_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../runtime/applyPreconditions.js */ "./assets/js/runtime/applyPreconditions.js");
/* harmony import */ var _runtime_watchCompletion_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../runtime/watchCompletion.js */ "./assets/js/runtime/watchCompletion.js");
/* harmony import */ var _runtime_waitForNextStepBlock_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../runtime/waitForNextStepBlock.js */ "./assets/js/runtime/waitForNextStepBlock.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__);
/**
 * Tour Runner Component.
 *
 * Main orchestrator for running tours in pupil mode.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */












const STORE_NAME = 'admin-coach-tours';

/**
 * Scroll an element into view, handling cross-frame scenarios.
 * When element is inside an iframe, we need to scroll both the iframe content
 * and ensure the iframe area is visible in the main window.
 *
 * @param {HTMLElement} element Element to scroll into view.
 */
function scrollElementIntoView(element) {
  if (!element) {
    return;
  }

  // Check if element is inside an iframe.
  const ownerDoc = element.ownerDocument;
  const isInIframe = ownerDoc !== document;
  if (isInIframe) {
    // First, scroll within the iframe to center the element.
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

    // Then, ensure the iframe region where the element is located
    // is visible in the main window.
    // Give the iframe scroll a moment to complete.
    setTimeout(() => {
      const iframe = document.querySelector('iframe[name="editor-canvas"]');
      if (iframe) {
        // Get the element's position relative to the iframe viewport.
        const elementRect = element.getBoundingClientRect();
        const iframeRect = iframe.getBoundingClientRect();

        // Calculate where the element is in the main window coordinate system.
        const elementTopInMain = iframeRect.top + elementRect.top;
        const elementBottomInMain = iframeRect.top + elementRect.bottom;
        const viewportHeight = window.innerHeight;

        // Check if element is fully visible in the main window.
        const isFullyVisible = elementTopInMain >= 100 && elementBottomInMain <= viewportHeight - 100;
        if (!isFullyVisible) {
          // Scroll the main window to center the element.
          const scrollTarget = elementTopInMain + window.scrollY - viewportHeight / 2;
          window.scrollTo({
            top: Math.max(0, scrollTarget),
            behavior: 'smooth'
          });
        }
      }
    }, 150);
  } else {
    // Element is in main document, simple scroll.
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });
  }
}

/**
 * Tour Runner component.
 *
 * @return {JSX.Element|null} Tour runner UI.
 */
function TourRunner() {
  console.log('[ACT TourRunner] Component function called');
  const [targetElement, setTargetElement] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [resolutionError, setResolutionError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [resolution, setResolution] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [isApplyingPreconditions, setIsApplyingPreconditions] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [repeatCounter, setRepeatCounter] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(0);
  const highlighterRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const previousStepIndexRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  const completionWatcherRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null); // Use ref to avoid stale closure in cleanup.

  // Get playback state from store.
  const {
    isPlaying,
    currentTour,
    currentStep,
    stepIndex,
    totalSteps
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useSelect)(select => {
    const store = select(STORE_NAME);
    const data = {
      // Only run in pupil mode, not educator mode.
      isPlaying: store.isPupilMode(),
      currentTour: store.getCurrentTour(),
      currentStep: store.getCurrentStep(),
      stepIndex: store.getCurrentStepIndex() || 0,
      totalSteps: store.getTotalSteps() || 0
    };
    console.log('[ACT TourRunner] useSelect:', data);
    return data;
  }, []);

  // Get dispatch actions.
  const {
    stopTour,
    nextStep,
    previousStep,
    repeatStep,
    setAiTourError,
    setLastFailureContext
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useDispatch)(STORE_NAME);

  /**
   * Initialize highlighter.
   */
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!highlighterRef.current) {
      highlighterRef.current = new _Highlighter_js__WEBPACK_IMPORTED_MODULE_4__["default"]();
    }
    return () => {
      if (highlighterRef.current) {
        highlighterRef.current.destroy();
        highlighterRef.current = null;
      }
    };
  }, []);

  /**
   * Handle step change - resolve target and apply preconditions.
   */
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    if (!isPlaying || !currentStep) {
      // Clear highlight when not playing.
      if (highlighterRef.current) {
        highlighterRef.current.clear();
      }
      setTargetElement(null);
      // Clear block tracking when tour ends.
      (0,_runtime_applyPreconditions_js__WEBPACK_IMPORTED_MODULE_6__.clearInsertedBlocks)();
      return;
    }
    let isMounted = true;
    let resolvedElement = null; // Track the resolved element locally.
    const previousStepIndex = previousStepIndexRef.current;
    const setupStep = async () => {
      setResolutionError(null);
      setIsApplyingPreconditions(true);

      // Cancel any existing completion watcher using ref (avoids stale closure).
      if (completionWatcherRef.current?.cancel) {
        console.log('[ACT TourRunner] Cancelling previous completion watcher');
        completionWatcherRef.current.cancel();
        completionWatcherRef.current = null;
      }

      // Handle step transition: leave previous step, enter new step.
      if (previousStepIndex !== null && previousStepIndex !== stepIndex) {
        await (0,_runtime_applyPreconditions_js__WEBPACK_IMPORTED_MODULE_6__.onLeaveStep)(previousStepIndex);
      }
      await (0,_runtime_applyPreconditions_js__WEBPACK_IMPORTED_MODULE_6__.onEnterStep)(stepIndex);
      previousStepIndexRef.current = stepIndex;

      // 1. Apply preconditions.
      console.log('[ACT TourRunner] Preconditions for step:', stepIndex, currentStep.preconditions);
      if (currentStep.preconditions?.length > 0) {
        console.log('[ACT TourRunner] Applying', currentStep.preconditions.length, 'preconditions');
        const preconditionResult = await (0,_runtime_applyPreconditions_js__WEBPACK_IMPORTED_MODULE_6__.applyPreconditions)(currentStep.preconditions);
        console.log('[ACT TourRunner] Precondition result:', preconditionResult);
        if (!isMounted) {
          return;
        }
        if (!preconditionResult.success) {
          console.warn('Some preconditions failed:', preconditionResult.failedPreconditions);
        }
      } else {
        console.log('[ACT TourRunner] No preconditions for this step');
      }
      setIsApplyingPreconditions(false);

      // 2. Resolve target element.
      if (currentStep.target) {
        // Try with recovery if available.
        const recoveryFn = currentStep.recovery ? async () => {
          // Execute recovery steps.
          await (0,_runtime_applyPreconditions_js__WEBPACK_IMPORTED_MODULE_6__.applyPreconditions)(currentStep.recovery);
        } : null;
        const result = await (0,_runtime_resolveTarget_js__WEBPACK_IMPORTED_MODULE_5__.resolveTargetWithRecovery)(currentStep.target, recoveryFn);
        if (!isMounted) {
          return;
        }
        if (result.success) {
          resolvedElement = result.element; // Store locally for completion watcher.
          setTargetElement(result.element);
          setResolution({
            success: true,
            usedLocator: result.usedLocator,
            recovered: result.recovered || false
          });

          // If the element is inside a block, select it in WordPress data store.
          // Check the element itself and traverse up to find parent block.
          let blockClientId = result.element.getAttribute('data-block');
          if (!blockClientId) {
            const blockWrapper = result.element.closest('[data-block]');
            if (blockWrapper) {
              blockClientId = blockWrapper.getAttribute('data-block');
              console.log('[ACT TourRunner] Found parent block:', blockClientId);
            }
          }
          if (blockClientId) {
            try {
              const blockEditorDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/block-editor');
              if (blockEditorDispatch?.selectBlock) {
                await blockEditorDispatch.selectBlock(blockClientId);
                console.log('[ACT TourRunner] Selected block:', blockClientId);
              }
            } catch (err) {
              console.warn('[ACT TourRunner] Could not select block:', err);
            }
          }

          // Scroll element into view FIRST with cross-frame support.
          scrollElementIntoView(result.element);

          // Then highlight after scroll completes (wait for smooth scroll).
          setTimeout(() => {
            if (highlighterRef.current && result.element?.isConnected) {
              highlighterRef.current.highlight(result.element);
            }
          }, 350); // Allow time for smooth scroll to finish
        } else {
          resolvedElement = null;
          setTargetElement(null);
          setResolutionError(result.error);
          setResolution({
            success: false,
            error: result.error
          });
          console.log('[ACT TourRunner] Target resolution failed, NOT auto-advancing. Error:', result.error);
          if (highlighterRef.current) {
            highlighterRef.current.clear();
          }

          // If this is a retry that also failed, consider the entire AI tour generation failed.
          // Stop the tour and show an error to the user.
          if (repeatCounter > 0) {
            console.log('[ACT TourRunner] Retry also failed. Failing the entire tour.');

            // Store failure context for contextual retry.
            setLastFailureContext({
              stepIndex,
              stepId: currentStep.id,
              stepTitle: currentStep.title,
              targetLocators: currentStep.target?.locators || [],
              error: result.error,
              reason: 'Step retry failed - target element could not be found after second attempt'
            });
            (0,_runtime_applyPreconditions_js__WEBPACK_IMPORTED_MODULE_6__.clearInsertedBlocks)();
            previousStepIndexRef.current = null;
            stopTour();
            setAiTourError((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('The generated tour could not complete. The AI may have produced incorrect steps.', 'admin-coach-tours'));
          }
        }
      }

      // 3. Set up completion watcher (use resolvedElement, not state).
      if (currentStep.completion && resolvedElement) {
        console.log('[ACT TourRunner] Setting up completion watcher for step:', stepIndex, 'type:', currentStep.completion.type, 'params:', currentStep.completion.params);

        // Small delay to ensure DOM is stable and UI is ready.
        await new Promise(r => setTimeout(r, 100));
        if (!isMounted) {
          return;
        }
        const watcher = (0,_runtime_watchCompletion_js__WEBPACK_IMPORTED_MODULE_7__.watchCompletion)(currentStep.completion, resolvedElement // Use local variable, not stale state!
        );
        completionWatcherRef.current = watcher; // Store in ref for reliable cleanup.

        // Wait for completion.
        watcher.promise.then(async completionResult => {
          if (!isMounted) {
            return;
          }
          if (completionResult.success) {
            console.log('[ACT TourRunner] Completion detected for step:', stepIndex);

            // Auto-advance if not the last step.
            if (stepIndex < totalSteps - 1) {
              // Look ahead: wait for the next step's expected block before advancing.
              const tourSteps = currentTour?.steps || [];
              const lookAheadResult = await (0,_runtime_waitForNextStepBlock_js__WEBPACK_IMPORTED_MODULE_8__.waitForNextStepBlock)(tourSteps, stepIndex, 5000);
              if (lookAheadResult.waited) {
                console.log('[ACT TourRunner] Waited for block:', lookAheadResult.blockType, 'success:', lookAheadResult.success);
              }

              // Advance after a small delay.
              setTimeout(() => {
                if (isMounted) {
                  console.log('[ACT TourRunner] Auto-advancing from step:', stepIndex);
                  nextStep();
                }
              }, 300);
            } else {
              // Last step - end the tour.
              console.log('[ACT TourRunner] Last step completed, ending tour');
              (0,_runtime_applyPreconditions_js__WEBPACK_IMPORTED_MODULE_6__.clearInsertedBlocks)();
              nextStep(); // This will end the tour since there's no next step.
            }
          }
        });
      }
    };
    setupStep();
    return () => {
      isMounted = false;
      // Use ref for cleanup to avoid stale closure.
      if (completionWatcherRef.current?.cancel) {
        console.log('[ACT TourRunner] Cleanup: Cancelling completion watcher');
        completionWatcherRef.current.cancel();
        completionWatcherRef.current = null;
      }
    };
  }, [isPlaying, currentStep, stepIndex, repeatCounter, stopTour, setAiTourError]);

  /**
   * Handle manual continue (for manual completion type or finish).
   */
  const handleContinue = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
    if (completionWatcherRef.current?.confirm) {
      completionWatcherRef.current.confirm();
    } else {
      // Look ahead: wait for next step's expected block before advancing.
      if (stepIndex < totalSteps - 1) {
        const tourSteps = currentTour?.steps || [];
        const lookAheadResult = await (0,_runtime_waitForNextStepBlock_js__WEBPACK_IMPORTED_MODULE_8__.waitForNextStepBlock)(tourSteps, stepIndex, 5000);
        if (lookAheadResult.waited) {
          console.log('[ACT TourRunner] Manual continue waited for block:', lookAheadResult.blockType);
        }
      }

      // Advance to next step (or end tour if last step).
      nextStep();
    }
  }, [nextStep, stepIndex, totalSteps, currentTour]);

  /**
   * Handle repeat step.
   */
  const handleRepeat = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    // Cancel current watcher using ref.
    if (completionWatcherRef.current?.cancel) {
      completionWatcherRef.current.cancel();
      completionWatcherRef.current = null;
    }
    // Increment counter to trigger useEffect re-run.
    setRepeatCounter(c => c + 1);
    repeatStep();
  }, [repeatStep]);

  /**
   * Handle stop tour.
   */
  const handleStop = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    // Cancel watcher using ref.
    if (completionWatcherRef.current?.cancel) {
      completionWatcherRef.current.cancel();
      completionWatcherRef.current = null;
    }
    // Clear inserted blocks tracking when tour stops.
    (0,_runtime_applyPreconditions_js__WEBPACK_IMPORTED_MODULE_6__.clearInsertedBlocks)();
    previousStepIndexRef.current = null;
    stopTour();
  }, [stopTour]);

  // Don't render if not playing.
  if (!isPlaying || !currentTour || !currentStep) {
    return null;
  }
  const panelContent = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_9__.jsx)(_CoachPanel_jsx__WEBPACK_IMPORTED_MODULE_3__["default"], {
    step: currentStep,
    stepIndex: stepIndex,
    totalSteps: totalSteps,
    tourTitle: currentTour.title,
    targetElement: targetElement,
    resolutionError: resolutionError,
    isApplyingPreconditions: isApplyingPreconditions,
    onContinue: handleContinue,
    onRepeat: handleRepeat,
    onPrevious: previousStep,
    onNext: nextStep,
    onStop: handleStop
  });

  // Render as portal at document body level.
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createPortal)(panelContent, document.body);
}

/***/ },

/***/ "./assets/js/runtime/applyPreconditions.js"
/*!*************************************************!*\
  !*** ./assets/js/runtime/applyPreconditions.js ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyPrecondition: () => (/* binding */ applyPrecondition),
/* harmony export */   applyPreconditions: () => (/* binding */ applyPreconditions),
/* harmony export */   clearInsertedBlocks: () => (/* binding */ clearInsertedBlocks),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getAvailablePreconditions: () => (/* binding */ getAvailablePreconditions),
/* harmony export */   insertedBlocks: () => (/* binding */ insertedBlocks),
/* harmony export */   onEnterStep: () => (/* binding */ onEnterStep),
/* harmony export */   onLeaveStep: () => (/* binding */ onLeaveStep),
/* harmony export */   setCurrentStepIndex: () => (/* binding */ setCurrentStepIndex)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Apply preconditions before step execution.
 *
 * Ensures the UI is in the expected state before presenting a step
 * (e.g., sidebar open, inserter closed, specific tab selected).
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */



/**
 * @typedef {import('../types/step.js').Precondition} Precondition
 */

/**
 * Wait for a selector to match an element.
 *
 * @param {string} selector CSS selector.
 * @param {number} timeout  Timeout in ms.
 * @return {Promise<HTMLElement|null>} Element or null.
 */
async function waitForSelector(selector, timeout = 2000) {
  const startTime = Date.now();
  return new Promise(resolve => {
    const check = () => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }
      if (Date.now() - startTime > timeout) {
        resolve(null);
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });
}

/**
 * Wait for a condition to be true.
 *
 * @param {Function} conditionFn Function returning boolean.
 * @param {number}   timeout     Timeout in ms.
 * @return {Promise<boolean>} True if condition met.
 */
async function waitForCondition(conditionFn, timeout = 2000) {
  const startTime = Date.now();
  return new Promise(resolve => {
    const check = () => {
      try {
        if (conditionFn()) {
          resolve(true);
          return;
        }
      } catch {
        // Condition function threw, keep trying.
      }
      if (Date.now() - startTime > timeout) {
        resolve(false);
        return;
      }
      requestAnimationFrame(check);
    };
    check();
  });
}

/**
 * Ensure we're in the block editor.
 *
 * @return {Promise<boolean>} True if in editor.
 */
async function ensureEditor() {
  // Check if we're in the block editor.
  const editorStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/block-editor');
  if (!editorStore) {
    return false;
  }

  // Wait for editor to be ready.
  return waitForCondition(() => {
    const blocks = editorStore.getBlocks?.();
    return blocks !== undefined;
  });
}

/**
 * Ensure the editor sidebar is open.
 *
 * @param {string} preferredSidebar Optional preferred sidebar ('edit-post/document', 'edit-post/block').
 * @return {Promise<boolean>} True if successful.
 */
async function ensureSidebarOpen(preferredSidebar = null) {
  const editPostStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/edit-post');
  const editPostDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/edit-post');
  if (!editPostStore || !editPostDispatch) {
    // Try interface store (newer WP versions).
    const interfaceStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/interface');
    const interfaceDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/interface');
    if (interfaceStore && interfaceDispatch) {
      const activeItem = interfaceStore.getActiveComplementaryArea?.('core/edit-post');
      if (!activeItem) {
        await interfaceDispatch.enableComplementaryArea?.('core/edit-post', preferredSidebar || 'edit-post/document');
      }
      return waitForCondition(() => {
        return !!interfaceStore.getActiveComplementaryArea?.('core/edit-post');
      });
    }
    return false;
  }

  // Check if sidebar is already open.
  const isOpen = editPostStore.isEditorSidebarOpened?.() || editPostStore.isPluginSidebarOpened?.();
  if (isOpen) {
    return true;
  }

  // Open the sidebar.
  try {
    if (preferredSidebar) {
      await editPostDispatch.openGeneralSidebar?.(preferredSidebar);
    } else {
      await editPostDispatch.openGeneralSidebar?.('edit-post/document');
    }
    return waitForCondition(() => {
      return editPostStore.isEditorSidebarOpened?.();
    });
  } catch {
    return false;
  }
}

/**
 * Ensure the editor sidebar is closed.
 *
 * @return {Promise<boolean>} True if successful.
 */
async function ensureSidebarClosed() {
  const editPostStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/edit-post');
  const editPostDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/edit-post');
  if (!editPostStore || !editPostDispatch) {
    // Try interface store.
    const interfaceStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/interface');
    const interfaceDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/interface');
    if (interfaceStore && interfaceDispatch) {
      const activeItem = interfaceStore.getActiveComplementaryArea?.('core/edit-post');
      if (activeItem) {
        await interfaceDispatch.disableComplementaryArea?.('core/edit-post');
      }
      return waitForCondition(() => {
        return !interfaceStore.getActiveComplementaryArea?.('core/edit-post');
      });
    }
    return false;
  }

  // Check if sidebar is already closed.
  const isOpen = editPostStore.isEditorSidebarOpened?.();
  if (!isOpen) {
    return true;
  }

  // Close the sidebar.
  try {
    await editPostDispatch.closeGeneralSidebar?.();
    return waitForCondition(() => {
      return !editPostStore.isEditorSidebarOpened?.();
    });
  } catch {
    return false;
  }
}

/**
 * Select a specific sidebar tab.
 *
 * @param {string} tabName Tab name ('document', 'block', or plugin sidebar name).
 * @return {Promise<boolean>} True if successful.
 */
async function selectSidebarTab(tabName) {
  const editPostDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/edit-post');
  if (!editPostDispatch) {
    return false;
  }

  // Map friendly names to sidebar identifiers.
  const tabMap = {
    document: 'edit-post/document',
    post: 'edit-post/document',
    block: 'edit-post/block'
  };
  const sidebarId = tabMap[tabName] || tabName;
  try {
    await editPostDispatch.openGeneralSidebar?.(sidebarId);

    // Wait for tab to be active.
    return waitForCondition(() => {
      const editPostStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/edit-post');
      return editPostStore?.getActiveGeneralSidebarName?.() === sidebarId;
    });
  } catch {
    return false;
  }
}

/**
 * Open the block inserter.
 *
 * @return {Promise<boolean>} True if successful.
 */
async function openInserter() {
  const editPostStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/edit-post');
  const editPostDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/edit-post');

  // Check if already open.
  if (editPostStore?.isInserterOpened?.()) {
    return true;
  }
  try {
    await editPostDispatch?.setIsInserterOpened?.(true);
    return waitForCondition(() => {
      return editPostStore?.isInserterOpened?.();
    });
  } catch {
    // Try clicking the inserter button.
    const inserterButton = document.querySelector('.edit-post-header-toolbar__inserter-toggle, ' + 'button[aria-label*="inserter"], ' + 'button[aria-label*="Add block"]');
    if (inserterButton) {
      inserterButton.click();
      return waitForSelector('.block-editor-inserter__content, .editor-inserter__content').then(el => !!el);
    }
    return false;
  }
}

/**
 * Close the block inserter.
 *
 * @return {Promise<boolean>} True if successful.
 */
async function closeInserter() {
  const editPostStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/edit-post');
  const editPostDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/edit-post');

  // Check if already closed.
  if (!editPostStore?.isInserterOpened?.()) {
    return true;
  }
  try {
    await editPostDispatch?.setIsInserterOpened?.(false);
    return waitForCondition(() => {
      return !editPostStore?.isInserterOpened?.();
    });
  } catch {
    return false;
  }
}

/**
 * Select a specific block in the editor.
 *
 * @param {string} clientId Block client ID.
 * @return {Promise<boolean>} True if successful.
 */
async function selectBlock(clientId) {
  const blockEditorDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/block-editor');
  if (!blockEditorDispatch || !clientId) {
    return false;
  }
  try {
    await blockEditorDispatch.selectBlock?.(clientId);
    return waitForCondition(() => {
      const blockEditorStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/block-editor');
      return blockEditorStore?.getSelectedBlockClientId?.() === clientId;
    });
  } catch {
    return false;
  }
}

/**
 * Focus a specific element.
 *
 * @param {string} selector CSS selector.
 * @return {Promise<boolean>} True if successful.
 */
async function focusElement(selector) {
  const element = await waitForSelector(selector);
  if (!element) {
    return false;
  }
  try {
    element.focus();
    return document.activeElement === element;
  } catch {
    return false;
  }
}

/**
 * Scroll element into view.
 *
 * @param {string} selector CSS selector.
 * @return {Promise<boolean>} True if successful.
 */
async function scrollIntoView(selector) {
  const element = await waitForSelector(selector);
  if (!element) {
    return false;
  }
  try {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

    // Wait a bit for smooth scroll.
    await new Promise(resolve => setTimeout(resolve, 300));
    return true;
  } catch {
    return false;
  }
}

/**
 * Open a modal/popover by clicking a trigger.
 *
 * @param {string} triggerSelector Trigger element selector.
 * @param {string} modalSelector   Modal element selector to wait for.
 * @return {Promise<boolean>} True if successful.
 */
async function openModal(triggerSelector, modalSelector) {
  // Check if modal is already open.
  const existingModal = document.querySelector(modalSelector);
  if (existingModal) {
    return true;
  }
  const trigger = await waitForSelector(triggerSelector);
  if (!trigger) {
    return false;
  }
  trigger.click();
  return waitForSelector(modalSelector).then(el => !!el);
}

/**
 * Global storage for blocks inserted by preconditions.
 * Used by wpBlock locator with 'inserted' value.
 * Exposed on window for cross-module access.
 *
 * Maps markerId -> clientId for direct lookups.
 */
const insertedBlocks = new Map();
window.__actInsertedBlocks = insertedBlocks;

/**
 * Track blocks inserted per step for navigation.
 * Maps stepIndex -> { markerId: clientId }
 * This allows us to reuse blocks when navigating back/forward.
 */
const insertedBlocksByStep = new Map();
let currentStepIndex = 0;

/**
 * Set the current step index for tracking.
 * Called by TourRunner when step changes.
 *
 * @param {number} stepIndex Current step index.
 */
function setCurrentStepIndex(stepIndex) {
  currentStepIndex = stepIndex;
  console.log('[ACT setCurrentStepIndex]', stepIndex);
}

/**
 * Clear blocks when leaving a step.
 * Deselects the current block but preserves inserted blocks for reuse.
 *
 * @param {number} leavingStepIndex Step index being left.
 * @return {Promise<void>}
 */
async function onLeaveStep(leavingStepIndex) {
  console.log('[ACT onLeaveStep] Leaving step:', leavingStepIndex);
  const blockEditorDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/block-editor');
  const blockEditorSelect = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/block-editor');
  if (!blockEditorDispatch || !blockEditorSelect) {
    return;
  }

  // Deselect current block when leaving.
  const selectedClientId = blockEditorSelect.getSelectedBlockClientId?.();
  if (selectedClientId) {
    try {
      await blockEditorDispatch.clearSelectedBlock?.();
      console.log('[ACT onLeaveStep] Deselected block:', selectedClientId);
    } catch (e) {
      console.warn('[ACT onLeaveStep] Could not deselect block:', e);
    }
  }
}

/**
 * Called when entering a step.
 * Reselects previously inserted blocks if returning to a step.
 *
 * @param {number} enteringStepIndex Step index being entered.
 * @return {Promise<void>}
 */
async function onEnterStep(enteringStepIndex) {
  console.log('[ACT onEnterStep] Entering step:', enteringStepIndex);
  setCurrentStepIndex(enteringStepIndex);
}

/**
 * Clear all tracking when tour ends.
 */
function clearInsertedBlocks() {
  insertedBlocks.clear();
  insertedBlocksByStep.clear();
  currentStepIndex = 0;
  // Also clear the last appeared block tracking.
  delete window.__actLastAppearedBlockClientId;
  console.log('[ACT clearInsertedBlocks] Cleared all tracking');
}

/**
 * Get previously inserted block for a step/marker combo.
 *
 * @param {number} stepIndex Step index.
 * @param {string} markerId  Marker ID.
 * @return {string|null} Block clientId or null.
 */
function getStepInsertedBlock(stepIndex, markerId) {
  const stepBlocks = insertedBlocksByStep.get(stepIndex);
  if (stepBlocks && stepBlocks[markerId]) {
    return stepBlocks[markerId];
  }
  return null;
}

/**
 * Store inserted block for a step.
 *
 * @param {number} stepIndex Step index.
 * @param {string} markerId  Marker ID.
 * @param {string} clientId  Block client ID.
 */
function setStepInsertedBlock(stepIndex, markerId, clientId) {
  if (!insertedBlocksByStep.has(stepIndex)) {
    insertedBlocksByStep.set(stepIndex, {});
  }
  insertedBlocksByStep.get(stepIndex)[markerId] = clientId;
}

/**
 * Insert a block as a precondition.
 * Creates a block with a marker so we can target it later.
 * The block will be selected and focused after insertion.
 * If returning to a step that already inserted this block, reuses it.
 *
 * @param {string} blockName Block type name (e.g., 'core/paragraph').
 * @param {Object} attributes Optional block attributes.
 * @param {string} markerId Optional marker ID for retrieval.
 * @return {Promise<boolean>} True if successful.
 */
async function insertBlock(blockName = 'core/paragraph', attributes = {}, markerId = 'act-inserted-block') {
  console.log('[ACT insertBlock] Called with:', {
    blockName,
    markerId,
    currentStepIndex
  });
  console.log('[ACT insertBlock] insertedBlocks map:', Array.from(insertedBlocks.entries()));
  console.log('[ACT insertBlock] insertedBlocksByStep:', Array.from(insertedBlocksByStep.entries()));
  try {
    const {
      createBlock
    } = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! @wordpress/blocks */ "@wordpress/blocks", 23));
    const blockEditorDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/block-editor');
    const blockEditorSelect = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/block-editor');
    if (!blockEditorDispatch || !createBlock) {
      console.warn('[ACT insertBlock] Block editor not available');
      return false;
    }

    // Check if this step already inserted a block with this marker.
    const stepClientId = getStepInsertedBlock(currentStepIndex, markerId);
    console.log('[ACT insertBlock] stepClientId from getStepInsertedBlock:', stepClientId);
    if (stepClientId) {
      const existingBlock = blockEditorSelect.getBlock(stepClientId);
      console.log('[ACT insertBlock] existingBlock from store:', existingBlock?.name);
      if (existingBlock) {
        // Block still exists, select and focus it.
        await blockEditorDispatch.selectBlock(stepClientId);
        await focusBlockElement(stepClientId);
        console.log('[ACT insertBlock] Reusing step block:', stepClientId, 'for step:', currentStepIndex);
        return true;
      }

      // Block not in store - it may have been transformed/replaced.
      // Check if DOM element still exists and get its current clientId.
      const iframe = document.querySelector('iframe[name="editor-canvas"]');
      const targetDoc = iframe?.contentDocument || document;
      const blockElement = targetDoc.querySelector(`[data-block="${stepClientId}"]`);
      if (blockElement) {
        // DOM element exists, select it.
        await blockEditorDispatch.selectBlock(stepClientId);
        await focusBlockElement(stepClientId);
        console.log('[ACT insertBlock] Block still in DOM, reusing:', stepClientId);
        return true;
      }
      console.log('[ACT insertBlock] Block not in store or DOM, checking for any existing blocks of this type');
    }

    // Fallback: check global marker map (for backwards compatibility).
    console.log('[ACT insertBlock] Checking global map for:', markerId, 'has:', insertedBlocks.has(markerId));
    if (insertedBlocks.has(markerId)) {
      const existingClientId = insertedBlocks.get(markerId);
      const existingBlock = blockEditorSelect.getBlock(existingClientId);
      console.log('[ACT insertBlock] existingBlock from global map:', existingBlock?.name);
      if (existingBlock) {
        // Block still exists, select and focus it.
        await blockEditorDispatch.selectBlock(existingClientId);
        await focusBlockElement(existingClientId);
        // Track for this step too.
        setStepInsertedBlock(currentStepIndex, markerId, existingClientId);
        console.log('[ACT insertBlock] Reusing existing block:', existingClientId);
        return true;
      }

      // Check DOM for this clientId too.
      const iframe = document.querySelector('iframe[name="editor-canvas"]');
      const targetDoc = iframe?.contentDocument || document;
      const blockElement = targetDoc.querySelector(`[data-block="${existingClientId}"]`);
      if (blockElement) {
        await blockEditorDispatch.selectBlock(existingClientId);
        await focusBlockElement(existingClientId);
        setStepInsertedBlock(currentStepIndex, markerId, existingClientId);
        console.log('[ACT insertBlock] Block from global map still in DOM:', existingClientId);
        return true;
      }
    }

    // Final fallback: check if there's already a block of the target type we can use.
    // This handles the case where the block was transformed by WordPress.
    const allBlocks = blockEditorSelect.getBlocks() || [];
    console.log('[ACT insertBlock] Checking for existing blocks of type:', blockName, 'found:', allBlocks.length, 'total blocks');
    console.log('[ACT insertBlock] Block names in editor:', allBlocks.map(b => b.name));
    const matchingBlock = allBlocks.find(b => b.name === blockName);
    if (matchingBlock) {
      console.log('[ACT insertBlock] Found existing block of same type:', matchingBlock.clientId);
      await blockEditorDispatch.selectBlock(matchingBlock.clientId);
      await focusBlockElement(matchingBlock.clientId);
      // Update tracking with new clientId.
      insertedBlocks.set(markerId, matchingBlock.clientId);
      setStepInsertedBlock(currentStepIndex, markerId, matchingBlock.clientId);
      console.log('[ACT insertBlock] Reusing existing block of type:', blockName);
      return true;
    }

    // If no exact match, try to find ANY block we can use (not empty).
    // The user may have typed in the placeholder, changing its type.
    if (allBlocks.length > 0) {
      // Find the last non-empty block, or just the last block.
      const lastBlock = allBlocks[allBlocks.length - 1];
      console.log('[ACT insertBlock] Considering last block:', lastBlock.name, lastBlock.clientId);

      // Only reuse text blocks for OTHER text block insertions.
      // Never reuse a paragraph when we need an image/video/etc.
      const textBlockTypes = ['core/paragraph', 'core/heading', 'core/list', 'core/quote'];
      const isRequestingTextBlock = textBlockTypes.includes(blockName);
      const isLastBlockText = textBlockTypes.includes(lastBlock.name);

      // Only reuse if BOTH are text blocks.
      if (isRequestingTextBlock && isLastBlockText) {
        console.log('[ACT insertBlock] Reusing last text block instead of creating new:', lastBlock.clientId);
        await blockEditorDispatch.selectBlock(lastBlock.clientId);
        await focusBlockElement(lastBlock.clientId);
        insertedBlocks.set(markerId, lastBlock.clientId);
        setStepInsertedBlock(currentStepIndex, markerId, lastBlock.clientId);
        return true;
      }
    }
    console.log('[ACT insertBlock] No existing block found, creating new one');

    // Create the block with marker in metadata.
    const blockAttributes = {
      ...attributes,
      metadata: {
        ...(attributes.metadata || {}),
        actMarkerId: markerId
      }
    };
    const block = createBlock(blockName, blockAttributes);

    // Insert at the end of the root and select it.
    const rootClientId = '';
    await blockEditorDispatch.insertBlock(block, undefined, rootClientId, true);

    // Store the clientId for later retrieval (both global and per-step).
    insertedBlocks.set(markerId, block.clientId);
    setStepInsertedBlock(currentStepIndex, markerId, block.clientId);

    // Wait for the block to appear in DOM.
    const success = await waitForCondition(() => {
      // Check in main document and iframe.
      const iframe = document.querySelector('iframe[name="editor-canvas"]');
      const iframeDoc = iframe?.contentDocument;
      const targetDoc = iframeDoc || document;
      return !!targetDoc.querySelector(`[data-block="${block.clientId}"]`);
    }, 3000);
    if (success) {
      // Ensure the block is selected (sometimes insertBlock doesn't auto-select).
      await blockEditorDispatch.selectBlock(block.clientId);

      // Focus the block element in the DOM.
      await focusBlockElement(block.clientId);
    }
    console.log('[ACT insertBlock] Inserted block:', block.clientId, 'markerId:', markerId, 'step:', currentStepIndex, 'success:', success);
    return success;
  } catch (error) {
    console.error('[ACT insertBlock] Error:', error);
    return false;
  }
}

/**
 * Focus a block element in the DOM.
 * Handles both iframed and non-iframed editors.
 *
 * @param {string} clientId Block client ID.
 * @return {Promise<boolean>} True if focused.
 */
async function focusBlockElement(clientId) {
  // Small delay to let React update the DOM.
  await new Promise(resolve => setTimeout(resolve, 100));

  // Find the block element.
  const iframe = document.querySelector('iframe[name="editor-canvas"]');
  const targetDoc = iframe?.contentDocument || document;
  const blockElement = targetDoc.querySelector(`[data-block="${clientId}"]`);
  if (!blockElement) {
    console.warn('[ACT focusBlockElement] Block element not found:', clientId);
    return false;
  }

  // Find the editable element within the block.
  const editableSelectors = ['[contenteditable="true"]', '.block-editor-rich-text__editable', 'textarea', 'input[type="text"]', 'input:not([type])'];
  let focusTarget = null;
  for (const selector of editableSelectors) {
    focusTarget = blockElement.querySelector(selector);
    if (focusTarget) {
      break;
    }
  }

  // If no editable found, focus the block itself.
  if (!focusTarget) {
    focusTarget = blockElement;
  }

  // Scroll into view and focus.
  focusTarget.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
  focusTarget.focus();

  // For contenteditable, also set selection to the end.
  if (focusTarget.getAttribute('contenteditable') === 'true') {
    const selection = targetDoc.getSelection();
    const range = targetDoc.createRange();
    range.selectNodeContents(focusTarget);
    range.collapse(false); // Collapse to end.
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  console.log('[ACT focusBlockElement] Focused:', focusTarget.tagName, focusTarget.className);
  return true;
}

/**
 * Close any open modals/popovers.
 *
 * @param {string} modalSelector Modal selector.
 * @return {Promise<boolean>} True if closed or already closed.
 */
async function closeModal(modalSelector) {
  const modal = document.querySelector(modalSelector);
  if (!modal) {
    return true;
  }

  // Try close button.
  const closeButton = modal.querySelector('button[aria-label="Close"], ' + '.components-modal__header button, ' + '.components-popover__close');
  if (closeButton) {
    closeButton.click();
    return waitForCondition(() => {
      return !document.querySelector(modalSelector);
    });
  }

  // Try pressing Escape.
  document.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    bubbles: true
  }));
  return waitForCondition(() => {
    return !document.querySelector(modalSelector);
  });
}

/**
 * Precondition handlers.
 */
const preconditionHandlers = {
  ensureEditor,
  ensureSidebarOpen,
  ensureSidebarClosed,
  selectSidebarTab,
  openInserter,
  closeInserter,
  selectBlock,
  focusElement,
  scrollIntoView,
  openModal,
  closeModal,
  insertBlock
};

/**
 * Apply a single precondition.
 *
 * @param {Precondition} precondition Precondition to apply.
 * @return {Promise<Object>} Result with success flag.
 */
async function applyPrecondition(precondition) {
  const {
    type,
    params = {}
  } = precondition;
  const handler = preconditionHandlers[type];
  if (!handler) {
    return {
      success: false,
      error: `Unknown precondition type: ${type}`,
      type
    };
  }
  try {
    // Convert params object to arguments based on type.
    let result;
    switch (type) {
      case 'ensureEditor':
        result = await handler();
        break;
      case 'ensureSidebarOpen':
        result = await handler(params.sidebar);
        break;
      case 'ensureSidebarClosed':
        result = await handler();
        break;
      case 'selectSidebarTab':
        result = await handler(params.tab);
        break;
      case 'openInserter':
      case 'closeInserter':
        result = await handler();
        break;
      case 'selectBlock':
        result = await handler(params.clientId);
        break;
      case 'focusElement':
      case 'scrollIntoView':
        result = await handler(params.selector);
        break;
      case 'openModal':
        result = await handler(params.trigger, params.modal);
        break;
      case 'closeModal':
        result = await handler(params.modal);
        break;
      case 'insertBlock':
        result = await handler(params.blockName || 'core/paragraph', params.attributes || {}, params.markerId || 'act-inserted-block');
        break;
      default:
        result = false;
    }
    return {
      success: result,
      type,
      error: result ? null : `Precondition failed: ${type}`
    };
  } catch (error) {
    return {
      success: false,
      type,
      error: `Precondition error: ${error.message}`
    };
  }
}

/**
 * Apply all preconditions for a step in order.
 *
 * @param {Precondition[]} preconditions Array of preconditions.
 * @return {Promise<Object>} Result with overall success and details.
 */
async function applyPreconditions(preconditions) {
  if (!preconditions || preconditions.length === 0) {
    return {
      success: true,
      results: []
    };
  }
  const results = [];
  let allSuccessful = true;
  for (const precondition of preconditions) {
    const result = await applyPrecondition(precondition);
    results.push(result);
    if (!result.success) {
      allSuccessful = false;
      // Continue to try other preconditions.
    }
  }
  return {
    success: allSuccessful,
    results,
    failedPreconditions: results.filter(r => !r.success)
  };
}

/**
 * Get available precondition types with descriptions.
 *
 * @return {Object[]} Array of precondition type info.
 */
function getAvailablePreconditions() {
  return [{
    type: 'ensureEditor',
    label: 'Ensure in Editor',
    description: 'Verify block editor is loaded and ready',
    params: []
  }, {
    type: 'ensureSidebarOpen',
    label: 'Open Sidebar',
    description: 'Ensure editor sidebar is open',
    params: [{
      name: 'sidebar',
      type: 'string',
      optional: true,
      description: 'Preferred sidebar (edit-post/document, edit-post/block)'
    }]
  }, {
    type: 'ensureSidebarClosed',
    label: 'Close Sidebar',
    description: 'Ensure editor sidebar is closed',
    params: []
  }, {
    type: 'selectSidebarTab',
    label: 'Select Sidebar Tab',
    description: 'Switch to specific sidebar tab',
    params: [{
      name: 'tab',
      type: 'string',
      required: true,
      description: 'Tab name (document, block, or plugin sidebar)'
    }]
  }, {
    type: 'openInserter',
    label: 'Open Inserter',
    description: 'Open the block inserter panel',
    params: []
  }, {
    type: 'closeInserter',
    label: 'Close Inserter',
    description: 'Close the block inserter panel',
    params: []
  }, {
    type: 'selectBlock',
    label: 'Select Block',
    description: 'Select a specific block by client ID',
    params: [{
      name: 'clientId',
      type: 'string',
      required: true,
      description: 'Block client ID'
    }]
  }, {
    type: 'focusElement',
    label: 'Focus Element',
    description: 'Focus a specific element',
    params: [{
      name: 'selector',
      type: 'string',
      required: true,
      description: 'CSS selector'
    }]
  }, {
    type: 'scrollIntoView',
    label: 'Scroll Into View',
    description: 'Scroll element into viewport',
    params: [{
      name: 'selector',
      type: 'string',
      required: true,
      description: 'CSS selector'
    }]
  }, {
    type: 'openModal',
    label: 'Open Modal',
    description: 'Click trigger and wait for modal',
    params: [{
      name: 'trigger',
      type: 'string',
      required: true,
      description: 'Trigger element selector'
    }, {
      name: 'modal',
      type: 'string',
      required: true,
      description: 'Modal element selector'
    }]
  }, {
    type: 'closeModal',
    label: 'Close Modal',
    description: 'Close an open modal',
    params: [{
      name: 'modal',
      type: 'string',
      required: true,
      description: 'Modal element selector'
    }]
  }, {
    type: 'insertBlock',
    label: 'Insert Block',
    description: 'Insert a block into the editor (creates targetable element)',
    params: [{
      name: 'blockName',
      type: 'string',
      optional: true,
      description: 'Block type (default: core/paragraph)'
    }, {
      name: 'attributes',
      type: 'object',
      optional: true,
      description: 'Block attributes'
    }, {
      name: 'markerId',
      type: 'string',
      optional: true,
      description: 'Marker ID for targeting with wpBlock:inserted locator'
    }]
  }];
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (applyPreconditions);

/***/ },

/***/ "./assets/js/runtime/ensureEmptyPlaceholder.js"
/*!*****************************************************!*\
  !*** ./assets/js/runtime/ensureEmptyPlaceholder.js ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   ensureEmptyPlaceholder: () => (/* binding */ ensureEmptyPlaceholder),
/* harmony export */   hasEmptyParagraph: () => (/* binding */ hasEmptyParagraph),
/* harmony export */   insertEmptyParagraph: () => (/* binding */ insertEmptyParagraph)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Ensure Empty Block Placeholder Exists.
 *
 * Checks if there's an empty paragraph block in the editor.
 * If not, inserts one so tours can use the "/" quick inserter workflow.
 *
 * @package AdminCoachTours
 * @since   0.3.1
 */



/**
 * Check if an empty paragraph block exists in the editor.
 *
 * @return {boolean} True if an empty paragraph exists.
 */
function hasEmptyParagraph() {
  try {
    const blockEditorStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/block-editor');
    if (!blockEditorStore?.getBlocks) {
      return false;
    }
    const blocks = blockEditorStore.getBlocks();
    const emptyParagraph = blocks.find(block => block.name === 'core/paragraph' && isEmptyContent(block.attributes?.content));
    return !!emptyParagraph;
  } catch (e) {
    console.warn('[ACT] Error checking for empty paragraph:', e);
    return false;
  }
}

/**
 * Check if content is considered empty.
 * Handles various empty states: undefined, null, empty string, whitespace-only,
 * and WordPress RichTextData objects.
 *
 * @param {*} content Block content attribute.
 * @return {boolean} True if content is empty.
 */
function isEmptyContent(content) {
  if (content === undefined || content === null || content === '') {
    return true;
  }
  // Handle RichText value (might be a string with only whitespace/newlines)
  if (typeof content === 'string') {
    return content.trim() === '';
  }
  // Handle RichTextData object (WordPress 6.x+)
  // RichTextData has toString(), toJSON(), and length properties
  if (typeof content === 'object' && content !== null) {
    // Check if it has a length property (RichTextData)
    if (typeof content.length === 'number') {
      return content.length === 0;
    }
    // Try toString() method
    if (typeof content.toString === 'function') {
      const str = content.toString();
      // Avoid "[object Object]" from default toString
      if (str !== '[object Object]') {
        return str.trim() === '';
      }
    }
    // Try toJSON() for serializable values
    if (typeof content.toJSON === 'function') {
      const json = content.toJSON();
      if (typeof json === 'string') {
        return json.trim() === '';
      }
    }
  }
  // Handle empty array (shouldn't happen but just in case)
  if (Array.isArray(content) && content.length === 0) {
    return true;
  }
  return false;
}

/**
 * Insert an empty paragraph block at the end of the editor content and select it.
 *
 * @return {Promise<string|null>} The clientId of the inserted block, or null on failure.
 */
async function insertEmptyParagraph() {
  try {
    const {
      createBlock
    } = await Promise.resolve(/*! import() */).then(__webpack_require__.t.bind(__webpack_require__, /*! @wordpress/blocks */ "@wordpress/blocks", 23));
    const blockEditorDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/block-editor');
    if (!blockEditorDispatch || !createBlock) {
      console.warn('[ACT] Block editor not available for inserting paragraph');
      return null;
    }

    // Create an empty paragraph block.
    const block = createBlock('core/paragraph', {
      content: ''
    });

    // Get current blocks to determine insertion position.
    const blockEditorStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/block-editor');
    const blocks = blockEditorStore?.getBlocks() || [];
    const insertIndex = blocks.length;

    // Insert at the end.
    await blockEditorDispatch.insertBlock(block, insertIndex, '', false);

    // Select the block so it becomes active and editable.
    await blockEditorDispatch.selectBlock(block.clientId);
    console.log('[ACT] Inserted and selected empty paragraph block:', block.clientId);
    return block.clientId;
  } catch (e) {
    console.error('[ACT] Error inserting empty paragraph:', e);
    return null;
  }
}

/**
 * Wait for a condition to be true, polling at intervals.
 *
 * @param {Function} conditionFn Function that returns true when condition is met.
 * @param {number}   timeout     Maximum time to wait in ms.
 * @param {number}   interval    Polling interval in ms.
 * @return {Promise<boolean>} True if condition met, false if timeout.
 */
async function waitForCondition(conditionFn, timeout = 3000, interval = 50) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    if (conditionFn()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
}

/**
 * Focus a block element in the editor.
 *
 * @param {string} clientId The block client ID.
 * @return {Promise<boolean>} True if focused successfully.
 */
async function focusBlock(clientId) {
  // Small delay to let React update the DOM.
  await new Promise(resolve => setTimeout(resolve, 100));

  // Find the block element.
  const iframe = document.querySelector('iframe[name="editor-canvas"]');
  const targetDoc = iframe?.contentDocument || document;
  const blockElement = targetDoc.querySelector(`[data-block="${clientId}"]`);
  if (!blockElement) {
    console.warn('[ACT focusBlock] Block element not found:', clientId);
    return false;
  }

  // Find the editable element within the block.
  const editableSelectors = ['[contenteditable="true"]', '.block-editor-rich-text__editable', 'textarea', 'input[type="text"]'];
  let focusTarget = null;
  for (const selector of editableSelectors) {
    focusTarget = blockElement.querySelector(selector);
    if (focusTarget) {
      break;
    }
  }

  // If no editable found, focus the block itself.
  if (!focusTarget) {
    focusTarget = blockElement;
  }

  // Scroll into view and focus.
  focusTarget.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
  focusTarget.focus();

  // For contenteditable, also set selection/cursor position.
  if (focusTarget.getAttribute('contenteditable') === 'true') {
    const selection = targetDoc.getSelection();
    const range = targetDoc.createRange();
    range.selectNodeContents(focusTarget);
    range.collapse(false); // Collapse to end.
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
  console.log('[ACT focusBlock] Focused:', focusTarget.tagName, focusTarget.className);
  return true;
}

/**
 * Ensure an empty paragraph block exists in the editor.
 *
 * If no empty paragraph exists, inserts one at the end.
 * This is needed for tours that use the "/" quick inserter workflow.
 *
 * @return {Promise<Object>} Result object with wasInserted boolean and optional clientId.
 */
async function ensureEmptyPlaceholder() {
  const exists = hasEmptyParagraph();
  if (exists) {
    // Find and select the existing empty paragraph.
    const blockEditorStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/block-editor');
    const blocks = blockEditorStore?.getBlocks() || [];
    const emptyParagraph = blocks.find(block => block.name === 'core/paragraph' && isEmptyContent(block.attributes?.content));
    if (emptyParagraph) {
      await (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.dispatch)('core/block-editor').selectBlock(emptyParagraph.clientId);
      console.log('[ACT] Selected existing empty paragraph:', emptyParagraph.clientId);
      // Focus the block element to ensure it's ready for interaction.
      await focusBlock(emptyParagraph.clientId);
    }
    return {
      wasInserted: false,
      clientId: emptyParagraph?.clientId || null
    };
  }
  console.log('[ACT] No empty paragraph found, inserting one');
  const clientId = await insertEmptyParagraph();
  if (!clientId) {
    return {
      wasInserted: false,
      clientId: null
    };
  }

  // Wait for the block element to appear in DOM (check both main doc and iframe).
  const success = await waitForCondition(() => {
    const iframe = document.querySelector('iframe[name="editor-canvas"]');
    const iframeDoc = iframe?.contentDocument;
    const targetDoc = iframeDoc || document;
    return !!targetDoc.querySelector(`[data-block="${clientId}"]`);
  }, 3000);
  if (success) {
    console.log('[ACT] Block appeared in DOM:', clientId);
    // Focus the block element to ensure it's ready for interaction.
    await focusBlock(clientId);
  } else {
    console.warn('[ACT] Block inserted but not found in DOM:', clientId);
  }
  return {
    wasInserted: true,
    clientId
  };
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ensureEmptyPlaceholder);

/***/ },

/***/ "./assets/js/runtime/gatherEditorContext.js"
/*!**************************************************!*\
  !*** ./assets/js/runtime/gatherEditorContext.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   gatherEditorContext: () => (/* binding */ gatherEditorContext)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Gather Editor Context for AI Tour Generation.
 *
 * Collects information about the current editor state to help AI
 * generate accurate tour steps with working selectors.
 *
 * @package AdminCoachTours
 * @since   0.3.0
 */



/**
 * Get visible UI elements in the editor.
 *
 * @return {Object} Information about visible UI elements.
 */
function getVisibleElements() {
  const elements = {
    inserterOpen: false,
    sidebarOpen: false,
    sidebarTab: null,
    toolbarVisible: false,
    hasSelectedBlock: false,
    selectedBlockType: null
  };
  try {
    // Check if inserter is open.
    const editorStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/editor');
    if (editorStore?.isInserterOpened) {
      elements.inserterOpen = editorStore.isInserterOpened();
    }

    // Check sidebar state.
    const editPostStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/edit-post');
    if (editPostStore?.getActiveGeneralSidebarName) {
      const sidebarName = editPostStore.getActiveGeneralSidebarName();
      elements.sidebarOpen = !!sidebarName;
      elements.sidebarTab = sidebarName || null;
    }

    // Check block selection.
    const blockEditorStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/block-editor');
    if (blockEditorStore?.getSelectedBlock) {
      const selectedBlock = blockEditorStore.getSelectedBlock();
      elements.hasSelectedBlock = !!selectedBlock;
      elements.selectedBlockType = selectedBlock?.name || null;
    }

    // Check toolbar visibility.
    elements.toolbarVisible = !!document.querySelector('.block-editor-block-toolbar');
  } catch (e) {
    console.warn('[ACT] Error getting visible elements:', e);
  }
  return elements;
}

/**
 * Get current blocks in the editor with DOM information.
 *
 * @return {Array} List of block types currently in the editor with targeting info.
 */
function getEditorBlocks() {
  try {
    const blockEditorStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/block-editor');
    if (!blockEditorStore?.getBlocks) {
      return [];
    }
    const blocks = blockEditorStore.getBlocks();
    const selectedClientId = blockEditorStore.getSelectedBlockClientId?.() || null;

    // Get the editor iframe for DOM lookups.
    const iframe = document.querySelector('iframe[name="editor-canvas"]');
    const iframeDoc = iframe?.contentDocument || null;
    return blocks.map((block, index) => {
      const blockInfo = {
        name: block.name,
        clientId: block.clientId,
        isEmpty: isBlockEmpty(block),
        isSelected: block.clientId === selectedClientId,
        order: index
      };

      // Look up the DOM element for this block to get real selectors.
      if (iframeDoc) {
        const blockEl = iframeDoc.querySelector(`[data-block="${block.clientId}"]`);
        if (blockEl) {
          blockInfo.domInfo = {
            tagName: blockEl.tagName.toLowerCase(),
            dataType: blockEl.getAttribute('data-type'),
            dataBlock: block.clientId,
            hasRichText: !!blockEl.querySelector('.block-editor-rich-text__editable'),
            // For empty paragraphs, get the editable element's info.
            editableSelector: blockEl.querySelector('.block-editor-rich-text__editable') ? `[data-block="${block.clientId}"] .block-editor-rich-text__editable` : null
          };
        }
      }
      return blockInfo;
    });
  } catch (e) {
    console.warn('[ACT] Error getting editor blocks:', e);
    return [];
  }
}

/**
 * Check if a block is empty.
 *
 * @param {Object} block Block object.
 * @return {boolean} True if block is empty.
 */
function isBlockEmpty(block) {
  if (!block) {
    return true;
  }

  // Paragraph blocks are empty if they have no content.
  if (block.name === 'core/paragraph') {
    return !block.attributes?.content || block.attributes.content === '';
  }

  // Image blocks are empty if they have no URL.
  if (block.name === 'core/image') {
    return !block.attributes?.url;
  }

  // Video blocks are empty if they have no src.
  if (block.name === 'core/video') {
    return !block.attributes?.src;
  }

  // Default to not empty.
  return false;
}

/**
 * Sample key UI elements from the page to help AI generate accurate selectors.
 *
 * @return {Object} Information about available UI elements.
 */
function sampleUIElements() {
  const samples = {
    inserterButton: null,
    publishButton: null,
    settingsButton: null,
    searchInput: null,
    emptyBlockPlaceholder: null
  };
  try {
    // Sample inserter button.
    const inserterSelectors = ['.editor-document-tools__inserter-toggle', 'button.block-editor-inserter-toggle', '[aria-label="Toggle block inserter"]'];
    for (const sel of inserterSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        samples.inserterButton = {
          selector: sel,
          ariaLabel: el.getAttribute('aria-label') || null,
          visible: isElementVisible(el)
        };
        break;
      }
    }

    // Sample publish/save button.
    const publishSelectors = ['.editor-post-publish-button', '.editor-post-save-draft'];
    for (const sel of publishSelectors) {
      const el = document.querySelector(sel);
      if (el) {
        samples.publishButton = {
          selector: sel,
          text: el.textContent?.trim() || null,
          visible: isElementVisible(el)
        };
        break;
      }
    }

    // Sample settings button.
    const settingsBtn = document.querySelector('button[aria-label="Settings"]');
    if (settingsBtn) {
      samples.settingsButton = {
        selector: 'button[aria-label="Settings"]',
        visible: isElementVisible(settingsBtn)
      };
    }

    // Sample search input in inserter (if open).
    const searchInput = document.querySelector('.components-search-control__input');
    if (searchInput) {
      samples.searchInput = {
        selector: '.components-search-control__input',
        visible: isElementVisible(searchInput)
      };
    }

    // Sample empty block placeholder (the "Type / to choose a block" element).
    // This appears in empty posts and is an important starting point.
    const placeholderSelectors = [
    // Inside the editor iframe.
    {
      selector: '.block-editor-default-block-appender__content',
      inIframe: true
    }, {
      selector: '[data-empty="true"] .block-editor-rich-text__editable',
      inIframe: true
    }, {
      selector: 'p[data-empty="true"]',
      inIframe: true
    },
    // In case it's not in iframe (older WP).
    {
      selector: '.block-editor-default-block-appender__content',
      inIframe: false
    }];
    for (const {
      selector,
      inIframe
    } of placeholderSelectors) {
      let el = null;
      if (inIframe) {
        // Try to find in editor iframe.
        const iframe = document.querySelector('iframe[name="editor-canvas"]');
        if (iframe?.contentDocument) {
          el = iframe.contentDocument.querySelector(selector);
        }
      } else {
        el = document.querySelector(selector);
      }
      if (el) {
        samples.emptyBlockPlaceholder = {
          selector,
          inIframe,
          placeholder: el.getAttribute('data-placeholder') || el.getAttribute('aria-label') || null,
          visible: true // If found, assume visible.
        };
        break;
      }
    }
  } catch (e) {
    console.warn('[ACT] Error sampling UI elements:', e);
  }
  return samples;
}

/**
 * Check if an element is visible.
 *
 * @param {Element} el DOM element.
 * @return {boolean} True if element is visible.
 */
function isElementVisible(el) {
  if (!el) {
    return false;
  }
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
}

/**
 * Gather complete editor context for AI tour generation.
 *
 * @return {Object} Editor context including blocks, UI state, and samples.
 */
function gatherEditorContext() {
  return {
    editorBlocks: getEditorBlocks(),
    visibleElements: getVisibleElements(),
    uiSamples: sampleUIElements(),
    wpVersion: window.adminCoachTours?.wpVersion || 'unknown',
    timestamp: Date.now()
  };
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (gatherEditorContext);

/***/ },

/***/ "./assets/js/runtime/resolveTarget.js"
/*!********************************************!*\
  !*** ./assets/js/runtime/resolveTarget.js ***!
  \********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   resolveTarget: () => (/* binding */ resolveTarget),
/* harmony export */   resolveTargetWithRecovery: () => (/* binding */ resolveTargetWithRecovery),
/* harmony export */   testTargetResolution: () => (/* binding */ testTargetResolution)
/* harmony export */ });
/**
 * Resolve target element using locator bundle.
 *
 * Tries locators in weighted order, applies constraints, and handles
 * disambiguation of multiple matches.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

/**
 * @typedef {import('../types/step.js').Target} Target
 * @typedef {import('../types/step.js').Locator} Locator
 * @typedef {import('../types/step.js').ResolutionResult} ResolutionResult
 */

/**
 * Get the editor iframe's document if available.
 *
 * @return {Document|null} The iframe document or null.
 */
function getEditorIframeDocument() {
  const iframe = document.querySelector('iframe[name="editor-canvas"]');
  return iframe?.contentDocument || null;
}

/**
 * Check if an element is visible.
 *
 * @param {HTMLElement} element Element to check.
 * @return {boolean} True if visible.
 */
function isElementVisible(element) {
  if (!element) {
    return false;
  }

  // Check if element is in DOM.
  if (!element.isConnected) {
    return false;
  }

  // Check computed styles.
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }

  // Check if element has dimensions.
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return false;
  }
  return true;
}

/**
 * Check if element is within the currently selected block OR the last inserted block.
 *
 * @param {HTMLElement} element Element to check.
 * @return {boolean} True if within selected/tracked block.
 */
function isWithinSelectedBlock(element) {
  const wpData = window.wp?.data;
  if (!wpData) {
    console.log('[ACT isWithinSelectedBlock] wp.data not available');
    return true; // Can't check, allow element.
  }
  const blockEditor = wpData.select('core/block-editor');
  if (!blockEditor) {
    console.log('[ACT isWithinSelectedBlock] core/block-editor not available');
    return true;
  }

  // First, try the currently selected block.
  let targetClientId = blockEditor.getSelectedBlockClientId();
  console.log('[ACT isWithinSelectedBlock] Selected block clientId:', targetClientId);

  // If no block is selected, try the last tracked block from elementAppear.
  if (!targetClientId && window.__actLastAppearedBlockClientId) {
    targetClientId = window.__actLastAppearedBlockClientId;
    console.log('[ACT isWithinSelectedBlock] Using last appeared block:', targetClientId);
  }
  if (!targetClientId) {
    console.log('[ACT isWithinSelectedBlock] No block to scope to, allowing element');
    return true; // No block to scope to, allow element.
  }

  // Find the target block's DOM element.
  const ownerDoc = element.ownerDocument || document;
  const targetBlockElement = ownerDoc.querySelector(`[data-block="${targetClientId}"]`);
  if (!targetBlockElement) {
    console.log('[ACT isWithinSelectedBlock] Target block element not found in DOM');
    return true; // Can't find block, allow element.
  }

  // Check if element is inside the target block.
  const isWithin = targetBlockElement.contains(element);
  console.log('[ACT isWithinSelectedBlock] Element within target block:', isWithin);
  return isWithin;
}

/**
 * Check if element is within a container.
 *
 * @param {HTMLElement} element           Element to check.
 * @param {string}      containerSelector Container CSS selector.
 * @return {boolean} True if within container.
 */
function isWithinContainer(element, containerSelector) {
  if (!containerSelector) {
    return true;
  }

  // Search in the element's own document (handles iframe elements).
  const ownerDoc = element.ownerDocument || document;
  const container = ownerDoc.querySelector(containerSelector);
  if (!container) {
    return false;
  }
  return container.contains(element);
}

/**
 * Find elements by CSS selector.
 *
 * @param {string}   selector CSS selector.
 * @param {Document} doc      Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByCSS(selector, doc = document) {
  try {
    return Array.from(doc.querySelectorAll(selector));
  } catch {
    return [];
  }
}

/**
 * Find elements by role and optional accessible name.
 *
 * @param {string}   value Role value, optionally with name: "role:name".
 * @param {Document} doc   Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByRole(value, doc = document) {
  const [role, name] = value.split(':').map(s => s.trim());

  // Find elements with explicit role attribute.
  const withExplicitRole = Array.from(doc.querySelectorAll(`[role="${role}"]`));

  // Find elements with implicit roles (basic mapping).
  const implicitRoleMap = {
    button: 'button, input[type="button"], input[type="submit"]',
    textbox: 'input[type="text"], input:not([type]), textarea',
    link: 'a[href]',
    checkbox: 'input[type="checkbox"]',
    radio: 'input[type="radio"]',
    listbox: 'select',
    option: 'option',
    heading: 'h1, h2, h3, h4, h5, h6',
    img: 'img[alt]',
    navigation: 'nav',
    main: 'main',
    complementary: 'aside',
    banner: 'header',
    contentinfo: 'footer',
    search: '[role="search"]',
    form: 'form',
    region: 'section[aria-label], section[aria-labelledby]',
    tab: '[role="tab"]',
    tabpanel: '[role="tabpanel"]',
    tablist: '[role="tablist"]',
    menu: '[role="menu"]',
    menuitem: '[role="menuitem"]',
    dialog: 'dialog, [role="dialog"]'
  };
  let withImplicitRole = [];
  if (implicitRoleMap[role]) {
    withImplicitRole = Array.from(doc.querySelectorAll(implicitRoleMap[role]));
  }
  const allMatches = [...withExplicitRole, ...withImplicitRole];

  // Filter by name if provided.
  if (name) {
    return allMatches.filter(el => {
      const accessibleName = getAccessibleName(el);
      return accessibleName && accessibleName.toLowerCase().includes(name.toLowerCase());
    });
  }
  return allMatches;
}

/**
 * Get accessible name for an element.
 *
 * @param {HTMLElement} element Element.
 * @return {string} Accessible name.
 */
function getAccessibleName(element) {
  // aria-label takes precedence.
  if (element.getAttribute('aria-label')) {
    return element.getAttribute('aria-label');
  }

  // aria-labelledby.
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) {
      return labelEl.textContent?.trim() || '';
    }
  }

  // For inputs, check associated label.
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
      return label.textContent?.trim() || '';
    }
  }

  // Check title attribute.
  if (element.getAttribute('title')) {
    return element.getAttribute('title');
  }

  // Fall back to text content for buttons and links.
  if (element.tagName === 'BUTTON' || element.tagName === 'A' || element.getAttribute('role') === 'button') {
    return element.textContent?.trim() || '';
  }

  // Check for value on inputs.
  if (element.tagName === 'INPUT' && element.value) {
    return element.value;
  }
  return '';
}

/**
 * Find elements by test ID (data-testid attribute).
 *
 * @param {string}   testId Test ID value.
 * @param {Document} doc    Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByTestId(testId, doc = document) {
  return Array.from(doc.querySelectorAll(`[data-testid="${testId}"]`));
}

/**
 * Find elements by data attribute.
 *
 * @param {string}   value Data attribute in format "attr:value" or just "attr".
 * @param {Document} doc   Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByDataAttribute(value, doc = document) {
  const [attr, attrValue] = value.split(':').map(s => s.trim());
  const selector = attrValue ? `[data-${attr}="${attrValue}"]` : `[data-${attr}]`;
  try {
    return Array.from(doc.querySelectorAll(selector));
  } catch {
    return [];
  }
}

/**
 * Find elements by aria-label.
 *
 * @param {string}   label Aria label text (partial match).
 * @param {Document} doc   Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByAriaLabel(label, doc = document) {
  const allWithLabel = Array.from(doc.querySelectorAll('[aria-label]'));
  return allWithLabel.filter(el => {
    const elLabel = el.getAttribute('aria-label');
    return elLabel && elLabel.toLowerCase().includes(label.toLowerCase());
  });
}

/**
 * Find elements by contextual selector (ancestor > descendant).
 *
 * @param {string}   value Contextual selector string.
 * @param {Document} doc   Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByContextual(value, doc = document) {
  // Format: "container >> target" or standard CSS.
  const parts = value.split('>>').map(s => s.trim());
  if (parts.length === 2) {
    const [containerSel, targetSel] = parts;
    const container = doc.querySelector(containerSel);
    if (!container) {
      return [];
    }
    return Array.from(container.querySelectorAll(targetSel));
  }

  // Fall back to CSS.
  return findByCSS(value);
}

/**
 * Find elements using WordPress block editor data store.
 *
 * Value formats:
 * - "first" - First block in the editor
 * - "last" - Last block in the editor
 * - "selected" - Currently selected block
 * - "type:core/paragraph" - First block of type
 * - "type:core/paragraph:2" - Third block of type (0-indexed)
 * - "nth:0" - Block at index 0
 * - "inserted" - Block inserted by insertBlock precondition (default marker)
 * - "inserted:myMarker" - Block inserted with specific marker ID
 *
 * @param {string}   value Block selector value.
 * @param {Document} doc   Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByWpBlock(value, doc = document) {
  // Check for inserted block first (uses global map from preconditions).
  if (value === 'inserted' || value.startsWith('inserted:')) {
    const markerId = value === 'inserted' ? 'act-inserted-block' : value.substring(9);
    const insertedBlocks = window.__actInsertedBlocks;
    console.log('[ACT findByWpBlock] Looking for inserted block, markerId:', markerId, 'map exists:', !!insertedBlocks, 'has key:', insertedBlocks?.has?.(markerId));
    if (insertedBlocks?.has?.(markerId)) {
      const clientId = insertedBlocks.get(markerId);
      console.log('[ACT findByWpBlock] Looking for inserted block:', markerId, 'clientId:', clientId);

      // Search in both main doc and iframe for the element.
      let element = doc.querySelector(`[data-block="${clientId}"]`);

      // If not found in provided doc, try iframe.
      if (!element) {
        const iframe = document.querySelector('iframe[name="editor-canvas"]');
        const iframeDoc = iframe?.contentDocument;
        if (iframeDoc && iframeDoc !== doc) {
          element = iframeDoc.querySelector(`[data-block="${clientId}"]`);
          console.log('[ACT findByWpBlock] Searched iframe, found:', !!element);
        }
      }

      // If still not found, try main document.
      if (!element && doc !== document) {
        element = document.querySelector(`[data-block="${clientId}"]`);
        console.log('[ACT findByWpBlock] Searched main doc, found:', !!element);
      }
      if (element) {
        console.log('[ACT findByWpBlock] Found inserted block element');
        return [element];
      }
    }
    console.log('[ACT findByWpBlock] Inserted block not found for marker:', markerId, 'Available markers:', insertedBlocks ? Array.from(insertedBlocks.keys()) : 'none');
    return [];
  }

  // Access WordPress data store.
  const wpData = window.wp?.data;
  if (!wpData) {
    console.log('[ACT findByWpBlock] wp.data not available');
    return [];
  }
  const blockEditor = wpData.select('core/block-editor');
  if (!blockEditor) {
    console.log('[ACT findByWpBlock] core/block-editor store not available');
    return [];
  }
  const blocks = blockEditor.getBlocks();
  console.log('[ACT findByWpBlock] Found', blocks.length, 'blocks in editor');
  let targetClientId = null;
  if (value === 'first') {
    targetClientId = blocks[0]?.clientId;
  } else if (value === 'last') {
    targetClientId = blocks[blocks.length - 1]?.clientId;
  } else if (value === 'selected') {
    targetClientId = blockEditor.getSelectedBlockClientId();
  } else if (value.startsWith('type:')) {
    // Find block by type, optionally with index.
    const parts = value.substring(5).split(':');
    const blockType = parts[0];
    const index = parts[1] ? parseInt(parts[1], 10) : 0;
    const matchingBlocks = blocks.filter(b => b.name === blockType);
    console.log('[ACT findByWpBlock] Looking for type:', blockType, '- found', matchingBlocks.length);
    targetClientId = matchingBlocks[index]?.clientId;
  } else if (value.startsWith('nth:')) {
    const index = parseInt(value.substring(4), 10);
    targetClientId = blocks[index]?.clientId;
  }
  if (!targetClientId) {
    console.log('[ACT findByWpBlock] No matching block found for:', value);
    return [];
  }
  console.log('[ACT findByWpBlock] Target clientId:', targetClientId);

  // Find the DOM element by data-block attribute.
  const element = doc.querySelector(`[data-block="${targetClientId}"]`);
  if (element) {
    console.log('[ACT findByWpBlock] Found element:', element.tagName);
    return [element];
  }
  console.log('[ACT findByWpBlock] Element not found in DOM');
  return [];
}

/**
 * Find elements using a locator.
 *
 * @param {Locator}  locator Locator object.
 * @param {Document} doc     Document to search in.
 * @return {HTMLElement[]} Matching elements.
 */
function findByLocator(locator, doc = document) {
  switch (locator.type) {
    case 'css':
      return findByCSS(locator.value, doc);
    case 'role':
      return findByRole(locator.value, doc);
    case 'testid':
    case 'testId':
      return findByTestId(locator.value, doc);
    case 'dataattribute':
    case 'dataAttribute':
      return findByDataAttribute(locator.value, doc);
    case 'arialabel':
    case 'ariaLabel':
      return findByAriaLabel(locator.value, doc);
    case 'contextual':
      return findByContextual(locator.value, doc);
    case 'wpBlock':
    case 'wpblock':
      return findByWpBlock(locator.value, doc);
    default:
      return [];
  }
}

/**
 * Calculate specificity score for an element based on how well it matches.
 *
 * @param {HTMLElement} element    Element to score.
 * @param {Locator}     locator    Locator used.
 * @param {Object}      constraints Target constraints.
 * @return {number} Specificity score (higher is better).
 */
function calculateSpecificity(element, locator, constraints) {
  let score = locator.weight || 50;

  // Bonus for ID-based selectors.
  if (element.id) {
    score += 20;
  }

  // Bonus for data-testid.
  if (element.getAttribute('data-testid')) {
    score += 15;
  }

  // Bonus for being within specified container.
  if (constraints?.withinContainer && isWithinContainer(element, constraints.withinContainer)) {
    score += 10;
  }

  // BIG bonus for being within the currently selected block.
  // This ensures we prefer elements in the block the user is working on.
  if (isWithinSelectedBlock(element)) {
    score += 100;
  }

  // Bonus for visibility.
  if (isElementVisible(element)) {
    score += 5;
  }
  return score;
}

/**
 * Resolve target element from a target configuration.
 *
 * @param {Target} target Target configuration.
 * @return {ResolutionResult} Resolution result.
 */
function resolveTarget(target) {
  console.log('[ACT resolveTarget] Starting resolution', target);
  if (!target || !target.locators || target.locators.length === 0) {
    console.log('[ACT resolveTarget] No locators provided');
    return {
      success: false,
      error: 'No locators provided'
    };
  }
  const constraints = target.constraints || {};
  console.log('[ACT resolveTarget] Constraints:', constraints);

  // Determine which document to search in.
  // Auto-detect iframe if withinContainer is an iframe-only selector.
  const iframeOnlyContainers = ['.editor-styles-wrapper', '.block-editor-block-list__layout'];
  const shouldSearchIframe = constraints.inEditorIframe || constraints.withinContainer && iframeOnlyContainers.includes(constraints.withinContainer);
  console.log('[ACT resolveTarget] shouldSearchIframe:', shouldSearchIframe);
  let searchDoc = document;
  if (shouldSearchIframe) {
    const iframeDoc = getEditorIframeDocument();
    console.log('[ACT resolveTarget] iframeDoc:', iframeDoc ? 'found' : 'NOT FOUND');
    if (!iframeDoc) {
      return {
        success: false,
        error: 'Editor iframe not found'
      };
    }
    searchDoc = iframeDoc;
  }

  // Sort locators by weight (descending), non-fallback first.
  const sortedLocators = [...target.locators].sort((a, b) => {
    // Non-fallback before fallback.
    if (a.fallback !== b.fallback) {
      return a.fallback ? 1 : -1;
    }
    // Higher weight first.
    return (b.weight || 50) - (a.weight || 50);
  });

  // Try non-fallback locators first.
  const primaryLocators = sortedLocators.filter(l => !l.fallback);
  const fallbackLocators = sortedLocators.filter(l => l.fallback);
  console.log('[ACT resolveTarget] Trying', primaryLocators.length, 'primary +', fallbackLocators.length, 'fallback locators');

  // Try each locator.
  for (const locator of [...primaryLocators, ...fallbackLocators]) {
    let elements = findByLocator(locator, searchDoc);
    console.log('[ACT resolveTarget] Locator', locator.type, ':', locator.value.substring(0, 50), '-> found', elements.length, 'raw matches');

    // Apply visibility constraint.
    if (constraints.visible !== false) {
      elements = elements.filter(isElementVisible);
      console.log('[ACT resolveTarget]   After visibility filter:', elements.length);
    }

    // Apply scopeToSelectedBlock constraint - only find elements within currently selected block.
    if (constraints.scopeToSelectedBlock) {
      elements = elements.filter(isWithinSelectedBlock);
      console.log('[ACT resolveTarget]   After selectedBlock filter:', elements.length);
    }

    // Apply container constraint.
    if (constraints.withinContainer) {
      elements = elements.filter(el => isWithinContainer(el, constraints.withinContainer));
      console.log('[ACT resolveTarget]   After container filter:', elements.length);
    }
    if (elements.length === 0) {
      continue;
    }

    // Handle multiple matches.
    if (elements.length === 1) {
      console.log('[ACT resolveTarget] SUCCESS! Found element with', locator.type);
      return {
        success: true,
        element: elements[0],
        usedLocator: locator
      };
    }

    // Use index constraint if provided.
    if (typeof constraints.index === 'number' && elements[constraints.index]) {
      return {
        success: true,
        element: elements[constraints.index],
        usedLocator: locator
      };
    }

    // Disambiguate by specificity score.
    console.log('[ACT resolveTarget] Multiple matches (', elements.length, '), disambiguating by specificity...');
    const scored = elements.map(el => ({
      element: el,
      score: calculateSpecificity(el, locator, constraints)
    }));
    scored.sort((a, b) => b.score - a.score);
    console.log('[ACT resolveTarget] Scores:', scored.map(s => s.score));

    // If top two have same score, it's ambiguous - but still return first.
    return {
      success: true,
      element: scored[0].element,
      usedLocator: locator
    };
  }
  console.log('[ACT resolveTarget] FAILED - No matching element found after trying all locators');
  return {
    success: false,
    error: 'No matching element found'
  };
}

/**
 * Resolve target with recovery retry.
 *
 * @param {Target}        target     Target configuration.
 * @param {Function|null} recoveryFn Optional recovery function to run before retry.
 * @return {Promise<ResolutionResult>} Resolution result.
 */
async function resolveTargetWithRecovery(target, recoveryFn = null) {
  // First attempt.
  let result = resolveTarget(target);
  if (result.success) {
    return result;
  }

  // If recovery function provided, run it and retry once.
  if (recoveryFn) {
    try {
      await recoveryFn();

      // Wait a tick for DOM updates.
      await new Promise(resolve => setTimeout(resolve, 100));

      // Retry.
      result = resolveTarget(target);
      if (result.success) {
        return {
          ...result,
          recovered: true
        };
      }
    } catch (error) {
      // Recovery failed, return original error.
      return {
        success: false,
        error: `Recovery failed: ${error.message}`
      };
    }
  }
  return result;
}

/**
 * Test if a target can be resolved (for educator UI).
 *
 * @param {Target} target Target configuration.
 * @return {Object} Test result with details.
 */
function testTargetResolution(target) {
  const result = resolveTarget(target);
  return {
    success: result.success,
    element: result.element,
    usedLocator: result.usedLocator,
    error: result.error,
    elementInfo: result.element ? {
      tagName: result.element.tagName.toLowerCase(),
      id: result.element.id || null,
      className: result.element.className || null,
      textContent: result.element.textContent?.slice(0, 50) || null,
      rect: result.element.getBoundingClientRect()
    } : null
  };
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (resolveTarget);

/***/ },

/***/ "./assets/js/runtime/waitForNextStepBlock.js"
/*!***************************************************!*\
  !*** ./assets/js/runtime/waitForNextStepBlock.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getExpectedBlockType: () => (/* binding */ getExpectedBlockType),
/* harmony export */   hasBlockOfType: () => (/* binding */ hasBlockOfType),
/* harmony export */   waitForBlock: () => (/* binding */ waitForBlock),
/* harmony export */   waitForNextStepBlock: () => (/* binding */ waitForNextStepBlock)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Wait for Next Step's Block.
 *
 * Checks if the next step in a tour expects a specific block to exist,
 * and waits for it to be present before allowing the step transition.
 *
 * @package AdminCoachTours
 * @since   0.3.1
 */



/**
 * Extract expected block type from a step's target configuration.
 *
 * @param {Object} step Step configuration.
 * @return {string|null} Block type name (e.g., 'core/image') or null.
 */
function getExpectedBlockType(step) {
  if (!step?.target) {
    return null;
  }
  const {
    target
  } = step;

  // Check if target has a blockType constraint.
  if (target.constraints?.blockType) {
    return target.constraints.blockType;
  }

  // Check locators for block-related targeting.
  const locators = target.locators || [];
  for (const locator of locators) {
    // Check for data-type attribute (block type).
    if (locator.type === 'dataAttribute' && locator.attribute === 'data-type') {
      return locator.value;
    }

    // Check for block targeting by name.
    if (locator.type === 'block' && locator.blockName) {
      return locator.blockName;
    }
  }

  // Check CSS selectors for block type hints.
  for (const locator of locators) {
    if (locator.type === 'css' && locator.value) {
      // Match patterns like [data-type="core/image"] or .wp-block-image.
      const dataTypeMatch = locator.value.match(/\[data-type=["']([^"']+)["']\]/);
      if (dataTypeMatch) {
        return dataTypeMatch[1];
      }

      // Match .wp-block-{name} patterns.
      const wpBlockMatch = locator.value.match(/\.wp-block-(\w+)/);
      if (wpBlockMatch) {
        return `core/${wpBlockMatch[1]}`;
      }
    }
  }
  return null;
}

/**
 * Check if a specific block type exists in the editor.
 *
 * @param {string} blockType Block type to check for (e.g., 'core/image').
 * @return {boolean} True if block exists.
 */
function hasBlockOfType(blockType) {
  try {
    const blockEditorStore = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)('core/block-editor');
    if (!blockEditorStore?.getBlocks) {
      return false;
    }
    const blocks = blockEditorStore.getBlocks();

    // Recursive function to search nested blocks.
    const findBlock = blockList => {
      for (const block of blockList) {
        if (block.name === blockType) {
          return true;
        }
        // Check inner blocks.
        if (block.innerBlocks?.length > 0) {
          if (findBlock(block.innerBlocks)) {
            return true;
          }
        }
      }
      return false;
    };
    return findBlock(blocks);
  } catch (e) {
    console.warn('[ACT] Error checking for block type:', e);
    return false;
  }
}

/**
 * Wait for a specific block type to appear in the editor.
 *
 * @param {string} blockType Block type to wait for.
 * @param {number} timeout   Maximum wait time in ms (default: 5000).
 * @return {Promise<{success: boolean, timedOut?: boolean}>} Result.
 */
function waitForBlock(blockType, timeout = 5000) {
  return new Promise(resolve => {
    // Check immediately.
    if (hasBlockOfType(blockType)) {
      console.log('[ACT waitForBlock] Block already exists:', blockType);
      resolve({
        success: true
      });
      return;
    }
    console.log('[ACT waitForBlock] Waiting for block:', blockType);
    let timeoutId = null;
    let unsubscribe = null;
    let isResolved = false;
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
    const complete = (success, timedOut = false) => {
      if (isResolved) {
        return;
      }
      isResolved = true;
      cleanup();
      resolve({
        success,
        timedOut
      });
    };

    // Set up timeout.
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        console.log('[ACT waitForBlock] Timeout waiting for:', blockType);
        complete(false, true);
      }, timeout);
    }

    // Subscribe to store changes.
    unsubscribe = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.subscribe)(() => {
      if (hasBlockOfType(blockType)) {
        console.log('[ACT waitForBlock] Block appeared:', blockType);
        complete(true);
      }
    });
  });
}

/**
 * Look ahead and wait for the next step's expected block before advancing.
 *
 * @param {Array}  steps       All steps in the tour.
 * @param {number} currentIndex Current step index.
 * @param {number} timeout     Maximum wait time in ms (default: 5000).
 * @return {Promise<{waited: boolean, blockType?: string, success?: boolean}>} Result.
 */
async function waitForNextStepBlock(steps, currentIndex, timeout = 5000) {
  const nextIndex = currentIndex + 1;

  // Check if there's a next step.
  if (nextIndex >= steps.length) {
    return {
      waited: false
    };
  }
  const nextStep = steps[nextIndex];
  const expectedBlockType = getExpectedBlockType(nextStep);
  if (!expectedBlockType) {
    console.log('[ACT waitForNextStepBlock] Next step does not expect a specific block');
    return {
      waited: false
    };
  }
  console.log('[ACT waitForNextStepBlock] Next step expects block:', expectedBlockType);

  // Check if block already exists.
  if (hasBlockOfType(expectedBlockType)) {
    console.log('[ACT waitForNextStepBlock] Block already exists');
    return {
      waited: false,
      blockType: expectedBlockType
    };
  }

  // Wait for the block to appear.
  const result = await waitForBlock(expectedBlockType, timeout);
  return {
    waited: true,
    blockType: expectedBlockType,
    success: result.success,
    timedOut: result.timedOut
  };
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (waitForNextStepBlock);

/***/ },

/***/ "./assets/js/runtime/watchCompletion.js"
/*!**********************************************!*\
  !*** ./assets/js/runtime/watchCompletion.js ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   getAvailableCompletions: () => (/* binding */ getAvailableCompletions),
/* harmony export */   watchCompletion: () => (/* binding */ watchCompletion)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Watch for step completion conditions.
 *
 * Monitors DOM events and @wordpress/data store changes to detect
 * when a step's completion condition is satisfied.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */



/**
 * @typedef {import('../types/step.js').Completion} Completion
 */

/**
 * Create a watcher that resolves when a condition is met.
 *
 * @param {Function} checkFn    Function that returns true when complete.
 * @param {number}   timeout    Timeout in ms (0 for no timeout).
 * @return {Promise<{success: boolean, timedOut?: boolean}>} Result.
 */
function createWatcher(checkFn, timeout = 0) {
  return new Promise(resolve => {
    let timeoutId = null;
    let checkInterval = null;
    let isResolved = false;
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (checkInterval) {
        clearInterval(checkInterval);
      }
    };
    const complete = (success, timedOut = false) => {
      if (isResolved) {
        return;
      }
      isResolved = true;
      cleanup();
      resolve({
        success,
        timedOut
      });
    };

    // Set up timeout if specified.
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        complete(false, true);
      }, timeout);
    }

    // Check periodically.
    const check = () => {
      try {
        if (checkFn()) {
          complete(true);
        }
      } catch {
        // Check function threw, continue watching.
      }
    };

    // Initial check.
    check();

    // If not immediately satisfied, poll.
    if (!isResolved) {
      checkInterval = setInterval(check, 100);
    }
  });
}

/**
 * Watch for click on target element.
 * Includes a grace period to avoid catching clicks during setup.
 *
 * @param {HTMLElement} targetElement Target element.
 * @param {Object}      options       Options.
 * @return {Promise<Object>} Completion result.
 */
function watchClickTarget(targetElement, options = {}) {
  return new Promise(resolve => {
    let isResolved = false;
    let isArmed = false; // Grace period flag.
    const {
      timeout = 0,
      gracePeriod = 300
    } = options;
    let timeoutId = null;
    const cleanup = () => {
      targetElement.removeEventListener('click', handleClick, true);
      // Also try to remove from iframe document if applicable.
      if (targetElement.ownerDocument !== document) {
        targetElement.ownerDocument.removeEventListener('click', handleClick, true);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    const handleClick = event => {
      if (isResolved) {
        return;
      }

      // Ignore clicks during grace period.
      if (!isArmed) {
        console.log('[ACT watchClickTarget] Ignoring click during grace period');
        return;
      }

      // Verify click is on target or within target.
      if (targetElement === event.target || targetElement.contains(event.target)) {
        console.log('[ACT watchClickTarget] Click detected on target:', targetElement.tagName);
        isResolved = true;
        cleanup();
        resolve({
          success: true,
          event: 'click'
        });
      }
    };

    // Add listener to the target element.
    targetElement.addEventListener('click', handleClick, {
      capture: true
    });

    // Also listen on the document (for iframe elements).
    if (targetElement.ownerDocument !== document) {
      targetElement.ownerDocument.addEventListener('click', handleClick, {
        capture: true
      });
    }

    // Arm the watcher after grace period.
    setTimeout(() => {
      isArmed = true;
      console.log('[ACT watchClickTarget] Armed after grace period, watching:', targetElement.tagName, targetElement.className);
    }, gracePeriod);
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve({
            success: false,
            timedOut: true
          });
        }
      }, timeout);
    }
  });
}

/**
 * Watch for DOM value change on target element.
 *
 * @param {HTMLElement} targetElement Target element.
 * @param {Object}      options       Options.
 * @return {Promise<Object>} Completion result.
 */
function watchDomValueChanged(targetElement, options = {}) {
  return new Promise(resolve => {
    let isResolved = false;
    const {
      timeout = 0,
      expectedValue,
      attributeName = null
    } = options;
    let timeoutId = null;
    let observer = null;
    const cleanup = () => {
      if (observer) {
        observer.disconnect();
      }
      targetElement.removeEventListener('input', handleInput);
      targetElement.removeEventListener('change', handleChange);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    const getCurrentValue = () => {
      if (attributeName) {
        return targetElement.getAttribute(attributeName);
      }

      // For form elements.
      if ('value' in targetElement) {
        return targetElement.value;
      }

      // For content editable.
      if (targetElement.isContentEditable) {
        return targetElement.textContent;
      }

      // For checkboxes/radios.
      if (targetElement.type === 'checkbox' || targetElement.type === 'radio') {
        return targetElement.checked;
      }
      return targetElement.textContent;
    };
    const initialValue = getCurrentValue();
    const checkCompletion = () => {
      const currentValue = getCurrentValue();

      // If expected value specified, check for match.
      if (expectedValue !== undefined) {
        if (currentValue === expectedValue) {
          return true;
        }
        return false;
      }

      // Otherwise, just check if value changed.
      return currentValue !== initialValue;
    };
    const complete = () => {
      if (isResolved) {
        return;
      }
      if (checkCompletion()) {
        isResolved = true;
        cleanup();
        resolve({
          success: true,
          event: 'valueChanged'
        });
      }
    };
    const handleInput = () => complete();
    const handleChange = () => complete();

    // Listen for input/change events.
    targetElement.addEventListener('input', handleInput);
    targetElement.addEventListener('change', handleChange);

    // Also use MutationObserver for attribute changes.
    observer = new MutationObserver(() => complete());
    observer.observe(targetElement, {
      attributes: true,
      characterData: true,
      subtree: true,
      childList: true
    });
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve({
            success: false,
            timedOut: true
          });
        }
      }, timeout);
    }
  });
}

/**
 * Watch for @wordpress/data store state change.
 *
 * @param {Object} options Watcher options.
 * @return {Promise<Object>} Completion result.
 */
function watchWpDataChange(options = {}) {
  const {
    storeName,
    selector,
    args = [],
    expectedValue,
    comparator = 'equals',
    timeout = 0
  } = options;
  return new Promise(resolve => {
    let isResolved = false;
    let timeoutId = null;
    let unsubscribe = null;
    const cleanup = () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    const store = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)(storeName);
    if (!store || !store[selector]) {
      resolve({
        success: false,
        error: `Invalid store or selector: ${storeName}.${selector}`
      });
      return;
    }
    const checkValue = () => {
      try {
        const currentValue = store[selector](...args);
        switch (comparator) {
          case 'equals':
            return currentValue === expectedValue;
          case 'notEquals':
            return currentValue !== expectedValue;
          case 'truthy':
            return !!currentValue;
          case 'falsy':
            return !currentValue;
          case 'contains':
            if (Array.isArray(currentValue)) {
              return currentValue.includes(expectedValue);
            }
            if (typeof currentValue === 'string') {
              return currentValue.includes(expectedValue);
            }
            return false;
          case 'greaterThan':
            return currentValue > expectedValue;
          case 'lessThan':
            return currentValue < expectedValue;
          case 'lengthEquals':
            return currentValue?.length === expectedValue;
          case 'lengthGreaterThan':
            return currentValue?.length > expectedValue;
          default:
            return currentValue === expectedValue;
        }
      } catch {
        return false;
      }
    };
    const complete = () => {
      if (isResolved) {
        return;
      }
      if (checkValue()) {
        isResolved = true;
        cleanup();
        resolve({
          success: true,
          event: 'wpDataChanged'
        });
      }
    };

    // Initial check.
    complete();

    // If not immediately satisfied, subscribe to changes.
    if (!isResolved) {
      unsubscribe = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.subscribe)(() => {
        complete();
      });
    }
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve({
            success: false,
            timedOut: true
          });
        }
      }, timeout);
    }
  });
}

/**
 * Watch for manual confirmation (user clicks continue).
 *
 * @param {Object} options Options.
 * @return {Object} Watcher with cancel capability.
 */
function createManualWatcher(options = {}) {
  const {
    timeout = 0
  } = options;
  let resolveFn = null;
  let timeoutId = null;
  let isResolved = false;
  const promise = new Promise(resolve => {
    resolveFn = resolve;
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          resolve({
            success: false,
            timedOut: true
          });
        }
      }, timeout);
    }
  });
  return {
    promise,
    confirm: () => {
      if (!isResolved) {
        isResolved = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolveFn({
          success: true,
          event: 'manual'
        });
      }
    },
    cancel: () => {
      if (!isResolved) {
        isResolved = true;
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolveFn({
          success: false,
          cancelled: true
        });
      }
    }
  };
}

/**
 * Watch for element to appear in DOM.
 * Tracks the last appeared block for scoping in subsequent steps.
 * IMPORTANT: Waits for a NEW element, not just any existing match.
 *
 * @param {string} selector CSS selector.
 * @param {Object} options  Options.
 * @return {Promise<Object>} Completion result.
 */
function watchElementAppear(selector, options = {}) {
  const {
    timeout = 0
  } = options;

  // Helper to get all matching elements with their clientIds.
  const getMatchingClientIds = () => {
    const clientIds = new Set();

    // Check main document.
    document.querySelectorAll(selector).forEach(el => {
      let clientId = el.getAttribute('data-block');
      if (!clientId) {
        const wrapper = el.closest('[data-block]');
        clientId = wrapper?.getAttribute('data-block');
      }
      if (clientId) {
        clientIds.add(clientId);
      }
    });

    // Check iframe.
    const iframe = document.querySelector('iframe[name="editor-canvas"]');
    iframe?.contentDocument?.querySelectorAll(selector).forEach(el => {
      let clientId = el.getAttribute('data-block');
      if (!clientId) {
        const wrapper = el.closest('[data-block]');
        clientId = wrapper?.getAttribute('data-block');
      }
      if (clientId) {
        clientIds.add(clientId);
      }
    });
    return clientIds;
  };

  // Capture existing elements BEFORE watching.
  const existingClientIds = getMatchingClientIds();
  console.log('[ACT watchElementAppear] Existing matches:', existingClientIds.size, 'for selector:', selector);
  return createWatcher(() => {
    // Get current matches and look for NEW ones.
    const currentClientIds = getMatchingClientIds();
    for (const clientId of currentClientIds) {
      if (!existingClientIds.has(clientId)) {
        // Found a NEW element! Store it for later retrieval.
        window.__actNewlyAppearedBlockClientId = clientId;
        console.log('[ACT watchElementAppear] NEW element appeared:', clientId);
        return true;
      }
    }
    return false;
  }, timeout).then(result => {
    // Track the block that appeared for scoping in next step.
    if (result.success && window.__actNewlyAppearedBlockClientId) {
      window.__actLastAppearedBlockClientId = window.__actNewlyAppearedBlockClientId;
      console.log('[ACT watchElementAppear] Tracked appeared block:', window.__actLastAppearedBlockClientId);
      delete window.__actNewlyAppearedBlockClientId;
    }
    return {
      ...result,
      event: result.success ? 'elementAppeared' : null
    };
  });
}

/**
 * Watch for element to disappear from DOM.
 *
 * @param {string} selector CSS selector.
 * @param {Object} options  Options.
 * @return {Promise<Object>} Completion result.
 */
function watchElementDisappear(selector, options = {}) {
  const {
    timeout = 0
  } = options;
  return createWatcher(() => {
    const element = document.querySelector(selector);
    return element === null;
  }, timeout).then(result => ({
    ...result,
    event: result.success ? 'elementDisappeared' : null
  }));
}

/**
 * Watch for a custom event to be dispatched.
 *
 * @param {string} eventName Custom event name.
 * @param {Object} options   Options.
 * @return {Promise<Object>} Completion result.
 */
function watchCustomEvent(eventName, options = {}) {
  const {
    timeout = 0,
    target = document
  } = options;
  return new Promise(resolve => {
    let isResolved = false;
    let timeoutId = null;
    const cleanup = () => {
      target.removeEventListener(eventName, handleEvent);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    const handleEvent = event => {
      if (isResolved) {
        return;
      }
      isResolved = true;
      cleanup();
      resolve({
        success: true,
        event: eventName,
        detail: event.detail
      });
    };
    target.addEventListener(eventName, handleEvent, {
      once: true
    });
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          cleanup();
          resolve({
            success: false,
            timedOut: true
          });
        }
      }, timeout);
    }
  });
}

/**
 * Create a completion watcher based on completion configuration.
 *
 * @param {Completion}       completion    Completion configuration.
 * @param {HTMLElement|null} targetElement Resolved target element (if available).
 * @return {Object} Watcher object with promise and cancel method.
 */
function watchCompletion(completion, targetElement = null) {
  if (!completion || !completion.type) {
    // Default to manual completion.
    return createManualWatcher();
  }
  const {
    type,
    params = {}
  } = completion;
  const timeout = completion.timeout || 0;
  switch (type) {
    case 'clickTarget':
      if (!targetElement) {
        return {
          promise: Promise.resolve({
            success: false,
            error: 'No target element for clickTarget'
          }),
          cancel: () => {}
        };
      }
      return {
        promise: watchClickTarget(targetElement, {
          timeout
        }),
        cancel: () => {} // Click listeners are removed when promise resolves.
      };
    case 'domValueChanged':
      if (!targetElement) {
        return {
          promise: Promise.resolve({
            success: false,
            error: 'No target element for domValueChanged'
          }),
          cancel: () => {}
        };
      }
      return {
        promise: watchDomValueChanged(targetElement, {
          timeout,
          ...params
        }),
        cancel: () => {}
      };
    case 'wpData':
      return {
        promise: watchWpDataChange({
          timeout,
          ...params
        }),
        cancel: () => {}
      };
    case 'manual':
      return createManualWatcher({
        timeout
      });
    case 'elementAppear':
      return {
        promise: watchElementAppear(params.selector, {
          timeout
        }),
        cancel: () => {}
      };
    case 'elementDisappear':
      return {
        promise: watchElementDisappear(params.selector, {
          timeout
        }),
        cancel: () => {}
      };
    case 'customEvent':
      return {
        promise: watchCustomEvent(params.eventName, {
          timeout
        }),
        cancel: () => {}
      };
    default:
      return createManualWatcher({
        timeout
      });
  }
}

/**
 * Get available completion types with descriptions.
 *
 * @return {Object[]} Array of completion type info.
 */
function getAvailableCompletions() {
  return [{
    type: 'clickTarget',
    label: 'Click Target',
    description: 'Complete when user clicks the target element',
    requiresTarget: true,
    params: []
  }, {
    type: 'domValueChanged',
    label: 'Value Changed',
    description: 'Complete when element value changes',
    requiresTarget: true,
    params: [{
      name: 'expectedValue',
      type: 'string',
      optional: true,
      description: 'Expected value (if not set, any change completes)'
    }, {
      name: 'attributeName',
      type: 'string',
      optional: true,
      description: 'Attribute to watch (defaults to value/textContent)'
    }]
  }, {
    type: 'wpData',
    label: 'Store Change',
    description: 'Complete when @wordpress/data store value changes',
    requiresTarget: false,
    params: [{
      name: 'storeName',
      type: 'string',
      required: true,
      description: 'Store name (e.g., core/block-editor)'
    }, {
      name: 'selector',
      type: 'string',
      required: true,
      description: 'Selector function name'
    }, {
      name: 'args',
      type: 'array',
      optional: true,
      description: 'Arguments for selector'
    }, {
      name: 'expectedValue',
      type: 'any',
      optional: true,
      description: 'Expected value'
    }, {
      name: 'comparator',
      type: 'string',
      optional: true,
      description: 'equals, notEquals, truthy, falsy, contains, greaterThan, lessThan'
    }]
  }, {
    type: 'manual',
    label: 'Manual',
    description: 'Complete when user clicks continue button',
    requiresTarget: false,
    params: []
  }, {
    type: 'elementAppear',
    label: 'Element Appears',
    description: 'Complete when an element appears in DOM',
    requiresTarget: false,
    params: [{
      name: 'selector',
      type: 'string',
      required: true,
      description: 'CSS selector for element'
    }]
  }, {
    type: 'elementDisappear',
    label: 'Element Disappears',
    description: 'Complete when an element is removed from DOM',
    requiresTarget: false,
    params: [{
      name: 'selector',
      type: 'string',
      required: true,
      description: 'CSS selector for element'
    }]
  }, {
    type: 'customEvent',
    label: 'Custom Event',
    description: 'Complete when a custom event is dispatched',
    requiresTarget: false,
    params: [{
      name: 'eventName',
      type: 'string',
      required: true,
      description: 'Custom event name'
    }]
  }];
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (watchCompletion);

/***/ },

/***/ "./assets/js/store/actions.js"
/*!************************************!*\
  !*** ./assets/js/store/actions.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   activatePicker: () => (/* binding */ activatePicker),
/* harmony export */   addStep: () => (/* binding */ addStep),
/* harmony export */   clearAiDraft: () => (/* binding */ clearAiDraft),
/* harmony export */   clearEphemeralTour: () => (/* binding */ clearEphemeralTour),
/* harmony export */   clearResolvedTarget: () => (/* binding */ clearResolvedTarget),
/* harmony export */   createTour: () => (/* binding */ createTour),
/* harmony export */   deactivatePicker: () => (/* binding */ deactivatePicker),
/* harmony export */   deleteStep: () => (/* binding */ deleteStep),
/* harmony export */   endTour: () => (/* binding */ endTour),
/* harmony export */   fetchTour: () => (/* binding */ fetchTour),
/* harmony export */   fetchTours: () => (/* binding */ fetchTours),
/* harmony export */   incrementResolutionAttempts: () => (/* binding */ incrementResolutionAttempts),
/* harmony export */   markStepComplete: () => (/* binding */ markStepComplete),
/* harmony export */   nextStep: () => (/* binding */ nextStep),
/* harmony export */   previousStep: () => (/* binding */ previousStep),
/* harmony export */   receiveEphemeralTour: () => (/* binding */ receiveEphemeralTour),
/* harmony export */   receiveTour: () => (/* binding */ receiveTour),
/* harmony export */   receiveTours: () => (/* binding */ receiveTours),
/* harmony export */   reorderSteps: () => (/* binding */ reorderSteps),
/* harmony export */   repeatStep: () => (/* binding */ repeatStep),
/* harmony export */   requestAiDraft: () => (/* binding */ requestAiDraft),
/* harmony export */   requestAiTour: () => (/* binding */ requestAiTour),
/* harmony export */   resetCompletion: () => (/* binding */ resetCompletion),
/* harmony export */   saveTour: () => (/* binding */ saveTour),
/* harmony export */   selectStep: () => (/* binding */ selectStep),
/* harmony export */   setAiDraftError: () => (/* binding */ setAiDraftError),
/* harmony export */   setAiDraftLoading: () => (/* binding */ setAiDraftLoading),
/* harmony export */   setAiDraftResult: () => (/* binding */ setAiDraftResult),
/* harmony export */   setAiTourError: () => (/* binding */ setAiTourError),
/* harmony export */   setAiTourLoading: () => (/* binding */ setAiTourLoading),
/* harmony export */   setCompletionSatisfied: () => (/* binding */ setCompletionSatisfied),
/* harmony export */   setCurrentStep: () => (/* binding */ setCurrentStep),
/* harmony export */   setCurrentTour: () => (/* binding */ setCurrentTour),
/* harmony export */   setLastError: () => (/* binding */ setLastError),
/* harmony export */   setLastFailureContext: () => (/* binding */ setLastFailureContext),
/* harmony export */   setMode: () => (/* binding */ setMode),
/* harmony export */   setPendingChanges: () => (/* binding */ setPendingChanges),
/* harmony export */   setRecovering: () => (/* binding */ setRecovering),
/* harmony export */   setResolvedTarget: () => (/* binding */ setResolvedTarget),
/* harmony export */   setSidebarOpen: () => (/* binding */ setSidebarOpen),
/* harmony export */   setToursError: () => (/* binding */ setToursError),
/* harmony export */   setToursLoading: () => (/* binding */ setToursLoading),
/* harmony export */   skipStep: () => (/* binding */ skipStep),
/* harmony export */   startEphemeralTour: () => (/* binding */ startEphemeralTour),
/* harmony export */   startPicking: () => (/* binding */ startPicking),
/* harmony export */   startTour: () => (/* binding */ startTour),
/* harmony export */   stopPicking: () => (/* binding */ stopPicking),
/* harmony export */   stopTour: () => (/* binding */ stopTour),
/* harmony export */   updateStep: () => (/* binding */ updateStep),
/* harmony export */   updateTour: () => (/* binding */ updateTour)
/* harmony export */ });
/* harmony import */ var _reducer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reducer */ "./assets/js/store/reducer.js");
/**
 * Store action creators.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */



/**
 * Generate a UUID v4.
 *
 * @return {string} UUID string.
 */
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
};

// ============================================================================
// Tour Loading Actions
// ============================================================================

/**
 * Set tours loading state.
 *
 * @param {boolean} isLoading Loading state.
 * @return {Object} Action object.
 */
function setToursLoading(isLoading) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_TOURS_LOADING,
    isLoading
  };
}

/**
 * Set tours error.
 *
 * @param {string|null} error Error message.
 * @return {Object} Action object.
 */
function setToursError(error) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_TOURS_ERROR,
    error
  };
}

/**
 * Receive tours from API.
 *
 * @param {Array} tours Array of tour objects.
 * @return {Object} Action object.
 */
function receiveTours(tours) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.RECEIVE_TOURS,
    tours
  };
}

/**
 * Receive a single tour.
 *
 * @param {Object} tour Tour object.
 * @return {Object} Action object.
 */
function receiveTour(tour) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.RECEIVE_TOUR,
    tour
  };
}

/**
 * Set current tour for editing (educator mode).
 * Fetches the tour if not already in the store.
 *
 * @param {number|null} tourId Tour ID or null to deselect.
 * @return {Generator} Action generator.
 */
function* setCurrentTour(tourId) {
  if (!tourId) {
    yield {
      type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_CURRENT_TOUR,
      tourId: null
    };
    return;
  }

  // First, try to fetch the tour to ensure it's in the store.
  try {
    const tour = yield {
      type: 'API_FETCH',
      request: {
        path: `/admin-coach-tours/v1/tours/${tourId}`,
        method: 'GET'
      }
    };

    // If tour exists, receive it.
    if (tour && tour.id) {
      yield receiveTour(tour);
    }
  } catch (error) {
    // Tour might not exist yet (new post). Create a placeholder.
    console.log('[ACT] Tour not found, creating placeholder for:', tourId);
    yield receiveTour({
      id: tourId,
      title: '',
      steps: [],
      status: 'draft'
    });
  }

  // Now set it as current.
  yield {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_CURRENT_TOUR,
    tourId
  };
}

/**
 * Fetch tours from REST API.
 *
 * @param {Object} args Query arguments.
 * @return {Object} Action object for control.
 */
function fetchTours(args = {}) {
  return {
    type: 'FETCH_TOURS',
    args
  };
}

/**
 * Fetch a single tour.
 *
 * @param {number} tourId Tour ID.
 * @return {Object} Action object for control.
 */
function fetchTour(tourId) {
  return {
    type: 'FETCH_TOUR',
    tourId
  };
}

/**
 * Save tour to server.
 *
 * @param {number} tourId   Tour ID.
 * @param {Object} tourData Tour data to save.
 * @return {Generator} Action generator.
 */
function* saveTour(tourId, tourData) {
  try {
    const result = yield {
      type: 'SAVE_TOUR',
      tourId,
      tourData
    };
    if (result?.id) {
      yield receiveTour(result);
    }
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new tour.
 *
 * @param {Object} data Tour data (title, description, postTypes, editors, status).
 * @return {Function} Thunk that creates tour and returns result.
 */
function* createTour(data) {
  try {
    const result = yield {
      type: 'CREATE_TOUR',
      data
    };
    if (result?.id) {
      yield receiveTour(result);
    }
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Update an existing tour.
 *
 * @param {number} tourId Tour ID.
 * @param {Object} data   Tour data to update.
 * @return {Function} Thunk that updates tour and returns result.
 */
function* updateTour(tourId, data) {
  try {
    const result = yield {
      type: 'UPDATE_TOUR',
      tourId,
      data
    };
    if (result?.id) {
      yield receiveTour(result);
    }
    return result;
  } catch (error) {
    throw error;
  }
}

// ============================================================================
// Tour Playback Actions
// ============================================================================

/**
 * Start a tour.
 *
 * @param {number} tourId Tour ID.
 * @param {string} mode   Mode ('educator' | 'pupil').
 * @return {Object} Action object.
 */
function startTour(tourId, mode = 'pupil') {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.START_TOUR,
    tourId,
    mode
  };
}

/**
 * End the current tour.
 *
 * @return {Object} Action object.
 */
function endTour() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.END_TOUR
  };
}

/**
 * Alias for endTour - stop the current tour.
 *
 * @return {Object} Action object.
 */
function stopTour() {
  return endTour();
}

/**
 * Set current step by index.
 *
 * @param {number} stepIndex Step index.
 * @return {Object} Action object.
 */
function setCurrentStep(stepIndex) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_CURRENT_STEP,
    stepIndex
  };
}

/**
 * Go to next step.
 *
 * @return {Object} Action object.
 */
function nextStep() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.NEXT_STEP
  };
}

/**
 * Go to previous step.
 *
 * @return {Object} Action object.
 */
function previousStep() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.PREVIOUS_STEP
  };
}

/**
 * Skip current step.
 *
 * @return {Object} Action object.
 */
function skipStep() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SKIP_STEP
  };
}

/**
 * Repeat current step.
 *
 * @return {Object} Action object.
 */
function repeatStep() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.REPEAT_STEP
  };
}

// ============================================================================
// Mode Management Actions
// ============================================================================

/**
 * Set current mode.
 *
 * @param {string|null} mode Mode ('educator' | 'pupil' | null).
 * @return {Object} Action object.
 */
function setMode(mode) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_MODE,
    mode
  };
}

// ============================================================================
// Completion Actions
// ============================================================================

/**
 * Set completion satisfied state.
 *
 * @param {boolean} satisfied Whether completion is satisfied.
 * @return {Object} Action object.
 */
function setCompletionSatisfied(satisfied) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_COMPLETION_SATISFIED,
    satisfied
  };
}

/**
 * Reset completion state.
 *
 * @return {Object} Action object.
 */
function resetCompletion() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.RESET_COMPLETION
  };
}

/**
 * Mark step as complete and auto-advance.
 *
 * Sets completion satisfied and moves to next step.
 *
 * @return {Object} Action object (next step).
 */
function markStepComplete() {
  // This is just an alias for nextStep - the completion watcher
  // handles the logic, this just triggers the advance.
  return nextStep();
}

// ============================================================================
// Target Resolution Actions
// ============================================================================

/**
 * Set resolved target element info.
 *
 * @param {Object} target Target resolution result.
 * @return {Object} Action object.
 */
function setResolvedTarget(target) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_RESOLVED_TARGET,
    target
  };
}

/**
 * Clear resolved target.
 *
 * @return {Object} Action object.
 */
function clearResolvedTarget() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.CLEAR_RESOLVED_TARGET
  };
}

/**
 * Set recovering state.
 *
 * @param {boolean} isRecovering Recovery state.
 * @return {Object} Action object.
 */
function setRecovering(isRecovering) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_RECOVERING,
    isRecovering
  };
}

/**
 * Increment resolution attempts counter.
 *
 * @return {Object} Action object.
 */
function incrementResolutionAttempts() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.INCREMENT_RESOLUTION_ATTEMPTS
  };
}

/**
 * Set last error message.
 *
 * @param {string|null} error Error message.
 * @return {Object} Action object.
 */
function setLastError(error) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_LAST_ERROR,
    error
  };
}

// ============================================================================
// Educator Mode Actions
// ============================================================================

/**
 * Activate element picker.
 *
 * @param {string|null} stepId Optional step ID if repicking for existing step.
 * @return {Object} Action object.
 */
function activatePicker(stepId = null) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.ACTIVATE_PICKER,
    stepId
  };
}

/**
 * Start picking an element (alias for activatePicker).
 *
 * @param {string|null} stepId Optional step ID if repicking for existing step.
 * @return {Object} Action object.
 */
function startPicking(stepId = null) {
  return activatePicker(stepId);
}

/**
 * Deactivate element picker.
 *
 * @return {Object} Action object.
 */
function deactivatePicker() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.DEACTIVATE_PICKER
  };
}

/**
 * Stop picking (alias for deactivatePicker).
 *
 * @return {Object} Action object.
 */
function stopPicking() {
  return deactivatePicker();
}

/**
 * Select a step for editing.
 *
 * @param {string|null} stepId Step ID.
 * @return {Object} Action object.
 */
function selectStep(stepId) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SELECT_STEP,
    stepId
  };
}

/**
 * Set pending changes flag.
 *
 * @param {boolean} pending Has pending changes.
 * @return {Object} Action object.
 */
function setPendingChanges(pending) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_PENDING_CHANGES,
    pending
  };
}

/**
 * Update a step.
 *
 * @param {number} tourId  Tour ID.
 * @param {string} stepId  Step ID.
 * @param {Object} updates Updates to apply.
 * @return {Generator} Action generator.
 */
function* updateStep(tourId, stepId, updates) {
  yield {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.UPDATE_STEP,
    tourId,
    stepId,
    updates
  };
}

/**
 * Add a new step.
 *
 * @param {number}      tourId Tour ID.
 * @param {Object}      step   Step data (without id/order).
 * @param {number|null} index  Insert position.
 * @return {Generator} Action generator.
 */
function* addStep(tourId, step = {}, index = null) {
  const newStep = {
    id: generateId(),
    order: 0,
    title: '',
    instruction: '',
    hint: '',
    target: {
      locators: [],
      constraints: {
        visible: true
      }
    },
    preconditions: [],
    completion: {
      type: 'manual'
    },
    recovery: [{
      action: 'reapplyPreconditions',
      timeout: 1000
    }],
    tags: [],
    version: 1,
    ...step
  };
  yield {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.ADD_STEP,
    tourId,
    step: newStep,
    index
  };
}

/**
 * Delete a step.
 *
 * @param {number} tourId Tour ID.
 * @param {string} stepId Step ID.
 * @return {Generator} Action generator.
 */
function* deleteStep(tourId, stepId) {
  yield {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.DELETE_STEP,
    tourId,
    stepId
  };
}

/**
 * Reorder steps.
 *
 * @param {number}   tourId  Tour ID.
 * @param {string[]} stepIds Ordered step IDs.
 * @return {Generator} Action generator.
 */
function* reorderSteps(tourId, stepIds) {
  yield {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.REORDER_STEPS,
    tourId,
    stepIds
  };
}

// ============================================================================
// AI Drafting Actions
// ============================================================================

/**
 * Set AI draft loading state.
 *
 * @param {boolean} isLoading Loading state.
 * @return {Object} Action object.
 */
function setAiDraftLoading(isLoading) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_AI_DRAFT_LOADING,
    isLoading
  };
}

/**
 * Set AI draft error.
 *
 * @param {string|null} error Error message.
 * @return {Object} Action object.
 */
function setAiDraftError(error) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_AI_DRAFT_ERROR,
    error
  };
}

/**
 * Set AI draft result.
 *
 * @param {Object} result AI draft output.
 * @return {Object} Action object.
 */
function setAiDraftResult(result) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_AI_DRAFT_RESULT,
    result
  };
}

/**
 * Clear AI draft state.
 *
 * @return {Object} Action object.
 */
function clearAiDraft() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.CLEAR_AI_DRAFT
  };
}

/**
 * Request AI to draft step.
 *
 * @param {Object} elementContext Element context for AI.
 * @param {string} postType       Current post type.
 * @return {Generator} Generator that handles AI draft request.
 */
function* requestAiDraft(elementContext, postType) {
  // Set loading state.
  yield setAiDraftLoading(true);
  yield setAiDraftError(null);
  try {
    const result = yield {
      type: 'REQUEST_AI_DRAFT',
      elementContext,
      postType
    };
    yield setAiDraftResult(result);
    return result;
  } catch (error) {
    yield setAiDraftError(error.message || 'Failed to generate AI draft');
    throw error;
  } finally {
    yield setAiDraftLoading(false);
  }
}

// ============================================================================
// UI Actions
// ============================================================================

/**
 * Set sidebar open state.
 *
 * @param {boolean} isOpen Sidebar open state.
 * @return {Object} Action object.
 */
function setSidebarOpen(isOpen) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_SIDEBAR_OPEN,
    isOpen
  };
}

// ============================================================================
// AI Tour Generation Actions (Pupil Mode)
// ============================================================================

/**
 * Set AI tour loading state.
 *
 * @param {boolean} isLoading Loading state.
 * @return {Object} Action object.
 */
function setAiTourLoading(isLoading) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_AI_TOUR_LOADING,
    isLoading
  };
}

/**
 * Set AI tour error.
 *
 * @param {string|null} error Error message.
 * @return {Object} Action object.
 */
function setAiTourError(error) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_AI_TOUR_ERROR,
    error
  };
}

/**
 * Set last failure context for contextual retry.
 *
 * @param {Object|null} failureContext Context about the failure (step, selector, error).
 * @return {Object} Action object.
 */
function setLastFailureContext(failureContext) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.SET_LAST_FAILURE_CONTEXT,
    failureContext
  };
}

/**
 * Receive an ephemeral tour from AI.
 *
 * @param {Object} tour Generated tour object.
 * @return {Object} Action object.
 */
function receiveEphemeralTour(tour) {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.RECEIVE_EPHEMERAL_TOUR,
    tour
  };
}

/**
 * Clear ephemeral tour.
 *
 * @return {Object} Action object.
 */
function clearEphemeralTour() {
  return {
    type: _reducer__WEBPACK_IMPORTED_MODULE_0__.ACTION_TYPES.CLEAR_EPHEMERAL_TOUR
  };
}

/**
 * Request AI to generate a tour.
 *
 * @param {string}      taskId         Predefined task ID (optional).
 * @param {string}      query          Freeform user query (optional).
 * @param {string}      postType       Current post type.
 * @param {Object|null} failureContext Context from a previous failed attempt (for retry).
 * @return {Generator} Generator that handles AI tour generation.
 */
function* requestAiTour(taskId, query, postType, failureContext = null) {
  // Set loading state.
  yield setAiTourLoading(true);
  yield setAiTourError(null);
  try {
    // Gather editor context to help AI generate accurate selectors.
    const editorContext = yield {
      type: 'GATHER_EDITOR_CONTEXT'
    };
    const result = yield {
      type: 'REQUEST_AI_TOUR',
      taskId,
      query,
      postType,
      editorContext,
      failureContext
    };
    console.log('[ACT AI Response] Full result:', result);
    console.log('[ACT AI Response] Tour:', JSON.stringify(result.tour, null, 2));

    // Add an ID to the ephemeral tour.
    const tour = {
      id: 'ephemeral',
      ...result.tour
    };
    yield receiveEphemeralTour(tour);

    // Ensure an empty block placeholder exists for "/" quick inserter tours.
    yield {
      type: 'ENSURE_EMPTY_PLACEHOLDER'
    };

    // Automatically start the tour.
    yield startTour('ephemeral', 'pupil');
    return tour;
  } catch (error) {
    yield setAiTourError(error.message || 'Failed to generate tour');
    throw error;
  } finally {
    yield setAiTourLoading(false);
  }
}

/**
 * Start an ephemeral tour directly (for pre-loaded tours).
 *
 * @param {Object} tour Tour object with title and steps.
 * @return {Generator} Generator that sets up and starts the tour.
 */
function* startEphemeralTour(tour) {
  // Add ID if not present.
  const tourWithId = {
    id: 'ephemeral',
    ...tour
  };
  yield receiveEphemeralTour(tourWithId);

  // Ensure an empty block placeholder exists for "/" quick inserter tours.
  yield {
    type: 'ENSURE_EMPTY_PLACEHOLDER'
  };
  yield startTour('ephemeral', 'pupil');
}

/***/ },

/***/ "./assets/js/store/controls.js"
/*!*************************************!*\
  !*** ./assets/js/store/controls.js ***!
  \*************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _runtime_gatherEditorContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../runtime/gatherEditorContext */ "./assets/js/runtime/gatherEditorContext.js");
/* harmony import */ var _runtime_ensureEmptyPlaceholder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../runtime/ensureEmptyPlaceholder */ "./assets/js/runtime/ensureEmptyPlaceholder.js");
/**
 * Store controls for side effects.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */





/**
 * Control handlers.
 */
const controls = {
  /**
   * Handle API fetch requests.
   *
   * @param {Object} action Action with request config.
   * @return {Promise} API response.
   */
  API_FETCH(action) {
    return _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()(action.request);
  },
  /**
   * Gather editor context for AI tour generation.
   *
   * @return {Object} Editor context including blocks and UI state.
   */
  GATHER_EDITOR_CONTEXT() {
    return (0,_runtime_gatherEditorContext__WEBPACK_IMPORTED_MODULE_1__.gatherEditorContext)();
  },
  /**
   * Ensure an empty block placeholder exists for "/" quick inserter tours.
   *
   * @return {Promise<Object>} Result with wasInserted and clientId.
   */
  ENSURE_EMPTY_PLACEHOLDER() {
    return (0,_runtime_ensureEmptyPlaceholder__WEBPACK_IMPORTED_MODULE_2__.ensureEmptyPlaceholder)();
  },
  /**
   * Handle tour fetch requests.
   *
   * @param {Object} action Action with tourId.
   * @return {Promise} API response.
   */
  FETCH_TOUR(action) {
    return _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/admin-coach-tours/v1/tours/${action.tourId}`,
      method: 'GET'
    });
  },
  /**
   * Handle tours list fetch.
   *
   * @param {Object} action Action with args.
   * @return {Promise} API response.
   */
  FETCH_TOURS(action) {
    const params = new URLSearchParams();
    if (action.args.postType) {
      params.append('post_type', action.args.postType);
    }
    if (action.args.editor) {
      params.append('editor', action.args.editor);
    }
    const query = params.toString();
    const path = `/admin-coach-tours/v1/tours${query ? `?${query}` : ''}`;
    return _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path,
      method: 'GET'
    });
  },
  /**
   * Handle tour save requests.
   *
   * @param {Object} action Action with tourId and tourData.
   * @return {Promise} API response.
   */
  SAVE_TOUR(action) {
    console.log('[ACT Controls] SAVE_TOUR:', action.tourId, action.tourData);
    console.log('[ACT Controls] Steps count:', action.tourData?.steps?.length);
    return _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/admin-coach-tours/v1/tours/${action.tourId}`,
      method: 'PUT',
      data: action.tourData
    });
  },
  /**
   * Handle tour creation.
   *
   * @param {Object} action Action with tour data.
   * @return {Promise} API response with created tour.
   */
  CREATE_TOUR(action) {
    return _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/admin-coach-tours/v1/tours',
      method: 'POST',
      data: action.data
    });
  },
  /**
   * Handle tour update.
   *
   * @param {Object} action Action with tourId and data.
   * @return {Promise} API response with updated tour.
   */
  UPDATE_TOUR(action) {
    return _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: `/admin-coach-tours/v1/tours/${action.tourId}`,
      method: 'PUT',
      data: action.data
    });
  },
  /**
   * Handle AI draft requests.
   *
   * @param {Object} action Action with element context.
   * @return {Promise} API response.
   */
  REQUEST_AI_DRAFT(action) {
    return _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/admin-coach-tours/v1/ai/generate-draft',
      method: 'POST',
      data: {
        elementContext: action.elementContext,
        postType: action.postType
      }
    });
  },
  /**
   * Handle AI tour generation requests.
   *
   * @param {Object} action Action with taskId, query, postType, editorContext, and optional failureContext.
   * @return {Promise} API response with generated tour.
   */
  REQUEST_AI_TOUR(action) {
    return _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/admin-coach-tours/v1/ai/generate-tour',
      method: 'POST',
      data: {
        taskId: action.taskId,
        query: action.query,
        postType: action.postType,
        editorContext: action.editorContext || null,
        failureContext: action.failureContext || null
      }
    });
  },
  /**
   * Fetch available AI tasks.
   *
   * @return {Promise} API response with available tasks.
   */
  FETCH_AI_TASKS() {
    return _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default()({
      path: '/admin-coach-tours/v1/ai/tasks',
      method: 'GET'
    });
  }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (controls);

/***/ },

/***/ "./assets/js/store/index.js"
/*!**********************************!*\
  !*** ./assets/js/store/index.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_STATE: () => (/* reexport safe */ _reducer__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_STATE),
/* harmony export */   STORE_NAME: () => (/* binding */ STORE_NAME),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _reducer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reducer */ "./assets/js/store/reducer.js");
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./actions */ "./assets/js/store/actions.js");
/* harmony import */ var _selectors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./selectors */ "./assets/js/store/selectors.js");
/* harmony import */ var _resolvers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./resolvers */ "./assets/js/store/resolvers.js");
/* harmony import */ var _controls__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./controls */ "./assets/js/store/controls.js");
/**
 * Admin Coach Tours - WordPress data store.
 *
 * Central state management for tour playback, editing, and UI state.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */








/**
 * Store name constant.
 */
const STORE_NAME = 'admin-coach-tours';

/**
 * Create the Redux store.
 */
const store = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.createReduxStore)(STORE_NAME, {
  reducer: _reducer__WEBPACK_IMPORTED_MODULE_1__["default"],
  actions: _actions__WEBPACK_IMPORTED_MODULE_2__,
  selectors: _selectors__WEBPACK_IMPORTED_MODULE_3__,
  resolvers: _resolvers__WEBPACK_IMPORTED_MODULE_4__,
  controls: _controls__WEBPACK_IMPORTED_MODULE_5__["default"],
  initialState: _reducer__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_STATE
});

/**
 * Register the store with WordPress (only if not already registered).
 */
if (!(0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.select)(STORE_NAME)) {
  (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.register)(store);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (store);


/***/ },

/***/ "./assets/js/store/reducer.js"
/*!************************************!*\
  !*** ./assets/js/store/reducer.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ACTION_TYPES: () => (/* binding */ ACTION_TYPES),
/* harmony export */   DEFAULT_STATE: () => (/* binding */ DEFAULT_STATE),
/* harmony export */   "default": () => (/* binding */ reducer)
/* harmony export */ });
/**
 * Store reducer.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

/**
 * Default state for the store.
 */
const DEFAULT_STATE = {
  // Tour data.
  tours: {},
  toursLoading: false,
  toursError: null,
  // Current tour state.
  currentTourId: null,
  currentStepIndex: 0,
  // Mode: 'educator' | 'pupil' | null.
  mode: null,
  // Completion tracking.
  completionSatisfied: false,
  skippedSteps: [],
  // Educator mode state.
  isPickerActive: false,
  pickingStepId: null,
  selectedStepId: null,
  pendingChanges: false,
  // Pupil mode state.
  tourProgress: {},
  isRecovering: false,
  lastError: null,
  // Target resolution.
  resolvedTarget: null,
  resolutionAttempts: 0,
  // UI state.
  sidebarOpen: false,
  aiDraftLoading: false,
  aiDraftError: null,
  aiDraftResult: null,
  // AI tour generation (pupil mode).
  aiTourLoading: false,
  aiTourError: null,
  ephemeralTour: null,
  lastFailureContext: null
};

/**
 * Action types.
 */
const ACTION_TYPES = {
  // Tour loading.
  SET_TOURS_LOADING: 'SET_TOURS_LOADING',
  SET_TOURS_ERROR: 'SET_TOURS_ERROR',
  RECEIVE_TOURS: 'RECEIVE_TOURS',
  RECEIVE_TOUR: 'RECEIVE_TOUR',
  // Tour selection/editing.
  SET_CURRENT_TOUR: 'SET_CURRENT_TOUR',
  // Tour playback.
  START_TOUR: 'START_TOUR',
  END_TOUR: 'END_TOUR',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  NEXT_STEP: 'NEXT_STEP',
  PREVIOUS_STEP: 'PREVIOUS_STEP',
  SKIP_STEP: 'SKIP_STEP',
  REPEAT_STEP: 'REPEAT_STEP',
  // Mode management.
  SET_MODE: 'SET_MODE',
  // Completion.
  SET_COMPLETION_SATISFIED: 'SET_COMPLETION_SATISFIED',
  RESET_COMPLETION: 'RESET_COMPLETION',
  // Target resolution.
  SET_RESOLVED_TARGET: 'SET_RESOLVED_TARGET',
  CLEAR_RESOLVED_TARGET: 'CLEAR_RESOLVED_TARGET',
  SET_RECOVERING: 'SET_RECOVERING',
  INCREMENT_RESOLUTION_ATTEMPTS: 'INCREMENT_RESOLUTION_ATTEMPTS',
  SET_LAST_ERROR: 'SET_LAST_ERROR',
  // Educator mode.
  ACTIVATE_PICKER: 'ACTIVATE_PICKER',
  DEACTIVATE_PICKER: 'DEACTIVATE_PICKER',
  SELECT_STEP: 'SELECT_STEP',
  SET_PENDING_CHANGES: 'SET_PENDING_CHANGES',
  UPDATE_STEP: 'UPDATE_STEP',
  ADD_STEP: 'ADD_STEP',
  DELETE_STEP: 'DELETE_STEP',
  REORDER_STEPS: 'REORDER_STEPS',
  // AI drafting.
  SET_AI_DRAFT_LOADING: 'SET_AI_DRAFT_LOADING',
  SET_AI_DRAFT_ERROR: 'SET_AI_DRAFT_ERROR',
  SET_AI_DRAFT_RESULT: 'SET_AI_DRAFT_RESULT',
  CLEAR_AI_DRAFT: 'CLEAR_AI_DRAFT',
  // UI.
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  // Ephemeral AI tours.
  SET_AI_TOUR_LOADING: 'SET_AI_TOUR_LOADING',
  RECEIVE_EPHEMERAL_TOUR: 'RECEIVE_EPHEMERAL_TOUR',
  SET_AI_TOUR_ERROR: 'SET_AI_TOUR_ERROR',
  CLEAR_EPHEMERAL_TOUR: 'CLEAR_EPHEMERAL_TOUR',
  SET_LAST_FAILURE_CONTEXT: 'SET_LAST_FAILURE_CONTEXT'
};

/**
 * Main reducer function.
 *
 * @param {Object} state  Current state.
 * @param {Object} action Action object.
 * @return {Object} New state.
 */
function reducer(state = DEFAULT_STATE, action) {
  switch (action.type) {
    // Tour loading.
    case ACTION_TYPES.SET_TOURS_LOADING:
      return {
        ...state,
        toursLoading: action.isLoading
      };
    case ACTION_TYPES.SET_TOURS_ERROR:
      return {
        ...state,
        toursError: action.error,
        toursLoading: false
      };
    case ACTION_TYPES.RECEIVE_TOURS:
      return {
        ...state,
        tours: action.tours.reduce((acc, tour) => {
          acc[tour.id] = tour;
          return acc;
        }, {
          ...state.tours
        }),
        toursLoading: false,
        toursError: null
      };
    case ACTION_TYPES.RECEIVE_TOUR:
      return {
        ...state,
        tours: {
          ...state.tours,
          [action.tour.id]: action.tour
        },
        toursLoading: false
      };

    // Tour selection for editing.
    case ACTION_TYPES.SET_CURRENT_TOUR:
      return {
        ...state,
        currentTourId: action.tourId,
        currentStepIndex: 0,
        mode: action.tourId ? 'educator' : null,
        selectedStepId: null
      };

    // Tour playback.
    case ACTION_TYPES.START_TOUR:
      return {
        ...state,
        currentTourId: action.tourId,
        currentStepIndex: 0,
        mode: action.mode || 'pupil',
        completionSatisfied: false,
        skippedSteps: [],
        lastError: null,
        resolutionAttempts: 0
      };
    case ACTION_TYPES.END_TOUR:
      return {
        ...state,
        currentTourId: null,
        currentStepIndex: 0,
        mode: null,
        completionSatisfied: false,
        resolvedTarget: null,
        isRecovering: false,
        lastError: null
      };
    case ACTION_TYPES.SET_CURRENT_STEP:
      return {
        ...state,
        currentStepIndex: action.stepIndex,
        completionSatisfied: false,
        resolvedTarget: null,
        resolutionAttempts: 0,
        lastError: null
      };
    case ACTION_TYPES.NEXT_STEP:
      {
        const tour = state.tours[state.currentTourId];
        const nextIndex = state.currentStepIndex + 1;
        const hasMore = tour && nextIndex < tour.steps.length;
        if (!hasMore) {
          // Tour complete.
          return {
            ...state,
            currentTourId: null,
            currentStepIndex: 0,
            mode: null,
            completionSatisfied: false,
            resolvedTarget: null
          };
        }
        return {
          ...state,
          currentStepIndex: nextIndex,
          completionSatisfied: false,
          resolvedTarget: null,
          resolutionAttempts: 0,
          lastError: null
        };
      }
    case ACTION_TYPES.PREVIOUS_STEP:
      return {
        ...state,
        currentStepIndex: Math.max(0, state.currentStepIndex - 1),
        completionSatisfied: false,
        resolvedTarget: null,
        resolutionAttempts: 0
      };
    case ACTION_TYPES.SKIP_STEP:
      {
        const tour = state.tours[state.currentTourId];
        const currentStep = tour?.steps[state.currentStepIndex];
        const nextIndex = state.currentStepIndex + 1;
        const hasMore = tour && nextIndex < tour.steps.length;
        const newSkipped = currentStep ? [...state.skippedSteps, currentStep.id] : state.skippedSteps;
        if (!hasMore) {
          return {
            ...state,
            skippedSteps: newSkipped,
            currentTourId: null,
            currentStepIndex: 0,
            mode: null
          };
        }
        return {
          ...state,
          currentStepIndex: nextIndex,
          skippedSteps: newSkipped,
          completionSatisfied: false,
          resolvedTarget: null,
          resolutionAttempts: 0
        };
      }
    case ACTION_TYPES.REPEAT_STEP:
      return {
        ...state,
        completionSatisfied: false,
        resolvedTarget: null,
        resolutionAttempts: 0,
        lastError: null,
        isRecovering: false
      };

    // Mode management.
    case ACTION_TYPES.SET_MODE:
      return {
        ...state,
        mode: action.mode
      };

    // Completion.
    case ACTION_TYPES.SET_COMPLETION_SATISFIED:
      return {
        ...state,
        completionSatisfied: action.satisfied
      };
    case ACTION_TYPES.RESET_COMPLETION:
      return {
        ...state,
        completionSatisfied: false
      };

    // Target resolution.
    case ACTION_TYPES.SET_RESOLVED_TARGET:
      return {
        ...state,
        resolvedTarget: action.target,
        lastError: null
      };
    case ACTION_TYPES.CLEAR_RESOLVED_TARGET:
      return {
        ...state,
        resolvedTarget: null
      };
    case ACTION_TYPES.SET_RECOVERING:
      return {
        ...state,
        isRecovering: action.isRecovering
      };
    case ACTION_TYPES.INCREMENT_RESOLUTION_ATTEMPTS:
      return {
        ...state,
        resolutionAttempts: state.resolutionAttempts + 1
      };
    case ACTION_TYPES.SET_LAST_ERROR:
      return {
        ...state,
        lastError: action.error
      };

    // Educator mode.
    case ACTION_TYPES.ACTIVATE_PICKER:
      return {
        ...state,
        isPickerActive: true,
        pickingStepId: action.stepId || null
      };
    case ACTION_TYPES.DEACTIVATE_PICKER:
      return {
        ...state,
        isPickerActive: false,
        pickingStepId: null
      };
    case ACTION_TYPES.SELECT_STEP:
      return {
        ...state,
        selectedStepId: action.stepId
      };
    case ACTION_TYPES.SET_PENDING_CHANGES:
      return {
        ...state,
        pendingChanges: action.pending
      };
    case ACTION_TYPES.UPDATE_STEP:
      {
        const tour = state.tours[action.tourId];
        if (!tour) {
          return state;
        }
        const updatedSteps = tour.steps.map(step => step.id === action.stepId ? {
          ...step,
          ...action.updates
        } : step);
        return {
          ...state,
          tours: {
            ...state.tours,
            [action.tourId]: {
              ...tour,
              steps: updatedSteps
            }
          },
          pendingChanges: true
        };
      }
    case ACTION_TYPES.ADD_STEP:
      {
        var _action$index;
        const tour = state.tours[action.tourId];
        if (!tour) {
          return state;
        }
        const newSteps = [...tour.steps];
        const insertIndex = (_action$index = action.index) !== null && _action$index !== void 0 ? _action$index : newSteps.length;
        newSteps.splice(insertIndex, 0, action.step);

        // Re-index orders.
        newSteps.forEach((step, i) => {
          step.order = i;
        });
        return {
          ...state,
          tours: {
            ...state.tours,
            [action.tourId]: {
              ...tour,
              steps: newSteps
            }
          },
          selectedStepId: action.step.id,
          pendingChanges: true
        };
      }
    case ACTION_TYPES.DELETE_STEP:
      {
        const tour = state.tours[action.tourId];
        if (!tour) {
          return state;
        }
        const filteredSteps = tour.steps.filter(step => step.id !== action.stepId);

        // Re-index orders.
        filteredSteps.forEach((step, i) => {
          step.order = i;
        });
        return {
          ...state,
          tours: {
            ...state.tours,
            [action.tourId]: {
              ...tour,
              steps: filteredSteps
            }
          },
          selectedStepId: state.selectedStepId === action.stepId ? null : state.selectedStepId,
          pendingChanges: true
        };
      }
    case ACTION_TYPES.REORDER_STEPS:
      {
        const tour = state.tours[action.tourId];
        if (!tour) {
          return state;
        }
        const stepsMap = {};
        tour.steps.forEach(step => {
          stepsMap[step.id] = step;
        });
        const reorderedSteps = action.stepIds.map((id, index) => ({
          ...stepsMap[id],
          order: index
        }));
        return {
          ...state,
          tours: {
            ...state.tours,
            [action.tourId]: {
              ...tour,
              steps: reorderedSteps
            }
          },
          pendingChanges: true
        };
      }

    // AI drafting.
    case ACTION_TYPES.SET_AI_DRAFT_LOADING:
      return {
        ...state,
        aiDraftLoading: action.isLoading,
        aiDraftError: action.isLoading ? null : state.aiDraftError
      };
    case ACTION_TYPES.SET_AI_DRAFT_ERROR:
      return {
        ...state,
        aiDraftError: action.error,
        aiDraftLoading: false
      };
    case ACTION_TYPES.SET_AI_DRAFT_RESULT:
      return {
        ...state,
        aiDraftResult: action.result,
        aiDraftLoading: false,
        aiDraftError: null
      };
    case ACTION_TYPES.CLEAR_AI_DRAFT:
      return {
        ...state,
        aiDraftResult: null,
        aiDraftError: null,
        aiDraftLoading: false
      };

    // UI.
    case ACTION_TYPES.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.isOpen
      };

    // AI tour generation (pupil mode).
    case ACTION_TYPES.SET_AI_TOUR_LOADING:
      return {
        ...state,
        aiTourLoading: action.isLoading,
        aiTourError: action.isLoading ? null : state.aiTourError
      };
    case ACTION_TYPES.SET_AI_TOUR_ERROR:
      return {
        ...state,
        aiTourError: action.error,
        aiTourLoading: false
      };
    case ACTION_TYPES.RECEIVE_EPHEMERAL_TOUR:
      return {
        ...state,
        ephemeralTour: action.tour,
        aiTourLoading: false,
        aiTourError: null,
        // Also put it in tours with special 'ephemeral' key.
        tours: {
          ...state.tours,
          ephemeral: action.tour
        }
      };
    case ACTION_TYPES.CLEAR_EPHEMERAL_TOUR:
      return {
        ...state,
        ephemeralTour: null,
        aiTourError: null,
        aiTourLoading: false,
        lastFailureContext: null,
        // Remove from tours.
        tours: Object.fromEntries(Object.entries(state.tours).filter(([key]) => key !== 'ephemeral'))
      };
    case ACTION_TYPES.SET_LAST_FAILURE_CONTEXT:
      return {
        ...state,
        lastFailureContext: action.failureContext
      };
    default:
      return state;
  }
}

/***/ },

/***/ "./assets/js/store/resolvers.js"
/*!**************************************!*\
  !*** ./assets/js/store/resolvers.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getTour: () => (/* binding */ getTour),
/* harmony export */   getTours: () => (/* binding */ getTours),
/* harmony export */   getToursByPostType: () => (/* binding */ getToursByPostType)
/* harmony export */ });
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./actions */ "./assets/js/store/actions.js");
/**
 * Store resolvers for async data fetching.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */




/**
 * Resolver for getTours.
 *
 * @return {Function} Generator function.
 */
function* getTours() {
  yield (0,_actions__WEBPACK_IMPORTED_MODULE_1__.setToursLoading)(true);
  try {
    const tours = yield {
      type: 'API_FETCH',
      request: {
        path: '/admin-coach-tours/v1/tours',
        method: 'GET'
      }
    };
    yield (0,_actions__WEBPACK_IMPORTED_MODULE_1__.receiveTours)(tours);
  } catch (error) {
    yield (0,_actions__WEBPACK_IMPORTED_MODULE_1__.setToursError)(error.message || 'Failed to fetch tours');
  }
}

/**
 * Resolver for getTour.
 *
 * @param {number} tourId Tour ID.
 * @return {Function} Generator function.
 */
function* getTour(tourId) {
  yield (0,_actions__WEBPACK_IMPORTED_MODULE_1__.setToursLoading)(true);
  try {
    const tour = yield {
      type: 'API_FETCH',
      request: {
        path: `/admin-coach-tours/v1/tours/${tourId}`,
        method: 'GET'
      }
    };
    yield (0,_actions__WEBPACK_IMPORTED_MODULE_1__.receiveTour)(tour);
  } catch (error) {
    yield (0,_actions__WEBPACK_IMPORTED_MODULE_1__.setToursError)(error.message || 'Failed to fetch tour');
  }
}

/**
 * Resolver for getToursByPostType.
 *
 * @param {string} postType Post type.
 * @return {Function} Generator function.
 */
function* getToursByPostType(postType) {
  yield (0,_actions__WEBPACK_IMPORTED_MODULE_1__.setToursLoading)(true);
  try {
    const tours = yield {
      type: 'API_FETCH',
      request: {
        path: `/admin-coach-tours/v1/tours?post_type=${postType}&editor=block`,
        method: 'GET'
      }
    };
    yield (0,_actions__WEBPACK_IMPORTED_MODULE_1__.receiveTours)(tours);
  } catch (error) {
    yield (0,_actions__WEBPACK_IMPORTED_MODULE_1__.setToursError)(error.message || 'Failed to fetch tours');
  }
}

/***/ },

/***/ "./assets/js/store/selectors.js"
/*!**************************************!*\
  !*** ./assets/js/store/selectors.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getAiDraft: () => (/* binding */ getAiDraft),
/* harmony export */   getAiDraftError: () => (/* binding */ getAiDraftError),
/* harmony export */   getAiDraftResult: () => (/* binding */ getAiDraftResult),
/* harmony export */   getAiTourError: () => (/* binding */ getAiTourError),
/* harmony export */   getCurrentStep: () => (/* binding */ getCurrentStep),
/* harmony export */   getCurrentStepIndex: () => (/* binding */ getCurrentStepIndex),
/* harmony export */   getCurrentTour: () => (/* binding */ getCurrentTour),
/* harmony export */   getCurrentTourId: () => (/* binding */ getCurrentTourId),
/* harmony export */   getEphemeralTour: () => (/* binding */ getEphemeralTour),
/* harmony export */   getLastError: () => (/* binding */ getLastError),
/* harmony export */   getLastFailureContext: () => (/* binding */ getLastFailureContext),
/* harmony export */   getMode: () => (/* binding */ getMode),
/* harmony export */   getPickingStepId: () => (/* binding */ getPickingStepId),
/* harmony export */   getProgress: () => (/* binding */ getProgress),
/* harmony export */   getResolutionAttempts: () => (/* binding */ getResolutionAttempts),
/* harmony export */   getResolvedTarget: () => (/* binding */ getResolvedTarget),
/* harmony export */   getSelectedStep: () => (/* binding */ getSelectedStep),
/* harmony export */   getSelectedStepId: () => (/* binding */ getSelectedStepId),
/* harmony export */   getSkippedSteps: () => (/* binding */ getSkippedSteps),
/* harmony export */   getTotalSteps: () => (/* binding */ getTotalSteps),
/* harmony export */   getTour: () => (/* binding */ getTour),
/* harmony export */   getTours: () => (/* binding */ getTours),
/* harmony export */   getToursByEditor: () => (/* binding */ getToursByEditor),
/* harmony export */   getToursById: () => (/* binding */ getToursById),
/* harmony export */   getToursByPostType: () => (/* binding */ getToursByPostType),
/* harmony export */   getToursError: () => (/* binding */ getToursError),
/* harmony export */   hasNextStep: () => (/* binding */ hasNextStep),
/* harmony export */   hasPendingChanges: () => (/* binding */ hasPendingChanges),
/* harmony export */   hasPreviousStep: () => (/* binding */ hasPreviousStep),
/* harmony export */   isAiDraftLoading: () => (/* binding */ isAiDraftLoading),
/* harmony export */   isAiDrafting: () => (/* binding */ isAiDrafting),
/* harmony export */   isAiTourLoading: () => (/* binding */ isAiTourLoading),
/* harmony export */   isCompletionSatisfied: () => (/* binding */ isCompletionSatisfied),
/* harmony export */   isEducatorMode: () => (/* binding */ isEducatorMode),
/* harmony export */   isEphemeralTourActive: () => (/* binding */ isEphemeralTourActive),
/* harmony export */   isPickerActive: () => (/* binding */ isPickerActive),
/* harmony export */   isPupilMode: () => (/* binding */ isPupilMode),
/* harmony export */   isRecovering: () => (/* binding */ isRecovering),
/* harmony export */   isSidebarOpen: () => (/* binding */ isSidebarOpen),
/* harmony export */   isTourActive: () => (/* binding */ isTourActive),
/* harmony export */   isToursLoading: () => (/* binding */ isToursLoading),
/* harmony export */   wasStepSkipped: () => (/* binding */ wasStepSkipped)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Store selectors.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */



// ============================================================================
// Tour Selectors
// ============================================================================

/**
 * Get tours as an object keyed by ID.
 *
 * @param {Object} state Store state.
 * @return {Object} Tours object.
 */
function getToursById(state) {
  return state.tours;
}

/**
 * Get all tours as an array (memoized).
 *
 * @param {Object} state Store state.
 * @return {Array} Array of tours.
 */
const getTours = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.createSelector)(state => Object.values(state.tours), state => [state.tours]);

/**
 * Get a single tour by ID.
 *
 * @param {Object} state  Store state.
 * @param {number} tourId Tour ID.
 * @return {Object|null} Tour object or null.
 */
function getTour(state, tourId) {
  return state.tours[tourId] || null;
}

/**
 * Get tours loading state.
 *
 * @param {Object} state Store state.
 * @return {boolean} Loading state.
 */
function isToursLoading(state) {
  return state.toursLoading;
}

/**
 * Get tours error.
 *
 * @param {Object} state Store state.
 * @return {string|null} Error message.
 */
function getToursError(state) {
  return state.toursError;
}

/**
 * Get tours filtered by post type (memoized).
 *
 * @param {Object} state    Store state.
 * @param {string} postType Post type to filter by.
 * @return {Array} Filtered tours.
 */
const getToursByPostType = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.createSelector)((state, postType) => getTours(state).filter(tour => tour.postTypes && tour.postTypes.includes(postType) && tour.status === 'publish'), (state, postType) => [state.tours, postType]);

/**
 * Get tours filtered by editor type (memoized).
 *
 * @param {Object} state  Store state.
 * @param {string} editor Editor type ('block', 'classic', 'site').
 * @return {Array} Filtered tours.
 */
const getToursByEditor = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.createSelector)((state, editor) => getTours(state).filter(tour => tour.editor === editor && tour.status === 'publish'), (state, editor) => [state.tours, editor]);

// ============================================================================
// Current Tour Selectors
// ============================================================================

/**
 * Get current tour ID.
 *
 * @param {Object} state Store state.
 * @return {number|null} Current tour ID.
 */
function getCurrentTourId(state) {
  return state.currentTourId;
}

/**
 * Get current tour object.
 *
 * @param {Object} state Store state.
 * @return {Object|null} Current tour.
 */
function getCurrentTour(state) {
  return state.currentTourId ? state.tours[state.currentTourId] : null;
}

/**
 * Get current step index.
 *
 * @param {Object} state Store state.
 * @return {number} Current step index.
 */
function getCurrentStepIndex(state) {
  return state.currentStepIndex;
}

/**
 * Get current step object (memoized).
 *
 * @param {Object} state Store state.
 * @return {Object|null} Current step.
 */
const getCurrentStep = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.createSelector)(state => {
  const tour = getCurrentTour(state);
  if (!tour || !tour.steps) {
    return null;
  }
  return tour.steps[state.currentStepIndex] || null;
}, state => [state.tours, state.currentTourId, state.currentStepIndex]);

/**
 * Get total steps count for current tour.
 *
 * @param {Object} state Store state.
 * @return {number} Total steps.
 */
function getTotalSteps(state) {
  const tour = getCurrentTour(state);
  return tour?.steps?.length || 0;
}

/**
 * Check if there is a next step.
 *
 * @param {Object} state Store state.
 * @return {boolean} Has next step.
 */
function hasNextStep(state) {
  return state.currentStepIndex < getTotalSteps(state) - 1;
}

/**
 * Check if there is a previous step.
 *
 * @param {Object} state Store state.
 * @return {boolean} Has previous step.
 */
function hasPreviousStep(state) {
  return state.currentStepIndex > 0;
}

/**
 * Get tour progress as percentage.
 *
 * @param {Object} state Store state.
 * @return {number} Progress (0-100).
 */
function getProgress(state) {
  const total = getTotalSteps(state);
  if (total === 0) {
    return 0;
  }
  return Math.round((state.currentStepIndex + 1) / total * 100);
}

// ============================================================================
// Mode Selectors
// ============================================================================

/**
 * Get current mode.
 *
 * @param {Object} state Store state.
 * @return {string|null} Mode ('educator' | 'pupil' | null).
 */
function getMode(state) {
  return state.mode;
}

/**
 * Check if in educator mode.
 *
 * @param {Object} state Store state.
 * @return {boolean} Is educator mode.
 */
function isEducatorMode(state) {
  return state.mode === 'educator';
}

/**
 * Check if in pupil mode.
 *
 * @param {Object} state Store state.
 * @return {boolean} Is pupil mode.
 */
function isPupilMode(state) {
  return state.mode === 'pupil';
}

/**
 * Check if a tour is active.
 *
 * @param {Object} state Store state.
 * @return {boolean} Tour is active.
 */
function isTourActive(state) {
  return state.currentTourId !== null && state.mode !== null;
}

// ============================================================================
// Completion Selectors
// ============================================================================

/**
 * Check if completion is satisfied.
 *
 * @param {Object} state Store state.
 * @return {boolean} Completion satisfied.
 */
function isCompletionSatisfied(state) {
  return state.completionSatisfied;
}

/**
 * Get skipped steps.
 *
 * @param {Object} state Store state.
 * @return {string[]} Array of skipped step IDs.
 */
function getSkippedSteps(state) {
  return state.skippedSteps;
}

/**
 * Check if a specific step was skipped.
 *
 * @param {Object} state  Store state.
 * @param {string} stepId Step ID.
 * @return {boolean} Was skipped.
 */
function wasStepSkipped(state, stepId) {
  return state.skippedSteps.includes(stepId);
}

// ============================================================================
// Target Resolution Selectors
// ============================================================================

/**
 * Get resolved target.
 *
 * @param {Object} state Store state.
 * @return {Object|null} Resolved target info.
 */
function getResolvedTarget(state) {
  return state.resolvedTarget;
}

/**
 * Check if currently recovering.
 *
 * @param {Object} state Store state.
 * @return {boolean} Is recovering.
 */
function isRecovering(state) {
  return state.isRecovering;
}

/**
 * Get resolution attempts count.
 *
 * @param {Object} state Store state.
 * @return {number} Attempts count.
 */
function getResolutionAttempts(state) {
  return state.resolutionAttempts;
}

/**
 * Get last error.
 *
 * @param {Object} state Store state.
 * @return {string|null} Error message.
 */
function getLastError(state) {
  return state.lastError;
}

// ============================================================================
// Educator Mode Selectors
// ============================================================================

/**
 * Check if picker is active.
 *
 * @param {Object} state Store state.
 * @return {boolean} Picker active.
 */
function isPickerActive(state) {
  return state.isPickerActive;
}

/**
 * Get the step ID being picked for (if repicking target).
 *
 * @param {Object} state Store state.
 * @return {string|null} Step ID or null if adding new step.
 */
function getPickingStepId(state) {
  return state.pickingStepId || null;
}

/**
 * Get selected step ID.
 *
 * @param {Object} state Store state.
 * @return {string|null} Selected step ID.
 */
function getSelectedStepId(state) {
  return state.selectedStepId;
}

/**
 * Get selected step object (memoized).
 *
 * @param {Object} state Store state.
 * @return {Object|null} Selected step.
 */
const getSelectedStep = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.createSelector)(state => {
  const tour = getCurrentTour(state);
  if (!tour || !state.selectedStepId) {
    return null;
  }
  return tour.steps.find(step => step.id === state.selectedStepId);
}, state => [state.tours, state.currentTourId, state.selectedStepId]);

/**
 * Check if there are pending changes.
 *
 * @param {Object} state Store state.
 * @return {boolean} Has pending changes.
 */
function hasPendingChanges(state) {
  return state.pendingChanges;
}

// ============================================================================
// AI Draft Selectors
// ============================================================================

/**
 * Check if AI draft is loading.
 *
 * @param {Object} state Store state.
 * @return {boolean} AI draft loading.
 */
function isAiDraftLoading(state) {
  return state.aiDraftLoading;
}

/**
 * Check if AI drafting is in progress (alias for isAiDraftLoading).
 *
 * @param {Object} state Store state.
 * @return {boolean} AI drafting in progress.
 */
function isAiDrafting(state) {
  return isAiDraftLoading(state);
}

/**
 * Get AI draft error.
 *
 * @param {Object} state Store state.
 * @return {string|null} Error message.
 */
function getAiDraftError(state) {
  return state.aiDraftError;
}

/**
 * Get AI draft result.
 *
 * @param {Object} state Store state.
 * @return {Object|null} AI draft output.
 */
function getAiDraftResult(state) {
  return state.aiDraftResult;
}

/**
 * Get AI draft (alias for getAiDraftResult).
 *
 * @param {Object} state Store state.
 * @return {Object|null} AI draft output.
 */
function getAiDraft(state) {
  return getAiDraftResult(state);
}

// ============================================================================
// UI Selectors
// ============================================================================

/**
 * Check if sidebar is open.
 *
 * @param {Object} state Store state.
 * @return {boolean} Sidebar open.
 */
function isSidebarOpen(state) {
  return state.sidebarOpen;
}

// ============================================================================
// AI Tour Selectors (Pupil Mode)
// ============================================================================

/**
 * Check if AI tour is loading.
 *
 * @param {Object} state Store state.
 * @return {boolean} AI tour loading.
 */
function isAiTourLoading(state) {
  return state.aiTourLoading;
}

/**
 * Get AI tour error.
 *
 * @param {Object} state Store state.
 * @return {string|null} Error message.
 */
function getAiTourError(state) {
  return state.aiTourError;
}

/**
 * Get last failure context for contextual retry.
 *
 * @param {Object} state Store state.
 * @return {Object|null} Failure context.
 */
function getLastFailureContext(state) {
  return state.lastFailureContext;
}

/**
 * Get ephemeral tour.
 *
 * @param {Object} state Store state.
 * @return {Object|null} Ephemeral tour.
 */
function getEphemeralTour(state) {
  return state.ephemeralTour;
}

/**
 * Check if currently running an ephemeral tour.
 *
 * @param {Object} state Store state.
 * @return {boolean} Is ephemeral tour active.
 */
function isEphemeralTourActive(state) {
  return state.currentTourId === 'ephemeral' && state.mode === 'pupil';
}

/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/arrow-right.mjs"
/*!****************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/arrow-right.mjs ***!
  \****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ arrow_right_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/arrow-right.tsx


var arrow_right_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m14.5 6.5-1 1 3.7 3.7H4v1.6h13.2l-3.7 3.7 1 1 5.6-5.5z" }) });

//# sourceMappingURL=arrow-right.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/close.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/close.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ close_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/close.tsx


var close_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m13.06 12 6.47-6.47-1.06-1.06L12 10.94 5.53 4.47 4.47 5.53 10.94 12l-6.47 6.47 1.06 1.06L12 13.06l6.47 6.47 1.06-1.06L13.06 12Z" }) });

//# sourceMappingURL=close.mjs.map


/***/ },

/***/ "@wordpress/api-fetch"
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ "@wordpress/blocks"
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["blocks"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/data"
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["data"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "@wordpress/primitives"
/*!************************************!*\
  !*** external ["wp","primitives"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["primitives"];

/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Check if module exists (development only)
/******/ 		if (__webpack_modules__[moduleId] === undefined) {
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; (typeof current == 'object' || typeof current == 'function') && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************************!*\
  !*** ./assets/js/pupil/index.js ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _TourRunner_jsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TourRunner.jsx */ "./assets/js/pupil/TourRunner.jsx");
/* harmony import */ var _PupilLauncher_jsx__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PupilLauncher.jsx */ "./assets/js/pupil/PupilLauncher.jsx");
/* harmony import */ var _store_index_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../store/index.js */ "./assets/js/store/index.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__);
/**
 * Pupil Entry Point.
 *
 * Initializes the tour runner and AI launcher for pupils.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */






// Import store to ensure it's registered.


const STORE_NAME = 'admin-coach-tours';

/**
 * Initialize the pupil tour runner.
 */
function init() {
  console.log('[ACT Pupil] Initializing... v4');
  console.log('[ACT Pupil] TourRunner:', typeof _TourRunner_jsx__WEBPACK_IMPORTED_MODULE_2__["default"], _TourRunner_jsx__WEBPACK_IMPORTED_MODULE_2__["default"]);
  console.log('[ACT Pupil] AI Available:', window.adminCoachTours?.aiAvailable);

  // Create container for tour runner.
  const container = document.createElement('div');
  container.id = 'admin-coach-tours-pupil';
  document.body.appendChild(container);

  // Render the tour runner.
  try {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.render)(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_TourRunner_jsx__WEBPACK_IMPORTED_MODULE_2__["default"], {}), container);
    console.log('[ACT Pupil] TourRunner rendered successfully');
  } catch (error) {
    console.error('[ACT Pupil] Error rendering TourRunner:', error);
  }

  // Create container for AI launcher.
  const launcherContainer = document.createElement('div');
  launcherContainer.id = 'admin-coach-tours-launcher';
  document.body.appendChild(launcherContainer);
  try {
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.render)(/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_5__.jsx)(_PupilLauncher_jsx__WEBPACK_IMPORTED_MODULE_3__["default"], {}), launcherContainer);
    console.log('[ACT Pupil] PupilLauncher rendered successfully');
  } catch (error) {
    console.error('[ACT Pupil] Error rendering PupilLauncher:', error);
  }

  // Check for auto-start tour from URL (use top window to handle iframe case).
  const topWindow = window.top || window;
  const urlParams = new URLSearchParams(topWindow.location.search);
  const autoStartTourId = urlParams.get('act_tour');
  console.log('[ACT Pupil] URL search:', topWindow.location.search);
  console.log('[ACT Pupil] act_tour param:', autoStartTourId);
  if (autoStartTourId) {
    const tourId = parseInt(autoStartTourId, 10);
    console.log('[ACT Pupil] Will fetch and start tour:', tourId);

    // First, trigger the tour to be fetched via selector resolution.
    // Access the selector to kick off the resolver.
    const initialTour = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.select)(STORE_NAME).getTour(tourId);
    console.log('[ACT Pupil] Initial tour state:', initialTour);

    // Subscribe to store changes and start tour once it's loaded.
    const unsubscribe = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.subscribe)(() => {
      const store = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.select)(STORE_NAME);
      const tour = store.getTour(tourId);
      const isLoading = store.isToursLoading();

      // Once tour is loaded and not loading, start it.
      if (tour && !isLoading) {
        console.log('[ACT Pupil] Tour loaded:', tour);
        console.log('[ACT Pupil] Tour steps:', tour.steps, 'count:', tour.steps?.length);
        unsubscribe();
        (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.dispatch)(STORE_NAME).startTour(tourId);
      }
    });

    // Timeout fallback - if tour doesn't load within 10 seconds, give up.
    setTimeout(() => {
      console.log('[ACT Pupil] Timeout reached, unsubscribing');
      unsubscribe();
    }, 10000);
  }
}

// Initialize when DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
})();

/******/ })()
;
//# sourceMappingURL=index.js.map