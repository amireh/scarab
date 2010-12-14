function Node() {

	self = this;
	
  this.index = -1;
  this.level = -1;
  this.val = -1;
  this.f = 0;
  this.g = 0;
  this.h = 0;

  this.edges = [];
  this.parent = "moo";
  
  this.dim = Meta.Node.Dim;
  this.pos = { x: 0, y: 0};
  
  // shapes
  this.circle = null;
  this.label = null;
  
  // flags
  this.is_root = false;
  this.closed = false;
  this.visited = false;
  this.goal = false; // toggled when the node is ready to be highlighted as goal of the path
  this.to_be_highlighted = false; // when this node is the goal of a path

  this.styles = {
    normal: { fill: "#000", stroke: "orange", "stroke-width": "2px", cursor: "pointer" },
    hover:  { fill: "orange" },
    root:   { fill: "#a60000" },
    goal:   { fill: "#0b7000" },
    label:  {fill: "#ffffff", font: "18px verdana", "font-weight": "bold", cursor: "pointer"}
  };
};

Node.prototype = {

  create: function(in_id, in_level, in_val, in_pos) {
    this.index = in_id;
    this.level = in_level;
    this.val = in_val;
    this.pos = in_pos;
  },

  draw: function() {

    this.circle = Scarab.Canvas.circle(this.pos.x, this.pos.y, this.dim.w / 2);
    this.circle.attr(this.styles.normal);
	
	  this.label = Scarab.Canvas.text(this.pos.x, this.pos.y, this.val);
	  this.label.attr(this.styles.label);

	  //self = this;
	
	  this.label.node.my_node = this;
	  this.circle.node.my_node = this;
	
	  $(this.label.node).mouseover(function() {
	    this.my_node.highlight();
	  });
	
    $(this.circle.node).mouseover(function() {
      this.my_node.highlight();
    });
    
    $(this.circle.node).mouseout(function() {
      this.my_node.dehighlight();
    });
    
    $(this.label.node).click(function() { $(this.my_node.circle.node).click(); });
    $(this.circle.node).click(function() { Scarab.graph.search(null, this.my_node, null); });
        
  },

  highlight_edges: function() {
    if (this.edges.length == 0) {
      var graph = Scarab.graph;
      // __TODO__ after creating nodes & edges assign every edge to node
      this.edges = graph.find_edges(this);
    }
    
    $.each(this.edges, function(id, edge) {
      edge.highlight();
    });
  },

  dehighlight_edges: function() {
    //if (self.goal)
    //  return;

    $.each(this.edges, function(id, edge) {
      edge.dehighlight();
    });	
  },

  highlight: function() {

    this.circle.attr(this.styles.hover);
    this.highlight_edges();
  },

  dehighlight: function() {
    if (this.goal)
      this.circle.attr(this.styles.goal);
    else
      this.circle.attr(this.styles.normal);
      
    this.dehighlight_edges();
  },


  highlight_root: function() {
	  this.styles.normal = this.styles.root;
	  this.circle.attr(this.styles.normal);
  },
      
  highlight_goal: function() {
	  //this.styles.fill = "green";
	  //this.circle.attr(this.styles);    
  },

  neighbors: function() {
    if (this.edges.length == 0) {
      this.edges = Scarab.graph.find_edges(this);
    }
    var idx = this.index;
    var list = [];
    $.each(this.edges, function(id, edge) {
      list.push( edge.tail.index == idx ? edge.head : edge.tail );
    });
    
    //console.log("Found " + list.length + " neighbors");
    return list;
  }

};
