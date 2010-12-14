if (Pixy === undefined)
  Pixy = [];

Pixy.Edge = function() {
  
  return {

  find_position: function() {
  
    this.orig = this.head.pos;
    this.dest = this.tail.pos;
  
  },
  
  highlight: function() {
    if (!this.path_highlighted)
      this.line.attr({ stroke: "green", "stroke-width": "2px" });
      
    this.label.show();
  },
  
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
  },
  
  dehighlight: function() {
    if (!this.path_highlighted)  
      this.line.attr(this.style);
    
    this.label.hide();
  },
      
  create: function(in_id, in_head, in_tail, in_weight) {
    this.index = in_id;
    this.head = in_head;
    this.tail = in_tail;
    this.weight = in_weight;
    
    this.find_position();
    this.line = Pixy.canvas.path("M" + this.orig.x + " " + this.orig.y + "L" + this.dest.x + " " + this.dest.y);
    this.line.attr(this.style);
          
    var point = this.line.getPointAtLength(this.line.getTotalLength() - this.tail.dim.h / 2 - 4);
    this.pointer = Pixy.canvas.circle(point.x, point.y, 3);
    this.pointer.attr({ fill: "#FFF" });
    
    point = this.line.getPointAtLength(this.line.getTotalLength() / 2);
		this.label = Pixy.canvas.text(point.x, point.y, this.weight);
		this.label.attr({fill: "#FFF", font: "14px Verdana", "font-weight": "bold", cursor: "default"});
    this.label.hide();
    
  },
    
  head: null,
  tail: null,
  orig: { x: 0, y: 0 },
  dest: { x: 0, y: 0 },
  line: null,
  pointer: null,
  weight: 0,
  style: { stroke:"#FFFFFF", "stroke-width": "0.5px" },
  index: 0,
  label: null,
  path_highlighted: false,
  runner: null
  }
};


