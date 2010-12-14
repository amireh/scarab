Pixy.Graph = function() {

  var nodes = {};
  var edges = {};
  var levels = {};
  var self = this;
  
  var step = { x: 0, y: 0 };
  
  // nodes in every level occupy the same X coordinate
  function find_node_pos(name, level) {
  
    dim = Pixy.Meta.Node.Dim;
    nr_levels = Pixy.Meta.Count.Levels;
        
    var id = parseInt(name.replace("node_" + level + "_", ""));
    var pos = { x: 0, y: 0 };
    
    var win_w = 820 - dim.w;
    var win_h = 540 - dim.h;
    
    step.x = parseInt( (win_w - (nr_levels * dim.w)) / nr_levels);
    step.y = parseInt( (win_h - (levels[level] * dim.h)) / levels[level] );
    
    pos.x = level * (dim.w + step.x) + step.x;
    if (nr_levels >= 8)
      pos.x += dim.w/2;
    
    pos.y = id * (dim.h + step.y) + step.y;
    if (levels[level] == 4)
      pos.y += dim.h/3;
    else if (levels[level] > 4)
      pos.y += dim.h/2;
    else {
    }
        
    return pos;
  };
  
  function highlight_root(index) {
       
    nodes[index].highlight_root();
    nodes[index].is_root = true;
    
  };
  
  function draw_node(id, level, val) {
    nodes[id] = new Pixy.Node();

    nodes[id].create(id, level, val, find_node_pos(id, level));
  };
  
  function draw_edge(id, head, tail, weight) {
    edges[id] = new Pixy.Edge();

    edges[id].create(id, nodes[head], nodes[tail], weight);
  };

  return {
    nodes: nodes,
    edges: edges,
    levels: levels,
    root: null,
    last_path: null,
    
    populate: function(in_root, in_nodes, in_edges, in_levels) {
      this.root = in_root;
      levels = in_levels;
      
      $.each(in_nodes, function(id, params) {
        draw_node(id, params.level, params.val);
      });
      
      $.each(in_edges, function(id, params) {
        draw_edge(parseInt(id), params.head, params.tail, params.weight);
      });
      
      $.each(nodes, function(id, node) {
        node.draw();
      });
      
      highlight_root(this.root);
      this.root = nodes[in_root];
      console.log("Root is: " + this.root.index);
      
      $("#meta p").append("<br />heuristic function used: <span>MANHATTAN's</span>");
    },
    
    find_edges: function(node) {
      out = [];
      $.each(edges, function(id, edge) {
        if (edge.head.index == node || edge.tail.index == node) {
          //console.log("Found an edge: " + edge.index + " with a node " + edge.head.index + " as head, and tail: " + edge.tail.index);
          //edge.highlight();
          out.push(edge);
        }
      });
      
      return out;
    },
    
    // returns the edge, if any, that connects
    // node1 and node2
    connection: function(node1, node2) {
      var edge = null;
      for (var i = 0; i < node1.edges.length; ++i) {
        edge = node1.edges[i];
        if (edge.tail.index == node2.index || edge.head.index == node2.index) {
          return edge;
        }
      }

      for (i = 0; i < node2.edges.length; ++i) {
        edge = node2.edges[i];
        if (edge.tail.index == node1.index || edge.head.index == node1.index) {
          return edge;
        }
      }
      
      return null;
    },
    
    highlight_path: function() {
      if (!this.last_path) {
        console.log("ERROR! There's no path to highlight.");
        return;
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
          //edge.highlight_path();

        });
        
        //nodes[nodes.length-1].highlight_goal();
        //nodes[nodes.length-1].sprite.attr({ fill: "green" });
      }
      console.log("Highlighting path");
      _edges[0].highlight_path(_edges, 0);
    
    },
    manhattan: function(pos0, pos1) {
    	// See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

        var d1 = Math.abs (pos1.x - pos0.x);
        var d2 = Math.abs (pos1.y - pos0.y);
        return d1 + d2;
    },
    
    reset: function() {
      $.each(this.nodes, function(id, node) {
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.visited = false;
        node.closed = false;
        node.parent = null;
        node.goal = false;
        node.dehighlight();
      });
      
      $.each(this.edges, function(id, edge) {
        edge.path_highlighted = false;
        edge.dehighlight();
      });
    },
    search: function(start, goal, heuristic) {
    
      this.reset();
      var timer_start = new Date();
      
      start = this.root;
      console.log("Determining path from " + start.index + " to " + goal.index);
      heuristic = this.manhattan;
      
  		var openHeap = new BinaryHeap(function(node){return node.f;});
  		openHeap.push(start);      

      var current = null;
      while (openHeap.size() > 0) {
        // get the node with the lowest F value
        current = openHeap.pop();

        // are we there yet?
        if (current == goal)
          break;
        
        // remove current from open and add it to closed
        // ..
        current.closed = true;
        
        
        // build adjacency list
        // __TODO__
        var neighbors = current.neighbors();
        // loop through adjacent nodes
		    for(var i=0, il = neighbors.length; i < il; i++) {
			    var neighbor = neighbors[i];

			    // not a valid node to process, skip to next neighbor
			    if(neighbor.closed) {
				    continue;
			    }

			    // g score is the shortest distance from start to current node, we need to check if
			    //   the path we have arrived at this neighbor is the shortest one we have seen yet
			    // 1 is the distance from a node to it's neighbor.  This could be variable for weighted paths.
			    var gScore = current.g + this.connection(current, neighbor).weight; // __TODO__
			    var beenVisited = neighbor.visited;

			    if(!beenVisited || gScore < neighbor.g) {

				    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
				    neighbor.visited = true;
				    neighbor.parent = current;
				    neighbor.h = neighbor.h || heuristic(neighbor.pos, goal.pos);
				    neighbor.g = gScore;
				    neighbor.f = neighbor.g + neighbor.h;
				    //console.log( "F: " + neighbor.f + ", G: " + neighbor.g + ", H: " + neighbor.h );

				    if (!beenVisited) {
				    	// Pushing to heap will put it in proper place based on the 'f' value.
				    	openHeap.push(neighbor);
				    }
				    else {
				    	// Already seen the node, but since it has been rescored we need to reorder it in the heap
				    	openHeap.rescoreElement(neighbor);
				    }
				  } // if !visited
		    } // for()
		    
      }
      
      var timer_finish = new Date();
      if ($("#timer")) {
        $("#timer").remove();
      }
      
      console.log("Timers: " + timer_start.getTime() + " , " + timer_finish.getTime());
        
      $("#meta p").append("<label id='timer'><br />search took <span>" 
      + (timer_finish.getTime() - timer_start.getTime()) 
      + "ms</span></label>");
      if (openHeap.size() != 0) {
        // we found a path, trace it
        console.log("path found");
          goal.goal = true;
			    var curr = current;
			    var ret = [];
			    while(curr.parent) {
				    ret.push(curr);
				    curr = curr.parent;
			    }
			    this.last_path = ret.reverse();
			    console.log(this.last_path);
			    return this.last_path;
      } else {
        // we didn't find a path
        console.log("path not found");
        return [];
      }
    }
  };
};
