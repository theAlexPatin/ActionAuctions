from django.shortcuts import render, redirect
from .forms import ButtonForm
from .forms import AuctionForm
from .forms import DonateForm
import psycopg2 as pspg
from .models import Auction
from .models import Bid
from .emailer import generate_confirmation
import datetime
from mysite import settings
import stripe
from django.utils.timezone import now
import datetime
from django.core.exceptions import PermissionDenied
from django.db import Error
from decimal import Decimal


# Create your views here.

def index(request):
	if request.method == 'POST':
		form = request.POST.dict()
		return redirect('/%s'%form['auction_id'])
	form = AuctionForm()
	context = {'form':form}
	return render(request,'welcome.html', context)

def auction(request, auction_id):
	try:
		auction = Auction.objects.get(auction_id=auction_id)
		if auction.has_ended:
			context = {
				'location':auction.location,
				'city':auction.city,
				'state':auction.state,
				'description':auction.description,
				'charity':auction.charity,
				'amount':auction.current_amount,
				'highest_bid':auction.highest_bid
			}
			return render(request,'auction-ended.html',context)
		form = ButtonForm(auction_id=auction_id)
		context = {
			'location':auction.location,
			'city':auction.city,
			'state':auction.state,
			'description':auction.description,
			'charity':auction.charity,
			'form':form
		}
		return render(request, 'auction.html', context)
	except:
		return render(request, 'error.html')

def donate(request):		
	try:
		form = request.POST.dict()
		if 'stripe_id' in form: ##If CC_form
			return checkout(request, form)
		else:
			auction_id = form['auction_id']
			auction = Auction.objects.get(auction_id=auction_id)
			form = DonateForm(auction_id=auction_id, stripe_id="", amount=Decimal("0.50"), email='')
			print('here')
			context = {
				"charity":auction.charity,
				"auction_id":auction_id,
				"stripe_key":settings.STRIPE_PUBLIC_KEY,
				"form":form
			}
			return render(request, 'donate.html', context)	
	except:
		return render(request, 'error.html')


def checkout(request, form):
	try:
		print(form)
		auction = Auction.objects.get(auction_id=form['auction_id'])
		if auction.has_ended:
			context = {'charity':auction.charity}
			return render(request, 'took-too-long.html', charity)
		amount = form['amount']
		email = form['email']
		token = form['stripe_id']
		charged, charge_id = stripe_payment(amount, auction.charity, token)
		print('paid')
		print(charged, charge_id)

		if charged:
			b = Bid()
			print('bid created')
			b.auction_id= auction.auction_id
			b.amount = int(amount)
			b.stripe_id = str(charge_id)
			b.email = email
			print('bid set')
			b.save()
			print('bid saved')
			
			auction.current_amount += int(amount)
			if int(amount) > auction.highest_bid:
				auction.highest_bid = int(amount)
				auction.highest_bidder = charge_id
				print('highest bid updated')
			auction.save()
			print('current amount incremented')
			generate_confirmation(
				email, 
				Decimal(amount)/Decimal(100), 
				auction.charity,
				auction.ending_time)
			print('email sent')
			
			context = {
				'amount':Decimal(amount)/Decimal(100),
				'charity':auction.charity,
				'end_time':auction.ending_time
			}
			return render(request, "confirmation.html", context)
		else:
			return render(request, "payment-error.html")
	except:	
		return render(request, "payment-error.html")

def stripe_payment(amount, charity, token):
    stripe.api_key = settings.STRIPE_API_KEY
    try:
        response = stripe.Charge.create(
            amount=int(amount),
            currency="usd",
            description="Donation to %s"%charity,
            source=token
        )
        print('payment made')
    except:

        return False, "error"
    return True, response['id']