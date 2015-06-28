#!python3
__author__ = 'Fabrice Jean Ryba'

from django.shortcuts import render

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.core.urlresolvers import reverse
import datetime

from django.templatetags.static import static
from .forms import Query_form
from .ownModules import myUtils, HTTPHandler

# Create your views here.

def index(request):
	userIp = request.META['REMOTE_ADDR']
	content_emitter = {'userIp': userIp}
	return render(request, 'bgpWebApp/index.html', content_emitter)

def query(request):
	content_emitter = None
	if request.method == "POST":		
		query_form = Query_form( None, request.POST)
		#print( query_form.cleaned_data['protocol'])
		content_emitter = {'query_form':query_form}
		if query_form.is_valid():
			content_emitter.update(process_vast_query( query_form, request))
			if 'headers' in content_emitter['http_content']:
				converted_headers = convert_list_to_list_of_tuples( 
					content_emitter['http_content']['headers']
				)
				content_emitter['query_form'] = Query_form(  
					converted_headers,
					request.POST
				)
	else:
		query_form = Query_form(None)
		content_emitter = {'query_form':query_form}
	#print( content_emitter['query_form'])
	return render(request, 'bgpWebApp/query.html', content_emitter )

def process_vast_query( form, request):
		headers = process_protocoly_from_form( form.cleaned_data['protocol'])
		content_emitter = process_query_from_form( form)

		if content_emitter['is_json'] == True:
			if 'table' in request.POST:
				http_content = myUtils.parse_json_to_table_format( content_emitter['http_content'])
				content_emitter['representation'] = 'table'
				http_content['headers'] = headers
				content_emitter['http_content'] = http_content
			elif 'graph' in request.POST:
				http_content = myUtils.parse_json_to_graph_format( content_emitter['http_content'])
				content_emitter['representation'] = 'graph'
				http_content['headers'] = headers
				content_emitter['http_content'] = http_content

		else:
			content_emitter['representation'] = 'text'
		return content_emitter

def process_protocoly_from_form( protocol):
	httpHandler = HTTPHandler.HTTPHandler()
	params = {'protocol':protocol}
	response = httpHandler.send_request( 
		'GET',
		'http://fabrice-ryba.ddns.net/json_bgp_header.dump',
		request_payload = params
	)
	headers = httpHandler.extract_json_content( response)
	return headers

def process_query_from_form( form):
	query = form.cleaned_data['query']
	params = myUtils.query_to_url_para_dic( query)
	httpHandler = HTTPHandler.HTTPHandler()
	response = httpHandler.send_request(
		'GET', 
		'http://fabrice-ryba.ddns.net/json_bgp_small.dump', 
		request_payload=params
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
	return content_emitter

def convert_list_to_list_of_tuples( list):
	out_list = []
	for entry in list:
		out_list.append( (entry, entry))
	return out_list

def result(request):
	return render( request, 'bgpWebApp/result.html', {})

def history(request):
	return render(request, 'bgpWebApp/history.html', {})

def impressum(request):
	return render(request, 'bgpWebApp/impressum.html', {})

