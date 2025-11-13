<div class="{{{ if config.theme.stickyToolbar }}}sticky-tools{{{ end }}} mb-3" style="top: {{{ if (config.theme.topMobilebar && !config.theme.autohideBottombar) }}}var(--panel-offset){{{ else }}}0{{{ end }}};">
	<nav class="topic-list-header d-flex flex-nowrap my-2 p-0 border-0 rounded">
		<div class="d-flex flex-row p-2 text-bg-light gap-3 border rounded w-100 align-items-center">
			{{{ if template.category }}}
			<div class="d-flex align-items-center gap-2 me-auto">
				<span class="speek-badge speek-badge-posts">
					{humanReadableNumber(totalPostCount, 0)} posts
				</span>
				{{{ if config.loggedIn }}}
				<span class="speek-badge speek-badge-new">{unreadCount} new</span>
				{{{ end }}}
			</div>
			{{{ end }}}

			<div class="d-flex align-items-center gap-3 ms-auto">
				<div component="category/controls" class="d-flex mb-0 gap-2 flex-wrap justify-content-end">
					{{{ if (template.category || template.world) }}}
					<!-- IMPORT partials/category/watch.tpl -->
					<!-- Tags filter hidden for Speek design -->
					<!-- IMPORT partials/category/sort.tpl -->
					{{{ end }}}
					{{{ if (template.popular || template.top)}}}
					<!-- IMPORT partials/topic-terms.tpl -->
					{{{ end }}}
					{{{ if (template.unread || (template.recent || (template.popular || template.top))) }}}
					<!-- IMPORT partials/topic-filters.tpl -->
					<!-- IMPORT partials/category/filter-dropdown-left.tpl -->
					<!-- Tags filter hidden for Speek design -->
					{{{ end }}}
					{{{ if template.unread }}}
					<div class="markread btn-group {{{ if !topics.length }}}hidden{{{ end }}}">
						<!-- IMPORT partials/category/selector-dropdown-left.tpl -->
					</div>
					{{{ end }}}
					{{{ if template.tag }}}
					<!-- IMPORT partials/category/filter-dropdown-left.tpl -->
					<!-- IMPORT partials/tags/watch.tpl -->
					{{{ end }}}
					<!-- Tools dropdown hidden for Speek design -->
					<!-- RSS feed hidden for Speek design -->

					<a href="{{{ if (template.category || template.world) }}}{url}{{{ else }}}{config.relative_path}/{selectedFilter.url}{querystring}{{{ end }}}" class="btn btn-secondary fw-semibold position-absolute top-100 translate-middle-x start-50 mt-1 hide" style="--bs-btn-padding-y: .25rem; --bs-btn-padding-x: .5rem; --bs-btn-font-size: .75rem;" id="new-topics-alert">
						<i class="fa fa-fw fa-arrow-up"></i> [[recent:load-new-posts]]
					</a>
				</div>

				<div class="d-flex gap-1 align-items-center">
					{{{ if (template.category || template.world) }}}
						{{{ if privileges.topics:create }}}
						<a href="{config.relative_path}/compose?cid={cid}" component="category/post" id="new_topic" class="btn btn-primary text-nowrap" data-ajaxify="false" role="button">
							{buildLucideIcon("plus", 20, "speek-btn-icon")}
							<span>New post</span>
						</a>
						{{{ end }}}
					{{{ else }}}
						{{{ if canPost }}}
						<!-- IMPORT partials/buttons/newTopic.tpl -->
						{{{ end }}}
					{{{ end }}}
					<!-- only show login button if not logged in and doesn't have any posting privilege -->
					{{{ if (!loggedIn && (!privileges.topics:create && !canPost))}}}
					<a component="category/post/guest" href="{config.relative_path}/login" class="btn btn-sm btn-primary">[[category:guest-login-post]]</a>
					{{{ end }}}
				</div>
			</div>
		</div>
	</nav>
</div>