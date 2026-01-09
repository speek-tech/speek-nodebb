'use strict';

const winston = module.parent.require('winston');
const meta = module.parent.require('./src/meta');
const topics = module.parent.require('./src/topics');
const posts = module.parent.require('./src/posts');
const user = module.parent.require('./src/user');
const categories = module.parent.require('./src/categories');
const nconf = module.parent.require('nconf');

const SlackNotify = {
	settings: {
		webhookUrl: '',
		notifyPosts: true,
		notifyReplies: true,
		contentLength: 200,
	},
};

/**
 * Initialize plugin - load settings from database
 */
SlackNotify.init = async function (params) {
	winston.info('[slack-notify] Plugin initializing...');
	
	try {
		const settings = await meta.settings.get('slack-notify');
		if (settings) {
			SlackNotify.settings = {
				webhookUrl: settings.webhookUrl || '',
				notifyPosts: settings.notifyPosts !== 'false' && settings.notifyPosts !== false,
				notifyReplies: settings.notifyReplies !== 'false' && settings.notifyReplies !== false,
				contentLength: parseInt(settings.contentLength, 10) || 200,
			};
			winston.info('[slack-notify] Settings loaded successfully');
		}
	} catch (error) {
		winston.error('[slack-notify] Failed to load settings:', error);
	}
};

/**
 * Hook: action:post.save - Called when a post is saved
 */
SlackNotify.onPostSave = async function (postData) {
	// Non-blocking - catch all errors to avoid disrupting post creation
	try {
		// Check if webhook URL is configured
		if (!SlackNotify.settings.webhookUrl) {
			return;
		}

		// Fetch full post data
		const post = await posts.getPostData(postData.post.pid);
		if (!post) {
			return;
		}

		// Fetch topic data
		const topic = await topics.getTopicData(post.tid);
		if (!topic) {
			return;
		}

		// Determine if this is a new post or reply
		const isNewTopic = topic.mainPid === post.pid;

		// Check if notifications are enabled for this type
		if (isNewTopic && !SlackNotify.settings.notifyPosts) {
			return;
		}
		if (!isNewTopic && !SlackNotify.settings.notifyReplies) {
			return;
		}

		// Fetch user data
		const userData = await user.getUserFields(post.uid, ['username', 'userslug']);
		
		// Fetch category data
		const category = await categories.getCategoryData(topic.cid);

		// Format and send Slack message
		const message = SlackNotify.formatSlackMessage(post, userData, topic, category, isNewTopic);
		await SlackNotify.sendToSlack(SlackNotify.settings.webhookUrl, message);

		winston.info(`[slack-notify] Notification sent for post PID: ${post.pid}`);
	} catch (error) {
		// Fail silently - don't block post creation
		winston.error('[slack-notify] Failed to send notification:', error.message);
	}
};

/**
 * Format Slack message payload
 */
SlackNotify.formatSlackMessage = function (post, userData, topic, category, isNewTopic) {
	const baseUrl = nconf.get('url') || 'http://localhost:4567';
	const postUrl = `${baseUrl}/post/${post.pid}`;
	const topicUrl = `${baseUrl}/topic/${topic.slug}`;
	
	// Truncate and sanitize content
	const content = SlackNotify.truncateContent(post.content, SlackNotify.settings.contentLength);
	
	const icon = isNewTopic ? '👤' : '💬';
	const action = isNewTopic ? 'created a new topic' : 'replied to';
	const categoryName = category ? category.name : 'Unknown Category';

	// Build Slack message using blocks for rich formatting
	const message = {
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `${icon} *${userData.username}* ${action} in *${categoryName}*`,
				},
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*<${topicUrl}|${topic.title}>*\n${content}`,
				},
			},
			{
				type: 'actions',
				elements: [
					{
						type: 'button',
						text: {
							type: 'plain_text',
							text: isNewTopic ? 'View Topic' : 'View Reply',
						},
						url: postUrl,
					},
				],
			},
		],
	};

	return message;
};

/**
 * Truncate and sanitize content
 */
SlackNotify.truncateContent = function (text, maxLength) {
	if (!text) {
		return '';
	}
	
	// Remove HTML tags and decode entities
	let sanitized = text.replace(/<[^>]*>/g, '').trim();
	
	// Truncate if needed
	if (sanitized.length > maxLength) {
		sanitized = sanitized.substring(0, maxLength) + '...';
	}
	
	return sanitized;
};

/**
 * Send message to Slack webhook
 */
SlackNotify.sendToSlack = async function (webhookUrl, message) {
	try {
		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(message),
		});

		if (!response.ok) {
			throw new Error(`Slack API returned status ${response.status}`);
		}
	} catch (error) {
		throw new Error(`Failed to send to Slack: ${error.message}`);
	}
};

/**
 * Add admin navigation menu item
 */
SlackNotify.addAdminNavigation = async function (header) {
	header.plugins.push({
		route: '/plugins/slack-notify',
		icon: 'fa-slack',
		name: 'Slack Notify',
	});
	return header;
};

module.exports = SlackNotify;
