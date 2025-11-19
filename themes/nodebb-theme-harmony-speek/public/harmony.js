'use strict';

$(document).ready(function () {
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
				$(window).on('action:ajaxify.start', function () {
					NProgress.set(0.7);
				});

				$(window).on('action:ajaxify.end', function () {
					NProgress.done(true);
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

	// Initialize Bootstrap dropdowns for topic sort
	function initializeTopicSortDropdown() {
		require(['bootstrap'], function (bootstrap) {
			// Initialize dropdown when page loads
			const initDropdown = function () {
				const dropdownElement = document.querySelector('[component="thread/sort"] .dropdown-toggle');
				if (dropdownElement) {
					// Check if already initialized
					if (!bootstrap.Dropdown.getInstance(dropdownElement)) {
						// Initialize Bootstrap dropdown
						new bootstrap.Dropdown(dropdownElement);
					}
				}
			};

			// Initialize on page load
			initDropdown();

			// Re-initialize after ajaxify (page navigation)
			$(window).on('action:ajaxify.end', function () {
				setTimeout(initDropdown, 100); // Small delay to ensure DOM is ready
			});
		});
	}

	function setupNewPostModal() {
		console.log('setupNewPostModal function called');
		require(['jquery', 'bootstrap', 'api'], function ($, bootstrap, api) {
			console.log('setupNewPostModal: require callback executed, dependencies loaded');
			const modal = $('#speek-new-post-modal');
			if (!modal.length) {
				console.log('Modal element not found: #speek-new-post-modal');
				return;
			}
			console.log('Modal element found, setting up event handlers');

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
			const charCurrent = $('#speek-char-current');
			const charMax = $('#speek-char-max');
			const maxLength = parseInt(textarea.attr('maxlength')) || 5000;

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
			function populateCategories(categories) {
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
				
				// Select first option by default
				const firstOption = select.find('option:first');
				if (firstOption.length && firstOption.val()) {
					select.val(firstOption.val());
					$('#speek-new-post-cid').val(firstOption.val());
				}
			}

			// Expose open function globally first
			window.speekNewPostModal = {
				open: function (categoryId) {
					const modalElement = document.getElementById('speek-new-post-modal');
					if (modalElement) {
						const bsModal = new bootstrap.Modal(modalElement);
						
						// Load categories first
						loadCategories().then(function (data) {
							if (data && data.categories) {
								populateCategories(data.categories);
								
								if (categoryId) {
									$('#speek-new-post-space').val(categoryId);
									$('#speek-new-post-cid').val(categoryId);
								}
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
			function populateCategories(categories) {
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
				
				// Select first option by default
				const firstOption = select.find('option:first');
				if (firstOption.length && firstOption.val()) {
					select.val(firstOption.val());
					$('#speek-new-post-cid').val(firstOption.val());
				}
			}

			// Hide composer interface when modal is shown
			modal.on('show.bs.modal', function () {
				// Hide composer interface
				$('.composer, [component="composer"], .composer-container, .composer-wrapper').hide();
				$('body').addClass('speek-modal-open speek-new-post-modal-open');
				
				loadCategories().then(function (data) {
					if (data && data.categories) {
						populateCategories(data.categories);
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
					cid: $('#speek-new-post-cid').val() || $('#speek-new-post-space').val(),
					title: $('#speek-new-post-title').val().trim(),
					content: textarea.val().trim(),
					_csrf: $('input[name="_csrf"]').val()
				};

				// Submit via AJAX
				$.ajax({
					url: form.attr('action'),
					method: 'POST',
					data: formData,
					success: function (response) {
						// Close modal
						const bsModal = bootstrap.Modal.getInstance(modal[0]);
						if (bsModal) {
							console.log("AAAA")
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

						// Reload page or redirect
						if (response && response.redirect) {
							window.location.href = response.redirect;
						} else {
							window.location.reload();
						}
					},
					error: function (xhr) {
						console.error('Error submitting post:', xhr);
						
						// Handle server-side validation errors
						if (xhr.responseJSON && xhr.responseJSON.errors) {
							const errors = xhr.responseJSON.errors;
							
							if (errors.cid || errors.space) {
								showError('speek-new-post-space', 'speek-error-space', errors.cid || errors.space || 'Please select a valid space');
							}
							
							if (errors.title) {
								showError('speek-new-post-title', 'speek-error-title', errors.title);
							}
							
							if (errors.content) {
								showError('speek-new-post-content', 'speek-error-content', errors.content);
							}
						} else {
							// Generic error message
							showError('speek-new-post-content', 'speek-error-content', 'Error submitting post. Please try again.');
						}
					}
				});
			});

			// Handle space/category selection
			$('#speek-new-post-space').on('change', function () {
				$('#speek-new-post-cid').val($(this).val());
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
});
