{{{ if config.loggedIn }}}
<div class="category-pill category-watch bottom-sheet" component="topic/watch">
	<button
		class="category-pill__trigger dropdown-toggle"
		data-bs-toggle="dropdown"
		type="button"
		aria-haspopup="true"
		aria-expanded="false"
	>
		<span class="category-watch__current">
			<span component="category/watching/menu" class="category-watch__state{{{ if !./isWatched }}} hidden{{{ end }}}">
				<span class="category-pill__icon" aria-hidden="true"><i class="fa fa-bell"></i></span>
				<span class="category-watch__state-label">[[category:watching]]</span>
			</span>

			<span component="category/tracking/menu" class="category-watch__state{{{ if !./isTracked }}} hidden{{{ end }}}">
				<span class="category-pill__icon" aria-hidden="true"><i class="fa fa-inbox"></i></span>
				<span class="category-watch__state-label">[[category:tracking]]</span>
			</span>

			<span component="category/notwatching/menu" class="category-watch__state{{{ if !./isNotWatched }}} hidden{{{ end }}}">
				<span class="category-pill__icon" aria-hidden="true"><i class="fa fa-clock-o"></i></span>
				<span class="category-watch__state-label">[[category:not-watching]]</span>
			</span>

			<span component="category/ignoring/menu" class="category-watch__state{{{ if !./isIgnored }}} hidden{{{ end }}}">
				<span class="category-pill__icon" aria-hidden="true"><i class="fa fa-eye-slash"></i></span>
				<span class="category-watch__state-label">[[category:ignoring]]</span>
			</span>
		</span>
		<span class="category-pill__caret" aria-hidden="true"><i class="fa fa-chevron-down"></i></span>
	</button>

	<ul class="dropdown-menu category-pill__menu {{{ if template.account/categories }}}dropdown-menu-end{{{ end }}} category-watch__menu" role="menu">
		<li>
			<a class="dropdown-item category-pill__option category-watch__option" href="#" component="category/watching" data-state="watching" role="menuitem">
				<span class="category-watch__option-content">
					<span class="category-watch__option-icon"><i class="fa fa-bell"></i></span>
					<span class="category-watch__option-text">
						<span class="category-watch__option-title">[[category:watching]]</span>
						<span class="category-watch__option-description">[[category:watching.description]]</span>
					</span>
				</span>
				<i component="category/watching/check" class="category-pill__option-check fa fa-fw {{{ if ./isWatched }}}fa-check{{{ end }}}"></i>
			</a>
		</li>

		<li>
			<a class="dropdown-item category-pill__option category-watch__option" href="#" component="category/tracking" data-state="tracking" role="menuitem">
				<span class="category-watch__option-content">
					<span class="category-watch__option-icon"><i class="fa fa-inbox"></i></span>
					<span class="category-watch__option-text">
						<span class="category-watch__option-title">[[category:tracking]]</span>
						<span class="category-watch__option-description">[[category:tracking.description]]</span>
					</span>
				</span>
				<i component="category/tracking/check" class="category-pill__option-check fa fa-fw {{{ if ./isTracked }}}fa-check{{{ end }}}"></i>
			</a>
		</li>

		<li>
			<a class="dropdown-item category-pill__option category-watch__option" href="#" component="category/notwatching" data-state="notwatching" role="menuitem">
				<span class="category-watch__option-content">
					<span class="category-watch__option-icon"><i class="fa fa-clock-o"></i></span>
					<span class="category-watch__option-text">
						<span class="category-watch__option-title">[[category:not-watching]]</span>
						<span class="category-watch__option-description">[[category:not-watching.description]]</span>
					</span>
				</span>
				<i component="category/notwatching/check" class="category-pill__option-check fa fa-fw {{{ if ./isNotWatched }}}fa-check{{{ end }}}"></i>
			</a>
		</li>

		<li>
			<a class="dropdown-item category-pill__option category-watch__option" href="#" component="category/ignoring" data-state="ignoring" role="menuitem">
				<span class="category-watch__option-content">
					<span class="category-watch__option-icon"><i class="fa fa-eye-slash"></i></span>
					<span class="category-watch__option-text">
						<span class="category-watch__option-title">[[category:ignoring]]</span>
						<span class="category-watch__option-description">[[category:ignoring.description]]</span>
					</span>
				</span>
				<i component="category/ignoring/check" class="category-pill__option-check fa fa-fw {{{ if ./isIgnored }}}fa-check{{{ end }}}"></i>
			</a>
		</li>
	</ul>
</div>
{{{ end }}}