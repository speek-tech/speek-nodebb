<!-- IMPORT emails/partials/header.tpl -->

<!-- Email Body : BEGIN -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">

	<!-- 1 Column Text + Button : BEGIN -->
	<tr>
		<td bgcolor="#ffffff">
			<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
				<tr>
					<td style="padding: 30px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #333333;">
						<h1 style="margin: 0 0 10px 0; font-size: 20px; line-height: 24px; color: #000000; font-weight: normal;">[[email:welcome.text1, {site_title}]]</h1>
						<p style="margin: 0; color: #666666;">[[email:welcome.text2]]</p>
					</td>
				</tr>
				<tr>
					<td style="padding: 24px 30px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<p style="margin: 0; color: #666666;">Please verify your email address through the app:</p>
						<p style="margin: 8px 0 0 0;"><a href="{app_url}" style="color: #000000; text-decoration: underline;">{app_url}</a></p>
					</td>
				</tr>
			</table>
		</td>
	</tr>
	<!-- 1 Column Text + Button : END -->

</table>
<!-- Email Body : END -->

<!-- IMPORT emails/partials/footer.tpl -->
