from django.conf.urls import url, include
from . import views

urlpatterns = [
    url(r'^winner/(?P<winner_id>[\w\-]+)/$', views.winner),
    url(r'^winner/$', views.button_press)
]