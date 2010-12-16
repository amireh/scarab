function GridEdge() {

  this.self = this;

  this.head = null;
  this.tail = null;
  this.weight = 0;
  this.index = null;  
  
};

GridEdge.prototype = {

  create: function(in_id, in_head, in_tail, in_weight) {
    this.index = in_id;
    this.head = in_head;
    this.tail = in_tail;
    this.weight = in_weight; 
  }

};

