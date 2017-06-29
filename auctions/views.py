from django.shortcuts import render, redirect
from .forms import ButtonForm
from .forms import AuctionForm
from .forms import CreditCardForm
import psycopg2 as pspg
from .models import Auction
from .models import Bid

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
		if 'name' in form:
			return render(request, 'error.html')
			#Do credit card stuff
		else:
			auction_id = form['auction_id']
			cc_form = CreditCardForm(auction_id=auction_id)
			auction = Auction.objects.get(auction_id=auction_id)
			context = {"charity":auction.charity,"form":cc_form}
			return render(request, 'donate.html', context)	
	except:
		return render(request, 'error.html')