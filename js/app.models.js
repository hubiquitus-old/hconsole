(function($) {
    window.Channel = Backbone.Model.extend({
        defaults : {
            id : "",
            chid : "",
            chdesc : "",
            priority : "",
            location : "",
            host : "",
            owner : "",
            participants : [],
            active : "",
            headers : []
        },
        initialize : function () {
            this.bind("error", function(model, error) {
                console.log(error);
            });
            this.bind("change", function(model, error) {
                minimumRaised = true;
                console.log("MODEL UPDATED!");
            });
        },
        validate: function (attrs) {
            if(attrs.chid == "" || attrs.host == "" 
                || attrs.owner == "" || attrs.participants.length == 0
                || typeof attrs.active !== 'boolean'){
                return "Missing fields !"
            }
        },
        getChid : function() {
            return this.get('chid');
        }

    });


    window.Channels = Backbone.Collection.extend({
        model : Channel,
        initialize : function Channels() {
            this.bind("error", function(model, error) {
                console.log(error);
            });
            this.bind("change", function(model, error) {
                console.log("COLLECTION CHANGED !");
            });
        }
    });

})(jQuery)