function Graph() {

  self = this;
  
  this.nodes = [];
  this.edges = [];
  this.levels = [];  
  this.step = { level: -1, x: 0, y: 0 };
  this.root = null;
  this.last_path = null;
  this.heuristic = this.manhattan;

};

Graph.prototype = {

  find_node_pos: function(id, level) {

    var dim = Meta.Node.Dim;
    var nr_levels = Meta.Count.Levels;
    var nr_nodes = this.levels[level];
    
    var pos = { x: 0, y: 0 };
    
    var win_w = 820 - dim.w;
    var win_h = 540 - dim.h;
    
    if (this.step.level != level) {
      this.step.x = parseInt( (win_w - (nr_levels * dim.w)) / nr_levels);
      this.step.y = parseInt( (win_h - (nr_nodes * dim.h)) / nr_nodes );
    }
    
    pos.x = level * (dim.w + this.step.x) + this.step.x;
    if (nr_levels >= 8)
      pos.x += dim.w/2;
    
    pos.y = id * (dim.h + this.step.y) + this.step.y;
    if (nr_nodes == 4)
      pos.y += dim.h/3;
    else if (nr_nodes > 4)
      pos.y += dim.h/2;
    else {
    }
        
    return pos;
  },

  create_node: function(level, id, val) {
    if (!this.nodes[level])
      this.nodes[level] = [];
    
    this.nodes[level][id] = new Node();

    this.nodes[level][id].create(id, level, val, this.find_node_pos(id, level));
  },

  create_and_draw_edge: function(id, head, tail, weight) {
    this.edges[id] = new Edge();

    this.edges[id].create(id, this.nodes[head[0]][head[1]], this.nodes[tail[0]][tail[1]], weight);
  },


  populate: function(in_root, in_nodes, in_edges, in_levels) {
    this.root = in_root;
    this.levels = in_levels;
    
    var self = this;
    $.each(in_nodes, function(level_id, nodes) {
      $.each(nodes, function(id, val) {
        self.create_node(parseInt(level_id), parseInt(id), parseInt(val));
      });
    });
    
    $.each(in_edges, function(id, params) {
      self.create_and_draw_edge(parseInt(id), params[0], params[1], parseInt(params[2]));
    });
    
    $.each(this.nodes, function(level, nodes) {
      $.each(nodes, function(id, node) {
        node.draw();
      });
    });
    
    this.root = this.nodes[0][0];
    this.root.is_root = true;
    this.root.highlight_root();
    
    $("#meta p").append("<br />heuristic function used: <span id='heuristic-used'></span>");
    $("#meta p").append("<br /><label id='timer'></label>");
    
    this.set_heuristic("manhattan");
  },

  find_edges: function(node) {
    out = [];
    $.each(this.edges, function(id, edge) {
      if (edge.head == node || edge.tail == node)
        out.push(edge);
    });
    
    return out;
  },

  // returns the edge, if any, that connects node1 and node2
  connection: function(node1, node2) {
    var edge = null;
    for (var i = 0; i < node1.edges.length; ++i) {
      edge = node1.edges[i];
      if (edge.tail == node2 || edge.head == node2) {
        return edge;
      }
    }

    for (i = 0; i < node2.edges.length; ++i) {
      edge = node2.edges[i];
      if (edge.tail == node1 || edge.head == node1) {
        return edge;
      }
    }
    
    return null;
  },

  highlight_path: function() {
    if (!this.last_path) {
      console.log("ERROR! There's no path to highlight.");
      return false;
    }
    
    $("#replay-path").removeClass("disabled");
    
    path = this.last_path;
    self = this;
    var _edges = [];
    if (path.length != 0) {
      $.each(path, function(id, node) {
        // find the edge that connects this node with its parent
        //var edge = self.connection(node, node.parent);
        _edges.push(self.connection(node, node.parent));
      });
      
    }
    //console.log("Highlighting path");
    _edges[0].highlight_path(_edges, 0);

  },

  set_heuristic: function(h) {

    var name;
    if (h == "manhattan") {
      this.heuristic = this.manhattan;
      name = "MANHATTAN'S";
    }
    
    if (h == "euclidean") {
      this.heuristic = this.euclidean;
      name = "EUCLIDEAN";
    }
      
    $("#heuristic-used").html(name);
  },

  manhattan: function(start, end) {
	  // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
    var d1 = Math.abs (end.x - start.x);
    var d2 = Math.abs (end.y - start.y);
    return d1 + d2;
  },

  euclidean: function(start, end) {

    var d1 = Math.pow(start.x - end.x, 2);
    var d2 = Math.pow(start.y - end.y, 2);
    
    return parseInt(Math.sqrt((d1 + d2)));
  },

  reset: function() {
    $.each(this.nodes, function(level, nodes) {
      $.each(nodes, function(id, node) {
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.visited = false;
        node.closed = false;
        node.parent = null;
        node.goal = false;
        node.to_be_highlighted = false;
        node.dehighlight();
      });
    });
    
    $.each(this.edges, function(id, edge) {
      edge.path_highlighted = false;
      edge.dehighlight();
    });
  },

  search: function(start, goal) {

    this.reset();
    var timer_start = new Date();
    
    start = this.root;

    
	  var open = new BinaryHeap(function(node){return node.f;});
	  open.push(start);      

    var current = null;
    while (open.size() > 0) {
      // get the node with the lowest F value
      current = open.pop();

      // are we there yet?
      if (current == goal)
        break;
      
      // flag the node as closed
      current.closed = true;
      
      // find the node's neighbors to visit
      var neighbors = current.neighbors();
      
      for (var i = 0, il = neighbors.length; i < il; i++) {
	      var neighbor = neighbors[i];

	      // node's already been closed, skip it
	      if(neighbor.closed) {
		      continue;
	      }

	      var g_score = current.val + current.g + this.connection(current, neighbor).weight;
	      var been_visited = neighbor.visited;

	      if(!been_visited || g_score < neighbor.g) {

		      // found an optimal (so far) path to this node.. take score for node to see how good it is
		      neighbor.visited = true;
		      neighbor.parent = current;
		      neighbor.h = neighbor.h || this.heuristic(neighbor.pos, goal.pos);
		      neighbor.g = g_score;
		      neighbor.f = neighbor.g + neighbor.h;

          //console.log( "F: " + neighbor.f + ", G: " + neighbor.g + ", H: " + neighbor.h );

		      if (!been_visited)
		      	open.push(neighbor);
		      else {
		      	// already seen the node, but since it has been rescored we need to reorder it in the heap
		      	open.rescoreElement(neighbor);
		      }
		    } // if !visited
      } // for() neighbors
    } // while(!open.empty)
    
    // display time taken for the search
    var timer_finish = new Date();
    var time_elapsed = timer_finish.getTime() - timer_start.getTime();
    $("#timer").html("search took <span>" + time_elapsed + "ms</span>");
    
    if (open.size() != 0) {
      // we found a path, trace it
      //console.log("path found");
      goal.to_be_highlighted = true;
      var curr = current;
      var ret = [];
      while(curr.parent) {
	      ret.push(curr);
	      curr = curr.parent;
      }
      this.last_path = ret.reverse();
      this.highlight_path();

      return true;
    } else {
      // we didn't find a path
      //console.log("path not found");
      return false;
    }
  } // Graph.search()

};
