

			</div><!-- /.container#content -->
		</main>
		<!-- IMPORT partials/sidebar-right.tpl -->
	</div>
	{{{ if !config.theme.topMobilebar }}}
	<!-- IMPORT partials/mobile-footer.tpl -->
	{{{ else }}}
	<div class="fixed-bottom d-lg-none">
		<!-- IMPORT partials/topic/navigator-mobile.tpl -->
	</div>
	{{{ end }}}

	{{{ if !isSpider }}}
	<div>
		<div component="toaster/tray" class="alert-window fixed-bottom mb-5 mb-md-2 me-2 me-md-5 ms-auto" style="width:300px; z-index: 1090;">
			<!-- IMPORT partials/reconnect-alert.tpl -->
		</div>
	</div>
	{{{ end }}}

	<!-- IMPORT partials/footer/js.tpl -->
	<!-- IMPORT partials/url-change-notifier.tpl -->
	<!-- IMPORT partials/iframe-height-notifier.tpl -->
	
	<!-- New Post Creation Modal -->
	<div class="modal fade" id="speek-new-post-modal" tabindex="-1" aria-labelledby="speek-new-post-modal-label" aria-hidden="true">
		<div class="modal-dialog modal-dialog-centered">
			<div class="modal-content speek-new-post-modal-content">
				<!-- Modal Header -->
				<div class="modal-header speek-new-post-modal-header">
					<h2 class="modal-title speek-new-post-modal-title" id="speek-new-post-modal-label">Create a new post</h2>
					<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
				</div>

				<!-- Modal Body -->
				<div class="modal-body speek-new-post-modal-body">
					<form id="speek-new-post-form" method="post" action="{config.relative_path}/compose" novalidate>
						<input type="hidden" name="_csrf" value="{config.csrf_token}" />
						<input type="hidden" name="cid" id="speek-new-post-cid" value="" />

						<div class="speek-new-post-form-content">
							<!-- Space/Category Selector -->
							<div class="speek-form-group">
								<label for="speek-new-post-space" class="speek-form-label">Space</label>
								<div class="speek-select-wrapper">
									<select id="speek-new-post-space" name="cid" class="speek-select">
									</select>
									{buildLucideIcon("chevron-down", 16, "speek-select-chevron")}
								</div>
								<div class="speek-error-message" id="speek-error-space" role="alert"></div>
							</div>

							<!-- Post Title Input -->
							<div class="speek-form-group">
								<label for="speek-new-post-title" class="speek-form-label">Post title<span class="speek-required-asterisk">*</span></label>
								<div class="speek-input-wrapper">
									<input 
										type="text" 
										id="speek-new-post-title" 
										name="title" 
										class="speek-input" 
										placeholder="Enter your post title here..."
									/>
								</div>
								<div class="speek-error-message" id="speek-error-title" role="alert"></div>
							</div>

							<!-- Post Content Textarea -->
							<div class="speek-form-group">
								<label for="speek-new-post-content" class="speek-form-label">Post content<span class="speek-required-asterisk">*</span></label>
								<div class="speek-textarea-wrapper">
									<textarea 
										id="speek-new-post-content" 
										name="content" 
										class="speek-textarea" 
										placeholder="Enter your post content here..." 
										rows="5"
										maxlength="1000"
									></textarea>
								</div>
								<div class="speek-field-meta" aria-live="polite">
									<div class="speek-char-count">
										<span id="speek-char-current">0</span> / <span id="speek-char-max">1000</span>
									</div>
								</div>
								<!-- Formatting Toolbar -->
								<div class="speek-formatting-toolbar">
									<button type="button" class="speek-format-btn" data-format="bold" title="Bold" aria-label="Bold">
										{buildLucideIcon("bold", 20, "speek-format-icon")}
									</button>
									<button type="button" class="speek-format-btn" data-format="italic" title="Italic" aria-label="Italic">
										{buildLucideIcon("italic", 20, "speek-format-icon")}
									</button>
									<button type="button" class="speek-format-btn" data-format="heading" title="Heading" aria-label="Heading">
										{buildLucideIcon("heading", 20, "speek-format-icon")}
									</button>
									<button type="button" class="speek-format-btn" data-format="strikethrough" title="Strikethrough" aria-label="Strikethrough">
										{buildLucideIcon("strikethrough", 20, "speek-format-icon")}
									</button>
									<button type="button" class="speek-format-btn" data-format="list" title="List" aria-label="List">
										{buildLucideIcon("list", 20, "speek-format-icon")}
									</button>
									<button type="button" class="speek-format-btn" data-format="code" title="Code" aria-label="Code">
										{buildLucideIcon("code", 20, "speek-format-icon")}
									</button>
									<button type="button" class="speek-format-btn" data-format="link" title="Link" aria-label="Link">
										{buildLucideIcon("link", 20, "speek-format-icon")}
									</button>
									<button type="button" class="speek-format-btn" data-format="image" title="Image" aria-label="Image">
										{buildLucideIcon("image", 20, "speek-format-icon")}
									</button>
									<button type="button" class="speek-format-btn" data-format="emoji" title="Emoji" aria-label="Emoji">
										{buildLucideIcon("smile", 20, "speek-format-icon")}
									</button>
									<button type="button" class="speek-format-btn" data-format="more" title="More options" aria-label="More options">
										{buildLucideIcon("more-horizontal", 20, "speek-format-icon")}
									</button>
								</div>
								<div class="speek-error-message" id="speek-error-content" role="alert"></div>
							</div>
						</div>
					</form>
				</div>

			<!-- Modal Footer -->
			<div class="modal-footer speek-new-post-modal-footer">
				<button type="button" class="speek-btn speek-btn--destructive" data-bs-dismiss="modal">Discard</button>
				<button type="submit" form="speek-new-post-form" class="speek-btn speek-btn--primary">Submit post</button>
			</div>
			</div>
		</div>
	</div>
</body>
</html>
