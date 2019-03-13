/* javascript */

/* drag and drop */
let Source = $("#Source");
console.log(Source);
let Queue = $("#Queue");
console.log(Queue);
let Fork = $("#Fork");
console.log(Fork);
let Exit = $("#Exit");
console.log(Exit);

let Sandbox = $("#droppable");
console.log(Sandbox);

$( function() {
   	$( ".draggable1" ).draggable({
  		classes: {
    		"ui-draggable": "highlight"
 		}
 	});	
	$( ".draggable2" ).draggable({
	  		classes: {
	    		"ui-draggable": "highlight"
	 		}
	});	
	$( ".draggable3" ).draggable({
	  		classes: {
	    		"ui-draggable": "highlight"
	 		}
	});	
	$( ".draggable4" ).draggable({
	  		classes: {
	    		"ui-draggable": "highlight"
	 		}
 	});	
   	/* Source.draggable(); */
   	/* Queue.draggable(); */
   	/* Fork.draggable(); */
   	/* Exit.draggable(); */

   	Sandbox.droppable({
		drop: function( event, ui ) {
			$( this )
   				.addClass( "ui-state-highlight" )
       				.find( "p" )
       					.html( "Dropped!" );
		}
   	});
});	

/* clone */	
if (1){
	/* var cloneCountSource = 1;
	$( function() {
		$("#Source").clone().attr('Source', 'Source'+ cloneCountSource++).appendTo("#slot1");
	}); */
	$( ".draggable1" ).clone().appendTo( "#slot1" );
}
	
