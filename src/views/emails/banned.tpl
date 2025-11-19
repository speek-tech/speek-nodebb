<!-- IMPORT emails/partials/header.tpl -->

<!-- Email Body : BEGIN -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">
	<!-- 1 Column Text + Button : BEGIN -->
	<tr>
		<td bgcolor="#ffffff">
			<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
				<tr>
					<td style="padding: 16px 16px 6px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #333333;">
						<h1 style="margin: 0; font-size: 20px; line-height: 24px; color: #000000; font-weight: normal;">Hello {firstname},</h1>
					</td>
				</tr>
				<tr>
					<td style="padding: 0px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<h2 style="margin: 0; font-size: 16px; line-height: 20px; color: #666666; font-weight: normal;">[[email:banned.text1, {username}, {site_title}]]</h2>
					</td>
				</tr>
				{{{ if reason }}}
				<tr>
					<td style="padding: 20px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<p style="margin: 0; color: #666666;">
							[[email:banned.text3]]
						</p>
						<p style="margin: 0; font-size: 13px; line-height: 20px; color: #666666;">
							{reason}
						</p>
					</td>
				</tr>
				{{{ end }}}
				{{{ if until }}}
				<tr>
					<td style="padding: 20px 16px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<p style="margin: 0; color: #666666;">
							[[email:banned.text2, {until}]]
						</p>
					</td>
				</tr>
				{{{ end }}}
			</table>
		</td>
	</tr>
	<!-- 1 Column Text + Button : END -->

</table>
<!-- Email Body : END -->

<!-- IMPORT emails/partials/footer.tpl -->
