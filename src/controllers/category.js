'use strict';


const nconf = require('nconf');
const validator = require('validator');
const qs = require('querystring');

const db = require('../database');
const privileges = require('../privileges');
const user = require('../user');
const categories = require('../categories');
const meta = require('../meta');
const activitypub = require('../activitypub');
const pagination = require('../pagination');
const helpers = require('./helpers');
const utils = require('../utils');
const translator = require('../translator');
const analytics = require('../analytics');

const categoryController = module.exports;

const url = nconf.get('url');
const relative_path = nconf.get('relative_path');
const validSorts = [
	'recently_replied', 'recently_created', 'most_posts', 'most_votes', 'most_views',
];

categoryController.get = async function (req, res, next) {
	let cid = req.params.category_id;
	if (cid === '-1') {
		return helpers.redirect(res, `${res.locals.isAPI ? '/api' : ''}/world?${qs.stringify(req.query)}`);
	}

	if (!utils.isNumber(cid)) {
		const assertion = await activitypub.actors.assertGroup([cid]);
		if (!activitypub.helpers.isUri(cid)) {
			cid = await db.getObjectField('handle:cid', cid);
		}

		if (!assertion || !cid) {
			return next();
		}
	}

	let currentPage = parseInt(req.query.page, 10) || 1;
	let topicIndex = utils.isNumber(req.params.topic_index) ? parseInt(req.params.topic_index, 10) - 1 : 0;
	if ((req.params.topic_index && !utils.isNumber(req.params.topic_index))) {
		return next();
	}

	const [categoryFields, userPrivileges, tagData, userSettings, rssToken] = await Promise.all([
		categories.getCategoryFields(cid, ['slug', 'disabled', 'link']),
		privileges.categories.get(cid, req.uid),
		helpers.getSelectedTag(req.query.tag),
		user.getSettings(req.uid),
		user.auth.getFeedToken(req.uid),
	]);

	if (!categoryFields.slug ||
		(categoryFields && categoryFields.disabled) ||
		(userSettings.usePagination && currentPage < 1)) {
		return next();
	}
	if (topicIndex < 0) {
		return helpers.redirect(res, `/category/${categoryFields.slug}?${qs.stringify(req.query)}`);
	}

	if (!userPrivileges.read) {
		return helpers.notAllowed(req, res);
	}

	if (utils.isNumber(cid) && !res.locals.isAPI && !req.params.slug && (categoryFields.slug && categoryFields.slug !== `${cid}/`)) {
		return helpers.redirect(res, `/category/${categoryFields.slug}?${qs.stringify(req.query)}`, true);
	}

	if (categoryFields.link) {
		await db.incrObjectField(`category:${cid}`, 'timesClicked');
		return helpers.redirect(res, validator.unescape(categoryFields.link));
	}

	if (!userSettings.usePagination) {
		topicIndex = Math.max(0, topicIndex - (Math.ceil(userSettings.topicsPerPage / 2) - 1));
	} else if (!req.query.page) {
		const index = Math.max(parseInt((topicIndex || 0), 10), 0);
		currentPage = Math.ceil((index + 1) / userSettings.topicsPerPage);
		topicIndex = 0;
	}

	const targetUid = await user.getUidByUserslug(req.query.author);
	const start = ((currentPage - 1) * userSettings.topicsPerPage) + topicIndex;
	const stop = start + userSettings.topicsPerPage - 1;

	const sort = validSorts.includes(req.query.sort) ? req.query.sort : userSettings.categoryTopicSort;

	const categoryData = await categories.getCategoryById({
		uid: req.uid,
		cid: cid,
		start: start,
		stop: stop,
		sort: sort,
		settings: userSettings,
		query: req.query,
		tag: req.query.tag,
		targetUid: targetUid,
	});
	if (!categoryData) {
		return next();
	}

	if (topicIndex > Math.max(categoryData.topic_count - 1, 0)) {
		return helpers.redirect(res, `/category/${categoryData.slug}/${categoryData.topic_count}?${qs.stringify(req.query)}`);
	}
	const pageCount = Math.max(1, Math.ceil(categoryData.topic_count / userSettings.topicsPerPage));
	if (userSettings.usePagination && currentPage > pageCount) {
		return next();
	}

	categories.modifyTopicsByPrivilege(categoryData.topics, userPrivileges);
	categoryData.tagWhitelist = categories.filterTagWhitelist(categoryData.tagWhitelist, userPrivileges.isAdminOrMod);

	const allCategories = [];
	categories.flattenCategories(allCategories, categoryData.children);

	await Promise.all([
		buildBreadcrumbs(req, categoryData),
		categories.setUnread([categoryData], allCategories.map(c => c.cid).concat(cid), req.uid),
	]);

	if (categoryData.children.length) {
		await categories.getRecentTopicReplies(allCategories, req.uid, req.query);
		categoryData.subCategoriesLeft = Math.max(0, categoryData.children.length - categoryData.subCategoriesPerPage);
		categoryData.hasMoreSubCategories = categoryData.children.length > categoryData.subCategoriesPerPage;
		categoryData.nextSubCategoryStart = categoryData.subCategoriesPerPage;
		categoryData.children = categoryData.children.slice(0, categoryData.subCategoriesPerPage);
		categoryData.children.forEach((child) => {
			if (child) {
				helpers.trimChildren(child);
				helpers.setCategoryTeaser(child);
			}
		});
	}

	categoryData.title = translator.escape(categoryData.name);
	categoryData.selectCategoryLabel = '[[category:subcategories]]';
	categoryData.description = translator.escape(categoryData.description);
	categoryData.privileges = userPrivileges;
	categoryData.showSelect = userPrivileges.editable;
	categoryData.showTopicTools = userPrivileges.editable;
	categoryData.topicIndex = topicIndex;
	categoryData.selectedTag = tagData.selectedTag;
	categoryData.selectedTags = tagData.selectedTags;
	categoryData.sortOptionLabel = `[[topic:${validator.escape(String(sort)).replace(/_/g, '-')}]]`;

	if (!meta.config['feeds:disableRSS']) {
		categoryData.rssFeedUrl = `${url}/category/${categoryData.cid}.rss`;
		if (req.loggedIn) {
			categoryData.rssFeedUrl += `?uid=${req.uid}&token=${rssToken}`;
		}
	}

	addTags(categoryData, res, currentPage);

	categoryData['feeds:disableRSS'] = meta.config['feeds:disableRSS'] || 0;
	categoryData['reputation:disabled'] = meta.config['reputation:disabled'];
	categoryData.pagination = pagination.create(currentPage, pageCount, req.query);
	categoryData.pagination.rel.forEach((rel) => {
		rel.href = `${url}/category/${categoryData.slug}${rel.href}`;
		res.locals.linkTags.push(rel);
	});

	analytics.increment([`pageviews:byCid:${categoryData.cid}`]);

	if (meta.config.activitypubEnabled) {
		// Include link header for richer parsing
		res.set('Link', `<${nconf.get('url')}/category/${cid}>; rel="alternate"; type="application/activity+json"`);

		// Category accessible
		const remoteOk = await privileges.categories.can('read', cid, activitypub._constants.uid);
		if (remoteOk) {
			categoryData.handleFull = `${categoryData.handle}@${nconf.get('url_parsed').host}`;
		}
	}

	// Add carousel data for Speek design
	const [recentConversations, relatedSpaces] = await Promise.all([
		getRecentConversationsFromSiblings(cid, req.uid, 10),
		getRelatedSpaces(cid, req.uid, 10),
	]);

	categoryData.recentConversations = recentConversations;
	categoryData.relatedSpaces = relatedSpaces;

	res.render('category', categoryData);
};

async function buildBreadcrumbs(req, categoryData) {
	const breadcrumbs = [
		{
			text: categoryData.name,
			url: `${url}/category/${categoryData.slug}`,
			cid: categoryData.cid,
		},
	];
	const crumbs = await helpers.buildCategoryBreadcrumbs(categoryData.parentCid);
	if (req.originalUrl.startsWith(`${relative_path}/api/category`) || req.originalUrl.startsWith(`${relative_path}/category`)) {
		categoryData.breadcrumbs = crumbs.concat(breadcrumbs);
	}
}

function addTags(categoryData, res, currentPage) {
	res.locals.metaTags = [
		{
			name: 'title',
			content: categoryData.name,
			noEscape: true,
		},
		{
			property: 'og:title',
			content: categoryData.name,
			noEscape: true,
		},
		{
			name: 'description',
			content: categoryData.description,
			noEscape: true,
		},
		{
			property: 'og:type',
			content: 'website',
		},
	];

	if (categoryData.backgroundImage) {
		let { backgroundImage } = categoryData;
		backgroundImage = utils.decodeHTMLEntities(backgroundImage);
		if (!backgroundImage.startsWith('http')) {
			backgroundImage = url + backgroundImage.replace(new RegExp(`^${nconf.get('relative_path')}`), '');
		}
		res.locals.metaTags.push({
			property: 'og:image',
			content: backgroundImage,
			noEscape: true,
		});
	}

	const page = currentPage > 1 ? `?page=${currentPage}` : '';
	res.locals.linkTags = [
		{
			rel: 'up',
			href: url,
		},
		{
			rel: 'canonical',
			href: `${url}/category/${categoryData.slug}${page}`,
			noEscape: true,
		},
	];

	if (!categoryData['feeds:disableRSS']) {
		res.locals.linkTags.push({
			rel: 'alternate',
			type: 'application/rss+xml',
			href: categoryData.rssFeedUrl,
		});
	}

	if (meta.config.activitypubEnabled) {
		res.locals.linkTags.push({
			rel: 'alternate',
			type: 'application/activity+json',
			href: `${nconf.get('url')}/category/${categoryData.cid}`,
		});
	}
}

// =====================================
// Helper Functions for Carousel Data
// =====================================

/**
 * Get recent conversations (posts) from sibling categories
 * @param {number} currentCid - Current category ID
 * @param {number} uid - User ID
 * @param {number} limit - Number of posts to fetch
 * @returns {Array} Array of recent post data with category info
 */
async function getRecentConversationsFromSiblings(currentCid, uid, limit = 10) {
	try {
		// Get current category data to find siblings
		const currentCategory = await categories.getCategoryData(currentCid);
		if (!currentCategory) {
			return [];
		}

		const parentCid = currentCategory.parentCid || 0;

		// Get all sibling categories (same parent)
		const siblingCids = await db.getSortedSetRange(`cid:${parentCid}:children`, 0, -1);
		const filteredSiblings = siblingCids
			.map(cid => parseInt(cid, 10))
			.filter(cid => cid !== parseInt(currentCid, 10)); // Exclude current category

		if (!filteredSiblings.length) {
			return [];
		}

		// Filter by user privileges
		const allowedCids = await privileges.categories.filterCids('topics:read', filteredSiblings, uid);

		if (!allowedCids.length) {
			return [];
		}

		// Get recent topics from these categories
		const recentTopics = [];
		for (const cid of allowedCids.slice(0, 5)) { // Limit to 5 categories to avoid too many queries
			const tids = await db.getSortedSetRevRange(`cid:${cid}:tids:lastposttime`, 0, 2);
			if (tids && tids.length) {
				recentTopics.push(...tids.map(tid => ({ tid, cid })));
			}
		}

		// Sort by recent and limit
		const limitedTopics = recentTopics.slice(0, limit);

		// Get topic data
		const topics = await require('../topics').getTopics(limitedTopics.map(t => t.tid), uid);

		// Get category data for each topic
		const cidsToFetch = [...new Set(limitedTopics.map(t => t.cid))];
		const categoriesData = await categories.getCategoriesData(cidsToFetch);
		const categoryMap = {};
		categoriesData.forEach(cat => {
			if (cat) categoryMap[cat.cid] = cat;
		});

		// Combine data
		const result = topics.filter(t => t).map((topic, index) => {
			const topicCid = limitedTopics[index].cid;
			return {
				...topic,
				category: categoryMap[topicCid] || { name: 'Unknown' },
			};
		});

		return result;
	} catch (error) {
		console.error('Error fetching recent conversations:', error);
		return [];
	}
}

/**
 * Get related spaces (sibling categories)
 * @param {number} currentCid - Current category ID
 * @param {number} uid - User ID
 * @param {number} limit - Number of categories to fetch
 * @returns {Array} Array of related category data
 */
async function getRelatedSpaces(currentCid, uid, limit = 10) {
	try {
		// Get current category data
		const currentCategory = await categories.getCategoryData(currentCid);
		if (!currentCategory) {
			return [];
		}

		const parentCid = currentCategory.parentCid || 0;

		// Get sibling categories
		const siblingCids = await db.getSortedSetRange(`cid:${parentCid}:children`, 0, -1);
		const filteredSiblings = siblingCids
			.map(cid => parseInt(cid, 10))
			.filter(cid => cid !== parseInt(currentCid, 10)); // Exclude current category

		if (!filteredSiblings.length) {
			return [];
		}

		// Filter by user privileges
		const allowedCids = await privileges.categories.filterCids('find', filteredSiblings, uid);

		if (!allowedCids.length) {
			return [];
		}

		// Get category data
		const categoriesData = await categories.getCategoriesData(allowedCids.slice(0, limit));

		// Get unread counts for each category
		const result = await Promise.all(
			categoriesData.filter(c => c && !c.disabled).map(async (category) => {
				// Get unread count for user
				const unreadCount = await categories.getUnreadCount(uid, category.cid);

				return {
					...category,
					unreadCount: unreadCount || 0,
				};
			})
		);

		return result;
	} catch (error) {
		console.error('Error fetching related spaces:', error);
		return [];
	}
}
