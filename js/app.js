

(function($){
    launcher = Backbone.Router.extend({
        routes : {
            ""                      : "connection",
            "home"                  : "home",
            "channel/list"          : "listChannel",
            "channel/create"        : "createChannel",
            "channel/edit/:id"      : "editChannel"
        },
        initialize : function(){
            console.log("Backbone is launched !");

            connectionView = new viewConnection({el:"#content"});
            homeView = new viewHomeConsole({el:"#content"});
            listChannelView = new viewListChannel({el:"#tabContent"});
            editChannelView = new viewEditChannel({el:"#tabContent"});
            createChannelView = new viewCreateChannel({el:"#tabContent"});
        },
        connection: function(){
            connectionView.render();
        },
        home : function(){
            cleanRequestState();
            homeView.render();
        },
        listChannel : function(){
            listChannelView.render();
        },
        createChannel : function(){
            cleanRequestState();
            createChannelView.render();
            $("#modify").css("display","none");

            $("#tr_owner td input").attr("value",currentOwner);
        },
        editChannel : function(){
            cleanRequestState();
            editChannelView.render(); 
        }
    });

    launcher.vent = _.extend({}, Backbone.Events);

    $(function(){
        console.log('document connected');
        router = new launcher();
        Backbone.history.start();
    });

})(jQuery)