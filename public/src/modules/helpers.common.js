'use strict';

module.exports = function (utils, Benchpress, relative_path) {
	Benchpress.setGlobal('true', true);
	Benchpress.setGlobal('false', false);
	const oneDayInMs = 24 * 60 * 60 * 1000;

	const helpers = {
		displayMenuItem,
		buildMetaTag,
		buildLinkTag,
		stringify,
		escape,
		stripTags,
		buildCategoryIcon,
		buildCategoryLabel,
		buildLucideIcon,
		getCategoryIconName,
		generateCategoryBackground,
		generateChildrenCategories,
		generateTopicClass,
		membershipBtn,
		spawnPrivilegeStates,
		localeToHTML,
		renderTopicImage,
		renderDigestAvatar,
		userAgentIcons,
		buildAvatar,
		increment,
		generateWroteReplied,
		generateRepliedTo,
		generateWrote,
		encodeURIComponent: _encodeURIComponent,
		isoTimeToLocaleString,
		shouldHideReplyContainer,
		humanReadableNumber,
		formattedNumber,
		txEscape,
		uploadBasename,
		generatePlaceholderWave,
		register,
		__escape: identity,
	};

	function identity(str) {
		return str;
	}

	function displayMenuItem(data, index) {
		const item = data.navigation[index];
		if (!item) {
			return false;
		}

		if (item.route.match('/users') && data.user && !data.user.privileges['view:users']) {
			return false;
		}

		if (item.route.match('/tags') && data.user && !data.user.privileges['view:tags']) {
			return false;
		}

		if (item.route.match('/groups') && data.user && !data.user.privileges['view:groups']) {
			return false;
		}

		return true;
	}

	function buildMetaTag(tag) {
		const name = tag.name ? 'name="' + tag.name + '" ' : '';
		const property = tag.property ? 'property="' + tag.property + '" ' : '';
		const content = tag.content ? 'content="' + tag.content.replace(/\n/g, ' ') + '" ' : '';

		return '<meta ' + name + property + content + '/>\n\t';
	}

	function buildLinkTag(tag) {
		const attributes = ['link', 'rel', 'as', 'type', 'href', 'sizes', 'title', 'crossorigin'];
		const [link, rel, as, type, href, sizes, title, crossorigin] = attributes.map(attr => (tag[attr] ? `${attr}="${tag[attr]}" ` : ''));

		return '<link ' + link + rel + as + type + sizes + title + href + crossorigin + '/>\n\t';
	}

	function stringify(obj) {
		// Turns the incoming object into a JSON string
		return JSON.stringify(obj).replace(/&/gm, '&amp;').replace(/</gm, '&lt;').replace(/>/gm, '&gt;')
			.replace(/"/g, '&quot;');
	}

	function escape(str) {
		return utils.escapeHTML(str);
	}

	function stripTags(str) {
		return utils.stripHTMLTags(str);
	}

	function buildCategoryIcon(category, size, rounded) {
		if (!category) {
			return '';
		}

		return `<span class="icon d-inline-flex justify-content-center align-items-center align-middle ${rounded}" style="${generateCategoryBackground(category)} width:${size}; height: ${size}; font-size: ${parseInt(size, 10) / 2}px;">${category.icon ? `<i class="fa fa-fw ${category.icon}"></i>` : ''}</span>`;
	}

	function buildCategoryLabel(category, tag = 'a', className = '') {
		if (!category) {
			return '';
		}

		const href = tag === 'a' ? `href="${relative_path}/category/${category.slug}"` : '';
		return `<${tag} ${href} class="badge px-1 text-truncate text-decoration-none ${className}" style="color: ${category.color};background-color: ${category.bgColor};border-color: ${category.bgColor}!important; max-width: 70vw;">
			${category.icon && category.icon !== 'fa-nbb-none' ? `<i class="fa fa-fw ${category.icon}"></i>` : ''}
			${category.name}
		</${tag}>`;
	}

	/**
	 * Build a Lucide icon HTML element
	 * @param {string} iconName - Name of the Lucide icon (e.g., 'home', 'user', 'settings')
	 * @param {number|string} size - Size in pixels (default: 24)
	 * @param {string} className - Additional CSS classes
	 * @param {string} color - Icon color (default: 'currentColor')
	 * @param {number} strokeWidth - Stroke width (default: 2)
	 * @returns {string} HTML string for the icon
	 */
	function buildLucideIcon(iconName, size = 24, className = '', color = 'currentColor', strokeWidth = 2) {
		if (!iconName) {
			return '';
		}

		// Convert FontAwesome icon names to Lucide if needed
		const faToLucideMap = {
			'fa-home': 'home',
			'fa-user': 'user',
			'fa-users': 'users',
			'fa-cog': 'settings',
			'fa-gear': 'settings',
			'fa-settings': 'settings',
			'fa-search': 'search',
			'fa-envelope': 'mail',
			'fa-bell': 'bell',
			'fa-heart': 'heart',
			'fa-star': 'star',
			'fa-bars': 'menu',
			'fa-navicon': 'menu',
			'fa-times': 'x',
			'fa-xmark': 'x',
			'fa-close': 'x',
			'fa-check': 'check',
			'fa-plus': 'plus',
			'fa-minus': 'minus',
			'fa-trash': 'trash-2',
			'fa-trash-can': 'trash-2',
			'fa-edit': 'edit',
			'fa-pen': 'pen',
			'fa-pen-to-square': 'pen-square',
			'fa-square-pen': 'pen-square',
			'fa-pencil': 'pencil',
			'fa-share': 'share-2',
			'fa-share-from-square': 'share-2',
			'fa-arrow-right': 'arrow-right',
			'fa-arrow-left': 'arrow-left',
			'fa-arrow-up': 'arrow-up',
			'fa-arrow-down': 'arrow-down',
			'fa-chevron-right': 'chevron-right',
			'fa-chevron-left': 'chevron-left',
			'fa-chevron-up': 'chevron-up',
			'fa-chevron-down': 'chevron-down',
			'fa-circle-info': 'info',
			'fa-info-circle': 'info',
			'fa-circle-question': 'help-circle',
			'fa-question-circle': 'help-circle',
			'fa-circle-exclamation': 'alert-circle',
			'fa-exclamation-circle': 'alert-circle',
			'fa-triangle-exclamation': 'alert-triangle',
			'fa-exclamation-triangle': 'alert-triangle',
			'fa-circle-check': 'check-circle',
			'fa-check-circle': 'check-circle',
			'fa-circle-xmark': 'x-circle',
			'fa-times-circle': 'x-circle',
			'fa-lock': 'lock',
			'fa-unlock': 'unlock',
			'fa-eye': 'eye',
			'fa-eye-slash': 'eye-off',
			'fa-calendar': 'calendar',
			'fa-clock': 'clock',
			'fa-clock-o': 'clock',
			'fa-comment': 'message-circle',
			'fa-comments': 'message-square',
			'fa-message': 'message-square',
			'fa-file': 'file',
			'fa-folder': 'folder',
			'fa-image': 'image',
			'fa-camera': 'camera',
			'fa-video': 'video',
			'fa-music': 'music',
			'fa-download': 'download',
			'fa-upload': 'upload',
			'fa-link': 'link',
			'fa-unlink': 'unlink',
			'fa-link-slash': 'link-2-off',
			'fa-paperclip': 'paperclip',
			'fa-thumbtack': 'pin',
			'fa-bookmark': 'bookmark',
			'fa-flag': 'flag',
			'fa-tag': 'tag',
			'fa-tags': 'tags',
			'fa-phone': 'phone',
			'fa-phone-volume': 'phone',
			'fa-globe': 'globe',
			'fa-map-marker': 'map-pin',
			'fa-location-dot': 'map-pin',
			'fa-print': 'printer',
			'fa-copy': 'copy',
			'fa-clipboard': 'clipboard',
			'fa-filter': 'filter',
			'fa-sort': 'arrow-up-down',
			'fa-sort-up': 'arrow-up',
			'fa-sort-down': 'arrow-down',
			'fa-list': 'list',
			'fa-list-ul': 'list',
			'fa-list-ol': 'list-ordered',
			'fa-table': 'table',
			'fa-th': 'layout-grid',
			'fa-ellipsis': 'more-horizontal',
			'fa-ellipsis-vertical': 'more-vertical',
			'fa-play': 'play',
			'fa-pause': 'pause',
			'fa-circle-play': 'play-circle',
			'fa-circle-pause': 'pause-circle',
			'fa-refresh': 'refresh-cw',
			'fa-arrows-rotate': 'refresh-cw',
			'fa-arrow-rotate-right': 'rotate-cw',
			'fa-arrow-rotate-left': 'rotate-ccw',
			'fa-window-maximize': 'maximize',
			'fa-window-minimize': 'minimize',
			'fa-right-from-bracket': 'log-out',
			'fa-sign-out': 'log-out',
			'fa-right-to-bracket': 'log-in',
			'fa-sign-in': 'log-in',
			'fa-user-plus': 'user-plus',
			'fa-user-minus': 'user-minus',
			'fa-circle-user': 'user-circle',
			'fa-shield': 'shield',
			'fa-code': 'code',
			'fa-bug': 'bug',
			'fa-chart-pie': 'pie-chart',
			'fa-database': 'database',
			'fa-server': 'server',
			'fa-cloud': 'cloud',
			'fa-paper-plane': 'send',
			'fa-reply': 'reply',
			'fa-reply-all': 'reply-all',
			'fa-square-plus': 'square-plus',
			'fa-square-minus': 'square-minus',
			'fa-sun': 'sun',
			'fa-moon': 'moon',
			'fa-face-smile': 'smile',
			'fa-thumbs-up': 'thumbs-up',
			'fa-thumbs-down': 'thumbs-down',
			'fa-graduation-cap': 'graduation-cap',
			'fa-book': 'book',
			'fa-newspaper': 'newspaper',
			'fa-gift': 'gift',
			'fa-shopping-cart': 'shopping-cart',
			'fa-smartphone': 'smartphone',
			'fa-mobile-screen-button': 'smartphone',
			'fa-laptop': 'laptop',
			'fa-monitor': 'monitor',
			'fa-headphones': 'headphones',
			'fa-microphone': 'mic',
			'fa-microphone-slash': 'mic-off',
			'fa-nbb-none': 'circle-dot',
		};

		// Convert icon name if it starts with 'fa-'
		let lucideIconName = iconName.startsWith('fa-') ? faToLucideMap[iconName] || iconName.replace(/^fa-/, '') : iconName;

		// Ensure size is a number
		const iconSize = typeof size === 'string' ? parseInt(size, 10) : size;

		// Build the icon element using data attributes for Lucide
		return `<i data-lucide="${lucideIconName}" data-lucide-size="${iconSize}" data-lucide-stroke-width="${strokeWidth}" class="lucide-icon ${className}" ${color !== 'currentColor' ? `style="color: ${color}"` : ''}></i>`;
	}

	function generateCategoryBackground(category) {
		if (!category) {
			return '';
		}
		const style = [];

		if (category.bgColor) {
			style.push('background-color: ' + category.bgColor);
			style.push(`border-color: ${category.bgColor}!important`);
		}

		if (category.color) {
			style.push('color: ' + category.color);
		}

		if (category.backgroundImage) {
			style.push('background-image: url(' + category.backgroundImage + ')');
			if (category.imageClass) {
				style.push('background-size: ' + category.imageClass);
			}
		}

		return style.join('; ') + ';';
	}

	function generateChildrenCategories(category) {
		let html = '';
		if (!category || !category.children || !category.children.length) {
			return html;
		}
		category.children.forEach(function (child) {
			if (child && !child.isSection) {
				const link = child.link ? child.link : (relative_path + '/category/' + child.slug);
				html += '<span class="category-children-item float-start">' +
					'<div role="presentation" class="icon float-start" style="' + generateCategoryBackground(child) + '">' +
					'<i class="fa fa-fw ' + child.icon + '"></i>' +
					'</div>' +
					'<a href="' + link + '"><small>' + child.name + '</small></a></span>';
			}
		});
		html = html ? ('<span class="category-children">' + html + '</span>') : html;
		return html;
	}

	function generateTopicClass(topic) {
		const fields = ['locked', 'pinned', 'deleted', 'unread', 'scheduled'];
		return fields.filter(field => !!topic[field]).join(' ');
	}

	// Groups helpers
	function membershipBtn(groupObj, btnClass = '') {
		if (groupObj.isMember && groupObj.name !== 'administrators') {
			return `<button class="btn btn-danger ${btnClass}" data-action="leave" data-group="${groupObj.displayName}" ${(groupObj.disableLeave ? ' disabled' : '')}><i class="fa fa-times"></i> [[groups:membership.leave-group]]</button>`;
		}

		if (groupObj.isPending && groupObj.name !== 'administrators') {
			return `<button class="btn btn-warning disabled ${btnClass}"><i class="fa fa-clock-o"></i> [[groups:membership.invitation-pending]]</button>`;
		} else if (groupObj.isInvited) {
			return `<button class="btn btn-warning" data-action="rejectInvite" data-group="${groupObj.displayName}">[[groups:membership.reject]]</button><button class="btn btn-success" data-action="acceptInvite" data-group="${groupObj.name}"><i class="fa fa-plus"></i> [[groups:membership.accept-invitation]]</button>`;
		} else if (!groupObj.disableJoinRequests && groupObj.name !== 'administrators') {
			return `<button class="btn btn-success ${btnClass}" data-action="join" data-group="${groupObj.displayName}"><i class="fa fa-plus"></i> [[groups:membership.join-group]]</button>`;
		}
		return '';
	}

	function spawnPrivilegeStates(cid, member, privileges, types) {
		const states = [];
		for (const [priv, state] of Object.entries(privileges)) {
			states.push({
				name: priv,
				state: state,
				type: types[priv],
			});
		}
		return states.map(function (priv) {
			const guestDisabled = ['groups:moderate', 'groups:posts:upvote', 'groups:posts:downvote', 'groups:local:login', 'groups:group:create'];
			const spidersEnabled = ['groups:find', 'groups:read', 'groups:topics:read', 'groups:view:users', 'groups:view:tags', 'groups:view:groups'];
			const globalModDisabled = ['groups:moderate'];
			let fediverseEnabled = ['groups:view:users', 'groups:find', 'groups:read', 'groups:topics:read', 'groups:topics:create', 'groups:topics:reply', 'groups:topics:tag', 'groups:posts:edit', 'groups:posts:history', 'groups:posts:delete', 'groups:posts:upvote', 'groups:posts:downvote', 'groups:topics:delete'];
			if (cid === -1) {
				fediverseEnabled = fediverseEnabled.slice(3);
			}
			const disabled =
				(member === 'guests' && (guestDisabled.includes(priv.name) || priv.name.startsWith('groups:admin:'))) ||
				(member === 'spiders' && !spidersEnabled.includes(priv.name)) ||
				(member === 'fediverse' && !fediverseEnabled.includes(priv.name)) ||
				(member === 'Global Moderators' && globalModDisabled.includes(priv.name));

			return `
				<td data-privilege="${priv.name}" data-value="${priv.state}" data-type="${priv.type}">
					<div class="form-check text-center">
						<input class="form-check-input float-none${(disabled ? ' d-none"' : '')}" autocomplete="off" type="checkbox"${(priv.state ? ' checked' : '')}${(disabled ? ' disabled="disabled" aria-diabled="true"' : '')} />
					</div>
				</td>
			`;
		}).join('');
	}

	function localeToHTML(locale, fallback) {
		locale = locale || fallback || 'en-GB';
		return locale.replace('_', '-');
	}

	function renderTopicImage(topicObj) {
		if (topicObj.thumb) {
			return '<img src="' + topicObj.thumb + '" class="img-circle user-img" title="' + topicObj.user.displayname + '" />';
		}
		return '<img component="user/picture" data-uid="' + topicObj.user.uid + '" src="' + topicObj.user.picture + '" class="user-img" title="' + topicObj.user.displayname + '" />';
	}

	function renderDigestAvatar(block) {
		if (block.teaser) {
			if (block.teaser.user.picture) {
				return '<img style="vertical-align: middle; width: 32px; height: 32px; border-radius: 9999px; border: 3.5px solid #FDFDFC; background: #FDFDFC; box-sizing: border-box;" src="' + block.teaser.user.picture + '" title="' + block.teaser.user.username + '" />';
			}
			return '<div style="vertical-align: middle; width: 32px; height: 32px; line-height: 25px; font-size: 14px; background-color: #FDFDFC; color: #122023; text-align: center; display: inline-block; border-radius: 9999px; border: 3.5px solid #FDFDFC; font-weight: 600; box-sizing: border-box;">' + block.teaser.user['icon:text'] + '</div>';
		}
		if (block.user.picture) {
			return '<img style="vertical-align: middle; width: 32px; height: 32px; border-radius: 9999px; border: 3.5px solid #FDFDFC; background: #FDFDFC; box-sizing: border-box;" src="' + block.user.picture + '" title="' + block.user.username + '" />';
		}
		return '<div style="vertical-align: middle; width: 32px; height: 32px; line-height: 25px; font-size: 14px; background-color: #FDFDFC; color: #122023; text-align: center; display: inline-block; border-radius: 9999px; border: 3.5px solid #FDFDFC; font-weight: 600; box-sizing: border-box;">' + block.user['icon:text'] + '</div>';
	}

	function userAgentIcons(data) {
		let icons = '';

		switch (data.platform) {
			case 'Linux':
				icons += '<i class="fa fa-fw fa-linux"></i>';
				break;
			case 'Microsoft Windows':
				icons += '<i class="fa fa-fw fa-windows"></i>';
				break;
			case 'Apple Mac':
				icons += '<i class="fa fa-fw fa-apple"></i>';
				break;
			case 'Android':
				icons += '<i class="fa fa-fw fa-android"></i>';
				break;
			case 'iPad':
				icons += '<i class="fa fa-fw fa-tablet"></i>';
				break;
			case 'iPod': // intentional fall-through
			case 'iPhone':
				icons += '<i class="fa fa-fw fa-mobile"></i>';
				break;
			default:
				icons += '<i class="fa fa-fw fa-question-circle"></i>';
				break;
		}

		switch (data.browser) {
			case 'Chrome':
				icons += '<i class="fa fa-fw fa-chrome"></i>';
				break;
			case 'Firefox':
				icons += '<i class="fa fa-fw fa-firefox"></i>';
				break;
			case 'Safari':
				icons += '<i class="fa fa-fw fa-safari"></i>';
				break;
			case 'IE':
				icons += '<i class="fa fa-fw fa-internet-explorer"></i>';
				break;
			case 'Edge':
				icons += '<i class="fa fa-fw fa-edge"></i>';
				break;
			default:
				icons += '<i class="fa fa-fw fa-question-circle"></i>';
				break;
		}

		return icons;
	}

	function buildAvatar(userObj, size, rounded, classNames, component) {
		/**
		 * userObj requires:
		 *   - uid, picture, icon:bgColor, icon:text (getUserField w/ "picture" should return all 4), username
		 * size: a picture size in the form of a value with units (e.g. 64px, 4rem, etc.)
		 * rounded: true or false (optional, default false)
		 * classNames: additional class names to prepend (optional, default none)
		 * component: overrides the default component (optional, default none)
		 */

		// Try to use root context if passed-in userObj is undefined
		if (!userObj) {
			userObj = this;
		}
		classNames = classNames || '';
		const attributes = new Map([
			['title', userObj.displayname],
			['data-uid', userObj.uid],
			['class', `avatar ${classNames}${rounded ? ' avatar-rounded' : ''}`],
		]);
		const styles = [`--avatar-size: ${size};`];
		const attr2String = attributes => Array.from(attributes).reduce((output, [prop, value]) => {
			output += ` ${prop}="${value}"`;
			return output;
		}, '');

		let output = '';

		if (userObj.picture) {
			output += `<img${attr2String(attributes)} alt="${userObj.displayname}" loading="lazy" component="${component || 'avatar/picture'}" src="${userObj.picture}" style="${styles.join(' ')}" onError="this.remove()" itemprop="image" />`;
		}
		output += `<span${attr2String(attributes)} component="${component || 'avatar/icon'}" style="${styles.join(' ')} background-color: ${userObj['icon:bgColor']}">${userObj['icon:text']}</span>`;
		return output;
	}

	function increment(value, inc) {
		return String(value + parseInt(inc, 10));
	}

	function generateWroteReplied(post, timeagoCutoff) {
		if (post.toPid) {
			return generateRepliedTo(post, timeagoCutoff);
		}
		return generateWrote(post, timeagoCutoff);
	}

	function generateRepliedTo(post, timeagoCutoff) {
		const displayname = post.parent && post.parent.displayname ?
			post.parent.displayname : '[[global:guest]]';
		const isBeforeCutoff = post.timestamp < (Date.now() - (timeagoCutoff * oneDayInMs));
		const langSuffix = isBeforeCutoff ? 'on' : 'ago';
		return `[[topic:replied-to-user-${langSuffix}, ${post.toPid}, ${relative_path}/post/${encodeURIComponent(post.toPid)}, ${displayname}, ${relative_path}/post/${encodeURIComponent(post.pid)}, ${post.timestampISO}]]`;
	}

	function generateWrote(post, timeagoCutoff) {
		const isBeforeCutoff = post.timestamp < (Date.now() - (timeagoCutoff * oneDayInMs));
		const langSuffix = isBeforeCutoff ? 'on' : 'ago';
		return `[[topic:wrote-${langSuffix}, ${relative_path}/post/${encodeURIComponent(post.pid)}, ${post.timestampISO}]]`;
	}

	function _encodeURIComponent(value) {
		return encodeURIComponent(value);
	}

	function isoTimeToLocaleString(isoTime, locale = 'en-GB') {
		return new Date(isoTime).toLocaleString([locale], {
			dateStyle: 'short',
			timeStyle: 'short',
		}).replace(/,/g, '&#44;');
	}

	function shouldHideReplyContainer(post) {
		if (post.replies.count <= 0 || post.replies.hasSingleImmediateReply) {
			return true;
		}

		return false;
	}

	function humanReadableNumber(number, toFixed = 1) {
		return utils.makeNumberHumanReadable(number, toFixed);
	}

	function formattedNumber(number) {
		return utils.addCommas(number);
	}

	function txEscape(text) {
		return String(text).replace(/%/g, '&#37;').replace(/,/g, '&#44;');
	}

	function uploadBasename(str, sep = '/') {
		const hasTimestampPrefix = /^\d+-/;
		const name = str.substr(str.lastIndexOf(sep) + 1);
		return hasTimestampPrefix.test(name) ? name.slice(14) : name;
	}

	function generatePlaceholderWave(items) {
		const html = items.map((i) => {
			if (i === 'divider') {
				return '<li class="dropdown-divider"></li>';
			}
			return `
			<li class="dropdown-item placeholder-wave">
				<div class="placeholder" style="width: 20px;"></div>
				<div class="placeholder col-${i}"></div>
			</li>`;
		});

		return html.join('');
	}

	function getCategoryIconName(identifier) {
		if (!identifier && identifier !== 0) {
			return 'folder';
		}

		const iconMap = {
			'1': 'messages-square',
			'2': 'heart-handshake',
			'3': 'building-2',
			'4': 'user-check',
		};
		const key = String(identifier);
		return iconMap[key] || 'folder';
	}

	function register() {
		Object.keys(helpers).forEach(function (helperName) {
			Benchpress.registerHelper(helperName, helpers[helperName]);
		});
	}

	return helpers;
};
