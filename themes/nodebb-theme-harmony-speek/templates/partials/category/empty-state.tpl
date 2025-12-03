<style>
	.speek-empty-state__icon .lucide-icon,
	.speek-empty-state__icon svg {
		width: 64px !important;
		height: 64px !important;
	}
</style>
<div class="speek-empty-state d-flex flex-column align-items-center justify-content-center py-5 px-3" style="min-height: 300px;">
	<div class="speek-empty-state__icon mb-2" style="opacity: 0.6; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center;">
		{buildLucideIcon("handshake", 64, "speek-empty-state__icon-svg")}
	</div>
	<div class="speek-empty-state__content text-center">
		<h3 class="speek-empty-state__title mb-3 fw-semibold" style="font-size: 1.25rem; color: var(--secondary-foreground, #333);">
			No posts yet
		</h3>
		{{{ if privileges.topics:create }}}
		<p class="speek-empty-state__description mb-4" style="color: var(--muted-foreground, #666); font-size: 0.95rem; max-width: 400px; margin: 0 auto;">
			No conversations here yet. Be the first to share support, questions, or experiences — your voice could help another parent.
		</p>
		{{{ else }}}
		<p class="speek-empty-state__description mb-4" style="color: var(--muted-foreground, #666); font-size: 0.95rem; max-width: 400px; margin: 0 auto;">
			This space is waiting for its first conversation. Check back soon or log in to start a discussion.
		</p>
		{{{ end }}}
	</div>
</div>

