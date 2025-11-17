Hello {firstname},

[[email:digest.title.{interval}]]

{{{ if notifications.length }}}
=== [[email:digest.notifications]] ===

{{{ each notifications }}}
• {notifications.bodyShort}

{{{ end }}}
{{{ end }}}

{{{ if publicRooms.length }}}
=== [[email:digest.unread-rooms]] ===

{{{ each publicRooms }}}
• # [[email:digest.room-name-unreadcount, {./roomName}, {./unreadCountText}]]

{{{ end }}}
{{{ end }}}

{{{ if topTopics.length }}}
=== [[email:digest.top-topics, {site_title}]] ===

{{{ each topTopics }}}
{@index}. {topTopics.title}
   By: {topTopics.teaser.user.displayname}
   {topTopics.teaser.content}

{{{ end }}}
{{{ end }}}

{{{ if popularTopics.length }}}
=== [[email:digest.popular-topics, {site_title}]] ===

{{{ each popularTopics }}}
{@index}. {popularTopics.title}
   By: {popularTopics.teaser.user.displayname}
   {popularTopics.teaser.content}

{{{ end }}}
{{{ end }}}

{{{ if recent.length }}}
=== [[email:digest.latest-topics, {site_title}]] ===

{{{ each recent }}}
{@index}. {recent.title}
   By: {recent.teaser.user.displayname}
   {recent.teaser.content}

{{{ end }}}
{{{ end }}}

───────────────────────────────────
Open the app to see the latest updates from {site_title}:
{app_url}

