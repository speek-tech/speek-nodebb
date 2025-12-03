'use strict';

/**
 * Modal Backdrop Communication Module
 * 
 * This module sends postMessage events to the parent window whenever
 * Bootstrap modals open or close, allowing the parent app to display
 * a full-page backdrop for modals shown in the iframe.
 */

define('modalBackdrop', function () {
	const ModalBackdrop = {};
	let activeModalCount = 0;

	/**
	 * Send modal event to parent window
	 * @param {string} action - 'open' or 'close'
	 */
	function sendModalEvent(action) {
		if (window.parent && window.parent !== window) {
			try {
				window.parent.postMessage({
					type: 'nodebb-modal',
					action: action,
				}, '*');
				console.log(`[ModalBackdrop] Sent '${action}' event to parent window`);
			} catch (e) {
				console.error('[ModalBackdrop] Failed to send message to parent:', e);
			}
		}
	}

	/**
	 * Initialize modal backdrop communication
	 * Sets up global event listeners for Bootstrap modals
	 */
	ModalBackdrop.init = function () {
		// Listen for Bootstrap modal shown event (when modal fully opens)
		$(document).on('shown.bs.modal', '.modal', function () {
			activeModalCount++;
			// Only send 'open' if this is the first modal
			if (activeModalCount === 1) {
				sendModalEvent('open');
			}
		});

		// Listen for Bootstrap modal hidden event (when modal fully closes)
		$(document).on('hidden.bs.modal', '.modal', function () {
			activeModalCount--;
			// Only send 'close' when all modals are closed
			if (activeModalCount <= 0) {
				activeModalCount = 0; // Reset to prevent negative values
				sendModalEvent('close');
			}
		});

		console.log('[ModalBackdrop] Initialized - listening for modal events');
	};

	/**
	 * Manually trigger modal open event
	 * Useful for custom modals that don't fire Bootstrap events
	 */
	ModalBackdrop.notifyOpen = function () {
		activeModalCount++;
		if (activeModalCount === 1) {
			sendModalEvent('open');
		}
	};

	/**
	 * Manually trigger modal close event
	 * Useful for custom modals that don't fire Bootstrap events
	 */
	ModalBackdrop.notifyClose = function () {
		activeModalCount--;
		if (activeModalCount <= 0) {
			activeModalCount = 0;
			sendModalEvent('close');
		}
	};

	return ModalBackdrop;
});

