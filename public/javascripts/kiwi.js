Pixy = [];
Pixy.canvas = null;
Pixy.context = null;

Pixy.Meta = {
  Node: { 
    Dim: { 
      w: 48, 
      h: 48 
    }, 
  },
  Count: {
    Levels: 0,
    Nodes: 0,
    Edges: 0
  }
};

var edge_weights_shown = false;

Pixy.Kiwi = function() {

  var graph = null;

  return {
    graph: this.graph,
    setup: function() {
      /*
			Pixy.canvas =  document.getElementById('Pixy.canvas');
			
			if (Pixy.canvas && Pixy.canvas.getPixy.context) {
				Pixy.context = Pixy.canvas.getPixy.context('2d');
				
        Pixy.canvas.width = 820;
        Pixy.canvas.height = 540;

    		//Pixy.context.beginPath();

        console.log("Kiwi has taken to the stage!");
			}
			*/
			Pixy.canvas = Raphael("canvas", 820, 540);
			
    },
    
    visualize: function(data, callback) {
      this.graph = new Pixy.Graph();
      graph = this.graph;
      
      // parse metadata
      Pixy.Meta.Count.Levels = data.meta.levels;
      Pixy.Meta.Count.Nodes = data.meta.nr_nodes;
      Pixy.Meta.Count.Edges = data.meta.nr_edges;

      graph.populate(data.meta.root, data.nodes, data.edges, data.levels);
      console.log("here");
      callback();
    },
    
    toggle_weights: function() {
      if (edge_weights_shown) {
        $.each(graph.edges, function(id, edge) {
          edge.label.hide();
        });
        edge_weights_shown = false;
      } else {
        $.each(graph.edges, function(id, edge) {
          edge.label.show();
        });
        edge_weights_shown = true;
      }          
    },
        
    cleanup: function() {
      if (Pixy.canvas) {
        Pixy.canvas.clear();
      }
      graph = null;
    }
  }
}();
