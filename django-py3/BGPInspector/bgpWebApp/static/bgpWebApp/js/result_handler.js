function process_query(query, representation, headers){
	alert(query + ' ' + representation + ' ' + headers);
	send_query(query, representation, headers);
}

function send_query(query, representation, headers){
	if (representation == 'table'){
		build_header_table_in_result( headers, representation);
	}	
	oboe({
   url: 'http://mobi3.cpt.haw-hamburg.de/API/query?query='+query+'&historical=true&limit=50',
   method: 'GET',          // optional
   //headers: Object,         // optional
   //body: String|Object,     // optional
   //cached: Boolean,         // optional
   withCredentials: false
	})
	//oboe('http://fabrice-ryba.ddns.net/json_bgp_small.dump')
	.done(
		function(json_object) {
			console.log(json_object);

			if (representation == 'table'){
				data_list = json_object['value']['data']
				$(representation).row.add(data_list).draw();
			}
			if (representation == 'graph'){
			} 
					})
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
