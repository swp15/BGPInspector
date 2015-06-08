from django.http import Http404
from django.shortcuts import render

# replace with logic TODO
def is_valid_vast_query( query_string):
	return True

def refine_json_to_table_format( content_json):
	if content_json['type'] == 'update':
		header = content_json['header']
	
		table = content_json['table']
		
		return {'header':header, 'table':table}
	else:
		return None
