'use strict';

/**
 * Lucide Icon Helper Module
 * Provides utilities for using Lucide icons throughout the NodeBB application
 * Uses Lucide CDN for icon rendering
 * @module lucideHelper
 */

define('lucideHelper', ['jquery'], function ($) {
	const lucideHelper = {};

	// Lucide icon data cache
	const iconCache = {};
	let lucideLoaded = false;

	/**
	 * Initialize Lucide icons library from CDN
	 * This is called once when the module loads
	 */
	lucideHelper.init = function () {
		if (lucideLoaded) {
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			// Check if lucide is already loaded
			if (window.lucide) {
				lucideLoaded = true;
				console.log('[Lucide] Icons library already loaded');
				resolve();
				return;
			}

			// Load lucide from CDN
			const script = document.createElement('script');
			script.src = 'https://unpkg.com/lucide@latest/dist/umd/lucide.min.js';
			script.onload = function () {
				lucideLoaded = true;
				console.log('[Lucide] Icons library loaded from CDN');
				// Initialize all existing lucide icons on the page
				if (window.lucide && window.lucide.createIcons) {
					window.lucide.createIcons();
				}
				resolve();
			};
			script.onerror = function (err) {
				console.error('[Lucide] Failed to load icons from CDN:', err);
				reject(err);
			};
			document.head.appendChild(script);
		});
	};

	/**
	 * Create and return a Lucide icon element
	 * @param {string} iconName - The name of the Lucide icon (e.g., 'home', 'user', 'settings')
	 * @param {Object} options - Icon options
	 * @param {number} [options.size=24] - Icon size in pixels
	 * @param {string} [options.color='currentColor'] - Icon color
	 * @param {number} [options.strokeWidth=2] - Stroke width
	 * @param {string} [options.className=''] - Additional CSS classes
	 * @param {Object} [options.attrs={}] - Additional SVG attributes
	 * @returns {jQuery} jQuery-wrapped icon element
	 */
	lucideHelper.create = function (iconName, options = {}) {
		const {
			size = 24,
			color = 'currentColor',
			strokeWidth = 2,
			className = '',
			attrs = {},
		} = options;

		// Create an i element that lucide will replace with SVG
		const $icon = $('<i></i>');

		// Set lucide data attributes
		$icon.attr({
			'data-lucide': iconName,
			'data-lucide-size': size,
			'data-lucide-stroke-width': strokeWidth,
			class: `lucide-icon ${className}`,
		});

		// Set color if not currentColor
		if (color !== 'currentColor') {
			$icon.css('color', color);
		}

		// Add any additional attributes
		Object.keys(attrs).forEach(key => {
			$icon.attr(key, attrs[key]);
		});

		// If lucide is loaded, immediately convert to icon
		if (window.lucide && window.lucide.createIcons) {
			setTimeout(() => {
				window.lucide.createIcons({
					icons: window.lucide.icons,
					nameAttr: 'data-lucide',
					attrs: {
						'stroke-width': strokeWidth,
						width: size,
						height: size,
					},
				});
			}, 0);
		}

		return $icon;
	};

	/**
	 * Replace an element with a Lucide icon
	 * @param {jQuery|string} selector - jQuery object or selector string
	 * @param {string} iconName - The name of the Lucide icon
	 * @param {Object} options - Icon options (see create method)
	 */
	lucideHelper.replace = function (selector, iconName, options = {}) {
		const $elements = $(selector);
		$elements.each(function () {
			const $icon = lucideHelper.create(iconName, options);
			$(this).replaceWith($icon);
		});
	};

	/**
	 * Create icon HTML string (for use in templates)
	 * @param {string} iconName - The name of the Lucide icon
	 * @param {Object} options - Icon options
	 * @returns {string} SVG HTML string
	 */
	lucideHelper.toHTML = function (iconName, options = {}) {
		const $icon = lucideHelper.create(iconName, options);
		return $icon[0].outerHTML;
	};

	/**
	 * Add icon to element as prepend or append
	 * @param {jQuery|string} selector - jQuery object or selector string
	 * @param {string} iconName - The name of the Lucide icon
	 * @param {Object} options - Icon options
	 * @param {boolean} prepend - If true, prepend icon; otherwise append
	 */
	lucideHelper.addTo = function (selector, iconName, options = {}, prepend = false) {
		const $elements = $(selector);
		const $icon = lucideHelper.create(iconName, options);

		if (prepend) {
			$elements.prepend($icon);
		} else {
			$elements.append($icon);
		}
	};

	/**
	 * Convert FontAwesome icon class to Lucide icon name
	 * @param {string} faClass - FontAwesome class (e.g., 'fa-home', 'fa-user')
	 * @returns {string} Lucide icon name
	 */
	lucideHelper.fromFontAwesome = function (faClass) {
		// Remove 'fa-' prefix if present
		const iconName = faClass.replace(/^fa-/, '');
		return lucideHelper.faToLucideMap[iconName] || iconName;
	};

	/**
	 * FontAwesome to Lucide icon mapping
	 * Maps common FontAwesome icon names to their Lucide equivalents
	 */
	lucideHelper.faToLucideMap = {
		// Common icons
		'home': 'home',
		'user': 'user',
		'users': 'users',
		'cog': 'settings',
		'gear': 'settings',
		'settings': 'settings',
		'search': 'search',
		'envelope': 'mail',
		'bell': 'bell',
		'heart': 'heart',
		'star': 'star',
		'bars': 'menu',
		'navicon': 'menu',
		'times': 'x',
		'xmark': 'x',
		'close': 'x',
		'check': 'check',
		'plus': 'plus',
		'minus': 'minus',
		'trash': 'trash-2',
		'trash-can': 'trash-2',
		'edit': 'edit',
		'pen': 'pen',
		'pen-to-square': 'pen-square',
		'square-pen': 'pen-square',
		'pencil': 'pencil',
		'share': 'share-2',
		'share-from-square': 'share-2',
		'arrow-right': 'arrow-right',
		'arrow-left': 'arrow-left',
		'arrow-up': 'arrow-up',
		'arrow-down': 'arrow-down',
		'chevron-right': 'chevron-right',
		'chevron-left': 'chevron-left',
		'chevron-up': 'chevron-up',
		'chevron-down': 'chevron-down',
		'circle-info': 'info',
		'info-circle': 'info',
		'circle-question': 'help-circle',
		'question-circle': 'help-circle',
		'circle-exclamation': 'alert-circle',
		'exclamation-circle': 'alert-circle',
		'triangle-exclamation': 'alert-triangle',
		'exclamation-triangle': 'alert-triangle',
		'circle-check': 'check-circle',
		'check-circle': 'check-circle',
		'circle-xmark': 'x-circle',
		'times-circle': 'x-circle',
		'lock': 'lock',
		'unlock': 'unlock',
		'eye': 'eye',
		'eye-slash': 'eye-off',
		'calendar': 'calendar',
		'clock': 'clock',
		'comment': 'message-circle',
		'comments': 'message-square',
		'message': 'message-square',
		'file': 'file',
		'folder': 'folder',
		'image': 'image',
		'camera': 'camera',
		'video': 'video',
		'music': 'music',
		'download': 'download',
		'upload': 'upload',
		'link': 'link',
		'unlink': 'unlink',
		'link-slash': 'link-2-off',
		'paperclip': 'paperclip',
		'thumbtack': 'pin',
		'bookmark': 'bookmark',
		'flag': 'flag',
		'tag': 'tag',
		'tags': 'tags',
		'phone': 'phone',
		'phone-volume': 'phone',
		'globe': 'globe',
		'map-marker': 'map-pin',
		'location-dot': 'map-pin',
		'print': 'printer',
		'copy': 'copy',
		'clipboard': 'clipboard',
		'scissors': 'scissors',
		'filter': 'filter',
		'sort': 'arrow-up-down',
		'sort-up': 'arrow-up',
		'sort-down': 'arrow-down',
		'list': 'list',
		'list-ul': 'list',
		'list-ol': 'list-ordered',
		'table': 'table',
		'th': 'layout-grid',
		'grip': 'grip-vertical',
		'ellipsis': 'more-horizontal',
		'ellipsis-vertical': 'more-vertical',
		'play': 'play',
		'pause': 'pause',
		'stop': 'square',
		'circle-play': 'play-circle',
		'circle-pause': 'pause-circle',
		'circle-stop': 'circle',
		'forward': 'fast-forward',
		'backward': 'rewind',
		'refresh': 'refresh-cw',
		'arrows-rotate': 'refresh-cw',
		'arrow-rotate-right': 'rotate-cw',
		'arrow-rotate-left': 'rotate-ccw',
		'expand': 'expand',
		'compress': 'minimize',
		'window-maximize': 'maximize',
		'window-minimize': 'minimize',
		'window-restore': 'maximize-2',
		'power-off': 'power',
		'right-from-bracket': 'log-out',
		'sign-out': 'log-out',
		'right-to-bracket': 'log-in',
		'sign-in': 'log-in',
		'user-plus': 'user-plus',
		'user-minus': 'user-minus',
		'user-check': 'user-check',
		'user-times': 'user-x',
		'circle-user': 'user-circle',
		'shield': 'shield',
		'crown': 'crown',
		'code': 'code',
		'terminal': 'terminal',
		'bug': 'bug',
		'wrench': 'wrench',
		'screwdriver-wrench': 'wrench',
		'hammer': 'hammer',
		'chart-pie': 'pie-chart',
		'chart-bar': 'bar-chart',
		'chart-line': 'line-chart',
		'database': 'database',
		'server': 'server',
		'cloud': 'cloud',
		'wifi': 'wifi',
		'rss': 'rss',
		'paper-plane': 'send',
		'reply': 'reply',
		'reply-all': 'reply-all',
		'square-plus': 'square-plus',
		'square-minus': 'square-minus',
		'square-check': 'square-check',
		'ban': 'ban',
		'circle': 'circle',
		'square': 'square',
		'sun': 'sun',
		'moon': 'moon',
		'lightbulb': 'lightbulb',
		'fire': 'flame',
		'snowflake': 'snowflake',
		'droplet': 'droplet',
		'bolt': 'zap',
		'face-smile': 'smile',
		'face-frown': 'frown',
		'face-meh': 'meh',
		'thumbs-up': 'thumbs-up',
		'thumbs-down': 'thumbs-down',
		'graduation-cap': 'graduation-cap',
		'book': 'book',
		'newspaper': 'newspaper',
		'envelope-open': 'mail-open',
		'life-ring': 'life-buoy',
		'gift': 'gift',
		'shopping-cart': 'shopping-cart',
		'credit-card': 'credit-card',
		'money-bill-1': 'banknote',
		'wallet': 'wallet',
		'key': 'key',
		'magnet': 'magnet',
		'anchor': 'anchor',
		'plane': 'plane',
		'car': 'car',
		'bicycle': 'bike',
		'truck': 'truck',
		'building': 'building',
		'hospital': 'hospital',
		'graduation-cap': 'graduation-cap',
		'briefcase': 'briefcase',
		'suitcase': 'luggage',
		'utensils': 'utensils',
		'mug-hot': 'coffee',
		'pizza-slice': 'pizza',
		'wine-glass': 'wine',
		'mobile': 'smartphone',
		'mobile-screen-button': 'smartphone',
		'tablet': 'tablet',
		'tablet-screen-button': 'tablet',
		'laptop': 'laptop',
		'desktop': 'monitor',
		'tv': 'tv',
		'keyboard': 'keyboard',
		'mouse': 'mouse',
		'gamepad': 'gamepad-2',
		'headphones': 'headphones',
		'microphone': 'mic',
		'microphone-slash': 'mic-off',
		'volume-high': 'volume-2',
		'volume-low': 'volume-1',
		'volume-off': 'volume-x',
		'volume-xmark': 'volume-x',
		'bath': 'bath',
		'bed': 'bed',
		'couch': 'sofa',
		'shirt': 'shirt',
		'glass': 'glass',
		'brush': 'paintbrush',
		'palette': 'palette',
		'guitar': 'guitar',
		'drum': 'drum',
		'futbol': 'ball',
		'basketball': 'basketball',
		'football': 'football',
		'medal': 'medal',
		'trophy': 'trophy',
		'award': 'award',
		'gauge-high': 'gauge',
		'temperature-full': 'thermometer',
		'temperature-half': 'thermometer',
		'temperature-empty': 'thermometer',
		'battery-full': 'battery',
		'battery-half': 'battery',
		'battery-empty': 'battery',
		'plug': 'plug',
		'lightbulb': 'lightbulb',
		'wand-magic-sparkles': 'wand',
		'registered': 'copyright',
		'copyright': 'copyright',
		'at': 'at-sign',
		'hashtag': 'hash',
		'dollar': 'dollar-sign',
		'percent': 'percent',
		'quote-left': 'quote',
		'quote-right': 'quote',
		'paragraph': 'pilcrow',
		'heading': 'heading',
		'bold': 'bold',
		'italic': 'italic',
		'underline': 'underline',
		'strikethrough': 'strikethrough',
		'align-left': 'align-left',
		'align-center': 'align-center',
		'align-right': 'align-right',
		'align-justify': 'align-justify',
		'indent': 'indent',
		'outdent': 'outdent',
		'undo': 'undo',
		'redo': 'redo',
		'rotate': 'rotate-cw',
		'crop': 'crop',
		'sliders': 'sliders',
		'wand': 'wand',
		'magic': 'wand',
		'eraser': 'eraser',
		'fill-drip': 'paint-bucket',
		'eye-dropper': 'pipette',
		'ruler': 'ruler',
		'compass': 'compass',
		'up-long': 'arrow-up',
		'down-long': 'arrow-down',
		'left-long': 'arrow-left',
		'right-long': 'arrow-right',
		'angles-up': 'chevrons-up',
		'angles-down': 'chevrons-down',
		'angles-left': 'chevrons-left',
		'angles-right': 'chevrons-right',
		'arrow-up-right-from-square': 'external-link',
		'floppy-disk': 'save',
		'note-sticky': 'sticky-note',
		'object-group': 'layers',
		'object-ungroup': 'layers',
		'chart-area': 'area-chart',
		'map': 'map',
		'nbb-none': 'circle-dot',
	};

	/**
	 * Get list of all available Lucide icons
	 * @returns {Array} Array of icon objects with id and label
	 */
	lucideHelper.getAvailableIcons = function () {
		// Common icons for NodeBB use cases
		return [
			{ id: 'home', label: 'Home' },
			{ id: 'user', label: 'User' },
			{ id: 'users', label: 'Users' },
			{ id: 'settings', label: 'Settings' },
			{ id: 'search', label: 'Search' },
			{ id: 'mail', label: 'Mail' },
			{ id: 'bell', label: 'Bell' },
			{ id: 'heart', label: 'Heart' },
			{ id: 'star', label: 'Star' },
			{ id: 'menu', label: 'Menu' },
			{ id: 'x', label: 'Close' },
			{ id: 'check', label: 'Check' },
			{ id: 'plus', label: 'Plus' },
			{ id: 'minus', label: 'Minus' },
			{ id: 'trash-2', label: 'Trash' },
			{ id: 'edit', label: 'Edit' },
			{ id: 'pen-square', label: 'Pen Square' },
			{ id: 'share-2', label: 'Share' },
			{ id: 'arrow-right', label: 'Arrow Right' },
			{ id: 'arrow-left', label: 'Arrow Left' },
			{ id: 'arrow-up', label: 'Arrow Up' },
			{ id: 'arrow-down', label: 'Arrow Down' },
			{ id: 'chevron-right', label: 'Chevron Right' },
			{ id: 'chevron-left', label: 'Chevron Left' },
			{ id: 'chevron-up', label: 'Chevron Up' },
			{ id: 'chevron-down', label: 'Chevron Down' },
			{ id: 'info', label: 'Info' },
			{ id: 'help-circle', label: 'Help' },
			{ id: 'alert-circle', label: 'Alert Circle' },
			{ id: 'alert-triangle', label: 'Alert Triangle' },
			{ id: 'check-circle', label: 'Check Circle' },
			{ id: 'x-circle', label: 'X Circle' },
			{ id: 'lock', label: 'Lock' },
			{ id: 'unlock', label: 'Unlock' },
			{ id: 'eye', label: 'Eye' },
			{ id: 'eye-off', label: 'Eye Off' },
			{ id: 'calendar', label: 'Calendar' },
			{ id: 'clock', label: 'Clock' },
			{ id: 'message-circle', label: 'Message Circle' },
			{ id: 'message-square', label: 'Message Square' },
			{ id: 'file', label: 'File' },
			{ id: 'folder', label: 'Folder' },
			{ id: 'image', label: 'Image' },
			{ id: 'camera', label: 'Camera' },
			{ id: 'video', label: 'Video' },
			{ id: 'music', label: 'Music' },
			{ id: 'download', label: 'Download' },
			{ id: 'upload', label: 'Upload' },
			{ id: 'link', label: 'Link' },
			{ id: 'link-2-off', label: 'Link Off' },
			{ id: 'paperclip', label: 'Paperclip' },
			{ id: 'pin', label: 'Pin' },
			{ id: 'bookmark', label: 'Bookmark' },
			{ id: 'flag', label: 'Flag' },
			{ id: 'tag', label: 'Tag' },
			{ id: 'tags', label: 'Tags' },
			{ id: 'phone', label: 'Phone' },
			{ id: 'globe', label: 'Globe' },
			{ id: 'map-pin', label: 'Map Pin' },
			{ id: 'printer', label: 'Printer' },
			{ id: 'copy', label: 'Copy' },
			{ id: 'clipboard', label: 'Clipboard' },
			{ id: 'filter', label: 'Filter' },
			{ id: 'arrow-up-down', label: 'Sort' },
			{ id: 'list', label: 'List' },
			{ id: 'list-ordered', label: 'List Ordered' },
			{ id: 'table', label: 'Table' },
			{ id: 'layout-grid', label: 'Grid' },
			{ id: 'more-horizontal', label: 'More Horizontal' },
			{ id: 'more-vertical', label: 'More Vertical' },
			{ id: 'play', label: 'Play' },
			{ id: 'pause', label: 'Pause' },
			{ id: 'play-circle', label: 'Play Circle' },
			{ id: 'pause-circle', label: 'Pause Circle' },
			{ id: 'refresh-cw', label: 'Refresh' },
			{ id: 'rotate-cw', label: 'Rotate Clockwise' },
			{ id: 'rotate-ccw', label: 'Rotate Counter-Clockwise' },
			{ id: 'maximize', label: 'Maximize' },
			{ id: 'minimize', label: 'Minimize' },
			{ id: 'log-out', label: 'Log Out' },
			{ id: 'log-in', label: 'Log In' },
			{ id: 'user-plus', label: 'User Plus' },
			{ id: 'user-minus', label: 'User Minus' },
			{ id: 'user-check', label: 'User Check' },
			{ id: 'user-x', label: 'User X' },
			{ id: 'shield', label: 'Shield' },
			{ id: 'crown', label: 'Crown' },
			{ id: 'code', label: 'Code' },
			{ id: 'terminal', label: 'Terminal' },
			{ id: 'bug', label: 'Bug' },
			{ id: 'wrench', label: 'Wrench' },
			{ id: 'pie-chart', label: 'Pie Chart' },
			{ id: 'bar-chart', label: 'Bar Chart' },
			{ id: 'line-chart', label: 'Line Chart' },
			{ id: 'database', label: 'Database' },
			{ id: 'server', label: 'Server' },
			{ id: 'cloud', label: 'Cloud' },
			{ id: 'wifi', label: 'WiFi' },
			{ id: 'rss', label: 'RSS' },
			{ id: 'send', label: 'Send' },
			{ id: 'reply', label: 'Reply' },
			{ id: 'reply-all', label: 'Reply All' },
			{ id: 'square-plus', label: 'Square Plus' },
			{ id: 'square-minus', label: 'Square Minus' },
			{ id: 'sun', label: 'Sun' },
			{ id: 'moon', label: 'Moon' },
			{ id: 'smile', label: 'Smile' },
			{ id: 'frown', label: 'Frown' },
			{ id: 'thumbs-up', label: 'Thumbs Up' },
			{ id: 'thumbs-down', label: 'Thumbs Down' },
			{ id: 'graduation-cap', label: 'Graduation Cap' },
			{ id: 'book', label: 'Book' },
			{ id: 'newspaper', label: 'Newspaper' },
			{ id: 'gift', label: 'Gift' },
			{ id: 'shopping-cart', label: 'Shopping Cart' },
			{ id: 'credit-card', label: 'Credit Card' },
			{ id: 'smartphone', label: 'Smartphone' },
			{ id: 'tablet', label: 'Tablet' },
			{ id: 'laptop', label: 'Laptop' },
			{ id: 'monitor', label: 'Monitor' },
			{ id: 'tv', label: 'TV' },
			{ id: 'headphones', label: 'Headphones' },
			{ id: 'mic', label: 'Microphone' },
			{ id: 'mic-off', label: 'Microphone Off' },
			{ id: 'volume-2', label: 'Volume' },
			{ id: 'volume-x', label: 'Volume Off' },
			{ id: 'circle-dot', label: 'Circle Dot' },
		];
	};

	/**
	 * Refresh all lucide icons on the page
	 * Call this after dynamically adding new icons
	 */
	lucideHelper.refresh = function () {
		if (window.lucide && window.lucide.createIcons) {
			window.lucide.createIcons();
		}
	};

	// Initialize on module load
	$(document).ready(function () {
		lucideHelper.init().catch(err => {
			console.error('[Lucide] Initialization failed:', err);
		});
	});

	return lucideHelper;
});

