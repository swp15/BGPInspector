#!python3
__author__ = 'Fabrice Jean Ryba'

from django.shortcuts import render

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.template import RequestContext, loader

# Create your views here.

def index(request):
	userIp = request.META['REMOTE_ADDR']
	content_emitter = {'userIp': userIp}
	return render(request, 'bgpWebApp/index.html', content_emitter)

def query(request):
	return render(request, 'bgpWebApp/query.html', {})

def graph(request):
	return render(request, 'bgpWebApp/graph.html', {})

def impressum(request):
	return render(request, 'bgpWebApp/impressum.html', {})

