'use strict';

const winston = require('winston');

const db = require('../database');
const user = require('./index');
const topics = require('../topics');
const posts = require('../posts');
const notifications = require('../notifications');
const translator = require('../translator');
const meta = require('../meta');
const plugins = require('../plugins');

const WatchAllNotifications = module.exports;

/**
 * Get all users who should receive watch-all notifications
 * Returns all users if admin setting is enabled, otherwise only admins if that setting is enabled
 */
WatchAllNotifications.getWatchAllUsers = async function () {
	let uids = [];

	// If watch-all is enabled for all users
	if (meta.config.watchAllActivity === 1) {
		uids = await db.getSortedSetRange('users:joindate', 0, -1);
	} 
	// Otherwise, if only admins should get watch-all notifications
	else if (meta.config.watchAllActivityAdmins === 1) {
		uids = await db.getSortedSetRange('group:administrators:members', 0, -1);
	}

	// Filter out banned users
	uids = await user.bans.filterBanned(uids);

	return uids;
};

/**
 * Send notification for new post/reply to watch-all users
 */
WatchAllNotifications.notifyNewPost = async function (postData, topicData) {
	try {
		// IMPORTANT: Never notify the post author about their own post
		const authorUid = parseInt(postData.uid, 10);
		
		// Get watch-all users
		let watchAllUsers = await WatchAllNotifications.getWatchAllUsers();
		
		// Filter out the post author (don't notify themselves)
		watchAllUsers = watchAllUsers.filter(uid => parseInt(uid, 10) !== authorUid);
		
		if (!watchAllUsers.length) {
			return;
		}

		// Get topic followers to avoid duplicate notifications
		// The existing system already notifies followers, so we exclude them
		const followers = await topics.getFollowers(topicData.tid);
		const followerUids = followers.map(uid => parseInt(uid, 10));
		
		// Filter out users who are already following this topic
		// They'll receive notifications through the standard follow system
		// Also double-check to exclude the author (extra safety)
		const recipients = watchAllUsers.filter((uid) => {
			const uidInt = parseInt(uid, 10);
			return uidInt !== authorUid && !followerUids.includes(uidInt);
		});
		
		if (!recipients.length) {
			return;
		}

		// Check if this is a new topic or a reply
		const isMainPost = postData.isMain || (await posts.isMain(postData.pid));
		
		const notificationType = isMainPost ? 'new-topic' : 'new-reply';
		const subject = isMainPost ?
			translator.compile('notifications:user-posted-topic', postData.user.displayname, topicData.title) :
			translator.compile('notifications:user-posted-to', postData.user.displayname, topicData.title);

		const notifObj = await notifications.create({
			type: notificationType,
			bodyShort: subject,
			bodyLong: postData.content,
			pid: postData.pid,
			path: `/post/${postData.pid}`,
			nid: `watch-all:tid:${topicData.tid}:pid:${postData.pid}:uid:${postData.uid}`,
			tid: topicData.tid,
			from: postData.uid,
			subject: topicData.title,
			topicTitle: topicData.title,
		});

		if (notifObj) {
			await notifications.push(notifObj, recipients);
		}
	} catch (err) {
		winston.error(`[watch-all-notifications] Error sending notification: ${err.stack}`);
	}
};

/**
 * Initialize hooks for post and topic creation
 */
WatchAllNotifications.init = function () {
	// Hook into post creation - runs after post is saved
	plugins.hooks.register('core', {
		hook: 'action:post.save',
		method: async function (data) {
			if (!data || !data.post) {
				return;
			}

			const { post: postData } = data;
			const { pid, tid } = postData;

			if (!pid || !tid) {
				return;
			}

			// Run asynchronously to not block post creation
			setImmediate(async () => {
				try {
					// Get topic data
					const topicData = await topics.getTopicFields(tid, ['tid', 'title', 'cid', 'slug']);
					if (!topicData) {
						return;
					}

					// Get user data if not available
					if (!postData.user) {
						const userData = await user.getUserFields(postData.uid, ['username', 'userslug', 'picture', 'displayname']);
						postData.user = userData;
					}

					// Send notification to watch-all users
					await WatchAllNotifications.notifyNewPost(postData, topicData);
				} catch (err) {
					winston.error(`[watch-all-notifications] Error in post.save hook: ${err.stack}`);
				}
			});
		},
	});
};

