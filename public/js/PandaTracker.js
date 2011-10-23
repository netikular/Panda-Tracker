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
                "open":false,
                "description": "A New Task",
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
                "cap_numbers": "",
                "agenda_numbers": ""
    },
    
    isSelected: function() {
      return this.get('selected');
    },
    
    select: function(){
      this.set({'selected':true});
    },
    
    unselect: function(){
      this.set({'selected':false});
    },
    
    toggleSelected: function(){
      this.set({'selected':!this.get('selected')})
    },

    isOpen: function(){
      return this.get("open");
    },

    toggleOpen: function(){
      this.set({'open':!this.get('open')})
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
    tagName: "ul",
    className:"results",

    initialize: function(){
      _.bindAll(this,'render');
      window.tasklist.bind("add",this.render,this);
      window.tasklist.bind("remove",this.render,this);
    },
    
    render: function(){
      $(this.el).empty();
      
      this.collection.each(function(task){
        var view = new TaskItemView({model:task,collection:window.tasklist});
        $(this.el).append(view.render().el);
      },this);

      $(this.el).sortable({
        start:this.start,
        stop:this.stop,
        placeholder: "placeholder"
      }).disableSelection();

      //need to test for any open items so that the sortable can be disabled.
      $(this.el).sortable("enable");

      return this;
    },

    start: function(e,ui){
      $(ui.item).addClass("ui-state-highlight");
    },

    stop: function(e,ui){
      $(ui.item).removeClass("ui-state-highlight");
    }
    //end of the helpers
  });

  //A container view.
  window.TaskItemView = Backbone.View.extend({
    tagName: "li",


    initialize: function(){
    },

    render: function(){
      var view = new TaskView({model:this.model,collection:this.collection});
      $(this.el).append(view.render().el);

      var class_name = (this.model.isOpen())?"":"hidden";
      var form = new TaskFormView({
        model:this.model,
        collection:this.collection,
        className: class_name
      });

      if (this.model.isOpen())
      {
        $(this.el).addClass("border");
        $(this.el).addClass("ui-corner-all");
      }

      $(this.el).append(form.render().el);
      return this;
    },

  });

  window.TaskView = Backbone.View.extend({
    template: "#task-template",
    className: "task-row",

    //events should be in order of narrowest to widest
    events:{
      "click input[type=checkbox]": "select",
      "click": "edit"
    },

    edit: function(e) {
      var $parent = $(this.el).parent();
      $(this.el).next().slideToggle(300);
      if (!this.model.isOpen())
      {
        $parent.addClass("border");
        $parent.addClass("ui-corner-all");
        $(".results").sortable("disable");
      } else {
        $parent.removeClass("border",400);
        $parent.removeClass("ui-corner-all",400);
        $(".results").sortable("enable");
      }
      this.model.toggleOpen();
    },

    select: function(e) {
      this.model.toggleSelected();
      e.stopImmediatePropagation();
    },

    setViewState: function(){
      $(this.el).removeClass("selected");
      $(this.el).find("input").removeAttr("checked");
      if (this.model.isSelected())
      {
        $(this.el).addClass("selected");
        $(this.el).find("input").attr("checked","true");
      }

    },

    initialize: function(){
      _.bindAll(this,'render','setViewState','edit');
      this.template = _.template($(this.template).html());
      this.model.bind('change:abstract',this.render);
      this.model.bind('change:description',this.render);
      this.model.bind('change:selected',this.render);
      this.collection = this.options['collection'];
    },
    
    render: function(){
      $(this.el).html(this.template(this.model.toJSON()));
      this.setViewState();
      return this;
    }
  });

  window.TaskFormView = Backbone.View.extend({
    template: "#task-form-template",
    className: "",

    events: {
      "change form input": "submit",
      "change form textarea": "submit",
      "change form select": "submit"
    },

    submit: function(e) {
      e.preventDefault();

      this.model.set($(this.el).find("form").serializeObject());

      if (!this.collection.include(this.model))
        this.collection.add(this.model);

    },

    initialize: function() {
      _.bindAll(this,'render');
      this.template = _.template($(this.template).html()); 
      this.collection = this.options["collection"];
    },

    render: function() {
      $(this.el).empty();
      $(this.el).html(this.template(this.model.toJSON()));
		  $(this.el).find("#tabs").tabs();

      return this;
    },

    show: function(model) {
      //is this the best way? -- satisfies the need to clear the form each time.
      this.model = model;
      this.render(); 
      $(this.el).parent().show();
    },

    close: function() {
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
      this.collection.add(new Task());
    },

    send: function(){
      console.log("send");
    },

    remove: function(){
      var list = this.collection.filter(function(model) {
        return model.isSelected();
      });

      this.collection.remove(list);
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
      this.collection = this.options["collection"];
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
