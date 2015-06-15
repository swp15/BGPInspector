#!python3
__author__ = 'Fabrice Jean Ryba'

from django.shortcuts import render

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.core.urlresolvers import reverse
import datetime

from django.templatetags.static import static
from .forms import QueryForm
from .ownModules import myUtils, HTTPHandler

# for testing json
import json

# Create your views here.

def index(request):
	userIp = request.META['REMOTE_ADDR']
	content_emitter = {'userIp': userIp}
	return render(request, 'bgpWebApp/index.html', content_emitter)

def query(request):
	if request.method == "POST":
		form = QueryForm(request.POST)
		if form.is_valid():
			content_emitter = process_query_from_form( form)

			if content_emitter['is_json'] == True:
				# ------------------- test ------------------------- #
				#with open( 'bgpWebApp/media/json_bgp_small.dump') as json_file:
				#	content_emitter['http_content'] = json.load(json_file)
				# -------------------------------------------------- #
				if 'table' in request.POST:
					http_content = myUtils.parse_json_to_table_format( content_emitter['http_content'])
					content_emitter['representation'] = 'table'
					content_emitter['http_content'] = http_content
	
				elif 'graph' in request.POST:
					http_content = myUtils.parse_json_to_graph_format( content_emitter['http_content'])
					content_emitter['representation'] = 'graph'
					content_emitter['http_content'] = http_content
			
			else:
				content_emitter['representation'] = 'text'

			return render(request, 'bgpWebApp/query.html', content_emitter)
	else:
		form = QueryForm()
	return render(request, 'bgpWebApp/query.html', {'form':form})

def process_query_from_form( form):
	query = form.cleaned_data['query']
	httpHandler = HTTPHandler.HTTPHandler()
	response = httpHandler.send_request(
		'GET', 
		'http://fabrice-ryba.ddns.net/json_bgp_small.dump', 
		request_payload={'query':query}
	)
	content_emitter = build_content_emitter( query, form)
	
	http_content = None
	if httpHandler.is_json( response):
		http_content = httpHandler.extract_json_content( response)			
		content_emitter['is_json'] = True
	else: 	
		http_content = httpHandler.extract_text_content( response)
		content_emitter['is_json'] = False

	content_emitter['http_content'] = http_content

	return content_emitter

def build_content_emitter( query, form):
	content_emitter = {}
	time = datetime.datetime.now()
	time = str(time)
	content_emitter['query'] = query
	content_emitter['time'] = time
	content_emitter['form'] = form
	return content_emitter

def result(request):
	return render( request, 'bgpWebApp/result.html', {})

def history(request):
	return render(request, 'bgpWebApp/history.html', {})

def impressum(request):
	return render(request, 'bgpWebApp/impressum.html', {})

