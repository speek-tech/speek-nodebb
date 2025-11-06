#!/usr/bin/env node

/**
 * Icon Migration Script
 * Automates the conversion of FontAwesome icons to Lucide icons in templates
 * 
 * Usage:
 *   node scripts/migrate-icons.js --dry-run          # Preview changes
 *   node scripts/migrate-icons.js --file path.tpl    # Migrate specific file
 *   node scripts/migrate-icons.js --all              # Migrate all templates
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// FontAwesome to Lucide icon mapping
const iconMap = {
	'fa-home': 'home',
	'fa-user': 'user',
	'fa-users': 'users',
	'fa-cog': 'settings',
	'fa-gear': 'settings',
	'fa-search': 'search',
	'fa-envelope': 'mail',
	'fa-bell': 'bell',
	'fa-heart': 'heart',
	'fa-star': 'star',
	'fa-bars': 'menu',
	'fa-times': 'x',
	'fa-xmark': 'x',
	'fa-check': 'check',
	'fa-plus': 'plus',
	'fa-minus': 'minus',
	'fa-trash': 'trash-2',
	'fa-trash-can': 'trash-2',
	'fa-edit': 'edit',
	'fa-pen': 'pen',
	'fa-pen-to-square': 'pen-square',
	'fa-share': 'share-2',
	'fa-arrow-right': 'arrow-right',
	'fa-arrow-left': 'arrow-left',
	'fa-arrow-up': 'arrow-up',
	'fa-arrow-down': 'arrow-down',
	'fa-chevron-right': 'chevron-right',
	'fa-chevron-left': 'chevron-left',
	'fa-chevron-up': 'chevron-up',
	'fa-chevron-down': 'chevron-down',
	'fa-info-circle': 'info',
	'fa-circle-info': 'info',
	'fa-question-circle': 'help-circle',
	'fa-circle-question': 'help-circle',
	'fa-exclamation-circle': 'alert-circle',
	'fa-circle-exclamation': 'alert-circle',
	'fa-exclamation-triangle': 'alert-triangle',
	'fa-triangle-exclamation': 'alert-triangle',
	'fa-check-circle': 'check-circle',
	'fa-circle-check': 'check-circle',
	'fa-times-circle': 'x-circle',
	'fa-circle-xmark': 'x-circle',
	'fa-lock': 'lock',
	'fa-unlock': 'unlock',
	'fa-eye': 'eye',
	'fa-eye-slash': 'eye-off',
	'fa-calendar': 'calendar',
	'fa-clock': 'clock',
	'fa-clock-o': 'clock',
	'fa-comment': 'message-circle',
	'fa-comments': 'message-square',
	'fa-file': 'file',
	'fa-folder': 'folder',
	'fa-image': 'image',
	'fa-camera': 'camera',
	'fa-video': 'video',
	'fa-download': 'download',
	'fa-upload': 'upload',
	'fa-link': 'link',
	'fa-thumbtack': 'pin',
	'fa-bookmark': 'bookmark',
	'fa-flag': 'flag',
	'fa-tag': 'tag',
	'fa-phone': 'phone',
	'fa-phone-volume': 'phone',
	'fa-globe': 'globe',
	'fa-map-marker': 'map-pin',
	'fa-location-dot': 'map-pin',
	'fa-filter': 'filter',
	'fa-sort': 'arrow-up-down',
	'fa-sort-up': 'arrow-up',
	'fa-sort-down': 'arrow-down',
	'fa-list': 'list',
	'fa-list-ul': 'list',
	'fa-list-ol': 'list-ordered',
	'fa-play': 'play',
	'fa-pause': 'pause',
	'fa-circle-play': 'play-circle',
	'fa-circle-pause': 'pause-circle',
	'fa-refresh': 'refresh-cw',
	'fa-arrows-rotate': 'refresh-cw',
	'fa-window-maximize': 'maximize',
	'fa-right-from-bracket': 'log-out',
	'fa-sign-out': 'log-out',
	'fa-right-to-bracket': 'log-in',
	'fa-sign-in': 'log-in',
	'fa-paper-plane': 'send',
	'fa-reply': 'reply',
	'fa-reply-all': 'reply-all',
	'fa-nbb-none': 'circle-dot',
};

/**
 * Convert FontAwesome icon to Lucide helper call
 */
function convertIcon(match, fullClass, iconName, extraClasses) {
	const lucideIconName = iconMap[`fa-${iconName}`] || iconName;
	const classes = extraClasses ? extraClasses.trim() : '';
	const size = 16; // Default size
	
	if (classes) {
		return `{buildLucideIcon("${lucideIconName}", ${size}, "${classes}")}`;
	}
	return `{buildLucideIcon("${lucideIconName}", ${size})}`;
}

/**
 * Process template file
 */
function processFile(filePath, dryRun = true) {
	console.log(`\n${dryRun ? '🔍 Analyzing' : '✏️  Migrating'}: ${filePath}`);
	
	const content = fs.readFileSync(filePath, 'utf8');
	let newContent = content;
	let changes = 0;
	
	// Pattern 1: Simple icon - <i class="fa fa-{icon}"></i>
	const pattern1 = /<i class="fa fa-([\w-]+)"><\/i>/g;
	newContent = newContent.replace(pattern1, (match, iconName) => {
		changes++;
		return convertIcon(match, null, iconName, '');
	});
	
	// Pattern 2: Icon with extra classes - <i class="fa fa-{icon} {classes}"></i>
	const pattern2 = /<i class="fa fa-([\w-]+)\s+([\w\s-]+)"><\/i>/g;
	newContent = newContent.replace(pattern2, (match, iconName, extraClasses) => {
		changes++;
		return convertIcon(match, null, iconName, extraClasses);
	});
	
	// Pattern 3: Icon with fw class - <i class="fa fa-fw fa-{icon}"></i>
	const pattern3 = /<i class="fa fa-fw fa-([\w-]+)"><\/i>/g;
	newContent = newContent.replace(pattern3, (match, iconName) => {
		changes++;
		return convertIcon(match, null, iconName, '');
	});
	
	// Pattern 4: Icon with fw and extra classes
	const pattern4 = /<i class="fa fa-fw fa-([\w-]+)\s+([\w\s-]+)"><\/i>/g;
	newContent = newContent.replace(pattern4, (match, iconName, extraClasses) => {
		changes++;
		return convertIcon(match, null, iconName, extraClasses);
	});
	
	if (changes > 0) {
		console.log(`   ✓ Found ${changes} icon(s) to convert`);
		
		if (!dryRun) {
			fs.writeFileSync(filePath, newContent, 'utf8');
			console.log(`   ✓ File updated successfully`);
		} else {
			console.log(`   ℹ Run without --dry-run to apply changes`);
		}
		
		return changes;
	} else {
		console.log(`   • No icons found`);
		return 0;
	}
}

/**
 * Find all template files
 */
function findTemplateFiles(dir) {
	const files = [];
	
	function walk(directory) {
		const items = fs.readdirSync(directory);
		
		for (const item of items) {
			const fullPath = path.join(directory, item);
			const stat = fs.statSync(fullPath);
			
			if (stat.isDirectory()) {
				walk(fullPath);
			} else if (item.endsWith('.tpl')) {
				files.push(fullPath);
			}
		}
	}
	
	walk(dir);
	return files;
}

/**
 * Main function
 */
function main() {
	const args = process.argv.slice(2);
	const dryRun = !args.includes('--no-dry-run');
	const file = args.find(arg => arg.startsWith('--file='));
	const all = args.includes('--all');
	
	console.log('╔═══════════════════════════════════════════════╗');
	console.log('║   FontAwesome → Lucide Migration Script      ║');
	console.log('╚═══════════════════════════════════════════════╝');
	console.log();
	console.log(`Mode: ${dryRun ? 'DRY RUN (preview only)' : 'LIVE (will modify files)'}`);
	
	if (file) {
		// Migrate specific file
		const filePath = file.split('=')[1];
		processFile(filePath, dryRun);
	} else if (all) {
		// Migrate all templates
		console.log('\nScanning for template files...\n');
		const viewsDir = path.join(__dirname, '..', 'src', 'views');
		const files = findTemplateFiles(viewsDir);
		
		console.log(`Found ${files.length} template files\n`);
		
		let totalChanges = 0;
		let filesWithChanges = 0;
		
		for (const file of files) {
			const changes = processFile(file, dryRun);
			if (changes > 0) {
				totalChanges += changes;
				filesWithChanges++;
			}
		}
		
		console.log('\n╔═══════════════════════════════════════════════╗');
		console.log(`║  Summary                                      ║`);
		console.log('╚═══════════════════════════════════════════════╝');
		console.log(`Files processed: ${files.length}`);
		console.log(`Files with icons: ${filesWithChanges}`);
		console.log(`Total icons found: ${totalChanges}`);
		
		if (dryRun && totalChanges > 0) {
			console.log('\n💡 To apply changes, run:');
			console.log('   node scripts/migrate-icons.js --all --no-dry-run');
		}
	} else {
		// Show usage
		console.log('\nUsage:');
		console.log('  node scripts/migrate-icons.js --dry-run --all');
		console.log('  node scripts/migrate-icons.js --file=path/to/file.tpl');
		console.log('  node scripts/migrate-icons.js --all --no-dry-run');
		console.log('\nOptions:');
		console.log('  --dry-run       Preview changes without modifying files (default)');
		console.log('  --no-dry-run    Actually modify the files');
		console.log('  --all           Process all template files');
		console.log('  --file=PATH     Process specific file only');
	}
}

// Run if called directly
if (require.main === module) {
	main();
}

module.exports = { convertIcon, processFile };

