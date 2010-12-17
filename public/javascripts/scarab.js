Scarab = {};
Meta = {
  Node: {
    Dim: { 
      w: 48, 
      h: 48 
    }, 
  },
  GridNode: {
    Dim: {
      w: 36,
      h: 36
    },
    MaxCost: 100
  },
  Count: {
    Levels: 0,
    Nodes: 0,
    Edges: 0
  },
  Canvas: {
    Element: "canvas",
    Width: 840,
    Height: 540
  }
};

Scarab.GridSize = 0;
Scarab.Canvas = null;
Scarab.Context = null;
Scarab.Animated = true;
Scarab.Inspection = true;
Scarab.WeightsToggled = false;

Scarab.GraphType = "Grid";
Scarab.SearchType = "safest";

Scarab = function() {

  return {
    console_caret: function() {
      if ($("#caret").hasClass("white"))
        $("#caret").removeClass("white");
      else
        $("#caret").addClass("white");
      
      //$("#caret").toggleClass("white", $("#caret").hasClass("white"));
    },
    caret_msg: function(el, msg, i) {
      if (i > msg.length)
        return;
      
      el.append(msg[i]);
      
      return setTimeout(Scarab.caret_msg, 50, el, msg, i+1);
    },
    log: function(msg, el_class) {
    /*
      if ($("#caret"))
        $("#caret").remove();*/
      
      el_class = (el_class == null) ? "" : " class='" + el_class + "'";
      $(".console .result").before("<li" + el_class + "><span>$. " + msg + "</span></li>");
      //var li = $("#meta ul li:last span:first");
      
      //if ($(".console ul li").length > 20) { $(".console ul li:first").remove() };
      //this.caret_msg(li, msg, 0);
      
    },
    setup: function() {
      /*
			Scarab.Canvas =  document.getElementById('Scarab.Canvas');
			
			if (Scarab.Canvas && Scarab.Canvas.getScarab.Context) {
				Scarab.Context = Scarab.Canvas.getScarab.Context('2d');
				
        Scarab.Canvas.width = 820;
        Scarab.Canvas.height = 540;

    		//Scarab.Context.beginPath();

        console.log("Scarab has taken to the stage!");
			}
			*/
			Scarab.Canvas = Raphael(Meta.Canvas.Element, Meta.Canvas.Width, Meta.Canvas.Height);
      Scarab.Animated = true; 
      Scarab.Inspection = true;    
      Scarab.WeightsToggled = false;			
			//$("#meta ul").append("<li>scarab:~$ waiting<span id='caret'></span></li>");
			//setInterval(Scarab.console_caret, 500);
    },
    
    visualize: function(data, callback) {
      this.graph = new Graph();
      
      // parse metadata
      Meta.Count.Levels = data.meta[0];
      Meta.Count.Nodes = data.meta[1];
      Meta.Count.Edges = data.meta[2];
      
            
      this.graph.populate(data.meta.root, data.nodes, data.edges, data.levels);

      callback();
    },
    
    toggle_inspection: function() {
      Scarab.Inspection = !Scarab.Inspection;
    },
    
    toggle_weights: function() {
      if (Scarab.WeightsToggled) {
        $.each(this.graph.edges, function(id, edge) {
          edge.label.hide();
        });
        Scarab.WeightsToggled = false;
      } else {
        $.each(this.graph.edges, function(id, edge) {
          edge.label.show();
        });
        Scarab.WeightsToggled = true;
      }          
    },
    
    toggle_animations: function() {
      Scarab.Animated = !Scarab.Animated;
    },
    
    cleanup: function() {
      if (Scarab.Canvas) {
        Scarab.Canvas.clear();
      }
      this.graph = null;
    },
    
    graph: null
  }
}();
