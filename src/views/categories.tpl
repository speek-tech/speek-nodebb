<!-- IMPORT partials/category/selector-dropdown.tpl -->

<div class="categories-page">
	<div class="categories-grid">
		{{{each categories}}}
		{{{ if !categories.disabled }}}
		<div class="category-card" data-cid="{categories.cid}">
			<div class="category-icon-container">
				{buildLucideIcon(getCategoryIconName(categories.cid), 24)}
			</div>
			
			<div class="category-content">
				<div class="category-title-section">
					<h2 class="category-title">{categories.name}</h2>
					{{{ if categories.descriptionParsed }}}
					<p class="category-description">{categories.descriptionParsed}</p>
					{{{ end }}}
				</div>
				
				<div class="category-badges">
					<span class="badge badge-posts">
						{{{ if categories.topic_count }}}{categories.topic_count}{{{ else }}}0{{{ end }}} {{{ if categories.topic_count }}}posts{{{ else }}}post{{{ end }}}
					</span>
					{{{ if categories.unread }}}
					<span class="badge badge-new">
						{{{ if categories.numRecentReplies }}}{categories.numRecentReplies}{{{ else }}}1{{{ end }}} new
					</span>
					{{{ end }}}
				</div>
			</div>
			
			<a href="{config.relative_path}/category/{categories.slug}" class="btn-view-space">
				View space
				{buildLucideIcon("arrow-right", 16, "ms-1")}
			</a>
		</div>
		{{{ end }}}
		{{{ end }}}
	</div>

	{{{ if pagination.pages.length }}}
	<div class="pagination-container">
		<!-- IMPORT partials/paginator.tpl -->
	</div>
	{{{ end }}}
</div>

