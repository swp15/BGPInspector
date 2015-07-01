function process_query(query, representation, headers){
	send_query(query, representation, headers);
}

function send_query(query, representation, headers){
	var dt;
	if (representation == 'table'){
		dt = build_header_table_in_result( headers, representation);
	}	
	oboe({
   url: 'http://mobi3.cpt.haw-hamburg.de:1080/API/query?query='+query+'&historical=true&limit=100',
   withCredentials: false
	})
	.node(
		'value.*', function(value) {
			console.log(value);
			if (representation == 'table'){
				var data_list = value;	
				var diff =  headers.length - data_list.length;
				if (diff > 0) {
					for(i=0; i < diff; i++){
						data_list.push("");
					}
				}
				//console.log(data_list);
				$(representation).DataTable().row.add(data_list).draw();
			}
			if (representation == 'graph'){
			} 
		}
	)
	.fail(
		function(err) {
			//console.log( err);
		}
	);
}

function build_header_table_in_result( headers, div_id){
	var dt;
	table_header_string = build_table_string_from_array( headers);
	document.getElementById('result').innerHTML = 
		'<table id=\"'
		+ div_id
		+ '\" class=\"display\"> \n <thead> \n <tr>'
		+ table_header_string
		+ '\n </tr> \n </thead> \n </table>';
	dt = $(document).ready(function(){
		dt = $(div_id).DataTable();
		return dt;
	});
	return dt;
}

function build_table_string_from_array( header_array){	
	var table_header_string = '';
	for (entry in header_array){
		table_header_string += '\n <th>'+header_array[entry]+'</th>';
	}
	return table_header_string;
}
