$(function(){
  // Image Model
  // ----------
  window.Image = Backbone.Model.extend({
    defaults: function() {
      return {
        selected:  true,
      };
    },
    toggle: function() {
      this.save({selected: !this.get("selected")});
    }
  });
  // Image Collection
  // ---------------
  window.ImageCollection = Backbone.Collection.extend({
    model: Image,
    localStorage: new Store("images"),
    selected: function() {
      return this.filter(function(image){ return image.get('selected'); });
    },
    remaining: function() {
      return this.without.apply(this, this.selected());
    },
  });
  window.Images = new ImageCollection;
  // Image Item View
  // --------------
  window.ImageView = Backbone.View.extend({
    tagName:  "li",
    template: _.template(
      " <a class='selected <%= selected ? '' : 'deselected' %>'> \
                         <img class=\"thumbnail\" height=\"40\" width=\"40\"></img> \
      </a>"
    ),
    events: {
      "click img"   : "toggleDone",
    },
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.setImage();
      return this;
    },
    setImage: function(){
      var image = this.model.get('path');
      this.$('img').attr("src","/img?img=" + image);
    },
    toggleDone: function() {
      this.model.toggle();
    },
    remove: function() {
      $(this.el).remove();
    },
    clear: function() {
      this.model.destroy();
    }
  });

  // The Application
  // ---------------
  window.AppView = Backbone.View.extend({
    el : $('#imgapp'),
    statsTemplate : _.template(
     "<% if (total) { %> \
        <span class=\"image-count\"> \
          <span class=\"number\"><%= selected %></span> \
          <span class=\"word\"><%= selected == 1 ? 'item' : 'items' %></span> selected. \
        </span> \
      <% } %> \
      <% if (remaining) { %> \
        <span class=\"image-clear\"> \
          <a href=\"#\"> \
            Clear <span class=\"number-deselected\"><%= remaining %></span> \
            deselected <span class=\"word-remaining\"><%= remaining == 1 ? 'item' : 'items' %></span> \
          </a> \
        </span> \
      <% } %>"
    ),
    events : {
      "click #loadImages" : "createImages",
      "click .image-clear a": "clearDeselected",
    },
    initialize: function(){
      this.input    = document.getElementById("imageInput");

      Images.bind('add',   this.loadOne, this);
      Images.bind('reset', this.loadAll, this);
      Images.bind('all',   this.render, this);

      Images.fetch();
    },
    render: function() {
      this.$('#image-stats').html(this.statsTemplate({
        total:      Images.length,
        selected:       Images.selected().length,
        remaining:  Images.remaining().length
      }));

      console.log("render");
    },
    loadOne :function(image) {
      var view = new ImageView({model:image});
      this.$('#image-list').append(view.render().el);
    },
    loadAll :function() {
      Images.each(this.loadOne)
      console.log("loadAll")
    },
    createImages : function() {
      $.ajax({
        url : "list",
        data: 'dir=' + $("#imageInput").val(),
        success: function(data){
          if(data.error) {
            console.log(data.error);
          }
          if(data.files) {
            _.each(data.files,function(file){
              Images.create({path: file.path})
            });
          }
        }
      });
      console.log("loadIamge")
    },
    clearDeselected : function() {
      _.each(Images.remaining(), function(image){ image.destroy(); });
      return false;
    }
  });
  // Finally, we kick things off by creating the **App**.
  window.App = new AppView;
});
