'use strict';

/* global ajaxify, app, config */

(function () {
	let searchTimeout = null;
	const numberFormatter = new Intl.NumberFormat(window.navigator.language || 'en-US');

	function initCategorySpecificSearch() {
		// Only run on category pages (not categories/home page)
		if (!ajaxify.data || !ajaxify.data.template || !ajaxify.data.template.category || !ajaxify.data.cid) {
			return;
		}

		const container = $('#category-specific-search');
		if (!container.length || container.data('search-initialized')) {
			return;
		}
		container.data('search-initialized', true);

		const searchInput = $('#category-specific-search-input');
		const clearBtn = container.find('.category-inline-clear');
		const inputWrapper = container.find('.category-inline-input-wrapper');
		const loadingEl = container.find('.category-search-loading');
		const noResultsEl = container.find('.category-search-no-results');
		const metaEl = container.find('.category-search-meta');
		const countEl = container.find('.category-search-count');
		const resultsContainer = container.find('.category-inline-search-results');
		const resultsList = $('#category-specific-search-results');

		// Get category info from input data attributes or ajaxify
		const categoryName = searchInput.data('category-name') || ajaxify.data.name || '';
		const categoryCid = searchInput.data('category-cid') || ajaxify.data.cid;

		resultsContainer.hide();

		function resetResults() {
			resultsList.empty();
			hideFeedback();
			resultsContainer.hide();
			metaEl.hide();
			countEl.text('');
		}

		function hideFeedback() {
			loadingEl.hide();
			noResultsEl.hide();
			metaEl.hide();
		}

		function showLoading() {
			resultsContainer.show();
			loadingEl.show();
			noResultsEl.hide();
			resultsList.empty();
		}

		function showNoResults() {
			resultsContainer.show();
			loadingEl.hide();
			noResultsEl.show();
			resultsList.empty();
		}

		function performSearch() {
			const query = searchInput.val().trim();
			if (query.length < 2) {
				resetResults();
				return;
			}

			// Search only within this specific category
			const searchData = {
				term: query,
				in: 'titlesposts',
				matchWords: 'any',
				sortBy: 'timestamp',
				searchOnly: 1,
				page: 1,
				categories: [categoryCid], // Filter by specific category
			};

			showLoading();

			$.getJSON(config.relative_path + '/api/search', searchData)
				.done(function (result) {
					hideFeedback();
					resultsContainer.show();
					renderResults(result, query);
				})
				.fail(function (jqXHR) {
					hideFeedback();
					resultsContainer.hide();
					const message = (jqXHR.responseJSON && jqXHR.responseJSON.message) || jqXHR.statusText || 'Search failed';
					console.error('Search error:', message, jqXHR);
					app.alertError(message);
				});
		}

		function renderResults(result, query) {
			resultsList.empty();

			if (!result.posts || !result.posts.length) {
				showNoResults();
				return;
			}

			const seenPids = new Set();
			const fragments = [];

			result.posts.forEach(function (post) {
				if (seenPids.has(post.pid)) {
					return;
				}
				seenPids.add(post.pid);
				fragments.push(buildResultItem(post));
			});

			const total = fragments.length;

			if (!total) {
				showNoResults();
				return;
			}

			resultsList.append(fragments.join(''));
			resultsContainer.scrollTop(0);
			resultsContainer.show();
			showMeta(total);
			refreshLucideIcons();

			resultsList.find('.category-search-result-item').on('click', function (e) {
				e.preventDefault();
				const url = $(this).data('url');
				ajaxify.go(url);
			});
		}

		function buildResultItem(post) {
			const url = config.relative_path + '/post/' + post.pid;

			const title = getTopicTitle(post);
			const username = post.user.displayname || post.user.username;
			const likesCount = getLikesCount(post);
			const commentsCount = getCommentsCount(post);
			const timeAgo = formatTimeAgo(post.timestamp);
			const likesLabel = `${likesCount} ${likesCount === 1 ? 'like' : 'likes'}`;
			const commentsLabel = `${commentsCount} ${commentsCount === 1 ? 'comment' : 'comments'}`;

			return `
				<div class="category-search-result-item" data-url="${url}">
					<div class="category-search-result-header">
						<div class="category-search-result-text">
							<p class="category-search-result-author">${escapeHtml(username)}</p>
						<h4 class="category-search-result-title">${escapeHtml(title)}</h4>
						</div>
						<span class="category-search-result-time">${timeAgo}</span>
					</div>
					<div class="category-search-result-meta">
						<span class="category-search-result-metric" aria-label="${likesLabel}">
							<i class="lucide-icon category-search-result-icon" data-lucide="hand-heart" data-lucide-size="18" data-lucide-stroke-width="2" aria-hidden="true"></i>
							<span>${formatCount(likesCount)}</span>
						</span>
						<span class="category-search-result-metric" aria-label="${commentsLabel}">
							<i class="lucide-icon category-search-result-icon" data-lucide="message-square" data-lucide-size="18" data-lucide-stroke-width="2" aria-hidden="true"></i>
							<span>${formatCount(commentsCount)}</span>
						</span>
					</div>
				</div>
			`;
		}

		function escapeHtml(text) {
			const map = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				'\'': '&#039;',
			};
			return text.replace(/[&<>"']/g, function (m) { return map[m]; });
		}

		function formatTimeAgo(timestamp) {
			if (!timestamp) {
				return '';
			}
			const ts =
				typeof timestamp === 'number'
					? timestamp
					: Date.parse(timestamp);
			if (!Number.isFinite(ts)) {
				return '';
			}
			const diffMs = Date.now() - ts;
			const minute = 60 * 1000;
			const hour = 60 * minute;
			const day = 24 * hour;

			if (diffMs < minute) {
				return 'Just now';
			}
			if (diffMs < hour) {
				const minutes = Math.floor(diffMs / minute);
				return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
			}
			if (diffMs < day) {
				const hours = Math.floor(diffMs / hour);
				return `${hours} hour${hours === 1 ? '' : 's'} ago`;
			}
			const days = Math.floor(diffMs / day);
			return `${days} day${days === 1 ? '' : 's'} ago`;
		}

		function getLikesCount(post) {
			if (!post) {
				return 0;
			}
			const votes = safeNumber(
				typeof post.votes !== 'undefined' ? post.votes : post.upvotes
			);
			return Math.max(votes, 0);
		}

		function getCommentsCount(post) {
			const topicPostCount =
				post && post.topic && typeof post.topic.postcount !== 'undefined'
					? safeNumber(post.topic.postcount)
					: 0;
			if (topicPostCount <= 1) {
				return 0;
			}
			return Math.max(topicPostCount - 1, 0);
		}

		function getTopicTitle(post) {
			return (post && post.topic && post.topic.title) || '';
		}

		function formatCount(value) {
			const safeValue = safeNumber(value);
			return numberFormatter.format(Math.max(safeValue, 0));
		}

		function safeNumber(value) {
			const numeric =
				typeof value === 'number' ? value : parseInt(value, 10);
			return Number.isFinite(numeric) ? numeric : 0;
		}

		function refreshLucideIcons() {
			if (window.lucide && window.lucide.createIcons) {
				window.lucide.createIcons({
					icons: window.lucide.icons,
					nameAttr: 'data-lucide',
					attrs: {},
				});
			}
		}

		function showMeta(total) {
			const label = total === 1 ? 'result' : 'results';
			countEl.text(`${total} ${label}`);
			metaEl.show();
		}

		function scheduleSearch() {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(performSearch, 400);
		}

		searchInput.on('input', function () {
			const value = $(this).val();
			if (value.length) {
				inputWrapper.addClass('has-value');
			} else {
				inputWrapper.removeClass('has-value');
			}

			if (value.trim().length < 2) {
				resetResults();
				return;
			}

			scheduleSearch();
		});

		searchInput.on('keypress', function (e) {
			if (e.which === 13) {
				e.preventDefault();
				performSearch();
			}
		});

		clearBtn.on('click', function () {
			searchInput.val('');
			inputWrapper.removeClass('has-value');
			resetResults();
			searchInput.focus();
		});
	}

	$(document).ready(initCategorySpecificSearch);

	$(window).on('action:ajaxify.end', function (ev, data) {
		// Re-initialize on category page navigation
		if (data.url && data.url.startsWith('category/')) {
			initCategorySpecificSearch();
		}
	});
})();

