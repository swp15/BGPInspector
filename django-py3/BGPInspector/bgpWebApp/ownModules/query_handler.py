#!python3
__author__ = 'Fabrice Ryba'

from django.shortcuts import redirect
from . import myUtils, HTTPHandler
from ..forms import Query_form
import datetime

def process_query( request, url_protocol):
	query_form = Query_form( None, None, request.POST)
	content_emitter = {'query_form':query_form}
	if query_form.is_valid():
		form_protocol = query_form.cleaned_data['protocol']

		if url_protocol != form_protocol:
			content_emitter['url_protocol'] = form_protocol	
			query_form = Query_form( form_protocol, None, request.POST)
			content_emitter['query_form'] = query_form
			#return redirect( 'bgpWebApp/query/'+form_protocol+'/')
		elif ('table' in request.POST) or ('graph' in request.POST):
				content_emitter.update( process_vast_query( query_form, request))
				if 'headers' in content_emitter['http_content']:	
					headers = build_form_friendly_headers( content_emmiter['http_content']['headers'])
					content_emitter['query_form'] = Query_form(
						protocol,
						headers,
						request.POST
					)
		else:
			headers = process_protocol_from_form(query_form.cleaned_data['protocol'])
			headers = build_form_friendly_headers( headers)
			query_form = Query_form(protocol, headers, request.POST)
			print( query_form)
			query_form.cleaned_data['query'] += str( query_form.cleaned_data['field'])
			content_emitter = {'query_form':query_form}
		
	#print( request.POST)
	return  content_emitter

def process_vast_query( form, request):
    headers = process_protocol_from_form( form.cleaned_data['protocol'])
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

def process_protocol_from_form( protocol):
	httpHandler = HTTPHandler.HTTPHandler()
	params = {'protocol':protocol}
	response = httpHandler.send_request(
		'GET',
		'http://fabrice-ryba.ddns.net/json_bgp_header.dump',
		request_payload = params
	)
	if httpHandler.is_json( response):
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

def build_form_friendly_headers( header_list):
	converted_headers = [('','------')]
	converted_headers.extend( 
		convert_list_to_list_of_tuples(
			header_list)
	)
	return converted_headers

def convert_list_to_list_of_tuples( list):
	out_list = []
	for entry in list:
		out_list.append( (entry, entry))
	return out_list
