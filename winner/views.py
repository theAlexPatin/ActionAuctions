from django.shortcuts import render, redirect
from auctions.models import Auction
from auctions.models import Bid
from .forms import ButtonForm
import stripe
from mysite import settings
from math import floor
# Create your views here.

def winner(request, winner_id=None):
	try:
		auction = Auction.objects.get(winner_url=winner_id)
		if auction.reimbursed:
			return render(request, 'not_found.html')
		bidder = Bid.objects.get(stripe_id=auction.highest_bidder)
		donate_form = ButtonForm(winner_id=winner_id, donate=True)
		reimburse_form = ButtonForm(winner_id=winner_id, donate=False)
		context={'donate_form':donate_form, 'reimburse_form':reimburse_form}
		return render(request, 'winner.html', context)
	except:
		return render(request, 'not_found.html')

def button_press(request):
	if request.method == 'POST':
		try:
			form = request.POST.dict()
			if form['donate'] == 'False':
				return reimburse(request, form['winner_id'])
			else:
				return donate(request, form['winner_id'])
		except:
			return render('not_found.html')
	else:
		return render('not_found.html')

def reimburse(request, winner_id):
	try:
		auction = Auction.objects.get(winner_url=winner_id)
		bid = Bid.objects.get(stripe_id=auction.highest_bidder)
		print('here')
		stripe.api_key = settings.STRIPE_API_KEY
		response = stripe.Refund.create(
			charge=bid.stripe_id,
			amount=floor(auction.current_amount/2)
		)
		print(response)
		auction.reimbursed = False
		auction.save()
		return render(request, 'reimbursed.html')
	except:
		return render(request, 'payment-issue.html')

def donate(request, winner_id):
	auction = Auction.objects.get(winner_url=winner_id)
	auction.reimbursed = False
	auction.save()
	return render(request, 'donated.html')