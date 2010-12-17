function GridNode() {

	self = this;
	
  this.index = -1;
  this.level = -1;
  this.val = -1;
  this.f = 0;
  this.g = 0; // the added cost of getting to this node from the start
  this.h = 0; // heuristic, which can estimate how close the node is to the goal

  this.edges = [];
  this.parent = "moo";
  
  this.dim = Meta.GridNode.Dim;
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
  this.path_highlighted = false;
  
  this.styles = {
    normal: { fill: "#000", stroke: "orange", "stroke-width": "2px", cursor: "pointer" },
    hover:  { fill: "orange" },
    root:   { fill: "#a60000" },
    goal:   { fill: "#0b7000" },
    visited:{ fill: "#333" },
    label:  { fill: "#ffffff", font: "11px verdana", "font-weight": "bold", cursor: "pointer"}
  };
  this.styles.current = this.styles.normal;
};

GridNode.prototype = {

  print_info: function() {
    el = $(".console .inspector");
    el.empty();
    el.append("<span>" + this + "</span>");
    el.append("<br /># of connections: <span>" +  this.edges.length + "</span>");
    el.append("<br />f: <span>" + this.f + "</span> g: <span>" + this.g + "</span> h: <span>" + this.h + "</span>");
    el.append("<br />node value: <span>" + this.val + "</span>");
  },

  create: function(in_id, in_level, in_val, in_pos) {
    this.index = in_id;
    this.level = in_level;
    this.val = in_val * 2;
    this.pos = in_pos;
  },

  draw: function() {

    this.circle = Scarab.Canvas.rect(this.pos.x, this.pos.y, this.dim.w, this.dim.h, 5);
    this.circle.attr(this.styles.normal);
	
	  var label_txt = this.val;
	  this.label = Scarab.Canvas.text(this.pos.x + this.dim.w / 2, this.pos.y + this.dim.h / 2, label_txt);
	  this.label.attr(this.styles.label);

	  //self = this;
	
	  this.label.node.my_node = this;
	  this.circle.node.my_node = this;
	
	  /*$(this.label.node).mouseover(function() {
	    this.my_node.highlight();
	  });
	*/
    $(this.circle.node).mouseover(function() {
      this.my_node.highlight();
      
      if (Scarab.Inspection)
        this.my_node.print_info();
    });
    
    $(this.circle.node).mouseout(function() {
      this.my_node.dehighlight();
    });
    
    $(this.label.node).click(function() { $(this.my_node.circle.node).click(); });
    $(this.circle.node).click(function() { Scarab.graph.search(null, this.my_node, null); });
        
  },

  highlight: function() {
    
    if (Scarab.Animated)
      this.circle.animate(this.styles.hover, 50);
    else
      this.circle.attr(this.styles.hover);
  },
  
  highlight_visited: function() {
    //this.path_highlighted = true;
    this.styles.current = this.styles.visited;
    //this.circle.animate(this.styles.current, 350);
    this.dehighlight();
  },

  highlight_root: function() {
	  this.styles.current = this.styles.normal = this.styles.root;
	  this.circle.attr(this.styles.current);
  },
      
  highlight_goal: function() {
    this.styles.current = this.styles.goal;
    if (Scarab.Animated)
      this.circle.animate(this.styles.current, 200);
    else
      this.circle.attr(this.styles.current);    
  },
  
  highlight_path: function(list, index) {
    var self = this;
    if (index+1 == list.length) {
      var goal = list[index]
      goal.path_highlighted = true;
      goal.goal = true;
      goal.highlight_goal();
      
      return true;
    }

    //this.dehighlight();
    this.styles.current = this.styles.root;
    //this.circle.animate(self.styles.current, 100, function() {
      
      self.dehighlight(200, function() {
        self.path_highlighted = true;
        return list[index+1].highlight_path(list, index+1);
      });
    //});
    
  },  
  
  dehighlight: function(speed, callback) {
    //if (this.path_highlighted)
    //  return false;

    speed = speed || 200;
    
    if (Scarab.Animated)
      this.circle.animate(this.styles.current, speed, function() {
        if (callback)
          callback();
      });
    else {
      this.circle.attr(this.styles.current);
      if (callback)
        callback();
    }
      
  },  

  reset: function() {
    this.f = 0;
    this.g = 0;
    this.h = 0;
    this.visited = false;
    this.closed = false;
    this.parent = null;
    this.goal = false;
    this.to_be_highlighted = false;
    this.path_highlighted = false;
    this.styles.current = this.styles.normal;
    this.dehighlight();
  },
  
  neighbors: function() {
    if (this.edges.length == 0) {
      this.edges = Scarab.graph.find_edges(this);
    }
    var idx = this.index;
    var list = [];
    var self = this;
    $.each(this.edges, function(id, edge) {
      list.push( (edge.tail == self) ? edge.head : edge.tail );
    });
    
    //console.log("Found " + list.length + " neighbors");
    return list;
  },
  
  toString: function() {
    return "node[" + this.level + "][" + this.index + "]";
  }

};
