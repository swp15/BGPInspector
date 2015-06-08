from django.conf.urls import url

from . import views

urlpatterns = [
	url(r'^$', views.index, name='index'),
	url(r'^query/$', views.query, name='query'),
	url(r'^result/$', views.result, name='result'),
	url(r'^history/$', views.history, name='history'),
	url(r'^impressum/$', views.impressum, name='impressum'),
]
