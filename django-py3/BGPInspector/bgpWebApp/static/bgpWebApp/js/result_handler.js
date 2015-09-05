function process_query(query, representation, headers){
	send_query(query, representation, headers);
}

function send_query(query, representation, headers){

	if (representation == 'table'){
		build_header_table_in_result( headers, representation);
	}
	limit = get_limit( query);
	if (limit == null){
		limit = 100000;
	}
	console.log('initial limit: ' + String(limit));
	object_counter = 0;
	oboe({
   url: 'http://mobi1.cpt.haw-hamburg.de:1080/API/query?query='+query,
   withCredentials: false
	})
	.node(
		'value', function(value) {
			data_list = value.data;
			object_counter++;
			if (representation == 'table'){	
				var diff =  headers.length - data_list.length;
				if (diff > 0) {
					for(i=0; i < diff; i++){
						data_list.push("");
					}
				}
				if ( data_list[0] != ""){
					data_list[0] = nano_secs_to_DateTime(data_list[0]);
				}
        data_list.unshift(value.type);      
				$(representation).DataTable().row.add(data_list);
				if (object_counter%(limit/10) == 0){
					render_progress_bar(object_counter, limit);
					$(representation).DataTable().draw();		
				}
			}
		}
	)
	.node(
		'progress', function(progress){	
			console.log('progress ' + String(progress));
		}
	)
	.node( 
		'state', function(state){
			if (state == 'DONE'){
				console.log('state ' + state);
				percentage = (object_counter/limit) * 100;
				$(representation).DataTable().draw();	
				render_progress_bar( object_counter, limit);	
			}
		}
	)
	.node(
		'event_counter', function(event_counter){
			if (event_counter != '0'){
				limit = Math.min( event_counter, limit);
				render_progress_bar( object_counter, limit);
				console.log('new limit ' + String(limit));
			}
		}
	)
	.fail(
		function(err) {
			console.log( err);
		}
	);
}

function render_progress_bar(object_counter, limit){
	percentage = (object_counter/limit) * 100;
	document.getElementById('progress_bar').innerHTML = String(percentage) + '% loaded';
	$('#progress_bar').css('width', percentage+'%').attr('aria-valuenow', percentage);	
}	

function build_header_table_in_result( headers, div_id){
	table_header_string = build_table_string_from_array( headers);
	loading_bar_html = get_loading_bar_html();
	document.getElementById('result').innerHTML = loading_bar_html 
		+	'<table id=\"'
		+ div_id
		+ '\" class=\"display nowrap compact cell-border\"> \n <thead> \n <tr>'
		+ table_header_string
		+ '\n </tr> \n </thead> \n </table>';

	$(document).ready(function(){
		$("#"+div_id).dataTable({
			"retrieve": true,
			"iDisplayLength":50,
			"dom": 'T<"clear">lfrtip',
			"tableTools": {
				"sSwfPath": "/swf/copy_csv_xls_pdf.swf"
       }
		});
	});
}

function nano_secs_to_DateTime(nano_secs){
    var secs = nano_secs/1000000000;
    var date = moment.utc(secs, 'X').format('YYYY-MM-DD+hh:mm:ss');
    return date;
}

function get_limit( string){
	var n = string.search(/limit/i);
	n += "limit".length;
	n += 1;
	var stop = false;
	var number_buffer = "";
	while (stop == false){	
		if ((string[n] == '&') || (n == string.length)){
			stop = true;
		}
		else{
			number_buffer += string[n];
		}
		n++;
	}
	if (n != null){
		return number_buffer;
	}
	else {
		return n;
	}
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
