<!-- IMPORT partials/breadcrumbs-json-ld.tpl -->
<!-- Breadcrumbs hidden for iframe layout -->

<!-- Category Header with Back Button -->
<div class="speek-category-header">
	<div class="speek-header-content">
		{{{ if ./parentCid }}}
		<a href="{config.relative_path}/category/{./parentCid}" class="speek-back-button" aria-label="Back">
			<span class="speek-back-button__icon">
				{buildLucideIcon("chevron-left", 20, "speek-back-button__chevron")}
			</span>
			<span class="speek-back-button__label">Back</span>
		</a>
		{{{ else }}}
		<a href="{config.relative_path}/categories" class="speek-back-button" aria-label="Back">
			<span class="speek-back-button__icon">
				{buildLucideIcon("chevron-left", 20, "speek-back-button__chevron")}
			</span>
			<span class="speek-back-button__label">Back</span>
		</a>
		{{{ end }}}
		
		<div class="speek-header-main">
			<h1 class="speek-category-title">{./name}</h1>
			{{{ if ./descriptionParsed }}}
			<div class="speek-category-description">
				{./descriptionParsed}
			</div>
			{{{ end }}}
		</div>
	</div>
</div>

{{{ if widgets.header.length }}}
<div data-widget-area="header">
	{{{ each widgets.header }}}
	{{widgets.header.html}}
	{{{ end }}}
</div>
{{{ end }}}

<!-- IMPORT partials/category-specific-search.tpl -->

<div class="row flex-fill">
	<div class="category d-flex flex-column col-12">
		{{{ if (topics.length || privileges.topics:create) }}}
		  <!-- IMPORT partials/topic-list-bar.tpl -->
		{{{ end }}}

		{{{ if topics.length }}}
		<!-- IMPORT partials/topics_list.tpl -->
		{{{ else }}}
		<div class="speek-category-empty-state">
			<div class="speek-category-empty-state__icon">
				{buildLucideIcon("sparkles", 32, "speek-category-empty-state__sparkles")}
			</div>
			<div class="speek-category-empty-state__content">
				<h2 class="speek-category-empty-state__title">No conversations yet</h2>
				<p class="speek-category-empty-state__subtitle">
					Be the first to start a supportive discussion in this space.
				</p>
				<ul class="speek-category-empty-state__tips">
					<li>Share an experience or question related to {./name}.</li>
					<li>Offer encouragement or helpful resources.</li>
					<li>Remember to follow our community guidelines.</li>
				</ul>
			</div>
		</div>
		{{{ end }}}

		<!-- Recent Conversations Carousel -->
		<!-- Recent Conversations Carousel hidden for now -->
		<!-- Other Spaces Carousel hidden for now -->
	</div>
</div>
