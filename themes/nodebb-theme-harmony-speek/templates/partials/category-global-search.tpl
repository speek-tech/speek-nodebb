<!-- Global search section for categories page -->
<section class="category-inline-search" id="category-inline-search" aria-label="Global search">
	<div class="category-inline-search-input">
		<div class="category-inline-input-wrapper">
			<input
				type="text"
				id="category-inline-search-input"
				class="category-inline-input"
				placeholder="Search all conversations"
				autocomplete="off"
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
			<p class="category-search-description">Here are the posts or comments we found for your search:</p>
		</div>
		<div class="category-search-loading" style="display: none;">
			<i class="fa fa-spinner fa-spin"></i>
			<span>[[global:searching]]</span>
		</div>

		<div class="category-search-no-results" style="display: none;">
			<i class="fa fa-search"></i>
			<p>[[search:no-matches]]</p>
		</div>

		<div id="category-inline-search-results" class="category-search-results"></div>
	</div>
</section>

