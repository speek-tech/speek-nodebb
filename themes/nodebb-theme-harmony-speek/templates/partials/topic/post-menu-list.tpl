{{{ if posts.display_edit_tools }}}
{{{ if posts.selfPost }}}
<li>
	<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" component="post/edit" role="menuitem" href="#">
		<span class="menu-icon">{buildLucideIcon("pencil", 16, "")}</span> [[topic:edit]]
	</a>
</li>
{{{ end }}}
{{{ end }}}

{{{ if posts.display_delete_tools }}}
<li>
	<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" component="post/delete" role="menuitem" href="#">
		<span class="menu-icon">{buildLucideIcon("trash-2", 16, "")}</span> [[topic:delete]]
	</a>
</li>
{{{ end }}}

{{{ if posts.display_flag_tools }}}
<li {{{ if posts.flags.flagged }}}hidden{{{ end }}}>
	<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" component="post/flag" role="menuitem" href="#">
		<span class="menu-icon">{buildLucideIcon("flag", 16, "")}</span> [[topic:flag-content]]
	</a>
</li>
<li {{{ if !posts.flags.flagged }}}hidden{{{ end }}} class="disabled text-secondary">
	<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" component="post/already-flagged" role="menuitem" href="#" data-flag-id="{posts.flags.flagId}">
		<span class="menu-icon">{buildLucideIcon("flag", 16, "")}</span> [[topic:already-flagged]]
	</a>
</li>

{{{ if (!posts.selfPost && posts.uid) }}}
<li>
	<a class="dropdown-item rounded-1 d-flex align-items-center gap-2" component="post/flagUser" role="menuitem" href="#">
		<span class="menu-icon">{buildLucideIcon("flag", 16, "")}</span> [[topic:flag-user]]
	</a>
</li>
{{{ end }}}
{{{ end }}}

