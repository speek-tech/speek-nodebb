'use strict';


define('flags', ['hooks', 'components', 'api', 'alerts'], function (hooks, components, api, alerts) {
	const Flag = {};
	let flagModal;
	let flagCommit;
	let flagReason;

	Flag.showFlagModal = function (data) {
		data.remote = URL.canParse(data.id) ? new URL(data.id).hostname : false;

		app.parseAndTranslate('modals/flag', data, function (html) {
			flagModal = html;
			flagModal.on('hidden.bs.modal', function () {
				flagModal.remove();
			});

			flagCommit = flagModal.find('#flag-post-commit');
			flagReason = flagModal.find('#flag-reason-custom');

			flagModal.on('click', 'input[name="flag-reason"]', function () {
				if ($(this).attr('id') === 'flag-reason-other') {
					flagReason.removeAttr('disabled');
					if (!flagReason.val().length) {
						flagCommit.attr('disabled', true);
					}
				} else {
					flagReason.attr('disabled', true);
					flagCommit.removeAttr('disabled');
				}
			});

			flagCommit.on('click', function () {
				const selected = $('input[name="flag-reason"]:checked');
				let reason = selected.val();
				if (selected.attr('id') === 'flag-reason-other') {
					reason = flagReason.val();
				}
				const notifyRemote = $('input[name="flag-notify-remote"]').is(':checked');
				createFlag(data.type, data.id, reason, notifyRemote);
			});

			flagModal.on('click', '#flag-reason-other', function () {
				flagReason.focus();
			});


			flagModal.modal('show');
			hooks.fire('action:flag.showModal', {
				modalEl: flagModal,
				type: data.type,
				id: data.id,
				remote: data.remote,
			});

			flagModal.find('#flag-reason-custom').on('keyup blur change', checkFlagButtonEnable);
		});
	};

	Flag.resolve = function (flagId) {
		api.put(`/flags/${flagId}`, {
			state: 'resolved',
		}).then(() => {
			alerts.success('[[flags:resolved]]');
			hooks.fire('action:flag.resolved', { flagId: flagId });
		}).catch(alerts.error);
	};


	Flag.rescind = function (flagId, pid) {
		api.del(`/flags/${flagId}/report`).then(() => {
			alerts.success('[[flags:report-rescinded]]');
			hooks.fire('action:flag.rescinded', { flagId: flagId });
			
			// Update UI: show flag button, hide already-flagged button
			if (pid) {
				const postEl = components.get('post', 'pid', pid);
				postEl.find('[component="post/flag"]').removeClass('hidden').parent().attr('hidden', null);
				postEl.find('[component="post/already-flagged"]').addClass('hidden').parent().attr('hidden', '');
			}
			
			// Send postMessage to parent window on successful rescind
			if (window.parent && window.parent !== window) {
				window.parent.postMessage({
					type: 'flag-action',
					action: 'rescind',
					status: 'success',
				}, '*');
			}
		}).catch((err) => {
			alerts.error(err);
			
			// Send error message to parent window
			if (window.parent && window.parent !== window) {
				window.parent.postMessage({
					type: 'flag-action',
					action: 'rescind',
					status: 'error',
					message: err.message || 'An error occurred',
				}, '*');
			}
		});
	};

	Flag.purge = function (flagId) {
		api.del(`/flags/${flagId}`).then(() => {
			alerts.success('[[flags:purged]]');
			hooks.fire('action:flag.purged', { flagId: flagId });
		}).catch(alerts.error);
	};

	function createFlag(type, id, reason, notifyRemote = false) {
		if (!type || !id || !reason) {
			return;
		}
		const data = { type: type, id: id, reason: reason, notifyRemote: notifyRemote };
		api.post('/flags', data, function (err, flagId) {
			if (err) {
				alerts.error(err);
				
				// Send error message to parent window
				if (window.parent && window.parent !== window) {
					window.parent.postMessage({
						type: 'flag-action',
						action: 'create',
						status: 'error',
						flagType: type,
						message: err.message || 'An error occurred',
					}, '*');
				}
				return;
			}

			flagModal.modal('hide');
			alerts.success('[[flags:modal-submit-success]]');
			if (type === 'post') {
				const postEl = components.get('post', 'pid', id);
				postEl.find('[component="post/flag"]').addClass('hidden').parent().attr('hidden', '');
				postEl.find('[component="post/already-flagged"]').removeClass('hidden').parent().attr('hidden', null);
			}
			hooks.fire('action:flag.create', { flagId: flagId, data: data });
			
			// Send postMessage to parent window on successful flag creation
			if (window.parent && window.parent !== window) {
				window.parent.postMessage({
					type: 'flag-action',
					action: 'create',
					status: 'success',
					flagType: type,
				}, '*');
			}
		});
	}

	function checkFlagButtonEnable() {
		if (flagModal.find('#flag-reason-custom').val()) {
			flagCommit.removeAttr('disabled');
		} else {
			flagCommit.attr('disabled', true);
		}
	}

	return Flag;
});
