'use strict';

$(document).ready(function () {
	// Setup edit indicator click prevention early, before other handlers
	setupEditIndicatorPrevention();
	
	// Fix empty space on topic pages - run immediately
	fixTopicPageEmptySpaceOnReady();
	
	setupSkinSwitcher();
	setupNProgress();
	setupMobileMenu();
	setupSearch();
	setupDrafts();
	handleMobileNavigator();
	setupNavTooltips();
	fixPlaceholders();
	fixSidebarOverflow();
	disableSystemAlerts();
	setupNewPostModal();
	initializeTopicSortDropdown();
	
	// Ensure NProgress is cleared on pagination clicks
	setupPaginationProgressHandler();
	
	// Function to fix empty space on topic pages - runs on DOM ready
	function fixTopicPageEmptySpaceOnReady() {
		// Check if we're on a topic page
		if ($('body').hasClass('template-topic')) {
			function removeSpacing() {
				$('.posts-container, .posts.timeline, .d-flex.flex-column.gap-3, .row.mb-4, body.template-topic').css({
					'padding-bottom': '0',
					'margin-bottom': '0',
					'min-height': 'auto',
					'height': 'auto'
				});
				
				// Force iframe height recalculation
				if (window.self !== window.top) {
					window.dispatchEvent(new Event('resize'));
					if (typeof window.forceSendHeight === 'function') {
						window.forceSendHeight();
					}
				}
			}
			
			// Run immediately
			removeSpacing();
			
			// Run multiple times to catch different load stages
			setTimeout(removeSpacing, 50);
			setTimeout(removeSpacing, 200);
			setTimeout(removeSpacing, 500);
			setTimeout(removeSpacing, 1000);
			setTimeout(removeSpacing, 1500);
			
			// Use MutationObserver to continuously watch for spacing changes
			if (window.MutationObserver) {
				const observer = new MutationObserver(function() {
					removeSpacing();
				});
				
				// Observe the posts container and body
				const postsContainer = document.querySelector('.posts-container, .posts.timeline, .d-flex.flex-column.gap-3');
				if (postsContainer) {
					observer.observe(postsContainer, {
						attributes: true,
						attributeFilter: ['style', 'class'],
						childList: true,
						subtree: true
					});
				}
				
				observer.observe(document.body, {
					attributes: true,
					attributeFilter: ['style', 'class'],
					childList: true,
					subtree: false
				});
			}
		}
	}
	
	// Function to prevent clicks on edit indicator while allowing tooltip
	function setupEditIndicatorPrevention() {
		// Use capture phase to intercept before other handlers
		document.addEventListener('click', function(e) {
			const target = e.target.closest('[component="post/edit-indicator"]');
			if (target) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				return false;
			}
		}, true); // true = capture phase
		
		// Also prevent mousedown and mouseup events in capture phase
		document.addEventListener('mousedown', function(e) {
			const target = e.target.closest('[component="post/edit-indicator"]');
			if (target) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				return false;
			}
		}, true);
		
		document.addEventListener('mouseup', function(e) {
			const target = e.target.closest('[component="post/edit-indicator"]');
			if (target) {
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				return false;
			}
		}, true);
	}

	function setupSkinSwitcher() {
		$('[component="skinSwitcher"]').on('click', '.dropdown-item', function () {
			const skin = $(this).attr('data-value');
			$('[component="skinSwitcher"] .dropdown-item .fa-check').addClass('invisible');
			$(this).find('.fa-check').removeClass('invisible');
			require(['forum/account/settings', 'hooks'], function (accountSettings, hooks) {
				hooks.one('action:skin.change', function () {
					$('[component="skinSwitcher"] [component="skinSwitcher/icon"]').removeClass('fa-fade');
				});
				$('[component="skinSwitcher"] [component="skinSwitcher/icon"]').addClass('fa-fade');
				accountSettings.changeSkin(skin);
			});
		});
	}

	require(['hooks'], function (hooks) {
		$(window).on('action:composer.resize action:sidebar.toggle', function () {
			const isRtl = $('html').attr('data-dir') === 'rtl';
			const css = {
				width: $('#panel').width(),
			};
			const sidebarEl = $('.sidebar-left');
			css[isRtl ? 'right' : 'left'] = sidebarEl.is(':visible') ? sidebarEl.outerWidth(true) : 0;
			$('[component="composer"]').css(css);
		});

		hooks.on('filter:chat.openChat', function (hookData) {
			// disables chat modals & goes straight to chat page based on user setting
			hookData.modal = config.theme.chatModals && !utils.isMobile();
			return hookData;
		});

		// Fix empty space on first load - run early
		hooks.on('action:ajaxify.end', function () {
			// Check if we're on a topic page
			if (ajaxify.data && ajaxify.data.template && ajaxify.data.template.topic) {
				// Remove spacing immediately
				setTimeout(function() {
					$('.posts-container, .posts.timeline, .d-flex.flex-column.gap-3, .row.mb-4').css({
						'padding-bottom': '0',
						'margin-bottom': '0',
						'min-height': 'auto',
						'height': 'auto'
					});
					
					// Force iframe height recalculation
					if (window.self !== window.top) {
						window.dispatchEvent(new Event('resize'));
						// Try multiple times to ensure it works
						setTimeout(function() {
							window.dispatchEvent(new Event('resize'));
							if (typeof window.forceSendHeight === 'function') {
								window.forceSendHeight();
							}
						}, 300);
						setTimeout(function() {
							window.dispatchEvent(new Event('resize'));
							if (typeof window.forceSendHeight === 'function') {
								window.forceSendHeight();
							}
						}, 800);
					}
				}, 100);
			}
		});

		// Hook for topic/post page mount
		hooks.on('action:topic.loaded', function (data) {
			onTopicMount(data);
		});

		// Track when a new topic is created - send PostHog analytics
		// Listen to socket event for new topic creation
		if (typeof socket !== 'undefined') {
			socket.on('event:new_topic', function (topicData) {
				// Check if this topic belongs to the current user and we're viewing it
				if (topicData && topicData.uid && app.user && app.user.uid && 
					String(topicData.uid) === String(app.user.uid)) {
					// Small delay to ensure we're on the topic page
					setTimeout(function() {
						if (ajaxify.data && ajaxify.data.tid && String(ajaxify.data.tid) === String(topicData.tid)) {
							try {
								window.parent.postMessage({
									type: 'posthog_analytics',
									action: 'write_post'
								}, '*');
							} catch (e) {
								console.log('Could not send analytics write_post:', e);
							}
						}
					}, 500);
				}
			});
		}

		// Also check on ajaxify.end if we just navigated to a newly created topic
		// This handles the case where we create a topic and immediately navigate to it
		let lastTopicCreateTime = null;
		hooks.on('action:ajaxify.end', function () {
			if (ajaxify.data && ajaxify.data.template && ajaxify.data.template.topic) {
				// Check if we just created this topic (within last 5 seconds)
				if (lastTopicCreateTime && (Date.now() - lastTopicCreateTime < 5000)) {
					try {
						window.parent.postMessage({
							type: 'posthog_analytics',
							action: 'write_post'
						}, '*');
						lastTopicCreateTime = null; // Reset after sending
					} catch (e) {
						console.log('Could not send analytics write_post:', e);
					}
				}
			}
		});

		// Track when composer submits a new topic
		hooks.on('action:composer.submit', function (data) {
			if (data && !data.tid) { // New topic (no tid means it's a new topic, not a reply)
				lastTopicCreateTime = Date.now();
			}
		});
	});

	function setupMobileMenu() {
		require(['hooks', 'api', 'navigator'], function (hooks, api, navigator) {
			$('[component="sidebar/toggle"]').on('click', async function () {
				const sidebarEl = $('.sidebar');
				sidebarEl.toggleClass('open');
				if (app.user.uid) {
					await api.put(`/users/${app.user.uid}/settings`, {
						settings: {
							openSidebars: sidebarEl.hasClass('open') ? 'on' : 'off',
						},
					});
				}
				$(window).trigger('action:sidebar.toggle');
				if (ajaxify.data.template.topic) {
					hooks.fire('action:navigator.update', { newIndex: navigator.getIndex() });
				}
			});

			const bottomBar = $('[component="bottombar"]');
			let stickyTools = null;
			const location = config.theme.topMobilebar ? 'top' : 'bottom';
			const $body = $('body');
			const $window = $(window);
			$body.on('shown.bs.dropdown hidden.bs.dropdown', '.sticky-tools', function () {
				bottomBar.toggleClass('hidden', $(this).find('.dropdown-menu.show').length);
			});
			function isSearchVisible() {
				return !!$('[component="bottombar"] [component="sidebar/search"] .search-dropdown.show').length;
			}

			let lastScrollTop = $window.scrollTop();
			let newPostsLoaded = false;

			function onWindowScroll() {
				const st = $window.scrollTop();
				if (newPostsLoaded) {
					newPostsLoaded = false;
					lastScrollTop = st;
					return;
				}
				if (st !== lastScrollTop && !navigator.scrollActive && !isSearchVisible()) {
					const diff = Math.abs(st - lastScrollTop);
					const scrolledDown = st > lastScrollTop;
					const scrolledUp = st < lastScrollTop;
					const isHiding = !scrolledUp && scrolledDown;
					if (diff > 10) {
						bottomBar.css({
							[location]: isHiding ?
								-bottomBar.find('.bottombar-nav').outerHeight(true) :
								0,
						});
						if (stickyTools && config.theme.topMobilebar && config.theme.autohideBottombar) {
							stickyTools.css({
								top: isHiding ? 0 : 'var(--panel-offset)',
							});
						}
					}
				}
				lastScrollTop = st;
			}

			const delayedScroll = utils.throttle(onWindowScroll, 250);
			function enableAutohide() {
				$window.off('scroll', delayedScroll);
				if (config.theme.autohideBottombar) {
					lastScrollTop = $window.scrollTop();
					$window.on('scroll', delayedScroll);
				}
			}

			hooks.on('action:posts.loading', function () {
				$window.off('scroll', delayedScroll);
			});
			hooks.on('action:posts.loaded', function () {
				newPostsLoaded = true;
				setTimeout(enableAutohide, 250);
			});
			hooks.on('action:ajaxify.end', function () {
				bottomBar.removeClass('hidden');
				const { template } = ajaxify.data;
				stickyTools = (template.category || template.topic) ? $('.sticky-tools') : null;
				$window.off('scroll', delayedScroll);
				if (config.theme.autohideBottombar) {
					bottomBar.css({ [location]: 0 });
					setTimeout(enableAutohide, 250);
				}
			});
		});
	}

	function setupSearch() {
		$('[component="sidebar/search"]').on('shown.bs.dropdown', function () {
			$(this).find('[component="search/fields"] input[name="query"]').trigger('focus');
		});
	}

	function setupDrafts() {
		require(['composer/drafts', 'bootbox'], function (drafts, bootbox) {
			const draftsEl = $('[component="sidebar/drafts"]');

			function updateBadgeCount() {
				const count = drafts.getAvailableCount();
				if (count > 0) {
					draftsEl.removeClass('hidden');
				}
				$('[component="drafts/count"]').toggleClass('hidden', count <= 0).text(count);
			}

			async function renderDraftList() {
				const draftListEl = $('[component="drafts/list"]');
				const draftItems = drafts.listAvailable();
				if (!draftItems.length) {
					draftListEl.find('.no-drafts').removeClass('hidden');
					draftListEl.find('.placeholder-wave').addClass('hidden');
					draftListEl.find('.draft-item-container').html('');
					return;
				}
				draftItems.reverse().forEach((draft) => {
					if (draft) {
						if (draft.title) {
							draft.title = utils.escapeHTML(String(draft.title));
						}
						draft.text = utils.escapeHTML(
							draft.text
						).replace(/(?:\r\n|\r|\n)/g, '<br>');
					}
				});

				const html = await app.parseAndTranslate('partials/sidebar/drafts', 'drafts', { drafts: draftItems });
				draftListEl.find('.no-drafts').addClass('hidden');
				draftListEl.find('.placeholder-wave').addClass('hidden');
				draftListEl.find('.draft-item-container').html(html).find('.timeago').timeago();
			}


			draftsEl.on('shown.bs.dropdown', renderDraftList);

			draftsEl.on('click', '[component="drafts/open"]', function () {
				drafts.open($(this).attr('data-save-id'));
			});

			draftsEl.on('click', '[component="drafts/delete"]', function () {
				const save_id = $(this).attr('data-save-id');
				bootbox.confirm('[[modules:composer.discard-draft-confirm]]', function (ok) {
					if (ok) {
						drafts.removeDraft(save_id);
						renderDraftList();
					}
				});
				return false;
			});

			$(window).on('action:composer.drafts.save', updateBadgeCount);
			$(window).on('action:composer.drafts.remove', updateBadgeCount);
			updateBadgeCount();
		});
	}

	function setupNProgress() {
		require(['nprogress'], function (NProgress) {
			window.nprogress = NProgress;
			if (NProgress) {
				let progressTimeout = null;
				let contentCheckInterval = null;
				let domObserver = null;
				let lastContentHash = null;
				let isFirstPagination = true;
				
				function clearProgress() {
					if (progressTimeout) {
						clearTimeout(progressTimeout);
						progressTimeout = null;
					}
					if (contentCheckInterval) {
						clearInterval(contentCheckInterval);
						contentCheckInterval = null;
					}
					if (domObserver) {
						domObserver.disconnect();
						domObserver = null;
					}
					NProgress.done(true);
				}
				
				function getContentHash() {
					const content = document.getElementById('content');
					if (!content) return null;
					// Create a simple hash of visible content
					const text = content.innerText || content.textContent || '';
					const children = content.children.length;
					return text.length + '-' + children;
				}
				
				function checkContentLoaded() {
					const currentHash = getContentHash();
					// If content has changed and is not empty, consider it loaded
					if (currentHash && currentHash !== lastContentHash && currentHash !== '0-0') {
						lastContentHash = currentHash;
						// Content has loaded, clear progress
						clearProgress();
						if (isFirstPagination) {
							isFirstPagination = false;
						}
						return true;
					}
					return false;
				}
				
				$(window).on('action:ajaxify.start', function () {
					// Reset state
					lastContentHash = getContentHash();
					
					// Clear any existing timeouts/observers
					clearProgress();
					
					NProgress.set(0.7);
					
					// Start checking for content changes immediately
					let checkCount = 0;
					contentCheckInterval = setInterval(function () {
						checkCount++;
						if (checkContentLoaded()) {
							return; // Content loaded, interval will be cleared
						}
						// Stop checking after 3 seconds (60 checks at 50ms intervals)
						if (checkCount > 60) {
							clearInterval(contentCheckInterval);
							contentCheckInterval = null;
						}
					}, 50); // Check every 50ms
					
					// Also use MutationObserver for more efficient detection
					if (window.MutationObserver) {
						const contentEl = document.getElementById('content');
						if (contentEl) {
							domObserver = new MutationObserver(function (mutations) {
								// If we see significant mutations, check if content is loaded
								if (mutations.length > 0) {
									setTimeout(function () {
										checkContentLoaded();
									}, 100);
								}
							});
							
							domObserver.observe(contentEl, {
								childList: true,
								subtree: true
							});
						}
					}
					
					// Fallback timeout - more aggressive for first pagination
					const timeoutDuration = isFirstPagination ? 1000 : 2500;
					progressTimeout = setTimeout(function () {
						console.warn('NProgress: Force clearing progress bar (timeout)', { 
							isFirstPagination, 
							contentHash: getContentHash() 
						});
						clearProgress();
						isFirstPagination = false;
					}, timeoutDuration);
				});

				$(window).on('action:ajaxify.end', function () {
					clearProgress();
					isFirstPagination = false;
				});
				
				// Clear when content is loaded (fires before scripts finish)
				$(window).on('action:ajaxify.contentLoaded', function () {
					// Update content hash
					lastContentHash = getContentHash();
					
					// Clear progress with a small delay to ensure DOM is ready
					setTimeout(function () {
						clearProgress();
						if (isFirstPagination) {
							isFirstPagination = false;
						}
					}, 150);
				});
			}
		});
	}

	function handleMobileNavigator() {
		const paginationBlockEl = $('.pagination-block');
		require(['hooks'], function (hooks) {
			hooks.on('action:ajaxify.end', function () {
				paginationBlockEl.find('.dropdown-menu.show').removeClass('show');
			});
			hooks.on('filter:navigator.scroll', function (hookData) {
				paginationBlockEl.find('.dropdown-menu.show').removeClass('show');
				return hookData;
			});
		});
	}

	function setupNavTooltips() {
		// remove title from user icon in sidebar to prevent double tooltip
		$('.sidebar [component="header/avatar"] .avatar').removeAttr('title');
		const tooltipEls = $('.sidebar [title]');
		const lefttooltipEls = $('.sidebar-left [title]');
		const rightooltipEls = $('.sidebar-right [title]');
		const isRtl = $('html').attr('data-dir') === 'rtl';
		lefttooltipEls.tooltip({
			trigger: 'manual',
			animation: false,
			placement: isRtl ? 'left' : 'right',
		});
		rightooltipEls.tooltip({
			trigger: 'manual',
			animation: false,
			placement: isRtl ? 'right' : 'left',
		});

		tooltipEls.on('mouseenter', function (ev) {
			const target = $(ev.target);
			const isDropdown = target.hasClass('dropdown-menu') || !!target.parents('.dropdown-menu').length;
			if (!$('.sidebar').hasClass('open') && !isDropdown) {
				$(this).tooltip('show');
			}
		});
		tooltipEls.on('click mouseleave', function () {
			$(this).tooltip('hide');
		});
	}

	function fixPlaceholders() {
		if (!config.loggedIn) {
			return;
		}
		['notifications', 'chat'].forEach((type) => {
			const countEl = $(`nav.sidebar [component="${type}/count"]`).first();
			if (!countEl.length) {
				return;
			}
			const count = parseInt(countEl.text(), 10);
			if (count > 1) {
				const listEls = $(`.dropdown-menu [component="${type}/list"]`);
				listEls.each((index, el) => {
					const placeholder = $(el).children().first();
					for (let x = 0; x < count - 1; x++) {
						const cloneEl = placeholder.clone(true);
						cloneEl.insertAfter(placeholder);
					}
				});
			}
		});
	}

	function fixSidebarOverflow() {
		// overflow-y-auto needs to be removed on main-nav when dropdowns are opened
		const mainNavEl = $('#main-nav');
		function toggleOverflow() {
			mainNavEl.toggleClass(
				'overflow-y-auto',
				!mainNavEl.find('.dropdown-menu.show').length
			);
		}
		mainNavEl.on('shown.bs.dropdown', toggleOverflow)
			.on('hidden.bs.dropdown', toggleOverflow);
	}

	function disableSystemAlerts() {
		require(['alerts', 'hooks'], function (alerts, hooks) {
			// Remove any alerts that may already be visible
			if (alerts && alerts.list && typeof alerts.list === 'object') {
				Object.keys(alerts.list).forEach(function (alertId) {
					alerts.remove(alertId);
				});
			}

			// Prevent future alerts from rendering
			hooks.on('action:alerts.push', function (data) {
				if (data && data.alert_id) {
					alerts.remove(data.alert_id);
				}

				// Returning false stops NodeBB from rendering the alert
				return false;
			});
		});
	}
	
	// Direct handler for pagination clicks to ensure progress bar clears
	function setupPaginationProgressHandler() {
		require(['nprogress'], function (NProgress) {
			if (NProgress && window.nprogress) {
				// Intercept pagination link clicks
				$(document).on('click', '.pagination .page-link:not(.disabled)', function (e) {
					// Set a safety timeout to clear progress if it gets stuck
					setTimeout(function () {
						if (NProgress && NProgress.status !== null && NProgress.status < 1) {
							console.warn('NProgress: Force clearing on pagination click timeout');
							NProgress.done(true);
						}
					}, 2000);
				});
			}
		});
	}

	// Initialize Bootstrap dropdowns for topic and category sort
	function initializeTopicSortDropdown() {
		require(['bootstrap'], function (bootstrap) {
			// Initialize dropdown when page loads
			const initDropdown = function () {
				// Initialize all sort dropdowns (both topic and category)
				const dropdownElements = document.querySelectorAll('[component="thread/sort"] .dropdown-toggle, [component="thread/sort"] button[data-bs-toggle="dropdown"]');
				dropdownElements.forEach(function (dropdownElement) {
					if (dropdownElement) {
						// Check if already initialized
						if (!bootstrap.Dropdown.getInstance(dropdownElement)) {
							// Initialize Bootstrap dropdown
							try {
								new bootstrap.Dropdown(dropdownElement);
								console.log('Initialized sort dropdown:', dropdownElement);
							} catch (e) {
								console.error('Error initializing dropdown:', e);
							}
						}
					}
				});
			};

			// Initialize on page load
			initDropdown();

			// Re-initialize after ajaxify (page navigation)
			$(window).on('action:ajaxify.end', function () {
				setTimeout(initDropdown, 100); // Small delay to ensure DOM is ready
			});
			
			// Also initialize on category page load
			hooks.on('action:category.loaded', function () {
				setTimeout(initDropdown, 100);
			});
		});
	}

	function setupNewPostModal() {
		console.log('setupNewPostModal function called');
		require(['jquery', 'bootstrap', 'api', 'ajaxify'], function ($, bootstrap, api, ajaxify) {
			const modal = $('#speek-new-post-modal');
			if (!modal.length) {
				console.log('Modal element not found: #speek-new-post-modal');
				return;
			}

			var activeCategoryId = null;

			function normalizeCategoryId(value) {
				if (value === undefined || value === null || value === '') {
					return null;
				}
				var parsed = parseInt(value, 10);
				return isNaN(parsed) ? null : parsed;
			}

			function deriveActiveCategoryId() {
				try {
					if (window.ajaxify && window.ajaxify.data) {
						var data = window.ajaxify.data;
						var candidates = [
							data.cid,
							data.parentCid,
							data.category && data.category.cid,
							data.categories && data.categories.cid,
							data.topic && data.topic.cid,
							Array.isArray(data.categories) && data.categories.length ? data.categories[0].cid : null,
							Array.isArray(data.parents) && data.parents.length ? data.parents[0].cid : null,
						];

						for (var i = 0; i < candidates.length; i++) {
							var normalized = normalizeCategoryId(candidates[i]);
							if (normalized !== null) {
								return normalized;
							}
						}
					}
				} catch (err) {
					console.warn('Unable to derive active category id', err);
				}

				var activeLink = $('[data-cid].category.active').attr('data-cid');
				return normalizeCategoryId(activeLink);
			}

			function refreshActiveCategoryId(explicitCid) {
				var normalized = normalizeCategoryId(explicitCid);
				if (normalized === null) {
					normalized = deriveActiveCategoryId();
				}
				if (normalized !== null) {
					activeCategoryId = normalized;
				}
			}

			refreshActiveCategoryId();
			$(window).on('action:ajaxify.end', function () {
				setTimeout(function () {
					refreshActiveCategoryId();
				}, 0);
			});

			const POST_SUCCESS_REDIRECT_DELAY = 1500;
			let postSuccessRedirectTimeout = null;

			// Hide composer interface on page load if we're using modal approach
			// Only hide if we're not replying to a topic (tid parameter)
			const urlParams = new URLSearchParams(window.location.search);
			const isReply = urlParams.has('tid');
			const isComposePage = window.location.pathname.includes('/compose') && !isReply;
			
			// Always hide composer on compose page (we use modal instead)
			if (isComposePage) {
				$('body').addClass('speek-composer-hidden');
				$('.composer, [component="composer"], .composer-container, .composer-wrapper, .composer-resizer, .composer-toolbar, .composer-content').hide();
			}

			// Watch for composer elements being added to DOM and hide them immediately
			const composerObserver = new MutationObserver(function (mutations) {
				mutations.forEach(function (mutation) {
					mutation.addedNodes.forEach(function (node) {
						if (node.nodeType === 1) { // Element node
							const $node = $(node);
							if ($node.hasClass('composer') || $node.find('.composer, [component="composer"]').length) {
								$node.find('.composer, [component="composer"], .composer-container, .composer-wrapper').hide();
								$node.filter('.composer, [component="composer"]').hide();
							}
						}
					});
				});
			});

			// Start observing the document body for changes
			composerObserver.observe(document.body, {
				childList: true,
				subtree: true
			});

			const form = $('#speek-new-post-form');
			const textarea = $('#speek-new-post-content');
			let isSubmittingNewPost = false;
			const charCurrent = $('#speek-char-current');
			const charMax = $('#speek-char-max');
			const maxLength = parseInt(textarea.attr('maxlength'), 10) || 1000;

			// Load categories for the dropdown
			function loadCategories() {
				return new Promise(function (resolve, reject) {
					api.get('/api/categories', {}, function (err, data) {
						if (err) {
							console.error('Error loading categories:', err);
							reject(err);
							return;
						}
						resolve(data);
					});
				});
			}

			// Populate category dropdown
			function populateCategories(categories, selectedCategoryId) {
				const select = $('#speek-new-post-space');
				select.empty();
				
				function addCategories(cats, level) {
					level = level || '';
					cats.forEach(function (category) {
						if (category && !category.disabled) {
							const option = $('<option></option>')
								.attr('value', category.cid)
								.text(level + category.name);
							select.append(option);
							
							if (category.children && category.children.length > 0) {
								addCategories(category.children, level + '  ');
							}
						}
					});
				}
				
				addCategories(categories);

				function trySelectCategory(cid) {
					const normalized = normalizeCategoryId(cid);
					if (normalized === null) {
						return false;
					}
					const cidString = normalized.toString();
					const option = select.find('option[value="' + cidString + '"]');
					if (option.length) {
						select.val(cidString);
						$('#speek-new-post-cid').val(cidString);
						activeCategoryId = normalized;
						return true;
					}
					return false;
				}

				if (!trySelectCategory(selectedCategoryId)) {
					if (!trySelectCategory(activeCategoryId)) {
						const firstOption = select.find('option:first');
						if (firstOption.length && firstOption.val()) {
							trySelectCategory(firstOption.val());
						} else {
							$('#speek-new-post-cid').val('');
						}
					}
				}
			}

			// Expose open function globally first
			window.speekNewPostModal = {
				open: function (categoryId) {
					const modalElement = document.getElementById('speek-new-post-modal');
					if (modalElement) {
						const bsModal = new bootstrap.Modal(modalElement);
						let resolvedCategoryId = normalizeCategoryId(categoryId);
						if (resolvedCategoryId === null) {
							refreshActiveCategoryId();
						} else {
							activeCategoryId = resolvedCategoryId;
						}
						
						// Load categories first
						loadCategories().then(function (data) {
							if (data && data.categories) {
								populateCategories(data.categories, resolvedCategoryId);
							}
						}).catch(function (err) {
							console.error('Failed to load categories:', err);
						});
						
						bsModal.show();
					}
				}
			};

			// Intercept compose links and open modal instead
			$(document).on('click', 'a[href*="/compose"]', function (e) {
				// Only intercept if it's not a reply (tid parameter)
				const href = $(this).attr('href') || '';
				if (href.includes('tid=')) {
					return; // Let reply links work normally
				}

				e.preventDefault();
				e.stopPropagation();

				// Get category ID from href
				let categoryId = null;
				const cidMatch = href.match(/[?&]cid=(\d+)/);
				if (cidMatch) {
					categoryId = parseInt(cidMatch[1], 10);
				}

				window.speekNewPostModal.open(categoryId);
			});

			// Handle buttons with speek-open-new-post-modal class
			$(document).on('click', '.speek-open-new-post-modal', function (e) {
				e.preventDefault();
				e.stopPropagation();
				window.parent.postMessage({
					type: 'nodebb-modal',
					action: 'open'
				   }, '*');

				const categoryId = $(this).attr('data-cid') ? parseInt($(this).attr('data-cid'), 10) : null;
				window.speekNewPostModal.open(categoryId);
			});

			// Update character count
			function updateCharCount() {
				const current = textarea.val().length;
				charCurrent.text(current);
			}

			// Initialize character count
			updateCharCount();
			charMax.text(maxLength);

			// Update on input
			textarea.on('input', updateCharCount);

			// Formatting toolbar functionality
			function insertTextAtCursor(text, cursorOffset = 0) {
				const textareaEl = textarea[0];
				const start = textareaEl.selectionStart;
				const end = textareaEl.selectionEnd;
				const currentValue = textarea.val();
				const selectedText = currentValue.substring(start, end);
				
				const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
				textarea.val(newValue);
				
				// Set cursor position after inserted text
				const newCursorPos = start + text.length + cursorOffset;
				textareaEl.setSelectionRange(newCursorPos, newCursorPos);
				textareaEl.focus();
				
				// Trigger input event to update character count
				textarea.trigger('input');
			}

			function getSelectedText() {
				const textareaEl = textarea[0];
				const start = textareaEl.selectionStart;
				const end = textareaEl.selectionEnd;
				return {
					text: textarea.val().substring(start, end),
					start: start,
					end: end
				};
			}

			// Formatting functions
			const formattingFunctions = {
				bold: function() {
					const selection = getSelectedText();
					if (selection.text) {
						insertTextAtCursor(`**${selection.text}**`);
					} else {
						insertTextAtCursor('****', -2);
					}
				},
				italic: function() {
					const selection = getSelectedText();
					if (selection.text) {
						insertTextAtCursor(`*${selection.text}*`);
					} else {
						insertTextAtCursor('**', -1);
					}
				},
				heading: function() {
					const selection = getSelectedText();
					if (selection.text) {
						insertTextAtCursor(`## ${selection.text}`);
					} else {
						insertTextAtCursor('## ');
					}
				},
				strikethrough: function() {
					const selection = getSelectedText();
					if (selection.text) {
						insertTextAtCursor(`~~${selection.text}~~`);
					} else {
						insertTextAtCursor('~~~~', -2);
					}
				},
				list: function() {
					const selection = getSelectedText();
					if (selection.text) {
						const lines = selection.text.split('\n');
						const listItems = lines.map(line => line.trim() ? `- ${line.trim()}` : '').join('\n');
						insertTextAtCursor(listItems);
					} else {
						insertTextAtCursor('- ');
					}
				},
				code: function() {
					const selection = getSelectedText();
					if (selection.text) {
						insertTextAtCursor('`' + selection.text + '`');
					} else {
						insertTextAtCursor('``', -1);
					}
				},
				link: function() {
					const selection = getSelectedText();
					if (selection.text) {
						insertTextAtCursor(`[${selection.text}](url)`, -6);
						const textareaEl = textarea[0];
						setTimeout(() => {
							const urlStart = textareaEl.selectionStart - 3;
							textareaEl.setSelectionRange(urlStart, urlStart + 3);
						}, 0);
					} else {
						insertTextAtCursor('[text](url)', -9);
						const textareaEl = textarea[0];
						setTimeout(() => {
							const textStart = textareaEl.selectionStart - 4;
							textareaEl.setSelectionRange(textStart, textStart + 4);
						}, 0);
					}
				},
				image: function() {
					const selection = getSelectedText();
					if (selection.text) {
						insertTextAtCursor(`![${selection.text}](url)`, -6);
						const textareaEl = textarea[0];
						setTimeout(() => {
							const urlStart = textareaEl.selectionStart - 3;
							textareaEl.setSelectionRange(urlStart, urlStart + 3);
						}, 0);
					} else {
						insertTextAtCursor('![alt text](url)', -14);
						const textareaEl = textarea[0];
						setTimeout(() => {
							const altStart = textareaEl.selectionStart - 8;
							textareaEl.setSelectionRange(altStart, altStart + 8);
						}, 0);
					}
				},
				emoji: function() {
					insertTextAtCursor(':smile:');
					const textareaEl = textarea[0];
					setTimeout(() => {
						textareaEl.setSelectionRange(textareaEl.selectionStart - 7, textareaEl.selectionStart);
					}, 0);
				},
				more: function() {
					const selection = getSelectedText();
					if (selection.text) {
						insertTextAtCursor('```\n' + selection.text + '\n```', -3);
					} else {
						insertTextAtCursor('```\n\n```', -3);
					}
				}
			};

			// Attach event listeners to formatting buttons
			$(document).on('click', '.speek-format-btn', function(e) {
				e.preventDefault();
				const formatType = $(this).attr('data-format');
				if (formatType && formattingFunctions[formatType]) {
					formattingFunctions[formatType]();
				}
			});

			// Hide composer interface when modal is shown
			modal.on('show.bs.modal', function () {
				// Hide composer interface
				$('.composer, [component="composer"], .composer-container, .composer-wrapper').hide();
				$('body').addClass('speek-modal-open speek-new-post-modal-open');
				
				loadCategories().then(function (data) {
					if (data && data.categories) {
						populateCategories(data.categories, activeCategoryId);
					}
				}).catch(function (err) {
					console.error('Failed to load categories:', err);
				});
			});

			// Handle modal hidden - keep composer hidden permanently
			modal.on('hidden.bs.modal', function () {
				console.log("hidden.bs.modal event fired (jQuery)");
				
				// Send postMessage to parent window when modal closes
				try {
					console.log("Attempting to send postMessage to parent window");
					// Always try to send postMessage, even if parent is same window (for debugging)
					window.parent.postMessage({
						type: 'nodebb-modal',
						action: 'close'
					}, '*');
					console.log("postMessage sent successfully to parent window");
				} catch (e) {
					console.error("Error sending postMessage:", e);
					// Try alternative method if postMessage fails
					try {
						if (window.opener) {
							window.opener.postMessage({
								type: 'nodebb-modal',
								action: 'close'
							}, '*');
							console.log("postMessage sent via window.opener");
						}
					} catch (e2) {
						console.error("Error sending postMessage via opener:", e2);
					}
				}
				
				$('body').removeClass('speek-modal-open speek-new-post-modal-open');
				
				// Remove backdrop if it exists
				$('.modal-backdrop').remove();
				$('body').removeClass('modal-open');
				
				// Permanently hide composer interface after modal has been used
				$('body').addClass('speek-composer-hidden');
				$('.composer, [component="composer"], .composer-container, .composer-wrapper, .composer-resizer, .composer-toolbar, .composer-content, .composer-title, .composer-category, .composer-tags, .composer-thumb, .composer-formatting, .composer-help').hide();
				
				// Continuously check and hide composer (in case it gets re-rendered)
				const hideComposerInterval = setInterval(function () {
					$('.composer, [component="composer"], .composer-container, .composer-wrapper, .composer-resizer, .composer-toolbar, .composer-content').hide();
				}, 100);
				
				// Clear interval after 5 seconds (composer shouldn't appear after that)
				setTimeout(function () {
					clearInterval(hideComposerInterval);
				}, 5000);
				
				// If we're on the compose page, redirect away to prevent showing the old interface
				const isComposePage = window.location.pathname.includes('/compose') && !window.location.search.includes('tid=');
				if (isComposePage) {
					// Redirect to home page or previous page
					if (document.referrer && document.referrer !== window.location.href) {
						window.location.href = document.referrer;
					} else {
						window.location.href = config.relative_path || '/';
					}
				}
				
				// Reset form
				form[0].reset();
				updateCharCount();
				$('#speek-new-post-space').empty();
				// Clear all errors
				hideError('speek-new-post-space', 'speek-error-space');
				hideError('speek-new-post-title', 'speek-error-title');
				hideError('speek-new-post-content', 'speek-error-content');
			});

			// Validation functions
			function showError(fieldId, errorMessageId, message) {
				const field = $('#' + fieldId);
				const errorEl = $('#' + errorMessageId);
				
				// Add error class to field
				if (fieldId === 'speek-new-post-space') {
					field.addClass('speek-error');
				} else if (fieldId === 'speek-new-post-title') {
					field.addClass('speek-error');
				} else if (fieldId === 'speek-new-post-content') {
					field.closest('.speek-textarea-wrapper').addClass('speek-error');
				}
				
				// Show error message
				if (errorEl.length) {
					errorEl.text(message).addClass('show');
				}
			}

			function hideError(fieldId, errorMessageId) {
				const field = $('#' + fieldId);
				const errorEl = $('#' + errorMessageId);
				
				// Remove error class from field
				if (fieldId === 'speek-new-post-space') {
					field.removeClass('speek-error');
				} else if (fieldId === 'speek-new-post-title') {
					field.removeClass('speek-error');
				} else if (fieldId === 'speek-new-post-content') {
					field.closest('.speek-textarea-wrapper').removeClass('speek-error');
				}
				
				// Hide error message
				if (errorEl.length) {
					errorEl.removeClass('show').text('');
				}
			}

			function validateSpace() {
				const spaceValue = $('#speek-new-post-space').val();
				if (!spaceValue || spaceValue === '') {
					showError('speek-new-post-space', 'speek-error-space', 'Please select a space');
					return false;
				}
				hideError('speek-new-post-space', 'speek-error-space');
				return true;
			}

			function validateTitle() {
				const titleValue = $('#speek-new-post-title').val().trim();
				if (!titleValue) {
					showError('speek-new-post-title', 'speek-error-title', 'Post title is required');
					return false;
				}
				if (titleValue.length < 3) {
					showError('speek-new-post-title', 'speek-error-title', 'Post title must be at least 3 characters');
					return false;
				}
				hideError('speek-new-post-title', 'speek-error-title');
				return true;
			}

			function validateContent() {
				const contentValue = textarea.val().trim();
				if (!contentValue) {
					showError('speek-new-post-content', 'speek-error-content', 'Post content is required');
					return false;
				}
				if (contentValue.length < 10) {
					showError('speek-new-post-content', 'speek-error-content', 'Post content must be at least 10 characters');
					return false;
				}
				hideError('speek-new-post-content', 'speek-error-content');
				return true;
			}

			function validateForm() {
				let isValid = true;
				isValid = validateSpace() && isValid;
				isValid = validateTitle() && isValid;
				isValid = validateContent() && isValid;
				return isValid;
			}

			// Clear errors when user starts typing/selecting (but don't validate)
			$('#speek-new-post-space').on('change', function() {
				hideError('speek-new-post-space', 'speek-error-space');
			});

			$('#speek-new-post-title').on('input', function() {
				hideError('speek-new-post-title', 'speek-error-title');
			});

			textarea.on('input', function() {
				hideError('speek-new-post-content', 'speek-error-content');
			});

			// Handle form submission
			form.on('submit', function (e) {
				e.preventDefault();

				// Prevent duplicate submissions
				if (isSubmittingNewPost) {
					return;
				}

				// Validate all fields
				if (!validateForm()) {
					// Focus on first invalid field
					if (!$('#speek-new-post-space').val()) {
						$('#speek-new-post-space').focus();
					} else if (!$('#speek-new-post-title').val().trim()) {
						$('#speek-new-post-title').focus();
					} else if (!textarea.val().trim()) {
						textarea.focus();
					}
					return;
				}

				const formData = {
					cid: parseInt($('#speek-new-post-cid').val() || $('#speek-new-post-space').val(), 10),
					title: $('#speek-new-post-title').val().trim(),
					content: textarea.val().trim(),
					_csrf: $('input[name="_csrf"]').val()
				};

				// Mark as submitting and disable submit button
				isSubmittingNewPost = true;
				const submitButton = $('.speek-new-post-modal-footer button[type="submit"]');
				if (submitButton.length) {
					submitButton.prop('disabled', true).addClass('disabled');
				}

				// Submit via AJAX
				$.ajax({
					url: form.attr('action'),
					method: 'POST',
					headers: {
						'X-Requested-With': 'XMLHttpRequest',
						'Accept': 'application/json'
					},
					data: formData,
					success: function (response) {
						// Reset submitting state (modal will close shortly)
						isSubmittingNewPost = false;
						// Close modal
						const bsModal = bootstrap.Modal.getInstance(modal[0]);
						if (bsModal) {
							bsModal.hide();
							// postMessage will be sent by the hidden.bs.modal event handler
						}

						// Reset form
						form[0].reset();
						updateCharCount();
						// Clear all errors
						hideError('speek-new-post-space', 'speek-error-space');
						hideError('speek-new-post-title', 'speek-error-title');
						hideError('speek-new-post-content', 'speek-error-content');

						const redirectTarget = response && response.redirect ? response.redirect : null;

						try {
							window.parent.postMessage({
								type: 'nodebb-post-created',
								redirect: redirectTarget || null
							}, '*');
						} catch (err) {
							console.error('Failed to notify parent window about post creation:', err);
						}

						if (postSuccessRedirectTimeout) {
							clearTimeout(postSuccessRedirectTimeout);
						}

						postSuccessRedirectTimeout = setTimeout(() => {
							if (redirectTarget) {
								window.location.href = redirectTarget;
							} else {
								window.location.reload();
							}
						}, POST_SUCCESS_REDIRECT_DELAY);
					},
					error: function (xhr) {
						// Re-enable submit button on error so user can try again
						isSubmittingNewPost = false;
						if (submitButton.length) {
							submitButton.prop('disabled', false).removeClass('disabled');
						}
						console.error('Error submitting post:', xhr);
						
						let errorMessage = 'Error submitting post. Please try again.';
						
						// Try to extract error message from JSON response
						if (xhr.responseJSON) {
							// Handle NodeBB error format
							if (xhr.responseJSON.status && xhr.responseJSON.status.message) {
								errorMessage = xhr.responseJSON.status.message;
							}
							
							// Handle errors object format
							if (xhr.responseJSON.errors) {
								const errors = xhr.responseJSON.errors;
								
								if (errors.cid || errors.space) {
									showError('speek-new-post-space', 'speek-error-space', errors.cid || errors.space || 'Please select a valid space');
									return;
								}
								
								if (errors.title) {
									showError('speek-new-post-title', 'speek-error-title', errors.title);
									return;
								}
								
								if (errors.content) {
									errorMessage = errors.content;
								}
							}
						} else if (xhr.responseText) {
							// Try to extract error message from HTML response
							// Look for error message in HTML (NodeBB error pages contain error in a data attribute or specific element)
							const errorMatch = xhr.responseText.match(/<div[^>]*class="[^"]*error[^"]*"[^>]*>(.*?)<\/div>/i) ||
												xhr.responseText.match(/error["\s]*[:=]["\s]*([^<"]+)/i);
							if (errorMatch && errorMatch[1]) {
								errorMessage = errorMatch[1].trim();
							}
						}
						
						// Show error message
						showError('speek-new-post-content', 'speek-error-content', errorMessage);
					}
				});
			});

			// Handle space/category selection
			$('#speek-new-post-space').on('change', function () {
				const selectedValue = $(this).val();
				$('#speek-new-post-cid').val(selectedValue);
				const normalized = normalizeCategoryId(selectedValue);
				if (normalized !== null) {
					activeCategoryId = normalized;
				}
			});

			// Function to send postMessage when modal closes
			function sendModalCloseMessage(source) {
				console.log("Sending modal close message from:", source);
				try {
					window.parent.postMessage({
						type: 'nodebb-modal',
						action: 'close'
					}, '*');
					console.log("postMessage sent successfully from:", source);
				} catch (e) {
					console.error("Error sending postMessage from " + source + ":", e);
					// Try alternative method if postMessage fails
					try {
						if (window.opener) {
							window.opener.postMessage({
								type: 'nodebb-modal',
								action: 'close'
							}, '*');
							console.log("postMessage sent via window.opener from:", source);
						}
					} catch (e2) {
						console.error("Error sending postMessage via opener from " + source + ":", e2);
					}
				}
			}

			// Direct handlers for close buttons - intercept BEFORE Bootstrap handles it
			$(document).on('click', '#speek-new-post-modal .btn-close', function(e) {
				console.log("Close button (X) clicked - BEFORE Bootstrap", e);
				setTimeout(function() {
					console.log("Close button - AFTER timeout");
					sendModalCloseMessage('close button (X)');
				}, 100);
			});

			$(document).on('click', '#speek-new-post-modal [data-bs-dismiss="modal"]', function(e) {
				console.log("Discard button clicked - BEFORE Bootstrap", e);
				setTimeout(function() {
					console.log("Discard button - AFTER timeout");
					sendModalCloseMessage('discard button');
				}, 100);
			});

			// Also listen for backdrop clicks directly
			$(document).on('click', '.modal-backdrop', function(e) {
				console.log("Backdrop clicked directly", e);
				setTimeout(function() {
					sendModalCloseMessage('backdrop click');
				}, 100);
			});

			// Also listen for ESC key
			$(document).on('keydown', function(e) {
				if (e.key === 'Escape' && modal.hasClass('show')) {
					console.log("ESC key pressed while modal is open");
				}
			});

			// Also try native event listeners as backup
			const modalElement = document.getElementById('speek-new-post-modal');
			if (modalElement) {
				console.log('Attaching native event listeners to modal element');
				modalElement.addEventListener('hide.bs.modal', function() {
					console.log("hide.bs.modal event fired (native)");
				});
				modalElement.addEventListener('hidden.bs.modal', function() {
					console.log("hidden.bs.modal event fired (native)");
					sendModalCloseMessage('hidden.bs.modal event (native)');
				});
			} else {
				console.log('Modal element not found for native event listeners');
			}

		});
	}

	// =====================================
	// Topic/Post Mount Handler
	// =====================================
	/**
	 * Function that triggers when a topic/post page mounts/loads
	 * Similar to Category.init, this runs when a user clicks on a post and navigates to it
	 * @param {Object} data - Hook data containing topic information (ajaxify.data)
	 * @param {number} data.tid - Topic ID
	 * @param {number} data.cid - Category ID
	 * @param {string} data.title - Topic title
	 * @param {string} data.slug - Topic slug
	 */
	function onTopicMount(data) {
		// console.log('[Topic Mount] Topic page loaded, TID:', data.tid, 'CID:', data.cid);
		
		// Add your custom logic here that should run when topic/post page mounts
		// Example:
		// - Send analytics events (similar to view_space in Category.init)
		// - Initialize custom components
		// - Update UI elements
		// - Send postMessage to parent window
		
		// Example: Send postMessage to parent window (similar to view_space)
		try {
			window.parent.postMessage({
				type: 'posthog_analytics',
				action: 'view_post'
			}, '*');
		} catch (e) {
			console.log('Could not send analytics view-post:', e);
		}
		
		// Fix empty space issue on first load by recalculating iframe height
		// Run multiple times to catch different load stages
		function fixEmptySpace() {
			// Remove any unwanted bottom spacing
			$('.posts-container, .posts.timeline, .d-flex.flex-column.gap-3, .row.mb-4, body.template-topic').css({
				'padding-bottom': '0',
				'margin-bottom': '0',
				'min-height': 'auto',
				'height': 'auto'
			});
			
			// Force iframe height recalculation if in iframe
			if (window.self !== window.top && typeof window.parent.postMessage === 'function') {
				// Trigger height recalculation by dispatching a resize event
				window.dispatchEvent(new Event('resize'));
				
				// Also try to call forceSendHeight if available
				if (typeof window.forceSendHeight === 'function') {
					window.forceSendHeight();
				}
			}
		}
		
		// Run immediately
		fixEmptySpace();
		
		// Run after short delay
		setTimeout(fixEmptySpace, 100);
		
		// Run after longer delay to catch late-loading content
		setTimeout(fixEmptySpace, 500);
		setTimeout(fixEmptySpace, 1000);
		setTimeout(fixEmptySpace, 1500);
		
		// Also fix after images load
		$(window).on('load', function() {
			setTimeout(fixEmptySpace, 200);
			setTimeout(fixEmptySpace, 500);
		});
	}

	// =====================================
	// Inline Post Edit Functionality
	// =====================================
	setupInlinePostEdit();
	
		function setupInlinePostEdit() {
		require(['api', 'hooks', 'alerts', 'translator'], function (api, hooks, alerts, translator) {
			
			// Intercept the edit button click before it triggers the composer
			$(document).on('click', '[component="post/edit"]', function (e) {
				e.preventDefault();
				e.stopPropagation();
				
				const btn = $(this);
				const postEl = btn.closest('[component="post"]');
				const pid = postEl.attr('data-pid');
				
				if (!pid) {
					return;
				}
				
				// Check if already in edit mode
				if (postEl.hasClass('speek-post-editing')) {
					return;
				}
				
				// Check edit duration if available
				const timestamp = parseInt(btn.attr('data-timestamp'), 10);
				const postEditDuration = parseInt(ajaxify.data.postEditDuration, 10);
				
				if (postEditDuration && timestamp) {
					const now = Date.now();
					const elapsed = now - timestamp;
					const maxDuration = postEditDuration * 60 * 1000; // Convert minutes to milliseconds
					
					if (elapsed > maxDuration) {
						alerts.error('[[error:post-edit-duration-expired]]');
						return;
					}
				}
				
				// Start editing
				startInlineEdit(postEl, pid);
			});
			
			function startInlineEdit(postEl, pid) {
				const contentEl = postEl.find('[component="post/content"]');
				const originalContent = contentEl.html();
				
				// Mark post as editing
				postEl.addClass('speek-post-editing');
				
				// Fetch raw content
				api.get(`/posts/${pid}/raw`, {}, function (err, data) {
					if (err) {
						alerts.error(err);
						postEl.removeClass('speek-post-editing');
						return;
					}
					
					const rawContent = data.content || '';
					const originalRawContent = rawContent.trim();
					
					// Create edit container
					const editContainer = $('<div class="speek-post-edit-container"></div>');
					const textarea = $('<textarea class="speek-post-edit-textarea form-control" rows="6"></textarea>').val(rawContent);
					const buttonContainer = $('<div class="speek-post-edit-buttons d-flex gap-2 mt-2"></div>');
					const saveBtn = $('<button type="button" class="btn speek-post-edit-save speek-post-edit-save-btn" disabled>Save</button>');
					const cancelBtn = $('<button type="button" class="btn btn-secondary btn-sm speek-post-edit-cancel">Cancel</button>');
					
					buttonContainer.append(saveBtn).append(cancelBtn);
					editContainer.append(textarea).append(buttonContainer);
					
					// Hide original content and show edit container
					contentEl.hide();
					contentEl.after(editContainer);
					
					// Function to check if content has changed
					function checkContentChanged() {
						const currentContent = textarea.val().trim();
						const hasChanged = currentContent !== originalRawContent && currentContent.length > 0;
						saveBtn.prop('disabled', !hasChanged);
					}
					
					// Check on input
					textarea.on('input', checkContentChanged);
					
					// Initial check
					checkContentChanged();
					
					// Focus textarea
					setTimeout(function () {
						textarea.focus();
						// Move cursor to end
						const len = textarea.val().length;
						textarea[0].setSelectionRange(len, len);
					}, 100);
					
					// Handle save
					saveBtn.on('click', function () {
						if (!saveBtn.prop('disabled')) {
							saveEdit(postEl, pid, textarea.val().trim(), originalContent);
						}
					});
					
					// Handle cancel
					cancelBtn.on('click', function () {
						cancelEdit(postEl, contentEl, editContainer);
					});
					
					// Handle ESC key
					textarea.on('keydown', function (e) {
						if (e.key === 'Escape') {
							e.preventDefault();
							cancelEdit(postEl, contentEl, editContainer);
						}
					});
					
					// Handle Enter+Ctrl/Cmd to save
					textarea.on('keydown', function (e) {
						if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
							e.preventDefault();
							if (!saveBtn.prop('disabled')) {
								saveEdit(postEl, pid, textarea.val().trim(), originalContent);
							}
						}
					});
				});
			}
			
			function saveEdit(postEl, pid, newContent, originalContent) {
				if (!newContent || newContent.trim() === '') {
					alerts.error('[[error:content-too-short]]');
					return;
				}
				
				const saveBtn = postEl.find('.speek-post-edit-save');
				const originalText = saveBtn.text();
				saveBtn.prop('disabled', true).text('Saving...');
				
				api.put(`/posts/${pid}`, {
					content: newContent,
					_csrf: $('input[name="_csrf"]').val()
				}, function (err, data) {
					saveBtn.prop('disabled', false).text(originalText);
					
					if (err) {
						alerts.error(err);
						return;
					}
					
					// Update the content
					const contentEl = postEl.find('[component="post/content"]');
					const editContainer = postEl.find('.speek-post-edit-container');
					
					// The API returns the parsed content - handle different response structures
					let parsedContent = null;
					let editedTimestamp = null;
					let editorData = null;
					let postData = null;
					
					if (data) {
						// Try different possible response structures
						postData = data.post || data.response?.post || data;
						parsedContent = data.content || 
							(postData && postData.content) || 
							(data.response && data.response.content) ||
							(data.response && data.response.post && data.response.post.content);
						
						// Get edited timestamp and editor info
						if (postData) {
							editedTimestamp = postData.edited || postData.editedISO;
							editorData = data.editor || postData.editor;
						}
					}
					
					// Remove edit container and show content
					editContainer.remove();
					
					// Update content if we have parsed HTML
					if (parsedContent) {
						contentEl.html(parsedContent);
						// Re-initialize images and other post content
						contentEl.find('img:not(.not-responsive)').addClass('img-fluid');
					} else {
						// If we don't have parsed content, just show the original content
						contentEl.show();
					}
					
					// Update edit indicator immediately after successful edit
					// The API returns success, so the post was edited
					const timestampEl = postEl.find('.speek-post-timestamp');
					let editIndicator = timestampEl.find('[component="post/edit-indicator"]');
					
					// If edit indicator doesn't exist, create it
					if (!editIndicator.length) {
						editIndicator = $('<span component="post/edit-indicator" class="text-muted ms-1 edit-icon">(edited)</span>');
						timestampEl.append(editIndicator);
					}
					
					// Show the edit indicator immediately
					editIndicator.removeClass('hidden').show();
					
					// Update tooltip and editor info if we have timestamp data
					if (editedTimestamp) {
						let editedISO = editedTimestamp;
						if (typeof editedTimestamp === 'number') {
							editedISO = new Date(editedTimestamp).toISOString();
						} else if (typeof editedTimestamp !== 'string') {
							editedISO = editedTimestamp.toISOString ? editedTimestamp.toISOString() : String(editedTimestamp);
						}
						
						// Update tooltip - use current time if no timestamp provided
						if (!editedISO) {
							editedISO = new Date().toISOString();
						}
						
						require(['helpers'], function (helpers) {
							let formattedTime = editedISO;
							if (helpers.isoTimeToLocaleString && config && config.userLang) {
								formattedTime = helpers.isoTimeToLocaleString(editedISO, config.userLang);
							}
							// Set tooltip - NodeBB will handle translation
							editIndicator.attr('title', `[[global:edited-timestamp, ${formattedTime}]]`);
						});
						
						// Update editor element
						if (editorData || app.user) {
							require(['app'], function(app) {
								app.parseAndTranslate('partials/topic/post-editor', {
									editor: editorData || { username: app.user.username, userslug: app.user.userslug },
									editedISO: editedISO
								}, function(html) {
									let editorEl = postEl.find('[component="post/editor"]');
									if (!editorEl.length) {
										editorEl = $(html);
										timestampEl.after(editorEl);
									} else {
										editorEl.replaceWith(html);
									}
									postEl.find('[component="post/editor"] .timeago').timeago();
								});
							});
						}
					} else {
						// If no timestamp, use current time
						const nowISO = new Date().toISOString();
						require(['helpers'], function (helpers) {
							let formattedTime = nowISO;
							if (helpers.isoTimeToLocaleString && config && config.userLang) {
								formattedTime = helpers.isoTimeToLocaleString(nowISO, config.userLang);
							}
							editIndicator.attr('title', `[[global:edited-timestamp, ${formattedTime}]]`);
						});
					}
					
					postEl.removeClass('speek-post-editing');
					
					// Show success message
					alerts.success('[[topic:post-edited]]');
				});
			}
			
			function cancelEdit(postEl, contentEl, editContainer) {
				editContainer.remove();
				contentEl.show();
				postEl.removeClass('speek-post-editing');
			}
		});
	}
});

