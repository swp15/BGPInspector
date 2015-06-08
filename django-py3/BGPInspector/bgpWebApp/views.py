from django.shortcuts import render

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader
from django.core.urlresolvers import reverse
import datetime

from .forms import QueryForm
from .ownModules import myUtils, HTTPHandler

# Create your views here.

def index(request):
	userIp = request.META['REMOTE_ADDR']
	context = {'userIp': userIp}
	return render(request, 'bgpWebApp/index.html', context)

def query(request):
	# retrieve cookie?
	if request.method == "POST":
		form = QueryForm(request.POST)
		if form.is_valid() and myUtils.is_valid_vast_query( form.cleaned_data['query']):	
			query = form.cleaned_data['query']
		
			#return HttpResponse("testing cleaning: " + str(form.cleaned_data['query']))
			# maybe hash query
			httpHandler = HTTPHandler.HTTPHandler()
			response = httpHandler.send_request(
				'GET', 
				'http://worldcup-simulator.de/json/rules/tournament:1', 
				request_payload={'query':query})
			time = datetime.datetime.now()
			time = str(time)
			content_emitter = {}
			content_emitter['query'] = query
			content_emitter['time'] = time
			content_emitter['form'] = form
			if httpHandler.is_json( response):
				content_json = httpHandler.extract_json_content( response)
				# testing bgp update
				content_json = {'type':'update','header':['Field Name', 'Marker', 'type'], 'table':[['einFieldName', 'einMarker', '5'], ['zweiFieldName', 'zweiMarker', '4']]}
				content_json = myUtils.refine_json_to_table_format( content_json)
				content_emitter['content_json'] = content_json
				content_emitter['is_json'] = True
				return render(request, 'bgpWebApp/query.html' , content_emitter)
			else: 
				content_text = httpHandler.extract_text_content( response) 
				content_emitter['content_text'] = content_text
				content_emitter['is_json'] = False
				return render(request, 'bgpWebApp/query.html', content_emitter)
	else:
		form = QueryForm()
	return render(request, 'bgpWebApp/query.html', {'form':form})

def result(request):
	return render( request, 'bgpWebApp/result.html', {})

def history(request):
	return render(request, 'bgpWebApp/history.html', {})

def impressum(request):
	return render(request, 'bgpWebApp/impressum.html', {})

