function process_query(query, representation, headers){
	send_query(query, representation, headers);
}

function send_query(query, representation, headers){
	if (representation == 'table'){
		var row_list  = [];
		var dom_parent = 'result';
		var table_container = 'table_container';
		make_div( table_container, dom_parent);
		var table_id = 'table';
		make_div( table_id, table_container);
		build_fattable( table_id, headers);
	}
	else {
		$('#result').html('How do you want me to display your data?');
	}
}

function build_fattable( table_id, headers){
	var max_rows = 160;
	var row_page_size = 40;
	var column_page_size = 30;
	var min_header_size = 5;
	var header_length_offset = 70;

	var getJSON = function(url_paras,cb)  {
		var response = [];
		/* just testing stuff */
		var counter = 0;
		var start = parseInt(url_paras['rows'])*row_page_size;
		var end = parseInt(url_paras['rows'])*row_page_size+row_page_size;
		console.log("GET "+url_paras['url']+'?start='+start+'&end='+end);
		/*                   	*/
		oboe({
			url: url_paras['url']+url_paras['rows'],
			method: "GET",
			//headers: Object,
			//body: Object,
			//cached: Boolean,
			withCredentials: false
		})
		.node(
			'value', function(value) {
				counter++;
				var row_dic = value.data;
				row_dic['type'] = value.type;
				var row = []
				for (var i=0; i<headers.length; i++) {
					if (headers[i] in row_dic) {
						if (headers[i] == 'timestamp') {
							row.push(nano_secs_to_DateTime(row_dic[headers[i]]));
						}
						else {
							row.push(row_dic[headers[i]]);
						}
					}
					else {
						row.push("");
					}
				}
				response.push(row);		

				/* progress == '1' */
				if (counter % 40 == 0) {
					cb(response);	
				}
			}
		)
		.node(
			'progress', function(progress) {
				if (progress == '1') {	
					console.log(response);
				}
			}
		)
		.fail(
			function(err){
				console.log(err);
		})		
	}
 
	var columnWidths = [];
	for (var i=0; i<headers.length; i++) {
		header_length = headers[i].length;
		if (header_length < min_header_size) {
			columnWidths.push(min_header_size+header_length_offset);
		}
		else {
			columnWidths.push(header_length+header_length_offset);
		}
	}

	var painter = new fattable.Painter();
	painter.fillCell = function(cellDiv, data) {
		cellDiv.textContent = data.content;
		if (data.rowId % 2 == 0) {
			cellDiv.className = "even";
		}
		else {
			cellDiv.className = "odd";	
		}
 }
 painter.fillCellPending = function(cellDiv, data) {
		cellDiv.textContent = "Wait ...";
		cellDiv.className = "pending";
 }


 var tableModel = new fattable.PagedAsyncTableModel();

 tableModel.cellPageName = function(i,j) {
		var I = (i / row_page_size) | 0;
		var J = (j / column_page_size) | 0;
		return JSON.stringify([I,J]);
 }
 tableModel.hasColumn = function() {
		return true;
 }

	tableModel.columnHeaders = headers;

	tableModel.getHeader = function(j, cb) {
		cb(tableModel.columnHeaders[j]);
	}

	tableModel.fetchCellPage = function(pageName, cb) {
		var coords = JSON.parse(pageName);
		var I = coords[0];
		var J = coords[1];	
		// set 'correct' url
		var request = {url: "http://fabrice-ryba.ddns.net/daten_small.json", rows: I}; //, cols: J
		getJSON( request, function(data) {
			cb(function(i,j) {
				return {
					rowId: i,
					content: data[i-I*row_page_size][j-J*column_page_size]
				};
			});
		});
	}

	var table = fattable({
		"container": '#'+table_id,
		"model": tableModel,
		"nbRows": max_rows,		
		"rowHeight": 35,
		"headerHeight": 40,
		"painter": painter,
		"columnWidths": columnWidths
	});

	window.onresize = function() {
		table.setup();
	}
}
	
function make_div( id, dom_parent){
	if ($('#'+id).length == 0){
		var $div = $("<div>", {id: id});
		$('#'+dom_parent).append($div);
	}
}

function nano_secs_to_DateTime(nano_secs){
	var secs = nano_secs/1000000000;
	var date = moment.utc(secs, 'X').format('YYYY-MM-DD+hh:mm:ss');
	return date;
}	
