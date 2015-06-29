#!python3
__author__ = 'Fabrice Jean Ryba'

from django.shortcuts import render

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.core.urlresolvers import reverse

from django.templatetags.static import static
from .forms import Query_form
from .ownModules import query_handler

# Create your views here.

def index(request):
	userIp = request.META['REMOTE_ADDR']
	content_emitter = {'userIp': userIp}
	return render(request, 'bgpWebApp/index.html', content_emitter)

def query(request, url_protocol):
	if request.method == "POST":
		content_emitter = query_handler.process_query( request, url_protocol)
	else:
		headers = query_handler.process_protocol_from_form( url_protocol)
		headers = query_handler.build_form_friendly_headers( headers)	
		query_form = Query_form(url_protocol, headers)
			
		content_emitter = {'query_form':query_form, 'url_protocol':url_protocol}
	print( content_emitter)
	return render(request, 'bgpWebApp/query.html', content_emitter )

def impressum(request):
	return render(request, 'bgpWebApp/impressum.html', {})

