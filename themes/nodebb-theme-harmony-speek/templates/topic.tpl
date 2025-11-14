<!-- IMPORT partials/breadcrumbs-json-ld.tpl -->
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

	<div class="topic-header-container d-flex flex-column" style="gap: 16px;">
		<div class="topic-header-buttons d-flex align-items-center gap-2">
			<a href="{{{ if category.slug }}}{config.relative_path}/category/{category.slug}{{{ else }}}{config.relative_path}/{{{ end }}}" class="speek-back-button" aria-label="[[global:back]]" title="[[global:back]]">
				<span class="speek-back-button__icon">
					{buildLucideIcon("chevron-left", 20, "speek-back-button__chevron")}
				</span>
				<span class="speek-back-button__label">[[global:back]]</span>
			</a>
		</div>
		<div class="topic-header-title">
			<h1 component="post/header" class="topic-title-main">
				<span class="topic-title" component="topic/title">{title}</span>
			</h1>
		</div>
		<div class="topic-space-actions d-flex justify-content-between align-items-center" style="gap: 10px;">
			<div class="topic-badges d-flex align-items-center" style="gap: 8px;">
				{{{ if category }}}
				<a href="{config.relative_path}/category/{category.slug}" class="speek-topic-badge speek-topic-badge--category">
					<span class="speek-topic-badge__icon">
						{buildLucideIcon("message-square-heart", 12, "speek-topic-badge__icon-svg")}
					</span>
					<span class="speek-topic-badge__text">{category.name}</span>
				</a>
				{{{ end }}}
				<span class="speek-topic-badge speek-topic-badge--outline">
					<span class="speek-topic-badge__icon">
						{buildLucideIcon("message-square", 12, "speek-topic-badge__icon-svg")}
					</span>
					<span class="speek-topic-badge__text" component="topic/post-count">{humanReadableNumber(postcount)}</span>
				</span>
				<span class="speek-topic-badge speek-topic-badge--outline">
					<span class="speek-topic-badge__icon">
						{buildLucideIcon("users", 12, "speek-topic-badge__icon-svg")}
					</span>
					<span class="speek-topic-badge__text">{humanReadableNumber(postercount)}</span>
				</span>
				<span class="speek-topic-badge speek-topic-badge--outline">
					<span class="speek-topic-badge__icon">
						{buildLucideIcon("eye", 12, "speek-topic-badge__icon-svg")}
					</span>
					<span class="speek-topic-badge__text">{humanReadableNumber(viewcount)}</span>
				</span>
				{{{ if ./followercount }}}
				<span class="speek-topic-badge speek-topic-badge--outline">
					<span class="speek-topic-badge__icon">
						{buildLucideIcon("glasses", 12, "speek-topic-badge__icon-svg")}
					</span>
					<span class="speek-topic-badge__text">{humanReadableNumber(followercount)}</span>
				</span>
				{{{ end }}}
			</div>
			<div class="topic-actions d-flex align-items-center" style="gap: 16px;">
				<div class="btn-group bottom-sheet" component="thread/sort">
					<button class="speek-btn speek-btn--ghost speek-btn--lg d-flex align-items-center gap-2 dropdown-toggle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" aria-label="[[aria:post-sort-option, {sortOptionLabel}]]">
						<span class="speek-btn__icon">
							{buildLucideIcon("list-filter", 16, "speek-btn__icon-svg")}
						</span>
						<span class="speek-btn__text">{sortOptionLabel}</span>
						<span class="speek-btn__icon">
							{buildLucideIcon("chevron-down", 16, "speek-btn__icon-svg")}
						</span>
					</button>
					<ul class="dropdown-menu p-1 text-sm" role="menu">
						<li>
							<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" href="#" class="oldest_to_newest" data-sort="oldest_to_newest" role="menuitem">
								<span class="flex-grow-1">[[topic:oldest-to-newest]]</span>
								<i class="flex-shrink-0 fa fa-fw text-secondary"></i>
							</a>
						</li>
						<li>
							<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" href="#" class="newest_to_oldest" data-sort="newest_to_oldest" role="menuitem">
								<span class="flex-grow-1">[[topic:newest-to-oldest]]</span>
								<i class="flex-shrink-0 fa fa-fw text-secondary"></i>
							</a>
						</li>
						<li>
							<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" href="#" class="most_votes" data-sort="most_votes" role="menuitem">
								<span class="flex-grow-1">[[topic:most-votes]]</span>
								<i class="flex-shrink-0 fa fa-fw text-secondary"></i>
							</a>
						</li>
					</ul>
				</div>
				{{{ if privileges.topics:reply }}}
				<a href="{config.relative_path}/compose?tid={tid}" class="speek-btn speek-btn--primary speek-btn--lg d-flex align-items-center gap-2" component="topic/reply" data-ajaxify="false" role="button">
					<span class="speek-btn__icon">
						{buildLucideIcon("reply", 16, "speek-btn__icon-svg")}
					</span>
					<span class="speek-btn__text">[[topic:reply]]</span>
				</a>
				{{{ else }}}
				{{{ if loggedIn }}}
				<a href="#" component="topic/reply/locked" class="speek-btn speek-btn--primary speek-btn--lg d-flex align-items-center gap-2 disabled {{{ if !locked }}}hidden{{{ end }}}" disabled>
					<span class="speek-btn__icon">
						{buildLucideIcon("lock", 16, "speek-btn__icon-svg")}
					</span>
					<span class="speek-btn__text">[[topic:locked]]</span>
				</a>
				{{{ else }}}
				<a component="topic/reply/guest" href="{config.relative_path}/login" class="speek-btn speek-btn--primary speek-btn--lg d-flex align-items-center gap-2">
					<span class="speek-btn__icon">
						{buildLucideIcon("log-in", 16, "speek-btn__icon-svg")}
					</span>
					<span class="speek-btn__text">[[topic:guest-login-reply]]</span>
				</a>
				{{{ end }}}
				{{{ end }}}
			</div>
		</div>
		{{{ if thumbs.length }}}
		<div class="d-flex flex-wrap gap-2 align-items-start hidden-empty" component="topic/thumb/list"><!-- IMPORT partials/topic/thumbs.tpl --></div>
		{{{ end }}}
	</div>

	<div class="d-flex flex-column gap-3">

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

				<div class="posts-container" style="min-width: 0; width: 100%;">
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
