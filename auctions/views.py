from django.shortcuts import render
# Create your views here.

def index(request):
	return render(request,'welcome.html')

def auction(request, auction_id):
	context = {'auction_id':auction_id}
	return render(request, 'auction.html', context)
