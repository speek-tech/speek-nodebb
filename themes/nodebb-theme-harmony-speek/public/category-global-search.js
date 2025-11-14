'use strict';

/* global ajaxify, app, config */

(function () {
	let searchTimeout = null;

	function initInlineSearch() {
		if (!ajaxify.data || !ajaxify.data.template || !ajaxify.data.template.categories) {
			return;
		}

		const container = $('#category-inline-search');
		if (!container.length || container.data('search-initialized')) {
			return;
		}
		container.data('search-initialized', true);

		const searchInput = $('#category-inline-search-input');
		const clearBtn = container.find('.category-inline-clear');
		const loadingEl = container.find('.category-search-loading');
		const noResultsEl = container.find('.category-search-no-results');
		const resultsContainer = container.find('.category-inline-search-results');
		const resultsList = $('#category-inline-search-results');

		resultsContainer.hide();

		function resetResults() {
			resultsList.empty();
			hideFeedback();
			resultsContainer.hide();
		}

		function hideFeedback() {
			loadingEl.hide();
			noResultsEl.hide();
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

			const searchData = {
				term: query,
				in: 'titlesposts',
				matchWords: 'any',
				sortBy: 'timestamp',
				searchOnly: 1,
				page: 1,
				categories: ['all'],
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
				fragments.push(buildResultItem(post, query));
			});

			if (!fragments.length) {
				showNoResults();
				return;
			}

			resultsList.append(fragments.join(''));
			resultsContainer.scrollTop(0);
			resultsContainer.show();

			resultsList.find('.category-search-result-item').on('click', function (e) {
				e.preventDefault();
				const url = $(this).data('url');
				ajaxify.go(url);
			});
		}

		function buildResultItem(post, query) {
			const isMainPost = post.isMainPost;
			const title = isMainPost ? post.topic.title : 'RE: ' + post.topic.title;
			const content = stripHtml(post.content || '');
			const highlightedContent = highlightSearchTerms(content, query);
			const url = config.relative_path + '/post/' + post.pid;

			const timestamp = new Date(post.timestamp).toLocaleString(window.navigator.language || 'en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			});
			const username = post.user.displayname || post.user.username;

			return `
				<div class="category-search-result-item" data-url="${url}">
					<div class="category-search-result-header">
						<h4 class="category-search-result-title">${escapeHtml(title)}</h4>
					</div>
					<div class="category-search-result-meta">
						<span class="category-search-result-author">
							<i class="fa fa-user"></i>
							<span>${escapeHtml(username)}</span>
						</span>
						<span class="category-search-result-time">
							<i class="fa fa-clock-o"></i>
							<span>${timestamp}</span>
						</span>
					</div>
					<p class="category-search-result-content">${highlightedContent}</p>
				</div>
			`;
		}

		function stripHtml(html) {
			const tmp = document.createElement('div');
			tmp.innerHTML = html;
			return tmp.textContent || tmp.innerText || '';
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

		function highlightSearchTerms(content, query) {
			if (!query || !content) {
				return escapeHtml(content.substring(0, 200)) + (content.length > 200 ? '...' : '');
			}

			let truncated = content.substring(0, 300);
			if (content.length > 300) {
				truncated += '...';
			}

			truncated = escapeHtml(truncated);

			const terms = query.toLowerCase().split(' ').filter(t => t.length > 0);
			terms.forEach(function (term) {
				const regex = new RegExp('(' + escapeRegex(term) + ')', 'gi');
				truncated = truncated.replace(regex, '<span class="category-search-result-highlight">$1</span>');
			});

			return truncated;
		}

		function escapeRegex(string) {
			return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}

		function scheduleSearch() {
			clearTimeout(searchTimeout);
			searchTimeout = setTimeout(performSearch, 400);
		}

		searchInput.on('input', function () {
			const value = $(this).val();
			if (value.length) {
				clearBtn.show();
			} else {
				clearBtn.hide();
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
			clearBtn.hide();
			resetResults();
			searchInput.focus();
		});
	}

	$(document).ready(initInlineSearch);

	$(window).on('action:ajaxify.end', function (ev, data) {
		if (data.url && (data.url === 'categories' || data.url === '')) {
			initInlineSearch();
		}
	});
})();
'use strict';

/* global define, ajaxify, app, config, bootbox, utils */

(function () {
	let searchTimeout = null;
	function initCategoryGlobalSearch() {
		// Only run on the categories (home) page
		if (!ajaxify.data || !ajaxify.data.template || !ajaxify.data.template.categories) {
			return;
		}

		const overlay = $('#category-global-search-overlay');
		const searchInput = $('#category-global-search-input');
		const searchResults = $('#category-search-results');
		const loadingEl = $('.category-search-loading');
		const noResultsEl = $('.category-search-no-results');
		const resultsContainer = $('.category-search-results-container');
		const clearBtn = $('.category-search-clear');

		// Open search modal
		function openSearchModal() {
			overlay.fadeIn(200);
			setTimeout(function () {
				searchInput.focus();
			}, 250);
			$('body').css('overflow', 'hidden');
		}

		// Close search modal
		function closeSearchModal() {
			overlay.fadeOut(200);
			searchInput.val('');
			searchResults.empty();
			clearBtn.hide();
			$('body').css('overflow', '');
			hideLoadingAndNoResults();
		}

		// Bind close events
		$('.category-search-close, .category-search-cancel').on('click', closeSearchModal);
		
		overlay.on('click', function (e) {
			if ($(e.target).hasClass('category-global-search-overlay')) {
				closeSearchModal();
			}
		});

		// ESC key to close
		$(document).on('keydown', function (e) {
			if (e.key === 'Escape' && overlay.is(':visible')) {
				closeSearchModal();
			}
		});

		// Clear button
		clearBtn.on('click', function () {
			searchInput.val('');
			clearBtn.hide();
			searchResults.empty();
			hideLoadingAndNoResults();
		});

		// Show/hide clear button
		searchInput.on('input', function () {
			if ($(this).val().length > 0) {
				clearBtn.show();
			} else {
				clearBtn.hide();
				searchResults.empty();
				hideLoadingAndNoResults();
			}
		});

		// Search on input with debounce
		searchInput.on('input', function () {
			clearTimeout(searchTimeout);
			const query = $(this).val().trim();
			
			if (query.length < 2) {
				searchResults.empty();
				hideLoadingAndNoResults();
				return;
			}

			showLoading();
			
			searchTimeout = setTimeout(function () {
				performSearch();
			}, 500);
		});

		// Search button
		$('.category-search-submit').on('click', function () {
			if (searchInput.val().trim().length >= 2) {
				performSearch();
			}
		});

		// Enter key to search
		searchInput.on('keypress', function (e) {
			if (e.which === 13 && $(this).val().trim().length >= 2) {
				performSearch();
			}
		});

		function showLoading() {
			loadingEl.show();
			noResultsEl.hide();
			searchResults.empty();
		}

		function hideLoadingAndNoResults() {
			loadingEl.hide();
			noResultsEl.hide();
		}

		function showNoResults() {
			loadingEl.hide();
			noResultsEl.show();
			searchResults.empty();
		}

		function performSearch() {
			const query = searchInput.val().trim();
			if (query.length < 2) {
				return;
			}

			const matchWords = $('#category-search-match').val();
			const sortBy = $('#category-search-sort').val();
			
			// Combined search for topic titles and comments
			const searchIn = 'titlesposts';
			
			// Build search data
			const searchData = {
				term: query,
				in: searchIn,
				matchWords: matchWords,
				sortBy: sortBy,
				searchOnly: 1,
				page: 1
			};

			// Home page search covers all categories
			searchData.categories = ['all'];

			showLoading();

			$.getJSON(config.relative_path + '/api/search', searchData)
				.done(function (result) {
					hideLoadingAndNoResults();
					displayResults(result, query);
				})
				.fail(function (jqXHR) {
					hideLoadingAndNoResults();
					const message = (jqXHR.responseJSON && jqXHR.responseJSON.message) || jqXHR.statusText || 'Search failed';
					console.error('Search error:', message, jqXHR);
					app.alertError(message);
				});
		}

		function displayResults(result, query) {
			searchResults.empty();

			if (!result.posts || result.posts.length === 0) {
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
				fragments.push(buildResultItem(post, query));
			});

			if (!fragments.length) {
				showNoResults();
				return;
			}

			searchResults.append(fragments.join(''));
			resultsContainer.scrollTop(0);

			// Add click handlers
			searchResults.find('.category-search-result-item').on('click', function (e) {
				e.preventDefault();
				const url = $(this).data('url');
				closeSearchModal();
				ajaxify.go(url);
			});
		}

		function buildResultItem(post, query) {
			const isMainPost = post.isMainPost;
			const icon = isMainPost ? 'fa-file-text' : 'fa-comment';
			const title = isMainPost ? post.topic.title : 'RE: ' + post.topic.title;
			const content = stripHtml(post.content || '');
			const highlightedContent = highlightSearchTerms(content, query);
			const url = config.relative_path + '/post/' + post.pid;
			
			const timeAgo = new Date(post.timestamp).toLocaleString(window.navigator.language || 'en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
			});
			const username = post.user.displayname || post.user.username;

			const html = `
				<div class="category-search-result-item" data-url="${url}">
					<div class="category-search-result-header">
						<div class="category-search-result-icon">
							<i class="fa ${icon}"></i>
						</div>
						<h4 class="category-search-result-title">${escapeHtml(title)}</h4>
					</div>
					<div class="category-search-result-meta">
						<span class="category-search-result-author">
							<i class="fa fa-user"></i>
							<span>${escapeHtml(username)}</span>
						</span>
						<span class="category-search-result-time">
							<i class="fa fa-clock-o"></i>
							<span>${timeAgo}</span>
						</span>
					</div>
					<p class="category-search-result-content">${highlightedContent}</p>
				</div>
			`;

			return html;
		}

		function stripHtml(html) {
			const tmp = document.createElement('DIV');
			tmp.innerHTML = html;
			return tmp.textContent || tmp.innerText || '';
		}

		function escapeHtml(text) {
			const map = {
				'&': '&amp;',
				'<': '&lt;',
				'>': '&gt;',
				'"': '&quot;',
				"'": '&#039;'
			};
			return text.replace(/[&<>"']/g, function (m) { return map[m]; });
		}

		function highlightSearchTerms(content, query) {
			if (!query || !content) {
				return escapeHtml(content.substring(0, 200)) + (content.length > 200 ? '...' : '');
			}

			// Truncate content first
			let truncated = content.substring(0, 300);
			if (content.length > 300) {
				truncated += '...';
			}

			// Escape HTML
			truncated = escapeHtml(truncated);

			// Highlight search terms
			const terms = query.toLowerCase().split(' ').filter(t => t.length > 0);
			terms.forEach(function (term) {
				const regex = new RegExp('(' + escapeRegex(term) + ')', 'gi');
				truncated = truncated.replace(regex, '<span class="category-search-result-highlight">$1</span>');
			});

			return truncated;
		}

		function escapeRegex(string) {
			return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}

		// Allow Ctrl+K or Cmd+K to open search
		$(document).on('keydown', function (e) {
			if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
				e.preventDefault();
				openSearchModal();
			}
		});
	}

	// Initialize on page load
	$(document).ready(function () {
		initCategoryGlobalSearch();
	});

	// Re-initialize on ajaxify
	$(window).on('action:ajaxify.end', function (ev, data) {
		if (data.url && (data.url === 'categories' || data.url === '')) {
			initCategoryGlobalSearch();
		}
	});
})();

