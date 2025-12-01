'use strict';

const nconf = require('nconf');
const winston = require('winston');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const util = require('util');

const user = require('../../user');
const languages = require('../../languages');
const meta = require('../../meta');
const plugins = require('../../plugins');
const notifications = require('../../notifications');
const db = require('../../database');
const helpers = require('../helpers');
const slugify = require('../../slugify');

const Topics = require('../../topics');

const settingsController = module.exports;

settingsController.get = async function (req, res, next) {
	const { userData } = res.locals;
	if (!userData) {
		return next();
	}
	const [settings, languagesData] = await Promise.all([
		user.getSettings(userData.uid),
		languages.list(),
	]);

	userData.settings = settings;
	userData.languages = languagesData;
	if (userData.isAdmin && userData.isSelf) {
		userData.acpLanguages = _.cloneDeep(languagesData);
	}

	const data = await plugins.hooks.fire('filter:user.customSettings', {
		settings: settings,
		customSettings: [],
		uid: req.uid,
	});

	const [notificationSettings, routes, bsSkinOptions] = await Promise.all([
		getNotificationSettings(userData),
		getHomePageRoutes(userData),
		getSkinOptions(userData),
		getChatAllowDenyList(userData),
	]);

	userData.customSettings = data.customSettings;
	userData.homePageRoutes = routes;
	userData.bootswatchSkinOptions = bsSkinOptions;
	userData.notificationSettings = notificationSettings;
	userData.disableEmailSubscriptions = meta.config.disableEmailSubscriptions;

	// Digest frequency is now controlled by admin globally, not by individual users
	userData.dailyDigestFreqOptions = [];

	userData.languages.forEach((language) => {
		language.selected = language.code === userData.settings.userLang;
	});

	if (userData.isAdmin && userData.isSelf) {
		userData.acpLanguages.forEach((language) => {
			language.selected = language.code === userData.settings.acpLang;
		});
	}

	const notifFreqOptions = [
		'all',
		'first',
		'everyTen',
		'threshold',
		'logarithmic',
		'disabled',
	];

	userData.upvoteNotifFreq = notifFreqOptions.map(
		name => ({ name: name, selected: name === userData.settings.upvoteNotifFreq })
	);

	userData.categoryWatchState = { [userData.settings.categoryWatchState]: true };

	userData.disableCustomUserSkins = meta.config.disableCustomUserSkins || 0;

	userData.allowUserHomePage = meta.config.allowUserHomePage === 1 ? 1 : 0;

	userData.hideFullname = meta.config.hideFullname || 0;
	userData.hideEmail = meta.config.hideEmail || 0;

	userData.inTopicSearchAvailable = plugins.hooks.hasListeners('filter:topic.search');

	userData.maxTopicsPerPage = meta.config.maxTopicsPerPage;
	userData.maxPostsPerPage = meta.config.maxPostsPerPage;

	userData.title = '[[pages:account/settings]]';
	userData.breadcrumbs = helpers.buildBreadcrumbs([{ text: userData.username, url: `/user/${userData.userslug}` }, { text: '[[user:settings]]' }]);

	res.render('account/settings', userData);
};

const unsubscribable = ['digest', 'notification', 'topic-unfollow'];
const jwtVerifyAsync = util.promisify((token, callback) => {
	jwt.verify(token, nconf.get('secret'), (err, payload) => callback(err, payload));
});
const doUnsubscribe = async (payload) => {
	if (payload.template === 'digest') {
		// Set user's preference to opt out of digest emails
		await user.setSetting(payload.uid, 'dailyDigestFreq', 'off');
	} else if (payload.template === 'notification') {
		const settingKey = `notificationType_${payload.type}`;
		const currentToNewSetting = {
			notificationemail: 'notification',
			email: 'none',
		};
		const current = await db.getObjectField(`user:${payload.uid}:settings`, settingKey);

		if (currentToNewSetting.hasOwnProperty(current)) {
			// Standard NodeBB behaviour: preserve in-app notifications when possible
			await user.setSetting(payload.uid, settingKey, currentToNewSetting[current]);
		} else if (payload.type === 'new-reply') {
			// Hard guarantee for Speek: global \"unsubscribe from replies to any post\"
			// must always stop reply emails, even if the previous value was unexpected.
			await user.setSetting(payload.uid, settingKey, 'none');
		}
	} else if (payload.template === 'topic-unfollow') {
		// Unfollow a specific topic
		await Topics.unfollow(payload.tid, payload.uid);
	}
	return true;
};

settingsController.unsubscribe = async (req, res, next) => {
	if (req.method === 'HEAD') {
		return res.sendStatus(204);
	}
	
	let success = false;
	let errorMessage = '';
	let template = '';
	
	try {
		const payload = await jwtVerifyAsync(req.params.token);
		if (!payload || !unsubscribable.includes(payload.template)) {
			return next();
		}
		template = payload.template;
		await doUnsubscribe(payload);
		success = true;
	} catch (err) {
		errorMessage = err.message;
	}
	
	// Determine success message based on template type
	let successTitle = 'Successfully Unsubscribed';
	let successMessage = 'You will no longer receive digest emails from our mailing list.';
	
	if (template === 'topic-unfollow') {
		successTitle = 'Unfollowed Successfully';
		successMessage = 'You will no longer receive notifications for replies to this conversation.';
	} else if (template === 'notification') {
		successMessage = 'You will no longer receive this type of notification by email.';
	}
	
	// Send plain HTML response
	const html = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${success ? successTitle : 'Unsubscribe Failed'}</title>
	<style>
		body {
			font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
			display: flex;
			align-items: center;
			justify-content: center;
			min-height: 100vh;
			margin: 0;
			background: #f5f5f5;
		}
		.container {
			max-width: 600px;
			padding: 40px;
			background: white;
			border-radius: 12px;
			box-shadow: 0 2px 10px rgba(0,0,0,0.1);
			text-align: center;
		}
		.icon {
			font-size: 64px;
			margin-bottom: 20px;
		}
		.success { color: #28a745; }
		.error { color: #dc3545; }
		h1 {
			font-size: 28px;
			font-weight: 600;
			margin: 0 0 16px 0;
			color: #333;
		}
		p {
			font-size: 16px;
			line-height: 1.5;
			color: #666;
			margin: 0;
		}
	</style>
</head>
<body>
	<div class="container">
		${success ? `
			<div class="icon success">✓</div>
			<h1>${successTitle}</h1>
			<p>${successMessage}</p>
		` : `
			<div class="icon error">✕</div>
			<h1>Unable to Unsubscribe</h1>
			<p>${errorMessage || 'There was an error processing your request. Please try again later.'}</p>
		`}
	</div>
</body>
</html>
	`;
	
	res.send(html);
};

settingsController.unsubscribePost = async function (req, res) {
	let payload;
	try {
		payload = await jwtVerifyAsync(req.params.token);
		if (!payload || !unsubscribable.includes(payload.template)) {
			return res.sendStatus(404);
		}
	} catch (err) {
		return res.sendStatus(403);
	}
	try {
		await doUnsubscribe(payload);
		res.sendStatus(200);
	} catch (err) {
		winston.error(`[settings/unsubscribe] One-click unsubscribe failed with error: ${err.message}`);
		res.sendStatus(500);
	}
};

async function getNotificationSettings(userData) {
	const privilegedTypes = [];

	const privileges = await user.getPrivileges(userData.uid);
	if (privileges.isAdmin) {
		privilegedTypes.push('notificationType_new-register');
	}
	if (privileges.isAdmin || privileges.isGlobalMod || privileges.isModeratorOfAnyCategory) {
		privilegedTypes.push('notificationType_post-queue', 'notificationType_new-post-flag');
	}
	if (privileges.isAdmin || privileges.isGlobalMod) {
		privilegedTypes.push('notificationType_new-user-flag');
	}
	const results = await plugins.hooks.fire('filter:user.notificationTypes', {
		types: notifications.baseTypes.slice(),
		privilegedTypes: privilegedTypes,
	});

	function modifyType(type) {
		const setting = userData.settings[type];
		return {
			name: type,
			label: `[[notifications:${type.replace(/_/g, '-')}]]`,
			none: setting === 'none',
			notification: setting === 'notification',
			email: setting === 'email',
			notificationemail: setting === 'notificationemail',
		};
	}

	if (meta.config.disableChat) {
		results.types = results.types.filter(type => type !== 'notificationType_new-chat');
	}

	return results.types.map(modifyType).concat(results.privilegedTypes.map(modifyType));
}

async function getHomePageRoutes(userData) {
	let routes = await helpers.getHomePageRoutes(userData.uid);

	// Set selected for each route
	let customIdx;
	let hasSelected = false;
	routes = routes.map((route, idx) => {
		if (route.route === userData.settings.homePageRoute) {
			route.selected = true;
			hasSelected = true;
		} else {
			route.selected = false;
		}

		if (route.route === 'custom') {
			customIdx = idx;
		}

		return route;
	});

	if (!hasSelected && customIdx && userData.settings.homePageRoute !== 'none') {
		routes[customIdx].selected = true;
	}

	return routes;
}

async function getSkinOptions(userData) {
	const defaultSkin = _.capitalize(meta.config.bootswatchSkin) || '[[user:no-skin]]';
	const bootswatchSkinOptions = [
		{ name: '[[user:no-skin]]', value: 'noskin' },
		{ name: `[[user:default, ${defaultSkin}]]`, value: '' },
	];
	const customSkins = await meta.settings.get('custom-skins');
	if (customSkins && Array.isArray(customSkins['custom-skin-list'])) {
		customSkins['custom-skin-list'].forEach((customSkin) => {
			bootswatchSkinOptions.push({
				name: customSkin['custom-skin-name'],
				value: slugify(customSkin['custom-skin-name']),
			});
		});
	}

	bootswatchSkinOptions.push(
		...meta.css.supportedSkins.map(skin => ({ name: _.capitalize(skin), value: skin }))
	);

	bootswatchSkinOptions.forEach((skin) => {
		skin.selected = skin.value === userData.settings.bootswatchSkin;
	});
	return bootswatchSkinOptions;
}

async function getChatAllowDenyList(userData) {
	const [chatAllowListUsers, chatDenyListUsers] = await Promise.all([
		user.getUsersFields(userData.settings.chatAllowList, ['uid', 'username', 'picture']),
		user.getUsersFields(userData.settings.chatDenyList, ['uid', 'username', 'picture']),
	]);

	userData.settings.chatAllowListUsers = chatAllowListUsers;
	userData.settings.chatDenyListUsers = chatDenyListUsers;
};
