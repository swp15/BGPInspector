#!python3
__author__ = 'Fabrice Jean Ryba'

import requests

class HTTPHandler():
	
	def __init__( self):
		pass

	def send_request( self, request_type, request_path, request_payload={}):		
		response = None
		
		if request_type == 'GET':
			response = requests.get( request_path, params=request_payload)
		elif request_type == 'POST':
			response = requests.post( request_path, params=request_payload)
		elif request_type == 'PUT':
			response = requests.put( request_path, params=request_payload)
		elif request_type == 'DELETE':
			response = requests.delete( request_path, params=request_payload)
		elif request_type == 'HEAD':
			response = requests.head( request_path, params=request_payload)
		elif request_type == 'OPTIONS':
			response = requests.options( request_path, params=request_payload)
		else:
			print( 'There is no such a HTTP request type as %s!' % request_type)

		return response

	def is_json( self, response):
		try:
			response.json()
			return True
		except ValueError:
			return False

	def extract_json_content( self, response):
		return response.json()

	def extract_text_content( self, response):
		return response.text
