(function($) {
    window.Channel = Backbone.Model.extend({
        defaults : {
            id : undefined,
            chid : undefined,
            host : undefined,
            owner : undefined,
            participants : [],
            active : undefined
        },
        initialize : function () {
            this.bind("error", function(model, error) {
                console.log(error);
            });
            this.bind("change", function(model, error) {
                minimumRaised = true;
                //console.log("MODEL UPDATED!");
            });
        },
        validate: function (attrs) {
            if(attrs.chid == undefined || attrs.host == undefined 
                || attrs.owner == undefined || attrs.participants.length == 0
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