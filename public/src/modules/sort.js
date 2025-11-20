'use strict';


define('sort', ['components'], function (components) {
	const module = {};

	module.handleSort = function (field, gotoOnSave) {
		const threadSort = components.get('thread/sort');
		threadSort.find('i').removeClass('fa-check');
		const currentSort = utils.params().sort || config[field];
		const currentSetting = threadSort.find('a[data-sort="' + currentSort + '"]');
		currentSetting.find('i').addClass('fa-check');

		// Remove old handlers
		$('body').off('click', '[component="thread/sort"] a[data-sort]');
		
		// Attach click handler with higher priority
		$('body').on('click', '[component="thread/sort"] a[data-sort]', function (e) {
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			
			const newSetting = $(this).attr('data-sort');
			const urlParams = utils.params();
			urlParams.sort = newSetting;
			const qs = $.param(urlParams);
			
			// Close dropdown by removing show class
			const dropdownMenu = $(this).closest('.dropdown-menu');
			const btnGroup = $(this).closest('.btn-group');
			if (btnGroup.length) {
				const toggle = btnGroup.find('.dropdown-toggle');
				if (toggle.length) {
					toggle.removeClass('show').attr('aria-expanded', 'false');
					dropdownMenu.removeClass('show');
				}
			}
			
			ajaxify.go(gotoOnSave + (qs ? '?' + qs : ''));
			return false;
		});
	};

	return module;
});
