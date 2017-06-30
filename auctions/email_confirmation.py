import smtplib
from email.mime.text import MIMEText

#EDIT THIS TO CHANGE EMAIL
SMTP_SERVER = "smtp.mail.yahoo.com"
SMTP_PORT = "587" #try 465 if not working
USERNAME = "charity_labs@yahoo.com"
PASSWORD = "420Blazeit6969"
#########################

_template = """
Hey, {name}!

Thank you for your generous donation to {charity}!

Make sure to check back in on {end_time} to see if you've won!

Donation Total: {amount}


"""

def generate_email(to_email, name, amount, charity, end_time):
	print('here')
	msg = MIMEText(_template.format(
			name=name,
			charity=charity,
			end_time=end_time,
			amount=str(amount)
		))
	msg['Subject'] = 'Donation to %s'%charity
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
	generate_email('a.patin96@gmail.com', 'Alexander', 1.50, 'Against Malaria Foundation', '6/26/17 at 9:40')

if __name__ == '__main__':
	test()