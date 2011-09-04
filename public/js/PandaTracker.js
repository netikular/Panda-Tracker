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
  
  //Views
  window.TaskView = Backbone.View.extend({
    template: "#task-template",
    tagName: 'tr',
    className: 'task',

    initialize: function(){
      _.bindAll(this,'render');
      this.template = _.template($(this.template).html());
    },
    render: function(){
      $(this.el).html(this.template(this.model.toJSON()));             
      return this;
    }
  });

  window.TaskListView = Backbone.View.extend({
    template: "#tasklist-template",
    className: 'tasklist',

    initialize: function(){
      _.bindAll(this,'render');
      this.template = _.template($(this.template).html());
    },

    render: function(){
      var $tasks,
          collection = this.collection;
      $(this.el).html(this.template({}));
      $tasks = this.$(".tasks");
      this.collection.each(function(task) {
        var view = new TaskView({ model: task});
        $tasks.append(view.render().el);
      });
      return this;
    }
  });
  
  window.tasklist = new TaskList();
  task = new Task({'abstract':'stuff', 'description':'more stuff'});
  task2 = new Task({'abstract':'stuff2', 'description':'more stuff2'});
  window.tasklist.add(task);
  window.tasklist.add(task2);
})(jQuery);
