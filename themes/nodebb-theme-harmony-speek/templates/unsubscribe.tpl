<div class="unsubscribe">
	<div class="row">
		<div class="col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3" style="margin-top: 80px;">
			{{{ if !error }}}
			<div class="alert alert-success text-center" role="alert">
				<h4 class="alert-heading">
					<i class="fa fa-check-circle"></i> [[global:alert.success]]
				</h4>
				<hr>
				<p class="mb-0">[[email:unsub.success, {payload.template}]]</p>
			</div>
			{{{ else }}}
			<div class="alert alert-danger text-center" role="alert">
				<h4 class="alert-heading">
					<i class="fa fa-exclamation-triangle"></i> [[email:unsub.failure.title]]
				</h4>
				<hr>
				<p class="mb-0">{error}</p>
			</div>
			{{{ end }}}
		</div>
	</div>
</div>


