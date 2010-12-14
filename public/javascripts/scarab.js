Scarab = {};
Meta = {
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
  },
  Canvas: {
    Element: "canvas",
    Width: 840,
    Height: 540
  }
};
Scarab.Canvas = null;
Scarab.Context = null;

Scarab = function() {

  return {
    setup: function() {
      /*
			Scarab.Canvas =  document.getElementById('Scarab.Canvas');
			
			if (Scarab.Canvas && Scarab.Canvas.getScarab.Context) {
				Scarab.Context = Scarab.Canvas.getScarab.Context('2d');
				
        Scarab.Canvas.width = 820;
        Scarab.Canvas.height = 540;

    		//Scarab.Context.beginPath();

        console.log("Kiwi has taken to the stage!");
			}
			*/
			Scarab.Canvas = Raphael(Meta.Canvas.Element, Meta.Canvas.Width, Meta.Canvas.Height);
			
    },
    
    visualize: function(data, callback) {
      this.graph = new Graph();
      
      // parse metadata
      Meta.Count.Levels = data.meta.levels;
      Meta.Count.Nodes = data.meta.nr_nodes;
      Meta.Count.Edges = data.meta.nr_edges;

      this.graph.populate(data.meta.root, data.nodes, data.edges, data.levels);

      callback();
    },
    
    toggle_weights: function() {
      if (this.edge_weights_shown) {
        $.each(this.graph.edges, function(id, edge) {
          edge.label.hide();
        });
        this.edge_weights_shown = false;
      } else {
        $.each(this.graph.edges, function(id, edge) {
          edge.label.show();
        });
        this.edge_weights_shown = true;
      }          
    },
        
    cleanup: function() {
      if (Scarab.Canvas) {
        Scarab.Canvas.clear();
      }
      this.graph = null;
    },
    
    graph: null,
    edge_weights_shown: false
  }
}();
