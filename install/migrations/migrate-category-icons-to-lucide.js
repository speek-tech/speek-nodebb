'use strict';

const db = require('../../src/database');
const batch = require('../../src/batch');

module.exports = {
	name: 'Migrate category icons from FontAwesome to Lucide',
	timestamp: Date.UTC(2025, 0, 6), // January 6, 2025
	method: async function () {
		const { progress } = this;

		// FontAwesome to Lucide icon mapping
		const faToLucideMap = {
			'fa-home': 'home',
			'fa-user': 'user',
			'fa-users': 'users',
			'fa-cog': 'settings',
			'fa-gear': 'settings',
			'fa-settings': 'settings',
			'fa-search': 'search',
			'fa-envelope': 'mail',
			'fa-bell': 'bell',
			'fa-heart': 'heart',
			'fa-star': 'star',
			'fa-bars': 'menu',
			'fa-navicon': 'menu',
			'fa-times': 'x',
			'fa-xmark': 'x',
			'fa-close': 'x',
			'fa-check': 'check',
			'fa-plus': 'plus',
			'fa-minus': 'minus',
			'fa-trash': 'trash-2',
			'fa-trash-can': 'trash-2',
			'fa-edit': 'edit',
			'fa-pen': 'pen',
			'fa-pen-to-square': 'pen-square',
			'fa-square-pen': 'pen-square',
			'fa-pencil': 'pencil',
			'fa-share': 'share-2',
			'fa-share-from-square': 'share-2',
			'fa-arrow-right': 'arrow-right',
			'fa-arrow-left': 'arrow-left',
			'fa-arrow-up': 'arrow-up',
			'fa-arrow-down': 'arrow-down',
			'fa-chevron-right': 'chevron-right',
			'fa-chevron-left': 'chevron-left',
			'fa-chevron-up': 'chevron-up',
			'fa-chevron-down': 'chevron-down',
			'fa-circle-info': 'info',
			'fa-info-circle': 'info',
			'fa-circle-question': 'help-circle',
			'fa-question-circle': 'help-circle',
			'fa-circle-exclamation': 'alert-circle',
			'fa-exclamation-circle': 'alert-circle',
			'fa-triangle-exclamation': 'alert-triangle',
			'fa-exclamation-triangle': 'alert-triangle',
			'fa-circle-check': 'check-circle',
			'fa-check-circle': 'check-circle',
			'fa-circle-xmark': 'x-circle',
			'fa-xmark-circle': 'x-circle',
			'fa-calendar': 'calendar',
			'fa-calendar-days': 'calendar-days',
			'fa-image': 'image',
			'fa-file': 'file',
			'fa-file-text': 'file-text',
			'fa-file-lines': 'file-text',
			'fa-folder': 'folder',
			'fa-folder-open': 'folder-open',
			'fa-download': 'download',
			'fa-upload': 'upload',
			'fa-cloud': 'cloud',
			'fa-database': 'database',
			'fa-server': 'server',
			'fa-code': 'code',
			'fa-terminal': 'terminal',
			'fa-bug': 'bug',
			'fa-shield': 'shield',
			'fa-lock': 'lock',
			'fa-unlock': 'unlock',
			'fa-key': 'key',
			'fa-eye': 'eye',
			'fa-eye-slash': 'eye-off',
			'fa-comment': 'message-circle',
			'fa-comments': 'messages-square',
			'fa-message': 'message-square',
			'fa-phone': 'phone',
			'fa-video': 'video',
			'fa-camera': 'camera',
			'fa-microphone': 'mic',
			'fa-mic': 'mic',
			'fa-microphone-slash': 'mic-off',
			'fa-mic-off': 'mic-off',
			'fa-volume': 'volume-2',
			'fa-volume-high': 'volume-2',
			'fa-volume-low': 'volume-1',
			'fa-volume-off': 'volume-x',
			'fa-music': 'music',
			'fa-headphones': 'headphones',
			'fa-play': 'play',
			'fa-pause': 'pause',
			'fa-stop': 'square',
			'fa-circle-play': 'play-circle',
			'fa-circle-pause': 'pause-circle',
			'fa-circle-stop': 'stop-circle',
			'fa-map': 'map',
			'fa-map-marker': 'map-pin',
			'fa-location-dot': 'map-pin',
			'fa-map-pin': 'map-pin',
			'fa-compass': 'compass',
			'fa-globe': 'globe',
			'fa-flag': 'flag',
			'fa-bookmark': 'bookmark',
			'fa-tag': 'tag',
			'fa-tags': 'tags',
			'fa-link': 'link',
			'fa-link-slash': 'link-2-off',
			'fa-paperclip': 'paperclip',
			'fa-list': 'list',
			'fa-list-ul': 'list',
			'fa-list-ol': 'list-ordered',
			'fa-table': 'table',
			'fa-chart-pie': 'pie-chart',
			'fa-chart-line': 'line-chart',
			'fa-chart-bar': 'bar-chart',
			'fa-chart-area': 'area-chart',
			'fa-trophy': 'trophy',
			'fa-gift': 'gift',
			'fa-shopping-cart': 'shopping-cart',
			'fa-shopping-bag': 'shopping-bag',
			'fa-credit-card': 'credit-card',
			'fa-money': 'dollar-sign',
			'fa-wallet': 'wallet',
			'fa-graduation-cap': 'graduation-cap',
			'fa-book': 'book',
			'fa-newspaper': 'newspaper',
			'fa-lightbulb': 'lightbulb',
			'fa-sun': 'sun',
			'fa-moon': 'moon',
			'fa-cloud-sun': 'cloud-sun',
			'fa-cloud-moon': 'cloud-moon',
			'fa-umbrella': 'umbrella',
			'fa-snowflake': 'snowflake',
			'fa-fire': 'flame',
			'fa-bolt': 'zap',
			'fa-rocket': 'rocket',
			'fa-plane': 'plane',
			'fa-car': 'car',
			'fa-bicycle': 'bike',
			'fa-building': 'building',
			'fa-building-columns': 'building-2',
			'fa-house': 'home',
			'fa-hospital': 'hospital',
			'fa-hotel': 'hotel',
			'fa-store': 'store',
			'fa-coffee': 'coffee',
			'fa-pizza': 'pizza',
			'fa-utensils': 'utensils',
			'fa-thumbs-up': 'thumbs-up',
			'fa-thumbs-down': 'thumbs-down',
			'fa-smile': 'smile',
			'fa-face-smile': 'smile',
			'fa-frown': 'frown',
			'fa-face-frown': 'frown',
			'fa-meh': 'meh',
			'fa-face-meh': 'meh',
			'fa-handshake': 'handshake',
			'fa-hand': 'hand',
			'fa-circle-dot': 'circle-dot',
			'fa-nbb-none': 'circle-dot',
			'fa-none': 'circle-dot',
		};

		// Function to convert icon name
		function convertIconName(iconName) {
			if (!iconName || iconName === '') {
				return 'circle-dot';
			}

			// Extract the first class (in case multiple classes are stored)
			const iconClass = iconName.split(' ')[0];

			// If it doesn't start with 'fa-', it might already be a Lucide icon or invalid
			if (!iconClass.startsWith('fa-')) {
				// Check if it's already a valid Lucide icon name (no conversion needed)
				// If it looks like a valid icon name (lowercase with hyphens), keep it
				if (/^[a-z][a-z0-9-]*$/.test(iconClass)) {
					return iconClass;
				}
				// Otherwise, use default
				return 'circle-dot';
			}

			// Look up in the mapping
			if (faToLucideMap[iconClass]) {
				return faToLucideMap[iconClass];
			}

			// If no mapping found, try removing 'fa-' prefix and use as-is
			// (might work if FA and Lucide names are similar)
			const withoutPrefix = iconClass.replace(/^fa-/, '');
			return withoutPrefix || 'circle-dot';
		}

		// Migration stats
		const stats = {
			total: 0,
			migrated: 0,
			alreadyLucide: 0,
			noIcon: 0,
			errors: 0,
			conversions: {},
		};

		await batch.processSortedSet('categories:cid', async (cids) => {
			await Promise.all(cids.map(async (cid) => {
				try {
					const categoryData = await db.getObject('category:' + cid);
					
					if (!categoryData) {
						return;
					}

					stats.total++;

					const currentIcon = categoryData.icon || '';

					// Skip if no icon
					if (!currentIcon || currentIcon === '') {
						stats.noIcon++;
						return;
					}

					// Skip if already a Lucide icon (no 'fa-' prefix and looks valid)
					if (!currentIcon.startsWith('fa-') && /^[a-z][a-z0-9-]*$/.test(currentIcon.split(' ')[0])) {
						stats.alreadyLucide++;
						return;
					}

					// Convert the icon
					const newIcon = convertIconName(currentIcon);

					// Store the legacy icon name for rollback purposes
					await db.setObjectField('category:' + cid, 'iconLegacy', currentIcon);
					
					// Update to new Lucide icon name
					await db.setObjectField('category:' + cid, 'icon', newIcon);

					stats.migrated++;

					// Track conversions for logging
					const conversionKey = currentIcon + ' -> ' + newIcon;
					stats.conversions[conversionKey] = (stats.conversions[conversionKey] || 0) + 1;

					progress.incr();
				} catch (err) {
					stats.errors++;
					console.error('[migration] Error migrating category ' + cid + ':', err);
				}
			}));
		}, {
			batch: 500,
			progress: progress,
		});

		// Log migration summary
		console.log('[migration] Category icon migration complete:');
		console.log('  Total categories:', stats.total);
		console.log('  Migrated:', stats.migrated);
		console.log('  Already Lucide:', stats.alreadyLucide);
		console.log('  No icon:', stats.noIcon);
		console.log('  Errors:', stats.errors);
		
		if (Object.keys(stats.conversions).length > 0) {
			console.log('\n[migration] Icon conversions:');
			Object.entries(stats.conversions).forEach(([conversion, count]) => {
				console.log('  ' + conversion + ' (' + count + 'x)');
			});
		}
	},
};

