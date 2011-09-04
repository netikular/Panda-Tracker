(function($) {
  //Models
  window.Task = Backbone.Model.extend({
    
    isClosed: function() {
      return this.get('closed');
    },
    
    isSelected: function() {
      return this.get('selected');
    },
    
    close: function() {
      return this.set({'closed': true});
    },
    
    select: function(){
      this.set({'selected':true});
    },
    
    unselect: function(){
      this.set({'selected':false});
    },
    
  });
  
  //Collections
  window.TaskList = Backbone.Collection.extend({
    model: Task,
    url: "/tasks",
    
    selectAll: function() {
      this.each(function(model){model.select()});
    },
    
    unselectAll: function(){
      this.each(function(model){model.unselect()});
    }
  });
  
  
  window.tasklist = new TaskList();
  //Views
  task
  
  
})(jQuery);