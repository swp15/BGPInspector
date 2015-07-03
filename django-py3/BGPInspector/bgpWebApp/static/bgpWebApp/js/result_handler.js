function process_query(query, representation, headers){
	send_query(query, representation, headers);
}

function send_query(query, representation, headers){

	var json_content;

	if (representation == 'table'){
		build_header_table_in_result( headers, representation);
	}

	if (representation == 'graph'){
		var nodes = [];
		var edges = {};
		json_content = [nodes, edges];
	}
 	
	oboe({
   url: 'http://mobi3.cpt.haw-hamburg.de:1080/API/query?query='+query,
   withCredentials: false
	})
	.node(
		'value.data', function(data_list) {
			if (representation == 'table'){	
				var diff =  headers.length - data_list.length;
				console.log(data_list);
				console.log(data_list.length);
				
				if (diff > 0) {
					for(i=0; i < diff; i++){
						data_list.push("");
					}
				}
				$(representation).DataTable().row.add(data_list).draw();
			}
			if (representation == 'graph'){
				var routing_list = data_list[4];
				for (i=0; i < routing_list.length; i++){
					if (json_content[1].indexOf(routing_list[i]) == -1){
						json_content[1].push(routing_list[i]);
					}
					var edge = routing_list[i-1]+':'+routing_list[i]
					if ( (i>0) && ( edge in json_content[2])){
						json_content[2].edge += 1;
					}
					else{
						json_content[2].edge = 1;
					}
				}
				console.log(json_content);
			} 
		}
	)
	.fail(
		function(err) {
			console.log( err);
		}
	);
}

function build_header_table_in_result( headers, div_id){
	table_header_string = build_table_string_from_array( headers);
	document.getElementById('result').innerHTML = 
		'<table id=\"'
		+ div_id
		+ '\" class=\"display\"> \n <thead> \n <tr>'
		+ table_header_string
		+ '\n </tr> \n </thead> \n </table>';
	$(document).ready(function(){
		$(div_id).DataTable();
	});
}

function build_table_string_from_array( header_array){	
	var table_header_string = '';
	for (entry in header_array){
		table_header_string += '\n <th>'+header_array[entry]+'</th>';
	}
	return table_header_string;
}
