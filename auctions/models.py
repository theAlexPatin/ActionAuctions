from django.db import models

# Create your models here.

class Auction(models.Model):
	auction_id = models.CharField(max_length=20, unique=True)
	charity = models.CharField(max_length=80)
	location = models.CharField(max_length=20)
	city = models.CharField(max_length=50)
	state = models.CharField(max_length=30)
	description = models.CharField(max_length=250)
	current_amount = models.IntegerField(default=0)
	highest_bidder = models.CharField(max_length=55, default="NONE")
	highest_bid = models.IntegerField(default=0)
	ending_time = models.DateField()

class Bid(models.Model):
	auction_id = models.CharField(max_length=20)
	amount = models.IntegerField()
	stripe_id = models.CharField(max_length=55)
	email = models.CharField(max_length=55)
	bidder_id = models.CharField(max_length=55)
	time = models.DateField()