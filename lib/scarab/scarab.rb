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
      @nodes[node.level] ||= []
      @nodes[node.level][node.index] = node
      node.attach(self)
    end
    
    def connect(node1, node2, weight)
      # puts "+ connecting #{node1.name} to #{node2.name}"
      @edges.push Edge.new(@edges.length, node1, node2, weight)
      node1.connection(@edges.last)
      node2.connection(@edges.last)
    end
    
    def connect_neighbors(node)
      edge_w = 1
      neighbors = []
      x = node.level
      y = node.index
      
      if ((y == 0 or y == @levels) && (x == 0 || x == @levels))
        # CASE 1: corner nodes have 3 neighbors
        if (y == 0)
          # top left or right corners
          if (x == 0) # top left corner
            neighbors.push(@nodes[x+1][y]) unless @nodes[x+1][y].nil?
            neighbors.push(@nodes[x+1][y+1]) unless @nodes[x+1][y+1].nil?
            neighbors.push(@nodes[x][y+1]) unless @nodes[x][y+1].nil?
          else # top right corner
            neighbors.push(@nodes[x-1][y]) unless @nodes[x-1][y].nil?
            neighbors.push(@nodes[x-1][y+1]) unless @nodes[x-1][y+1].nil?
            neighbors.push(@nodes[x][y+1]) unless @nodes[x][y+1].nil?
          end
        else # bottom left or right corners
          if (x == 0) # bottom left
            neighbors.push(@nodes[x+1][y]) unless @nodes[x+1][y].nil?
            neighbors.push(@nodes[x+1][y-1]) unless @nodes[x+1][y-1].nil?
            neighbors.push(@nodes[x][y-1]) unless @nodes[x][y-1].nil?            
          else # bottom right
            neighbors.push(@nodes[x-1][y]) unless @nodes[x-1][y].nil?
            neighbors.push(@nodes[x-1][y-1]) unless @nodes[x-1][y-1].nil?
            neighbors.push(@nodes[x][y-1]) unless @nodes[x][y-1].nil?          
          end
        end
      elsif (y == 0 or y == @levels or x == 0 or x == @levels)
        # CASE 2: nodes on top, right, bottom, and left edges have 5 neighbors
        if y == 0 # top edge
          fact = nil
          2.times do
            fact = fact.nil? ? 0 : 1
            for i in -1..1 do
              neighbor = @nodes[x+i][y+fact]
              neighbors.push(neighbor) unless neighbor.nil? or neighbor == node
            end
          end
        elsif y == @levels # bottom edge
          fact = nil
          2.times do
            fact = fact.nil? ? 0 : -1
            for i in -1..1 do
              neighbor = @nodes[x+i][y+fact]
              neighbors.push(neighbor) unless neighbor.nil? or neighbor == node
            end
          end        
        elsif x == 0
          fact = nil
          2.times do
            fact = fact.nil? ? 0 : 1
            for i in -1..1 do
              neighbor = @nodes[x+fact][y+i]
              neighbors.push(neighbor) unless neighbor.nil? or neighbor == node
            end
          end
        elsif x == @levels
          fact = nil
          2.times do
            fact = fact.nil? ? 0 : -1
            for i in -1..1 do
              neighbor = @nodes[x+fact][y+i]
              neighbors.push(neighbor) unless neighbor.nil? or neighbor == node
            end
          end
        end
      else
        # CASE 3: the rest have 8
        fact = nil
        3.times do
          fact = fact.nil? ? -1 : fact == -1 ? 0 : 1
          for i in -1..1 do
            neighbor = @nodes[x+i][y+fact]
            neighbors.push(neighbor) unless neighbor.nil? or neighbor == node
          end
        end        
      end
      
      neighbors.each { |neighbor| connect(node, neighbor, edge_w) unless connected?(node, neighbor) }
      neighbors
    end
    
    def connected?(node1, node2)
      @edges.each do |edge|
        return true if edge.head == node1 && edge.tail == node2
        return true if edge.head == node2 && edge.tail == node1
      end
      false
    end
    
    def nodes_in_level(level)
      #nodes = []
      #@nodes.each { |node| nodes.push node if node.level == level }
      @nodes[level]
    end
    
    # find nodes that are adjacent in level AND index
    # to the node,ie: 
    #   node.level-1 .. node.level+1 &&
    #   node.index-1 .. node.index+1
    def neighbors(node)
      # puts "Checking for neighbors for #{node.level}_#{node.index}"
      neighbors = []
      if node.level != 0
        nodes = @nodes[node.level-1]
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
        nodes = @nodes[node.level+1]
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
      nr_nodes = 0
      @nodes.each { |level| nr_nodes += level.length }
      
      puts "Nr of nodes: #{nr_nodes}"
      json = { 
        :meta => [
          @levels + 1,
          nr_nodes,
          @edges.length
        ],
        :levels => [],
        :nodes => [],
        :edges => []
      }
      
      #@nodes.each { |node| json[:nodes][node.name] = node.to_json }
      #puts @nodes.inspect
      puts @nodes.length
      i = j = 0
      for i in 0..(@nodes.length-1) do
        #puts @nodes[i]
        for j in 0..(@nodes[i].length-1) do
          node = @nodes[i][j]
          json[:nodes][i] ||= []
          json[:nodes][i][node.index] = node.to_json
        end
      end
      
      @edges.each { |edge| json[:edges].push edge.to_json }
      for i in 0..@levels do
        #json[:nodes][i] ||= []
        #nodes = nodes_in_level(i)
        #nodes.each { |node| json[:nodes][i][node.index] = node.to_json }
        
        json[:levels].push( @nodes[i].length )
      end
      
      json
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
      list = neighbors(node)
      return nil if list.empty?

      tmp = list[rand(list.length-1)]
      return tmp
    end
    
  end
  
  class Node
    attr_reader :index, :level, :edges, :val, :graph
    
    def initialize(index, level, val)
      super()
      
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
      @graph.nodes[@level] - [self] || []
    end
    
    def to_json
      @val.to_i
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
      [ [@head.level, @head.index], [@tail.level, @tail.index], @weight ]
    end
    
  end
  
  class Scarab
  
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
    
    def generate_grid(size)
      @grid = Graph.new
      @grid.levels = @levels = size
      
      for i in 0..@levels do
        for j in 0..@levels do
          @grid.add_node(Node.new(j, i, node_val))
        end
      end
      
      @grid.nodes.each { |level| level.each do |node| @grid.connect_neighbors(node) end }

        @grid.to_json
    end
    
    def generate_graph(levels = nil)
      @graph = Graph.new
      @levels = levels unless levels.nil?
      @graph.levels = @levels
          
      # generate nodes in each level
      # log "generating nodes"
      for i in 0..@levels do
        nr_nodes = rand(3) + @min_nodes_per_level
        for j in 0..nr_nodes do
          @graph.add_node(Node.new(j, i, node_val))
        end
      end
      
      # log "there are #{@graph.nodes.length} nodes across #{@levels} levels"
      
      # connect the levels
      # each level must be connected by at least 1 edge with the next one
      # from there on, nodes can have from 0-4 edges
      @graph.nodes.each { |level| level.each do |node|
          for x in 0..rand(2) do
            cand = @graph.find_candidate(node)
            @graph.connect(node, cand, edge_val) unless cand.nil?
          end
        end
      }
      
      @graph.to_json
    end
    
    def node_val
      rand(20) + 1
    end
    
    def edge_val
      rand(9)
    end
    

    
  end
  
end

