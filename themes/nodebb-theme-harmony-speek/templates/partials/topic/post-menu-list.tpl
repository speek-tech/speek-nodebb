{{{ if posts.display_moderator_tools }}}
<li>
	<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" component="post/edit" role="menuitem" href="#">
		<span class="menu-icon"><i class="fa fa-fw text-secondary fa-pencil"></i></span> [[topic:edit]]
	</a>
</li>
{{{ if posts.display_delete_tools }}}
<li>
	<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" component="post/delete" role="menuitem" href="#">
		<span class="menu-icon"><i class="fa fa-fw text-secondary fa-trash-o"></i></span> [[topic:delete]]
	</a>
</li>
{{{ end }}}
{{{ end }}}

{{{ if !posts.deleted }}}
	{{{ if config.loggedIn }}}
	<li>
		<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" component="post/bookmark" role="menuitem" href="#" data-bookmarked="{posts.bookmarked}">
			<span class="menu-icon">
				<i component="post/bookmark/on" class="fa fa-fw text-secondary fa-bookmark {{{ if !posts.bookmarked }}}hidden{{{ end }}}"></i>
				<i component="post/bookmark/off" class="fa fa-fw text-secondary fa-bookmark-o {{{ if posts.bookmarked }}}hidden{{{ end }}}"></i>
			</span>
			<span class="bookmark-text">[[topic:bookmark]]</span>
			<span component="post/bookmark-count" class="bookmarkCount badge bg-secondary" data-bookmarks="{posts.bookmarks}">{posts.bookmarks}</span>&nbsp;
		</a>
	</li>
	{{{ end }}}
{{{ end }}}

{{{ if posts.display_flag_tools }}}
{{{ if (!posts.selfPost && posts.uid) }}}
<li>
	<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" component="post/flagUser" role="menuitem" href="#">
		<span class="menu-icon"><i class="fa fa-fw text-secondary fa-flag"></i></span> [[topic:flag-user]]
	</a>
</li>
{{{ end }}}
{{{ end }}}

