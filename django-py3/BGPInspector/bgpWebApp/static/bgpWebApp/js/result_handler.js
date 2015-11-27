function process_query(query, representation, headers){
	send_query(query, representation, headers);
}

function send_query(query, representation, headers){
	if (representation == 'table'){
		var dom_parent = 'result';
		var table_container = 'table_container';
		make_jquery_element( table_container, dom_parent, 'div');
		var table_id = 'table';
		make_jquery_element( table_id, table_container, 'table');
		build_table( table_id, headers);
	}
	else {
		$('#result').html('How do you want me to display your data?');
	}
}

function build_table( table_id, headers){
	$(document).ready(function(){
		var table_jquery = $('#'+table_id);
		table_jquery.addClass('display');
		table_jquery.width('100%');
		table_jquery.attr('cellspacing', '0');
		var table_html = '<thead><tr>';
		for(var index=0; index<headers.length; index++){
			table_html += '<th>'+headers[index]+'</th>';
		}
		table_html += '</thead></tr>';
		table_jquery.append(table_html);
    table_jquery.DataTable();
	});
	oboe({
		url: 'http://fabrice-ryba.ddns.net/daten_small.json',
		method: "GET",
		//headers: Object,
		//body: Object,
		//cached: Boolean,
		withCredentials: false
	})
	.node(
		'value', function(value) {
			var data = value.data;
			data[type] = value.type;
			var table = $('#'+table_id).DataTable();
			table.row.add(data);	
		}
	)
	.fail(
		function(err){
			console.log(err);
	})		
}
	
function make_jquery_element( id, dom_parent, element_name){
	if ($('#'+id).length == 0){
		//var div = $(element_name, {id: id});
		var div = "<"+element_name+" id="+id+"></"+element_name+">";
		$('#'+dom_parent).append(div);
	}
}

function nano_secs_to_DateTime(nano_secs){
	var secs = nano_secs/1000000000;
	var date = moment.utc(secs, 'X').format('YYYY-MM-DD+hh:mm:ss');
	return date;
}	
