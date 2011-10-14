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
  task3 = new Task({'abstract':'stuff3', 'description':'more stuff3','selected':false});
  window.tasklist.add(task);
  window.tasklist.add(task2);
  window.tasklist.add(task3);
  //
  //Views
  //
  window.TaskListView = Backbone.View.extend({
    tagName: "tbody",
    className:"results-list",

    initialize: function(){
      _.bindAll(this,'render');
    },
    
    render: function(){
      this.collection.each(function(task){
        var view = new TaskView({model:task});
        $(this.el).append(view.render().el);
      },this);

      $(this.el).sortable({
        helper:this.fixHelper,
        start:this.start,
        stop:this.stop,
        placeholder: "ui-state-highlight"
      }).disableSelection();

      return this;
    },

    //Helper functions to make sure everything looks good while the sort is working
    fixHelper: function(e,ui) {
      ui.children().each(function() {
        $(this).width($(this).width());
      });
      return ui;
    },

    start: function(e,ui){
      $(ui.placeholder).height($(ui.item).height()).append("");
      $(ui.item).addClass("ui-state-highlight");
      $(ui.item).children().each(function(index,child) {
        $(child).addClass("no-border");
      });
    },

    stop: function(e,ui){
      $(ui.item).removeClass("ui-state-highlight");
      $(ui.item).children().each(function(index,child) {
        $(child).removeClass("no-border");
      });
    }
    //end of the helpers
  });

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

  window.SelectButton = Backbone.View.extend({
      template: "#select-button-template",
      className: "",
      tagName: "span",

      events: {
        "click .select-all": "showDropdown",
        "click input": "selectAll",
        "click .dropdown li": "doAction"
      },

      showRemoveme: function(){
        $(".removeme").remove();
        $("body").append('<div class="removeme">&nbsp;</div>');
        var self = this;
        $(".removeme").one("click",function(){
          self.hideDropdown();
        });
      },

      selectAll: function(e){
        console.log("select all");
        e.stopPropagation()
      },

      doAction : function(){
        this.hideDropdown();
        console.log("do-work2");
      },
      
      showDropdown: function(){
        $(this.el).find(".dropdown").show();
        this.showRemoveme();
      },

      hideDropdown: function(){
        $(this.el).find(".dropdown").hide();
        $(".removeme").remove();
      },

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
        });

        return this;
      }
  });

  window.ToolBar = Backbone.View.extend({
    template: "#toolbar-template",
    className: "ui-widget-header ui-corner-all toolbar",

    events: {
      "click .close": "close",
      "click .remove": "remove",
      "click .send": "send",
      "click .settings": "settings"
    },

    send: function(){
      console.log("send");
    },

    remove: function(){
      console.log("remove");
    },

    close: function(){
      console.log("close");
    },

    settings: function(){
      console.log("settings");
    },

    initialize: function(){
      _.bindAll(this,'render');
      this.template = _.template($(this.template).html());
      $(this.el).addClass(this.className);
    },
    
    render: function(){
      $(this.el).html(this.template());   

      var sc = new SelectButton();
      $(this.el).find(".select-container").html(sc.render().el);

      this.$(".send").button();
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
