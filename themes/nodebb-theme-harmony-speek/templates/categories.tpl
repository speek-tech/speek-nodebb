<!-- IMPORT partials/category-global-search.tpl -->

<div data-widget-area="header">
	{{{ each widgets.header }}}
	{{widgets.header.html}}
	{{{ end }}}
</div>
<div class="row flex-fill">
	<div class="{{{ if widgets.sidebar.length }}}col-lg-9 col-sm-12{{{ else }}}col-lg-12{{{ end }}}">
		{{{ if pagination.pages.length }}}
		<div class="categories-selector-container"><!-- IMPORT partials/category/selector-dropdown-left.tpl --></div>
		{{{ end }}}

		<div class="categories-page" itemscope itemtype="http://www.schema.org/ItemList">
			<div class="categories-grid" role="list">
				{{{ each categories }}}
				{{{ if !./disabled }}}
				<article component="categories/category" data-cid="{./cid}" class="category-card category-{./cid} {./unread-class}" itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
					<meta itemprop="name" content="{./name}">

					<div class="category-icon-container">
						{{{ if getCategoryIconName(./cid) }}}
						{buildLucideIcon(getCategoryIconName(./cid), 24)}
						{{{ else }}}
						{buildCategoryIcon(@value, "40px", "rounded-1")}
						{{{ end }}}
					</div>

					<div class="category-content">
						<div class="category-title-section">
							<h2 class="category-title">
								{{{ if ./isSection }}}
								{./name}
								{{{ else }}}
								<a href="{{{ if ./link }}}{./link}{{{ else }}}{config.relative_path}/category/{./slug}{{{ end }}}" itemprop="url" class="text-reset">
									{./name}
								</a>
								{{{ end }}}
							</h2>
							{{{ if ./descriptionParsed }}}
							<p class="category-description">{./descriptionParsed}</p>
							{{{ end }}}
						</div>

						{{{ if !./isSection }}}
						<div class="category-badges">
							<span class="badge badge-posts">
								{humanReadableNumber(./totalTopicCount, 0)} [[global:topics]]
							</span>
							{{{ if ./numRecentReplies }}}
							<span class="badge badge-new">
								[[speek:categories.new-posts, {./numRecentReplies}]]
							</span>
							{{{ end }}}
						</div>
						{{{ end }}}

						{{{ if !config.hideSubCategories }}}
						{{{ if ./children.length }}}
						<ul class="category-children">
							{{{ each ./children }}}
							{{{ if !./isSection }}}
							<li data-cid="{./cid}">
								<a href="{{{ if ./link }}}{./link}{{{ else }}}{config.relative_path}/category/{./slug}{{{ end }}}" class="text-reset fw-semibold">
									{./name}
								</a>
							</li>
							{{{ end }}}
							{{{ end }}}
						</ul>
						{{{ end }}}
						{{{ end }}}
					</div>

					{{{ if !./isSection }}}
					<a href="{{{ if ./link }}}{./link}{{{ else }}}{config.relative_path}/category/{./slug}{{{ end }}}" class="btn-view-space" aria-label="[[speek:categories.view-space-aria, {./name}]]">
						<span class="btn-view-space__label">[[speek:categories.view-space]]</span>
						{buildLucideIcon("arrow-right", 16, "ms-1")}
					</a>
					{{{ end }}}
				</article>
				{{{ end }}}
				{{{ end }}}
			</div>

			{{{ if pagination.pages.length }}}
			<div class="pagination-container">
				<!-- IMPORT partials/paginator.tpl -->
			</div>
			{{{ end }}}
		</div>
	</div>
	<div data-widget-area="sidebar" class="col-lg-3 col-sm-12 {{{ if !widgets.sidebar.length }}}hidden{{{ end }}}">
		{{{ each widgets.sidebar }}}
		{{widgets.sidebar.html}}
		{{{ end }}}
	</div>
</div>
<div data-widget-area="footer">
	{{{ each widgets.footer }}}
	{{widgets.footer.html}}
	{{{ end }}}
</div>
