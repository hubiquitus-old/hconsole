
var listChannelView,
    editChannelView,
    createChannelView;

(function($){
    //On definit le routeur
    launcher = Backbone.Router.extend({
        routes : {
            ""                      : "listChannel",
            "channel/create"        : "createChannel",
            "channel/edit/:id"      : "editChannel"
        },
        initialize : function(){
            // console.log("initialized");
        },
        listChannel : function(){
            listChannelView.render();

            $('#list #listChannels #channel')
                .mouseover(function() {$(this).addClass('selectedRow');})
                .mouseout(function() {$(this).removeClass('selectedRow');})
                .click(function() { idRow = $('td:first', this).text();});
        },
        createChannel : function(){
            createChannelView.render();
            $("#modify").css("display","none");

            $("#tr_owner td input").attr("value",currentOwner);
            
        },
        editChannel : function(){
            editChannelView.render();
            $("#create").css("display", "none");


            channelToEdit = channels.filter(function(channel){return channel.getChid() == idRow});
            channelToEdit = channelToEdit[0].attributes;
            populateForm(channelToEdit);

            document.getElementById('title').innerHTML = "Edit " +idRow+"@"+channelToEdit.host;
        }
    });

    $(function(){
        //On charge les vues
        listChannelView = new viewListChannel({el:"#channel_content"});
        editChannelView = new viewEditChannel({el:"#channel_content"});
        createChannelView = new viewCreateChannel({el:"#channel_content"});

        router = new launcher();
        Backbone.history.start();
    });

})(jQuery)