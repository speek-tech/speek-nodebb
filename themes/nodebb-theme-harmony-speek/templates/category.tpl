<!-- IMPORT partials/breadcrumbs-json-ld.tpl -->
<!-- Breadcrumbs hidden for iframe layout -->

<!-- Category Header with Back Button -->
<div class="speek-category-header">
	<div class="speek-header-content">
		{{{ if ./parentCid }}}
		<a href="{config.relative_path}/category/{./parentCid}" class="speek-back-button">
			<i class="fa fa-arrow-left"></i>
			<span>Back</span>
		</a>
		{{{ else }}}
		<a href="{config.relative_path}/categories" class="speek-back-button">
			<i class="fa fa-arrow-left"></i>
			<span>Back</span>
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
		{{{ if recentConversations.length }}}
		<div class="speek-carousel-section speek-recent-conversations">
			<div class="speek-carousel-header">
				<div class="speek-carousel-title-area">
					<h2 class="speek-section-title">Recent conversations</h2>
					<p class="speek-section-description">Browse recent posts from other spaces and join the conversation.</p>
				</div>
				<div class="speek-carousel-nav">
					<button class="speek-carousel-btn speek-carousel-prev">
						<i class="fa fa-chevron-left"></i>
					</button>
					<button class="speek-carousel-btn speek-carousel-next">
						<i class="fa fa-chevron-right"></i>
					</button>
				</div>
			</div>
			<div class="speek-carousel-container">
				<ul class="speek-carousel-track topics-list list-unstyled">
					{{{ each recentConversations }}}
					<li component="category/topic" class="speek-post-card category-item" data-tid="{./tid}">
						<!-- Space Badge -->
						{{{ if ./category.name }}}
						<div class="speek-space-badge">{./category.name}</div>
						{{{ end }}}
						
						<!-- User Info -->
						<div class="speek-post-card-header">
							<a href="{config.relative_path}/user/{./user.userslug}" class="speek-user-avatar">
								{buildAvatar(./user, "48px", true, "avatar-rounded")}
							</a>
							<div class="speek-user-info">
								<a href="{config.relative_path}/user/{./user.userslug}" class="speek-user-name">{./user.displayname}</a>
								<div class="speek-post-timestamp">
									<span class="timeago" title="{./timestampISO}"></span>
								</div>
							</div>
						</div>
						
						<!-- Content -->
						<div class="speek-post-card-content">
							<a href="{config.relative_path}/topic/{./slug}" class="speek-post-link">
								<h3 class="speek-post-title">{./title}</h3>
								{{{ if ./teaser.content }}}
								<p class="speek-post-preview">{./teaser.content}</p>
								{{{ end }}}
							</a>
						</div>
						
						<!-- Reactions -->
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
					{{{ end }}}
				</ul>
			</div>
		</div>
		{{{ end }}}

		<!-- Other Spaces Carousel -->
		{{{ if relatedSpaces.length }}}
		<div class="speek-carousel-section speek-other-spaces">
			<div class="speek-carousel-header">
				<div class="speek-carousel-title-area">
					<h2 class="speek-section-title">Other spaces</h2>
				</div>
				<div class="speek-carousel-nav">
					<button class="speek-carousel-btn speek-carousel-prev">
						<i class="fa fa-chevron-left"></i>
					</button>
					<button class="speek-carousel-btn speek-carousel-next">
						<i class="fa fa-chevron-right"></i>
					</button>
				</div>
			</div>
			<div class="speek-carousel-container">
				<ul class="speek-carousel-track list-unstyled">
					{{{ each relatedSpaces }}}
					<li class="speek-space-card" data-cid="{./cid}">
						<div class="speek-space-icon-container">
							{buildCategoryIcon(@value, "24px", "speek-space-icon")}
						</div>
						<div class="speek-space-content">
							<h3 class="speek-space-title">
								<a href="{config.relative_path}/category/{./slug}">{./name}</a>
							</h3>
							{{{ if ./descriptionParsed }}}
							<p class="speek-space-description">{./descriptionParsed}</p>
							{{{ end }}}
						</div>
						<div class="speek-space-badges">
							<span class="speek-badge speek-badge-posts">{humanReadableNumber(./totalTopicCount)} posts</span>
							{{{ if ./unreadCount }}}
							<span class="speek-badge speek-badge-new">{./unreadCount} new</span>
							{{{ end }}}
						</div>
						<a href="{config.relative_path}/category/{./slug}" class="speek-btn speek-btn-outline speek-btn-view-space">
							<span>View space</span>
							<i class="fa fa-arrow-right"></i>
						</a>
					</li>
					{{{ end }}}
				</ul>
			</div>
		</div>
		{{{ end }}}
	</div>
</div>
