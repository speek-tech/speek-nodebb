'use strict';

const nconf = require('nconf');
const jwt = require('jsonwebtoken');

const UnfollowToken = module.exports;

/**
 * Generate a secure unfollow token for a topic
 * @param {number} uid - User ID
 * @param {number} tid - Topic ID
 * @returns {string} - JWT token
 */
UnfollowToken.generate = function (uid, tid) {
	const payload = {
		template: 'topic-unfollow',
		uid: parseInt(uid, 10),
		tid: parseInt(tid, 10),
	};

	// Use synchronous jwt.sign (returns token directly)
	return jwt.sign(payload, nconf.get('secret'), { expiresIn: '30d' });
};

/**
 * Generate the full unfollow URL for a topic
 * @param {number} uid - User ID
 * @param {number} tid - Topic ID
 * @returns {string} - Full unfollow URL
 */
UnfollowToken.generateUrl = function (uid, tid) {
	const token = UnfollowToken.generate(uid, tid);
	return [nconf.get('url'), 'email', 'unsubscribe', token].join('/');
};

/**
 * Validate an unfollow token
 * @param {string} token - JWT token to validate
 * @returns {Object|null} - Decoded payload or null if invalid
 */
UnfollowToken.validate = function (token) {
	try {
		const payload = jwt.verify(token, nconf.get('secret'));
		if (payload && payload.template === 'topic-unfollow' && payload.uid && payload.tid) {
			return payload;
		}
		return null;
	} catch (err) {
		return null;
	}
};

