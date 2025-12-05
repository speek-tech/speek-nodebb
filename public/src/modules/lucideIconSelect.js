'use strict';

define('lucideIconSelect', ['benchpress', 'bootbox', 'lucideIconData'], function (Benchpress, bootbox, lucideIconData) {
	const lucideIconSelect = {};
	
	// Curated list of common Lucide icons suitable for categories
	const initialIcons = [
		{ id: 'circle-dot', label: 'Circle Dot (Default)' },
		{ id: 'home', label: 'Home' },
		{ id: 'users', label: 'Users' },
		{ id: 'user', label: 'User' },
		{ id: 'message-square', label: 'Message Square' },
		{ id: 'messages-square', label: 'Messages Square' },
		{ id: 'message-circle', label: 'Message Circle' },
		{ id: 'heart', label: 'Heart' },
		{ id: 'heart-handshake', label: 'Heart Handshake' },
		{ id: 'building', label: 'Building' },
		{ id: 'building-2', label: 'Building 2' },
		{ id: 'user-check', label: 'User Check' },
		{ id: 'user-plus', label: 'User Plus' },
		{ id: 'star', label: 'Star' },
		{ id: 'bell', label: 'Bell' },
		{ id: 'bookmark', label: 'Bookmark' },
		{ id: 'calendar', label: 'Calendar' },
		{ id: 'camera', label: 'Camera' },
		{ id: 'check-circle', label: 'Check Circle' },
		{ id: 'clock', label: 'Clock' },
		{ id: 'cloud', label: 'Cloud' },
		{ id: 'code', label: 'Code' },
		{ id: 'coffee', label: 'Coffee' },
		{ id: 'compass', label: 'Compass' },
		{ id: 'copy', label: 'Copy' },
		{ id: 'database', label: 'Database' },
		{ id: 'edit', label: 'Edit' },
		{ id: 'eye', label: 'Eye' },
		{ id: 'file', label: 'File' },
		{ id: 'file-text', label: 'File Text' },
		{ id: 'filter', label: 'Filter' },
		{ id: 'flag', label: 'Flag' },
		{ id: 'folder', label: 'Folder' },
		{ id: 'gift', label: 'Gift' },
		{ id: 'globe', label: 'Globe' },
		{ id: 'graduation-cap', label: 'Graduation Cap' },
		{ id: 'grid', label: 'Grid' },
		{ id: 'hash', label: 'Hash' },
		{ id: 'headphones', label: 'Headphones' },
		{ id: 'help-circle', label: 'Help Circle' },
		{ id: 'image', label: 'Image' },
		{ id: 'inbox', label: 'Inbox' },
		{ id: 'info', label: 'Info' },
		{ id: 'key', label: 'Key' },
		{ id: 'layers', label: 'Layers' },
		{ id: 'layout', label: 'Layout' },
		{ id: 'life-buoy', label: 'Life Buoy' },
		{ id: 'lightbulb', label: 'Lightbulb' },
		{ id: 'link', label: 'Link' },
		{ id: 'list', label: 'List' },
		{ id: 'lock', label: 'Lock' },
		{ id: 'mail', label: 'Mail' },
		{ id: 'map', label: 'Map' },
		{ id: 'map-pin', label: 'Map Pin' },
		{ id: 'menu', label: 'Menu' },
		{ id: 'mic', label: 'Microphone' },
		{ id: 'monitor', label: 'Monitor' },
		{ id: 'moon', label: 'Moon' },
		{ id: 'music', label: 'Music' },
		{ id: 'newspaper', label: 'Newspaper' },
		{ id: 'package', label: 'Package' },
		{ id: 'palette', label: 'Palette' },
		{ id: 'paperclip', label: 'Paperclip' },
		{ id: 'pencil', label: 'Pencil' },
		{ id: 'phone', label: 'Phone' },
		{ id: 'pie-chart', label: 'Pie Chart' },
		{ id: 'play-circle', label: 'Play Circle' },
		{ id: 'plus-circle', label: 'Plus Circle' },
		{ id: 'rocket', label: 'Rocket' },
		{ id: 'save', label: 'Save' },
		{ id: 'search', label: 'Search' },
		{ id: 'send', label: 'Send' },
		{ id: 'settings', label: 'Settings' },
		{ id: 'share-2', label: 'Share' },
		{ id: 'shield', label: 'Shield' },
		{ id: 'shopping-bag', label: 'Shopping Bag' },
		{ id: 'shopping-cart', label: 'Shopping Cart' },
		{ id: 'smartphone', label: 'Smartphone' },
		{ id: 'smile', label: 'Smile' },
		{ id: 'speaker', label: 'Speaker' },
		{ id: 'sun', label: 'Sun' },
		{ id: 'tag', label: 'Tag' },
		{ id: 'target', label: 'Target' },
		{ id: 'thumbs-up', label: 'Thumbs Up' },
		{ id: 'thumbs-down', label: 'Thumbs Down' },
		{ id: 'tool', label: 'Tool' },
		{ id: 'trash-2', label: 'Trash' },
		{ id: 'trending-up', label: 'Trending Up' },
		{ id: 'trophy', label: 'Trophy' },
		{ id: 'tv', label: 'TV' },
		{ id: 'umbrella', label: 'Umbrella' },
		{ id: 'video', label: 'Video' },
		{ id: 'volume-2', label: 'Volume' },
		{ id: 'watch', label: 'Watch' },
		{ id: 'wifi', label: 'WiFi' },
		{ id: 'zap', label: 'Zap' },
	];

	lucideIconSelect.init = function (el, onModified) {
		onModified = onModified || function () { };
		let selected = extractIconName(el[0].value || el[0].getAttribute('value') || '');
		
		Benchpress.render('partials/lucide', { icons: initialIcons }).then(function (html) {
			html = $(html);

			const picker = bootbox.dialog({
				onEscape: true,
				backdrop: true,
				show: false,
				message: html,
				size: 'large',
				title: 'Select a Lucide Icon',
				buttons: {
					noIcon: {
						label: 'No Icon',
						className: 'btn-default',
						callback: function () {
							el.val('');
							el.attr('value', '');
							if (el.attr('data-lucide')) {
								el.removeAttr('data-lucide');
							}
							onModified(el, '', []);
						},
					},
					success: {
						label: 'Select',
						className: 'btn-primary',
						callback: function () {
							const selectedIcon = $('.bootbox .selected').attr('data-icon') || $('.bootbox #lucide-filter').val();
							if (selectedIcon) {
								el.val(selectedIcon);
								el.attr('value', selectedIcon);
								el.attr('data-lucide', selectedIcon);
								
								// Update the preview element with the selected icon
								if (lucideIconData && lucideIconData.createIconSvg) {
									el.html(lucideIconData.createIconSvg(selectedIcon, 24));
								}
								
								// Also try Lucide CDN
								setTimeout(function() {
									if (window.lucide && typeof window.lucide.createIcons === 'function') {
										window.lucide.createIcons();
									}
								}, 100);
							}
							onModified(el, selectedIcon, []);
						},
					},
				},
			});

			picker.on('show.bs.modal', function () {
				const modalEl = $(this);
				const searchEl = modalEl.find('input');

				if (selected) {
					modalEl.find('[data-icon="' + selected + '"]').addClass('selected');
					searchEl.val(selected);
				}
			}).modal('show');

			picker.on('shown.bs.modal', function () {
				const modalEl = $(this);
				const searchEl = modalEl.find('input');
				const iconContainer = modalEl.find('.lucide-icons-grid');
				let icons = modalEl.find('.lucide-icons-grid i');
				const submitEl = modalEl.find('button.btn-primary');
				let lastSearch = '';

				// Initialize Lucide icons in the modal after it's fully rendered
				setTimeout(function() {
					let iconsInitialized = false;
					
					// Try using Lucide CDN first
					if (window.lucide) {
						try {
							if (typeof window.lucide.createIcons === 'function') {
								window.lucide.createIcons();
								iconsInitialized = true;
							} else if (typeof window.lucide === 'function') {
								window.lucide();
								iconsInitialized = true;
							}
						} catch (e) {
							console.warn('Lucide CDN initialization failed:', e);
						}
					}
					
					// Fallback: use embedded SVG data
					if (!iconsInitialized) {
						console.log('Using fallback icon data');
						icons.each(function() {
							const iconName = $(this).attr('data-lucide');
							if (iconName) {
								const svgHtml = lucideIconData.createIconSvg(iconName, 24);
								$(this).html(svgHtml);
							}
						});
					}
				}, 150);

				function changeSelection(newSelection) {
					modalEl.find('i.selected').removeClass('selected');
					if (newSelection) {
						newSelection.addClass('selected');
					} else if (searchEl.val().length === 0) {
						if (selected) {
							modalEl.find('[data-icon="' + selected + '"]').addClass('selected');
						}
					} else {
						modalEl.find('i:visible').first().addClass('selected');
					}
				}

				// Focus on the input box
				searchEl.selectRange(0, searchEl.val().length);

				modalEl.find('.icon-container').on('click', 'i', function () {
					const iconName = $(this).attr('data-icon');
					searchEl.val(iconName);
					changeSelection($(this));
				});

				const debouncedSearch = utils.debounce(async () => {
					// Search
					let iconData;
					if (lastSearch.length) {
						iconData = initialIcons.filter(icon =>
							icon.id.includes(lastSearch.toLowerCase()) ||
							icon.label.toLowerCase().includes(lastSearch.toLowerCase())
						);
					} else {
						iconData = initialIcons;
					}
					icons.remove();
					iconData.forEach((iconData) => {
						iconContainer.append($('<i data-lucide="' + iconData.id + '" data-icon="' + iconData.id + '" class="lucide-icon p-2 rounded-1" data-label="' + iconData.label + '" style="width: 48px; height: 48px; display: inline-flex; align-items: center; justify-content: center; border: 2px solid transparent; cursor: pointer;"></i>'));
					});
					// Re-initialize Lucide icons
					setTimeout(function() {
						let iconsCreated = false;
						
						if (window.lucide) {
							try {
								if (typeof window.lucide.createIcons === 'function') {
									window.lucide.createIcons();
									iconsCreated = true;
								} else if (typeof window.lucide === 'function') {
									window.lucide();
									iconsCreated = true;
								}
							} catch (e) {
								console.warn('Lucide CDN failed:', e);
							}
						}
						
						// Fallback to embedded SVG data
						if (!iconsCreated) {
							icons = modalEl.find('.lucide-icons-grid i');
							icons.each(function() {
								const iconName = $(this).attr('data-lucide');
								if (iconName && !$(this).find('svg').length) {
									const svgHtml = lucideIconData.createIconSvg(iconName, 24);
									$(this).html(svgHtml);
								}
							});
						}
					}, 100);
					icons = modalEl.find('.lucide-icons-grid i');
					changeSelection();
				}, 200);

				searchEl.on('keyup', function (e) {
					if (e.code !== 'Enter' && searchEl.val() !== lastSearch) {
						lastSearch = searchEl.val();
						debouncedSearch();
					} else if (e.code === 'Enter') {
						submitEl.trigger('click');
					}
				});
			});
		});
	};

	function extractIconName(value) {
		if (!value) return '';
		// Remove 'fa-' prefix if present (for backward compatibility)
		value = value.replace(/^fa-/, '');
		// Extract just the icon name, remove any extra classes
		const parts = value.split(' ');
		return parts[0] || '';
	}

	return lucideIconSelect;
});

