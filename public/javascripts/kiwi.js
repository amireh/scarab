var canvas = null;
var context = null;

Pixy = [];
Pixy.skins = { node: new Image(), node_hover: new Image(), node_root: new Image() };
Pixy.skins.node.src = "/images/node/Gray.png";
Pixy.skins.node_hover.src = "/images/node/Green.png";
Pixy.skins.node_root.src = "/images/node/Red.png";

Pixy.Edge = function() {
  var head = null;
  var tail = null;
  var orig = { x: 0, y: 0 };
  var dest = { x: 0, y: 0 };
  var line = null;
  var weight = 0;
  
  function find_position() {
    // if tail is to our right, line starts
    // at the right edge of the head
    if (tail.position.x > head.position.x) {
      orig.x = head.dim.w + head.position.x;
      dest.x = tail.position.x;
    } else if (tail.position.x == head.position.x) {
      orig.x = head.position.x + (head.dim.w / 2);
      dest.x = tail.position.x + (tail.dim.w / 2);
    } else {
      orig.x = head.position.x;
      dest.x = tail.position.x + tail.dim.w;
    }
    
    // if the tail is below the head, but at the
    // same X coord, then we place our line at the
    // bottom edge of the head and its center
    if (tail.position.y > head.position.y) {
      orig.y = head.position.y + head.dim.h;
      dest.y = tail.position.y;
    } else if (tail.position.y == head.position.y) {
      // theyre on same y coord
      orig.y = head.position.y + (head.dim.h / 2);
      dest.y = tail.position.y + (tail.dim.h / 2);
    } else {
      // tail's above the head
      orig.y = head.position.y;
      dest.y = tail.position.y + tail.dim.h;
    }
    
  };
  
  return {
    head: head,
    tail: tail,
    create: function(in_head, in_tail, in_weight) {
      head = in_head;
      tail = in_tail;
      weight = in_weight;
      
      find_position();
      line = canvas.path("M" + orig.x + " " + orig.y + "L" + dest.x + " " + dest.y);
      line.attr({stroke:"#FFFFFF", "stroke-width": "0.5px"});
      
      
    }
  }
  
};

Pixy.Node = function() {
	var width = 48;
	var height = 48;
	var position = { x: 0, y: 0};
	var sprite = null;
	var hover_sprite = null;
	var is_root = false;
	
	var label = null;
	
	var id = null;
	var level = null;
	var val = null;
	
  return {
    sprite: sprite,
    position: position,
    is_root: is_root,
    dim: { w: width, h: height },
    create: function(in_id, in_level, in_val, pos) {
      id = in_id;
      level = in_level;
      val = in_val;
      
      position.x = pos.x; position.y = pos.y;
      
      hover_sprite = canvas.image(Pixy.skins.node_hover.src, position.x, position.y, width, height);
      hover_sprite.hide();
			sprite = canvas.image(Pixy.skins.node.src, position.x, position.y, width, height);
			label = canvas.text(pos.x + 23, pos.y + 20, val);
			label.attr({fill: "#ffffff", font: "18px Verdana"});
			
      $(sprite.node).hover(function() {
        //sprite.src(Pixy.skins.node_hover.src);
        $(this).hide();
        hover_sprite.show();
      });
      $(hover_sprite.node).mouseout(function() {
        $(this).hide();
        sprite.show();
      });
      
      $(hover_sprite.node).click(function() {
        Pixy.Kiwi.callback(id, level, val);
      });
    },
    highlight: function() {
      sprite = canvas.image(Pixy.skins.node_root.src, position.x, position.y, width, height);
			label = canvas.text(position.x + 23, position.y + 20, val);
			label.attr({fill: "#ffffff", font: "18px Verdana"});
    }
  }
};

Pixy.Kiwi = function() {
  var root = null;
  var meta = { nr_levels: 0, nr_nodes: 0, nr_edges: 0, root: null };
  var nodes = {};
  var edges = [];
  var levels = {};
  var dim = { w: 48, h: 48 };
  var step = { x: 32, y: 26 };
  var last_pos = { x: 0, y: 0 };
  var node_click_callback = null;
  
  // nodes in every level occupy the same X coordinate
  function find_node_pos(name, level) {
    var id = parseInt(name.replace("node_" + level + "_", ""));
    var pos = { x: 0, y: 0 };
    
    step.x = parseInt((760 - meta.nr_levels * dim.w) / meta.nr_levels);
    step.y = parseInt( (540 - levels[level] * dim.h) / levels[level]);
    
    pos.x = level * ( dim.w + step.x);
    pos.y = id * (dim.h + step.y) + step.y/2;
    if (pos.x == 0) { pos.x = 16 };
    if (pos.y == 0) { pos.y = 16 };
    
    last_pos = pos;
    
    return pos;
  };
  
  return {
    callback: function(id, level, val) { node_click_callback(id, level, val); },
    meta: meta,
    levels: levels,
    root: root,
    setup: function() {
      /*
			canvas =  document.getElementById('canvas');
			
			if (canvas && canvas.getContext) {
				context = canvas.getContext('2d');
				
        canvas.width = 820;
        canvas.height = 540;

    		//context.beginPath();

        console.log("Kiwi has taken to the stage!");
			}
			*/
			canvas = Raphael("canvas", 820, 540);
    },
    set_meta: function(params) {
      
      meta.root = params.root;
      meta.nr_levels = params.levels;
      meta.nr_nodes = params.nr_nodes;
      meta.nr_edges = params.nr_edges;
      
    },
    
    set_levels: function(in_levels) {
      levels = in_levels;
    },
    draw_node: function(id, level, val) {
      nodes[id] = new Pixy.Node();

      nodes[id].create(id, level, val, 
        find_node_pos(id, level));
    },
    
    draw_edge: function(head, tail, weight) {
      edge = new Pixy.Edge();
      edges.push(edge);
      edge.create(nodes[head], nodes[tail], weight);
    },
    
    highlight_root: function(node) {
      root = node;
      console.log("Root is: " + root);
      nodes[root].highlight();
      nodes[root].is_root = true;
    },
    cleanup: function() {
      if (canvas) {
        canvas.clear();
        nodes = {};
        next_pos = { x: step.x, y: 0 };
      }
    },
    
    on_node_click: function(callback) {
      node_click_callback = callback;
    }
  }
}();
