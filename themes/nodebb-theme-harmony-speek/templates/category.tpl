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

<div class="row flex-fill mt-3">
	<div class="category d-flex flex-column col-12">
		{{{ if (topics.length || privileges.topics:create) }}}
		<!-- IMPORT partials/topic-list-bar.tpl -->
		{{{ end }}}

		{{{ if topics.length }}}
		<!-- IMPORT partials/topics_list.tpl -->
		{{{ end }}}

		<!-- Recent Conversations Carousel -->
		<!-- Recent Conversations Carousel hidden for now -->
		<!-- Other Spaces Carousel hidden for now -->
	</div>
</div>
