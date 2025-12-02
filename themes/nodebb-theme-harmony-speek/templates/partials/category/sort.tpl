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
			{buildLucideIcon("list-filter", 20, "category-pill__icon-svg")}
		</span>
		<span class="category-pill__label">{sortOptionLabel}</span>
		<span class="category-pill__caret" aria-hidden="true">
			{buildLucideIcon("chevron-down", 20, "category-pill__caret-icon")}
		</span>
	</button>

	<ul class="dropdown-menu category-pill__menu category-sort__menu" role="menu">
		<li>
			<a class="dropdown-item category-pill__option category-sort__option" href="#" data-sort="recently_replied" role="menuitem">
				<span class="category-pill__option-label">[[topic:recently-replied]]</span>
				<span class="category-pill__option-icon" aria-hidden="true">{buildLucideIcon("check", 16, "category-pill__option-icon-svg")}</span>
			</a>
		</li>

		<li>
			<a class="dropdown-item category-pill__option category-sort__option" href="#" data-sort="recently_created" role="menuitem">
				<span class="category-pill__option-label">[[topic:recently-created]]</span>
				<span class="category-pill__option-icon" aria-hidden="true">{buildLucideIcon("check", 16, "category-pill__option-icon-svg")}</span>
			</a>
		</li>
		<li>
			<a class="dropdown-item category-pill__option category-sort__option" href="#" data-sort="most_posts" role="menuitem">
				<span class="category-pill__option-label">[[topic:most-posts]]</span>
				<span class="category-pill__option-icon" aria-hidden="true">{buildLucideIcon("check", 16, "category-pill__option-icon-svg")}</span>
			</a>
		</li>
		<li>
			<a class="dropdown-item category-pill__option category-sort__option" href="#" data-sort="most_votes" role="menuitem">
				<span class="category-pill__option-label">[[topic:most-votes]]</span>
				<span class="category-pill__option-icon" aria-hidden="true">{buildLucideIcon("check", 16, "category-pill__option-icon-svg")}</span>
			</a>
		</li>
	</ul>
</div>