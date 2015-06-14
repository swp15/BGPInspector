#!python3
__author__ = 'Fabrice Jean Ryba'

def parse_json_to_table_format( content_json):
	header = ['timestamp', 'source_ip', 'source_as', 'prefix', 'as_path', 'origin_as', 'origin', 'nexthop', 'local_pref', 'med', 'community', 'atomix_aggregate', 'aggregator'] #= content_json['header']
	table = []
	for json_object in content_json:
		if 'type' in json_object['value'] and json_object['value']['type'] == 'bgpdump::announcement':
			#event_id = content_json['id']
			#timestamp = content_json['timestamp']
			value_row = []
			for value in json_object['value']['data']:
				if value != type(list):
					value_row.append( value)
				else:
					stringBuff = ''
					for entry in value:
						stringBuff += str(entry) + ' '
					value_row.append( stringBuff)
			table.append( value_row)				
	return {'header':header, 'table':table}
	
def parse_json_to_graph_format( content_json):
	nodes = []
	edges = []
	for json_object in content_json:
		if 'type' in json_object['value'] and json_object['value']['type'] == 'bgpdump::announcement':	
			hop_list = json_object['value']['data'][4]
			prev_as = None
			for AS in hop_list:
				if AS not in nodes:
					nodes.append( AS)
				if prev_as != None:
					edges.append( (prev_as, AS))
				prev_as = AS
	return {'nodes': nodes, 'edges': edges}   				
			

