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
            disconnect();
            
            // fill options connection
            hOptions.serverHost = $("#serverHost").val();
            hOptions.serverPort = $("#serverPort").val();
            hOptions.endpoints[0] = $("#endpoints").val();

            currentUser = $("#user").val();
            userPassword = $("#password").val();

            if(hOptions.endpoints[0] == ""){
                $(".alert").html("You have to fill the endpoint field, to be connected");
            }else{
                connection(currentUser,userPassword);

                $(document).bind('connected', function () {
                    router.navigate("home", {trigger: true});
                    $("#userConnected").html("Welcome "+ currentUser);
                    $("#userConnected").append(" <input type='button' id='disconnect' value='Disconnect' onClick='disconnect()'/>");
                    console.log("You are logged !");
                });
                //path ! Should exist !
                $(document).bind('reattached', function () {
                    router.navigate("home", {trigger: true});
                    $("#userConnected").html("Welcome "+ currentUser);
                    $("#userConnected").append(" <input type='button' id='disconnect' value='Disconnect' onClick='disconnect()'/>");
                    console.log("You are logged !");
                });

                $(".alert").empty();
                if(currentUser == "" || userPassword == ""){
                    $(".alert").html("You have to fill all blanks to be connected");
                }else if(!checkJID(currentUser)){
                    $(".alert").html("User Malformat ! Please use this format : word@word");
                }else{
                    setTimeout(function(){
                        $(".alert").html("One or several fields is wrong, please verify and try again");
                    },4000);
                }
            }

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
            $("#channelTab").removeClass();
            $("#homeTab").addClass("active");
            
            router.navigate("home", {trigger: true});
            return this;  
        },
        channelPage: function(){
            $("#homeTab").removeClass();
            $("#channelTab").addClass("active");
            
            requestInProgress("getChannels");
            getChannels();
            router.navigate("channel/list", {trigger: true});
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

            var channelToEdit = channels.filter(function(channel){return channel.getChid() == idRow});
            channelToEdit = channelToEdit[0].attributes;

            if(channelToEdit.owner != currentUser){
                alert("You can't edit a channel that isn't yours");
            }else{
                router.navigate("channel/edit/:id", {trigger: true});
                $("#create").css("display", "none");
                populateForm(channelToEdit);
                document.getElementById('title').innerHTML = "Edit " +idRow+"@"+channelToEdit.host;
            }

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
            //console.log("Collection set !");
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
            var alreadyExists = false;
            for(var i = 0; i < channels.length; i++){
                if(channels.get(document.getElementById("chid").value))
                    alreadyExists = true;
            }
            //Check if id already exist or is equals to a reserved keyword before registered it
            if(alreadyExists == true){
                $(".alert").html("Your id already exist, please choose another one");
            }else if(/(system\.indexes|^h)/.test(document.getElementById("chid").value)){
                $(".alert").html("Your id is a reserved keyword, please change");
            }else{
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

                channelToCreate = channelToCreate.attributes;

                if(channelToCreate.priority == 6){
                    console.log("suppression priority");
                    delete channelToCreate.priority;
                }
                /*if(channelToCreate.chdesc == ""){
                    console.log("suppression desc");
                    delete channelToCreate.chdesc;
                }
                if(_.isEmpty(channelToCreate.location)){
                    console.log("suppression location");
                    delete channelToCreate.location;
                }
                if(channelToCreate.headers instanceof Array && channelToCreate.headers.length == 0){
                    console.log("suppression headers");
                    delete channelToCreate.headers;
                }*/

                //console.log("A envoyer au serveur :", channelToCreate);
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

            channRecup = channRecup.attributes;

            if(channRecup.priority == 6){
                console.log("suppression priority");
                delete channRecup.priority;
            }
            /*if(channRecup.chdesc == ""){
                console.log("suppression desc");
                delete channRecup.chdesc;
            }
            if(_.isEmpty(channRecup.location)){
                console.log("suppression location");
                delete channRecup.location;
            }
            if(channRecup.headers instanceof Array && channRecup.headers.length == 0){
                console.log("suppression headers");
                delete channRecup.headers;
            }*/

            //console.log("ChannRecupéré du formulaire avant édition finale : ", channRecup);

            if(minimumRaised == true){ 
                console.log("Channels :",channels);

                editCollection(channRecup);
                
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