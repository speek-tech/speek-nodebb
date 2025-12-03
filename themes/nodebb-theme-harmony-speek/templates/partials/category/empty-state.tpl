<div class="speek-empty-state d-flex flex-column align-items-center justify-content-center py-5 px-3" style="min-height: 300px;">
	<div class="speek-empty-state__icon mb-4" style="opacity: 0.6;">
		{buildLucideIcon("message-square-heart", 64, "speek-empty-state__icon-svg")}
	</div>
	<div class="speek-empty-state__content text-center">
		<h3 class="speek-empty-state__title mb-3 fw-semibold" style="font-size: 1.25rem; color: var(--secondary-foreground, #333);">
			No posts yet
		</h3>
		{{{ if privileges.topics:create }}}
		<p class="speek-empty-state__description mb-4" style="color: var(--muted-foreground, #666); font-size: 0.95rem; max-width: 400px; margin: 0 auto;">
			Be the first to start a conversation in this space. Share your thoughts, ask questions, or connect with others.
		</p>
		{{{ else }}}
		<p class="speek-empty-state__description mb-4" style="color: var(--muted-foreground, #666); font-size: 0.95rem; max-width: 400px; margin: 0 auto;">
			This space is waiting for its first conversation. Check back soon or log in to start a discussion.
		</p>
		{{{ end }}}
	</div>
</div>

