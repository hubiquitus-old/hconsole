(function($){

/*=================================================================*\
    VIEW : Connection page 
\*=================================================================*/
    viewConnection = Backbone.View.extend({
        events:{
            "click #connection"         :"connection"
        },

        initialize: function(){
            console.log("Connection");
            this.template = _.template($("#template-connection").html());
            _.bindAll(this,"render");
        },
        render: function(){
            $(this.el).empty();
            $(this.el).append(this.template);
            return this;
        },
        connection: function(){
            homeView.render();
            $("#userConnected").append("Welcome "+hClient.publisher);
            $("#userConnected").append("<input type='button' id='disconnect' value='Disconnect' onClick='disconnect()'/>");
            console.log("You are logged !");
            return this;  
        }
    });
/*=================================================================*\
    VIEW : Home 
\*=================================================================*/
    viewHomeConsole = Backbone.View.extend({
        events:{
            "click #homeTab"            : "homePage",
            "click #channelTab "        : "channelPage"
        },

        initialize: function(){
            this.template = _.template($("#template-hConsole").html());
            _.bindAll(this,"render");
        },
        render: function(){
            $(this.el).empty();
            $(this.el).append(this.template);
            return this;
        },
        homePage: function(){
            router.navigate("home", {trigger: true});
            console.log("home page");
            return this;  
        },
        channelPage: function(){
            requestInProgress("getChannels");
            getChannels();
            router.navigate("channel/list", {trigger: true});
            console.log("channel page");
            return this;
        }
    });
/*=================================================================*\
    VIEW : List of channels
\*=================================================================*/
    viewListChannel = Backbone.View.extend({
        events:{
            "click input#createChannel"     : "createChannel",
            "click tr#channel_row "         : "editChannel"
        },

        editChannel: function(e){
            idRow = e.currentTarget.cells[0].textContent;
            router.navigate("channel/edit/:id", {trigger: true});
            return this;
        },
        createChannel: function(){
            router.navigate("channel/create", {trigger: true});
            return this;
        },
        initialize: function(){
            this.template = _.template($("#template-channelListPage").html());
            this.collection = channels;
            _.bindAll(this,"render");

            console.log("List initialized");
        },
        render: function(){
            this.setElement($("#tabContent"));
            $(this.el).empty();
            $(this.el).append(this.template ({"current": this.collection.models}));
            // console.log("Render called!");
            return this;
        },
        setCollection: function(_collection){
            this.collection = _collection;
            console.log("Collection set !");
            this.render();
        }
    });

/*=================================================================*\
    VIEW : Edit channel
\*=================================================================*/
    viewCreateChannel = Backbone.View.extend({
        events:{
            "click input#create"        : "createChannel",
            "click input#cancel"        : "cancel"
        },

        cancel: function(){
            router.navigate("channel/list", {trigger: true});
            return this;
        },
        createChannel: function(){
            retrieveForm();

            var channelToCreate = new Channel();
            channelToCreate.set({
                id : idRetrived,
                chid : idRetrived,
                chdesc : descRetrived,
                priority : priorityConverted,
                location : locationBuilt,
                host : hostRetrived,
                owner : ownerRetrived,
                participants : participantBuilt,
                active : activeRetrived,
                headers : headerBuilt
            });

            if(minimumRaised==true){  
                channels.add(channelToCreate);

                requestInProgress("createUpdateChannel");
                createUpdateChannel(channelToCreate);
                
                $(document).bind('createUpdate', function () {
                    router.navigate("channel/list", {trigger: true});
                });
                minimumRaised = false;
                return this;
            }else{
                 $(".alert").html("You have to fill all required fields");
            }
        },
        initialize: function(){
            this.template = _.template($('#template-channelFormPage').html());
            _.bindAll(this,"render");
        },
        render: function(){
            this.setElement($("#tabContent"));
            $(this.el).empty();
            $(this.el).append(this.template);
            return this;
        }
    });

/*=================================================================*\
    VIEW : Create channel
\*=================================================================*/
    viewEditChannel = Backbone.View.extend({
        events:{
            "click input#modify"        : "editChannel",
            "click input#cancel"        : "cancel"
        },

        cancel: function(){
            router.navigate("channel/list", {trigger: true});
            return this;
        },
        editChannel: function(){
            retrieveForm();

            var channRecup = new Channel();
            channRecup.set({
                id: idRetrived,
                chid : idRetrived,
                chdesc : descRetrived,
                priority : priorityConverted,
                location : locationBuilt,
                host : hostRetrived,
                owner : ownerRetrived,
                participants : participantBuilt,
                active : activeRetrived,
                headers : headerBuilt
            });
            console.log("ChannRecupéré du formulaire avant édition finale :");
            console.log(channRecup);

            if(minimumRaised == true){ 
                editCollection(channRecup.attributes);
                
                requestInProgress("createUpdateChannel");
                createUpdateChannel(channRecup);
                $(document).bind('createUpdate', function () {
                    router.navigate("channel/list", {trigger: true});
                });
                minimumRaised = false;
                return this;
            }else{
                $(".alert").html("You have to fill all required fields");
            }
        },
        initialize: function(){
            this.template = _.template($('#template-channelFormPage').html());
            _.bindAll(this,"render");
        },
        render: function(){
            this.setElement($("#tabContent"));
            $(this.el).empty();
            $(this.el).append(this.template);
            return this;
        }
    });

})(jQuery)