/* PAGES[n] enthaelt Rows fuer die n-te Seite*/
var PAGES = [];
var CURRENT_PAGE = 0;
var ROWS_PER_PAGE = 50;
var TABLE_HEADERS;

$(document).ready(function(){
    $('#prevPage').css( 'cursor', 'pointer' );
    $('#nextPage').css( 'cursor', 'pointer' );
    $("#prevPage").mousedown(function(e){ e.preventDefault(); });
    $("#nextPage").mousedown(function(e){ e.preventDefault(); });
    $("#prevPage").click(previous_page);
    $("#nextPage").click(next_page);
    //build_table(['test','wat','test1']);
});

function build_table(headers){
    TABLE_HEADERS = headers;
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

function send_query(query)
{
    //Send to /queries with POST, wait for response. get ID and then do get_next 
    //to /queries/id/
    get_next(ROWS_PER_PAGE,initial_get_next_cb);
}

function get_next( n, cb){
	// adjust to just fetch n
	var jqxhr = $.getJSON(
		'http://fabrice-ryba.ddns.net/daten_small.json1', 
		function(data){
			var next_list = process_query_result(data);
			cb(next_list); 
		})  
		.fail(function() {
    	console.log('error in json transmition');
		});
}

function process_query_result(values) {
	var return_list = [];
	for( var i=0; i<values.length;i++){
		var value = values[i].value;
		var data = value.data;
		data['type'] = value['type'].substr(0,value['type'].indexOf(' '));;
		var row = {};
        var headers = TABLE_HEADERS;
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
	return return_list;
}

function initial_get_next_cb(rows){
    CURRENT_PAGE = 0
    PAGES[CURRENT_PAGE] = rows;
    rows[0][0] = CURRENT_PAGE;
    set_table_content(rows);
}

function set_table_content(rows)
{
    $("#table").DataTable().clear();
    for(var i in rows) {
        $("#table").DataTable().row.add(rows[i]).draw();
        
    }
    //$("#table").DataTable().draw();
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
        //Pass callback, callback should:
        //1. Events came in OK:
        //  Set new page (
        var rows = get_next(ROWS_PER_PAGE, load_next_page_cb);
   }
}

function load_next_page_cb(rows)
{
    CURRENT_PAGE++;
    PAGES[CURRENT_PAGE] = rows;
    rows[0][0] = CURRENT_PAGE;
    set_table_content(rows);
}

function nano_secs_to_DateTime(nano_secs){
	var secs = nano_secs/1000000000;
	var date = moment.utc(secs, 'X').format('YYYY-MM-DD+hh:mm:ss');
	return date;
}

	
