function print_graph(graph) {
  
  Pixy.Kiwi.cleanup();
  $("#canvas").show();
  
  $("#loader .loading").html("..VISUALIZING..");
      
  $("#meta").empty();
  $("#meta").html("<p>there are <span>" + graph.meta.nr_nodes + "</span> nodes connected by "
    + "<span>" + graph.meta.nr_edges + "</span> edges across <span>"
    + graph.meta.levels + "</span> levels</p>");
    
  Pixy.Kiwi.visualize(graph, function() {
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
  
  Pixy.Kiwi.setup();   
  //$("#loader").hide();
  $("#overlay").hide();
  
  $("#tooltip-welcome").show();
  
  $("#generate-graph").click(function() {

    $.ajax({
      type: "GET",
      dataType: 'json',
      url: "/graph.json",
      beforeSend: function() {
        Pixy.Kiwi.cleanup();
        $("#about").hide();
        $("#tooltips").show();
        $("#tooltip-welcome").hide();
        $("#tooltip-loading").show();
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

    Pixy.Kiwi.toggle_weights();
  });
  
  $("#replay-path").click(function() {
    if ($(this).hasClass("disabled"))
      return false;
      
    Pixy.Kiwi.graph.highlight_path();
  });
  
  $("#choose-heuristic").click(function() {
    if ($(this).hasClass("disabled"))
      return false;
      
    $("#overlay").toggle();
    $("#overlay-change-heuristic").show();
  });
  
  $("#header h1").click(function() {
    Pixy.Kiwi.cleanup();
    $("#canvas").hide();
    
    $("#about").show();
  });
  
  $(".close-tooltip").click(function() {
    $("#tooltips").hide();
  });
  
  $("#heuristic-manhattan").click(function() {
    $("#overlay-change-heuristic").hide();    
    $("#overlay").hide();
  });
  
  $("#heuristic-euclidean").click(function() {
    $("#overlay-change-heuristic").hide();    
    $("#overlay").hide();
  });
  
  $(".close-overlay").click(function() {
    $("#overlay").hide();
  });
  
});
