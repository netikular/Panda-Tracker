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
    
    toggleSelected: function(){
      this.set({'selected':!this.get('selected')})
    }
    
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
  task = new Task({'abstract':'stuff', 'description':'more stuff','selected':true});
  task2 = new Task({'abstract':'stuff2', 'description':'more stuff2','selected':false});
  window.tasklist.add(task);
  window.tasklist.add(task2);
  
  //Views
  window.TaskView = Backbone.View.extend({
    template: "#task-template",
    tagName: 'tr',
    
    events:{
    },

    initialize: function(){
      _.bindAll(this,'render','select');
      this.template = _.template($(this.template).html());
      this.model.bind('change:selected',this.select);
    },
    
    render: function(){
      $(this.el).html(this.template(this.model.toJSON()));   
      return this;
    }
  });

  window.ToolBar = Backbone.View.extend({
      template: "#toolbar-template",
      className: "ui-widget-header ui-corner-all toolbar",

    initialize: function(){
      _.bindAll(this,'render');
      this.template = _.template($(this.template).html());
    },
    
    render: function(){
      $(this.el).html(this.template());   

      this.$('.select-all').button({
          text:true,
          icons : {
            secondary: 'ui-icon-triangle-1-s'
            }
        })
        .find("input")
        .click(function(e){e.stopPropagation()});

      this.$('.select-container').find(".dropdown li").click(function(){console.log("do-work2");});

      this.$(".send").button()
        .next()
          .button( {
              text: false,
              icons: {
                  primary: "ui-icon-triangle-1-s"
              }
              })      .parent().find(".dropdown li").click(function(){console.log("do-work");});


      this.$(".tag-commands").buttonset();

      this.$(".actions-select, .select-all,.tag-select").click(function(){
        var $parent = $(this).parent();
        $parent.find(".dropdown").toggle();
        $("body").append('<div class="removeme">&nbsp;</div>');
        $(".removeme").click(function(){
          $parent.find('.dropdown').hide();
          $(this).remove();
        });
      }).parent().find(".dropdown li").click(function(){$(this).parent().toggle();$(".removeme").remove();});

      this.$(".close").button();
      this.$(".remove").button();
      this.$(".common-commands").buttonset();

      this.$(".settings")
        .button({
          text:false,
          icons : {
            primary: "ui-icon-gear"
          }
        });
      return this;
    }
      
      
  });
  
})(jQuery);
