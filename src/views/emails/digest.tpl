<!-- IMPORT emails/partials/header.tpl -->

<!-- Email Body : BEGIN -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">

	<!-- 1 Column Text + Button : BEGIN -->
	<tr>
		<td bgcolor="#ffffff">
			<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
				<tr>
					<td style="padding: 16px 16px 4px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #333333;">
						<h1 style="margin: 0; font-size: 20px; line-height: 24px; color: #000000; font-weight: normal;">Hello {firstname},</h1>
					</td>
				</tr>
				<tr>
					<td style="padding: 0px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<h2 style="margin: 0 0 12px 0; font-size: 16px; line-height: 20px; color: #666666; font-weight: normal;">[[email:digest.title.{interval}]]</h2>
					</td>
				</tr>
				{{{ if notifications.length }}}
				<tr>
					<td style="padding: 0px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<ul style="margin: 0; padding: 0;">
							{{{ each notifications }}}
							<li style="text-decoration: none; list-style-type: none; padding-bottom: 0.5em;">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
									<tr>
										<td style="padding: 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; width: 32px;">
											{{{ if notifications.image }}}
											<img style="vertical-align: middle; width: 32px; height: 32px; border-radius: 9999px; border: 3.5px solid #FDFDFC; background: #f6ffa3; box-sizing: border-box;" src="{notifications.image}" alt="" />
											{{{ else }}}
											<div style="vertical-align: middle; width: 32px; height: 32px; line-height: 25px; font-size: 14px; background-color: #f6ffa3; color: #27454b; text-align: center; display: inline-block; border-radius: 9999px; border: 3.5px solid #FDFDFC; font-weight: 600; box-sizing: border-box;">{notifications.user.icon:text}</div>
											{{{ end }}}
										</td>
										<td style="padding: 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; line-height: 16px; color: #333333;">
											<p style="margin: 0; color: #333333;">{notifications.bodyShort}</p>
										</td>
									</tr>
								</table>
							</li>
							{{{ end }}}
						</ul>
					</td>
				</tr>
				{{{ end }}}
				{{{ if publicRooms.length }}}
				<tr>
					<td style="padding: 0px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<h3 style="margin: 16px 0 16px 0; font-size: 15px; line-height: 20px; color: #666666; font-weight: normal;">[[email:digest.unread-rooms]]</h3>
						<ul style="margin: 0; padding: 0;">
							{{{ each publicRooms }}}
							<li style="text-decoration: none; list-style-type: none; padding-bottom: 0.5em;">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
									<tr>
										<td style="padding: 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; line-height: 16px; color: #333333;">
											<p style="margin: 0; color: #333333;"># [[email:digest.room-name-unreadcount, {./roomName}, {./unreadCountText}]]</p>
										</td>
									</tr>
								</table>
							</li>
							{{{ end }}}
						</ul>
					</td>
				</tr>
				{{{ end }}}
				{{{ if topTopics.length }}}
				<tr>
					<td style="padding: 0px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<h3 style="margin: 16px 0 16px 0; font-size: 15px; line-height: 20px; color: #666666; font-weight: normal;">[[email:digest.top-topics, {site_title}]]</h3>
						<ul style="margin: 0; padding: 0;">
							{{{ each topTopics }}}
							<li style="text-decoration: none; list-style-type: none; padding-bottom: 0.5em;">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
									<tr>
										<td style="padding: 6px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; width: 32px; vertical-align: middle;">{function.renderDigestAvatar}</td>
										<td style="padding: 6px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; line-height: 16px; color: #333333;">
											<p style="margin: 0; color: #333333;"><strong>{topTopics.title}</strong></p>
											<p style="margin: 0; font-size: 12px; color: #666666; line-height: 16px;">{topTopics.teaser.user.displayname}</p>
										</td>
									</tr>
									<tr>
										<td colspan="2" style="padding: 8px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; line-height: 16px; color: #333333;">
											<p style="margin: 0; font-size: 13px; line-height: 20px; color: #666666;">{topTopics.teaser.content}</p>
										</td>
									</tr>
								</table>
							</li>
							{{{ if !@last }}}
							<li style="text-decoration: none; list-style-type: none; margin: 0px 64px 16px 64px; border-bottom: 1px solid #dddddd"></li>
							{{{ end }}}
							{{{ end }}}
						</ul>
					</td>
				</tr>
				{{{ end }}}
				{{{ if popularTopics.length }}}
				<tr>
					<td style="padding: 0px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<h3 style="margin: 16px 0 16px 0; font-size: 15px; line-height: 20px; color: #666666; font-weight: normal;">[[email:digest.popular-topics, {site_title}]]</h3>
						<ul style="margin: 0; padding: 0;">
							{{{ each popularTopics }}}
							<li style="text-decoration: none; list-style-type: none; padding-bottom: 0.5em;">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
									<tr>
										<td style="padding: 6px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; width: 32px; vertical-align: middle;">{function.renderDigestAvatar}</td>
										<td style="padding: 6px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; line-height: 16px; color: #333333;">
											<p style="margin: 0; color: #333333;"><strong>{popularTopics.title}</strong></p>
											<p style="margin: 0; font-size: 12px; color: #666666; line-height: 16px;">{popularTopics.teaser.user.displayname}</p>
										</td>
									</tr>
									<tr>
										<td colspan="2" style="padding: 8px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; line-height: 16px; color: #333333;">
											<p style="margin: 0; font-size: 13px; line-height: 20px; color: #666666;">{popularTopics.teaser.content}</p>
										</td>
									</tr>
								</table>
							</li>
							{{{ if !@last }}}
							<li style="text-decoration: none; list-style-type: none; margin: 0px 64px 16px 64px; border-bottom: 1px solid #dddddd"></li>
							{{{ end }}}
							{{{ end }}}
						</ul>
					</td>
				</tr>
				{{{ end }}}
				{{{ if recent.length }}}
				<tr>
					<td style="padding: 0px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<h3 style="margin: 16px 0 16px 0; font-size: 15px; line-height: 20px; color: #666666; font-weight: normal;">[[email:digest.latest-topics, {site_title}]]</h3>
						<ul style="margin: 0; padding: 0;">
							{{{ each recent }}}
							<li style="text-decoration: none; list-style-type: none; padding-bottom: 0.5em;">
								<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
									<tr>
										<td style="padding: 6px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol; width: 32px; vertical-align: middle;">{function.renderDigestAvatar}</td>
										<td style="padding: 6px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; line-height: 16px; color: #333333;">
											<p style="margin: 0; color: #333333;"><strong>{recent.title}</strong></p>
											<p style="margin: 0; font-size: 12px; color: #666666; line-height: 16px;">{recent.teaser.user.displayname}</p>
										</td>
									</tr>
									<tr>
										<td colspan="2" style="padding: 8px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; line-height: 16px; color: #333333;">
											<p style="margin: 0; font-size: 13px; line-height: 20px; color: #666666;">{recent.teaser.content}</p>
										</td>
									</tr>
								</table>
							</li>
							{{{ if !@last }}}
							<li style="text-decoration: none; list-style-type: none; margin: 0px 64px 16px 64px; border-bottom: 1px solid #dddddd"></li>
							{{{ end }}}
							{{{ end }}}
						</ul>
					</td>
				</tr>
				{{{ end }}}
				<tr>
					<td style="padding: 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; text-align: center;">
						<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
							<tr>
								<td class="button-td" style="border-radius: 9999px; background: #e6ff00; text-align: center;">
									<a class="button-a" href="{app_url}" style="background: #e6ff00; border: 1px solid #e6ff00; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 1; text-decoration: none; padding: 12px 24px; color: #27454b; display: inline-block; border-radius: 9999px; font-weight: bold; box-shadow: 0 2px 4px -2px rgba(0,0,0,0.05), 0 4px 6px -1px rgba(0,0,0,0.05);">Open App</a>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		</td>
	</tr>
	<!-- 1 Column Text + Button : END -->

</table>
<!-- Email Body : END -->

<!-- IMPORT emails/partials/footer.tpl -->
