/* PAGES[n] enthaelt Rows fuer die n-te Seite*/
var PAGES = [];
var CURRENT_PAGE = 0;
var ROWS_PER_PAGE = 50;
var TABLE_HEADERS;
var CURRENT_ID;
//var VAST_SERVER = 'http://mobi1.cpt.haw-hamburg.de:1080';
//var VAST_SERVER = 'http://fabrice-ryba.ddns.net/daten_small.json1';



function build_table(headers){
    headers.push('type');
	var table_id = 'table'; 
	var table = $('#'+table_id);
    if(isDataTable(table[0])){
		table.DataTable().destroy();
		table.empty();
	}
    TABLE_HEADERS = headers;
	var cols = [];
	for( var index=0; index<headers.length; index++){
		cols.push( { 'title': headers[index], className:"dt-left"});
	}
	table.DataTable( {
		'paging': false,
        "autoWidth": false,
	    columns: cols
	});
}

function send_query(query,queryOpts, limit)
{
    $.post(VAST_SERVER+"/queries", "expression="+query+"&type="+queryOpts+"&limit="+limit, post_query_cb,"json");
    
}

function post_query_cb(data, textStatus, jqXHR)
{
    CURRENT_ID = data["id"];
    get_next(ROWS_PER_PAGE,initial_get_next_cb);
}

function get_next( n, cb){
	var rows = [];
    var url = VAST_SERVER+"/queries/" + CURRENT_ID + "?n="+n;
	oboe(url).node('results.*',function(result) {
        console.log("Got result");
		var row = process_query_result(result.value);
		rows.push(row);
		$("#table").DataTable().row.add(row).draw();
	}).node('status.*',function(stat) {
        console.log("Got Status");
    }).done(function(d){
        console.log("DONE");
		cb(rows);
	});
}

function process_query_result(value)
{
		var data = value.data;
        data['type'] = value['type']['name'];
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
		return row_list;
}

function process_query_results(values) {
	var return_list = [];
	for( var i=0; i<values.length;i++){
		return_list.push(process_query_result(values[i].value));
	}
	return return_list;
}

function initial_get_next_cb(rows){
    CURRENT_PAGE = 0
    PAGES[CURRENT_PAGE] = rows;
    set_table_content(rows);
}

function set_table_content(rows)
{
    $("#table").DataTable().clear().draw();
    for(var i in rows) {
        $("#table").DataTable().row.add(rows[i]).draw();
    }
}

function set_page_num(n)
{
	$("#pageNum").text(n);
}

function previous_page()
{
    CURRENT_PAGE--;
	if(CURRENT_PAGE == 0){
		$("#prevPage").css("display","none");
	} else {
		$("#prevPage").css("display","");
    }
   	var rows = PAGES[CURRENT_PAGE];
    set_table_content(rows);
	set_page_num(CURRENT_PAGE);
}

function next_page()
{
   $("#prevPage").css("display","");
   var current = CURRENT_PAGE;
   current++;
   if(current in PAGES){
        //If we already know this page, just display it and increase the counter
        var rows = PAGES[current];
        set_table_content(rows);
        CURRENT_PAGE = current;
   		set_page_num(CURRENT_PAGE);
   } else {
        var rows = get_next(ROWS_PER_PAGE, load_next_page_cb);
   }
}

function load_next_page_cb(rows)
{
    CURRENT_PAGE++;
    PAGES[CURRENT_PAGE] = rows;
    set_table_content(rows);
	set_page_num(CURRENT_PAGE);	
}

function nano_secs_to_DateTime(nano_secs){
	var secs = nano_secs/1000000000;
	var date = moment.utc(secs, 'X').format('YYYY-MM-DD+hh:mm:ss');
	return date;
}


function isDataTable ( nTable )
{
    var settings = $.fn.dataTableSettings;
    for ( var i=0, iLen=settings.length ; i<iLen ; i++ )
    {
        if ( settings[i].nTable == nTable )
        {
            return true;
        }
    }
    return false;
}
	
