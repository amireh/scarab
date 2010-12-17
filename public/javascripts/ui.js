window.log = function(msg){
	if(this.console){
		console.log( arguments );
	}
};

function print_graph(graph) {
  
  Scarab.cleanup();
  $("#canvas").show();
  
  $("#loader .loading").html("..VISUALIZING..");
      
  $("#meta ul li").each(function() { if (!$(this).hasClass("result")) { $(this).remove(); }});
  /*
  $("#meta").html("<p>there are <span>" + graph.meta[1] + "</span> nodes connected by "
    + "<span>" + graph.meta[2] + "</span> edges across <span>"
    + graph.meta[0] + "</span> levels</p>");
  */
  Scarab.log("levels: " + graph.meta[0]);
  Scarab.log("nodes: " + graph.meta[1]);
  Scarab.log("edges: " + graph.meta[2]);
  
  Scarab.visualize(graph, function() {
    $("#loader .loading").hide();
    $("#tooltip-loading").hide();
    $("#tooltips").hide();
    
    $("#canvas").css("background-image", "none");

    if (Scarab.GraphType == "Random")
      $("#toggle-weights").removeClass("disabled");
    else
      $("#toggle-weights").addClass("disabled");
      
    $("#choose-heuristic").removeClass("disabled");
    $("#toggle-animations").removeClass("disabled");
    $("#toggle-inspection").removeClass("disabled");
    $("#legend").show();
    $(".graph-help").show();
  });
  
};

function show_tooltip(msg) {
  $("#tooltips").show();
  $("#tooltip-dynamic").html(msg);
}

function show_overlay(el_id) {
  $("#overlay").children().each(function(id, child) { $(this).hide(); });
  $("#overlay .close-overlay:first").show();
  $("#" + el_id).show();
  $("#overlay").show();
    
};

function hide_overlays() { 
  $("#overlay").hide();
};

$(function() {

  var welcome_closed = false;
  var loading_closed = false;
  var grid_size_specified = false;
  var grid_size = 0;
  
  Scarab.setup();
  Scarab.log("$c4r4b");

  $("#overlay").hide();
  $("#legend").hide();  
  
  $("#tooltip-loading").addClass("hidden");
  $("#tooltip-welcome").show();

  $("#tooltips").show();
  
	$( "#grid-size-slider" ).slider({
		value:11,
		min: 2,
		max: 21,
		step: 1,
		slide: function( event, ui ) {
		  Scarab.GridSize = parseInt(ui.value);
			var x = ui.value;
			var y = (ui.value >= 13) ? 13 : ui.value;
			$("#grid-size").html( x + "x" + y );
		}
	});
	$( "#grid-size" ).html( $( "#grid-size-slider" ).slider( "value" ) + "x" + $( "#grid-size-slider" ).slider( "value" ));
		
  $("#generate-graph").click(function() {

    $.ajax({
      type: "GET",
      dataType: 'json',
      url: "/graph.json",
      beforeSend: function() {
        Scarab.cleanup();
        $("#about").hide();
        $("#tooltip-welcome").hide();
        if (!loading_closed) {
          $("#tooltip-loading").show();
          $("#tooltips").show();
        }
        $("#canvas").show();
        $("#canvas").css("background", "url('/images/loader.gif') #111 no-repeat center center");
        $("#loader .loading").show();
      },
      success: function(data) {
        Scarab.GraphType = "Random";
        graph = data;
        setTimeout(print_graph, 1000, graph);
      }
    });

    return false;
    
  });
  
  $("#generate-grid").click(function() {
    show_overlay("overlay-generate-grid");
  });
  
  $("#do-generate-grid").click(function() {
    
    hide_overlays();
    
    $.ajax({
      type: "GET",
      dataType: 'json',
      url: "/grid.json",
      data: { size: $( "#grid-size-slider" ).slider( "value" )-1 },
      beforeSend: function() {
        Scarab.cleanup();
        $("#about").hide();
        $("#tooltip-welcome").hide();
        if (!loading_closed) {
          $("#tooltip-loading").show();
          $("#tooltips").show();
        }
        $("#canvas").show();
        $("#canvas").css("background", "url('/images/loader.gif') #111 no-repeat center center");
        $("#loader .loading").show();
      },
      success: function(data) {
        Scarab.GraphType = "Grid";
        graph = data;
        setTimeout(print_graph, 1000, graph);
      }
    });

    return false;
    
  });
  
  $("#toggle-weights").click(function() {
    if ($(this).hasClass("disabled"))
      return false;

    Scarab.toggle_weights();
  });
  
  $("#replay-path").click(function() {
    if ($(this).hasClass("disabled"))
      return false;
      
    Scarab.graph.highlight_path();
  });
  
  $("#choose-heuristic").click(function() {
    if ($(this).hasClass("disabled"))
      return false;
      
    show_overlay("overlay-change-heuristic")
  });
  
  $("#header h1").click(function() {
    Scarab.cleanup();
    $("#canvas").hide();
    
    $("#about").show();
  });
  
  $(".close-tooltip").click(function() {
    if ($("#tooltip-welcome").hasClass("hidden")) {
      loading_closed = true;
      $("#tooltip-loading").addClass("hidden");
    } else {
      welcome_closed = true;
      $("#tooltip-welcome").addClass("hidden");
    }
    
    $("#tooltips").hide();
  });
  
  $("#heuristic-manhattan").click(function() {
    Scarab.graph.set_heuristic("manhattan");
    hide_overlays();
  });
  
  $("#heuristic-euclidean").click(function() {
    Scarab.graph.set_heuristic("euclidean");
    hide_overlays();
  });
  
  $(".close-overlay").click(function() {
    hide_overlays();
  });
  
  $("#toggle-animations").click(function() {
    if ($(this).hasClass("disabled"))
      return false;
        
    Scarab.toggle_animations();
    if (Scarab.Animated)
      $(this).find('a span').removeClass("red").addClass("green").html("ON");
    else
      $(this).find('a span').removeClass("green").addClass("red").html("OFF");
    return false;
  });

  $("#toggle-inspection").click(function() {
    if ($(this).hasClass("disabled"))
      return false;
    
    Scarab.toggle_inspection();
    if (Scarab.Inspection)
      $(this).find('a span').removeClass("red").addClass("green").html("ON");
    else
      $(this).find('a span').removeClass("green").addClass("red").html("OFF");
    return false;
  });
  
  $(".graph-help").click(function() {
    show_overlay("overlay-graph-help");
  });
  
  $("#click-me").click(function() {
    show_overlay("overlay-stuff");
  });
});
