function Edge() {

  this.self = this;

  this.head = null;
  this.tail = null;
  this.weight = 0;
  this.index = null;  
  
  this.orig = { x: 0, y: 0 };
  this.dest = { x: 0, y: 0 };
  
  // shapes
  this.line = null;
  this.pointer = null;
  this.label = null;
  
  // shape styles
  this.styles = { 
    line:   { stroke: "#FFFFFF", "stroke-width": "0.5px" },
    label:  { fill: "#FFFFFF", font: "14px Verdana", "font-weight": "bold", cursor: "default"},
    pointer: { fill: "#FFFFFF" }
  };
  
  // this is set to true when this edge is part of a path
  // being highlighted; it locks the edge from being
  // de-highlighted on hover
  this.path_highlighted = false;
  
};

Edge.prototype = {

  create: function(in_id, in_head, in_tail, in_weight) {
    this.index = in_id;
    this.head = in_head;
    this.tail = in_tail;
    this.weight = in_weight;
    
    this.orig = this.head.pos;
    this.dest = this.tail.pos;

    this.line = Scarab.Canvas.path("M" + 
      this.orig.x + " " + this.orig.y + 
      "L" + 
      this.dest.x + " " + this.dest.y
    );
      
    this.line.attr(this.styles.line);

    var point = this.line.getPointAtLength(this.line.getTotalLength() - this.tail.dim.h / 2 - 4);
    this.pointer = Scarab.Canvas.circle(point.x, point.y, 3);
    this.pointer.attr(this.styles.pointer);
    
    point = this.line.getPointAtLength(this.line.getTotalLength() / 2);
	  this.label = Scarab.Canvas.text(point.x, point.y, this.weight);
	  this.label.attr(this.styles.label);
    this.label.hide();
  },

  highlight: function() {
    if (!this.path_highlighted)
      this.line.attr({ stroke: "green", "stroke-width": "2px" });
      
    this.label.show();
    
  },
    
  dehighlight : function() {
      if (!this.path_highlighted)  
        this.line.attr(this.styles.line);
      
      this.label.hide();
  },

  // list is an array of edges, index is the index of the
  // the current edge.. this method recursively calls the
  // next edge in the list to get highlighted
  highlight_path: function(list, index) {
    var self = this;

    this.path_highlighted = false;
    this.dehighlight();
    
    this.line.animate({ stroke: "red", "stroke-width": "2px"}, 250, "bounce", function() {
      self.path_highlighted = true;
      if (index+1 != list.length)
        return list[index+1].highlight_path(list, index+1);
      else {
        var goal = list[index].head.to_be_highlighted ? list[index].head : list[index].tail;
        goal.goal = true;
        goal.dehighlight();
        return true;
      }
    });
  }

};

