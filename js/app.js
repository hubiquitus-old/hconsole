var listChannelView,
    editChannelView,
    createChannelView;

(function($){
    launcher = Backbone.Router.extend({
        routes : {
            ""                      : "listChannel",
            "channel/create"        : "createChannel",
            "channel/edit/:id"      : "editChannel"
        },
        initialize : function(){
            console.log("Backbone is launch !");
            listChannelView = new viewListChannel({el:"#channel_content"});
            editChannelView = new viewEditChannel({el:"#channel_content"});
            createChannelView = new viewCreateChannel({el:"#channel_content"});
        },
        listChannel : function(){
            listChannelView.render();
        },
        createChannel : function(){
            createChannelView.render();
            $("#modify").css("display","none");

            $("#tr_owner td input").attr("value",currentOwner);
        },
        editChannel : function(){
            editChannelView.render();
            $("#create").css("display", "none");

            var channelToEdit = channels.filter(function(channel){return channel.getChid() == idRow});
            // console.log(channelToEdit);
            channelToEdit = channelToEdit[0].attributes;
            populateForm(channelToEdit);

            document.getElementById('title').innerHTML = "Edit " +idRow+"@"+channelToEdit.host;
        }
    });

    launcher.vent = _.extend({}, Backbone.Events);

    $(function(){
        $(document).bind('connected', function () {
            console.log('document connected');
            router = new launcher();
            Backbone.history.start();
        });
        $(document).bind('reattached', function () {
            console.log('document reattached');
            router = new launcher();
            Backbone.history.start();
        });
    });

})(jQuery)