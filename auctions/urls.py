from django.conf.urls import url

from . import views
from . import tasks

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^donate/', views.donate),
    url(r'^tester/(?P<auction_id>[\w\-]+)/$', tasks.test),
    url(r'^(?P<auction_id>[\w\-]+)/$', views.auction)
]