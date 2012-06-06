(function($) {
    window.Channel = Backbone.Model.extend({
        defaults : {
            id : "undefined",
            chid : "undefined",
            chdesc : "undefined",
            priority : "undefined",
            location : "undefined",
            host : "undefined",
            owner : "undefined",
            participants : "undefined",
            active : "undefined",
            headers : "undefined"
        },
        initialize : function () {
            this.bind("error", function(model, error) {
                console.log(error);
            });
            this.bind("change", function(model, error) {
                console.log("MODEL UPDATED!");
            });
        },
        validate: function (attrs) {
            if(attrs.chid == "" || attrs.host == "" 
                || attrs.owner == "" || attrs.participants.length == 0
                || typeof attrs.active !== 'boolean'){
                return "Missing fields !"
            }else{
                minimumRaised = true;
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