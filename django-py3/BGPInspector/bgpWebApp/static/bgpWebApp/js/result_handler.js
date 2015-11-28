/* PAGES[n] enthaelt Rows fuer die n-te Seite*/
var PAGES = [];
var CURRENT_PAGE = 0;
var ROWS_PER_PAGE = 50;

$(document).ready(function(){
$('#prevPage').css( 'cursor', 'pointer' );
$('#nextPage').css( 'cursor', 'pointer' );
$("#prevPage").click(previous_page);
$("#nextPage").click(next_page);
});


function set_table_content(rows)
{
    $("#table").DataTable().clear();
    $("#table").DataTable.rows.add(rows);
    $("#table").DataTable.draw();
}


function previous_page()
{
    if(CURRENT_PAGE == 0){
        return "NO PREVIOUS PAGE AVAILABLE";
    }

    CURRENT_PAGE--;
    var rows = PAGES[CURRENT_PAGE];
    set_table_content(rows);
}

function get_next(x)
{
    return [];
}

function next_page()
{
   var current = CURRENT_PAGE;
   current++;
   if(current in PAGES){
        //If we already know this page, just display it and increase the counter
        var rows = PAGES[current];
        set_table_content(rows);
        CURRENT_PAGE = current;
   } else {
        //Get new events from VAST
        var rows = get_next(ROWS_PER_PAGE);
        //No more events, current page is last page
        if(rows.length == 0){
            return "NO MORE EVENTS";
        }

        //Display them on the next page
        set_table_content(rows);
        CURRENT_PAGE = current;

        //Save them for later
        PAGES[CURRENT_PAGE] = rows;
   }
}

function process_query(query, representation, headers){
	send_query(query, representation, headers);
}

function send_query(query, representation, headers){
	if (representation == 'table'){
		build_table( headers);
	}
	else {
		$('#result').html('How do you want me to display your data?');
	}
}

function build_table( headers){
	var cols = [];
	var table_id = 'table'; 
	for( var index=0; index<headers.length; index++){
		cols.push( { 'title': headers[index]});
	}
	var table = $('#'+table_id);
	table.width
	table.DataTable( {
		'paging': false,
		columns: cols
	});
}
$(document).ready(function(){
	var stuff = get_next(50, my_callback);
	console.log(stuff);
});

function my_callback(next_list){
	console.log(next_list);
}

function get_next( n, andreas_cb){
	var jqxhr = $.getJSON(
		'http://fabrice-ryba.ddns.net/daten_small.json1', 
		function(data){
			var next_list = process_query_result(data);
			andreas_cb(next_list); 
		})  
		.fail(function() {
    	console.log('error in json transmition');
		});
}

function process_query_result(values) {
	var return_list = [];
	//console.log(values);
	for( var i=0; i<values.length;i++){
		var value = values[i].value;
		//console.log(value);
		var data = value.data;
		data['type'] = value['type'].substr(0,value['type'].indexOf(' '));;
		var row = {};
		headers.forEach(function(header){
			if( (header in data) && data[header] != null){
				var extracted_data = data[header];
				if(header == 'timestamp'){
					extracted_data = nano_secs_to_DateTime(extracted_data);
				}
				row[header] = extracted_data;
			}
			else{
				row[header] = "";
			}
		})
		var row_list = [];
		for( var index=0; index<headers.length; index++){
			row_list.push(row[headers[index]]);
		}
		return_list.push(row_list);
	}
	//console.log(return_list);
	return return_list;
}

function success(data, blub, bli){console.log('iaeu');}

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

	
