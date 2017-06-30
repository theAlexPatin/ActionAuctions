from django.shortcuts import render, redirect
from .forms import ButtonForm
from .forms import AuctionForm
from .forms import CreditCardForm
import psycopg2 as pspg
from .models import Auction
from .models import Bid
from .email_confirmation import generate_email
import datetime
from mysite import settings
import stripe
from django.utils.timezone import now
import datetime
from django.core.exceptions import PermissionDenied
from django.db import Error


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
		form = ButtonForm(auction_id=auction_id)
		context = {
			'auction_id':auction_id, 
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
		if 'amount' in form: ##If CC_form
			return checkout(request, form)
		else:
			auction_id = form['auction_id']
			cc_form = CreditCardForm(auction_id=auction_id)
			auction = Auction.objects.get(auction_id=auction_id)
			context = {"charity":auction.charity,"form":cc_form}
			return render(request, 'donate.html', context)	
	except:
		return render(request, 'error.html')


def checkout(request, form):
	try:
		auction_id = form['auction_id']
		auction = Auction.objects.get(auction_id=auction_id)
		amount = form['amount']
		amount = 1
		name = form['name']
		cvc = form['cvc']
		card_number = form['card_number']
		exp_month = form['exp_month']
		exp_year = form['exp_year']
		email = form['email']
		end_time = auction.ending_time
		print('info extracted')

		charged, charge_id = stripe_payment(
			exp_month,
			exp_year,
			card_number,
			cvc,
			name,
			amount, 
			auction.charity
		)
		print('paid')

		if charged:
			b = Bid()
			b.auction_id= auction_id
			b.amount = int(amount*100)
			b.stripe_id = str(charge_id)
			b.email = email
			b.name = name
			b.save()
			print('bid saved')
			
			if int(amount*100) > auction.highest_bid:
				auction.highest_bid = int(amount*100)
				auction.highest_bidder = charge_id
				auction.save()
				print('highest bid updated')
			
			generate_email(
				email, 
				name.split(' ')[0], 
				amount, 
				auction.charity,
				end_time)
			print('email sent')
			
			context = {
				'amount':form['amount'],
				'charity':auction.charity,
				'end_time':end_time
			}
			return render(request, "confirmation.html", context)
		else:
			return render(request, "payment-error.html")
	except:	
		return render(request, "payment-error.html")

def stripe_payment(exp_month, exp_year, number, cvc, name, amount, charity):
    amount = int(amount * 100)
    stripe.api_key = settings.STRIPE_API_KEY
    print(amount)
    ''''token = stripe.Token.create(
	    card={
	        "number": int(number),
	        "exp_month": int(exp_month),
	        "exp_year": int(exp_year),
	        "cvc": str(cvc),
	        "name": str(name),
	    },
	)'''
    card={
        "exp_month":int(exp_month),
        "exp_year":int(exp_year),
        "number":str(number),
        "cvc":str(cvc),
        "name":str(name)
    }
    print(card)
    try:
        response = stripe.Charge.create(
            amount=int(amount*100),
            currency="usd",
            description="Donation to %s"%charity,
            card=card
        )
        print('payment')
    except:

        return False, "error"
    return True, response['id']