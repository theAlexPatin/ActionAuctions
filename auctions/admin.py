from django.contrib import admin

from .models import Auction

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

admin.site.register(Auction, AuctionAdmin)