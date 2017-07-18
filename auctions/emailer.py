import smtplib
from email.mime.text import MIMEText

#EDIT THIS TO CHANGE EMAIL
SMTP_SERVER = "smtp.mail.yahoo.com"
SMTP_PORT = "587" #try 465 if not working
USERNAME = "charity_labs@yahoo.com"
PASSWORD = "420Blazeit6969"
#########################


_winner_template = """
	Congratulations!

	You made the largest donation, so you've won ${amount}. 

	But wait!

	You can still choose to donate your earnings and feel great about yourself!

	Follow the link below to redeem your earnings or donate them to {charity}

	{link}
"""

_confirmation_template = """
Hey, friend!

Thank you for your generous donation to {charity}!

Make sure to check back in on {end_time} to see if you've won!

Donation Total: {amount}


"""

def email_winner(to_email, amount, charity, link):
	msg = MIMEText(_winner_template.format(
			amount=amount,
			charity=charity,
			link=link
		))
	msg['Subject'] = "You've won the Auction!"
	_send_mail(msg, to_email)

def generate_confirmation(to_email, amount, charity, end_time):
	print('here')
	msg = MIMEText(_confirmation_template.format(
			charity=charity,
			end_time=end_time,
			amount=str(amount)
		))
	msg['Subject'] = 'Donation to %s'%charity
	_send_mail(msg, to_email)

	


def _send_mail(msg, to_email):
	msg['From'] = USERNAME
	msg['To'] = to_email
	s = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
	print('server connected')
	s.starttls()
	print('connected started')
	s.login(USERNAME, PASSWORD)
	print('logged in')
	s.send_message(msg)
	print('email sent')


def test():
	generate_confirmation('a.patin96@gmail.com', 'Alexander', 1.50, 'Against Malaria Foundation', '6/26/17 at 9:40')

if __name__ == '__main__':
	test()