<!-- IMPORT emails/partials/header.tpl -->

<!-- Email Body : BEGIN -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width: 600px;">
	<!-- 1 Column Text + Button : BEGIN -->
	<tr>
		<td bgcolor="#ffffff">
			<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
				<tr>
					<td style="padding: 30px 30px 6px 30px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #333333;">
						<h1 style="margin: 0; font-size: 20px; line-height: 24px; color: #000000; font-weight: normal;">[[email:greeting-no-name]]</h1>
					</td>
				</tr>
				<tr>
					<td style="padding: 0px 30px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<h2 style="margin: 0; font-size: 16px; line-height: 20px; color: #666666; font-weight: normal;">[[email:invitation.text1, {username}, {site_title}]]</h2>
					</td>
				</tr>
				<tr>
					<td style="padding: 20px 30px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; color: #666666;">
						<p style="margin: 0; font-size: 13px; line-height: 20px; color: #666666;">[[email:invitation.text2, {expireDays}]]</p>
					</td>
				</tr>
				<tr>
					<td style="padding: 20px 30px; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 14px; line-height: 20px; text-align: center;">
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
