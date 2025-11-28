{{{ if (!./index && widgets.mainpost-header.length) }}}
<div data-widget-area="mainpost-header">
	{{{ each widgets.mainpost-header }}}
	{widgets.mainpost-header.html}
	{{{ end }}}
</div>
{{{ end }}}
{{{ if (./parent && !hideParent) }}}
<!-- IMPORT partials/topic/post-parent.tpl -->
{{{ end }}}
<div class="speek-post-card speek-topic-post-card{{{ if ./parent }}} speek-reply-card{{{ end }}}{{{ if ./index }}} speek-reply-card{{{ end }}}" component="post" data-pid="{./pid}" data-uid="{./uid}" itemprop="author" itemscope itemtype="https://schema.org/Person">
	<meta itemprop="name" content="{./user.displayname}">
	{{{ if ./user.userslug }}}<meta itemprop="url" content="{config.relative_path}/user/{./user.userslug}">{{{ end }}}
	
	<!-- User Info Section -->
	<div class="speek-post-card-header" style={{backgroundColor}}>
		<div class="speek-user-avatar position-relative" aria-hidden="true">
			{buildAvatar(posts.user, "48px", true, "", "user/picture")}
			{{{ if ./user.isLocal }}}
			<span component="user/status" class="position-absolute top-100 start-100 border border-white border-2 rounded-circle status {posts.user.status}"><span class="visually-hidden">[[global:{posts.user.status}]]</span></span>
			{{{ else }}}
			<span component="user/locality" class="position-absolute top-100 start-100 lh-1 border border-white border-2 rounded-circle small" title="[[global:remote-user]]">
				<span class="visually-hidden">[[global:remote-user]]</span>
				<i class="fa fa-globe"></i>
			</span>
			{{{ end }}}
		</div>
		<div class="speek-user-info" aria-label="{posts.user.displayname}">
			<div class="speek-user-name">
				{posts.user.displayname}
				{{{ each posts.user.selectedGroups }}}
				{{{ if posts.user.selectedGroups.slug }}}
				<!-- IMPORT partials/groups/badge.tpl -->
				{{{ end }}}
				{{{ end }}}
				{{{ if posts.user.banned }}}
				<span class="badge bg-danger rounded-1">[[user:banned]]</span>
				{{{ end }}}
			</div>
			<div class="speek-post-timestamp">
				<span class="timeago" title="{./timestampISO}"></span>
				{{{ if posts.editor.username }}}
				<i component="post/edit-indicator" class="fa fa-edit text-muted ms-1{{{ if privileges.posts:history }}} pointer{{{ end }}} edit-icon" title="[[global:edited-timestamp, {isoTimeToLocaleString(./editedISO, config.userLang)}]]"></i>
				<span data-editor="{posts.editor.userslug}" component="post/editor" class="visually-hidden">[[global:last-edited-by, {posts.editor.username}]] <span class="timeago" title="{isoTimeToLocaleString(posts.editedISO, config.userLang)}"></span></span>
				{{{ end }}}
			</div>
		</div>
	</div>

	<!-- Content Container -->
	<div class="speek-post-card-content">
		<div class="speek-post-content-wrapper">
			<!-- Post content -->
			<div class="speek-post-description content text-break" component="post/content" itemprop="text">
				{posts.content}
			</div>
			
			{{{ if posts.user.signature }}}
			<div component="post/signature" data-uid="{posts.user.uid}" class="speek-post-signature">{posts.user.signature}</div>
			{{{ end }}}
		</div>
		
	</div>

	<!-- Reaction Container - Only show for primary/main post, not replies -->
	{{{ if !./parent }}}
	{{{ if !./index }}}
	<div class="speek-post-card-footer">
		{{{ if !reputation:disabled }}}
		<div class="speek-reaction-item" component="post/likes">
			<a component="post/upvote" href="#" class="speek-reaction-link{{{ if posts.upvoted }}} active{{{ end }}}" title="[[topic:upvote-post]]">
				{buildLucideIcon("hand-heart", 24, "speek-reaction-icon")}
				<span class="speek-reaction-count" component="post/vote-count" data-votes="{posts.votes}">{{{ if posts.votes }}}{posts.votes}{{{ else }}}0{{{ end }}}</span>
			</a>
			<meta itemprop="upvoteCount" content="{posts.upvotes}">
		</div>
		{{{ end }}}
		<div class="speek-reaction-item" component="post/comments">
			{{{ if !hideReplies }}}
			<a component="post/reply-count" data-target-component="post/replies/container" href="#" class="speek-reaction-link" title="[[topic:replies]]">
				{buildLucideIcon("message-square", 24, "speek-reaction-icon")}
				<span class="speek-reaction-count" component="post/reply-count/text" data-replies="{{{ if ./replyCount }}}{./replyCount}{{{ else if ./replies.count }}}{./replies.count}{{{ else }}}0{{{ end }}}">{{{ if ./replyCount }}}{./replyCount}{{{ else if ./replies.count }}}{./replies.count}{{{ else }}}0{{{ end }}}</span>
			</a>
			{{{ else }}}
			<span class="speek-reaction-link">
				{buildLucideIcon("message-square", 24, "speek-reaction-icon")}
				<span class="speek-reaction-count" component="post/reply-count/text" data-replies="{{{ if ./replyCount }}}{./replyCount}{{{ else if ./replies.count }}}{./replies.count}{{{ else }}}0{{{ end }}}">{{{ if ./replyCount }}}{./replyCount}{{{ else if ./replies.count }}}{./replies.count}{{{ else }}}0{{{ end }}}</span>
			</span>
			{{{ end }}}
		</div>
		
		<!-- No admin controls in footer - using content area controls instead -->
	</div>
	{{{ end }}}
	{{{ end }}}

	{{{ if privileges.isAdminOrMod }}}
	<!-- Action buttons for moderators/admins -->
	<div component="post/actions" class="speek-post-actions">
		<a component="post/reply" href="#" class="btn btn-ghost btn-sm {{{ if !privileges.topics:reply }}}hidden{{{ end }}}" title="[[topic:reply]]"><i class="fa fa-fw fa-reply text-primary"></i></a>
		<a component="post/quote" href="#" class="btn btn-ghost btn-sm {{{ if !privileges.topics:reply }}}hidden{{{ end }}}" title="[[topic:quote]]"><i class="fa fa-fw fa-quote-right text-primary"></i></a>
		{{{ if ./announces }}}
		<a component="post/announce-count" href="#" class="btn btn-ghost btn-sm d-flex gap-2 align-items-center" title="[[topic:announcers]]"><i class="fa fa-share-alt text-primary"></i> {./announces}</a>
		{{{ end }}}
		{{{ if !downvote:disabled && !reputation:disabled }}}
		<a component="post/downvote" href="#" class="btn btn-ghost btn-sm{{{ if posts.downvoted }}} downvoted{{{ end }}}" title="[[topic:downvote-post]]">
			<i class="fa fa-fw fa-chevron-down text-primary"></i>
		</a>
		{{{ end }}}
		<meta itemprop="downvoteCount" content="{posts.downvotes}">
		<!-- IMPORT partials/topic/post-menu.tpl -->
	</div>
	{{{ end }}}

	<!-- Replies container -->
	<div component="post/replies/container" class="speek-post-replies-container my-2 hidden-empty"></div>
</div>

{{{ if (!./index && widgets.mainpost-footer.length) }}}
<div data-widget-area="mainpost-footer">
	{{{ each widgets.mainpost-footer }}}
	{widgets.mainpost-footer.html}
	{{{ end }}}
</div>
{{{ end }}}