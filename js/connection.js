/*
 * Copyright (c) Novedia Group 2012.
 *
 *     This file is part of Hubiquitus.
 *
 *     Hubiquitus is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     Hubiquitus is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with Hubiquitus.  If not, see <http://www.gnu.org/licenses/>.
 */
var idRow = null;
var currentOwner = null;
var current = [];
var channels = null;
var channel = new Channel();

var minimumRaised = false;

var idRetrived = null;
var descRetrived = null;
var priorityRetrived = null;
var priorityConverted = null; 
var locationBuilt = null;
var longRetrived = null;
var latRetrived = null;
var zipRetrived = null;
var hostRetrived = null;
var ownerRetrived = null;
var participantsRetrived = null;
var activeRetrived = null;
var headerRetrived = null;

var status = '';
var error = '';

var idGetChann = null;
var idCreateUpdateChann = null;

var hOptions = {
    serverHost: "localhost",
    serverPort: "",
    transport: "socketio",
    // endpoints: ["http://192.168.2.104:5280/http-bind"] BOSH
    // endpoints: ["http://hub.novediagroup.com:5280/http-bind"]
    endpoints: ["http://hub.novediagroup.com:8080/"]
    // endpoints: ["http://192.168.2.104:8080/"] 
};

setTimeout(function(){
    hClient.connect("u1@hub.novediagroup.com","u1",hCallback,hOptions);
    // hClient.connect("u1@localhost","u1",hCallback,hOptions);
},3000);

function getChannels(){
    var commandGetChann = {
        entity : 'hnode.' + hClient.domain,
        cmd : 'hgetchannels',
        params : ""
    };
    
    idGetChann = hClient.command(commandGetChann);
}

function createUpdateChannel(theChannel){
    console.log(theChannel);
    var commandCreateUpdateChann = {
        entity : 'hnode.' + hClient.domain,
        cmd : 'hcreateupdatechannel',
        params : theChannel
    };
    
    idCreateUpdateChann = hClient.command(commandCreateUpdateChann);
}

function conversePriorityToCode(priority){
    switch(priority){
        case "trace" :
            return 0;
            break;
        case "info" :
            return 1;
            break; 
        case "warning" :
            return 2;
            break; 
        case "alert" :
            return 3;
            break; 
        case "critical" :
            return 4;
            break; 
        case "panic" :
            return 5;
            break;    
    }
}

function conversePriorityToString(priority){
    switch(priority){
        case 0 :
            return "trace";
            break;
        case 1 :
            return "info";
            break; 
        case 2 :
            return "warning";
            break; 
        case 3 :
            return "alert";
            break; 
        case 4 :
            return "critical";
            break; 
        case 5 :
            return "panic";
            break;    
    }
}

function testRadio(radio){
    for (var i=0; i<radio.length;i++) {
        if (radio[i].checked) {
            activeRetrived = radio[i].value;
        }
    }
    activeRetrived = activeRetrived == "true" ? true : false;
}

function populateForm(channelToEdit){
    console.log(channelToEdit);
    var id = channelToEdit.chid;
    var desc = channelToEdit.chdesc;
    var priority = conversePriorityToString(channelToEdit.priority); 
    var lng = "";
    var lat = "";
    var zip = "";

    if(channelToEdit.location!="undefined"){
        lng = channelToEdit.location.lng;
        lat = channelToEdit.location.lat;
        zip = channelToEdit.location.zip;
    }

    var host = channelToEdit.host;
    var owner = channelToEdit.owner;

    var participants = "";
    for(var i=0; i< channelToEdit.participants.length; i++){
        channelToEdit.participants[i] = channelToEdit.participants[i].replace(/ */g,"");
        participants += channelToEdit.participants[i];
        if(channelToEdit.participants[i+1])
            participants += ", ";
    }

    var active = channelToEdit.active;
    var headers = "";
    
    if(channelToEdit.headers !== "Array"){
        headers = channelToEdit.headers;
    }

    console.log("ID "+id);
    console.log("DESC "+desc);
    console.log("PRIORITY " +priority);
    console.log("LONG "+lng);
    console.log("LAT "+lat);
    console.log("ZIP "+zip);
    console.log("HOST "+host);
    console.log("OWNER "+owner);
    console.log("PARTICIPANTS ")
    console.log(participants);
    console.log("ACTIVE "+active);
    console.log("HEADERS "+headers);


    $("#tr_id td input").attr("value", id);
    $("#tr_id td input").attr("disabled", "disabled");

    $("#tr_host td input").attr("value", host);
    $("#tr_host td input").attr("disabled", "disabled");

    $("#tr_owner td input").attr("value", owner);
    $("#tr_owner td input").attr("disabled", "disabled");

    $("#tr_desc td textarea").attr("value", desc);

    for(var i =0; i<document.getElementsByTagName("option").length; i++){
        if(document.getElementsByTagName("option")[i].value == priority){
            document.getElementsByTagName("option")[i].setAttribute("selected", true);
        }
    }

    $("#tr_location td input#longitude").attr("value", lng);
    $("#tr_location td input#latitude").attr("value", lat);
    $("#tr_location td input#zip").attr("value", zip);

    $("#tr_participants td input").attr("value", participants);
    
    for(var i =0; i<document.getElementById("tr_active").getElementsByTagName("input").length; i++){
        if(document.getElementById("tr_active").getElementsByTagName("input")[i].value == ''+active){
            document.getElementById("tr_active").getElementsByTagName("input")[i].setAttribute("checked", "checked");
        }
    }

    $("#tr_headers td input").attr("value", headers);
}

function hCallback(msg){
    console.log(JSON.stringify(msg));
    if(msg.type == 'hStatus'){
        switch(msg.data.status){
            case hClient.status.CONNECTED:
                status = 'Connected';
                getChannels();
                currentOwner = hClient.publisher;
                break;
            case hClient.status.CONNECTING:
                status = 'Connecting';
                break;
            case hClient.status.REATTACHING:
                status = 'Reattaching';
                break;
            case hClient.status.REATTACHED:
                status = 'Reattached';
                currentOwner = hClient.publisher;
                getChannels();
                break;
            case hClient.status.DISCONNECTING:
                status = 'Disconnecting';
                break;
            case hClient.status.DISCONNECTED:
                status = 'Disconnected';
                break;
        }

        switch(msg.data.errorCode){
            case hClient.errors.NO_ERROR:
                error = 'No Error Detected';
                break;
            case hClient.errors.JID_MALFORMAT:
                error = 'JID Malformat';
                break;
            case hClient.errors.CONN_TIMEOUT:
                error = 'Connection timed out';
                break;
            case hClient.errors.AUTH_FAILED:
                error = 'Authentication failed';
                break;
            case hClient.errors.ATTACH_FAILED:
                error = 'Attach failed';
                break;
            case hClient.errors.ALREADY_CONNECTED:
                error = 'A connection is already opened';
                break;
            case hClient.errors.TECH_ERROR:
                error = 'Technical Error: ';
                error += msg.data.errorMsg;
                break;
            case hClient.errors.NOT_CONNECTED:
                error = 'Not connected';
                break;
            case hClient.errors.CONN_PROGRESS:
                error = 'A connection is already in progress';
                break;
        }

        //Couleurs des status
        if(status == 'Connected' || status == 'Reattached'){
            $("#status").removeClass(function() {
              return $("#status").prev().attr('class');
            });
            $("#status").addClass("green");
            document.getElementById("status").innerHTML = JSON.stringify("Status : "+ status + ' / <span id=error>' + error + '</span>');
        }
        if(status == 'Connecting' || status == 'Reattaching' || status == 'Disconnecting'){
            $("#status").removeClass(function() {
              return $("#status").prev().attr('class');
            });
            $("#status").addClass("orange");
            document.getElementById("status").innerHTML = JSON.stringify("Status : "+ status + ' / <span id=error>' + error + '</span>');
        }
        if(status == 'Disconnected'){
            $("#status").removeClass(function() {
              return $("#status").prev().attr('class');
            });
            $("#status").addClass("red");
            document.getElementById("status").innerHTML = JSON.stringify("Status : "+ status + ' / <span id=error>' + error + '</span>');
        }
        if(error == 'No Error Detected'){
            $("#error").removeClass(function() {
              return $("#error").prev().attr('class');
            });
            $("#error").addClass("green");
        }else{
            $("#error").removeClass(function() {
              return $("#error").prev().attr('class');
            });
            $("#error").addClass("red");
        }
    }
    else if (msg.type == 'hResult'){
        if(channels == null)
            channels = new Channels();
        
        if(msg.data.reqid == idGetChann){
            var result = msg.data.result;

            for(var i =0; i < result.length; i++){
                channels.add(result[i]);
            }
            console.log("Channels retrieved !")
        }else{
            if(msg.data.status == 0)
                console.log("Channel created & persisted !");
        }
        listChannelView.setCollection(channels)
    }
}
