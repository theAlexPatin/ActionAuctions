from django import forms
from django.forms.widgets import HiddenInput
from decimal import Decimal


class ButtonForm(forms.Form):
	winner_id = forms.CharField(max_length=20, required=True)
	donate = forms.BooleanField()
	def __init__(self, *args, **kwargs):
		winner_id = kwargs.pop('winner_id')
		donate = kwargs.pop('donate')
		super(ButtonForm, self).__init__(*args, **kwargs)
		self.fields['winner_id'].widget = HiddenInput()
		self.fields['winner_id'].initial = winner_id
		self.fields['donate'].widget = HiddenInput()
		self.fields['donate'].initial = donate