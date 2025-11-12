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

	<div class="d-flex flex-column gap-3">
		<!-- Heading Area - Figma Design -->
		<div class="posts-heading-area">
			<div class="posts-title-section">
				<div class="posts-title-wrapper">
					<button class="btn-back" onclick="history.back()" aria-label="Go back">
						{buildLucideIcon("chevron-left", 20)}
					</button>
					<h1 component="post/header" class="posts-title" component="topic/title">{title}</h1>
				</div>
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
					{{{ if browsingUsers && browsingUsers.length }}}
					<div class="post-badge post-badge-outline">
						<span class="post-badge-icon">
							{buildLucideIcon("eye", 12)}
						</span>
						<span class="post-badge-text">{browsingUsers.length}</span>
					</div>
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

		<div class="row mb-4 mb-lg-0">
			<div class="topic {{{ if widgets.sidebar.length }}}col-lg-9 col-sm-12{{{ else }}}col-lg-12{{{ end }}}">
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

				<div class="d-flex gap-0 gap-lg-5">
					<div class="posts-container" style="min-width: 0;">
						<ul component="topic" class="posts timeline list-unstyled p-0 py-3" style="min-width: 0;" data-tid="{tid}" data-cid="{cid}">
						{{{ each posts }}}
							<li component="post" class="{{{ if (./index != 0) }}}pt-4{{{ end }}} {{{ if posts.deleted }}}deleted{{{ end }}} {{{ if posts.selfPost }}}self-post{{{ end }}} {{{ if posts.topicOwnerPost }}}topic-owner-post{{{ end }}}" <!-- IMPORT partials/data/topic.tpl -->>
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
					<div class="d-flex d-none d-lg-block flex-grow-1 mt-2">
						<div class="sticky-top" style="{{{ if config.theme.topicSidebarTools }}}top:2rem;{{{ else }}}top:6rem; {{{ end }}} z-index:1;">
							<div class="d-flex flex-column gap-3 align-items-end">
								{{{ if config.theme.topicSidebarTools }}}
								<div class="d-flex flex-column gap-2" style="width: 170px;">
									<!-- IMPORT partials/topic/reply-button.tpl -->
									<!-- IMPORT partials/topic/mark-unread.tpl -->
									<!-- IMPORT partials/topic/watch.tpl -->
									<!-- IMPORT partials/topic/sort.tpl -->
									<!-- IMPORT partials/topic/tools.tpl -->
								</div>
								{{{ end }}}
								{{{ if config.theme.topicSidebarTools }}}<hr class="my-0" style="min-width: 170px;"/>{{{ end }}}
								<!-- IMPORT partials/topic/navigator.tpl -->
								{{{ if config.theme.topicSidebarTools }}}<hr class="my-0" style="min-width: 170px;" />{{{ end }}}
								{{{ if browsingUsers }}}
								<div class="d-flex flex-column ps-2 hidden-xs" style="min-width: 170px;">
								<!-- IMPORT partials/topic/browsing-users.tpl -->
								</div>
								{{{ end }}}
							</div>
						</div>
					</div>
				</div>

				{{{ if config.usePagination }}}
				<!-- IMPORT partials/paginator.tpl -->
				{{{ end }}}
			</div>
			<div data-widget-area="sidebar" class="col-lg-3 col-sm-12 {{{ if !widgets.sidebar.length }}}hidden{{{ end }}}">
			{{{each widgets.sidebar}}}
			{{widgets.sidebar.html}}
			{{{end}}}
			</div>
		</div>
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
