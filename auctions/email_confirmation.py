import smtplib
from email.mime.text import MIMEText

#EDIT THIS TO CHANGE EMAIL
SMTP_SERVER = "smtp.mail.yahoo.com"
SMTP_PORT = "587" #try 465 if not working
USERNAME = "charitylabs@yahoo.com"
PASSWORD = "420Blazeit6969"
#########################

_template = """
Hey, {name}!

Thank you for your generous donation to {charity}!

Make sure to check back in on {{end_time}} to see if you've won!

Donation Event: {{location}}
Donation Total: {{amount}}


"""

def generate_email(to_email, name, amount, charity, location, end_time):
	msg = MIMEText(template.format(
			name=name,
			charity=charity,
			end_time=end_time,
			location=location,
			amount=str(amount)
		))
	msg['From'] = USERNAME
	msg['To'] = to_email

	s = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
	s.starttls()
	s.login(USERNAME, PASSWORD)
	s.send_message(msg)