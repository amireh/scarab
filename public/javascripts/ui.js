function print_graph(graph) {
  
  Scarab.cleanup();
  $("#canvas").show();
  
  $("#loader .loading").html("..VISUALIZING..");
      
  $("#meta").empty();
  $("#meta").html("<p>there are <span>" + graph.meta.nr_nodes + "</span> nodes connected by "
    + "<span>" + graph.meta.nr_edges + "</span> edges across <span>"
    + graph.meta.levels + "</span> levels</p>");
    
  Scarab.visualize(graph, function() {
    $("#loader .loading").hide();
    $("#tooltip-loading").hide();
    $("#tooltips").hide();
    
    $("#canvas").css("background-image", "none");

    $("#toggle-weights").removeClass("disabled");
    $("#choose-heuristic").removeClass("disabled");
  });
  
};

function show_tooltip(msg) {
  $("#tooltips").show();
  $("#tooltip-dynamic").html(msg);
}

$(function() {
  
 
  Scarab.setup();   
  //$("#loader").hide();
  $("#overlay").hide();
  
  var welcome_closed = false;
  var loading_closed = false;
  
  $("#tooltip-loading").addClass("hidden");
  $("#tooltip-welcome").show();
  
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
      
    $("#overlay").toggle();
    $("#overlay-change-heuristic").show();
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
    $("#overlay-change-heuristic").hide();    
    $("#overlay").hide();
  });
  
  $("#heuristic-euclidean").click(function() {
    Scarab.graph.set_heuristic("euclidean");
    $("#overlay-change-heuristic").hide();
    $("#overlay").hide();
  });
  
  $(".close-overlay").click(function() {
    $("#overlay").hide();
  });
  
});
