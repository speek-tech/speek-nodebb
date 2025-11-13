<ul component="category" class="topics-list speek-topics-list list-unstyled" itemscope itemtype="http://www.schema.org/ItemList" data-nextstart="{nextStart}" data-set="{set}">

	{{{ each topics }}}
	<li component="category/topic" class="category-item speek-post-card {function.generateTopicClass}" <!-- IMPORT partials/data/category.tpl -->>
		<link itemprop="url" content="{config.relative_path}/topic/{./slug}" />
		<meta itemprop="name" content="{function.stripTags, ./title}" />
		<meta itemprop="itemListOrder" content="descending" />
		<meta itemprop="position" content="{increment(./index, "1")}" />
		<a id="{./index}" data-index="{./index}" component="topic/anchor"></a>

		<!-- Simplified Card Design - Only Figma Elements -->
		<div class="speek-post-card-header">
			<a class="speek-user-avatar" href="{{{ if ./user.userslug }}}{config.relative_path}/user/{./user.userslug}{{{ else }}}#{{{ end }}}">
				{buildAvatar(./user, "48px", true)}
			</a>
			<div class="speek-user-info">
				<a href="{{{ if ./user.userslug }}}{config.relative_path}/user/{./user.userslug}{{{ else }}}#{{{ end }}}" class="speek-user-name">{./user.displayname}</a>
				<div class="speek-post-timestamp">
					<span class="timeago" title="{./timestampISO}"></span>
				</div>
			</div>
		</div>

		<div class="speek-post-card-content">
			<a href="{config.relative_path}/topic/{./slug}" class="speek-post-link">
				<h3 component="topic/header" class="speek-post-title">{./title}</h3>
				{{{ if ./teaser.content }}}
				<p class="speek-post-preview">{./teaser.content}</p>
				{{{ end }}}
			</a>
		</div>

		<div class="speek-post-card-footer">
			<div class="speek-reaction-item">
				<i class="fa fa-heart"></i>
				<span class="speek-reaction-count">{./votes}</span>
			</div>
			<div class="speek-reaction-item">
				<i class="fa fa-comment"></i>
				<span class="speek-reaction-count">{./postcount}</span>
			</div>
		</div>
	</li>
	{{{end}}}
</ul>
