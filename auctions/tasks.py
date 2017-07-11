from __future__ import absolute_import, unicode_literals
from django.shortcuts import render, redirect
from celery import shared_task
from .models import Auction
from .models import Bid
from .emailer import email_winner
from uuid import uuid4
from math import floor

@shared_task
def end_auction(auction_id):
	host = 'http://localhost:8000'
	winner_id = str(uuid4()).replace('-','')[:10]
	url = '{}/winner/{}'.format(host, winner_id)
	print(url)
	auction = Auction.objects.get(auction_id=auction_id)
	amount = floor(auction.current_amount / 2)
	bid = Bid.objects.get(stripe_id=auction.highest_bidder)
	email_winner(bid.email, amount, auction.charity, url)
	auction.winner_url = winner_id
	auction.has_ended = True
	auction.save()


def test(request, auction_id):
	auction_id = 'abcdef'
	end_auction(auction_id)
	return render(request, 'welcome.html')