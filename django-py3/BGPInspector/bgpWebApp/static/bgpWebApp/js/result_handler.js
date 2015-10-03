function process_query(query, representation, headers){
	send_query(query, representation, headers);
}

function send_query(query, representation, headers){
	var row_list  = [];
	var dom_parent = 'result';
	var loading_bar_container = 'loading_bar_container';
	make_div( loading_bar_container, dom_parent);
	var loading_bar_id = 'loading_bar';
	build_loading_bar_in_result( loading_bar_id, loading_bar_container);
	var table_container = 'table_container';
	make_div( table_container, dom_parent);
	var table_id = 'table';
	make_div( table_id, table_container);
	//$('#'+table_id).css('text-align','left');
	oboe({
		//url: 'http://fabrice-ryba.ddns.net/daten.json',
		//url: 'http://mobi1.cpt.haw-hamburg.de:1080/API/query?query='+query,
		url: 'http://mobi1.cpt.haw-hamburg.de:1080/API/query?query=%28%26time%3C2015-09-22%2B15%3A58%3A09%29&historical=true&limit=9999',
		withCredentials: false
	})
	.node(
		'value', function(value) {
			data_dic = value.data;
			if (representation == 'table'){	
				var diff =  headers.length - data_dic.length;
				if (diff > 0) {
					for(i=0; i < headers.length; i++) {
						if (!(headers[i] in data_dic)) {
							data_dic[headers[i]] = "";
						}
					}
				}
				if ( data_dic['timestamp'] != ""){
					data_dic['timestamp'] = nano_secs_to_DateTime(data_dic['timestamp']);
				}
        data_dic['type'] = value.type;      
				row_list.push( data_dic);
			}
		}
	)
	.node(
		'progress', function(progress){	
			console.log('progress ' + String(progress));
			render_progress_bar( progress, loading_bar_id);
			if (progress == 1){
				build_slickgrid_table( $('#'+table_id), headers, row_list);
			}
		}
	)
	.fail(
		function(err) {
			console.log( err);
		}
	);
}

function build_slickgrid_table( container, headers, rows){
	var columns = [];
	var slick_grid_required_column_fields = ["id", "name", "field"];
	for ( var i=0; i<headers.length; i++){
		columns_dic = {};
		for ( var j=0; j<slick_grid_required_column_fields.length; j++){	
			columns_dic[slick_grid_required_column_fields[j]] = headers[i];
		}
		columns.push( columns_dic);
	}
	var options = {
		enableCellNavigation: true,
		enableColumnReorder: false
	}
	var slick_grid = new Slick.Grid(container, rows, columns, options);
	slick_grid.render();
}

function make_div( id, dom_parent){
	if ($('#'+id).length == 0){
		var $div = $("<div>", {id: id});
		$('#'+dom_parent).append($div);
	}
}

function build_loading_bar_in_result( id, dom_parent){
	make_div( id, dom_parent);
	var div = $('#'+id);
	div.addClass( "progess progress-bar");
	div.attr("role", "progressbar");
	div.attr("aria-valuenow", "0");
	div.attr("aria-valuemin", "0");
	div.attr("aria-valuemax", "100");
	div.attr("style", "width:0%");
	div.attr("color", "#000"); 
	div.html( "0% hits received");
	setTimeout(function(){render_progress_bar( 0.0, id)}, 10);
}

function render_progress_bar(progress, id){
	progress = progress * 100;
	$('#'+id).html(String(progress) + '% hits received');
	$('#'+id).css('width', progress+'%').attr('aria-valuenow', progress);	
	$('#'+id).css('color', '#FFF');
}

function nano_secs_to_DateTime(nano_secs){
	var secs = nano_secs/1000000000;
	var date = moment.utc(secs, 'X').format('YYYY-MM-DD+hh:mm:ss');
	return date;
}	
