var headers = ["timestamp", "source_ip", "source_as", "prefix", "as_path", "origin_as", "origin", "nexthop", "local_pref", "med", "community", "atomix_aggregate", "aggregator"];

var operators =  ['in','not_in','less','less_or_equal','greater','greater_or_equal','is_null','is_not_null','begins_with','not_begins_with','contains', 'not_contains','ends_with','not_ends_with','equal', 'not_equal', 'is_empty', 'is_not_empty'];


function operatorSet(ops){
    var excluded_ops = [];
    operators.forEach(function(entry){
        if(ops.indexOf(entry) < 0){
            excluded_ops.push(entry);
        }   
    });
    return excluded_ops;
}


$(function() {
    $("#builder").jui_filter_rules({
        bootstrap_version: "3",
        filters: [
            {
                filterName:"Local Pref.", "filterType":"text", field: "local_pref", filterLabel: "Local Pref.",
                excluded_operators: operatorSet(['equal','not_equal']), 
                filter_interface: [
                    {
                        filter_element: "input",
                        filter_element_attributes: {"type": "text", "value": ""}
                    }
                ]
            },
            {
                filterName:"Next Hop", "filterType":"text", field: "nexthop", filterLabel: "Next Hop",
                excluded_operators: operatorSet(['equal','not_equal']), 
                filter_interface: [
                    {
                        filter_element: "input",
                        filter_element_attributes: {"type": "text", "value": ""}
                    }
                ]
            },
            {
                filterName:"Origin", "filterType":"text", field: "origin", filterLabel: "Origin",
                excluded_operators: operatorSet(['equal','not_equal']), 
                filter_interface: [
                    {
                        filter_element: "input",
                        filter_element_attributes: {"type": "text", "value": ""}
                    }
                ]
            },
            {
                filterName:"Origin AS", "filterType":"text", field: "origin_as", filterLabel: "Origin AS",
                excluded_operators: operatorSet(['equal','not_equal']), 
                filter_interface: [
                    {
                        filter_element: "input",
                        filter_element_attributes: {"type": "text", "value": ""}
                    }
                ]
            },
            {
                filterName:"AS Path", "filterType":"text", field: "as_path", filterLabel: "AS Path",
                excluded_operators: operatorSet(['equal','not_equal']), 
                filter_interface: [
                    {
                        filter_element: "input",
                        filter_element_attributes: {"type": "text", "value": ""}
                    }
                ]
            },
            {
                filterName:"Prefix", "filterType":"text", field: "prefix", filterLabel: "Prefix",
                excluded_operators: operatorSet(['equal','not_equal']), 
                filter_interface: [
                    {
                        filter_element: "input",
                        filter_element_attributes: {"type": "text", "value": ""}
                    }
                ]
            },
            {
                filterName:"Source IP", "filterType":"text", field: "source_ip", filterLabel: "Source IP",
                excluded_operators: operatorSet(['equal','not_equal']), 
                filter_interface: [
                    {
                        filter_element: "input",
                        filter_element_attributes: {"type": "text", "value": ""}
                    }
                ]
            },
            {
                filterName:"Source AS", "filterType":"number", field: "source_as", filterLabel: "Source AS",
                excluded_operators: operatorSet(['equal','not_equal']),
                filter_interface: [
                    {
                        filter_element: "input",
                        filter_element_attributes: {"type": "text", "value": ""}
                    }
                ]
            }, 
            {
                filterName: "Time", "filterType": "date", field: "&time", filterLabel: "Time",
                excluded_operators: ["is_null", "is_not_null", "in", "not_in", "greater"],
                filter_interface: [
                    {
                        filter_element: "input",
                        filter_element_attributes: {
                            type: "text",
                            title: "Set the date and time using format: dd/mm/yyyy hh:mm:ss"
                        },
                        filter_widget: "datetimepicker",
                        filter_widget_properties: {
                            dateFormat: "dd/mm/yy",
                            timeFormat: "HH:mm:ss",
                            changeMonth: true,
                            changeYear: true,
                            showSecond: true
                        }
                    }
                ],
                filter_value_conversion: {
                    function_name: "convert_timestamp",
                    args: [
                        {"filter_value": "yes"}
                    ]
                },
            },
        ],
 
        onValidationError: function(event, data) {
            console.log(data);
            if(data.hasOwnProperty("elem_filter")) {
                data.elem_filter.focus();
            }
        },
 
    });
 
});

$("#get_rules").click(function() {
  var a_rules = $("#builder").jui_filter_rules("getRules", 0, []);
  var query = buildQuery(a_rules);
  var queryOpts = getQueryOpts();
  alert("VAST QUERY: " + query+queryOpts);
  process_query(escape(query)+queryOpts, 'table', ["timestamp", "source_ip", "source_as", "prefix", "as_path", "origin_as", "origin", "nexthop", "local_pref", "med", "community", "atomix_aggregate", "aggregator"]);
});


$("#clear_rules").click(function() {
  $("#builder").jui_filter_rules("clearAllRules");
});

$("#set_rules").click(function() {
  $("#builder").jui_filter_rules("setRules", dummy_rules);
});


function buildQuery(rules){
    var result = "";
    var rule;
    var i;
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
    var atLeastOne = false;
    var result = "";
    ["historical","continuous","unified"].forEach(function(entry) {
        if ($("#"+entry)[0].checked){
           atLeastOne = true; 
           result += "&"+entry +"=true";
        }
    });

    return result + "&limit=" + $("#limit")[0].value;
}



