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
      # puts "+ connecting #{node1.name} to #{node2.name}"
      @edges.push Edge.new(@edges.length, node1, node2, weight)
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
    
    # find nodes that are adjacent in level AND index
    # to the node,ie: 
    #   node.level-1 .. node.level+1 &&
    #   node.index-1 .. node.index+1
    def neighbors(node)
      # puts "Checking for neighbors for #{node.level}_#{node.index}"
      neighbors = []
      if node.level != 0
        nodes = nodes_in_level(node.level-1)
        # puts "There are #{nodes.length} nodes in previous level"
        range = nil
        if node.index == 0 
          range = node.index..node.index+2
        elsif node.index == @levels
          range = node.index-2..node.index
        else
          range = node.index-1..node.index+1
        end
        
        nodes = nodes[range]
        # puts "found #{nodes.length} in level #{node.level-1}"        
        neighbors += nodes unless nodes.empty?
      end
      if node.level != @levels
        nodes = nodes_in_level(node.level+1)
        # puts "There are #{nodes.length} nodes in next level"        
        range = nil
        if node.index == 0
          range = node.index..node.index+2
        elsif node.index == @levels
          range = node.index-2..node.index
        else
          range = node.index-1..node.index+1
        end
        nodes = nodes[range]
        # puts "found #{nodes.length} in level #{node.level+1}"
        neighbors += nodes unless nodes.empty?
      end
      
      neighbors.delete(node)
      neighbors.delete_if { |neighbor| connected?(node, neighbor) }
      neighbors.uniq!

      # puts "found #{neighbors.length} suitable neighbors"
              
      neighbors
    end
    
    def to_json
      json = { 
        :meta => {
          :root => @root.name,          
          :levels => @levels + 1,
          :nr_nodes => @nodes.length,
          :nr_edges => @edges.length
        },
        :levels => {},
        :nodes => {},
        :edges => {}
      }
      
      @nodes.each { |node| json[:nodes][node.name] = node.to_json }
      @edges.each { |edge| json[:edges][edge.index] = edge.to_json }
      for i in 0..@levels do
        json[:levels][i] = nodes_in_level(i).count
      end
      
      json
    end
    
  end
  
  class Node
    attr_reader :name, :index, :level, :edges, :val, :graph
    
    def initialize(name, index, level, val)
      super()
      
      @name = name
      @level = level
      @val = val
      @index = index
      
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
    
    def to_json
      { :level => @level, :val => @val }
    end
    
  end
  
  class Edge
    attr_reader :index, :head, :tail, :weight, :directed
    
    def initialize(index, head, tail, weight, directed = false)
      super()
      
      @index = index
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
      # puts "+ #{msg}"
    end
    
    def generate_graph
      @graph = Graph.new
      @graph.levels = @levels
          
      # generate nodes in each level
      # log "generating nodes"
      for i in 0..@levels do
        nr_nodes = rand(3) + @min_nodes_per_level
        for j in 0..nr_nodes do
          @graph.add_node(Node.new("node_#{i}_#{j}", j, i, node_val))
        end
      end
      
      # log "there are #{@graph.nodes.length} nodes across #{@levels} levels"
      
      # connect the levels
      # each level must be connected by at least 1 edge with the next one
      # from there on, nodes can have from 0-4 edges
      @graph.nodes.each { |node|
        for i in 0..rand(2) do
          cand = find_candidate(node)
          @graph.connect(node, cand, edge_val) unless cand.nil?
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
      neighbors = @graph.neighbors(node)
      return nil if neighbors.empty?

      tmp = neighbors[rand(neighbors.length-1)]
      # puts "Found a node #{tmp.name} out of #{neighbors.length} neighbors for node #{node.name}"
      return tmp
    end
    
  end
  
end

