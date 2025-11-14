<!-- IMPORT partials/breadcrumbs-json-ld.tpl -->
{{{ if config.theme.enableBreadcrumbs }}}
<!-- IMPORT partials/breadcrumbs.tpl -->
{{{ end }}}
{{{ if widgets.header.length }}}
<div data-widget-area="header">
{{{each widgets.header}}}
{{widgets.header.html}}
{{{end}}}
</div>
{{{ end }}}

<div class="flex-fill" itemid="{url}" itemscope itemtype="https://schema.org/DiscussionForumPosting">
	<meta itemprop="headline" content="{escape(titleRaw)}">
	<meta itemprop="text" content="{escape(titleRaw)}">
	<meta itemprop="url" content="{url}">
	<meta itemprop="datePublished" content="{timestampISO}">
	<meta itemprop="dateModified" content="{lastposttimeISO}">
	<div itemprop="author" itemscope itemtype="https://schema.org/Person">
		<meta itemprop="name" content="{author.username}">
		{{{ if author.userslug }}}<meta itemprop="url" content="{config.relative_path}/user/{author.userslug}">{{{ end }}}
	</div>

	<div class="posts-content-wrapper">
		<!-- Heading Area - Figma Design -->
		<div class="posts-heading-area">
			<div class="posts-title-section">
				<button class="btn-back" onclick="history.back()" aria-label="Go back">
					{buildLucideIcon("chevron-left", 20)}
				</button>
				<h1 component="post/header" class="posts-title" component="topic/title">{title}</h1>
			</div>
			
			<div class="posts-space-actions">
				<div class="posts-badges">
					{{{ if category }}}
					<div class="post-badge post-badge-default">
						<span class="post-badge-icon">
							{buildLucideIcon("message-square", 12)}
						</span>
						<span class="post-badge-text">{category.name}</span>
					</div>
					{{{ end }}}
					<div class="post-badge post-badge-outline">
						<span class="post-badge-icon">
							{buildLucideIcon("message-square", 12)}
						</span>
						<span class="post-badge-text" component="topic/post-count">{postcount}</span>
					</div>
					<div class="post-badge post-badge-outline">
						<span class="post-badge-icon">
							{buildLucideIcon("users", 12)}
						</span>
						<span class="post-badge-text">{postercount}</span>
					</div>
					<div class="post-badge post-badge-outline">
						<span class="post-badge-icon">
							{buildLucideIcon("eye", 12)}
						</span>
						<span class="post-badge-text" title="{viewcount}">{viewcount}</span>
					</div>
					{{{ if browsingUsers }}}
					{{{ if browsingUsers.length }}}
					<div class="post-badge post-badge-outline">
						<span class="post-badge-icon">
							{buildLucideIcon("eye", 12)}
						</span>
						<span class="post-badge-text">{browsingUsers.length}</span>
					</div>
					{{{ end }}}
					{{{ end }}}
				</div>
				
				<div class="posts-actions">
					<button class="btn-filter" data-action="filter" title="Filter replies">
						{buildLucideIcon("filter", 16)}
						<span class="btn-text">Oldest replies</span>
						{buildLucideIcon("chevron-down", 16)}
					</button>
					{{{ if privileges.topics:reply }}}
					<a href="{config.relative_path}/compose?tid={tid}" component="topic/reply" class="btn-reply-primary" title="[[topic:reply]]" data-ajaxify="false">
						{buildLucideIcon("reply", 16)}
						<span class="btn-text">Reply</span>
					</a>
					{{{ end }}}
				</div>
			</div>
		</div>

		<!-- Posts Frame - Figma Design -->
		<div class="posts-frame">
			<!-- IMPORT partials/post_bar.tpl -->
			{{{ if merger }}}
			<!-- IMPORT partials/topic/merged-message.tpl -->
			{{{ end }}}
			{{{ if forker }}}
			<!-- IMPORT partials/topic/forked-message.tpl -->
			{{{ end }}}
			{{{ if !scheduled }}}
			<!-- IMPORT partials/topic/deleted-message.tpl -->
			{{{ end }}}

			<ul component="topic" class="posts timeline list-unstyled p-0" style="min-width: 0;" data-tid="{tid}" data-cid="{cid}">
			{{{ each posts }}}
				<li component="post" class="{{{ if posts.deleted }}}deleted{{{ end }}} {{{ if posts.selfPost }}}self-post{{{ end }}} {{{ if posts.topicOwnerPost }}}topic-owner-post{{{ end }}}" <!-- IMPORT partials/data/topic.tpl -->>
					<a component="post/anchor" data-index="{./index}" id="{increment(./index, "1")}"></a>
					<meta itemprop="datePublished" content="{./timestampISO}">
					{{{ if ./editedISO }}}
					<meta itemprop="dateModified" content="{./editedISO}">
					{{{ end }}}

					<!-- IMPORT partials/topic/post.tpl -->
				</li>
				{{{ if (config.topicPostSort != "most_votes") }}}
				{{{ each ./events}}}<!-- IMPORT partials/topic/event.tpl -->{{{ end }}}
				{{{ end }}}
			{{{ end }}}
			</ul>
			{{{ if browsingUsers }}}
			<div class="visible-xs">
				<!-- IMPORT partials/topic/browsing-users.tpl -->
				<hr/>
			</div>
			{{{ end }}}
			{{{ if config.theme.enableQuickReply }}}
			<!-- IMPORT partials/topic/quickreply.tpl -->
			{{{ end }}}
		</div>

		{{{ if config.usePagination }}}
		<!-- IMPORT partials/paginator.tpl -->
		{{{ end }}}
	</div>
</div>

<div data-widget-area="footer">
{{{each widgets.footer}}}
{{widgets.footer.html}}
{{{end}}}
</div>

{{{ if !config.usePagination }}}
<noscript>
<!-- IMPORT partials/paginator.tpl -->
</noscript>
{{{ end }}}