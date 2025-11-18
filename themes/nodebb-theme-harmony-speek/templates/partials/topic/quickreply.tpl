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
				maxlength="1000"></textarea>
			<div class="speek-quick-reply-char-count" component="topic/quickreply/char-count">
				<span component="topic/quickreply/char-current">0</span> / <span component="topic/quickreply/char-max">1000</span>
			</div>
			<div class="imagedrop"><div>[[topic:composer.drag-and-drop-images]]</div></div>
		</div>
		<button type="submit" component="topic/quickreply/button" class="speek-quick-reply-submit-btn">Submit reply</button>
	</form>
	<form class="d-none" component="topic/quickreply/upload" method="post" enctype="multipart/form-data">
		<input type="file" name="files[]" multiple class="hidden"/>
	</form>
</div>
{{{ end }}}
