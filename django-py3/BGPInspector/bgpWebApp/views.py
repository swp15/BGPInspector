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
	context = {'userIp': userIp}
	return render(request, 'bgpWebApp/index.html', context)

def query(request):
	# retrieve cookie?
	if request.method == "POST":
		form = QueryForm(request.POST)
		if form.is_valid():	
			query = form.cleaned_data['query']
			httpHandler = HTTPHandler.HTTPHandler()
			response = httpHandler.send_request(
				'GET', 
				'http://worldcup-simulator.de/json/rules/tournament:1', 
				request_payload={'query':query})
			content_emitter = build_content_emitter( query, form)
			if httpHandler.is_json( response):
				http_json_content = httpHandler.extract_json_content( response)
				#import cProfile;cProfile.runctx('load_and_parse( response)', {'response' : response}, None )#cProfile.run('load_and_parse( response)')
				http_json_content = load_and_parse( response)
				content_emitter['http_json_content'] = http_json_content
				content_emitter['is_json'] = True
			else: 	
				http_content = httpHandler.extract_text_content( response)
				content_emitter['http_content'] = http_content
				content_emitter['is_json'] = False
			return render(request, 'bgpWebApp/query.html', content_emitter)
	else:
		form = QueryForm()
	return render(request, 'bgpWebApp/query.html', {'form':form})

def build_content_emitter( query, form):
	content_emitter = {}
	time = datetime.datetime.now()
	time = str(time)
	content_emitter = {}
	content_emitter['query'] = query
	content_emitter['time'] = time
	content_emitter['form'] = form
	return content_emitter

def load_and_parse( response):
	# ------------------- test ------------------------- #
	with open( 'bgpWebApp/media/json_bgp_small.dump') as json_file:
		http_json_content = json.load(json_file)
	# -------------------------------------------------- #
	http_json_content = myUtils.parse_json_to_table_format( http_json_content)
	return http_json_content

def result(request):
	return render( request, 'bgpWebApp/result.html', {})

def history(request):
	return render(request, 'bgpWebApp/history.html', {})

def impressum(request):
	return render(request, 'bgpWebApp/impressum.html', {})

