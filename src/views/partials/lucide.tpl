<div class="icon-container">
	<div class="form-group">
		<label class="form-label" for="lucide-filter">Type to search for icons</label>
		<input type="text" class="form-control" id="lucide-filter" data-action="filter" placeholder="e.g. home, users, message" />
	</div>
	<div class="d-flex lucide-icons-grid flex-wrap gap-2 p-3" style="max-height: 400px; overflow-y: auto;">
		{{{ each icons }}}
			<i data-lucide="{icons.id}" data-icon="{icons.id}" class="lucide-icon p-2 rounded-1" style="width: 48px; height: 48px; display: inline-flex; align-items: center; justify-content: center; border: 2px solid transparent; cursor: pointer;" title="{icons.label}"></i>
		{{{ end }}}
	</div>
	<p class="form-text text-center mt-3">
		For a full list of icons, please consult:
		<a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer">Lucide Icons</a>
	</p>
	<style>
		.lucide-icon {
			transition: all 0.2s ease;
		}
		.lucide-icon:hover {
			background-color: rgba(0, 0, 0, 0.05);
			border-color: var(--bs-primary, #007bff) !important;
			transform: scale(1.1);
		}
		.lucide-icon.selected {
			background-color: rgba(0, 123, 255, 0.1);
			border-color: var(--bs-primary, #007bff) !important;
		}
		.lucide-icon svg {
			width: 24px;
			height: 24px;
		}
	</style>
</div>

