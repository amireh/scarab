/*
Pixy.skins = { node: new Image(), node_hover: new Image(), node_root: new Image() };
Pixy.skins.node.src = "/images/node/Gray.png";
Pixy.skins.node_hover.src = "/images/node/Green.png";
Pixy.skins.node_root.src = "/images/node/Red.png";
*/

Pixy.Node = function() {
	
	var self = this;
  var edges = [];
  	
	function highlight_edges(node) {
	  if (edges.length == 0) {
	    var graph = Pixy.Kiwi.graph;
	    edges = graph.find_edges(node);
	  }
	  
	  $.each(edges, function(id, edge) {
	    edge.highlight();
	  });
	};
	function dehighlight_edges(node) {
	  //if (self.goal)
	  //  return;
	    
	  $.each(edges, function(id, edge) {
	    edge.dehighlight();
	  });	
	};

  return {

    create: function(in_id, in_level, in_val, in_pos) {
      this.index = in_id;
      this.level = in_level;
      this.val = in_val;
      this.pos = in_pos;
    },
    
    highlight: function() {
      //this.sprite.attr({ fill: "orange" });
      this.sprite.attr(this.style_hover);
      highlight_edges(self.index);    
    },
    
    dehighlight: function() {
      if (self.goal)
        this.sprite.attr({ fill: self.style_goal.fill });
      else
        this.sprite.attr({ fill: self.style.fill });
        
      dehighlight_edges(self.index);    
    },
    
    draw: function() {

      this.sprite = Pixy.canvas.circle(this.pos.x, this.pos.y, this.dim.w / 2);
      this.sprite.attr(this.style);
			
			this.label = Pixy.canvas.text(this.pos.x, this.pos.y, this.val);
			this.label.attr({fill: "#ffffff", font: "18px verdana", "font-weight": "bold", cursor: "default"});
			
			self = this;
			
      $(this.sprite.node).mouseover(function() {
        self.highlight();
      });
      
      $(this.sprite.node).mouseout(function() {
        self.dehighlight();
      });
      
      $(this.sprite.node).click(function() {
        /*
        $.ajax({
          type: "GET",
          dataType: "json",
          url: "/path.json",
          data: { root: Pixy.Kiwi.graph.root, dest: self.index },
          beforeSend: function() {
            $("#cpanel .console").html("...GENERATING BEST PATH...");
          },
          success: function() {
          
          }
        });
        */
        ///console.log("Asking for path from " + self.index);
        var nodes = Pixy.Kiwi.graph.search(null, self, null);
        Pixy.Kiwi.graph.highlight_path();
        
        return false;
      });
          
    },
    highlight_root: function() {
			this.style = this.style_root;

			this.sprite.attr(this.style);
    },
    
    highlight_goal: function() {
			//this.style.fill = "green";
			//this.sprite.attr(this.style);    
    },
    
    neighbors: function() {
      if (this.edges.length == 0) {
        this.edges = Pixy.Kiwi.graph.find_edges(self.index);
      }
      //console.log("Checking " + this.edges.length + " connections");
      var list = [];
      $.each(this.edges, function(id, edge) {
        //console.log("Checking " + self.index + " vs " + edge.tail.index + " and " + edge.head.index);
        list.push( edge.tail.index == self.index ? edge.head : edge.tail );
      });
      
      console.log("Found " + list.length + " neighbors");
      return list;
    },
    
    dim: Pixy.Meta.Node.Dim,
	  pos: { x: 0, y: 0},
	  sprite: null,
	  is_root: false,
	  label: null,
	  index: null,
	  level: null,
	  val: null,
	  style: { fill: "#000", stroke: "orange", "stroke-width": "2px", cursor: "pointer" },
	  style_hover: { fill: "orange" },
	  style_root: { fill: "#a60000" },
	  style_goal: { fill: "#0b7000" },
	  edges: edges,
	  
	  closed: false,
	  visited: false,
	  f: 0,
	  g: 0,
	  h: 0,
	  parent: null,
	  goal: false,
	  to_be_highlighted: false
  }  
};

