$.getScript("oboe-browser.js", function( data, textStatus, jqxhr ) {
  console.log( data ); // Data returned
    console.log( textStatus ); // Success
      console.log( jqxhr.status ); // 200
        console.log( "Load was performed." );
        });




function test(ding){
    alert("funktioniert");
    sendQuery();
}

function sendQuery(){
    oboe('http://localhost:8888/?query=&time<now')
   .done(
   function(things) 
   {
   
   $('#result_table').DataTable().row.add(things).draw();
   console.log(things);
   }
   ).fail(function() 
   {
   console.log("fail")
   }
   );
}
