var OPERATORS =  ['in','not_in','less','less_or_equal','greater','greater_or_equal','is_null','is_not_null','begins_with','not_begins_with','contains', 'not_contains','ends_with','not_ends_with','equal', 'not_equal', 'is_empty', 'is_not_empty'];
var FIELD_KIND = {};

retrieve_DataTypes(VAST_SERVER);
function retrieve_DataTypes(VAST_URL){
	var types = {};
	oboe({
		url: VAST_URL + '/types',
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
	    fill_type_dropdown(types);
	})		
	.fail(
		function(err){
			console.log(err);
		}
	)
}

function fill_type_dropdown(choices_dic){
	var html_string = "<select id=\"type_picker\" class=\"selectpicker\" multiple data-selected-text-format=\"count\">";
	for( var type_name in choices_dic){
		if(choices_dic.hasOwnProperty(type_name)) { 
			html_string += '<option>'+type_name+'</option>';
		}
	}
	html_string += '</select>';
	$("#query_addition").html(html_string);
	$('.selectpicker').selectpicker();
	var button_id = 'type_select_button';
	build_types_submit_button(button_id);
	$('#'+button_id).click(function(){type_button_callback(choices_dic);}); 
}

function build_types_submit_button(id){
	var button_string = '<button id=\"'+id+'\" type=\"button\" class=\"btn btn-default\">Init</button>';
	$("#query_addition").append(button_string);
}

function type_button_callback(types){
	var selected_types = get_selected_types(types);
    var selected_fields = get_selected_fields(selected_types);
	set_type_filters(selected_fields);
    var headers = [];
    for(var field in selected_fields){
        headers.push(field);
    }
    build_table(headers);
}

function get_selected_fields(types)
{
    //Iterate over types and look for duplicates
    selected_fields = {};
    known_fields = [];
    for(var key in types){
        type = types[key];
        for(var f in type){
            if(isInArray(f, known_fields)){
                continue;
            } else {
                known_fields.push(f);
            }
            selected_fields[f] = type[f];
        }
    }
    return selected_fields;
}

function get_selected_types( types)
{	
	var selected_types = $('.selectpicker').val();
	var selected_types_structure = {};
	selected_types.forEach(function	(type){
		selected_types_structure[type] = types[type];
	});
	return selected_types_structure;
}

function set_type_filters(fields)
{
    var filters = [];
    var filter;
    for(var key in fields){
            filter = get_filter(key,fields[key]["kind"]);
            FIELD_KIND[key] = fields[key]["kind"];
			filters.push(filter);
    }
    set_query_builder(filters);
}

function get_filter(name,kind)
{
    var f_name = get_filter_name(name,kind);
    var label  = get_filter_label(name);
    var filter_type = get_filter_type(kind);
    var excl_ops = get_excluded_operators(kind);
    var filter_itf = get_filter_interface(kind);
    filter = {filterName:name, "filterType":filter_type, field:f_name, filterLabel: label, excluded_operators: excl_ops,filter_interface:filter_itf};
    if(kind == "time_point"){
        filter["filter_value_conversion"] = get_filter_value_conversion(kind);
    }
	return filter;
}

function set_query_builder(filters)
{
    var qb = $("#builder");
    qb.jui_filter_rules('destroy');
    qb.remove();
    var new_div = '<div id="builder"></div>';
    $("#builder_container").append(new_div);
	$("#builder").jui_filter_rules({
		bootstrap_version:"3",
		filters: filters,
        onValidationError: function(event, data) {
            if(data.hasOwnProperty("elem_filter")) {
                data.elem_filter.focus();
            }
        }});
}

function get_filter_name(name,kind)
{
    switch(kind){
        case "time_point":
            return "&time";
        default:
            return name;
    }
}

function get_filter_label(name)
{
    var words = name.split("_");
    var result = "";
    for(i =0;i<words.length;i++){
        result = result + capitalize(words[i]);
        if(i < words.length-1){
            result = result + " ";
        }
    }
    return result;
}

function get_filter_type(kind)
{
    switch(kind) {
        case "time_point":
            return "date";
        case "count":
            return "number";
        default:
            return "text";
    }
}

function get_excluded_operators(kind)
{
    switch(kind) {
        case "time_point":
            return operatorSet(["equal", "less", "greater","greater_or_equal"]);
        case "vector":
			return operatorSet(["equal","not_equal","contains","not_contains"]);
        case "address":
			return operatorSet(["equal","not_equal","in","not_in"]);
        case "subnet":
			return operatorSet(["equal","not_equal","contains","not_contains","in","not_in"]);
        default:
            return operatorSet(['equal','not_equal']);
    }
}

function get_filter_value_conversion(kind)
{
    switch(kind) {
        case "time_point":
            return {function_name:"convert_timestamp", args: [{"filter_value":"yes"}]};
        default:
            return {};

    }
}

function get_filter_interface(kind)
{
    filter_itf = {};
    switch(kind) {
        case "time_point":
            filter_itf["filter_element"] = "input";
            filter_itf["filter_element_attributes"] = {type:"text",title:"Set the date and time using format: dd/mm/yyyy hh:mm:ss"};
            filter_itf["filter_widget"] = "datetimepicker";
            filter_itf["filter_widget_properties"] = {dateFormat:"dd/mm/yy", timeFormat: "HH:mm:ss", changeMonth:true, changeYear:true, showSecond:true};
            return [filter_itf];
        default:
	        return [{filter_element: "input",filter_element_attributes :{"type":"text","value":""}}];
    }

}



function isInvalid(query,queryOpts) {
    return query == "" || queryOpts == "";
}



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
    var result;
    switch(FIELD_KIND[field]){
      case 'vector':
           if(op == 'in' || op == '!in'){
               result = '('+value+' '+op+' '+ field +')';
               break;
           } 
      case 'address':
           if(op == 'in' || op == '!in'){
               result = '('+ field + ' '+op+' '+ value +')';
               break;
           } 
      case 'subnet':
           if(op == 'in' || op == '!in'){
               result = '('+ field + ' '+op+' '+ value +')';
               break;
           } 
      default:
           result = "("+field+op+value+")";
    }    
    return '('+field+' ' + op + ' ' + value + ')';
    //return result;
}

function translateOperator(op) { 
    console.log(op);
    operators = {'in':'in','not_in':'!in','not_contains':'!ni','contains':'ni','equal':'==', 'not_equal':'!=', 'less':'<','less_or_equal':'<=','greater_or_equal':'>=','greater':'>'};
    return operators[op];
}

function convert_timestamp(ts) {
    var datetime = ts.split(' ');
    var date = datetime[0].split('/');
    var new_date_str = date[2] + "-" + date[1] + "-" + date[0];
    var new_ts = new_date_str + "+"+datetime[1];
    return new_ts;
}

function getLimit()
{
    var limit = parseInt($("#limit")[0].value);
    if(limit < 1 || limit > 1000){
        $("#queryOptLimit").append('<span id="queryOptLimitWarningLabel" class="label label-warning">Limit > 1000 may cause slow performance!</span>');
    } 

    if(isNaN(limit)){
        limit = 1000;
    }
    return limit;
}

function getQueryOpts() {
    $("#queryOptLimitWarningLabel").remove();
    $("#queryOptCheckErrorLabel").remove();
    var atLeastOne = false;
    var result = [];
    var error = false;
    ["historical","continuous","unified"].forEach(function(entry) {
        if ($("#"+entry)[0].checked){
           atLeastOne = true; 
           result.push(entry);
        }
    });
    
    if(!atLeastOne){
        $("#queryOptCheck").prepend('<div id="queryOptCheckErrorLabel" class="label label-danger">Select at least one option</div>');
        error = true;
    }
    return result.toString();
}
function operatorSet(ops){
    var excluded_ops = [];
    OPERATORS.forEach(function(entry){
        if(ops.indexOf(entry) < 0){
            excluded_ops.push(entry);
        }   
    });
    return excluded_ops;
}

function capitalize(s)
{
    return s[0].toUpperCase() + s.slice(1);
}

function isInArray(str, arr)
{
    return arr.indexOf(str) > -1;
}

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

$("#send_query").click(function() {
  var qb = $("#builder");
  var a_rules = qb.jui_filter_rules("getRules", 0, []);
  var query = buildQuery(a_rules);
  var queryOpts = getQueryOpts();
  var limit = getLimit();
 
  var value;
  if(isInvalid(query,queryOpts)) {
    $("#query_text").val("Invalid Query");
  } else{
    $("#query_text").val(query);
    esc_query = escape(query);
    replaced_query = esc_query.replace('+','%2B');
    send_query(replaced_query,queryOpts,limit);
  }

});
