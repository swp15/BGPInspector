function process_query(query, representation, headers){
	send_query(query, representation, headers);
}

function send_query(query, representation, headers){

	if (representation == 'table'){
		build_header_table_in_result( headers, representation);
	}

	limit = 1000;
	object_counter = 0;

	oboe({
   url: 'http://mobi3.cpt.haw-hamburg.de:1080/API/query?query='+query,
   withCredentials: false
	})
	.node(
		'value.data', function(data_list) {
			object_counter++;
			percentage = (object_counter/limit) * 100;
			console.log( String(percentage));
			if (representation == 'table'){	
				var diff =  headers.length - data_list.length;
				if (diff > 0) {
					for(i=0; i < diff; i++){
						data_list.push("");
					}
				}
				$(representation).DataTable().row.add(data_list).draw();
				document.getElementById('progress_bar').innerHTML = String(percentage) + '% loaded';
				//document.getElementById('progress_bar').setAttribute("aria-valuenow", percentage);
			 	$('#progress_bar').css('width', percentage+'%').attr('aria-valuenow', percentage);   	
			} 
		}
	)
	.node(
		'progress', function(progress){	
			console.log(progress);
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
	loading_bar_html = get_loading_bar_html();
	document.getElementById('result').innerHTML = loading_bar_html 
		+	'<table id=\"'
		+ div_id
		+ '\" class=\"display\"> \n <thead> \n <tr>'
		+ table_header_string
		+ '\n </tr> \n </thead> \n </table>';
	$(document).ready(function(){
		$(div_id).DataTable();
	});
}

function get_loading_bar_html(){
	loading_bar_string =  '<div class=\"progress\">\n'
  + '<div id=\"progress_bar\" class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"0\"'
  + 'aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width:0%\">\n'
  +  '0% loaded\n</div>\n</div>';
	return loading_bar_string;
}

function build_table_string_from_array( header_array){	
	var table_header_string = '';
	for (entry in header_array){
		table_header_string += '\n <th>'+header_array[entry]+'</th>';
	}
	return table_header_string;
}
