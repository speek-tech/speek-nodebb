'use strict';

const privileges = require('../privileges');

module.exports = function (Posts) {
	Posts.tools = {};

	Posts.tools.delete = async function (uid, pid) {
		const [postData, canDelete] = await Promise.all([
			Posts.getPostData(pid),
			privileges.posts.canDelete(pid, uid),
		]);
		if (!postData) {
			throw new Error('[[error:no-post]]');
		}

		if (!canDelete.flag) {
			throw new Error(canDelete.message);
		}

		// Permanent delete (purge)
		Posts.clearCachedPost(pid);
		await Posts.purge(pid, uid);
		
		return postData;
	};
};
