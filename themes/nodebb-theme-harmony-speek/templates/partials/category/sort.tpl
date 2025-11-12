<div class="category-pill category-sort bottom-sheet" component="thread/sort">
	<button
		class="category-pill__trigger dropdown-toggle"
		data-bs-toggle="dropdown"
		type="button"
		aria-haspopup="true"
		aria-expanded="false"
		aria-label="[[aria:topic-sort-option, {sortOptionLabel}]]"
	>
		<span class="category-pill__icon" aria-hidden="true">
			<i class="fa fa-filter"></i>
		</span>
		<span class="category-pill__label">{sortOptionLabel}</span>
		<span class="category-pill__caret" aria-hidden="true">
			<i class="fa fa-chevron-down"></i>
		</span>
	</button>

	<ul class="dropdown-menu category-pill__menu category-sort__menu" role="menu">
		<li>
			<a class="dropdown-item category-pill__option category-sort__option" href="#" data-sort="recently_replied" role="menuitem">
				<span class="category-pill__option-label">[[topic:recently-replied]]</span>
				<i class="category-pill__option-icon fa fa-check" aria-hidden="true"></i>
			</a>
		</li>

		<li>
			<a class="dropdown-item category-pill__option category-sort__option" href="#" data-sort="recently_created" role="menuitem">
				<span class="category-pill__option-label">[[topic:recently-created]]</span>
				<i class="category-pill__option-icon fa fa-check" aria-hidden="true"></i>
			</a>
		</li>
		<li>
			<a class="dropdown-item category-pill__option category-sort__option" href="#" data-sort="most_posts" role="menuitem">
				<span class="category-pill__option-label">[[topic:most-posts]]</span>
				<i class="category-pill__option-icon fa fa-check" aria-hidden="true"></i>
			</a>
		</li>
		<li>
			<a class="dropdown-item category-pill__option category-sort__option" href="#" data-sort="most_votes" role="menuitem">
				<span class="category-pill__option-label">[[topic:most-votes]]</span>
				<i class="category-pill__option-icon fa fa-check" aria-hidden="true"></i>
			</a>
		</li>
		<li>
			<a class="dropdown-item category-pill__option category-sort__option" href="#" data-sort="most_views" role="menuitem">
				<span class="category-pill__option-label">[[topic:most-views]]</span>
				<i class="category-pill__option-icon fa fa-check" aria-hidden="true"></i>
			</a>
		</li>
	</ul>
</div>