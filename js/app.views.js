(function($){

/*=================================================================*\
    VIEW : List of channels
\*=================================================================*/
    viewListChannel = Backbone.View.extend({
        events:{
            "click input#createChannel"     : "createChannel",
            "click tr#channel"              : "editChannel"
        },

        editChannel: function(){
            router.navigate("channel/edit/:id", {trigger: true});
        },
        createChannel: function(){
            router.navigate("channel/create", {trigger: true});
        },
        initialize: function(){
            if(status == 'Connected' || status == 'Reattached'){
                getChannels();
            }
            _.bindAll(this,"render");
        },
        render: function(){
            $(this.el).empty();

            if(status == 'Connected' || status == 'Reattached'){
                var template = _.template($("#template-channelListPage").html());
                $(this.el).append(template ({"current": channels.models}));
            }else{
                $(this.el).append(_.template($('#template-channelListPage').html()));
            }

            return this;
        },
        setCollection: function(_collection){
            this.collection = _collection;
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
            router.navigate("", {trigger: true});
        },
        createChannel: function(){
            idRetrived = document.getElementById("chid").value;
            descRetrived = document.getElementById('chdesc').value;
            priorityRetrived = document.getElementById('priority').value; 
            
            longRetrived = document.getElementById('longitude').value;
            latRetrived = document.getElementById('latitude').value;
            zipRetrived = document.getElementById('zip').value;

            hostRetrived = document.getElementById('host').value;
            ownerRetrived = document.getElementById('owner').value;
            participantsRetrived = document.getElementById('participants').value;
            headerRetrived = document.getElementById('headers').value;
            
            priorityConverted = conversePriorityToCode(priorityRetrived);
            locationBuilt = {lng:longRetrived, lat:latRetrived, zip:zipRetrived};

            channel.set({
                chid : idRetrived,
                chdesc : descRetrived,
                priority : priorityConverted,
                location : locationBuilt,
                host : hostRetrived,
                owner : ownerRetrived,
                participants : participantsRetrived.replace(/ */g,"").split(","),
                active : activeRetrived,
                headers : headerRetrived
            });
            console.log(channel);

            if(minimumRaised==true){  
                channels.add(channel);

                createUpdateChannel(channel);
                
                router.navigate("", {trigger: true});
            }else{
                $(".alert").html("You have to fill all required fields");
            }
        },
        initialize: function(){
            _.bindAll(this,"render");
        },
        render: function(){
            $(this.el).empty();
            $(this.el).append(_.template($('#template-channelFormPage').html()));
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
            router.navigate("", {trigger: true});
        },
        editChannel: function(){
            idRetrived = document.getElementById("chid").value;
            descRetrived = document.getElementById('chdesc').value;
            priorityRetrived = document.getElementById('priority').value; 
            
            longRetrived = document.getElementById('longitude').value;
            latRetrived = document.getElementById('latitude').value;
            zipRetrived = document.getElementById('zip').value;

            hostRetrived = document.getElementById('host').value;
            ownerRetrived = document.getElementById('owner').value;
            participantsRetrived = document.getElementById('participants').value;
            headerRetrived = document.getElementById('headers').value;
            
            priorityConverted = conversePriorityToCode(priorityRetrived);
            locationBuilt = {lng:longRetrived, lat:latRetrived, zip:zipRetrived};

            channel.set({
                chid : idRetrived,
                chdesc : descRetrived,
                priority : priorityConverted,
                location : locationBuilt,
                host : hostRetrived,
                owner : ownerRetrived,
                participants : participantsRetrived.replace(" ","").split(","),
                active : activeRetrived,
                headers : headerRetrived
            });

            if(minimumRaised==true){  
                channels.add(channel);

                createUpdateChannel(channel);
                
                router.navigate("", {trigger: true});
            }else{
                $(".alert").html("You have to fill all required fields");
            }
        },
        initialize: function(){
            _.bindAll(this,"render");
        },
        render: function(){
            $(this.el).empty();
            $(this.el).append(_.template($('#template-channelFormPage').html()));
           // $(this.el).append(_.template($('#template-buttonEdit').html()));
            return this;
        }
    });

})(jQuery)