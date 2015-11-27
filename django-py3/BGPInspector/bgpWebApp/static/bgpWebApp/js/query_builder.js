/*
var paras = 'ids=4556,4651,46,929';
oboe({
	url: 'fabrice-ryba.ddns.net',
	method: 'POST',
	withcredentials: false,
	body: paras
})
.fail(
	function(err){
		console.log(err);
	}
)
*/
retrieve_DataTypes('http://mobi1.cpt.haw-hamburg.de:1080');
function retrieve_DataTypes(VAST_URL){
	var types = {};
	oboe({
		url: VAST_URL + '/api/v1/types',
		method: 'GET',
		withcredentials: false
	})
	.node(
		'type', function(type){
			fields = type.structure;	
			types[type.name] = fields;
		}
	)
	.done(function(){
		start_flow_after_type_request(types);
	})		
	.fail(
		function(err){
			console.log(err);
		}
	)
}

function start_flow_after_type_request(types){
	fill_type_dropdown(types);
	dummy_filter = [{filterName:"Source AS", "filterType":"number", field: "source_as", filterLabel: "Source AS",excluded_operators: operatorSet(['equal','not_equal']),
                filter_interface: [{filter_element: "input",filter_element_attributes: {"type": "text", "value": ""}}]}];
	set_query_builder(dummy_filter);
}	

function type_button_callback(){
	var selected_types = get_selected_types(types);
	set_type_filters(selected_types);
}

function get_selected_types( types){	
	$('.selectpicker').val();
	var selected_types_structure = {};
	for( type in selected_types){
		selected_types_structure[type] = types[type];
	}
	var button_id = 'type_select_button';
	build_types_submit_button(button_id);
	$('#'+button_id).click(function(selected_types){ console.log('blub');});//selected_types_structure)});//some_function(selected_types_structure)});
	return selected_types_structure;
}

function fill_type_dropdown(choices_dic){
	var html_string = "Select a type to use the query builder with corresponding fields<br>"
		+ "<select id=\"type_picker\" class=\"selectpicker\" multiple data-selected-text-format=\"count\">";
	for( var type_name in choices_dic){
		if(choices_dic.hasOwnProperty(type_name)) { 
			html_string += '<option>'+type_name+'</option>';
		}
	}
	html_string += '</select><br>';
	$("#query_addition").html(html_string);
	$('.selectpicker').selectpicker();
}

function build_types_submit_button(id){
	var button_string = '<input id=\"'+id+' type=\"submit\" class=\"btn btn-default\" value=\"Submit\"/>';
	$("#query_addition").append(button_string);
}

var headers = ["type", "timestamp", "source_ip", "source_as", "prefix", "as_path", "origin_as", "origin", "nexthop", "local_pref", "med", "community", "atomix_aggregate", "aggregator"];

var operators =  ['in','not_in','less','less_or_equal','greater','greater_or_equal','is_null','is_not_null','begins_with','not_begins_with','contains', 'not_contains','ends_with','not_ends_with','equal', 'not_equal', 'is_empty', 'is_not_empty'];


$("#queryBuilderInfo").click(function(){
    var info = "Create a <a href='https://github.com/mavam/vast' class='alert-link'>VAST</a> query by grouping rules. A <i>all rules</i> group " +
               "represents a conjunction of the group elements, a <i>any rule</i> group a disjunction. A group element is a rule or another group.";
    $("#queryBuilderInfoAlert").remove();
    $("#main").prepend('<div id="queryBuilderInfoAlert" class="alert alert-info alert-dismissible" role="alert">' +
                            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                            info+
                        '</div>'
    );

});

function set_type_filters(types)
{

}


function set_query_builder(filters)
{
	$("#builder").empty();
	$("#builder").jui_filter_rules({
		bootstrap_version:"3",
		filters: filters,
        onValidationError: function(event, data) {
            if(data.hasOwnProperty("elem_filter")) {
                data.elem_filter.focus();
            }
        }});
}

function processQuery(query,queryOpts){
    process_query(escape(query)+queryOpts, 'table', headers);
}

function isInvalid(query,queryOpts) {
    return query == "" || queryOpts == "";
}

$("#send_query").click(function() {
  var a_rules = $("#builder").jui_filter_rules("getRules", 0, []);
  var query = buildQuery(a_rules);
  var queryOpts = getQueryOpts();
 
  var value;
  if(isInvalid(query,queryOpts)) {
    $("#query_text").val("Invalid Query");
  } else{
    $("#query_text").val(query+queryOpts);
    processQuery(query,queryOpts);
  }

});


function buildQuery(rules){
    var result = "";
    var rule;
    var i;

    $("#queryBuilderErrorLabel").remove();
    if(rules.length == 0){
        $("#builder").append('<span id="queryBuilderErrorLabel" class="label label-danger">Add at least one rule</span>');
    }

    for(i = 0;i<rules.length; i++) {
        rule = rules[i];
        var op = rule['logical_operator'];
        result += toQueryExpr(rule);
        if(i != rules.length -1){
            result += op;
        }
    }
    result = result.replace(/AND/g,"&&");
    result = result.replace(/OR/g,"||");

    return result;
}

function toQueryExpr(object){
    if("element_rule_id" in object){
        return ruleToQueryExpr(object);
    } else {
        return groupToQueryExpr(object);
    }
}

function groupToQueryExpr(group) {
    var i;
    var conditions = group['condition'];
    var result = "(";
    for(i = 0;i<conditions.length;i++) {
        var op = conditions[i]['logical_operator'];
        result += toQueryExpr(conditions[i]);
        if(i != conditions.length - 1){
            result += op; 
        }
    }
    result += ")";
    return result;
}

function ruleToQueryExpr(rule) {
    var condition = rule['condition'];

    var field = condition['field'];
    var value = condition['filterValue'][0];
    var op = translateOperator(condition['operator']);
    var result = "("+field+op+value+")";
    return result;
}

function translateOperator(op) { 
    operators = {'equal':'==', 'not_equal':'!=', 'less':'<','less_or_equal':'<=','greater_or_equal':'>='};
    return operators[op];
}

function convert_timestamp(ts) {
    var datetime = ts.split(' ');
    var date = datetime[0].split('/');
    var new_date_str = date[2] + "-" + date[1] + "-" + date[0];
    var new_ts = new_date_str + "+"+datetime[1];
    return new_ts;
}

function getQueryOpts() {
    $("#queryOptLimitWarningLabel").remove();
    $("#queryOptCheckErrorLabel").remove();
    var atLeastOne = false;
    var result = "";
    var error = false;
    ["historical","continuous","unified"].forEach(function(entry) {
        if ($("#"+entry)[0].checked){
           atLeastOne = true; 
           result += "&"+entry +"=true";
        }
    });
    
    if(!atLeastOne){
        $("#queryOptCheck").prepend('<div id="queryOptCheckErrorLabel" class="label label-danger">Select at least one option</div>');
        error = true;
    }
    var limit = parseInt($("#limit")[0].value);
    if(limit < 1 || limit > 1000){
        $("#queryOptLimit").append('<span id="queryOptLimitWarningLabel" class="label label-warning">Limit > 1000 may cause slow performance!</span>');
    } 

    if(isNaN(limit)){
        limit = 1000;
    }

    if(error){
        return "";
    }
    result += "&limit=" + limit;
    return result;
}
function operatorSet(ops){
    var excluded_ops = [];
    operators.forEach(function(entry){
        if(ops.indexOf(entry) < 0){
            excluded_ops.push(entry);
        }   
    });
    return excluded_ops;
}


