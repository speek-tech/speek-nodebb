'use strict';

define('lucideInit', ['lucideIconData'], function (lucideIconData) {
	const lucideInit = {};
	let initializationAttempts = 0;
	const MAX_ATTEMPTS = 5;

	/**
	 * Initialize Lucide icons on the page
	 * Tries CDN first, falls back to embedded SVG data
	 */
	lucideInit.init = function (scope) {
		initializationAttempts++;
		
		if (initializationAttempts > MAX_ATTEMPTS) {
			console.warn('[LucideInit] Max initialization attempts reached');
			return;
		}

		const targetScope = scope || document;
		
		// Try Lucide CDN first
		if (window.lucide && typeof window.lucide.createIcons === 'function') {
			try {
				if (scope) {
					window.lucide.createIcons({ scope: targetScope });
				} else {
					window.lucide.createIcons();
				}
				console.log('[LucideInit] Icons initialized via CDN', scope ? '(scoped)' : '(global)');
				return true;
			} catch (e) {
				console.warn('[LucideInit] CDN initialization failed:', e);
			}
		}

		// Fallback: Use embedded SVG data
		if (lucideIconData && lucideIconData.createIconSvg) {
			const icons = targetScope.querySelectorAll('[data-lucide]');
			let count = 0;
			
			icons.forEach(function(iconEl) {
				const iconName = iconEl.getAttribute('data-lucide');
				if (iconName && !iconEl.querySelector('svg')) {
					const size = iconEl.getAttribute('data-lucide-size') || 24;
					const svgHtml = lucideIconData.createIconSvg(iconName, parseInt(size, 10));
					iconEl.innerHTML = svgHtml;
					count++;
				}
			});
			
			if (count > 0) {
				console.log('[LucideInit] Initialized', count, 'icons via fallback data');
			}
			return true;
		}

		console.warn('[LucideInit] Neither CDN nor fallback data available');
		return false;
	};

	/**
	 * Initialize icons after a delay (for dynamic content)
	 */
	lucideInit.initDelayed = function (delay, scope) {
		setTimeout(function() {
			lucideInit.init(scope);
		}, delay || 100);
	};

	/**
	 * Reset initialization attempt counter
	 */
	lucideInit.reset = function () {
		initializationAttempts = 0;
	};

	// Auto-initialize on various NodeBB events
	if (typeof $ !== 'undefined') {
		$(document).ready(function() {
			lucideInit.init();
			
			// Re-initialize on AJAX navigation
			$(window).on('action:ajaxify.end', function() {
				lucideInit.reset();
				lucideInit.initDelayed(150);
			});

			// Re-initialize when posts are loaded
			$(window).on('action:posts.loaded action:posts.edited', function() {
				lucideInit.initDelayed(100);
			});

			// Re-initialize when topics are loaded
			$(window).on('action:topics.loaded', function() {
				lucideInit.initDelayed(100);
			});

			// Re-initialize when categories are loaded
			$(window).on('action:categories.loaded', function() {
				lucideInit.initDelayed(100);
			});
		});
	}

	return lucideInit;
});

