#!/usr/bin/env ruby

module Pixy

  class Graph
    attr_reader :root, :nodes, :edges
    attr_writer :levels
    
    def initialize
      super()
      
      @nodes = []
      @edges = []
      @root = nil
    end
    
    def add_node(node)
      @root = node if @root.nil?
      @nodes.push(node)
      node.attach(self)
    end
    
    def connect(node1, node2, weight)
      #puts "+ connecting #{node1.name} to #{node2.name}"
      @edges.push Edge.new(node1, node2, weight)
      node1.connection(@edges.last)
      node2.connection(@edges.last)
    end
    
    def connected?(node1, node2)
      @edges.each do |edge|
        return true if edge.head == node1 && edge.tail == node2
        return true if edge.head == node2 && edge.tail == node1
      end
      false
    end
    
    def nodes_in_level(level)
      nodes = []
      @nodes.each { |node| nodes.push node if node.level == level }
      nodes
    end
    
    def to_json
      json = { 
        :meta => {
          :root => @root.name,          
          :levels => @levels,
          :nr_nodes => @nodes.length,
          :nr_edges => @edges.length
        },
        :levels => {},
        :nodes => {},
        :edges => []
      }
      
      @nodes.each { |node| json[:nodes][node.name] = node.to_json }
      @edges.each { |edge| json[:edges].push edge.to_json }
      for i in 0..@levels do
        json[:levels][i] = nodes_in_level(i).count
      end
      
      json
    end
    
  end
  
  class Node
    attr_reader :name, :level, :edges, :val, :graph
    
    def initialize(name, level, val)
      super()
      
      @name = name
      @level = level
      @val = val
      
      @edges = []
      
    end
    
    def attach(graph)
      @graph = graph
    end
    
    def connection(edge)
      @edges << edge
    end
    
    def connected?
      !@edges.empty?
    end
    
    def siblings
      @graph.nodes_in_level(@level) - [self] || []
    end
=begin
    def adjacents
      nodes = []
      @edges.each do |edge|
        nodes.push(edge.head == self ? edge.tail : edge.head)
      end
     
      nodes
    end
=end
    
    def to_json
      { :level => @level, :val => @val }    
    end
    
  end
  
  class Edge
    attr_reader :head, :tail, :weight, :directed
    
    def initialize(head, tail, weight, directed = false)
      super()
      
      @head = head
      @tail = tail
      @weight = weight
      @directed = directed
    end
    
    def to_json
      { :head => @head.name, :tail => @tail.name, :weight => @weight, :directed => @directed }
    end
    
  end
  
  class Kiwi
  
    attr_reader :graph
    
    def initialize
      super
      
      srand()
      
      @graph = nil
      @levels = rand(4) + 6
      @min_nodes_per_level = 2
    end
    
    def log(msg)
      puts "+ #{msg}"
    end
    
    def generate_graph
      @graph = Graph.new
      @graph.levels = @levels
          
      # generate nodes in each level
      log "generating nodes"
      for i in 0..@levels do
        nr_nodes = rand(3) + @min_nodes_per_level
        for j in 0..nr_nodes do
          @graph.add_node(Node.new("node_#{i}_#{j}", i, node_val))
        end
      end
      
      log "there are #{@graph.nodes.length} nodes across #{@levels} levels"
      
      # connect the levels
      # each level must be connected by at least 1 edge with the next one
      # from there on, nodes can have from 0-4 edges
      @graph.nodes.each { |node|
        for i in 0..rand(2) do
          @graph.connect(node, find_candidate(node), edge_val) rescue nil
        end
      }
      
      @graph.to_json
    end
    
    def node_val
      rand(8) + 1
    end
    
    def edge_val
      rand(9)
    end
    
    # attempts to find a candidate node to connect with
    # given node based on their level:
    #   * if the node is not connected yet, find a preferably
    #     unconnected node in the same level or the one beyond it
    #     # if no unconnected nodes exist: connect to a random node
    #       in the same level or the one beyond it
    #   * if the node is connected, find a node from a level to which
    #     it's not yet connected
    #
    def find_candidate(node)
      next_level = node.level == @levels ? node.level-1 : node.level+1
      neighbors = @graph.nodes_in_level(next_level)
      #unless node.connected?
        
        node.siblings.each { |sibling|
          next if sibling.connected?
          return sibling
        }
        
        # look for a neighbor
        neighbors.each { |neighbor|
          next if neighbor.connected?
          return neighbor
        }
        
        # we haven't found any, connect to a random node
        #return @graph.nodes[rand(@graph.nodes.length-1)]
      #end
      
      puts "Node #{node.name} has #{node.siblings.length} siblings, and #{neighbors.length} neighbors"
      nodes = node.siblings + neighbors
      tmp = nodes[rand(nodes.length-1)]
      raise RuntimeError if tmp.nil?
      return tmp
=begin
      # if it's connected, let's connect it to a level it's not connected to yet
      excl_levels = []
      node.adjacents.each do |adj|
        excl_levels.push adj.level unless excl_levels.include? adj.level
      end
      levels = (0..@nr_levels).to_a - excl_levels
      unrelated = []
      levels.each do |level| unrelated.push(@graph.nodes_in_level(level)) end

      puts "found #{unrelated.length} unrelated nodes"
      
      return unrelated[rand(unrelated.length-1)]
=end
    end
    
  end
  
end

#app = Pixy::Kiwi.new
#app.generate_graph
