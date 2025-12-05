{{{ if privileges.topics:reply }}}
<div component="topic/quickreply/container" class="speek-quick-reply d-flex flex-column" style="gap: 8px;">
	<label class="speek-quick-reply-label" for="quickreply-textarea">
		[[topic:composer.replying-to, "{title}"]]
	</label>
	<form class="d-flex flex-column" method="post" action="{config.relative_path}/compose" style="gap: 16px;">
		<input type="hidden" name="tid" value="{tid}" />
		<input type="hidden" name="_csrf" value="{config.csrf_token}" />
		<div class="speek-quick-reply-textarea-wrapper position-relative">
			<textarea 
				id="quickreply-textarea"
				name="content" 
				component="topic/quickreply/text" 
				class="speek-quick-reply-textarea form-control mousetrap" 
				placeholder="Enter your reply here"
				rows="4"
				maxlength="5000"></textarea>
			<div class="speek-quick-reply-char-count" component="topic/quickreply/char-count">
				<span component="topic/quickreply/char-current">0</span> / <span component="topic/quickreply/char-max">5000</span>
			</div>
			<div class="imagedrop"><div>[[topic:composer.drag-and-drop-images]]</div></div>
		</div>
		<div class="speek-error-message" id="speek-quick-reply-error" component="topic/quickreply/error" role="alert"></div>
		<button type="submit" component="topic/quickreply/button" class="speek-quick-reply-submit-btn">
			<span class="speek-submit-text">Submit reply</span>
			<svg class="speek-submit-loader" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
				<path d="M21 12a9 9 0 1 1-6.219-8.56"/>
			</svg>
		</button>
	</form>
	<form class="d-none" component="topic/quickreply/upload" method="post" enctype="multipart/form-data">
		<input type="file" name="files[]" multiple class="hidden"/>
	</form>
</div>
{{{ end }}}
