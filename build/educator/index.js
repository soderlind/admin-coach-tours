/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./assets/js/educator/EducatorSidebar.jsx"
/*!************************************************!*\
  !*** ./assets/js/educator/EducatorSidebar.jsx ***!
  \************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EducatorSidebar)
/* harmony export */ });
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/editor */ "@wordpress/editor");
/* harmony import */ var _wordpress_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_editor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/check.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/help.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/seen.mjs");
/* harmony import */ var _StepList_tsx__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./StepList.tsx */ "./assets/js/educator/StepList.tsx");
/* harmony import */ var _StepEditor_tsx__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./StepEditor.tsx */ "./assets/js/educator/StepEditor.tsx");
/* harmony import */ var _PickerOverlay_jsx__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./PickerOverlay.jsx */ "./assets/js/educator/PickerOverlay.jsx");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__);
/**
 * Educator Sidebar Panel.
 *
 * Main sidebar panel for tour authoring in the block editor.
 * Only loads when editing an act_tour post type.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */











const STORE_NAME = 'admin-coach-tours';

/**
 * Educator Sidebar component.
 *
 * @return {JSX.Element|null} Sidebar component or null if not on act_tour.
 */
function EducatorSidebar() {
  const [savingError, setSavingError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(null);
  const [isSavingSteps, setIsSavingSteps] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);
  const [saveSuccess, setSaveSuccess] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useState)(false);

  // Get data from editor store.
  const {
    postType,
    postId,
    postTitle,
    postStatus,
    isSaving
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const editorStore = select('core/editor');
    return {
      postType: editorStore?.getCurrentPostType?.() || '',
      postId: editorStore?.getCurrentPostId?.() || 0,
      postTitle: editorStore?.getEditedPostAttribute?.('title') || '',
      postStatus: editorStore?.getEditedPostAttribute?.('status') || 'draft',
      isSaving: editorStore?.isSavingPost?.() || false
    };
  }, []);

  // Get data from our store.
  const {
    currentTour,
    selectedStep,
    isPickerActive,
    isLoading
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    const store = select(STORE_NAME);
    return {
      currentTour: store.getCurrentTour(),
      selectedStep: store.getSelectedStep(),
      isPickerActive: store.isPickerActive(),
      isLoading: store.isToursLoading()
    };
  }, []);

  // Get dispatch actions.
  const {
    setCurrentTour,
    saveTour,
    startPicking,
    stopPicking,
    selectStep
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)(STORE_NAME);

  // Get interface dispatch for opening sidebar (works in newer WP).
  const {
    enableComplementaryArea
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)('core/interface');

  // Auto-set current tour when editing an act_tour post.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (postType === 'act_tour' && postId && postId !== currentTour?.id) {
      setCurrentTour(postId);
    }
  }, [postType, postId, currentTour?.id, setCurrentTour]);

  // Auto-open sidebar when editing an act_tour.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(() => {
    if (postType === 'act_tour') {
      // Small delay to ensure sidebar is registered.
      const timer = setTimeout(() => {
        enableComplementaryArea('core', 'admin-coach-tours-educator/admin-coach-tours-sidebar');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [postType, enableComplementaryArea]);

  // Don't render if not editing an act_tour.
  if (postType !== 'act_tour') {
    return null;
  }

  /**
   * Handle saving tour steps.
   */
  const handleSaveSteps = async () => {
    if (!currentTour?.id) {
      return;
    }
    setIsSavingSteps(true);
    setSavingError(null);
    setSaveSuccess(false);
    try {
      const tourData = {
        steps: currentTour.steps || []
      };
      await saveTour(currentTour.id, tourData);
      setSaveSuccess(true);

      // Clear success message after 3 seconds.
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSavingError(error.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Failed to save steps.', 'admin-coach-tours'));
    } finally {
      setIsSavingSteps(false);
    }
  };

  /**
   * Handle starting to pick an element for a step.
   */
  const handleStartPicking = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(() => {
    startPicking();
  }, [startPicking]);

  /**
   * Handle canceling picking.
   */
  const handleCancelPicking = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(() => {
    stopPicking();
  }, [stopPicking]);

  /**
   * Handle testing the tour (preview mode).
   * Opens a new post in the tour's target post type with the tour parameter.
   */
  const handleTestTour = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useCallback)(() => {
    if (currentTour?.id) {
      // Get the first configured post type for this tour.
      const targetPostTypes = currentTour.postTypes || ['post'];
      const targetPostType = targetPostTypes[0] || 'post';

      // Build the URL to create a new post of that type with the tour parameter.
      // Use URLSearchParams to properly encode parameters.
      const adminUrl = new URL(window.location.origin + '/wp-admin/post-new.php');
      if (targetPostType !== 'post') {
        adminUrl.searchParams.set('post_type', targetPostType);
      }
      adminUrl.searchParams.set('act_tour', currentTour.id.toString());
      console.log('[ACT Educator] Opening test URL:', adminUrl.toString());

      // Open in new tab for testing.
      window.open(adminUrl.toString(), '_blank');
    }
  }, [currentTour?.id, currentTour?.postTypes]);

  // Show loading state.
  if (isLoading && !currentTour) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_editor__WEBPACK_IMPORTED_MODULE_0__.PluginSidebar, {
        name: "admin-coach-tours-sidebar",
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Tour Steps', 'admin-coach-tours'),
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("div", {
          className: "act-educator-sidebar",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Flex, {
              justify: "center",
              style: {
                padding: '24px'
              },
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Spinner, {})
            })
          })
        })
      })
    });
  }
  const steps = currentTour?.steps || [];
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.Fragment, {
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_editor__WEBPACK_IMPORTED_MODULE_0__.PluginSidebarMoreMenuItem, {
      target: "admin-coach-tours-sidebar",
      icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
      children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Tour Steps', 'admin-coach-tours')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_editor__WEBPACK_IMPORTED_MODULE_0__.PluginSidebar, {
      name: "admin-coach-tours-sidebar",
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Tour Steps', 'admin-coach-tours'),
      icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
        className: "act-educator-sidebar",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Tour Info', 'admin-coach-tours'),
          initialOpen: false,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Flex, {
            justify: "space-between",
            align: "center",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.FlexItem, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("strong", {
                children: postTitle || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Untitled Tour', 'admin-coach-tours')
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.FlexItem, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("span", {
                className: `act-tour-status${postStatus === 'publish' ? ' act-tour-status--published' : ''}`,
                children: postStatus === 'publish' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Published', 'admin-coach-tours') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Draft', 'admin-coach-tours')
              })
            })]
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)("p", {
            className: "act-help-text",
            style: {
              marginTop: '8px'
            },
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Use the block editor canvas as a sandbox to create your tour steps. Pick elements from the editor to target them in your tour.', 'admin-coach-tours')
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Steps', 'admin-coach-tours') + ` (${steps.length})`,
          initialOpen: true,
          children: [savingError && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Notice, {
            status: "error",
            isDismissible: true,
            onRemove: () => setSavingError(null),
            children: savingError
          }), saveSuccess && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Notice, {
            status: "success",
            isDismissible: false,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Steps saved successfully!', 'admin-coach-tours')
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_StepList_tsx__WEBPACK_IMPORTED_MODULE_8__["default"], {
            tourId: postId,
            steps: steps,
            onEditStep: step => {
              var _step$id;
              return selectStep((_step$id = step?.id) !== null && _step$id !== void 0 ? _step$id : null);
            },
            onAddStep: handleStartPicking
          }), steps.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsxs)("div", {
            className: "act-actions-footer",
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
              variant: "primary",
              icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
              onClick: handleSaveSteps,
              isBusy: isSavingSteps,
              disabled: isSavingSteps || isSaving,
              children: isSavingSteps ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Saving…', 'admin-coach-tours') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Save Steps', 'admin-coach-tours')
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
              variant: "secondary",
              icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"],
              onClick: handleTestTour,
              disabled: steps.length === 0,
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Test Tour', 'admin-coach-tours')
            })]
          })]
        }), selectedStep && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, {
          title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_3__.__)('Edit Step', 'admin-coach-tours'),
          initialOpen: true,
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_StepEditor_tsx__WEBPACK_IMPORTED_MODULE_9__["default"], {
            step: selectedStep,
            tourId: postId,
            postType: "act_tour",
            onClose: () => selectStep(null)
          })
        })]
      })
    }), isPickerActive && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_11__.jsx)(_PickerOverlay_jsx__WEBPACK_IMPORTED_MODULE_10__["default"], {
      onCancel: handleCancelPicking
    })]
  });
}

/***/ },

/***/ "./assets/js/educator/PickerOverlay.jsx"
/*!**********************************************!*\
  !*** ./assets/js/educator/PickerOverlay.jsx ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ PickerOverlay)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var _runtime_captureLocatorBundle_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../runtime/captureLocatorBundle.js */ "./assets/js/runtime/captureLocatorBundle.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);
/**
 * Picker Overlay Component.
 *
 * Full-page overlay that allows educators to pick a UI element as a tour step target.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */









const STORE_NAME = 'admin-coach-tours';

/**
 * Elements to exclude from picking.
 */
const EXCLUDED_SELECTORS = ['.act-picker-overlay', '.act-picker-highlight', '.act-picker-toolbar', '.edit-post-sidebar', '#adminmenumain', '#wpadminbar', '.components-popover', '.components-modal__screen-overlay', 'iframe[name="editor-canvas"]' // Exclude iframe itself; pick elements inside
];

/**
 * Get the editor iframe element if present.
 *
 * @return {HTMLIFrameElement|null} The editor iframe or null.
 */
function getEditorIframe() {
  // WordPress 6.8+ uses an iframe for the block editor content.
  return document.querySelector('iframe[name="editor-canvas"]');
}

/**
 * Check if element should be excluded from picking.
 *
 * @param {HTMLElement} element Element to check.
 * @return {boolean} True if excluded.
 */
function isExcluded(element) {
  // Check if element matches any excluded selectors.
  for (const selector of EXCLUDED_SELECTORS) {
    if (element.matches(selector)) {
      return true;
    }
    // Check if any ancestor matches.
    if (element.closest(selector)) {
      return true;
    }
  }
  return false;
}

/**
 * Picker Overlay component.
 *
 * @param {Object}   props          Component props.
 * @param {Function} props.onCancel Cancel handler.
 * @return {JSX.Element|null} Overlay portal.
 */
function PickerOverlay({
  onCancel
}) {
  const [hoveredElement, setHoveredElement] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [highlightRect, setHighlightRect] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const overlayRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);

  // Get picking state.
  const {
    pickingStepId,
    currentTourId
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useSelect)(select => {
    const store = select(STORE_NAME);
    return {
      pickingStepId: store.getPickingStepId?.() || null,
      currentTourId: store.getCurrentTourId?.() || null
    };
  }, []);

  // Get dispatch actions.
  const {
    stopPicking,
    addStep,
    updateStep
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useDispatch)(STORE_NAME);

  // Track if element is from iframe.
  const iframeElementRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(false);
  // Track last processed element to avoid redundant updates.
  const lastElementRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
  // Throttle timer ref.
  const throttleRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);

  /**
   * Handle mouse move - track hovered element.
   * Throttled to reduce flickering.
   *
   * @param {MouseEvent} event      Mouse event.
   * @param {boolean}    fromIframe Whether event is from iframe.
   */
  const handleMouseMove = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)((event, fromIframe = false) => {
    // Throttle updates to 60fps (16ms).
    if (throttleRef.current) {
      return;
    }
    throttleRef.current = setTimeout(() => {
      throttleRef.current = null;
    }, 16);
    let targetElement = null;
    if (fromIframe) {
      // Event is from iframe - use event.target directly.
      targetElement = event.target;
      if (targetElement && !isExcluded(targetElement)) {
        // Skip if same element (avoid redundant updates).
        if (targetElement === lastElementRef.current) {
          return;
        }
        lastElementRef.current = targetElement;
        iframeElementRef.current = true;

        // Get iframe to calculate position offset.
        const iframe = getEditorIframe();
        if (iframe) {
          const iframeRect = iframe.getBoundingClientRect();
          const elRect = targetElement.getBoundingClientRect();
          setHoveredElement(targetElement);
          setHighlightRect({
            top: iframeRect.top + elRect.top,
            left: iframeRect.left + elRect.left,
            width: elRect.width,
            height: elRect.height
          });
        }
      }
    } else {
      // Event is from main document.
      const elementsAtPoint = document.elementsFromPoint(event.clientX, event.clientY);

      // Find first non-excluded element.
      targetElement = elementsAtPoint.find(el => {
        // Skip our overlay elements.
        if (el.closest('.act-picker-overlay')) {
          return false;
        }
        // Skip excluded elements.
        if (isExcluded(el)) {
          return false;
        }
        // Skip the iframe itself - we handle its contents separately.
        if (el.tagName === 'IFRAME' && el.name === 'editor-canvas') {
          return false;
        }
        return true;
      });
      if (targetElement && targetElement !== lastElementRef.current) {
        lastElementRef.current = targetElement;
        iframeElementRef.current = false;
        setHoveredElement(targetElement);

        // Get element rect for highlight.
        const rect = targetElement.getBoundingClientRect();
        setHighlightRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
      }
    }
  }, [] // No dependencies - uses refs
  );

  /**
   * Handle click - capture the element.
   */
  const handleClick = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(event => {
    // Prevent default and stop propagation.
    event.preventDefault();
    event.stopPropagation();

    // Use ref for the element (more reliable than state).
    const element = lastElementRef.current;
    if (!element) {
      return;
    }

    // Capture locator bundle from element.
    const inIframe = iframeElementRef.current;
    const target = (0,_runtime_captureLocatorBundle_js__WEBPACK_IMPORTED_MODULE_5__.captureLocatorBundle)(element, {
      inEditorIframe: inIframe
    });
    const elementContext = (0,_runtime_captureLocatorBundle_js__WEBPACK_IMPORTED_MODULE_5__.captureElementContext)(element);

    // Create step data.
    const stepData = {
      target,
      elementContext,
      // For AI drafting.
      completion: {
        type: 'clickTarget',
        params: {}
      }
    };
    if (pickingStepId) {
      // Updating existing step - include elementContext for AI drafting.
      updateStep(currentTourId, pickingStepId, {
        target,
        elementContext
      });
    } else {
      // Adding new step.
      addStep(currentTourId, stepData);
    }

    // Stop picking mode.
    stopPicking();
  }, [pickingStepId, currentTourId, addStep, updateStep, stopPicking]);

  /**
   * Handle escape key.
   */
  const handleKeyDown = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(event => {
    if (event.key === 'Escape') {
      stopPicking();
      onCancel?.();
    }
  }, [stopPicking, onCancel]);

  // Use refs to store latest handlers so we don't need to re-attach listeners.
  const handlersRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useRef)({
    handleMouseMove,
    handleClick,
    handleKeyDown
  });

  // Update refs when handlers change.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    handlersRef.current = {
      handleMouseMove,
      handleClick,
      handleKeyDown
    };
  }, [handleMouseMove, handleClick, handleKeyDown]);

  // Set up event listeners for main document and iframe.
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useEffect)(() => {
    // Stable wrappers that use refs.
    const onMouseMove = event => handlersRef.current.handleMouseMove(event, false);
    const onClick = event => handlersRef.current.handleClick(event);
    const onKeyDown = event => handlersRef.current.handleKeyDown(event);
    const onIframeMouseMove = event => handlersRef.current.handleMouseMove(event, true);
    const onIframeClick = event => {
      event.preventDefault();
      event.stopPropagation();
      handlersRef.current.handleClick(event);
    };

    // Main document listeners.
    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);

    // Prevent scroll while picking.
    document.body.style.overflow = 'hidden';

    // Track iframe doc for cleanup.
    let iframeDoc = null;
    let pollInterval = null;

    /**
     * Attempt to attach listeners to iframe.
     */
    const attachIframeListeners = () => {
      const iframe = getEditorIframe();
      if (iframe?.contentDocument && iframe.contentDocument !== iframeDoc) {
        // Remove old listeners if doc changed.
        if (iframeDoc) {
          iframeDoc.removeEventListener('mousemove', onIframeMouseMove, true);
          iframeDoc.removeEventListener('click', onIframeClick, true);
          iframeDoc.removeEventListener('keydown', onKeyDown, true);
        }
        iframeDoc = iframe.contentDocument;
        iframeDoc.addEventListener('mousemove', onIframeMouseMove, true);
        iframeDoc.addEventListener('click', onIframeClick, true);
        iframeDoc.addEventListener('keydown', onKeyDown, true);
      }
    };

    // Initial attempt.
    attachIframeListeners();

    // Poll for iframe (it may load after mount).
    pollInterval = setInterval(attachIframeListeners, 500);
    return () => {
      document.removeEventListener('mousemove', onMouseMove, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKeyDown, true);
      document.body.style.overflow = '';

      // Clear throttle timer.
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (iframeDoc) {
        iframeDoc.removeEventListener('mousemove', onIframeMouseMove, true);
        iframeDoc.removeEventListener('click', onIframeClick, true);
        iframeDoc.removeEventListener('keydown', onKeyDown, true);
      }
    };
  }, []); // Empty deps - uses refs for stable handlers

  // Render highlight box.
  const renderHighlight = () => {
    if (!highlightRect) {
      return null;
    }
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
      className: "act-picker-highlight",
      style: {
        position: 'fixed',
        top: highlightRect.top,
        left: highlightRect.left,
        width: highlightRect.width,
        height: highlightRect.height,
        border: '3px solid #007cba',
        backgroundColor: 'rgba(0, 124, 186, 0.15)',
        pointerEvents: 'none',
        zIndex: 9999999,
        boxSizing: 'border-box',
        borderRadius: '3px',
        transition: 'top 0.08s ease-out, left 0.08s ease-out, width 0.08s ease-out, height 0.08s ease-out',
        boxShadow: '0 0 0 2px rgba(0, 124, 186, 0.3)'
      }
    });
  };

  // Render element info.
  const renderElementInfo = () => {
    if (!hoveredElement) {
      return null;
    }
    const tag = hoveredElement.tagName.toLowerCase();
    const id = hoveredElement.id;
    const classes = Array.from(hoveredElement.classList).slice(0, 3).join('.');
    let info = tag;
    if (id) {
      info += `#${id}`;
    } else if (classes) {
      info += `.${classes}`;
    }
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
      className: "act-picker-element-info",
      style: {
        position: 'fixed',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: '#fff',
        padding: '8px 16px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '13px',
        maxWidth: '80%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        zIndex: 9999999
      },
      children: info
    });
  };

  // Render toolbar.
  const renderToolbar = () => {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
      className: "act-picker-toolbar",
      style: {
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        backgroundColor: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 9999999,
        pointerEvents: 'auto' // Make toolbar clickable
      },
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("span", {
        style: {
          alignSelf: 'center',
          fontWeight: 500
        },
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Click an element to select it as target', 'admin-coach-tours')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
        variant: "tertiary",
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"],
        onClick: () => {
          stopPicking();
          onCancel?.();
        },
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Cancel', 'admin-coach-tours')
      })]
    });
  };

  // Render overlay portal.
  const overlayContent = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    ref: overlayRef,
    className: "act-picker-overlay",
    style: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999998,
      cursor: 'crosshair',
      pointerEvents: 'none' // Let events pass through to iframe
    },
    children: [renderHighlight(), renderElementInfo(), renderToolbar()]
  });

  // Use portal to render at document body level.
  return (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.createPortal)(overlayContent, document.body);
}

/***/ },

/***/ "./assets/js/educator/StepEditor.tsx"
/*!*******************************************!*\
  !*** ./assets/js/educator/StepEditor.tsx ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StepEditor)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/check.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/close.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/pin.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/star-filled.mjs");
/* harmony import */ var _runtime_watchCompletion_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../runtime/watchCompletion.js */ "./assets/js/runtime/watchCompletion.js");
/* harmony import */ var _runtime_resolveTarget_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../runtime/resolveTarget.js */ "./assets/js/runtime/resolveTarget.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);
/**
 * Step Editor Component.
 *
 * Form for editing step properties: title, content, target, completion, etc.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */









const STORE_NAME = 'admin-coach-tours';

/**
 * Completion type info from runtime.
 */

/**
 * Step Editor component.
 */
function StepEditor({
  step,
  tourId,
  postType,
  onClose
}) {
  // Local state for form fields.
  const [title, setTitle] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(step.title || '');
  const [content, setContent] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(step.content || '');
  const [completionType, setCompletionType] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(step.completion?.type || 'manual');
  const [completionParams, setCompletionParams] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(step.completion?.params || {});
  const [isSaving, setIsSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(false);
  const [saveError, setSaveError] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);
  const [targetTestResult, setTargetTestResult] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useState)(null);

  // Get AI draft state.
  const {
    aiDraft,
    isAiDrafting,
    aiDraftError
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useSelect)(select => {
    const store = select(STORE_NAME);
    return {
      aiDraft: store.getAiDraft(),
      isAiDrafting: store.isAiDrafting(),
      aiDraftError: store.getAiDraftError()
    };
  }, []);

  // Get dispatch actions.
  const {
    updateStep,
    requestAiDraft,
    clearAiDraft,
    startPicking
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useDispatch)(STORE_NAME);

  // Get completion types.
  const completionTypes = (0,_runtime_watchCompletion_js__WEBPACK_IMPORTED_MODULE_8__.getAvailableCompletions)();

  /**
   * Test target resolution.
   */
  const handleTestTarget = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    if (step.target) {
      const result = (0,_runtime_resolveTarget_js__WEBPACK_IMPORTED_MODULE_9__.testTargetResolution)(step.target);
      setTargetTestResult(result);

      // Clear after a few seconds.
      setTimeout(() => setTargetTestResult(null), 5000);
    }
  }, [step.target]);

  /**
   * Handle save.
   */
  const handleSave = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateStep(tourId, step.id, {
        title: title.trim(),
        content: content.trim(),
        completion: {
          type: completionType,
          params: completionParams
        }
      });
      onClose();
    } catch (error) {
      setSaveError(error.message || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Failed to save step.', 'admin-coach-tours'));
    } finally {
      setIsSaving(false);
    }
  }, [tourId, step.id, title, content, completionType, completionParams, updateStep, onClose]);

  /**
   * Handle requesting AI draft.
   */
  const handleRequestAiDraft = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    if (step.target) {
      // Use the captured element context if available, otherwise build from step data.
      const elementContext = step.elementContext || {
        selector: step.target,
        stepId: step.id
      };

      // Add existing content for context.
      const contextWithExisting = {
        ...elementContext,
        existingTitle: title,
        existingContent: content
      };
      requestAiDraft(contextWithExisting, postType);
    }
  }, [step.id, step.target, step.elementContext, title, content, postType, requestAiDraft]);

  /**
   * Apply AI draft to form.
   */
  const handleApplyAiDraft = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    if (aiDraft) {
      if (aiDraft.title) {
        setTitle(aiDraft.title);
      }
      if (aiDraft.content) {
        setContent(aiDraft.content);
      }
      if (aiDraft.suggestedCompletion) {
        setCompletionType(aiDraft.suggestedCompletion.type);
        setCompletionParams(aiDraft.suggestedCompletion || {});
      }
      clearAiDraft();
    }
  }, [aiDraft, clearAiDraft]);

  /**
   * Handle re-picking target.
   */
  const handleRepickTarget = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(() => {
    startPicking(step.id);
  }, [step.id, startPicking]);

  /**
   * Update completion params.
   */
  const updateCompletionParam = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)((key, value) => {
    setCompletionParams(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Get current completion type info.
  const currentCompletionInfo = completionTypes.find(ct => ct.type === completionType);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
    className: "act-step-editor",
    children: [saveError && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Notice, {
      status: "error",
      isDismissible: false,
      children: saveError
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl, {
      __nextHasNoMarginBottom: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Target Element', 'admin-coach-tours'),
      className: "act-step-editor-target",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
        className: "act-target-info",
        children: step.target?.locators?.length > 0 ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("code", {
            className: "act-target-selector",
            children: step.target.locators[0].value
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Flex, {
            gap: 2,
            style: {
              marginTop: '8px'
            },
            children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
                variant: "secondary",
                size: "small",
                icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
                onClick: handleTestTarget,
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Test', 'admin-coach-tours')
              })
            }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
              children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
                variant: "tertiary",
                size: "small",
                onClick: handleRepickTarget,
                children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Re-pick', 'admin-coach-tours')
              })
            })]
          }), targetTestResult && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Notice, {
            status: targetTestResult.success ? 'success' : 'error',
            isDismissible: false,
            className: "act-target-test-result",
            children: targetTestResult.success ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Target found successfully!', 'admin-coach-tours') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Target not found. Consider re-picking.', 'admin-coach-tours')
          })]
        }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
          variant: "primary",
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          onClick: handleRepickTarget,
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Pick Target Element', 'admin-coach-tours')
        })
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Step Title', 'admin-coach-tours'),
      value: title,
      onChange: setTitle,
      placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('e.g., Click the Add Block button', 'admin-coach-tours')
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextareaControl, {
      __nextHasNoMarginBottom: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Step Content', 'admin-coach-tours'),
      value: content,
      onChange: setContent,
      placeholder: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Explain what the user should do and why…', 'admin-coach-tours'),
      rows: 4
    }), step.target && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.BaseControl, {
      __nextHasNoMarginBottom: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('AI Assistance', 'admin-coach-tours'),
      className: "act-ai-draft-section",
      children: [isAiDrafting ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Flex, {
        align: "center",
        gap: 2,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Spinner, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
          children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generating draft…', 'admin-coach-tours')
        })]
      }) : aiDraft ? /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
        className: "act-ai-draft",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
          className: "act-ai-draft-preview",
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("strong", {
            children: aiDraft.title
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("p", {
            children: [aiDraft.content?.substring(0, 100), "\u2026"]
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Flex, {
          gap: 2,
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
              variant: "primary",
              size: "small",
              icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"],
              onClick: handleApplyAiDraft,
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Apply', 'admin-coach-tours')
            })
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
            children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
              variant: "tertiary",
              size: "small",
              icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
              onClick: () => clearAiDraft(),
              children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Dismiss', 'admin-coach-tours')
            })
          })]
        })]
      }) : /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
        variant: "secondary",
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_7__["default"],
        onClick: handleRequestAiDraft,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Generate with AI', 'admin-coach-tours')
      }), aiDraftError && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Notice, {
        status: "error",
        isDismissible: false,
        children: aiDraftError
      })]
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.SelectControl, {
      __next40pxDefaultSize: true,
      __nextHasNoMarginBottom: true,
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Completion Condition', 'admin-coach-tours'),
      value: completionType,
      options: completionTypes.map(ct => ({
        value: ct.type,
        label: ct.label
      })),
      onChange: value => {
        setCompletionType(value);
        setCompletionParams({});
      },
      help: currentCompletionInfo?.description
    }), currentCompletionInfo?.params && currentCompletionInfo.params.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
      className: "act-completion-params",
      children: currentCompletionInfo.params.map(param => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.TextControl, {
        __next40pxDefaultSize: true,
        __nextHasNoMarginBottom: true,
        label: param.name,
        value: completionParams[param.name] || '',
        onChange: value => updateCompletionParam(param.name, value),
        help: param.description,
        required: param.required
      }, param.name))
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
      className: "act-step-editor-actions",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Flex, {
        justify: "flex-end",
        gap: 2,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
            variant: "tertiary",
            onClick: onClose,
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Cancel', 'admin-coach-tours')
          })
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
            variant: "primary",
            onClick: handleSave,
            isBusy: isSaving,
            disabled: isSaving || !title.trim(),
            children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Save Step', 'admin-coach-tours')
          })
        })]
      })
    })]
  });
}

/***/ },

/***/ "./assets/js/educator/StepList.tsx"
/*!*****************************************!*\
  !*** ./assets/js/educator/StepList.tsx ***!
  \*****************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ StepList)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/pencil.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/plus.mjs");
/* harmony import */ var _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/icons */ "./node_modules/@wordpress/icons/build-module/library/trash.mjs");
/* harmony import */ var _dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @dnd-kit/core */ "./node_modules/@dnd-kit/core/dist/core.esm.js");
/* harmony import */ var _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @dnd-kit/sortable */ "./node_modules/@dnd-kit/sortable/dist/sortable.esm.js");
/* harmony import */ var _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! @dnd-kit/utilities */ "./node_modules/@dnd-kit/utilities/dist/utilities.esm.js");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__);
/**
 * Step List Component.
 *
 * Displays sortable list of tour steps with drag-and-drop reordering.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */










const STORE_NAME = 'admin-coach-tours';

/**
 * Sortable step item component.
 */
function SortableStepItem({
  step,
  onEdit,
  onDelete
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = (0,_dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__.useSortable)({
    id: step.id
  });
  const style = {
    transform: _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_9__.CSS.Transform.toString(transform),
    transition: transition !== null && transition !== void 0 ? transition : undefined,
    opacity: isDragging ? 0.5 : 1
  };
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
    ref: setNodeRef,
    style: style,
    className: `act-step-item ${isDragging ? 'is-dragging' : ''}`,
    children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Flex, {
      align: "center",
      gap: 2,
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("button", {
          type: "button",
          className: "act-step-drag-handle",
          ...attributes,
          ...listeners,
          "aria-label": (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Drag to reorder', 'admin-coach-tours'),
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
            className: "dashicons dashicons-move",
            style: {
              width: 20,
              height: 20
            }
          })
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
        className: "act-step-order",
        children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("span", {
          className: "act-step-number",
          children: step.order + 1
        })
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexBlock, {
        className: "act-step-content",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
          className: "act-step-title",
          children: step.title || (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Untitled Step', 'admin-coach-tours')
        }), step.target?.locators?.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
          className: "act-step-target-info",
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("code", {
            children: [step.target.locators[0].value.substring(0, 30), step.target.locators[0].value.length > 30 ? '…' : '']
          })
        })]
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.FlexItem, {
        className: "act-step-actions",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_4__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Edit step', 'admin-coach-tours'),
          onClick: () => onEdit(step),
          size: "small"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
          icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_6__["default"],
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Delete step', 'admin-coach-tours'),
          onClick: () => onDelete(step.id),
          size: "small",
          isDestructive: true
        })]
      })]
    })
  });
}

/**
 * Step List component.
 */
function StepList({
  tourId,
  steps = [],
  onEditStep,
  onAddStep
}) {
  const {
    reorderSteps,
    deleteStep
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useDispatch)(STORE_NAME);

  // Configure drag sensors.
  const sensors = (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.useSensors)((0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.useSensor)(_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  }), (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.useSensor)(_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.KeyboardSensor, {
    coordinateGetter: _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__.sortableKeyboardCoordinates
  }));

  /**
   * Handle drag end.
   */
  const handleDragEnd = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(event => {
    const {
      active,
      over
    } = event;
    if (active.id !== over?.id) {
      const oldIndex = steps.findIndex(s => s.id === active.id);
      const newIndex = steps.findIndex(s => s.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = (0,_dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__.arrayMove)(steps.map(s => s.id), oldIndex, newIndex);
        reorderSteps(tourId, newOrder);
      }
    }
  }, [tourId, steps, reorderSteps]);

  /**
   * Handle delete step.
   */
  const handleDeleteStep = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_1__.useCallback)(stepId => {
    if (window.confirm((0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Are you sure you want to delete this step?', 'admin-coach-tours'))) {
      deleteStep(tourId, stepId);
    }
  }, [tourId, deleteStep]);
  if (steps.length === 0) {
    return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
      className: "act-step-list-empty",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("p", {
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('No steps yet. Click the button below to add your first step.', 'admin-coach-tours')
      }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
        variant: "primary",
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
        onClick: onAddStep,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Add First Step', 'admin-coach-tours')
      })]
    });
  }

  // Sort steps by order.
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsxs)("div", {
    className: "act-step-list",
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.DndContext, {
      sensors: sensors,
      collisionDetection: _dnd_kit_core__WEBPACK_IMPORTED_MODULE_7__.closestCenter,
      onDragEnd: handleDragEnd,
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__.SortableContext, {
        items: sortedSteps.map(s => s.id),
        strategy: _dnd_kit_sortable__WEBPACK_IMPORTED_MODULE_8__.verticalListSortingStrategy,
        children: sortedSteps.map(step => /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(SortableStepItem, {
          step: step,
          onEdit: onEditStep,
          onDelete: handleDeleteStep
        }, step.id))
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)("div", {
      className: "act-step-list-footer act-button-group",
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_10__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_3__.Button, {
        variant: "secondary",
        icon: _wordpress_icons__WEBPACK_IMPORTED_MODULE_5__["default"],
        onClick: onAddStep,
        children: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Add Step', 'admin-coach-tours')
      })
    })]
  });
}

/***/ },

/***/ "./assets/js/runtime/captureLocatorBundle.js"
/*!***************************************************!*\
  !*** ./assets/js/runtime/captureLocatorBundle.js ***!
  \***************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   captureElementContext: () => (/* binding */ captureElementContext),
/* harmony export */   captureLocatorBundle: () => (/* binding */ captureLocatorBundle),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * Capture locator bundle from a DOM element.
 *
 * Extracts multiple locator strategies from an element, prioritizing
 * stable identifiers (id, data-*) over generated classes.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */

/**
 * @typedef {import('../types/step.js').Locator} Locator
 * @typedef {import('../types/step.js').Target} Target
 */

/**
 * List of class name patterns to ignore (typically generated).
 */
const IGNORED_CLASS_PATTERNS = [/^css-/i,
// CSS-in-JS.
/^sc-/i,
// styled-components.
/^emotion-/i,
// Emotion.
/^_/i,
// Underscore prefixed (often generated).
/^jsx-/i,
// CSS Modules.
/^styles?__/i,
// Common generated pattern.
/^[a-z]{1,2}[0-9]+/i,
// Short hash-like.
/^[0-9]/i,
// Starts with number.
/^svelte-/i // Svelte.
];

/**
 * Check if a class name appears to be generated/unstable.
 *
 * @param {string} className Class name to check.
 * @return {boolean} True if likely generated.
 */
function isGeneratedClassName(className) {
  // Very short class names are often generated.
  if (className.length <= 3) {
    return true;
  }

  // Check against known patterns.
  return IGNORED_CLASS_PATTERNS.some(pattern => pattern.test(className));
}

/**
 * Filter class names to keep only stable ones.
 *
 * @param {string[]} classNames Array of class names.
 * @return {string[]} Filtered class names.
 */
function filterStableClassNames(classNames) {
  return classNames.filter(cn => !isGeneratedClassName(cn));
}

/**
 * Get relevant data attributes from an element.
 *
 * @param {HTMLElement} element Element to inspect.
 * @return {Object} Object of data attributes.
 */
function getDataAttributes(element) {
  const dataAttrs = {};
  const attrs = element.attributes;
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (attr.name.startsWith('data-')) {
      // Skip some common non-useful data attrs.
      const name = attr.name.slice(5);
      if (!['reactid', 'react-checksum', 'v-'].some(skip => name.startsWith(skip))) {
        dataAttrs[name] = attr.value;
      }
    }
  }
  return dataAttrs;
}

/**
 * Get ARIA role for an element (explicit or implicit).
 *
 * @param {HTMLElement} element Element to check.
 * @return {string|null} Role or null.
 */
function getRole(element) {
  // Explicit role.
  if (element.getAttribute('role')) {
    return element.getAttribute('role');
  }

  // Implicit roles based on tag.
  const tag = element.tagName.toLowerCase();
  const type = element.getAttribute('type');
  const implicitRoles = {
    button: 'button',
    a: element.hasAttribute('href') ? 'link' : null,
    input: {
      text: 'textbox',
      search: 'searchbox',
      email: 'textbox',
      url: 'textbox',
      tel: 'textbox',
      password: 'textbox',
      checkbox: 'checkbox',
      radio: 'radio',
      submit: 'button',
      button: 'button',
      reset: 'button',
      range: 'slider'
    },
    textarea: 'textbox',
    select: 'listbox',
    option: 'option',
    img: element.hasAttribute('alt') ? 'img' : null,
    nav: 'navigation',
    main: 'main',
    header: 'banner',
    footer: 'contentinfo',
    aside: 'complementary',
    form: 'form',
    h1: 'heading',
    h2: 'heading',
    h3: 'heading',
    h4: 'heading',
    h5: 'heading',
    h6: 'heading',
    ul: 'list',
    ol: 'list',
    li: 'listitem',
    table: 'table',
    dialog: 'dialog'
  };
  if (tag === 'input' && implicitRoles.input[type]) {
    return implicitRoles.input[type];
  }
  return implicitRoles[tag] || null;
}

/**
 * Get accessible name for an element.
 *
 * @param {HTMLElement} element Element to check.
 * @return {string|null} Accessible name or null.
 */
function getAccessibleName(element) {
  // aria-label.
  if (element.getAttribute('aria-label')) {
    return element.getAttribute('aria-label');
  }

  // aria-labelledby.
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelEl = document.getElementById(labelledBy);
    if (labelEl) {
      return labelEl.textContent?.trim() || null;
    }
  }

  // Associated label.
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) {
      return label.textContent?.trim() || null;
    }
  }

  // Title attribute.
  if (element.getAttribute('title')) {
    return element.getAttribute('title');
  }

  // Text content for buttons/links.
  const tag = element.tagName.toLowerCase();
  if (tag === 'button' || tag === 'a' || element.getAttribute('role') === 'button') {
    const text = element.textContent?.trim();
    if (text && text.length < 100) {
      return text;
    }
  }
  return null;
}

/**
 * Generate a CSS selector path for an element.
 *
 * @param {HTMLElement} element    Element to generate path for.
 * @param {number}      maxDepth   Maximum ancestor depth.
 * @return {string} CSS selector path.
 */
function generateCSSPath(element, maxDepth = 3) {
  const parts = [];
  let current = element;
  let depth = 0;
  while (current && current !== document.body && depth < maxDepth) {
    const tag = current.tagName.toLowerCase();

    // If element has ID, use it (most specific).
    if (current.id && depth === 0) {
      parts.unshift(`#${CSS.escape(current.id)}`);
      break;
    }

    // Build selector for this element.
    let selector = tag;

    // Add stable classes.
    const classes = Array.from(current.classList);
    const stableClasses = filterStableClassNames(classes);
    if (stableClasses.length > 0) {
      // Use first 2 stable classes max.
      selector += stableClasses.slice(0, 2).map(c => `.${CSS.escape(c)}`).join('');
    }

    // Add relevant attributes for uniqueness.
    const dataTestId = current.getAttribute('data-testid');
    if (dataTestId && depth === 0) {
      selector = `[${'data-testid'}="${dataTestId}"]`;
    } else {
      const type = current.getAttribute('type');
      if (type && tag === 'input') {
        selector += `[type="${type}"]`;
      }
      const name = current.getAttribute('name');
      if (name && ['input', 'select', 'textarea'].includes(tag)) {
        selector += `[name="${name}"]`;
      }
    }

    // Add nth-child if needed for disambiguation.
    if (current.parentElement && depth === 0) {
      const siblings = Array.from(current.parentElement.children).filter(el => el.tagName === current.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }
    parts.unshift(selector);
    current = current.parentElement;
    depth++;
  }
  return parts.join(' > ');
}

/**
 * Find the nearest landmark or semantic container.
 *
 * @param {HTMLElement} element Element to search from.
 * @param {number}      maxDepth Maximum depth to search.
 * @return {Object|null} Container info or null.
 */
function findNearestContainer(element, maxDepth = 5) {
  const landmarks = ['main', 'nav', 'aside', 'header', 'footer', 'section', 'article', 'form', 'dialog'];
  const landmarkRoles = ['main', 'navigation', 'complementary', 'banner', 'contentinfo', 'region', 'form', 'dialog', 'search'];
  let current = element.parentElement;
  let depth = 0;
  while (current && current !== document.body && depth < maxDepth) {
    const tag = current.tagName.toLowerCase();
    const role = current.getAttribute('role');

    // Check for landmark element or role.
    if (landmarks.includes(tag) || landmarkRoles.includes(role)) {
      let selector = tag;
      if (current.id) {
        selector = `#${CSS.escape(current.id)}`;
      } else if (role) {
        selector = `[${'role'}="${role}"]`;
      } else if (current.classList.length > 0) {
        const stableClasses = filterStableClassNames(Array.from(current.classList));
        if (stableClasses.length > 0) {
          selector += `.${CSS.escape(stableClasses[0])}`;
        }
      }
      return {
        element: current,
        selector,
        type: role || tag
      };
    }

    // Check for common container patterns.
    const commonContainers = ['edit-post-sidebar', 'block-editor', 'editor-styles-wrapper', 'components-popover', 'components-modal', 'interface-interface-skeleton'];
    for (const containerClass of commonContainers) {
      if (current.classList.contains(containerClass)) {
        return {
          element: current,
          selector: `.${containerClass}`,
          type: 'editor-region'
        };
      }
    }
    current = current.parentElement;
    depth++;
  }
  return null;
}

/**
 * Check if an ID appears to be a unique/generated ID (like block UUIDs).
 *
 * @param {string} id The ID to check.
 * @return {boolean} True if the ID appears unique/generated.
 */
function isUniqueId(id) {
  if (!id) {
    return true;
  }

  // Block IDs like "block-b435bbd5-7189-4126-bfdc-54e2f014ce08"
  if (/^block-[a-f0-9-]{36}$/i.test(id)) {
    return true;
  }

  // Generic UUIDs
  if (/^[a-f0-9-]{36}$/i.test(id)) {
    return true;
  }

  // Random hash-like IDs (more than 8 hex chars)
  if (/^[a-f0-9]{8,}$/i.test(id)) {
    return true;
  }

  // IDs with common unique patterns
  if (/[-_][a-f0-9]{8,}/i.test(id)) {
    return true;
  }
  return false;
}

/**
 * Capture a complete locator bundle from an element.
 *
 * @param {HTMLElement} element Target element.
 * @return {Target} Target configuration with locators and constraints.
 */
function captureLocatorBundle(element, options = {}) {
  const {
    inEditorIframe = false
  } = options;
  const locators = [];
  const constraints = {
    visible: true
  };

  // If element is in editor iframe, mark it.
  if (inEditorIframe) {
    constraints.inEditorIframe = true;
  }

  // 1. data-testid (highest priority).
  const testId = element.getAttribute('data-testid');
  if (testId && !isUniqueId(testId)) {
    locators.push({
      type: 'testId',
      value: testId,
      weight: 100,
      fallback: false
    });
  }

  // 2. ID-based CSS selector (skip unique IDs).
  if (element.id && !isUniqueId(element.id)) {
    locators.push({
      type: 'css',
      value: `#${CSS.escape(element.id)}`,
      weight: 95,
      fallback: false
    });
  }

  // 3. Role + accessible name.
  const role = getRole(element);
  const accessibleName = getAccessibleName(element);
  if (role) {
    const roleValue = accessibleName ? `${role}:${accessibleName}` : role;
    locators.push({
      type: 'role',
      value: roleValue,
      weight: 80,
      fallback: false
    });
  }

  // 4. Data attributes (skip unique values like block IDs).
  const dataAttrs = getDataAttributes(element);
  for (const [key, value] of Object.entries(dataAttrs)) {
    // Skip testid (already handled) and common non-useful ones.
    if (key === 'testid' || key === 'reactid') {
      continue;
    }

    // Skip unique block IDs - use the type instead.
    if (key === 'block' && value && /^[a-f0-9-]{36}$/i.test(value)) {
      continue;
    }

    // Prioritize block type (stable across pages).
    const weight = key === 'type' ? 85 : key.startsWith('wp-') ? 75 : 70;
    locators.push({
      type: 'dataAttribute',
      value: value ? `${key}:${value}` : key,
      weight,
      fallback: false
    });

    // Only add first 2 data attribute locators.
    if (locators.filter(l => l.type === 'dataAttribute').length >= 2) {
      break;
    }
  }

  // 5. CSS path (medium priority).
  const cssPath = generateCSSPath(element, 3);
  if (cssPath) {
    locators.push({
      type: 'css',
      value: cssPath,
      weight: 60,
      fallback: false
    });
  }

  // 6. aria-label (fallback - not recommended as primary).
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    locators.push({
      type: 'ariaLabel',
      value: ariaLabel,
      weight: 40,
      fallback: true // Mark as fallback due to i18n concerns.
    });
  }

  // 7. Contextual selector with container.
  const container = findNearestContainer(element);
  if (container) {
    constraints.withinContainer = container.selector;

    // Generate simpler selector within container.
    const tag = element.tagName.toLowerCase();
    const stableClasses = filterStableClassNames(Array.from(element.classList));
    let innerSelector = tag;
    if (stableClasses.length > 0) {
      innerSelector += `.${CSS.escape(stableClasses[0])}`;
    }
    locators.push({
      type: 'contextual',
      value: `${container.selector} >> ${innerSelector}`,
      weight: 50,
      fallback: true
    });

    // For Gutenberg blocks, add a :first-of-type fallback.
    const blockType = element.getAttribute('data-type');
    if (blockType) {
      locators.push({
        type: 'css',
        value: `[data-type="${blockType}"]:first-of-type`,
        weight: 45,
        fallback: true
      });
    }
  }

  // Ensure we have at least one locator.
  if (locators.length === 0) {
    // Last resort: tag + nth-child.
    const tag = element.tagName.toLowerCase();
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element) + 1;
      locators.push({
        type: 'css',
        value: `${tag}:nth-child(${index})`,
        weight: 10,
        fallback: true
      });
    }
  }

  // Sort by weight descending.
  locators.sort((a, b) => (b.weight || 50) - (a.weight || 50));
  return {
    locators,
    constraints
  };
}

/**
 * Get element context for AI drafting.
 * Minimizes data sent while providing enough context.
 *
 * @param {HTMLElement} element Target element.
 * @return {Object} Minimal element context.
 */
function captureElementContext(element) {
  const context = {
    tagName: element.tagName.toLowerCase()
  };

  // Role.
  const role = getRole(element);
  if (role) {
    context.role = role;
  }

  // ID (but not if it looks generated).
  if (element.id && !/^[a-z0-9_-]{20,}$/i.test(element.id)) {
    context.id = element.id;
  }

  // Stable class names.
  const stableClasses = filterStableClassNames(Array.from(element.classList));
  if (stableClasses.length > 0) {
    context.classNames = stableClasses.slice(0, 5);
  }

  // Text content (trimmed, limited).
  const text = element.textContent?.trim();
  if (text && text.length <= 200) {
    context.textContent = text;
  } else if (text) {
    context.textContent = `${text.slice(0, 197)}...`;
  }

  // Placeholder for inputs.
  if (element.placeholder) {
    context.placeholder = element.placeholder;
  }

  // Associated label.
  const label = getAccessibleName(element);
  if (label && label !== context.textContent) {
    context.label = label;
  }

  // Relevant data attributes.
  const dataAttrs = getDataAttributes(element);
  const relevantDataKeys = Object.keys(dataAttrs).filter(key => key.startsWith('wp-') || key === 'block' || key === 'type' || key === 'testid');
  if (relevantDataKeys.length > 0) {
    context.dataAttrs = {};
    relevantDataKeys.forEach(key => {
      context.dataAttrs[key] = dataAttrs[key];
    });
  }

  // Ancestor context (up to 3 levels).
  const ancestors = [];
  let current = element.parentElement;
  let depth = 0;
  while (current && current !== document.body && depth < 3) {
    const ancestorInfo = {
      tagName: current.tagName.toLowerCase()
    };
    const ancestorRole = getRole(current);
    if (ancestorRole) {
      ancestorInfo.role = ancestorRole;
    }
    if (current.id && !/^[a-z0-9_-]{20,}$/i.test(current.id)) {
      ancestorInfo.id = current.id;
    }
    const ancestorClasses = filterStableClassNames(Array.from(current.classList));
    if (ancestorClasses.length > 0) {
      ancestorInfo.classNames = ancestorClasses.slice(0, 3);
    }
    ancestors.push(ancestorInfo);
    current = current.parentElement;
    depth++;
  }
  if (ancestors.length > 0) {
    context.ancestors = ancestors;
  }
  return context;
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (captureLocatorBundle);

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
 * @param {string} taskId   Predefined task ID (optional).
 * @param {string} query    Freeform user query (optional).
 * @param {string} postType Current post type.
 * @return {Generator} Generator that handles AI tour generation.
 */
function* requestAiTour(taskId, query, postType) {
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
      editorContext
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
   * @param {Object} action Action with taskId, query, postType, and editorContext.
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
        editorContext: action.editorContext || null
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
  ephemeralTour: null
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
  CLEAR_EPHEMERAL_TOUR: 'CLEAR_EPHEMERAL_TOUR'
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
        // Remove from tours.
        tours: Object.fromEntries(Object.entries(state.tours).filter(([key]) => key !== 'ephemeral'))
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

/***/ "./node_modules/@dnd-kit/accessibility/dist/accessibility.esm.js"
/*!***********************************************************************!*\
  !*** ./node_modules/@dnd-kit/accessibility/dist/accessibility.esm.js ***!
  \***********************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HiddenText: () => (/* binding */ HiddenText),
/* harmony export */   LiveRegion: () => (/* binding */ LiveRegion),
/* harmony export */   useAnnouncement: () => (/* binding */ useAnnouncement)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


const hiddenStyles = {
  display: 'none'
};
function HiddenText(_ref) {
  let {
    id,
    value
  } = _ref;
  return react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    id: id,
    style: hiddenStyles
  }, value);
}

function LiveRegion(_ref) {
  let {
    id,
    announcement,
    ariaLiveType = "assertive"
  } = _ref;
  // Hide element visually but keep it readable by screen readers
  const visuallyHidden = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    margin: -1,
    border: 0,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(100%)',
    whiteSpace: 'nowrap'
  };
  return react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    id: id,
    style: visuallyHidden,
    role: "status",
    "aria-live": ariaLiveType,
    "aria-atomic": true
  }, announcement);
}

function useAnnouncement() {
  const [announcement, setAnnouncement] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const announce = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(value => {
    if (value != null) {
      setAnnouncement(value);
    }
  }, []);
  return {
    announce,
    announcement
  };
}


//# sourceMappingURL=accessibility.esm.js.map


/***/ },

/***/ "./node_modules/@dnd-kit/core/dist/core.esm.js"
/*!*****************************************************!*\
  !*** ./node_modules/@dnd-kit/core/dist/core.esm.js ***!
  \*****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AutoScrollActivator: () => (/* binding */ AutoScrollActivator),
/* harmony export */   DndContext: () => (/* binding */ DndContext),
/* harmony export */   DragOverlay: () => (/* binding */ DragOverlay),
/* harmony export */   KeyboardCode: () => (/* binding */ KeyboardCode),
/* harmony export */   KeyboardSensor: () => (/* binding */ KeyboardSensor),
/* harmony export */   MeasuringFrequency: () => (/* binding */ MeasuringFrequency),
/* harmony export */   MeasuringStrategy: () => (/* binding */ MeasuringStrategy),
/* harmony export */   MouseSensor: () => (/* binding */ MouseSensor),
/* harmony export */   PointerSensor: () => (/* binding */ PointerSensor),
/* harmony export */   TouchSensor: () => (/* binding */ TouchSensor),
/* harmony export */   TraversalOrder: () => (/* binding */ TraversalOrder),
/* harmony export */   applyModifiers: () => (/* binding */ applyModifiers),
/* harmony export */   closestCenter: () => (/* binding */ closestCenter),
/* harmony export */   closestCorners: () => (/* binding */ closestCorners),
/* harmony export */   defaultAnnouncements: () => (/* binding */ defaultAnnouncements),
/* harmony export */   defaultCoordinates: () => (/* binding */ defaultCoordinates),
/* harmony export */   defaultDropAnimation: () => (/* binding */ defaultDropAnimationConfiguration),
/* harmony export */   defaultDropAnimationSideEffects: () => (/* binding */ defaultDropAnimationSideEffects),
/* harmony export */   defaultKeyboardCoordinateGetter: () => (/* binding */ defaultKeyboardCoordinateGetter),
/* harmony export */   defaultScreenReaderInstructions: () => (/* binding */ defaultScreenReaderInstructions),
/* harmony export */   getClientRect: () => (/* binding */ getClientRect),
/* harmony export */   getFirstCollision: () => (/* binding */ getFirstCollision),
/* harmony export */   getScrollableAncestors: () => (/* binding */ getScrollableAncestors),
/* harmony export */   pointerWithin: () => (/* binding */ pointerWithin),
/* harmony export */   rectIntersection: () => (/* binding */ rectIntersection),
/* harmony export */   useDndContext: () => (/* binding */ useDndContext),
/* harmony export */   useDndMonitor: () => (/* binding */ useDndMonitor),
/* harmony export */   useDraggable: () => (/* binding */ useDraggable),
/* harmony export */   useDroppable: () => (/* binding */ useDroppable),
/* harmony export */   useSensor: () => (/* binding */ useSensor),
/* harmony export */   useSensors: () => (/* binding */ useSensors)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dnd-kit/utilities */ "./node_modules/@dnd-kit/utilities/dist/utilities.esm.js");
/* harmony import */ var _dnd_kit_accessibility__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @dnd-kit/accessibility */ "./node_modules/@dnd-kit/accessibility/dist/accessibility.esm.js");





const DndMonitorContext = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(null);

function useDndMonitor(listener) {
  const registerListener = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(DndMonitorContext);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!registerListener) {
      throw new Error('useDndMonitor must be used within a children of <DndContext>');
    }

    const unsubscribe = registerListener(listener);
    return unsubscribe;
  }, [listener, registerListener]);
}

function useDndMonitorProvider() {
  const [listeners] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(() => new Set());
  const registerListener = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(listener => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [listeners]);
  const dispatch = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(_ref => {
    let {
      type,
      event
    } = _ref;
    listeners.forEach(listener => {
      var _listener$type;

      return (_listener$type = listener[type]) == null ? void 0 : _listener$type.call(listener, event);
    });
  }, [listeners]);
  return [dispatch, registerListener];
}

const defaultScreenReaderInstructions = {
  draggable: "\n    To pick up a draggable item, press the space bar.\n    While dragging, use the arrow keys to move the item.\n    Press space again to drop the item in its new position, or press escape to cancel.\n  "
};
const defaultAnnouncements = {
  onDragStart(_ref) {
    let {
      active
    } = _ref;
    return "Picked up draggable item " + active.id + ".";
  },

  onDragOver(_ref2) {
    let {
      active,
      over
    } = _ref2;

    if (over) {
      return "Draggable item " + active.id + " was moved over droppable area " + over.id + ".";
    }

    return "Draggable item " + active.id + " is no longer over a droppable area.";
  },

  onDragEnd(_ref3) {
    let {
      active,
      over
    } = _ref3;

    if (over) {
      return "Draggable item " + active.id + " was dropped over droppable area " + over.id;
    }

    return "Draggable item " + active.id + " was dropped.";
  },

  onDragCancel(_ref4) {
    let {
      active
    } = _ref4;
    return "Dragging was cancelled. Draggable item " + active.id + " was dropped.";
  }

};

function Accessibility(_ref) {
  let {
    announcements = defaultAnnouncements,
    container,
    hiddenTextDescribedById,
    screenReaderInstructions = defaultScreenReaderInstructions
  } = _ref;
  const {
    announce,
    announcement
  } = (0,_dnd_kit_accessibility__WEBPACK_IMPORTED_MODULE_3__.useAnnouncement)();
  const liveRegionId = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useUniqueId)("DndLiveRegion");
  const [mounted, setMounted] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    setMounted(true);
  }, []);
  useDndMonitor((0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    onDragStart(_ref2) {
      let {
        active
      } = _ref2;
      announce(announcements.onDragStart({
        active
      }));
    },

    onDragMove(_ref3) {
      let {
        active,
        over
      } = _ref3;

      if (announcements.onDragMove) {
        announce(announcements.onDragMove({
          active,
          over
        }));
      }
    },

    onDragOver(_ref4) {
      let {
        active,
        over
      } = _ref4;
      announce(announcements.onDragOver({
        active,
        over
      }));
    },

    onDragEnd(_ref5) {
      let {
        active,
        over
      } = _ref5;
      announce(announcements.onDragEnd({
        active,
        over
      }));
    },

    onDragCancel(_ref6) {
      let {
        active,
        over
      } = _ref6;
      announce(announcements.onDragCancel({
        active,
        over
      }));
    }

  }), [announce, announcements]));

  if (!mounted) {
    return null;
  }

  const markup = react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_dnd_kit_accessibility__WEBPACK_IMPORTED_MODULE_3__.HiddenText, {
    id: hiddenTextDescribedById,
    value: screenReaderInstructions.draggable
  }), react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_dnd_kit_accessibility__WEBPACK_IMPORTED_MODULE_3__.LiveRegion, {
    id: liveRegionId,
    announcement: announcement
  }));
  return container ? (0,react_dom__WEBPACK_IMPORTED_MODULE_1__.createPortal)(markup, container) : markup;
}

var Action;

(function (Action) {
  Action["DragStart"] = "dragStart";
  Action["DragMove"] = "dragMove";
  Action["DragEnd"] = "dragEnd";
  Action["DragCancel"] = "dragCancel";
  Action["DragOver"] = "dragOver";
  Action["RegisterDroppable"] = "registerDroppable";
  Action["SetDroppableDisabled"] = "setDroppableDisabled";
  Action["UnregisterDroppable"] = "unregisterDroppable";
})(Action || (Action = {}));

function noop() {}

function useSensor(sensor, options) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    sensor,
    options: options != null ? options : {}
  }), // eslint-disable-next-line react-hooks/exhaustive-deps
  [sensor, options]);
}

function useSensors() {
  for (var _len = arguments.length, sensors = new Array(_len), _key = 0; _key < _len; _key++) {
    sensors[_key] = arguments[_key];
  }

  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => [...sensors].filter(sensor => sensor != null), // eslint-disable-next-line react-hooks/exhaustive-deps
  [...sensors]);
}

const defaultCoordinates = /*#__PURE__*/Object.freeze({
  x: 0,
  y: 0
});

/**
 * Returns the distance between two points
 */
function distanceBetween(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getRelativeTransformOrigin(event, rect) {
  const eventCoordinates = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getEventCoordinates)(event);

  if (!eventCoordinates) {
    return '0 0';
  }

  const transformOrigin = {
    x: (eventCoordinates.x - rect.left) / rect.width * 100,
    y: (eventCoordinates.y - rect.top) / rect.height * 100
  };
  return transformOrigin.x + "% " + transformOrigin.y + "%";
}

/**
 * Sort collisions from smallest to greatest value
 */
function sortCollisionsAsc(_ref, _ref2) {
  let {
    data: {
      value: a
    }
  } = _ref;
  let {
    data: {
      value: b
    }
  } = _ref2;
  return a - b;
}
/**
 * Sort collisions from greatest to smallest value
 */

function sortCollisionsDesc(_ref3, _ref4) {
  let {
    data: {
      value: a
    }
  } = _ref3;
  let {
    data: {
      value: b
    }
  } = _ref4;
  return b - a;
}
/**
 * Returns the coordinates of the corners of a given rectangle:
 * [TopLeft {x, y}, TopRight {x, y}, BottomLeft {x, y}, BottomRight {x, y}]
 */

function cornersOfRectangle(_ref5) {
  let {
    left,
    top,
    height,
    width
  } = _ref5;
  return [{
    x: left,
    y: top
  }, {
    x: left + width,
    y: top
  }, {
    x: left,
    y: top + height
  }, {
    x: left + width,
    y: top + height
  }];
}
function getFirstCollision(collisions, property) {
  if (!collisions || collisions.length === 0) {
    return null;
  }

  const [firstCollision] = collisions;
  return property ? firstCollision[property] : firstCollision;
}

/**
 * Returns the coordinates of the center of a given ClientRect
 */

function centerOfRectangle(rect, left, top) {
  if (left === void 0) {
    left = rect.left;
  }

  if (top === void 0) {
    top = rect.top;
  }

  return {
    x: left + rect.width * 0.5,
    y: top + rect.height * 0.5
  };
}
/**
 * Returns the closest rectangles from an array of rectangles to the center of a given
 * rectangle.
 */


const closestCenter = _ref => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const centerRect = centerOfRectangle(collisionRect, collisionRect.left, collisionRect.top);
  const collisions = [];

  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);

    if (rect) {
      const distBetween = distanceBetween(centerOfRectangle(rect), centerRect);
      collisions.push({
        id,
        data: {
          droppableContainer,
          value: distBetween
        }
      });
    }
  }

  return collisions.sort(sortCollisionsAsc);
};

/**
 * Returns the closest rectangles from an array of rectangles to the corners of
 * another rectangle.
 */

const closestCorners = _ref => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const corners = cornersOfRectangle(collisionRect);
  const collisions = [];

  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);

    if (rect) {
      const rectCorners = cornersOfRectangle(rect);
      const distances = corners.reduce((accumulator, corner, index) => {
        return accumulator + distanceBetween(rectCorners[index], corner);
      }, 0);
      const effectiveDistance = Number((distances / 4).toFixed(4));
      collisions.push({
        id,
        data: {
          droppableContainer,
          value: effectiveDistance
        }
      });
    }
  }

  return collisions.sort(sortCollisionsAsc);
};

/**
 * Returns the intersecting rectangle area between two rectangles
 */

function getIntersectionRatio(entry, target) {
  const top = Math.max(target.top, entry.top);
  const left = Math.max(target.left, entry.left);
  const right = Math.min(target.left + target.width, entry.left + entry.width);
  const bottom = Math.min(target.top + target.height, entry.top + entry.height);
  const width = right - left;
  const height = bottom - top;

  if (left < right && top < bottom) {
    const targetArea = target.width * target.height;
    const entryArea = entry.width * entry.height;
    const intersectionArea = width * height;
    const intersectionRatio = intersectionArea / (targetArea + entryArea - intersectionArea);
    return Number(intersectionRatio.toFixed(4));
  } // Rectangles do not overlap, or overlap has an area of zero (edge/corner overlap)


  return 0;
}
/**
 * Returns the rectangles that has the greatest intersection area with a given
 * rectangle in an array of rectangles.
 */

const rectIntersection = _ref => {
  let {
    collisionRect,
    droppableRects,
    droppableContainers
  } = _ref;
  const collisions = [];

  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);

    if (rect) {
      const intersectionRatio = getIntersectionRatio(rect, collisionRect);

      if (intersectionRatio > 0) {
        collisions.push({
          id,
          data: {
            droppableContainer,
            value: intersectionRatio
          }
        });
      }
    }
  }

  return collisions.sort(sortCollisionsDesc);
};

/**
 * Check if a given point is contained within a bounding rectangle
 */

function isPointWithinRect(point, rect) {
  const {
    top,
    left,
    bottom,
    right
  } = rect;
  return top <= point.y && point.y <= bottom && left <= point.x && point.x <= right;
}
/**
 * Returns the rectangles that the pointer is hovering over
 */


const pointerWithin = _ref => {
  let {
    droppableContainers,
    droppableRects,
    pointerCoordinates
  } = _ref;

  if (!pointerCoordinates) {
    return [];
  }

  const collisions = [];

  for (const droppableContainer of droppableContainers) {
    const {
      id
    } = droppableContainer;
    const rect = droppableRects.get(id);

    if (rect && isPointWithinRect(pointerCoordinates, rect)) {
      /* There may be more than a single rectangle intersecting
       * with the pointer coordinates. In order to sort the
       * colliding rectangles, we measure the distance between
       * the pointer and the corners of the intersecting rectangle
       */
      const corners = cornersOfRectangle(rect);
      const distances = corners.reduce((accumulator, corner) => {
        return accumulator + distanceBetween(pointerCoordinates, corner);
      }, 0);
      const effectiveDistance = Number((distances / 4).toFixed(4));
      collisions.push({
        id,
        data: {
          droppableContainer,
          value: effectiveDistance
        }
      });
    }
  }

  return collisions.sort(sortCollisionsAsc);
};

function adjustScale(transform, rect1, rect2) {
  return { ...transform,
    scaleX: rect1 && rect2 ? rect1.width / rect2.width : 1,
    scaleY: rect1 && rect2 ? rect1.height / rect2.height : 1
  };
}

function getRectDelta(rect1, rect2) {
  return rect1 && rect2 ? {
    x: rect1.left - rect2.left,
    y: rect1.top - rect2.top
  } : defaultCoordinates;
}

function createRectAdjustmentFn(modifier) {
  return function adjustClientRect(rect) {
    for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      adjustments[_key - 1] = arguments[_key];
    }

    return adjustments.reduce((acc, adjustment) => ({ ...acc,
      top: acc.top + modifier * adjustment.y,
      bottom: acc.bottom + modifier * adjustment.y,
      left: acc.left + modifier * adjustment.x,
      right: acc.right + modifier * adjustment.x
    }), { ...rect
    });
  };
}
const getAdjustedRect = /*#__PURE__*/createRectAdjustmentFn(1);

function parseTransform(transform) {
  if (transform.startsWith('matrix3d(')) {
    const transformArray = transform.slice(9, -1).split(/, /);
    return {
      x: +transformArray[12],
      y: +transformArray[13],
      scaleX: +transformArray[0],
      scaleY: +transformArray[5]
    };
  } else if (transform.startsWith('matrix(')) {
    const transformArray = transform.slice(7, -1).split(/, /);
    return {
      x: +transformArray[4],
      y: +transformArray[5],
      scaleX: +transformArray[0],
      scaleY: +transformArray[3]
    };
  }

  return null;
}

function inverseTransform(rect, transform, transformOrigin) {
  const parsedTransform = parseTransform(transform);

  if (!parsedTransform) {
    return rect;
  }

  const {
    scaleX,
    scaleY,
    x: translateX,
    y: translateY
  } = parsedTransform;
  const x = rect.left - translateX - (1 - scaleX) * parseFloat(transformOrigin);
  const y = rect.top - translateY - (1 - scaleY) * parseFloat(transformOrigin.slice(transformOrigin.indexOf(' ') + 1));
  const w = scaleX ? rect.width / scaleX : rect.width;
  const h = scaleY ? rect.height / scaleY : rect.height;
  return {
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x
  };
}

const defaultOptions = {
  ignoreTransform: false
};
/**
 * Returns the bounding client rect of an element relative to the viewport.
 */

function getClientRect(element, options) {
  if (options === void 0) {
    options = defaultOptions;
  }

  let rect = element.getBoundingClientRect();

  if (options.ignoreTransform) {
    const {
      transform,
      transformOrigin
    } = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getWindow)(element).getComputedStyle(element);

    if (transform) {
      rect = inverseTransform(rect, transform, transformOrigin);
    }
  }

  const {
    top,
    left,
    width,
    height,
    bottom,
    right
  } = rect;
  return {
    top,
    left,
    width,
    height,
    bottom,
    right
  };
}
/**
 * Returns the bounding client rect of an element relative to the viewport.
 *
 * @remarks
 * The ClientRect returned by this method does not take into account transforms
 * applied to the element it measures.
 *
 */

function getTransformAgnosticClientRect(element) {
  return getClientRect(element, {
    ignoreTransform: true
  });
}

function getWindowClientRect(element) {
  const width = element.innerWidth;
  const height = element.innerHeight;
  return {
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    width,
    height
  };
}

function isFixed(node, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getWindow)(node).getComputedStyle(node);
  }

  return computedStyle.position === 'fixed';
}

function isScrollable(element, computedStyle) {
  if (computedStyle === void 0) {
    computedStyle = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getWindow)(element).getComputedStyle(element);
  }

  const overflowRegex = /(auto|scroll|overlay)/;
  const properties = ['overflow', 'overflowX', 'overflowY'];
  return properties.some(property => {
    const value = computedStyle[property];
    return typeof value === 'string' ? overflowRegex.test(value) : false;
  });
}

function getScrollableAncestors(element, limit) {
  const scrollParents = [];

  function findScrollableAncestors(node) {
    if (limit != null && scrollParents.length >= limit) {
      return scrollParents;
    }

    if (!node) {
      return scrollParents;
    }

    if ((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isDocument)(node) && node.scrollingElement != null && !scrollParents.includes(node.scrollingElement)) {
      scrollParents.push(node.scrollingElement);
      return scrollParents;
    }

    if (!(0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isHTMLElement)(node) || (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isSVGElement)(node)) {
      return scrollParents;
    }

    if (scrollParents.includes(node)) {
      return scrollParents;
    }

    const computedStyle = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getWindow)(element).getComputedStyle(node);

    if (node !== element) {
      if (isScrollable(node, computedStyle)) {
        scrollParents.push(node);
      }
    }

    if (isFixed(node, computedStyle)) {
      return scrollParents;
    }

    return findScrollableAncestors(node.parentNode);
  }

  if (!element) {
    return scrollParents;
  }

  return findScrollableAncestors(element);
}
function getFirstScrollableAncestor(node) {
  const [firstScrollableAncestor] = getScrollableAncestors(node, 1);
  return firstScrollableAncestor != null ? firstScrollableAncestor : null;
}

function getScrollableElement(element) {
  if (!_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.canUseDOM || !element) {
    return null;
  }

  if ((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isWindow)(element)) {
    return element;
  }

  if (!(0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isNode)(element)) {
    return null;
  }

  if ((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isDocument)(element) || element === (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getOwnerDocument)(element).scrollingElement) {
    return window;
  }

  if ((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isHTMLElement)(element)) {
    return element;
  }

  return null;
}

function getScrollXCoordinate(element) {
  if ((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isWindow)(element)) {
    return element.scrollX;
  }

  return element.scrollLeft;
}
function getScrollYCoordinate(element) {
  if ((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isWindow)(element)) {
    return element.scrollY;
  }

  return element.scrollTop;
}
function getScrollCoordinates(element) {
  return {
    x: getScrollXCoordinate(element),
    y: getScrollYCoordinate(element)
  };
}

var Direction;

(function (Direction) {
  Direction[Direction["Forward"] = 1] = "Forward";
  Direction[Direction["Backward"] = -1] = "Backward";
})(Direction || (Direction = {}));

function isDocumentScrollingElement(element) {
  if (!_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.canUseDOM || !element) {
    return false;
  }

  return element === document.scrollingElement;
}

function getScrollPosition(scrollingContainer) {
  const minScroll = {
    x: 0,
    y: 0
  };
  const dimensions = isDocumentScrollingElement(scrollingContainer) ? {
    height: window.innerHeight,
    width: window.innerWidth
  } : {
    height: scrollingContainer.clientHeight,
    width: scrollingContainer.clientWidth
  };
  const maxScroll = {
    x: scrollingContainer.scrollWidth - dimensions.width,
    y: scrollingContainer.scrollHeight - dimensions.height
  };
  const isTop = scrollingContainer.scrollTop <= minScroll.y;
  const isLeft = scrollingContainer.scrollLeft <= minScroll.x;
  const isBottom = scrollingContainer.scrollTop >= maxScroll.y;
  const isRight = scrollingContainer.scrollLeft >= maxScroll.x;
  return {
    isTop,
    isLeft,
    isBottom,
    isRight,
    maxScroll,
    minScroll
  };
}

const defaultThreshold = {
  x: 0.2,
  y: 0.2
};
function getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, _ref, acceleration, thresholdPercentage) {
  let {
    top,
    left,
    right,
    bottom
  } = _ref;

  if (acceleration === void 0) {
    acceleration = 10;
  }

  if (thresholdPercentage === void 0) {
    thresholdPercentage = defaultThreshold;
  }

  const {
    isTop,
    isBottom,
    isLeft,
    isRight
  } = getScrollPosition(scrollContainer);
  const direction = {
    x: 0,
    y: 0
  };
  const speed = {
    x: 0,
    y: 0
  };
  const threshold = {
    height: scrollContainerRect.height * thresholdPercentage.y,
    width: scrollContainerRect.width * thresholdPercentage.x
  };

  if (!isTop && top <= scrollContainerRect.top + threshold.height) {
    // Scroll Up
    direction.y = Direction.Backward;
    speed.y = acceleration * Math.abs((scrollContainerRect.top + threshold.height - top) / threshold.height);
  } else if (!isBottom && bottom >= scrollContainerRect.bottom - threshold.height) {
    // Scroll Down
    direction.y = Direction.Forward;
    speed.y = acceleration * Math.abs((scrollContainerRect.bottom - threshold.height - bottom) / threshold.height);
  }

  if (!isRight && right >= scrollContainerRect.right - threshold.width) {
    // Scroll Right
    direction.x = Direction.Forward;
    speed.x = acceleration * Math.abs((scrollContainerRect.right - threshold.width - right) / threshold.width);
  } else if (!isLeft && left <= scrollContainerRect.left + threshold.width) {
    // Scroll Left
    direction.x = Direction.Backward;
    speed.x = acceleration * Math.abs((scrollContainerRect.left + threshold.width - left) / threshold.width);
  }

  return {
    direction,
    speed
  };
}

function getScrollElementRect(element) {
  if (element === document.scrollingElement) {
    const {
      innerWidth,
      innerHeight
    } = window;
    return {
      top: 0,
      left: 0,
      right: innerWidth,
      bottom: innerHeight,
      width: innerWidth,
      height: innerHeight
    };
  }

  const {
    top,
    left,
    right,
    bottom
  } = element.getBoundingClientRect();
  return {
    top,
    left,
    right,
    bottom,
    width: element.clientWidth,
    height: element.clientHeight
  };
}

function getScrollOffsets(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.add)(acc, getScrollCoordinates(node));
  }, defaultCoordinates);
}
function getScrollXOffset(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return acc + getScrollXCoordinate(node);
  }, 0);
}
function getScrollYOffset(scrollableAncestors) {
  return scrollableAncestors.reduce((acc, node) => {
    return acc + getScrollYCoordinate(node);
  }, 0);
}

function scrollIntoViewIfNeeded(element, measure) {
  if (measure === void 0) {
    measure = getClientRect;
  }

  if (!element) {
    return;
  }

  const {
    top,
    left,
    bottom,
    right
  } = measure(element);
  const firstScrollableAncestor = getFirstScrollableAncestor(element);

  if (!firstScrollableAncestor) {
    return;
  }

  if (bottom <= 0 || right <= 0 || top >= window.innerHeight || left >= window.innerWidth) {
    element.scrollIntoView({
      block: 'center',
      inline: 'center'
    });
  }
}

const properties = [['x', ['left', 'right'], getScrollXOffset], ['y', ['top', 'bottom'], getScrollYOffset]];
class Rect {
  constructor(rect, element) {
    this.rect = void 0;
    this.width = void 0;
    this.height = void 0;
    this.top = void 0;
    this.bottom = void 0;
    this.right = void 0;
    this.left = void 0;
    const scrollableAncestors = getScrollableAncestors(element);
    const scrollOffsets = getScrollOffsets(scrollableAncestors);
    this.rect = { ...rect
    };
    this.width = rect.width;
    this.height = rect.height;

    for (const [axis, keys, getScrollOffset] of properties) {
      for (const key of keys) {
        Object.defineProperty(this, key, {
          get: () => {
            const currentOffsets = getScrollOffset(scrollableAncestors);
            const scrollOffsetsDeltla = scrollOffsets[axis] - currentOffsets;
            return this.rect[key] + scrollOffsetsDeltla;
          },
          enumerable: true
        });
      }
    }

    Object.defineProperty(this, 'rect', {
      enumerable: false
    });
  }

}

class Listeners {
  constructor(target) {
    this.target = void 0;
    this.listeners = [];

    this.removeAll = () => {
      this.listeners.forEach(listener => {
        var _this$target;

        return (_this$target = this.target) == null ? void 0 : _this$target.removeEventListener(...listener);
      });
    };

    this.target = target;
  }

  add(eventName, handler, options) {
    var _this$target2;

    (_this$target2 = this.target) == null ? void 0 : _this$target2.addEventListener(eventName, handler, options);
    this.listeners.push([eventName, handler, options]);
  }

}

function getEventListenerTarget(target) {
  // If the `event.target` element is removed from the document events will still be targeted
  // at it, and hence won't always bubble up to the window or document anymore.
  // If there is any risk of an element being removed while it is being dragged,
  // the best practice is to attach the event listeners directly to the target.
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
  const {
    EventTarget
  } = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getWindow)(target);
  return target instanceof EventTarget ? target : (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getOwnerDocument)(target);
}

function hasExceededDistance(delta, measurement) {
  const dx = Math.abs(delta.x);
  const dy = Math.abs(delta.y);

  if (typeof measurement === 'number') {
    return Math.sqrt(dx ** 2 + dy ** 2) > measurement;
  }

  if ('x' in measurement && 'y' in measurement) {
    return dx > measurement.x && dy > measurement.y;
  }

  if ('x' in measurement) {
    return dx > measurement.x;
  }

  if ('y' in measurement) {
    return dy > measurement.y;
  }

  return false;
}

var EventName;

(function (EventName) {
  EventName["Click"] = "click";
  EventName["DragStart"] = "dragstart";
  EventName["Keydown"] = "keydown";
  EventName["ContextMenu"] = "contextmenu";
  EventName["Resize"] = "resize";
  EventName["SelectionChange"] = "selectionchange";
  EventName["VisibilityChange"] = "visibilitychange";
})(EventName || (EventName = {}));

function preventDefault(event) {
  event.preventDefault();
}
function stopPropagation(event) {
  event.stopPropagation();
}

var KeyboardCode;

(function (KeyboardCode) {
  KeyboardCode["Space"] = "Space";
  KeyboardCode["Down"] = "ArrowDown";
  KeyboardCode["Right"] = "ArrowRight";
  KeyboardCode["Left"] = "ArrowLeft";
  KeyboardCode["Up"] = "ArrowUp";
  KeyboardCode["Esc"] = "Escape";
  KeyboardCode["Enter"] = "Enter";
  KeyboardCode["Tab"] = "Tab";
})(KeyboardCode || (KeyboardCode = {}));

const defaultKeyboardCodes = {
  start: [KeyboardCode.Space, KeyboardCode.Enter],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter, KeyboardCode.Tab]
};
const defaultKeyboardCoordinateGetter = (event, _ref) => {
  let {
    currentCoordinates
  } = _ref;

  switch (event.code) {
    case KeyboardCode.Right:
      return { ...currentCoordinates,
        x: currentCoordinates.x + 25
      };

    case KeyboardCode.Left:
      return { ...currentCoordinates,
        x: currentCoordinates.x - 25
      };

    case KeyboardCode.Down:
      return { ...currentCoordinates,
        y: currentCoordinates.y + 25
      };

    case KeyboardCode.Up:
      return { ...currentCoordinates,
        y: currentCoordinates.y - 25
      };
  }

  return undefined;
};

class KeyboardSensor {
  constructor(props) {
    this.props = void 0;
    this.autoScrollEnabled = false;
    this.referenceCoordinates = void 0;
    this.listeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    const {
      event: {
        target
      }
    } = props;
    this.props = props;
    this.listeners = new Listeners((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getOwnerDocument)(target));
    this.windowListeners = new Listeners((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getWindow)(target));
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.attach();
  }

  attach() {
    this.handleStart();
    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    setTimeout(() => this.listeners.add(EventName.Keydown, this.handleKeyDown));
  }

  handleStart() {
    const {
      activeNode,
      onStart
    } = this.props;
    const node = activeNode.node.current;

    if (node) {
      scrollIntoViewIfNeeded(node);
    }

    onStart(defaultCoordinates);
  }

  handleKeyDown(event) {
    if ((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isKeyboardEvent)(event)) {
      const {
        active,
        context,
        options
      } = this.props;
      const {
        keyboardCodes = defaultKeyboardCodes,
        coordinateGetter = defaultKeyboardCoordinateGetter,
        scrollBehavior = 'smooth'
      } = options;
      const {
        code
      } = event;

      if (keyboardCodes.end.includes(code)) {
        this.handleEnd(event);
        return;
      }

      if (keyboardCodes.cancel.includes(code)) {
        this.handleCancel(event);
        return;
      }

      const {
        collisionRect
      } = context.current;
      const currentCoordinates = collisionRect ? {
        x: collisionRect.left,
        y: collisionRect.top
      } : defaultCoordinates;

      if (!this.referenceCoordinates) {
        this.referenceCoordinates = currentCoordinates;
      }

      const newCoordinates = coordinateGetter(event, {
        active,
        context: context.current,
        currentCoordinates
      });

      if (newCoordinates) {
        const coordinatesDelta = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.subtract)(newCoordinates, currentCoordinates);
        const scrollDelta = {
          x: 0,
          y: 0
        };
        const {
          scrollableAncestors
        } = context.current;

        for (const scrollContainer of scrollableAncestors) {
          const direction = event.code;
          const {
            isTop,
            isRight,
            isLeft,
            isBottom,
            maxScroll,
            minScroll
          } = getScrollPosition(scrollContainer);
          const scrollElementRect = getScrollElementRect(scrollContainer);
          const clampedCoordinates = {
            x: Math.min(direction === KeyboardCode.Right ? scrollElementRect.right - scrollElementRect.width / 2 : scrollElementRect.right, Math.max(direction === KeyboardCode.Right ? scrollElementRect.left : scrollElementRect.left + scrollElementRect.width / 2, newCoordinates.x)),
            y: Math.min(direction === KeyboardCode.Down ? scrollElementRect.bottom - scrollElementRect.height / 2 : scrollElementRect.bottom, Math.max(direction === KeyboardCode.Down ? scrollElementRect.top : scrollElementRect.top + scrollElementRect.height / 2, newCoordinates.y))
          };
          const canScrollX = direction === KeyboardCode.Right && !isRight || direction === KeyboardCode.Left && !isLeft;
          const canScrollY = direction === KeyboardCode.Down && !isBottom || direction === KeyboardCode.Up && !isTop;

          if (canScrollX && clampedCoordinates.x !== newCoordinates.x) {
            const newScrollCoordinates = scrollContainer.scrollLeft + coordinatesDelta.x;
            const canScrollToNewCoordinates = direction === KeyboardCode.Right && newScrollCoordinates <= maxScroll.x || direction === KeyboardCode.Left && newScrollCoordinates >= minScroll.x;

            if (canScrollToNewCoordinates && !coordinatesDelta.y) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollContainer.scrollTo({
                left: newScrollCoordinates,
                behavior: scrollBehavior
              });
              return;
            }

            if (canScrollToNewCoordinates) {
              scrollDelta.x = scrollContainer.scrollLeft - newScrollCoordinates;
            } else {
              scrollDelta.x = direction === KeyboardCode.Right ? scrollContainer.scrollLeft - maxScroll.x : scrollContainer.scrollLeft - minScroll.x;
            }

            if (scrollDelta.x) {
              scrollContainer.scrollBy({
                left: -scrollDelta.x,
                behavior: scrollBehavior
              });
            }

            break;
          } else if (canScrollY && clampedCoordinates.y !== newCoordinates.y) {
            const newScrollCoordinates = scrollContainer.scrollTop + coordinatesDelta.y;
            const canScrollToNewCoordinates = direction === KeyboardCode.Down && newScrollCoordinates <= maxScroll.y || direction === KeyboardCode.Up && newScrollCoordinates >= minScroll.y;

            if (canScrollToNewCoordinates && !coordinatesDelta.x) {
              // We don't need to update coordinates, the scroll adjustment alone will trigger
              // logic to auto-detect the new container we are over
              scrollContainer.scrollTo({
                top: newScrollCoordinates,
                behavior: scrollBehavior
              });
              return;
            }

            if (canScrollToNewCoordinates) {
              scrollDelta.y = scrollContainer.scrollTop - newScrollCoordinates;
            } else {
              scrollDelta.y = direction === KeyboardCode.Down ? scrollContainer.scrollTop - maxScroll.y : scrollContainer.scrollTop - minScroll.y;
            }

            if (scrollDelta.y) {
              scrollContainer.scrollBy({
                top: -scrollDelta.y,
                behavior: scrollBehavior
              });
            }

            break;
          }
        }

        this.handleMove(event, (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.add)((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.subtract)(newCoordinates, this.referenceCoordinates), scrollDelta));
      }
    }
  }

  handleMove(event, coordinates) {
    const {
      onMove
    } = this.props;
    event.preventDefault();
    onMove(coordinates);
  }

  handleEnd(event) {
    const {
      onEnd
    } = this.props;
    event.preventDefault();
    this.detach();
    onEnd();
  }

  handleCancel(event) {
    const {
      onCancel
    } = this.props;
    event.preventDefault();
    this.detach();
    onCancel();
  }

  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll();
  }

}
KeyboardSensor.activators = [{
  eventName: 'onKeyDown',
  handler: (event, _ref, _ref2) => {
    let {
      keyboardCodes = defaultKeyboardCodes,
      onActivation
    } = _ref;
    let {
      active
    } = _ref2;
    const {
      code
    } = event.nativeEvent;

    if (keyboardCodes.start.includes(code)) {
      const activator = active.activatorNode.current;

      if (activator && event.target !== activator) {
        return false;
      }

      event.preventDefault();
      onActivation == null ? void 0 : onActivation({
        event: event.nativeEvent
      });
      return true;
    }

    return false;
  }
}];

function isDistanceConstraint(constraint) {
  return Boolean(constraint && 'distance' in constraint);
}

function isDelayConstraint(constraint) {
  return Boolean(constraint && 'delay' in constraint);
}

class AbstractPointerSensor {
  constructor(props, events, listenerTarget) {
    var _getEventCoordinates;

    if (listenerTarget === void 0) {
      listenerTarget = getEventListenerTarget(props.event.target);
    }

    this.props = void 0;
    this.events = void 0;
    this.autoScrollEnabled = true;
    this.document = void 0;
    this.activated = false;
    this.initialCoordinates = void 0;
    this.timeoutId = null;
    this.listeners = void 0;
    this.documentListeners = void 0;
    this.windowListeners = void 0;
    this.props = props;
    this.events = events;
    const {
      event
    } = props;
    const {
      target
    } = event;
    this.props = props;
    this.events = events;
    this.document = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getOwnerDocument)(target);
    this.documentListeners = new Listeners(this.document);
    this.listeners = new Listeners(listenerTarget);
    this.windowListeners = new Listeners((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getWindow)(target));
    this.initialCoordinates = (_getEventCoordinates = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getEventCoordinates)(event)) != null ? _getEventCoordinates : defaultCoordinates;
    this.handleStart = this.handleStart.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleKeydown = this.handleKeydown.bind(this);
    this.removeTextSelection = this.removeTextSelection.bind(this);
    this.attach();
  }

  attach() {
    const {
      events,
      props: {
        options: {
          activationConstraint,
          bypassActivationConstraint
        }
      }
    } = this;
    this.listeners.add(events.move.name, this.handleMove, {
      passive: false
    });
    this.listeners.add(events.end.name, this.handleEnd);

    if (events.cancel) {
      this.listeners.add(events.cancel.name, this.handleCancel);
    }

    this.windowListeners.add(EventName.Resize, this.handleCancel);
    this.windowListeners.add(EventName.DragStart, preventDefault);
    this.windowListeners.add(EventName.VisibilityChange, this.handleCancel);
    this.windowListeners.add(EventName.ContextMenu, preventDefault);
    this.documentListeners.add(EventName.Keydown, this.handleKeydown);

    if (activationConstraint) {
      if (bypassActivationConstraint != null && bypassActivationConstraint({
        event: this.props.event,
        activeNode: this.props.activeNode,
        options: this.props.options
      })) {
        return this.handleStart();
      }

      if (isDelayConstraint(activationConstraint)) {
        this.timeoutId = setTimeout(this.handleStart, activationConstraint.delay);
        this.handlePending(activationConstraint);
        return;
      }

      if (isDistanceConstraint(activationConstraint)) {
        this.handlePending(activationConstraint);
        return;
      }
    }

    this.handleStart();
  }

  detach() {
    this.listeners.removeAll();
    this.windowListeners.removeAll(); // Wait until the next event loop before removing document listeners
    // This is necessary because we listen for `click` and `selection` events on the document

    setTimeout(this.documentListeners.removeAll, 50);

    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  handlePending(constraint, offset) {
    const {
      active,
      onPending
    } = this.props;
    onPending(active, constraint, this.initialCoordinates, offset);
  }

  handleStart() {
    const {
      initialCoordinates
    } = this;
    const {
      onStart
    } = this.props;

    if (initialCoordinates) {
      this.activated = true; // Stop propagation of click events once activation constraints are met

      this.documentListeners.add(EventName.Click, stopPropagation, {
        capture: true
      }); // Remove any text selection from the document

      this.removeTextSelection(); // Prevent further text selection while dragging

      this.documentListeners.add(EventName.SelectionChange, this.removeTextSelection);
      onStart(initialCoordinates);
    }
  }

  handleMove(event) {
    var _getEventCoordinates2;

    const {
      activated,
      initialCoordinates,
      props
    } = this;
    const {
      onMove,
      options: {
        activationConstraint
      }
    } = props;

    if (!initialCoordinates) {
      return;
    }

    const coordinates = (_getEventCoordinates2 = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getEventCoordinates)(event)) != null ? _getEventCoordinates2 : defaultCoordinates;
    const delta = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.subtract)(initialCoordinates, coordinates); // Constraint validation

    if (!activated && activationConstraint) {
      if (isDistanceConstraint(activationConstraint)) {
        if (activationConstraint.tolerance != null && hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }

        if (hasExceededDistance(delta, activationConstraint.distance)) {
          return this.handleStart();
        }
      }

      if (isDelayConstraint(activationConstraint)) {
        if (hasExceededDistance(delta, activationConstraint.tolerance)) {
          return this.handleCancel();
        }
      }

      this.handlePending(activationConstraint, delta);
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }

    onMove(coordinates);
  }

  handleEnd() {
    const {
      onAbort,
      onEnd
    } = this.props;
    this.detach();

    if (!this.activated) {
      onAbort(this.props.active);
    }

    onEnd();
  }

  handleCancel() {
    const {
      onAbort,
      onCancel
    } = this.props;
    this.detach();

    if (!this.activated) {
      onAbort(this.props.active);
    }

    onCancel();
  }

  handleKeydown(event) {
    if (event.code === KeyboardCode.Esc) {
      this.handleCancel();
    }
  }

  removeTextSelection() {
    var _this$document$getSel;

    (_this$document$getSel = this.document.getSelection()) == null ? void 0 : _this$document$getSel.removeAllRanges();
  }

}

const events = {
  cancel: {
    name: 'pointercancel'
  },
  move: {
    name: 'pointermove'
  },
  end: {
    name: 'pointerup'
  }
};
class PointerSensor extends AbstractPointerSensor {
  constructor(props) {
    const {
      event
    } = props; // Pointer events stop firing if the target is unmounted while dragging
    // Therefore we attach listeners to the owner document instead

    const listenerTarget = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getOwnerDocument)(event.target);
    super(props, events, listenerTarget);
  }

}
PointerSensor.activators = [{
  eventName: 'onPointerDown',
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;

    if (!event.isPrimary || event.button !== 0) {
      return false;
    }

    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];

const events$1 = {
  move: {
    name: 'mousemove'
  },
  end: {
    name: 'mouseup'
  }
};
var MouseButton;

(function (MouseButton) {
  MouseButton[MouseButton["RightClick"] = 2] = "RightClick";
})(MouseButton || (MouseButton = {}));

class MouseSensor extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$1, (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getOwnerDocument)(props.event.target));
  }

}
MouseSensor.activators = [{
  eventName: 'onMouseDown',
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;

    if (event.button === MouseButton.RightClick) {
      return false;
    }

    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];

const events$2 = {
  cancel: {
    name: 'touchcancel'
  },
  move: {
    name: 'touchmove'
  },
  end: {
    name: 'touchend'
  }
};
class TouchSensor extends AbstractPointerSensor {
  constructor(props) {
    super(props, events$2);
  }

  static setup() {
    // Adding a non-capture and non-passive `touchmove` listener in order
    // to force `event.preventDefault()` calls to work in dynamically added
    // touchmove event handlers. This is required for iOS Safari.
    window.addEventListener(events$2.move.name, noop, {
      capture: false,
      passive: false
    });
    return function teardown() {
      window.removeEventListener(events$2.move.name, noop);
    }; // We create a new handler because the teardown function of another sensor
    // could remove our event listener if we use a referentially equal listener.

    function noop() {}
  }

}
TouchSensor.activators = [{
  eventName: 'onTouchStart',
  handler: (_ref, _ref2) => {
    let {
      nativeEvent: event
    } = _ref;
    let {
      onActivation
    } = _ref2;
    const {
      touches
    } = event;

    if (touches.length > 1) {
      return false;
    }

    onActivation == null ? void 0 : onActivation({
      event
    });
    return true;
  }
}];

var AutoScrollActivator;

(function (AutoScrollActivator) {
  AutoScrollActivator[AutoScrollActivator["Pointer"] = 0] = "Pointer";
  AutoScrollActivator[AutoScrollActivator["DraggableRect"] = 1] = "DraggableRect";
})(AutoScrollActivator || (AutoScrollActivator = {}));

var TraversalOrder;

(function (TraversalOrder) {
  TraversalOrder[TraversalOrder["TreeOrder"] = 0] = "TreeOrder";
  TraversalOrder[TraversalOrder["ReversedTreeOrder"] = 1] = "ReversedTreeOrder";
})(TraversalOrder || (TraversalOrder = {}));

function useAutoScroller(_ref) {
  let {
    acceleration,
    activator = AutoScrollActivator.Pointer,
    canScroll,
    draggingRect,
    enabled,
    interval = 5,
    order = TraversalOrder.TreeOrder,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects,
    delta,
    threshold
  } = _ref;
  const scrollIntent = useScrollIntent({
    delta,
    disabled: !enabled
  });
  const [setAutoScrollInterval, clearAutoScrollInterval] = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useInterval)();
  const scrollSpeed = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
    x: 0,
    y: 0
  });
  const scrollDirection = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
    x: 0,
    y: 0
  });
  const rect = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    switch (activator) {
      case AutoScrollActivator.Pointer:
        return pointerCoordinates ? {
          top: pointerCoordinates.y,
          bottom: pointerCoordinates.y,
          left: pointerCoordinates.x,
          right: pointerCoordinates.x
        } : null;

      case AutoScrollActivator.DraggableRect:
        return draggingRect;
    }
  }, [activator, draggingRect, pointerCoordinates]);
  const scrollContainerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const autoScroll = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) {
      return;
    }

    const scrollLeft = scrollSpeed.current.x * scrollDirection.current.x;
    const scrollTop = scrollSpeed.current.y * scrollDirection.current.y;
    scrollContainer.scrollBy(scrollLeft, scrollTop);
  }, []);
  const sortedScrollableAncestors = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => order === TraversalOrder.TreeOrder ? [...scrollableAncestors].reverse() : scrollableAncestors, [order, scrollableAncestors]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!enabled || !scrollableAncestors.length || !rect) {
      clearAutoScrollInterval();
      return;
    }

    for (const scrollContainer of sortedScrollableAncestors) {
      if ((canScroll == null ? void 0 : canScroll(scrollContainer)) === false) {
        continue;
      }

      const index = scrollableAncestors.indexOf(scrollContainer);
      const scrollContainerRect = scrollableAncestorRects[index];

      if (!scrollContainerRect) {
        continue;
      }

      const {
        direction,
        speed
      } = getScrollDirectionAndSpeed(scrollContainer, scrollContainerRect, rect, acceleration, threshold);

      for (const axis of ['x', 'y']) {
        if (!scrollIntent[axis][direction[axis]]) {
          speed[axis] = 0;
          direction[axis] = 0;
        }
      }

      if (speed.x > 0 || speed.y > 0) {
        clearAutoScrollInterval();
        scrollContainerRef.current = scrollContainer;
        setAutoScrollInterval(autoScroll, interval);
        scrollSpeed.current = speed;
        scrollDirection.current = direction;
        return;
      }
    }

    scrollSpeed.current = {
      x: 0,
      y: 0
    };
    scrollDirection.current = {
      x: 0,
      y: 0
    };
    clearAutoScrollInterval();
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [acceleration, autoScroll, canScroll, clearAutoScrollInterval, enabled, interval, // eslint-disable-next-line react-hooks/exhaustive-deps
  JSON.stringify(rect), // eslint-disable-next-line react-hooks/exhaustive-deps
  JSON.stringify(scrollIntent), setAutoScrollInterval, scrollableAncestors, sortedScrollableAncestors, scrollableAncestorRects, // eslint-disable-next-line react-hooks/exhaustive-deps
  JSON.stringify(threshold)]);
}
const defaultScrollIntent = {
  x: {
    [Direction.Backward]: false,
    [Direction.Forward]: false
  },
  y: {
    [Direction.Backward]: false,
    [Direction.Forward]: false
  }
};

function useScrollIntent(_ref2) {
  let {
    delta,
    disabled
  } = _ref2;
  const previousDelta = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.usePrevious)(delta);
  return (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useLazyMemo)(previousIntent => {
    if (disabled || !previousDelta || !previousIntent) {
      // Reset scroll intent tracking when auto-scrolling is disabled
      return defaultScrollIntent;
    }

    const direction = {
      x: Math.sign(delta.x - previousDelta.x),
      y: Math.sign(delta.y - previousDelta.y)
    }; // Keep track of the user intent to scroll in each direction for both axis

    return {
      x: {
        [Direction.Backward]: previousIntent.x[Direction.Backward] || direction.x === -1,
        [Direction.Forward]: previousIntent.x[Direction.Forward] || direction.x === 1
      },
      y: {
        [Direction.Backward]: previousIntent.y[Direction.Backward] || direction.y === -1,
        [Direction.Forward]: previousIntent.y[Direction.Forward] || direction.y === 1
      }
    };
  }, [disabled, delta, previousDelta]);
}

function useCachedNode(draggableNodes, id) {
  const draggableNode = id != null ? draggableNodes.get(id) : undefined;
  const node = draggableNode ? draggableNode.node.current : null;
  return (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useLazyMemo)(cachedNode => {
    var _ref;

    if (id == null) {
      return null;
    } // In some cases, the draggable node can unmount while dragging
    // This is the case for virtualized lists. In those situations,
    // we fall back to the last known value for that node.


    return (_ref = node != null ? node : cachedNode) != null ? _ref : null;
  }, [node, id]);
}

function useCombineActivators(sensors, getSyntheticHandler) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => sensors.reduce((accumulator, sensor) => {
    const {
      sensor: Sensor
    } = sensor;
    const sensorActivators = Sensor.activators.map(activator => ({
      eventName: activator.eventName,
      handler: getSyntheticHandler(activator.handler, sensor)
    }));
    return [...accumulator, ...sensorActivators];
  }, []), [sensors, getSyntheticHandler]);
}

var MeasuringStrategy;

(function (MeasuringStrategy) {
  MeasuringStrategy[MeasuringStrategy["Always"] = 0] = "Always";
  MeasuringStrategy[MeasuringStrategy["BeforeDragging"] = 1] = "BeforeDragging";
  MeasuringStrategy[MeasuringStrategy["WhileDragging"] = 2] = "WhileDragging";
})(MeasuringStrategy || (MeasuringStrategy = {}));

var MeasuringFrequency;

(function (MeasuringFrequency) {
  MeasuringFrequency["Optimized"] = "optimized";
})(MeasuringFrequency || (MeasuringFrequency = {}));

const defaultValue = /*#__PURE__*/new Map();
function useDroppableMeasuring(containers, _ref) {
  let {
    dragging,
    dependencies,
    config
  } = _ref;
  const [queue, setQueue] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const {
    frequency,
    measure,
    strategy
  } = config;
  const containersRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(containers);
  const disabled = isDisabled();
  const disabledRef = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useLatestValue)(disabled);
  const measureDroppableContainers = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function (ids) {
    if (ids === void 0) {
      ids = [];
    }

    if (disabledRef.current) {
      return;
    }

    setQueue(value => {
      if (value === null) {
        return ids;
      }

      return value.concat(ids.filter(id => !value.includes(id)));
    });
  }, [disabledRef]);
  const timeoutId = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const droppableRects = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useLazyMemo)(previousValue => {
    if (disabled && !dragging) {
      return defaultValue;
    }

    if (!previousValue || previousValue === defaultValue || containersRef.current !== containers || queue != null) {
      const map = new Map();

      for (let container of containers) {
        if (!container) {
          continue;
        }

        if (queue && queue.length > 0 && !queue.includes(container.id) && container.rect.current) {
          // This container does not need to be re-measured
          map.set(container.id, container.rect.current);
          continue;
        }

        const node = container.node.current;
        const rect = node ? new Rect(measure(node), node) : null;
        container.rect.current = rect;

        if (rect) {
          map.set(container.id, rect);
        }
      }

      return map;
    }

    return previousValue;
  }, [containers, queue, dragging, disabled, measure]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    containersRef.current = containers;
  }, [containers]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (disabled) {
      return;
    }

    measureDroppableContainers();
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [dragging, disabled]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (queue && queue.length > 0) {
      setQueue(null);
    }
  }, //eslint-disable-next-line react-hooks/exhaustive-deps
  [JSON.stringify(queue)]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (disabled || typeof frequency !== 'number' || timeoutId.current !== null) {
      return;
    }

    timeoutId.current = setTimeout(() => {
      measureDroppableContainers();
      timeoutId.current = null;
    }, frequency);
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [frequency, disabled, measureDroppableContainers, ...dependencies]);
  return {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled: queue != null
  };

  function isDisabled() {
    switch (strategy) {
      case MeasuringStrategy.Always:
        return false;

      case MeasuringStrategy.BeforeDragging:
        return dragging;

      default:
        return !dragging;
    }
  }
}

function useInitialValue(value, computeFn) {
  return (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useLazyMemo)(previousValue => {
    if (!value) {
      return null;
    }

    if (previousValue) {
      return previousValue;
    }

    return typeof computeFn === 'function' ? computeFn(value) : value;
  }, [computeFn, value]);
}

function useInitialRect(node, measure) {
  return useInitialValue(node, measure);
}

/**
 * Returns a new MutationObserver instance.
 * If `MutationObserver` is undefined in the execution environment, returns `undefined`.
 */

function useMutationObserver(_ref) {
  let {
    callback,
    disabled
  } = _ref;
  const handleMutations = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useEvent)(callback);
  const mutationObserver = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (disabled || typeof window === 'undefined' || typeof window.MutationObserver === 'undefined') {
      return undefined;
    }

    const {
      MutationObserver
    } = window;
    return new MutationObserver(handleMutations);
  }, [handleMutations, disabled]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    return () => mutationObserver == null ? void 0 : mutationObserver.disconnect();
  }, [mutationObserver]);
  return mutationObserver;
}

/**
 * Returns a new ResizeObserver instance bound to the `onResize` callback.
 * If `ResizeObserver` is undefined in the execution environment, returns `undefined`.
 */

function useResizeObserver(_ref) {
  let {
    callback,
    disabled
  } = _ref;
  const handleResize = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useEvent)(callback);
  const resizeObserver = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (disabled || typeof window === 'undefined' || typeof window.ResizeObserver === 'undefined') {
      return undefined;
    }

    const {
      ResizeObserver
    } = window;
    return new ResizeObserver(handleResize);
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [disabled]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    return () => resizeObserver == null ? void 0 : resizeObserver.disconnect();
  }, [resizeObserver]);
  return resizeObserver;
}

function defaultMeasure(element) {
  return new Rect(getClientRect(element), element);
}

function useRect(element, measure, fallbackRect) {
  if (measure === void 0) {
    measure = defaultMeasure;
  }

  const [rect, setRect] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);

  function measureRect() {
    setRect(currentRect => {
      if (!element) {
        return null;
      }

      if (element.isConnected === false) {
        var _ref;

        // Fall back to last rect we measured if the element is
        // no longer connected to the DOM.
        return (_ref = currentRect != null ? currentRect : fallbackRect) != null ? _ref : null;
      }

      const newRect = measure(element);

      if (JSON.stringify(currentRect) === JSON.stringify(newRect)) {
        return currentRect;
      }

      return newRect;
    });
  }

  const mutationObserver = useMutationObserver({
    callback(records) {
      if (!element) {
        return;
      }

      for (const record of records) {
        const {
          type,
          target
        } = record;

        if (type === 'childList' && target instanceof HTMLElement && target.contains(element)) {
          measureRect();
          break;
        }
      }
    }

  });
  const resizeObserver = useResizeObserver({
    callback: measureRect
  });
  (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useIsomorphicLayoutEffect)(() => {
    measureRect();

    if (element) {
      resizeObserver == null ? void 0 : resizeObserver.observe(element);
      mutationObserver == null ? void 0 : mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      resizeObserver == null ? void 0 : resizeObserver.disconnect();
      mutationObserver == null ? void 0 : mutationObserver.disconnect();
    }
  }, [element]);
  return rect;
}

function useRectDelta(rect) {
  const initialRect = useInitialValue(rect);
  return getRectDelta(rect, initialRect);
}

const defaultValue$1 = [];
function useScrollableAncestors(node) {
  const previousNode = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(node);
  const ancestors = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useLazyMemo)(previousValue => {
    if (!node) {
      return defaultValue$1;
    }

    if (previousValue && previousValue !== defaultValue$1 && node && previousNode.current && node.parentNode === previousNode.current.parentNode) {
      return previousValue;
    }

    return getScrollableAncestors(node);
  }, [node]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    previousNode.current = node;
  }, [node]);
  return ancestors;
}

function useScrollOffsets(elements) {
  const [scrollCoordinates, setScrollCoordinates] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const prevElements = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(elements); // To-do: Throttle the handleScroll callback

  const handleScroll = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(event => {
    const scrollingElement = getScrollableElement(event.target);

    if (!scrollingElement) {
      return;
    }

    setScrollCoordinates(scrollCoordinates => {
      if (!scrollCoordinates) {
        return null;
      }

      scrollCoordinates.set(scrollingElement, getScrollCoordinates(scrollingElement));
      return new Map(scrollCoordinates);
    });
  }, []);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const previousElements = prevElements.current;

    if (elements !== previousElements) {
      cleanup(previousElements);
      const entries = elements.map(element => {
        const scrollableElement = getScrollableElement(element);

        if (scrollableElement) {
          scrollableElement.addEventListener('scroll', handleScroll, {
            passive: true
          });
          return [scrollableElement, getScrollCoordinates(scrollableElement)];
        }

        return null;
      }).filter(entry => entry != null);
      setScrollCoordinates(entries.length ? new Map(entries) : null);
      prevElements.current = elements;
    }

    return () => {
      cleanup(elements);
      cleanup(previousElements);
    };

    function cleanup(elements) {
      elements.forEach(element => {
        const scrollableElement = getScrollableElement(element);
        scrollableElement == null ? void 0 : scrollableElement.removeEventListener('scroll', handleScroll);
      });
    }
  }, [handleScroll, elements]);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (elements.length) {
      return scrollCoordinates ? Array.from(scrollCoordinates.values()).reduce((acc, coordinates) => (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.add)(acc, coordinates), defaultCoordinates) : getScrollOffsets(elements);
    }

    return defaultCoordinates;
  }, [elements, scrollCoordinates]);
}

function useScrollOffsetsDelta(scrollOffsets, dependencies) {
  if (dependencies === void 0) {
    dependencies = [];
  }

  const initialScrollOffsets = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    initialScrollOffsets.current = null;
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  dependencies);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const hasScrollOffsets = scrollOffsets !== defaultCoordinates;

    if (hasScrollOffsets && !initialScrollOffsets.current) {
      initialScrollOffsets.current = scrollOffsets;
    }

    if (!hasScrollOffsets && initialScrollOffsets.current) {
      initialScrollOffsets.current = null;
    }
  }, [scrollOffsets]);
  return initialScrollOffsets.current ? (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.subtract)(scrollOffsets, initialScrollOffsets.current) : defaultCoordinates;
}

function useSensorSetup(sensors) {
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.canUseDOM) {
      return;
    }

    const teardownFns = sensors.map(_ref => {
      let {
        sensor
      } = _ref;
      return sensor.setup == null ? void 0 : sensor.setup();
    });
    return () => {
      for (const teardown of teardownFns) {
        teardown == null ? void 0 : teardown();
      }
    };
  }, // TO-DO: Sensors length could theoretically change which would not be a valid dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps
  sensors.map(_ref2 => {
    let {
      sensor
    } = _ref2;
    return sensor;
  }));
}

function useSyntheticListeners(listeners, id) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    return listeners.reduce((acc, _ref) => {
      let {
        eventName,
        handler
      } = _ref;

      acc[eventName] = event => {
        handler(event, id);
      };

      return acc;
    }, {});
  }, [listeners, id]);
}

function useWindowRect(element) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => element ? getWindowClientRect(element) : null, [element]);
}

const defaultValue$2 = [];
function useRects(elements, measure) {
  if (measure === void 0) {
    measure = getClientRect;
  }

  const [firstElement] = elements;
  const windowRect = useWindowRect(firstElement ? (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getWindow)(firstElement) : null);
  const [rects, setRects] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(defaultValue$2);

  function measureRects() {
    setRects(() => {
      if (!elements.length) {
        return defaultValue$2;
      }

      return elements.map(element => isDocumentScrollingElement(element) ? windowRect : new Rect(measure(element), element));
    });
  }

  const resizeObserver = useResizeObserver({
    callback: measureRects
  });
  (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useIsomorphicLayoutEffect)(() => {
    resizeObserver == null ? void 0 : resizeObserver.disconnect();
    measureRects();
    elements.forEach(element => resizeObserver == null ? void 0 : resizeObserver.observe(element));
  }, [elements]);
  return rects;
}

function getMeasurableNode(node) {
  if (!node) {
    return null;
  }

  if (node.children.length > 1) {
    return node;
  }

  const firstChild = node.children[0];
  return (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isHTMLElement)(firstChild) ? firstChild : node;
}

function useDragOverlayMeasuring(_ref) {
  let {
    measure
  } = _ref;
  const [rect, setRect] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const handleResize = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(entries => {
    for (const {
      target
    } of entries) {
      if ((0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isHTMLElement)(target)) {
        setRect(rect => {
          const newRect = measure(target);
          return rect ? { ...rect,
            width: newRect.width,
            height: newRect.height
          } : newRect;
        });
        break;
      }
    }
  }, [measure]);
  const resizeObserver = useResizeObserver({
    callback: handleResize
  });
  const handleNodeChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(element => {
    const node = getMeasurableNode(element);
    resizeObserver == null ? void 0 : resizeObserver.disconnect();

    if (node) {
      resizeObserver == null ? void 0 : resizeObserver.observe(node);
    }

    setRect(node ? measure(node) : null);
  }, [measure, resizeObserver]);
  const [nodeRef, setRef] = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useNodeRef)(handleNodeChange);
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    nodeRef,
    rect,
    setRef
  }), [rect, nodeRef, setRef]);
}

const defaultSensors = [{
  sensor: PointerSensor,
  options: {}
}, {
  sensor: KeyboardSensor,
  options: {}
}];
const defaultData = {
  current: {}
};
const defaultMeasuringConfiguration = {
  draggable: {
    measure: getTransformAgnosticClientRect
  },
  droppable: {
    measure: getTransformAgnosticClientRect,
    strategy: MeasuringStrategy.WhileDragging,
    frequency: MeasuringFrequency.Optimized
  },
  dragOverlay: {
    measure: getClientRect
  }
};

class DroppableContainersMap extends Map {
  get(id) {
    var _super$get;

    return id != null ? (_super$get = super.get(id)) != null ? _super$get : undefined : undefined;
  }

  toArray() {
    return Array.from(this.values());
  }

  getEnabled() {
    return this.toArray().filter(_ref => {
      let {
        disabled
      } = _ref;
      return !disabled;
    });
  }

  getNodeFor(id) {
    var _this$get$node$curren, _this$get;

    return (_this$get$node$curren = (_this$get = this.get(id)) == null ? void 0 : _this$get.node.current) != null ? _this$get$node$curren : undefined;
  }

}

const defaultPublicContext = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: /*#__PURE__*/new Map(),
  droppableRects: /*#__PURE__*/new Map(),
  droppableContainers: /*#__PURE__*/new DroppableContainersMap(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null
    },
    rect: null,
    setRef: noop
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  measuringConfiguration: defaultMeasuringConfiguration,
  measureDroppableContainers: noop,
  windowRect: null,
  measuringScheduled: false
};
const defaultInternalContext = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: ''
  },
  dispatch: noop,
  draggableNodes: /*#__PURE__*/new Map(),
  over: null,
  measureDroppableContainers: noop
};
const InternalContext = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(defaultInternalContext);
const PublicContext = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(defaultPublicContext);

function getInitialState() {
  return {
    draggable: {
      active: null,
      initialCoordinates: {
        x: 0,
        y: 0
      },
      nodes: new Map(),
      translate: {
        x: 0,
        y: 0
      }
    },
    droppable: {
      containers: new DroppableContainersMap()
    }
  };
}
function reducer(state, action) {
  switch (action.type) {
    case Action.DragStart:
      return { ...state,
        draggable: { ...state.draggable,
          initialCoordinates: action.initialCoordinates,
          active: action.active
        }
      };

    case Action.DragMove:
      if (state.draggable.active == null) {
        return state;
      }

      return { ...state,
        draggable: { ...state.draggable,
          translate: {
            x: action.coordinates.x - state.draggable.initialCoordinates.x,
            y: action.coordinates.y - state.draggable.initialCoordinates.y
          }
        }
      };

    case Action.DragEnd:
    case Action.DragCancel:
      return { ...state,
        draggable: { ...state.draggable,
          active: null,
          initialCoordinates: {
            x: 0,
            y: 0
          },
          translate: {
            x: 0,
            y: 0
          }
        }
      };

    case Action.RegisterDroppable:
      {
        const {
          element
        } = action;
        const {
          id
        } = element;
        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.set(id, element);
        return { ...state,
          droppable: { ...state.droppable,
            containers
          }
        };
      }

    case Action.SetDroppableDisabled:
      {
        const {
          id,
          key,
          disabled
        } = action;
        const element = state.droppable.containers.get(id);

        if (!element || key !== element.key) {
          return state;
        }

        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.set(id, { ...element,
          disabled
        });
        return { ...state,
          droppable: { ...state.droppable,
            containers
          }
        };
      }

    case Action.UnregisterDroppable:
      {
        const {
          id,
          key
        } = action;
        const element = state.droppable.containers.get(id);

        if (!element || key !== element.key) {
          return state;
        }

        const containers = new DroppableContainersMap(state.droppable.containers);
        containers.delete(id);
        return { ...state,
          droppable: { ...state.droppable,
            containers
          }
        };
      }

    default:
      {
        return state;
      }
  }
}

function RestoreFocus(_ref) {
  let {
    disabled
  } = _ref;
  const {
    active,
    activatorEvent,
    draggableNodes
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(InternalContext);
  const previousActivatorEvent = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.usePrevious)(activatorEvent);
  const previousActiveId = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.usePrevious)(active == null ? void 0 : active.id); // Restore keyboard focus on the activator node

  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (disabled) {
      return;
    }

    if (!activatorEvent && previousActivatorEvent && previousActiveId != null) {
      if (!(0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isKeyboardEvent)(previousActivatorEvent)) {
        return;
      }

      if (document.activeElement === previousActivatorEvent.target) {
        // No need to restore focus
        return;
      }

      const draggableNode = draggableNodes.get(previousActiveId);

      if (!draggableNode) {
        return;
      }

      const {
        activatorNode,
        node
      } = draggableNode;

      if (!activatorNode.current && !node.current) {
        return;
      }

      requestAnimationFrame(() => {
        for (const element of [activatorNode.current, node.current]) {
          if (!element) {
            continue;
          }

          const focusableNode = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.findFirstFocusableNode)(element);

          if (focusableNode) {
            focusableNode.focus();
            break;
          }
        }
      });
    }
  }, [activatorEvent, disabled, draggableNodes, previousActiveId, previousActivatorEvent]);
  return null;
}

function applyModifiers(modifiers, _ref) {
  let {
    transform,
    ...args
  } = _ref;
  return modifiers != null && modifiers.length ? modifiers.reduce((accumulator, modifier) => {
    return modifier({
      transform: accumulator,
      ...args
    });
  }, transform) : transform;
}

function useMeasuringConfiguration(config) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    draggable: { ...defaultMeasuringConfiguration.draggable,
      ...(config == null ? void 0 : config.draggable)
    },
    droppable: { ...defaultMeasuringConfiguration.droppable,
      ...(config == null ? void 0 : config.droppable)
    },
    dragOverlay: { ...defaultMeasuringConfiguration.dragOverlay,
      ...(config == null ? void 0 : config.dragOverlay)
    }
  }), // eslint-disable-next-line react-hooks/exhaustive-deps
  [config == null ? void 0 : config.draggable, config == null ? void 0 : config.droppable, config == null ? void 0 : config.dragOverlay]);
}

function useLayoutShiftScrollCompensation(_ref) {
  let {
    activeNode,
    measure,
    initialRect,
    config = true
  } = _ref;
  const initialized = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
  const {
    x,
    y
  } = typeof config === 'boolean' ? {
    x: config,
    y: config
  } : config;
  (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useIsomorphicLayoutEffect)(() => {
    const disabled = !x && !y;

    if (disabled || !activeNode) {
      initialized.current = false;
      return;
    }

    if (initialized.current || !initialRect) {
      // Return early if layout shift scroll compensation was already attempted
      // or if there is no initialRect to compare to.
      return;
    } // Get the most up to date node ref for the active draggable


    const node = activeNode == null ? void 0 : activeNode.node.current;

    if (!node || node.isConnected === false) {
      // Return early if there is no attached node ref or if the node is
      // disconnected from the document.
      return;
    }

    const rect = measure(node);
    const rectDelta = getRectDelta(rect, initialRect);

    if (!x) {
      rectDelta.x = 0;
    }

    if (!y) {
      rectDelta.y = 0;
    } // Only perform layout shift scroll compensation once


    initialized.current = true;

    if (Math.abs(rectDelta.x) > 0 || Math.abs(rectDelta.y) > 0) {
      const firstScrollableAncestor = getFirstScrollableAncestor(node);

      if (firstScrollableAncestor) {
        firstScrollableAncestor.scrollBy({
          top: rectDelta.y,
          left: rectDelta.x
        });
      }
    }
  }, [activeNode, x, y, initialRect, measure]);
}

const ActiveDraggableContext = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)({ ...defaultCoordinates,
  scaleX: 1,
  scaleY: 1
});
var Status;

(function (Status) {
  Status[Status["Uninitialized"] = 0] = "Uninitialized";
  Status[Status["Initializing"] = 1] = "Initializing";
  Status[Status["Initialized"] = 2] = "Initialized";
})(Status || (Status = {}));

const DndContext = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.memo)(function DndContext(_ref) {
  var _sensorContext$curren, _dragOverlay$nodeRef$, _dragOverlay$rect, _over$rect;

  let {
    id,
    accessibility,
    autoScroll = true,
    children,
    sensors = defaultSensors,
    collisionDetection = rectIntersection,
    measuring,
    modifiers,
    ...props
  } = _ref;
  const store = (0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(reducer, undefined, getInitialState);
  const [state, dispatch] = store;
  const [dispatchMonitorEvent, registerMonitorListener] = useDndMonitorProvider();
  const [status, setStatus] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(Status.Uninitialized);
  const isInitialized = status === Status.Initialized;
  const {
    draggable: {
      active: activeId,
      nodes: draggableNodes,
      translate
    },
    droppable: {
      containers: droppableContainers
    }
  } = state;
  const node = activeId != null ? draggableNodes.get(activeId) : null;
  const activeRects = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
    initial: null,
    translated: null
  });
  const active = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    var _node$data;

    return activeId != null ? {
      id: activeId,
      // It's possible for the active node to unmount while dragging
      data: (_node$data = node == null ? void 0 : node.data) != null ? _node$data : defaultData,
      rect: activeRects
    } : null;
  }, [activeId, node]);
  const activeRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const [activeSensor, setActiveSensor] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [activatorEvent, setActivatorEvent] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const latestProps = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useLatestValue)(props, Object.values(props));
  const draggableDescribedById = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useUniqueId)("DndDescribedBy", id);
  const enabledDroppableContainers = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => droppableContainers.getEnabled(), [droppableContainers]);
  const measuringConfiguration = useMeasuringConfiguration(measuring);
  const {
    droppableRects,
    measureDroppableContainers,
    measuringScheduled
  } = useDroppableMeasuring(enabledDroppableContainers, {
    dragging: isInitialized,
    dependencies: [translate.x, translate.y],
    config: measuringConfiguration.droppable
  });
  const activeNode = useCachedNode(draggableNodes, activeId);
  const activationCoordinates = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => activatorEvent ? (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getEventCoordinates)(activatorEvent) : null, [activatorEvent]);
  const autoScrollOptions = getAutoScrollerOptions();
  const initialActiveNodeRect = useInitialRect(activeNode, measuringConfiguration.draggable.measure);
  useLayoutShiftScrollCompensation({
    activeNode: activeId != null ? draggableNodes.get(activeId) : null,
    config: autoScrollOptions.layoutShiftCompensation,
    initialRect: initialActiveNodeRect,
    measure: measuringConfiguration.draggable.measure
  });
  const activeNodeRect = useRect(activeNode, measuringConfiguration.draggable.measure, initialActiveNodeRect);
  const containerNodeRect = useRect(activeNode ? activeNode.parentElement : null);
  const sensorContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
    activatorEvent: null,
    active: null,
    activeNode,
    collisionRect: null,
    collisions: null,
    droppableRects,
    draggableNodes,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null
  });
  const overNode = droppableContainers.getNodeFor((_sensorContext$curren = sensorContext.current.over) == null ? void 0 : _sensorContext$curren.id);
  const dragOverlay = useDragOverlayMeasuring({
    measure: measuringConfiguration.dragOverlay.measure
  }); // Use the rect of the drag overlay if it is mounted

  const draggingNode = (_dragOverlay$nodeRef$ = dragOverlay.nodeRef.current) != null ? _dragOverlay$nodeRef$ : activeNode;
  const draggingNodeRect = isInitialized ? (_dragOverlay$rect = dragOverlay.rect) != null ? _dragOverlay$rect : activeNodeRect : null;
  const usesDragOverlay = Boolean(dragOverlay.nodeRef.current && dragOverlay.rect); // The delta between the previous and new position of the draggable node
  // is only relevant when there is no drag overlay

  const nodeRectDelta = useRectDelta(usesDragOverlay ? null : activeNodeRect); // Get the window rect of the dragging node

  const windowRect = useWindowRect(draggingNode ? (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getWindow)(draggingNode) : null); // Get scrollable ancestors of the dragging node

  const scrollableAncestors = useScrollableAncestors(isInitialized ? overNode != null ? overNode : activeNode : null);
  const scrollableAncestorRects = useRects(scrollableAncestors); // Apply modifiers

  const modifiedTranslate = applyModifiers(modifiers, {
    transform: {
      x: translate.x - nodeRectDelta.x,
      y: translate.y - nodeRectDelta.y,
      scaleX: 1,
      scaleY: 1
    },
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggingNodeRect,
    over: sensorContext.current.over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect
  });
  const pointerCoordinates = activationCoordinates ? (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.add)(activationCoordinates, translate) : null;
  const scrollOffsets = useScrollOffsets(scrollableAncestors); // Represents the scroll delta since dragging was initiated

  const scrollAdjustment = useScrollOffsetsDelta(scrollOffsets); // Represents the scroll delta since the last time the active node rect was measured

  const activeNodeScrollDelta = useScrollOffsetsDelta(scrollOffsets, [activeNodeRect]);
  const scrollAdjustedTranslate = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.add)(modifiedTranslate, scrollAdjustment);
  const collisionRect = draggingNodeRect ? getAdjustedRect(draggingNodeRect, modifiedTranslate) : null;
  const collisions = active && collisionRect ? collisionDetection({
    active,
    collisionRect,
    droppableRects,
    droppableContainers: enabledDroppableContainers,
    pointerCoordinates
  }) : null;
  const overId = getFirstCollision(collisions, 'id');
  const [over, setOver] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null); // When there is no drag overlay used, we need to account for the
  // window scroll delta

  const appliedTranslate = usesDragOverlay ? modifiedTranslate : (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.add)(modifiedTranslate, activeNodeScrollDelta);
  const transform = adjustScale(appliedTranslate, (_over$rect = over == null ? void 0 : over.rect) != null ? _over$rect : null, activeNodeRect);
  const activeSensorRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const instantiateSensor = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((event, _ref2) => {
    let {
      sensor: Sensor,
      options
    } = _ref2;

    if (activeRef.current == null) {
      return;
    }

    const activeNode = draggableNodes.get(activeRef.current);

    if (!activeNode) {
      return;
    }

    const activatorEvent = event.nativeEvent;
    const sensorInstance = new Sensor({
      active: activeRef.current,
      activeNode,
      event: activatorEvent,
      options,
      // Sensors need to be instantiated with refs for arguments that change over time
      // otherwise they are frozen in time with the stale arguments
      context: sensorContext,

      onAbort(id) {
        const draggableNode = draggableNodes.get(id);

        if (!draggableNode) {
          return;
        }

        const {
          onDragAbort
        } = latestProps.current;
        const event = {
          id
        };
        onDragAbort == null ? void 0 : onDragAbort(event);
        dispatchMonitorEvent({
          type: 'onDragAbort',
          event
        });
      },

      onPending(id, constraint, initialCoordinates, offset) {
        const draggableNode = draggableNodes.get(id);

        if (!draggableNode) {
          return;
        }

        const {
          onDragPending
        } = latestProps.current;
        const event = {
          id,
          constraint,
          initialCoordinates,
          offset
        };
        onDragPending == null ? void 0 : onDragPending(event);
        dispatchMonitorEvent({
          type: 'onDragPending',
          event
        });
      },

      onStart(initialCoordinates) {
        const id = activeRef.current;

        if (id == null) {
          return;
        }

        const draggableNode = draggableNodes.get(id);

        if (!draggableNode) {
          return;
        }

        const {
          onDragStart
        } = latestProps.current;
        const event = {
          activatorEvent,
          active: {
            id,
            data: draggableNode.data,
            rect: activeRects
          }
        };
        (0,react_dom__WEBPACK_IMPORTED_MODULE_1__.unstable_batchedUpdates)(() => {
          onDragStart == null ? void 0 : onDragStart(event);
          setStatus(Status.Initializing);
          dispatch({
            type: Action.DragStart,
            initialCoordinates,
            active: id
          });
          dispatchMonitorEvent({
            type: 'onDragStart',
            event
          });
          setActiveSensor(activeSensorRef.current);
          setActivatorEvent(activatorEvent);
        });
      },

      onMove(coordinates) {
        dispatch({
          type: Action.DragMove,
          coordinates
        });
      },

      onEnd: createHandler(Action.DragEnd),
      onCancel: createHandler(Action.DragCancel)
    });
    activeSensorRef.current = sensorInstance;

    function createHandler(type) {
      return async function handler() {
        const {
          active,
          collisions,
          over,
          scrollAdjustedTranslate
        } = sensorContext.current;
        let event = null;

        if (active && scrollAdjustedTranslate) {
          const {
            cancelDrop
          } = latestProps.current;
          event = {
            activatorEvent,
            active: active,
            collisions,
            delta: scrollAdjustedTranslate,
            over
          };

          if (type === Action.DragEnd && typeof cancelDrop === 'function') {
            const shouldCancel = await Promise.resolve(cancelDrop(event));

            if (shouldCancel) {
              type = Action.DragCancel;
            }
          }
        }

        activeRef.current = null;
        (0,react_dom__WEBPACK_IMPORTED_MODULE_1__.unstable_batchedUpdates)(() => {
          dispatch({
            type
          });
          setStatus(Status.Uninitialized);
          setOver(null);
          setActiveSensor(null);
          setActivatorEvent(null);
          activeSensorRef.current = null;
          const eventName = type === Action.DragEnd ? 'onDragEnd' : 'onDragCancel';

          if (event) {
            const handler = latestProps.current[eventName];
            handler == null ? void 0 : handler(event);
            dispatchMonitorEvent({
              type: eventName,
              event
            });
          }
        });
      };
    }
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [draggableNodes]);
  const bindActivatorToSensorInstantiator = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((handler, sensor) => {
    return (event, active) => {
      const nativeEvent = event.nativeEvent;
      const activeDraggableNode = draggableNodes.get(active);

      if ( // Another sensor is already instantiating
      activeRef.current !== null || // No active draggable
      !activeDraggableNode || // Event has already been captured
      nativeEvent.dndKit || nativeEvent.defaultPrevented) {
        return;
      }

      const activationContext = {
        active: activeDraggableNode
      };
      const shouldActivate = handler(event, sensor.options, activationContext);

      if (shouldActivate === true) {
        nativeEvent.dndKit = {
          capturedBy: sensor.sensor
        };
        activeRef.current = active;
        instantiateSensor(event, sensor);
      }
    };
  }, [draggableNodes, instantiateSensor]);
  const activators = useCombineActivators(sensors, bindActivatorToSensorInstantiator);
  useSensorSetup(sensors);
  (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useIsomorphicLayoutEffect)(() => {
    if (activeNodeRect && status === Status.Initializing) {
      setStatus(Status.Initialized);
    }
  }, [activeNodeRect, status]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const {
      onDragMove
    } = latestProps.current;
    const {
      active,
      activatorEvent,
      collisions,
      over
    } = sensorContext.current;

    if (!active || !activatorEvent) {
      return;
    }

    const event = {
      active,
      activatorEvent,
      collisions,
      delta: {
        x: scrollAdjustedTranslate.x,
        y: scrollAdjustedTranslate.y
      },
      over
    };
    (0,react_dom__WEBPACK_IMPORTED_MODULE_1__.unstable_batchedUpdates)(() => {
      onDragMove == null ? void 0 : onDragMove(event);
      dispatchMonitorEvent({
        type: 'onDragMove',
        event
      });
    });
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [scrollAdjustedTranslate.x, scrollAdjustedTranslate.y]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const {
      active,
      activatorEvent,
      collisions,
      droppableContainers,
      scrollAdjustedTranslate
    } = sensorContext.current;

    if (!active || activeRef.current == null || !activatorEvent || !scrollAdjustedTranslate) {
      return;
    }

    const {
      onDragOver
    } = latestProps.current;
    const overContainer = droppableContainers.get(overId);
    const over = overContainer && overContainer.rect.current ? {
      id: overContainer.id,
      rect: overContainer.rect.current,
      data: overContainer.data,
      disabled: overContainer.disabled
    } : null;
    const event = {
      active,
      activatorEvent,
      collisions,
      delta: {
        x: scrollAdjustedTranslate.x,
        y: scrollAdjustedTranslate.y
      },
      over
    };
    (0,react_dom__WEBPACK_IMPORTED_MODULE_1__.unstable_batchedUpdates)(() => {
      setOver(over);
      onDragOver == null ? void 0 : onDragOver(event);
      dispatchMonitorEvent({
        type: 'onDragOver',
        event
      });
    });
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [overId]);
  (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useIsomorphicLayoutEffect)(() => {
    sensorContext.current = {
      activatorEvent,
      active,
      activeNode,
      collisionRect,
      collisions,
      droppableRects,
      draggableNodes,
      draggingNode,
      draggingNodeRect,
      droppableContainers,
      over,
      scrollableAncestors,
      scrollAdjustedTranslate
    };
    activeRects.current = {
      initial: draggingNodeRect,
      translated: collisionRect
    };
  }, [active, activeNode, collisions, collisionRect, draggableNodes, draggingNode, draggingNodeRect, droppableRects, droppableContainers, over, scrollableAncestors, scrollAdjustedTranslate]);
  useAutoScroller({ ...autoScrollOptions,
    delta: translate,
    draggingRect: collisionRect,
    pointerCoordinates,
    scrollableAncestors,
    scrollableAncestorRects
  });
  const publicContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const context = {
      active,
      activeNode,
      activeNodeRect,
      activatorEvent,
      collisions,
      containerNodeRect,
      dragOverlay,
      draggableNodes,
      droppableContainers,
      droppableRects,
      over,
      measureDroppableContainers,
      scrollableAncestors,
      scrollableAncestorRects,
      measuringConfiguration,
      measuringScheduled,
      windowRect
    };
    return context;
  }, [active, activeNode, activeNodeRect, activatorEvent, collisions, containerNodeRect, dragOverlay, draggableNodes, droppableContainers, droppableRects, over, measureDroppableContainers, scrollableAncestors, scrollableAncestorRects, measuringConfiguration, measuringScheduled, windowRect]);
  const internalContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const context = {
      activatorEvent,
      activators,
      active,
      activeNodeRect,
      ariaDescribedById: {
        draggable: draggableDescribedById
      },
      dispatch,
      draggableNodes,
      over,
      measureDroppableContainers
    };
    return context;
  }, [activatorEvent, activators, active, activeNodeRect, dispatch, draggableDescribedById, draggableNodes, over, measureDroppableContainers]);
  return react__WEBPACK_IMPORTED_MODULE_0___default().createElement(DndMonitorContext.Provider, {
    value: registerMonitorListener
  }, react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InternalContext.Provider, {
    value: internalContext
  }, react__WEBPACK_IMPORTED_MODULE_0___default().createElement(PublicContext.Provider, {
    value: publicContext
  }, react__WEBPACK_IMPORTED_MODULE_0___default().createElement(ActiveDraggableContext.Provider, {
    value: transform
  }, children)), react__WEBPACK_IMPORTED_MODULE_0___default().createElement(RestoreFocus, {
    disabled: (accessibility == null ? void 0 : accessibility.restoreFocus) === false
  })), react__WEBPACK_IMPORTED_MODULE_0___default().createElement(Accessibility, { ...accessibility,
    hiddenTextDescribedById: draggableDescribedById
  }));

  function getAutoScrollerOptions() {
    const activeSensorDisablesAutoscroll = (activeSensor == null ? void 0 : activeSensor.autoScrollEnabled) === false;
    const autoScrollGloballyDisabled = typeof autoScroll === 'object' ? autoScroll.enabled === false : autoScroll === false;
    const enabled = isInitialized && !activeSensorDisablesAutoscroll && !autoScrollGloballyDisabled;

    if (typeof autoScroll === 'object') {
      return { ...autoScroll,
        enabled
      };
    }

    return {
      enabled
    };
  }
});

const NullContext = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(null);
const defaultRole = 'button';
const ID_PREFIX = 'Draggable';
function useDraggable(_ref) {
  let {
    id,
    data,
    disabled = false,
    attributes
  } = _ref;
  const key = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useUniqueId)(ID_PREFIX);
  const {
    activators,
    activatorEvent,
    active,
    activeNodeRect,
    ariaDescribedById,
    draggableNodes,
    over
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(InternalContext);
  const {
    role = defaultRole,
    roleDescription = 'draggable',
    tabIndex = 0
  } = attributes != null ? attributes : {};
  const isDragging = (active == null ? void 0 : active.id) === id;
  const transform = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(isDragging ? ActiveDraggableContext : NullContext);
  const [node, setNodeRef] = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useNodeRef)();
  const [activatorNode, setActivatorNodeRef] = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useNodeRef)();
  const listeners = useSyntheticListeners(activators, id);
  const dataRef = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useLatestValue)(data);
  (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useIsomorphicLayoutEffect)(() => {
    draggableNodes.set(id, {
      id,
      key,
      node,
      activatorNode,
      data: dataRef
    });
    return () => {
      const node = draggableNodes.get(id);

      if (node && node.key === key) {
        draggableNodes.delete(id);
      }
    };
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [draggableNodes, id]);
  const memoizedAttributes = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    role,
    tabIndex,
    'aria-disabled': disabled,
    'aria-pressed': isDragging && role === defaultRole ? true : undefined,
    'aria-roledescription': roleDescription,
    'aria-describedby': ariaDescribedById.draggable
  }), [disabled, role, tabIndex, isDragging, roleDescription, ariaDescribedById.draggable]);
  return {
    active,
    activatorEvent,
    activeNodeRect,
    attributes: memoizedAttributes,
    isDragging,
    listeners: disabled ? undefined : listeners,
    node,
    over,
    setNodeRef,
    setActivatorNodeRef,
    transform
  };
}

function useDndContext() {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(PublicContext);
}

const ID_PREFIX$1 = 'Droppable';
const defaultResizeObserverConfig = {
  timeout: 25
};
function useDroppable(_ref) {
  let {
    data,
    disabled = false,
    id,
    resizeObserverConfig
  } = _ref;
  const key = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useUniqueId)(ID_PREFIX$1);
  const {
    active,
    dispatch,
    over,
    measureDroppableContainers
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(InternalContext);
  const previous = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
    disabled
  });
  const resizeObserverConnected = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
  const rect = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const callbackId = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const {
    disabled: resizeObserverDisabled,
    updateMeasurementsFor,
    timeout: resizeObserverTimeout
  } = { ...defaultResizeObserverConfig,
    ...resizeObserverConfig
  };
  const ids = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useLatestValue)(updateMeasurementsFor != null ? updateMeasurementsFor : id);
  const handleResize = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (!resizeObserverConnected.current) {
      // ResizeObserver invokes the `handleResize` callback as soon as `observe` is called,
      // assuming the element is rendered and displayed.
      resizeObserverConnected.current = true;
      return;
    }

    if (callbackId.current != null) {
      clearTimeout(callbackId.current);
    }

    callbackId.current = setTimeout(() => {
      measureDroppableContainers(Array.isArray(ids.current) ? ids.current : [ids.current]);
      callbackId.current = null;
    }, resizeObserverTimeout);
  }, //eslint-disable-next-line react-hooks/exhaustive-deps
  [resizeObserverTimeout]);
  const resizeObserver = useResizeObserver({
    callback: handleResize,
    disabled: resizeObserverDisabled || !active
  });
  const handleNodeChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((newElement, previousElement) => {
    if (!resizeObserver) {
      return;
    }

    if (previousElement) {
      resizeObserver.unobserve(previousElement);
      resizeObserverConnected.current = false;
    }

    if (newElement) {
      resizeObserver.observe(newElement);
    }
  }, [resizeObserver]);
  const [nodeRef, setNodeRef] = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useNodeRef)(handleNodeChange);
  const dataRef = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useLatestValue)(data);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!resizeObserver || !nodeRef.current) {
      return;
    }

    resizeObserver.disconnect();
    resizeObserverConnected.current = false;
    resizeObserver.observe(nodeRef.current);
  }, [nodeRef, resizeObserver]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    dispatch({
      type: Action.RegisterDroppable,
      element: {
        id,
        key,
        disabled,
        node: nodeRef,
        rect,
        data: dataRef
      }
    });
    return () => dispatch({
      type: Action.UnregisterDroppable,
      key,
      id
    });
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [id]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (disabled !== previous.current.disabled) {
      dispatch({
        type: Action.SetDroppableDisabled,
        id,
        key,
        disabled
      });
      previous.current.disabled = disabled;
    }
  }, [id, key, disabled, dispatch]);
  return {
    active,
    rect,
    isOver: (over == null ? void 0 : over.id) === id,
    node: nodeRef,
    over,
    setNodeRef
  };
}

function AnimationManager(_ref) {
  let {
    animation,
    children
  } = _ref;
  const [clonedChildren, setClonedChildren] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [element, setElement] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const previousChildren = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.usePrevious)(children);

  if (!children && !clonedChildren && previousChildren) {
    setClonedChildren(previousChildren);
  }

  (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useIsomorphicLayoutEffect)(() => {
    if (!element) {
      return;
    }

    const key = clonedChildren == null ? void 0 : clonedChildren.key;
    const id = clonedChildren == null ? void 0 : clonedChildren.props.id;

    if (key == null || id == null) {
      setClonedChildren(null);
      return;
    }

    Promise.resolve(animation(id, element)).then(() => {
      setClonedChildren(null);
    });
  }, [animation, clonedChildren, element]);
  return react__WEBPACK_IMPORTED_MODULE_0___default().createElement((react__WEBPACK_IMPORTED_MODULE_0___default().Fragment), null, children, clonedChildren ? (0,react__WEBPACK_IMPORTED_MODULE_0__.cloneElement)(clonedChildren, {
    ref: setElement
  }) : null);
}

const defaultTransform = {
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1
};
function NullifiedContextProvider(_ref) {
  let {
    children
  } = _ref;
  return react__WEBPACK_IMPORTED_MODULE_0___default().createElement(InternalContext.Provider, {
    value: defaultInternalContext
  }, react__WEBPACK_IMPORTED_MODULE_0___default().createElement(ActiveDraggableContext.Provider, {
    value: defaultTransform
  }, children));
}

const baseStyles = {
  position: 'fixed',
  touchAction: 'none'
};

const defaultTransition = activatorEvent => {
  const isKeyboardActivator = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isKeyboardEvent)(activatorEvent);
  return isKeyboardActivator ? 'transform 250ms ease' : undefined;
};

const PositionedOverlay = /*#__PURE__*/(0,react__WEBPACK_IMPORTED_MODULE_0__.forwardRef)((_ref, ref) => {
  let {
    as,
    activatorEvent,
    adjustScale,
    children,
    className,
    rect,
    style,
    transform,
    transition = defaultTransition
  } = _ref;

  if (!rect) {
    return null;
  }

  const scaleAdjustedTransform = adjustScale ? transform : { ...transform,
    scaleX: 1,
    scaleY: 1
  };
  const styles = { ...baseStyles,
    width: rect.width,
    height: rect.height,
    top: rect.top,
    left: rect.left,
    transform: _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.CSS.Transform.toString(scaleAdjustedTransform),
    transformOrigin: adjustScale && activatorEvent ? getRelativeTransformOrigin(activatorEvent, rect) : undefined,
    transition: typeof transition === 'function' ? transition(activatorEvent) : transition,
    ...style
  };
  return react__WEBPACK_IMPORTED_MODULE_0___default().createElement(as, {
    className,
    style: styles,
    ref
  }, children);
});

const defaultDropAnimationSideEffects = options => _ref => {
  let {
    active,
    dragOverlay
  } = _ref;
  const originalStyles = {};
  const {
    styles,
    className
  } = options;

  if (styles != null && styles.active) {
    for (const [key, value] of Object.entries(styles.active)) {
      if (value === undefined) {
        continue;
      }

      originalStyles[key] = active.node.style.getPropertyValue(key);
      active.node.style.setProperty(key, value);
    }
  }

  if (styles != null && styles.dragOverlay) {
    for (const [key, value] of Object.entries(styles.dragOverlay)) {
      if (value === undefined) {
        continue;
      }

      dragOverlay.node.style.setProperty(key, value);
    }
  }

  if (className != null && className.active) {
    active.node.classList.add(className.active);
  }

  if (className != null && className.dragOverlay) {
    dragOverlay.node.classList.add(className.dragOverlay);
  }

  return function cleanup() {
    for (const [key, value] of Object.entries(originalStyles)) {
      active.node.style.setProperty(key, value);
    }

    if (className != null && className.active) {
      active.node.classList.remove(className.active);
    }
  };
};

const defaultKeyframeResolver = _ref2 => {
  let {
    transform: {
      initial,
      final
    }
  } = _ref2;
  return [{
    transform: _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.CSS.Transform.toString(initial)
  }, {
    transform: _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.CSS.Transform.toString(final)
  }];
};

const defaultDropAnimationConfiguration = {
  duration: 250,
  easing: 'ease',
  keyframes: defaultKeyframeResolver,
  sideEffects: /*#__PURE__*/defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0'
      }
    }
  })
};
function useDropAnimation(_ref3) {
  let {
    config,
    draggableNodes,
    droppableContainers,
    measuringConfiguration
  } = _ref3;
  return (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useEvent)((id, node) => {
    if (config === null) {
      return;
    }

    const activeDraggable = draggableNodes.get(id);

    if (!activeDraggable) {
      return;
    }

    const activeNode = activeDraggable.node.current;

    if (!activeNode) {
      return;
    }

    const measurableNode = getMeasurableNode(node);

    if (!measurableNode) {
      return;
    }

    const {
      transform
    } = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.getWindow)(node).getComputedStyle(node);
    const parsedTransform = parseTransform(transform);

    if (!parsedTransform) {
      return;
    }

    const animation = typeof config === 'function' ? config : createDefaultDropAnimation(config);
    scrollIntoViewIfNeeded(activeNode, measuringConfiguration.draggable.measure);
    return animation({
      active: {
        id,
        data: activeDraggable.data,
        node: activeNode,
        rect: measuringConfiguration.draggable.measure(activeNode)
      },
      draggableNodes,
      dragOverlay: {
        node,
        rect: measuringConfiguration.dragOverlay.measure(measurableNode)
      },
      droppableContainers,
      measuringConfiguration,
      transform: parsedTransform
    });
  });
}

function createDefaultDropAnimation(options) {
  const {
    duration,
    easing,
    sideEffects,
    keyframes
  } = { ...defaultDropAnimationConfiguration,
    ...options
  };
  return _ref4 => {
    let {
      active,
      dragOverlay,
      transform,
      ...rest
    } = _ref4;

    if (!duration) {
      // Do not animate if animation duration is zero.
      return;
    }

    const delta = {
      x: dragOverlay.rect.left - active.rect.left,
      y: dragOverlay.rect.top - active.rect.top
    };
    const scale = {
      scaleX: transform.scaleX !== 1 ? active.rect.width * transform.scaleX / dragOverlay.rect.width : 1,
      scaleY: transform.scaleY !== 1 ? active.rect.height * transform.scaleY / dragOverlay.rect.height : 1
    };
    const finalTransform = {
      x: transform.x - delta.x,
      y: transform.y - delta.y,
      ...scale
    };
    const animationKeyframes = keyframes({ ...rest,
      active,
      dragOverlay,
      transform: {
        initial: transform,
        final: finalTransform
      }
    });
    const [firstKeyframe] = animationKeyframes;
    const lastKeyframe = animationKeyframes[animationKeyframes.length - 1];

    if (JSON.stringify(firstKeyframe) === JSON.stringify(lastKeyframe)) {
      // The start and end keyframes are the same, infer that there is no animation needed.
      return;
    }

    const cleanup = sideEffects == null ? void 0 : sideEffects({
      active,
      dragOverlay,
      ...rest
    });
    const animation = dragOverlay.node.animate(animationKeyframes, {
      duration,
      easing,
      fill: 'forwards'
    });
    return new Promise(resolve => {
      animation.onfinish = () => {
        cleanup == null ? void 0 : cleanup();
        resolve();
      };
    });
  };
}

let key = 0;
function useKey(id) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (id == null) {
      return;
    }

    key++;
    return key;
  }, [id]);
}

const DragOverlay = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().memo(_ref => {
  let {
    adjustScale = false,
    children,
    dropAnimation: dropAnimationConfig,
    style,
    transition,
    modifiers,
    wrapperElement = 'div',
    className,
    zIndex = 999
  } = _ref;
  const {
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggableNodes,
    droppableContainers,
    dragOverlay,
    over,
    measuringConfiguration,
    scrollableAncestors,
    scrollableAncestorRects,
    windowRect
  } = useDndContext();
  const transform = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(ActiveDraggableContext);
  const key = useKey(active == null ? void 0 : active.id);
  const modifiedTransform = applyModifiers(modifiers, {
    activatorEvent,
    active,
    activeNodeRect,
    containerNodeRect,
    draggingNodeRect: dragOverlay.rect,
    over,
    overlayNodeRect: dragOverlay.rect,
    scrollableAncestors,
    scrollableAncestorRects,
    transform,
    windowRect
  });
  const initialRect = useInitialValue(activeNodeRect);
  const dropAnimation = useDropAnimation({
    config: dropAnimationConfig,
    draggableNodes,
    droppableContainers,
    measuringConfiguration
  }); // We need to wait for the active node to be measured before connecting the drag overlay ref
  // otherwise collisions can be computed against a mispositioned drag overlay

  const ref = initialRect ? dragOverlay.setRef : undefined;
  return react__WEBPACK_IMPORTED_MODULE_0___default().createElement(NullifiedContextProvider, null, react__WEBPACK_IMPORTED_MODULE_0___default().createElement(AnimationManager, {
    animation: dropAnimation
  }, active && key ? react__WEBPACK_IMPORTED_MODULE_0___default().createElement(PositionedOverlay, {
    key: key,
    id: active.id,
    ref: ref,
    as: wrapperElement,
    activatorEvent: activatorEvent,
    adjustScale: adjustScale,
    className: className,
    transition: transition,
    rect: initialRect,
    style: {
      zIndex,
      ...style
    },
    transform: modifiedTransform
  }, children) : null));
});


//# sourceMappingURL=core.esm.js.map


/***/ },

/***/ "./node_modules/@dnd-kit/sortable/dist/sortable.esm.js"
/*!*************************************************************!*\
  !*** ./node_modules/@dnd-kit/sortable/dist/sortable.esm.js ***!
  \*************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SortableContext: () => (/* binding */ SortableContext),
/* harmony export */   arrayMove: () => (/* binding */ arrayMove),
/* harmony export */   arraySwap: () => (/* binding */ arraySwap),
/* harmony export */   defaultAnimateLayoutChanges: () => (/* binding */ defaultAnimateLayoutChanges),
/* harmony export */   defaultNewIndexGetter: () => (/* binding */ defaultNewIndexGetter),
/* harmony export */   hasSortableData: () => (/* binding */ hasSortableData),
/* harmony export */   horizontalListSortingStrategy: () => (/* binding */ horizontalListSortingStrategy),
/* harmony export */   rectSortingStrategy: () => (/* binding */ rectSortingStrategy),
/* harmony export */   rectSwappingStrategy: () => (/* binding */ rectSwappingStrategy),
/* harmony export */   sortableKeyboardCoordinates: () => (/* binding */ sortableKeyboardCoordinates),
/* harmony export */   useSortable: () => (/* binding */ useSortable),
/* harmony export */   verticalListSortingStrategy: () => (/* binding */ verticalListSortingStrategy)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @dnd-kit/core */ "./node_modules/@dnd-kit/core/dist/core.esm.js");
/* harmony import */ var _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @dnd-kit/utilities */ "./node_modules/@dnd-kit/utilities/dist/utilities.esm.js");




/**
 * Move an array item to a different position. Returns a new array with the item moved to the new position.
 */
function arrayMove(array, from, to) {
  const newArray = array.slice();
  newArray.splice(to < 0 ? newArray.length + to : to, 0, newArray.splice(from, 1)[0]);
  return newArray;
}

/**
 * Swap an array item to a different position. Returns a new array with the item swapped to the new position.
 */
function arraySwap(array, from, to) {
  const newArray = array.slice();
  newArray[from] = array[to];
  newArray[to] = array[from];
  return newArray;
}

function getSortedRects(items, rects) {
  return items.reduce((accumulator, id, index) => {
    const rect = rects.get(id);

    if (rect) {
      accumulator[index] = rect;
    }

    return accumulator;
  }, Array(items.length));
}

function isValidIndex(index) {
  return index !== null && index >= 0;
}

function itemsEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (a.length !== b.length) {
    return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

function normalizeDisabled(disabled) {
  if (typeof disabled === 'boolean') {
    return {
      draggable: disabled,
      droppable: disabled
    };
  }

  return disabled;
}

// To-do: We should be calculating scale transformation
const defaultScale = {
  scaleX: 1,
  scaleY: 1
};
const horizontalListSortingStrategy = _ref => {
  var _rects$activeIndex;

  let {
    rects,
    activeNodeRect: fallbackActiveRect,
    activeIndex,
    overIndex,
    index
  } = _ref;
  const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;

  if (!activeNodeRect) {
    return null;
  }

  const itemGap = getItemGap(rects, index, activeIndex);

  if (index === activeIndex) {
    const newIndexRect = rects[overIndex];

    if (!newIndexRect) {
      return null;
    }

    return {
      x: activeIndex < overIndex ? newIndexRect.left + newIndexRect.width - (activeNodeRect.left + activeNodeRect.width) : newIndexRect.left - activeNodeRect.left,
      y: 0,
      ...defaultScale
    };
  }

  if (index > activeIndex && index <= overIndex) {
    return {
      x: -activeNodeRect.width - itemGap,
      y: 0,
      ...defaultScale
    };
  }

  if (index < activeIndex && index >= overIndex) {
    return {
      x: activeNodeRect.width + itemGap,
      y: 0,
      ...defaultScale
    };
  }

  return {
    x: 0,
    y: 0,
    ...defaultScale
  };
};

function getItemGap(rects, index, activeIndex) {
  const currentRect = rects[index];
  const previousRect = rects[index - 1];
  const nextRect = rects[index + 1];

  if (!currentRect || !previousRect && !nextRect) {
    return 0;
  }

  if (activeIndex < index) {
    return previousRect ? currentRect.left - (previousRect.left + previousRect.width) : nextRect.left - (currentRect.left + currentRect.width);
  }

  return nextRect ? nextRect.left - (currentRect.left + currentRect.width) : currentRect.left - (previousRect.left + previousRect.width);
}

const rectSortingStrategy = _ref => {
  let {
    rects,
    activeIndex,
    overIndex,
    index
  } = _ref;
  const newRects = arrayMove(rects, overIndex, activeIndex);
  const oldRect = rects[index];
  const newRect = newRects[index];

  if (!newRect || !oldRect) {
    return null;
  }

  return {
    x: newRect.left - oldRect.left,
    y: newRect.top - oldRect.top,
    scaleX: newRect.width / oldRect.width,
    scaleY: newRect.height / oldRect.height
  };
};

const rectSwappingStrategy = _ref => {
  let {
    activeIndex,
    index,
    rects,
    overIndex
  } = _ref;
  let oldRect;
  let newRect;

  if (index === activeIndex) {
    oldRect = rects[index];
    newRect = rects[overIndex];
  }

  if (index === overIndex) {
    oldRect = rects[index];
    newRect = rects[activeIndex];
  }

  if (!newRect || !oldRect) {
    return null;
  }

  return {
    x: newRect.left - oldRect.left,
    y: newRect.top - oldRect.top,
    scaleX: newRect.width / oldRect.width,
    scaleY: newRect.height / oldRect.height
  };
};

// To-do: We should be calculating scale transformation
const defaultScale$1 = {
  scaleX: 1,
  scaleY: 1
};
const verticalListSortingStrategy = _ref => {
  var _rects$activeIndex;

  let {
    activeIndex,
    activeNodeRect: fallbackActiveRect,
    index,
    rects,
    overIndex
  } = _ref;
  const activeNodeRect = (_rects$activeIndex = rects[activeIndex]) != null ? _rects$activeIndex : fallbackActiveRect;

  if (!activeNodeRect) {
    return null;
  }

  if (index === activeIndex) {
    const overIndexRect = rects[overIndex];

    if (!overIndexRect) {
      return null;
    }

    return {
      x: 0,
      y: activeIndex < overIndex ? overIndexRect.top + overIndexRect.height - (activeNodeRect.top + activeNodeRect.height) : overIndexRect.top - activeNodeRect.top,
      ...defaultScale$1
    };
  }

  const itemGap = getItemGap$1(rects, index, activeIndex);

  if (index > activeIndex && index <= overIndex) {
    return {
      x: 0,
      y: -activeNodeRect.height - itemGap,
      ...defaultScale$1
    };
  }

  if (index < activeIndex && index >= overIndex) {
    return {
      x: 0,
      y: activeNodeRect.height + itemGap,
      ...defaultScale$1
    };
  }

  return {
    x: 0,
    y: 0,
    ...defaultScale$1
  };
};

function getItemGap$1(clientRects, index, activeIndex) {
  const currentRect = clientRects[index];
  const previousRect = clientRects[index - 1];
  const nextRect = clientRects[index + 1];

  if (!currentRect) {
    return 0;
  }

  if (activeIndex < index) {
    return previousRect ? currentRect.top - (previousRect.top + previousRect.height) : nextRect ? nextRect.top - (currentRect.top + currentRect.height) : 0;
  }

  return nextRect ? nextRect.top - (currentRect.top + currentRect.height) : previousRect ? currentRect.top - (previousRect.top + previousRect.height) : 0;
}

const ID_PREFIX = 'Sortable';
const Context = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createContext({
  activeIndex: -1,
  containerId: ID_PREFIX,
  disableTransforms: false,
  items: [],
  overIndex: -1,
  useDragOverlay: false,
  sortedRects: [],
  strategy: rectSortingStrategy,
  disabled: {
    draggable: false,
    droppable: false
  }
});
function SortableContext(_ref) {
  let {
    children,
    id,
    items: userDefinedItems,
    strategy = rectSortingStrategy,
    disabled: disabledProp = false
  } = _ref;
  const {
    active,
    dragOverlay,
    droppableRects,
    over,
    measureDroppableContainers
  } = (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.useDndContext)();
  const containerId = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useUniqueId)(ID_PREFIX, id);
  const useDragOverlay = Boolean(dragOverlay.rect !== null);
  const items = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => userDefinedItems.map(item => typeof item === 'object' && 'id' in item ? item.id : item), [userDefinedItems]);
  const isDragging = active != null;
  const activeIndex = active ? items.indexOf(active.id) : -1;
  const overIndex = over ? items.indexOf(over.id) : -1;
  const previousItemsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(items);
  const itemsHaveChanged = !itemsEqual(items, previousItemsRef.current);
  const disableTransforms = overIndex !== -1 && activeIndex === -1 || itemsHaveChanged;
  const disabled = normalizeDisabled(disabledProp);
  (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useIsomorphicLayoutEffect)(() => {
    if (itemsHaveChanged && isDragging) {
      measureDroppableContainers(items);
    }
  }, [itemsHaveChanged, items, isDragging, measureDroppableContainers]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    previousItemsRef.current = items;
  }, [items]);
  const contextValue = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    activeIndex,
    containerId,
    disabled,
    disableTransforms,
    items,
    overIndex,
    useDragOverlay,
    sortedRects: getSortedRects(items, droppableRects),
    strategy
  }), // eslint-disable-next-line react-hooks/exhaustive-deps
  [activeIndex, containerId, disabled.draggable, disabled.droppable, disableTransforms, items, overIndex, droppableRects, useDragOverlay, strategy]);
  return react__WEBPACK_IMPORTED_MODULE_0___default().createElement(Context.Provider, {
    value: contextValue
  }, children);
}

const defaultNewIndexGetter = _ref => {
  let {
    id,
    items,
    activeIndex,
    overIndex
  } = _ref;
  return arrayMove(items, activeIndex, overIndex).indexOf(id);
};
const defaultAnimateLayoutChanges = _ref2 => {
  let {
    containerId,
    isSorting,
    wasDragging,
    index,
    items,
    newIndex,
    previousItems,
    previousContainerId,
    transition
  } = _ref2;

  if (!transition || !wasDragging) {
    return false;
  }

  if (previousItems !== items && index === newIndex) {
    return false;
  }

  if (isSorting) {
    return true;
  }

  return newIndex !== index && containerId === previousContainerId;
};
const defaultTransition = {
  duration: 200,
  easing: 'ease'
};
const transitionProperty = 'transform';
const disabledTransition = /*#__PURE__*/_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.CSS.Transition.toString({
  property: transitionProperty,
  duration: 0,
  easing: 'linear'
});
const defaultAttributes = {
  roleDescription: 'sortable'
};

/*
 * When the index of an item changes while sorting,
 * we need to temporarily disable the transforms
 */

function useDerivedTransform(_ref) {
  let {
    disabled,
    index,
    node,
    rect
  } = _ref;
  const [derivedTransform, setDerivedtransform] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const previousIndex = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(index);
  (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useIsomorphicLayoutEffect)(() => {
    if (!disabled && index !== previousIndex.current && node.current) {
      const initial = rect.current;

      if (initial) {
        const current = (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.getClientRect)(node.current, {
          ignoreTransform: true
        });
        const delta = {
          x: initial.left - current.left,
          y: initial.top - current.top,
          scaleX: initial.width / current.width,
          scaleY: initial.height / current.height
        };

        if (delta.x || delta.y) {
          setDerivedtransform(delta);
        }
      }
    }

    if (index !== previousIndex.current) {
      previousIndex.current = index;
    }
  }, [disabled, index, node, rect]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (derivedTransform) {
      setDerivedtransform(null);
    }
  }, [derivedTransform]);
  return derivedTransform;
}

function useSortable(_ref) {
  let {
    animateLayoutChanges = defaultAnimateLayoutChanges,
    attributes: userDefinedAttributes,
    disabled: localDisabled,
    data: customData,
    getNewIndex = defaultNewIndexGetter,
    id,
    strategy: localStrategy,
    resizeObserverConfig,
    transition = defaultTransition
  } = _ref;
  const {
    items,
    containerId,
    activeIndex,
    disabled: globalDisabled,
    disableTransforms,
    sortedRects,
    overIndex,
    useDragOverlay,
    strategy: globalStrategy
  } = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(Context);
  const disabled = normalizeLocalDisabled(localDisabled, globalDisabled);
  const index = items.indexOf(id);
  const data = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => ({
    sortable: {
      containerId,
      index,
      items
    },
    ...customData
  }), [containerId, customData, index, items]);
  const itemsAfterCurrentSortable = (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => items.slice(items.indexOf(id)), [items, id]);
  const {
    rect,
    node,
    isOver,
    setNodeRef: setDroppableNodeRef
  } = (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.useDroppable)({
    id,
    data,
    disabled: disabled.droppable,
    resizeObserverConfig: {
      updateMeasurementsFor: itemsAfterCurrentSortable,
      ...resizeObserverConfig
    }
  });
  const {
    active,
    activatorEvent,
    activeNodeRect,
    attributes,
    setNodeRef: setDraggableNodeRef,
    listeners,
    isDragging,
    over,
    setActivatorNodeRef,
    transform
  } = (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.useDraggable)({
    id,
    data,
    attributes: { ...defaultAttributes,
      ...userDefinedAttributes
    },
    disabled: disabled.draggable
  });
  const setNodeRef = (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.useCombinedRefs)(setDroppableNodeRef, setDraggableNodeRef);
  const isSorting = Boolean(active);
  const displaceItem = isSorting && !disableTransforms && isValidIndex(activeIndex) && isValidIndex(overIndex);
  const shouldDisplaceDragSource = !useDragOverlay && isDragging;
  const dragSourceDisplacement = shouldDisplaceDragSource && displaceItem ? transform : null;
  const strategy = localStrategy != null ? localStrategy : globalStrategy;
  const finalTransform = displaceItem ? dragSourceDisplacement != null ? dragSourceDisplacement : strategy({
    rects: sortedRects,
    activeNodeRect,
    activeIndex,
    overIndex,
    index
  }) : null;
  const newIndex = isValidIndex(activeIndex) && isValidIndex(overIndex) ? getNewIndex({
    id,
    items,
    activeIndex,
    overIndex
  }) : index;
  const activeId = active == null ? void 0 : active.id;
  const previous = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
    activeId,
    items,
    newIndex,
    containerId
  });
  const itemsHaveChanged = items !== previous.current.items;
  const shouldAnimateLayoutChanges = animateLayoutChanges({
    active,
    containerId,
    isDragging,
    isSorting,
    id,
    index,
    items,
    newIndex: previous.current.newIndex,
    previousItems: previous.current.items,
    previousContainerId: previous.current.containerId,
    transition,
    wasDragging: previous.current.activeId != null
  });
  const derivedTransform = useDerivedTransform({
    disabled: !shouldAnimateLayoutChanges,
    index,
    node,
    rect
  });
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (isSorting && previous.current.newIndex !== newIndex) {
      previous.current.newIndex = newIndex;
    }

    if (containerId !== previous.current.containerId) {
      previous.current.containerId = containerId;
    }

    if (items !== previous.current.items) {
      previous.current.items = items;
    }
  }, [isSorting, newIndex, containerId, items]);
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (activeId === previous.current.activeId) {
      return;
    }

    if (activeId != null && previous.current.activeId == null) {
      previous.current.activeId = activeId;
      return;
    }

    const timeoutId = setTimeout(() => {
      previous.current.activeId = activeId;
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [activeId]);
  return {
    active,
    activeIndex,
    attributes,
    data,
    rect,
    index,
    newIndex,
    items,
    isOver,
    isSorting,
    isDragging,
    listeners,
    node,
    overIndex,
    over,
    setNodeRef,
    setActivatorNodeRef,
    setDroppableNodeRef,
    setDraggableNodeRef,
    transform: derivedTransform != null ? derivedTransform : finalTransform,
    transition: getTransition()
  };

  function getTransition() {
    if ( // Temporarily disable transitions for a single frame to set up derived transforms
    derivedTransform || // Or to prevent items jumping to back to their "new" position when items change
    itemsHaveChanged && previous.current.newIndex === index) {
      return disabledTransition;
    }

    if (shouldDisplaceDragSource && !(0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.isKeyboardEvent)(activatorEvent) || !transition) {
      return undefined;
    }

    if (isSorting || shouldAnimateLayoutChanges) {
      return _dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.CSS.Transition.toString({ ...transition,
        property: transitionProperty
      });
    }

    return undefined;
  }
}

function normalizeLocalDisabled(localDisabled, globalDisabled) {
  var _localDisabled$dragga, _localDisabled$droppa;

  if (typeof localDisabled === 'boolean') {
    return {
      draggable: localDisabled,
      // Backwards compatibility
      droppable: false
    };
  }

  return {
    draggable: (_localDisabled$dragga = localDisabled == null ? void 0 : localDisabled.draggable) != null ? _localDisabled$dragga : globalDisabled.draggable,
    droppable: (_localDisabled$droppa = localDisabled == null ? void 0 : localDisabled.droppable) != null ? _localDisabled$droppa : globalDisabled.droppable
  };
}

function hasSortableData(entry) {
  if (!entry) {
    return false;
  }

  const data = entry.data.current;

  if (data && 'sortable' in data && typeof data.sortable === 'object' && 'containerId' in data.sortable && 'items' in data.sortable && 'index' in data.sortable) {
    return true;
  }

  return false;
}

const directions = [_dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.KeyboardCode.Down, _dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.KeyboardCode.Right, _dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.KeyboardCode.Up, _dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.KeyboardCode.Left];
const sortableKeyboardCoordinates = (event, _ref) => {
  let {
    context: {
      active,
      collisionRect,
      droppableRects,
      droppableContainers,
      over,
      scrollableAncestors
    }
  } = _ref;

  if (directions.includes(event.code)) {
    event.preventDefault();

    if (!active || !collisionRect) {
      return;
    }

    const filteredContainers = [];
    droppableContainers.getEnabled().forEach(entry => {
      if (!entry || entry != null && entry.disabled) {
        return;
      }

      const rect = droppableRects.get(entry.id);

      if (!rect) {
        return;
      }

      switch (event.code) {
        case _dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.KeyboardCode.Down:
          if (collisionRect.top < rect.top) {
            filteredContainers.push(entry);
          }

          break;

        case _dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.KeyboardCode.Up:
          if (collisionRect.top > rect.top) {
            filteredContainers.push(entry);
          }

          break;

        case _dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.KeyboardCode.Left:
          if (collisionRect.left > rect.left) {
            filteredContainers.push(entry);
          }

          break;

        case _dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.KeyboardCode.Right:
          if (collisionRect.left < rect.left) {
            filteredContainers.push(entry);
          }

          break;
      }
    });
    const collisions = (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.closestCorners)({
      active,
      collisionRect: collisionRect,
      droppableRects,
      droppableContainers: filteredContainers,
      pointerCoordinates: null
    });
    let closestId = (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.getFirstCollision)(collisions, 'id');

    if (closestId === (over == null ? void 0 : over.id) && collisions.length > 1) {
      closestId = collisions[1].id;
    }

    if (closestId != null) {
      const activeDroppable = droppableContainers.get(active.id);
      const newDroppable = droppableContainers.get(closestId);
      const newRect = newDroppable ? droppableRects.get(newDroppable.id) : null;
      const newNode = newDroppable == null ? void 0 : newDroppable.node.current;

      if (newNode && newRect && activeDroppable && newDroppable) {
        const newScrollAncestors = (0,_dnd_kit_core__WEBPACK_IMPORTED_MODULE_1__.getScrollableAncestors)(newNode);
        const hasDifferentScrollAncestors = newScrollAncestors.some((element, index) => scrollableAncestors[index] !== element);
        const hasSameContainer = isSameContainer(activeDroppable, newDroppable);
        const isAfterActive = isAfter(activeDroppable, newDroppable);
        const offset = hasDifferentScrollAncestors || !hasSameContainer ? {
          x: 0,
          y: 0
        } : {
          x: isAfterActive ? collisionRect.width - newRect.width : 0,
          y: isAfterActive ? collisionRect.height - newRect.height : 0
        };
        const rectCoordinates = {
          x: newRect.left,
          y: newRect.top
        };
        const newCoordinates = offset.x && offset.y ? rectCoordinates : (0,_dnd_kit_utilities__WEBPACK_IMPORTED_MODULE_2__.subtract)(rectCoordinates, offset);
        return newCoordinates;
      }
    }
  }

  return undefined;
};

function isSameContainer(a, b) {
  if (!hasSortableData(a) || !hasSortableData(b)) {
    return false;
  }

  return a.data.current.sortable.containerId === b.data.current.sortable.containerId;
}

function isAfter(a, b) {
  if (!hasSortableData(a) || !hasSortableData(b)) {
    return false;
  }

  if (!isSameContainer(a, b)) {
    return false;
  }

  return a.data.current.sortable.index < b.data.current.sortable.index;
}


//# sourceMappingURL=sortable.esm.js.map


/***/ },

/***/ "./node_modules/@dnd-kit/utilities/dist/utilities.esm.js"
/*!***************************************************************!*\
  !*** ./node_modules/@dnd-kit/utilities/dist/utilities.esm.js ***!
  \***************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CSS: () => (/* binding */ CSS),
/* harmony export */   add: () => (/* binding */ add),
/* harmony export */   canUseDOM: () => (/* binding */ canUseDOM),
/* harmony export */   findFirstFocusableNode: () => (/* binding */ findFirstFocusableNode),
/* harmony export */   getEventCoordinates: () => (/* binding */ getEventCoordinates),
/* harmony export */   getOwnerDocument: () => (/* binding */ getOwnerDocument),
/* harmony export */   getWindow: () => (/* binding */ getWindow),
/* harmony export */   hasViewportRelativeCoordinates: () => (/* binding */ hasViewportRelativeCoordinates),
/* harmony export */   isDocument: () => (/* binding */ isDocument),
/* harmony export */   isHTMLElement: () => (/* binding */ isHTMLElement),
/* harmony export */   isKeyboardEvent: () => (/* binding */ isKeyboardEvent),
/* harmony export */   isNode: () => (/* binding */ isNode),
/* harmony export */   isSVGElement: () => (/* binding */ isSVGElement),
/* harmony export */   isTouchEvent: () => (/* binding */ isTouchEvent),
/* harmony export */   isWindow: () => (/* binding */ isWindow),
/* harmony export */   subtract: () => (/* binding */ subtract),
/* harmony export */   useCombinedRefs: () => (/* binding */ useCombinedRefs),
/* harmony export */   useEvent: () => (/* binding */ useEvent),
/* harmony export */   useInterval: () => (/* binding */ useInterval),
/* harmony export */   useIsomorphicLayoutEffect: () => (/* binding */ useIsomorphicLayoutEffect),
/* harmony export */   useLatestValue: () => (/* binding */ useLatestValue),
/* harmony export */   useLazyMemo: () => (/* binding */ useLazyMemo),
/* harmony export */   useNodeRef: () => (/* binding */ useNodeRef),
/* harmony export */   usePrevious: () => (/* binding */ usePrevious),
/* harmony export */   useUniqueId: () => (/* binding */ useUniqueId)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);


function useCombinedRefs() {
  for (var _len = arguments.length, refs = new Array(_len), _key = 0; _key < _len; _key++) {
    refs[_key] = arguments[_key];
  }

  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => node => {
    refs.forEach(ref => ref(node));
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  refs);
}

// https://github.com/facebook/react/blob/master/packages/shared/ExecutionEnvironment.js
const canUseDOM = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined';

function isWindow(element) {
  const elementString = Object.prototype.toString.call(element);
  return elementString === '[object Window]' || // In Electron context the Window object serializes to [object global]
  elementString === '[object global]';
}

function isNode(node) {
  return 'nodeType' in node;
}

function getWindow(target) {
  var _target$ownerDocument, _target$ownerDocument2;

  if (!target) {
    return window;
  }

  if (isWindow(target)) {
    return target;
  }

  if (!isNode(target)) {
    return window;
  }

  return (_target$ownerDocument = (_target$ownerDocument2 = target.ownerDocument) == null ? void 0 : _target$ownerDocument2.defaultView) != null ? _target$ownerDocument : window;
}

function isDocument(node) {
  const {
    Document
  } = getWindow(node);
  return node instanceof Document;
}

function isHTMLElement(node) {
  if (isWindow(node)) {
    return false;
  }

  return node instanceof getWindow(node).HTMLElement;
}

function isSVGElement(node) {
  return node instanceof getWindow(node).SVGElement;
}

function getOwnerDocument(target) {
  if (!target) {
    return document;
  }

  if (isWindow(target)) {
    return target.document;
  }

  if (!isNode(target)) {
    return document;
  }

  if (isDocument(target)) {
    return target;
  }

  if (isHTMLElement(target) || isSVGElement(target)) {
    return target.ownerDocument;
  }

  return document;
}

/**
 * A hook that resolves to useEffect on the server and useLayoutEffect on the client
 * @param callback {function} Callback function that is invoked when the dependencies of the hook change
 */

const useIsomorphicLayoutEffect = canUseDOM ? react__WEBPACK_IMPORTED_MODULE_0__.useLayoutEffect : react__WEBPACK_IMPORTED_MODULE_0__.useEffect;

function useEvent(handler) {
  const handlerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(handler);
  useIsomorphicLayoutEffect(() => {
    handlerRef.current = handler;
  });
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return handlerRef.current == null ? void 0 : handlerRef.current(...args);
  }, []);
}

function useInterval() {
  const intervalRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const set = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((listener, duration) => {
    intervalRef.current = setInterval(listener, duration);
  }, []);
  const clear = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  return [set, clear];
}

function useLatestValue(value, dependencies) {
  if (dependencies === void 0) {
    dependencies = [value];
  }

  const valueRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(value);
  useIsomorphicLayoutEffect(() => {
    if (valueRef.current !== value) {
      valueRef.current = value;
    }
  }, dependencies);
  return valueRef;
}

function useLazyMemo(callback, dependencies) {
  const valueRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)();
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    const newValue = callback(valueRef.current);
    valueRef.current = newValue;
    return newValue;
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [...dependencies]);
}

function useNodeRef(onChange) {
  const onChangeHandler = useEvent(onChange);
  const node = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
  const setNodeRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(element => {
    if (element !== node.current) {
      onChangeHandler == null ? void 0 : onChangeHandler(element, node.current);
    }

    node.current = element;
  }, //eslint-disable-next-line
  []);
  return [node, setNodeRef];
}

function usePrevious(value) {
  const ref = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)();
  (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

let ids = {};
function useUniqueId(prefix, value) {
  return (0,react__WEBPACK_IMPORTED_MODULE_0__.useMemo)(() => {
    if (value) {
      return value;
    }

    const id = ids[prefix] == null ? 0 : ids[prefix] + 1;
    ids[prefix] = id;
    return prefix + "-" + id;
  }, [prefix, value]);
}

function createAdjustmentFn(modifier) {
  return function (object) {
    for (var _len = arguments.length, adjustments = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      adjustments[_key - 1] = arguments[_key];
    }

    return adjustments.reduce((accumulator, adjustment) => {
      const entries = Object.entries(adjustment);

      for (const [key, valueAdjustment] of entries) {
        const value = accumulator[key];

        if (value != null) {
          accumulator[key] = value + modifier * valueAdjustment;
        }
      }

      return accumulator;
    }, { ...object
    });
  };
}

const add = /*#__PURE__*/createAdjustmentFn(1);
const subtract = /*#__PURE__*/createAdjustmentFn(-1);

function hasViewportRelativeCoordinates(event) {
  return 'clientX' in event && 'clientY' in event;
}

function isKeyboardEvent(event) {
  if (!event) {
    return false;
  }

  const {
    KeyboardEvent
  } = getWindow(event.target);
  return KeyboardEvent && event instanceof KeyboardEvent;
}

function isTouchEvent(event) {
  if (!event) {
    return false;
  }

  const {
    TouchEvent
  } = getWindow(event.target);
  return TouchEvent && event instanceof TouchEvent;
}

/**
 * Returns the normalized x and y coordinates for mouse and touch events.
 */

function getEventCoordinates(event) {
  if (isTouchEvent(event)) {
    if (event.touches && event.touches.length) {
      const {
        clientX: x,
        clientY: y
      } = event.touches[0];
      return {
        x,
        y
      };
    } else if (event.changedTouches && event.changedTouches.length) {
      const {
        clientX: x,
        clientY: y
      } = event.changedTouches[0];
      return {
        x,
        y
      };
    }
  }

  if (hasViewportRelativeCoordinates(event)) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }

  return null;
}

const CSS = /*#__PURE__*/Object.freeze({
  Translate: {
    toString(transform) {
      if (!transform) {
        return;
      }

      const {
        x,
        y
      } = transform;
      return "translate3d(" + (x ? Math.round(x) : 0) + "px, " + (y ? Math.round(y) : 0) + "px, 0)";
    }

  },
  Scale: {
    toString(transform) {
      if (!transform) {
        return;
      }

      const {
        scaleX,
        scaleY
      } = transform;
      return "scaleX(" + scaleX + ") scaleY(" + scaleY + ")";
    }

  },
  Transform: {
    toString(transform) {
      if (!transform) {
        return;
      }

      return [CSS.Translate.toString(transform), CSS.Scale.toString(transform)].join(' ');
    }

  },
  Transition: {
    toString(_ref) {
      let {
        property,
        duration,
        easing
      } = _ref;
      return property + " " + duration + "ms " + easing;
    }

  }
});

const SELECTOR = 'a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]';
function findFirstFocusableNode(element) {
  if (element.matches(SELECTOR)) {
    return element;
  }

  return element.querySelector(SELECTOR);
}


//# sourceMappingURL=utilities.esm.js.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/check.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/check.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ check_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/check.tsx


var check_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M16.5 7.5 10 13.9l-2.5-2.4-1 1 3.5 3.6 7.5-7.6z" }) });

//# sourceMappingURL=check.mjs.map


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

/***/ "./node_modules/@wordpress/icons/build-module/library/help.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/help.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ help_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/help.tsx


var help_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M12 4a8 8 0 1 1 .001 16.001A8 8 0 0 1 12 4Zm0 1.5a6.5 6.5 0 1 0-.001 13.001A6.5 6.5 0 0 0 12 5.5Zm.75 11h-1.5V15h1.5v1.5Zm-.445-9.234a3 3 0 0 1 .445 5.89V14h-1.5v-1.25c0-.57.452-.958.917-1.01A1.5 1.5 0 0 0 12 8.75a1.5 1.5 0 0 0-1.5 1.5H9a3 3 0 0 1 3.305-2.984Z" }) });

//# sourceMappingURL=help.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/pencil.mjs"
/*!***********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/pencil.mjs ***!
  \***********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ pencil_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/pencil.tsx


var pencil_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m19 7-3-3-8.5 8.5-1 4 4-1L19 7Zm-7 11.5H5V20h7v-1.5Z" }) });

//# sourceMappingURL=pencil.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/pin.mjs"
/*!********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/pin.mjs ***!
  \********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ pin_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/pin.tsx


var pin_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "m21.5 9.1-6.6-6.6-4.2 5.6c-1.2-.1-2.4.1-3.6.7-.1 0-.1.1-.2.1-.5.3-.9.6-1.2.9l3.7 3.7-5.7 5.7v1.1h1.1l5.7-5.7 3.7 3.7c.4-.4.7-.8.9-1.2.1-.1.1-.2.2-.3.6-1.1.8-2.4.6-3.6l5.6-4.1zm-7.3 3.5.1.9c.1.9 0 1.8-.4 2.6l-6-6c.8-.4 1.7-.5 2.6-.4l.9.1L15 4.9 19.1 9l-4.9 3.6z" }) });

//# sourceMappingURL=pin.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/plus.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/plus.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ plus_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/plus.tsx


var plus_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M11 12.5V17.5H12.5V12.5H17.5V11H12.5V6H11V11H6V12.5H11Z" }) });

//# sourceMappingURL=plus.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/seen.mjs"
/*!*********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/seen.mjs ***!
  \*********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ seen_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/seen.tsx


var seen_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M3.99961 13C4.67043 13.3354 4.6703 13.3357 4.67017 13.3359L4.67298 13.3305C4.67621 13.3242 4.68184 13.3135 4.68988 13.2985C4.70595 13.2686 4.7316 13.2218 4.76695 13.1608C4.8377 13.0385 4.94692 12.8592 5.09541 12.6419C5.39312 12.2062 5.84436 11.624 6.45435 11.0431C7.67308 9.88241 9.49719 8.75 11.9996 8.75C14.502 8.75 16.3261 9.88241 17.5449 11.0431C18.1549 11.624 18.6061 12.2062 18.9038 12.6419C19.0523 12.8592 19.1615 13.0385 19.2323 13.1608C19.2676 13.2218 19.2933 13.2686 19.3093 13.2985C19.3174 13.3135 19.323 13.3242 19.3262 13.3305L19.3291 13.3359C19.3289 13.3357 19.3288 13.3354 19.9996 13C20.6704 12.6646 20.6703 12.6643 20.6701 12.664L20.6697 12.6632L20.6688 12.6614L20.6662 12.6563L20.6583 12.6408C20.6517 12.6282 20.6427 12.6108 20.631 12.5892C20.6078 12.5459 20.5744 12.4852 20.5306 12.4096C20.4432 12.2584 20.3141 12.0471 20.1423 11.7956C19.7994 11.2938 19.2819 10.626 18.5794 9.9569C17.1731 8.61759 14.9972 7.25 11.9996 7.25C9.00203 7.25 6.82614 8.61759 5.41987 9.9569C4.71736 10.626 4.19984 11.2938 3.85694 11.7956C3.68511 12.0471 3.55605 12.2584 3.4686 12.4096C3.42484 12.4852 3.39142 12.5459 3.36818 12.5892C3.35656 12.6108 3.34748 12.6282 3.34092 12.6408L3.33297 12.6563L3.33041 12.6614L3.32948 12.6632L3.32911 12.664C3.32894 12.6643 3.32879 12.6646 3.99961 13ZM11.9996 16C13.9326 16 15.4996 14.433 15.4996 12.5C15.4996 10.567 13.9326 9 11.9996 9C10.0666 9 8.49961 10.567 8.49961 12.5C8.49961 14.433 10.0666 16 11.9996 16Z" }) });

//# sourceMappingURL=seen.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/star-filled.mjs"
/*!****************************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/star-filled.mjs ***!
  \****************************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ star_filled_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/star-filled.tsx


var star_filled_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path, { d: "M11.776 4.454a.25.25 0 01.448 0l2.069 4.192a.25.25 0 00.188.137l4.626.672a.25.25 0 01.139.426l-3.348 3.263a.25.25 0 00-.072.222l.79 4.607a.25.25 0 01-.362.263l-4.138-2.175a.25.25 0 00-.232 0l-4.138 2.175a.25.25 0 01-.363-.263l.79-4.607a.25.25 0 00-.071-.222L4.754 9.881a.25.25 0 01.139-.426l4.626-.672a.25.25 0 00.188-.137l2.069-4.192z" }) });

//# sourceMappingURL=star-filled.mjs.map


/***/ },

/***/ "./node_modules/@wordpress/icons/build-module/library/trash.mjs"
/*!**********************************************************************!*\
  !*** ./node_modules/@wordpress/icons/build-module/library/trash.mjs ***!
  \**********************************************************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ trash_default)
/* harmony export */ });
/* harmony import */ var _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/primitives */ "@wordpress/primitives");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
// packages/icons/src/library/trash.tsx


var trash_default = /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(_wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.SVG, { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", children: /* @__PURE__ */ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_1__.jsx)(
  _wordpress_primitives__WEBPACK_IMPORTED_MODULE_0__.Path,
  {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 5.5A2.25 2.25 0 0 0 9.878 7h4.244A2.251 2.251 0 0 0 12 5.5ZM12 4a3.751 3.751 0 0 0-3.675 3H5v1.5h1.27l.818 8.997a2.75 2.75 0 0 0 2.739 2.501h4.347a2.75 2.75 0 0 0 2.738-2.5L17.73 8.5H19V7h-3.325A3.751 3.751 0 0 0 12 4Zm4.224 4.5H7.776l.806 8.861a1.25 1.25 0 0 0 1.245 1.137h4.347a1.25 1.25 0 0 0 1.245-1.137l.805-8.861Z"
  }
) });

//# sourceMappingURL=trash.mjs.map


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

/***/ "@wordpress/editor"
/*!********************************!*\
  !*** external ["wp","editor"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["editor"];

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

/***/ "@wordpress/plugins"
/*!*********************************!*\
  !*** external ["wp","plugins"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["plugins"];

/***/ },

/***/ "@wordpress/primitives"
/*!************************************!*\
  !*** external ["wp","primitives"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["primitives"];

/***/ },

/***/ "react"
/*!************************!*\
  !*** external "React" ***!
  \************************/
(module) {

module.exports = window["React"];

/***/ },

/***/ "react-dom"
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
(module) {

module.exports = window["ReactDOM"];

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
/*!*************************************!*\
  !*** ./assets/js/educator/index.js ***!
  \*************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/plugins */ "@wordpress/plugins");
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _store__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../store */ "./assets/js/store/index.js");
/* harmony import */ var _EducatorSidebar_jsx__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./EducatorSidebar.jsx */ "./assets/js/educator/EducatorSidebar.jsx");
/**
 * Educator Entry Point.
 *
 * Registers the Educator sidebar plugin for the block editor.
 *
 * @package AdminCoachTours
 * @since   0.1.0
 */



// Import store to ensure it's registered before components use it.



// Register the educator plugin sidebar.
(0,_wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__.registerPlugin)('admin-coach-tours-educator', {
  render: _EducatorSidebar_jsx__WEBPACK_IMPORTED_MODULE_2__["default"],
  icon: null // Icon is set in the PluginSidebar component.
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map