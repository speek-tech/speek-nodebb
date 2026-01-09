<div class="acp-page-container">
	<div component="settings/main/header" class="row border-bottom py-2 m-0 sticky-top acp-page-main-header">
		<div class="col-12 col-md-8 px-0 mb-1 mb-md-0">
			<h4 class="fw-bold tracking-tight mb-0">Slack Notify Settings</h4>
		</div>
		<div class="col-12 col-md-4 px-0">
			<button id="save" class="btn btn-primary btn-sm fw-bold ff-secondary w-100">
				<i class="fa fa-save"></i> Save Settings
			</button>
		</div>
	</div>

	<div class="row m-0">
		<div id="spy-container" class="col-12 col-md-8 px-0 mb-4" tabindex="0">
			<form class="slack-notify-settings">
				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">Slack Webhook Configuration</h5>
					<div class="mb-3">
						<label class="form-label" for="webhookUrl">Webhook URL</label>
						<input type="text" id="webhookUrl" name="webhookUrl" class="form-control" 
							placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL" 
							data-key="webhookUrl" />
						<small class="form-text text-muted">
							Get your webhook URL from <a href="https://api.slack.com/apps" target="_blank">Slack API</a>. 
							Enable "Incoming Webhooks" and create a webhook for your desired channel.
						</small>
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">Notification Settings</h5>
					
					<div class="mb-3">
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" id="notifyPosts" name="notifyPosts" data-key="notifyPosts" />
							<label class="form-check-label" for="notifyPosts">
								<strong>Notify on New Topics</strong>
								<br><small class="text-muted">Send notifications when users create new topics</small>
							</label>
						</div>
					</div>

					<div class="mb-3">
						<div class="form-check form-switch">
							<input class="form-check-input" type="checkbox" id="notifyReplies" name="notifyReplies" data-key="notifyReplies" />
							<label class="form-check-label" for="notifyReplies">
								<strong>Notify on Replies</strong>
								<br><small class="text-muted">Send notifications when users reply to topics</small>
							</label>
						</div>
					</div>

					<div class="mb-3">
						<label class="form-label" for="contentLength">Content Preview Length</label>
						<input type="number" id="contentLength" name="contentLength" class="form-control" 
							min="50" max="1000" step="50" data-key="contentLength" />
						<small class="form-text text-muted">
							Maximum number of characters to include in notification preview (50-1000)
						</small>
					</div>
				</div>

				<div class="mb-4">
					<h5 class="fw-bold tracking-tight settings-header">Test Notifications</h5>
					<button type="button" id="test-notification" class="btn btn-secondary">
						<i class="fa fa-paper-plane"></i> Send Test Notification
					</button>
					<small class="form-text text-muted d-block mt-2">
						Send a test message to verify your webhook is configured correctly
					</small>
				</div>
			</form>
		</div>

		<div class="col-12 col-md-4 px-0">
			<div class="card">
				<div class="card-header">
					<h6 class="mb-0"><i class="fa fa-info-circle"></i> About Slack Notify</h6>
				</div>
				<div class="card-body">
					<p class="card-text">
						This plugin sends real-time notifications to your Slack channel when users create new topics or post replies in your forum.
					</p>
					<h6 class="mt-3">Setup Instructions:</h6>
					<ol class="small">
						<li>Go to <a href="https://api.slack.com/apps" target="_blank">Slack API</a></li>
						<li>Create a new app or select existing</li>
						<li>Enable "Incoming Webhooks"</li>
						<li>Add webhook to your desired channel</li>
						<li>Copy the webhook URL and paste it above</li>
						<li>Configure notification preferences</li>
						<li>Save settings and test!</li>
					</ol>
				</div>
			</div>
		</div>
	</div>
</div>

<script>
(function() {
	'use strict';

	$(document).ready(function() {
		// Load settings
		socket.emit('admin.settings.get', { hash: 'slack-notify' }, function(err, values) {
			if (err) {
				app.alertError(err.message);
				return;
			}

			// Populate form fields
			for (const key in values) {
				if (values.hasOwnProperty(key)) {
					const element = $('[data-key="' + key + '"]');
					if (element.attr('type') === 'checkbox') {
						element.prop('checked', values[key] === 'true' || values[key] === true);
					} else {
						element.val(values[key]);
					}
				}
			}
		});

		// Save settings
		$('#save').on('click', function() {
			const settings = {};
			$('.slack-notify-settings [data-key]').each(function() {
				const $this = $(this);
				const key = $this.attr('data-key');
				if ($this.attr('type') === 'checkbox') {
					settings[key] = $this.is(':checked');
				} else {
					settings[key] = $this.val();
				}
			});

			socket.emit('admin.settings.set', {
				hash: 'slack-notify',
				values: settings
			}, function(err) {
				if (err) {
					app.alertError(err.message);
					return;
				}
				app.alertSuccess('Settings saved successfully!');
			});
		});

		// Test notification
		$('#test-notification').on('click', function() {
			const webhookUrl = $('#webhookUrl').val();
			
			if (!webhookUrl) {
				app.alertError('Please enter a webhook URL first');
				return;
			}

			const testMessage = {
				blocks: [
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: '🧪 *Test Notification*'
						}
					},
					{
						type: 'section',
						text: {
							type: 'mrkdwn',
							text: 'If you can see this message, your Slack webhook is configured correctly! :tada:'
						}
					}
				]
			};

			$.ajax({
				url: webhookUrl,
				type: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(testMessage),
				success: function() {
					app.alertSuccess('Test notification sent! Check your Slack channel.');
				},
				error: function(xhr) {
					app.alertError('Failed to send test notification. Please check your webhook URL.');
				}
			});
		});
	});
})();
</script>
