'use strict';

const nconf = require('nconf');
const jwt = require('jsonwebtoken');
const util = require('util');

const jwtSignAsync = util.promisify((payload, secret, options, callback) => {
	jwt.sign(payload, secret, options, (err, token) => callback(err, token));
});

const jwtVerifyAsync = util.promisify((token, secret, callback) => {
	jwt.verify(token, secret, (err, payload) => callback(err, payload));
});

const UnfollowToken = module.exports;

/**
 * Generate a secure unfollow token for a topic
 * @param {number} uid - User ID
 * @param {number} tid - Topic ID
 * @returns {Promise<string>} - JWT token
 */
UnfollowToken.generate = async function (uid, tid) {
	const payload = {
		template: 'topic-unfollow',
		uid: parseInt(uid, 10),
		tid: parseInt(tid, 10),
	};

	const token = await jwtSignAsync(payload, nconf.get('secret'), { expiresIn: '30d' });
	return token;
};

/**
 * Generate the full unfollow URL for a topic
 * @param {number} uid - User ID
 * @param {number} tid - Topic ID
 * @returns {Promise<string>} - Full unfollow URL
 */
UnfollowToken.generateUrl = async function (uid, tid) {
	const token = await UnfollowToken.generate(uid, tid);
	return [nconf.get('url'), 'email', 'unsubscribe', token].join('/');
};

/**
 * Validate an unfollow token
 * @param {string} token - JWT token to validate
 * @returns {Promise<Object|null>} - Decoded payload or null if invalid
 */
UnfollowToken.validate = async function (token) {
	try {
		const payload = await jwtVerifyAsync(token, nconf.get('secret'));
		if (payload && payload.template === 'topic-unfollow' && payload.uid && payload.tid) {
			return payload;
		}
		return null;
	} catch (err) {
		return null;
	}
};

