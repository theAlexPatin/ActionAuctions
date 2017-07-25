from django import forms
from django.forms.widgets import HiddenInput
from decimal import Decimal

#Donate/Spectate Button
class ButtonForm(forms.Form):
	auction_id = forms.CharField(max_length=20, required=True)
	def __init__(self, *args, **kwargs):
		button_id = kwargs.pop('auction_id')
		super(ButtonForm, self).__init__(*args, **kwargs)
		self.fields['auction_id'].widget = HiddenInput()
		self.fields['auction_id'].initial = button_id

class DonateForm(forms.Form):
	auction_id = forms.CharField(max_length=20, required=True)
	stripe_id = forms.CharField(max_length=30, required=True)
	amount = forms.IntegerField()
	email = forms.CharField(max_length=150, required=True)
	def __init__(self, *args, **kwargs):
		auction_id = kwargs.pop('auction_id')
		stripe_id = kwargs.pop('stripe_id')
		amount = kwargs.pop('amount')
		email = kwargs.pop('email')
		super(DonateForm, self).__init__(*args, **kwargs)
		self.fields['auction_id'].widget = HiddenInput()
		self.fields['auction_id'].initial = auction_id
		self.fields['stripe_id'].initial = stripe_id
		self.fields['stripe_id'].widget = HiddenInput()
		self.fields['amount'].initial = amount
		self.fields['amount'].widget = HiddenInput()
		self.fields['email'].initial = email
		self.fields['email'].widget = HiddenInput()
#Search form for Auctions
class AuctionForm(forms.Form):
	auction_id = forms.CharField(max_length=20, required=True, label="Auction Key")