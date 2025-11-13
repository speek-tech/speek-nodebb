'use strict';

define('forum/category', [
	'forum/infinitescroll',
	'share',
	'navigator',
	'topicList',
	'sort',
	'categorySelector',
	'hooks',
	'alerts',
	'api',
	'clipboard',
], function (infinitescroll, share, navigator, topicList, sort, categorySelector, hooks, alerts, api, clipboard) {
	const Category = {};

	$(window).on('action:ajaxify.start', function (ev, data) {
		if (!String(data.url).startsWith('category/')) {
			navigator.disable();
		}
	});

	Category.init = function () {
		const cid = ajaxify.data.cid;

		app.enterRoom('category_' + cid);

		topicList.init('category', loadTopicsAfter);

		sort.handleSort('categoryTopicSort', 'category/' + ajaxify.data.slug);

		if (!config.usePagination) {
			navigator.init('[component="category/topic"]', ajaxify.data.topic_count, Category.toTop, Category.toBottom);
		} else {
			navigator.disable();
		}

		handleScrollToTopicIndex();

		handleIgnoreWatch(cid);

		handleLoadMoreSubcategories();

		handleDescription();

		categorySelector.init($('[component="category-selector"]'), {
			privilege: 'find',
			parentCid: ajaxify.data.cid,
			onSelect: function (category) {
				ajaxify.go('/category/' + category.cid);
			},
		});

		new clipboard('[data-clipboard-text]');

		// Initialize carousels
		initCarousels();

		// Initialize Lucide icons
		initLucideIcons();

		hooks.fire('action:topics.loaded', { topics: ajaxify.data.topics });
		hooks.fire('action:category.loaded', { cid: ajaxify.data.cid });
	};

	function handleScrollToTopicIndex() {
		let topicIndex = ajaxify.data.topicIndex;
		if (topicIndex && utils.isNumber(topicIndex)) {
			topicIndex = Math.max(0, parseInt(topicIndex, 10));
			if (topicIndex && window.location.search.indexOf('page=') === -1) {
				navigator.scrollToElement($('[component="category/topic"][data-index="' + topicIndex + '"]'), true, 0);
			}
		}
	}

	function handleIgnoreWatch(cid) {
		$('[component="category/watching"], [component="category/tracking"], [component="category/ignoring"], [component="category/notwatching"]').on('click', function () {
			const $this = $(this);
			const state = $this.attr('data-state');

			api.put(`/categories/${encodeURIComponent(cid)}/watch`, { state }, (err) => {
				if (err) {
					return alerts.error(err);
				}

				$('[component="category/watching/menu"]').toggleClass('hidden', state !== 'watching');
				$('[component="category/watching/check"]').toggleClass('fa-check', state === 'watching');

				$('[component="category/tracking/menu"]').toggleClass('hidden', state !== 'tracking');
				$('[component="category/tracking/check"]').toggleClass('fa-check', state === 'tracking');

				$('[component="category/notwatching/menu"]').toggleClass('hidden', state !== 'notwatching');
				$('[component="category/notwatching/check"]').toggleClass('fa-check', state === 'notwatching');

				$('[component="category/ignoring/menu"]').toggleClass('hidden', state !== 'ignoring');
				$('[component="category/ignoring/check"]').toggleClass('fa-check', state === 'ignoring');

				alerts.success('[[category:' + state + '.message]]');
			});
		});
	}

	function handleLoadMoreSubcategories() {
		$('[component="category/load-more-subcategories"]').on('click', async function () {
			const btn = $(this);
			const { categories: data } = await api.get(`/categories/${ajaxify.data.cid}/children?start=${ajaxify.data.nextSubCategoryStart}`);
			btn.toggleClass('hidden', !data.length || data.length < ajaxify.data.subCategoriesPerPage);
			if (!data.length) {
				return;
			}
			app.parseAndTranslate('category', 'children', { children: data }, function (html) {
				html.find('.timeago').timeago();
				$('[component="category/subcategory/container"]').append(html);
				ajaxify.data.nextSubCategoryStart += ajaxify.data.subCategoriesPerPage;
				ajaxify.data.subCategoriesLeft -= data.length;
				btn.toggleClass('hidden', ajaxify.data.subCategoriesLeft <= 0)
					.translateText('[[category:x-more-categories, ' + ajaxify.data.subCategoriesLeft + ']]');
			});

			return false;
		});
	}

	function handleDescription() {
		const fadeEl = document.querySelector('.description.clamp-fade-4');
		if (!fadeEl) {
			return;
		}

		fadeEl.addEventListener('click', () => {
			const state = fadeEl.classList.contains('line-clamp-4');
			fadeEl.classList.toggle('line-clamp-4', !state);
		});
	}

	Category.toTop = function () {
		navigator.scrollTop(0);
	};

	Category.toBottom = async () => {
		const { count } = await api.get(`/categories/${encodeURIComponent(ajaxify.data.category.cid)}/count`);
		navigator.scrollBottom(count - 1);
	};

	function loadTopicsAfter(after, direction, callback) {
		callback = callback || function () {};

		hooks.fire('action:topics.loading');
		const params = utils.params();
		infinitescroll.loadMore(`/categories/${encodeURIComponent(ajaxify.data.cid)}/topics`, {
			after: after,
			direction: direction,
			query: params,
			categoryTopicSort: params.sort || config.categoryTopicSort,
		}, function (data, done) {
			hooks.fire('action:topics.loaded', { topics: data.topics });
			callback(data, done);
		});
	}

	// =====================================
	// Lucide Icons Initialization
	// =====================================
	function initLucideIcons() {
		// Check if lucide is loaded and initialize icons
		if (window.lucide && window.lucide.createIcons) {
			window.lucide.createIcons();
			console.log('[Category] Lucide icons initialized');
		} else {
			// If not loaded yet, try to load it
			require(['lucideHelper'], function (lucideHelper) {
				if (lucideHelper && lucideHelper.refresh) {
					lucideHelper.refresh();
					console.log('[Category] Lucide icons loaded and initialized via helper');
				}
			});
		}
	}

	// =====================================
	// Carousel Functionality
	// =====================================
	function initCarousels() {
		const carouselSections = document.querySelectorAll('.speek-carousel-section');
		carouselSections.forEach(section => {
			initCarousel(section);
		});
	}

	function initCarousel(section) {
		const container = section.querySelector('.speek-carousel-container');
		const track = section.querySelector('.speek-carousel-track');
		const prevBtn = section.querySelector('.speek-carousel-prev');
		const nextBtn = section.querySelector('.speek-carousel-next');

		if (!track || !prevBtn || !nextBtn) {
			return;
		}

		// Update button states based on scroll position
		function updateButtonStates() {
			const isAtStart = track.scrollLeft <= 0;
			const isAtEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;

			prevBtn.disabled = isAtStart;
			nextBtn.disabled = isAtEnd;
		}

		// Scroll carousel
		function scrollCarousel(direction) {
			const scrollAmount = track.clientWidth * 0.8; // Scroll 80% of visible width
			const newScrollLeft = direction === 'next'
				? track.scrollLeft + scrollAmount
				: track.scrollLeft - scrollAmount;

			track.scrollTo({
				left: newScrollLeft,
				behavior: 'smooth'
			});
		}

		// Event listeners
		prevBtn.addEventListener('click', () => scrollCarousel('prev'));
		nextBtn.addEventListener('click', () => scrollCarousel('next'));
		track.addEventListener('scroll', updateButtonStates);

		// Initial state
		updateButtonStates();

		// Update on window resize
		let resizeTimeout;
		window.addEventListener('resize', () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(updateButtonStates, 100);
		});

		// Touch/swipe support for mobile
		let touchStartX = 0;
		let touchEndX = 0;

		track.addEventListener('touchstart', (e) => {
			touchStartX = e.changedTouches[0].screenX;
		}, { passive: true });

		track.addEventListener('touchend', (e) => {
			touchEndX = e.changedTouches[0].screenX;
			handleSwipe();
		}, { passive: true });

		function handleSwipe() {
			const swipeThreshold = 50;
			const diff = touchStartX - touchEndX;

			if (Math.abs(diff) > swipeThreshold) {
				if (diff > 0) {
					// Swipe left (next)
					scrollCarousel('next');
				} else {
					// Swipe right (prev)
					scrollCarousel('prev');
				}
			}
		}
	}

	return Category;
});
