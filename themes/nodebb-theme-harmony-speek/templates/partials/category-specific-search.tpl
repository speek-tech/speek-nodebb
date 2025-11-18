<!-- Category-specific search section for category page -->
<section class="category-inline-search" id="category-specific-search" aria-label="Category search">
	<div class="category-inline-search-input">
		<div class="category-inline-input-wrapper">
			<input
				type="text"
				id="category-specific-search-input"
				class="category-inline-input"
				placeholder="Search conversations in {./name}"
				autocomplete="off"
				data-category-name="{./name}"
				data-category-cid="{./cid}"
			/>
			<button class="category-inline-clear" type="button" aria-label="[[global:clear]]">
				<i class="fa fa-times"></i>
			</button>
			<span class="category-inline-search-icon" aria-hidden="true">
				<i class="fa fa-search"></i>
			</span>
		</div>
	</div>

	<div class="category-inline-search-results" style="display:none;">
		<div class="category-search-meta" style="display:none;">
			<p class="category-search-count"></p>
			<p class="category-search-description">Here are the posts or comments we found for your search, in the <span class="category-name-highlight">{./name}</span> space:</p>
		</div>
		<div class="category-search-loading" style="display: none;">
			<i class="fa fa-spinner fa-spin"></i>
			<span>[[global:searching]]</span>
		</div>

		<div class="category-search-no-results" style="display: none;">
			<i class="fa fa-search"></i>
			<p>[[search:no-matches]]</p>
		</div>

		<div id="category-specific-search-results" class="category-search-results"></div>
	</div>
</section>

