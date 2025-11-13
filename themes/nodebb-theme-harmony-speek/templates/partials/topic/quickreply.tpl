{{{ if privileges.topics:reply }}}
<div component="topic/quickreply/container" class="reply-form-container">
	<div class="reply-form">
		<label class="reply-label">Replying to "{title}"</label>
		<form class="flex-grow-1 d-flex flex-column gap-2" method="post" action="{config.relative_path}/compose">
			<input type="hidden" name="tid" value="{tid}" />
			<input type="hidden" name="_csrf" value="{config.csrf_token}" />
			<div class="reply-textarea-wrapper">
				<textarea 
					rows="4" 
					name="content" 
					component="topic/quickreply/text" 
					class="reply-textarea mousetrap" 
					placeholder="Enter your reply here"
					maxlength="1000"
				></textarea>
				<div class="reply-char-count">0 / 1000</div>
				<div class="imagedrop"><div>[[topic:composer.drag-and-drop-images]]</div></div>
			</div>
			<div>
				<div class="d-flex justify-content-end gap-2">
					<button type="button" component="topic/quickreply/upload/button" class="btn btn-ghost btn-sm border d-none"><i class="fa fa-upload"></i></button>
					<button type="button" component="topic/quickreply/expand" class="btn btn-ghost btn-sm border d-none" title="[[topic:open-composer]]"><i class="fa fa-expand"></i></button>
					<button type="submit" component="topic/quickreply/button" class="btn-submit-reply">
						<span class="btn-text">Submit reply</span>
					</button>
				</div>
			</div>
		</form>
		<form class="d-none" component="topic/quickreply/upload" method="post" enctype="multipart/form-data">
			<input type="file" name="files[]" multiple class="hidden"/>
		</form>
	</div>
</div>
{{{ end }}}
