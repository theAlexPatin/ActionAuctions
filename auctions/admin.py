from django.contrib import admin

from .models import Auction
from .models import Bid

class AuctionAdmin(admin.ModelAdmin):
	list_display = ['auction_id',
					'location',
					'city',
					'state',
					'description',
					'current_amount',
					'highest_bidder',
					'highest_bid',
					'ending_time']

class BidAdmin(admin.ModelAdmin):
	list_display = ['auction_id',
					'stripe_id',
					'email',
					'name',
					'amount',
					'time']


admin.site.register(Auction, AuctionAdmin)
admin.site.register(Bid, BidAdmin)