<!-- Global search section for categories page -->
<section class="category-inline-search" id="category-inline-search" aria-label="Global search">
	<div class="category-inline-search-header">
		<h2 class="category-inline-search-title">[[global:search]]</h2>
		<p class="category-inline-search-subtitle">Find topics and comments across the community</p>
	</div>

	<div class="category-inline-search-input">
		<div class="category-inline-input-wrapper">
			<input
				type="text"
				id="category-inline-search-input"
				class="category-inline-input"
				placeholder="[[search:type-to-search]]"
				autocomplete="off"
			/>
			<button class="category-inline-clear" type="button" aria-label="[[global:clear]]" style="display:none;">
				<i class="fa fa-times-circle"></i>
			</button>
		</div>
	</div>

	<div class="category-inline-search-results">
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

