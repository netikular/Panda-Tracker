/*!
 * jQuery serializeObject - v0.2 - 1/20/2010
 * http://benalman.com/projects/jquery-misc-plugins/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Whereas .serializeArray() serializes a form into an array, .serializeObject()
// serializes a form into an (arguably more useful) object.

(function($,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  $.fn.serializeObject = function(){
    var obj = {};
    
    $.each( this.serializeArray(), function(i,o){
      var n = o.name,
        v = o.value;
        
        obj[n] = obj[n] === undefined ? v
          : $.isArray( obj[n] ) ? obj[n].concat( v )
          : [ obj[n], v ];
    });
    
    return obj;
  };
  
})(jQuery);

(function($) {
  //Models
  window.Task = Backbone.Model.extend({
    //I don't like that i have to set the defaults.
    // Maybe this will go away once the object is initialized
    // from the server
    defaults: {
                "selected": false,
                "description": "",
                "status": "",
                "action_date": "",
                "priority": "",
                "due_date": "",
                "initials_needed": "",
                "aide": "",
                "assigned": "",
                "confidential": "",
                "abstract": "",
                "wizard_numbers": "",
                "cap_numbers": ""
    },
    
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
      window.tasklist.bind("add",this.render,this);
      this.taskform = this.options["taskform"];
    },
    
    render: function(){
      $(this.el).empty();
      this.collection.each(function(task){
        var view = new TaskView({model:task,taskform:this.taskform});
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
    
    //events should be in order of narrowest to widest
    events:{
      "click input": "select",
      "click": "edit",
    },

    edit: function(e) {
      this.taskform.show(this.model);
    },

    select: function(e) {
      this.model.toggleSelected();
      e.stopImmediatePropagation();
    },

    highlight: function(){
      $(this.el).removeClass("selected");
      $(this.el).find("input").removeAttr("checked");
      if (this.model.isSelected())
      {
        $(this.el).addClass("selected");
        $(this.el).find("input").attr("checked","true");
      }
    },

    initialize: function(){
      _.bindAll(this,'render','highlight','edit');
      this.template = _.template($(this.template).html());
      this.model.bind('change',this.render);
      this.taskform = this.options["taskform"];
    },
    
    render: function(){
      $(this.el).html(this.template(this.model.toJSON()));
      this.highlight();
      return this;
    }
  });

  window.TaskFormView = Backbone.View.extend({
    template: "#task-form-template",
    el: "#task-form",

    events: {
      "submit form": "submit"
    },

    submit: function(e) {

      this.model.set($(this.el).find("form").serializeObject());

      if (!this.collection.include(this.model))
        this.collection.add(this.model);

      $(this.el).dialog("close");
      e.preventDefault();
    },

    initialize: function() {
      _.bindAll(this,'render');
      this.template = _.template($(this.template).html()); 
      this.collection = this.options["collection"];
    },

    render: function() {
      $(this.el).empty();
      $(this.el).html(this.template(this.model.toJSON()));
      $(this.el).dialog({
        autoOpen: false,
        height: 500,
        width: 825,
        modal: true,
        close: this.close
      });
      return this;
    },

    show: function(model) {
      //is this the best way? -- satisfies the need to clear the form each time.
      this.model = model;
      this.render(); 
      $(this.el).dialog("open");
    },

    close: function() {
      console.log("close");
      $(this.el).empty();
      //handle some stuff here cause closing is awesome
    },
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
      "click .settings": "settings",
      "click .new": "new"
    },

    new: function() {
      this.taskform.show(new Task());
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
      this.taskform = this.options["taskform"];
    },
    
    render: function(){
      $(this.el).html(this.template());   

      var sc = new SelectButton();
      $(this.el).find(".select-container").html(sc.render().el);

      this.$(".send").button();
      this.$(".new").button();

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
