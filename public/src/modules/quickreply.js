'use strict';

define('quickreply', [
	'components', 'autocomplete', 'api',
	'alerts', 'uploadHelpers', 'mousetrap', 'storage', 'hooks',
], function (
	components, autocomplete, api,
	alerts, uploadHelpers, mousetrap, storage, hooks
) {
	const QuickReply = {
		_autocomplete: null,
	};

	QuickReply.init = function () {
		const element = components.get('topic/quickreply/text');
		const qrDraftId = `qr:draft:tid:${ajaxify.data.tid}`;
		const data = {
			element: element,
			strategies: [],
			options: {
				style: {
					'z-index': 100,
				},
			},
		};

		// Initialize character count
		QuickReply.updateCharCount = function () {
			const charCountEl = components.get('topic/quickreply/char-count');
			const charCurrentEl = components.get('topic/quickreply/char-current');
			if (charCountEl.length && charCurrentEl.length) {
				const currentLength = element.val().length;
				const maxLength = 5000;
				charCurrentEl.text(currentLength);
			}
		};

		// Validation functions similar to create new post modal
		function showError(message) {
			const errorEl = components.get('topic/quickreply/error');
			const textareaWrapper = element.closest('.speek-quick-reply-textarea-wrapper');
			
			if (textareaWrapper.length) {
				textareaWrapper.addClass('speek-error');
			}
			
			if (errorEl.length) {
				errorEl.text(message).addClass('show');
			}
		}

		function hideError() {
			const errorEl = components.get('topic/quickreply/error');
			const textareaWrapper = element.closest('.speek-quick-reply-textarea-wrapper');
			
			if (textareaWrapper.length) {
				textareaWrapper.removeClass('speek-error');
			}
			
			if (errorEl.length) {
				errorEl.removeClass('show').text('');
			}
		}

		function validateContent() {
			const contentValue = element.val().trim();
			if (!contentValue) {
				showError('Reply content is required');
				return false;
			}
			const minLength = parseInt(config.minimumPostLength, 10) || 2;
			if (contentValue.length < minLength) {
				showError('Reply content must be at least ' + minLength + ' characters');
				return false;
			}
			hideError();
			return true;
		}

		// Update character count on input and clear errors
		element.on('input keyup paste', function () {
			QuickReply.updateCharCount();
			// Clear error on input if content is valid
			const contentValue = element.val().trim();
			if (contentValue && contentValue.length >= 2) {
				hideError();
			}
		});

		// Initial character count update
		QuickReply.updateCharCount();

		destroyAutoComplete();
		$(window).one('action:ajaxify.start', () => {
			destroyAutoComplete();
		});
		$(window).trigger('composer:autocomplete:init', data);
		QuickReply._autocomplete = autocomplete.setup(data);

		mousetrap.bind('ctrl+return', (e) => {
			if (e.target === element.get(0)) {
				components.get('topic/quickreply/button').get(0).click();
			}
		});

		uploadHelpers.init({
			uploadBtnEl: $('[component="topic/quickreply/upload/button"]'),
			dragDropAreaEl: $('[component="topic/quickreply/container"] .speek-quick-reply-textarea-wrapper'),
			pasteEl: element,
			uploadFormEl: $('[component="topic/quickreply/upload"]'),
			inputEl: element,
			route: '/api/post/upload',
			callback: function (uploads) {
				let text = element.val();
				uploads.forEach((upload) => {
					text = text + (text ? '\n' : '') + (upload.isImage ? '!' : '') + `[${upload.filename}](${upload.url})`;
				});
				element.val(text);
				QuickReply.updateCharCount();
			},
		});

		// Prevent default form submission - handle via JavaScript only
		const quickReplyForm = element.closest('form');
		if (quickReplyForm.length) {
			quickReplyForm.on('submit', function (e) {
				e.preventDefault();
				e.stopPropagation();
				// Trigger the button click handler instead
				components.get('topic/quickreply/button').trigger('click');
				return false;
			});
		}

		let ready = true;
		components.get('topic/quickreply/button').on('click', function (e) {
			e.preventDefault();
			e.stopPropagation();
			if (!ready) {
				return;
			}

			// Validate content before submitting (minimum length from config)
			if (!validateContent()) {
				return;
			}
			

			const replyMsg = components.get('topic/quickreply/text').val().trim();
			const replyData = {
				tid: ajaxify.data.tid,
				handle: undefined,
				content: replyMsg,
			};
			const replyLen = replyMsg.length;
			
			// Check maximum length (backend validation)
			if (replyLen > parseInt(config.maximumPostLength, 10)) {
				showError('Reply content is too long. Maximum ' + config.maximumPostLength + ' characters allowed.');
				return;
			}

			ready = false;
			api.post(`/topics/${ajaxify.data.tid}`, replyData, function (err, data) {
				ready = true;
				if (err) {
					return alerts.error(err);
				}
				if (data && data.queued) {
					alerts.alert({
						type: 'success',
						title: '[[global:alert.success]]',
						message: data.message,
						timeout: 10000,
						clickfn: function () {
							ajaxify.go(`/post-queue/${data.id}`);
						},
					});
				}
				try {
					window.parent.postMessage({
						type: 'posthog_analytics',
						action: 'write_reply'
					}, '*');
				} catch (e) {
					console.log('Could not send analytics replyMessage:', e);
				}

				components.get('topic/quickreply/text').val('');
				QuickReply.updateCharCount();
				hideError(); // Clear any errors on success
				storage.removeItem(qrDraftId);
				QuickReply._autocomplete.hide();
				hooks.fire('action:quickreply.success', { data });
			});
		});

		const draft = storage.getItem(qrDraftId);
		if (draft) {
			element.val(draft);
			QuickReply.updateCharCount();
		}

		element.on('keyup', utils.debounce(function () {
			const text = element.val();
			if (text) {
				storage.setItem(qrDraftId, text);
			} else {
				storage.removeItem(qrDraftId);
			}
			QuickReply.updateCharCount();
		}, 1000));

		components.get('topic/quickreply/expand').on('click', (e) => {
			e.preventDefault();
			storage.removeItem(qrDraftId);
			const textEl = components.get('topic/quickreply/text');
			hooks.fire('action:composer.post.new', {
				tid: ajaxify.data.tid,
				title: ajaxify.data.titleRaw,
				body: textEl.val(),
			});
			textEl.val('');
			QuickReply.updateCharCount();
		});
	};

	function destroyAutoComplete() {
		if (QuickReply._autocomplete) {
			QuickReply._autocomplete.destroy();
			QuickReply._autocomplete = null;
		}
	}

	return QuickReply;
});
