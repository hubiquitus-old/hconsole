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

var headersPersisted = {};
var participantsPersisted = {};
var publicCounter = 0;
var participantCounter = 0;
var idRow = null;
var currentOwner = null;
var current = [];
var channels = new Channels();

var minimumRaised = false;

var idRetrived = null;
var descRetrived = null;
var priorityRetrived = null;
var priorityConverted = null; 
var locationBuilt = {};
var longRetrived = null;
var latRetrived = null;
var addressRetrieved = null;
var zipRetrived = null;
var cityRetrieved = null;
var countryRetrieved = null;
var hostRetrived = null;
var ownerRetrived = null;
var participantBuilt = [];
var activeRetrived = null;
var headerBuilt = {};
var hKeyRetrieved = null;
var hValueRetrieved = null;

var status = '';
var error = '';

var idGetChann = null;
var idCreateUpdateChann = null;

var currentUser = null;
var userPassword = null;

var connectionView,
    homeView,
    listChannelView,
    editChannelView,
    createChannelView;

var hOptions = {
    serverHost: "",
    serverPort: "",
    transport: "",
    endpoints: [""]
};

//inits
var hnodeName = "hnode@";

function connection(user,password){
    hClient.onStatus = onHStatus;
    hClient.connect(user,password,hOptions);
}

function disconnect(){
    hClient.disconnect();
    router.navigate("", {trigger: true});
    $("#requete").empty();
    $("#userConnected").empty();
}

function getChannels(){
    var commandGetChann = {
        entity : hnodeName + hClient.domain,
        cmd : 'hgetchannels',
        params : ""
    };

    var callback = function (hResult) {
        var result = hResult.result;
        for(var i =0; i < result.length; i++){
            result[i].id = result[i].chid;
            channels.add(result[i]);
        }
        responseReceived("getChannels");
        console.log("All Channels retrieved !");
        listChannelView.setCollection(channels);
    }
    idGetChann = hClient.command(commandGetChann, callback);
}

function createUpdateChannel(theChannel){
    console.log("createUpdateChannel :", theChannel);
    var commandCreateUpdateChann = {
        entity : hnodeName + hClient.domain,
        cmd : 'hcreateupdatechannel',
        params : theChannel
    };

    var callback = function(hResult) {
        if(hResult.status == 0){
            responseReceived("createUpdate");
            $(document).trigger('createUpdate');
            console.log("Channel created & persisted !");
        }else{
            console.log("ERROR n°: " + hResult.status);
            console.log("ERROR Type : ", hResult.result);
        }
    }
    idCreateUpdateChann = hClient.command(commandCreateUpdateChann, callback);
}

function conversePriorityToCode(priority){
    switch(priority){
        case "notDefined" :
            return 6;
            break;
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
        case 6 :
            return "notDefined";
            break;  
    }
}

function retrieveRadio(radio){
    for (var i=0; i<radio.length;i++) {
        if (radio[i].checked) {
            var radioRetrieved = radio[i].value;
        }
    }
    if(radioRetrieved == "true" || radioRetrieved == "false"){
        activeRetrived = radioRetrieved == "true" ? true : false;
    }else if(radioRetrieved == "bosh" || radioRetrieved == "socketio"){
        hOptions.transport = radioRetrieved == "bosh" ? "bosh" : "socketio";
    } 
}

function populateForm(channelToEdit){
    console.log("Le formulaire va etre rempli avec l'objet suivant :", channelToEdit);

    //Chid
    var id = channelToEdit.chid;
    $("#tr_id td input").attr("value", id);
    $("#tr_id td input").attr("disabled", "disabled");
    
    //Description
    var desc = channelToEdit.chdesc;
    $("#tr_desc td textarea").attr("value", desc);

    //Priority
    if(conversePriorityToString(channelToEdit.priority) != "notDefined"){
        var priority = conversePriorityToString(channelToEdit.priority);
        
        for(var i =0; i<document.getElementsByTagName("option").length; i++){
            if(document.getElementsByTagName("option")[i].value == priority){
                document.getElementsByTagName("option")[i].setAttribute("selected", true);
            }
        } 
    }

    //Location 
    if(channelToEdit.location != undefined){
        if(channelToEdit.location.lng){
            var lng = channelToEdit.location.lng;
            $("#tr_location td input#longitude").attr("value", lng);
        }
        if(channelToEdit.location.lat){
            var lat = channelToEdit.location.lat;
            $("#tr_location td input#latitude").attr("value", lat);
        }
        
        if(channelToEdit.location.addr){
            var addr = channelToEdit.location.addr;
            $("#tr_location td input#addr").attr("value", addr);
        }

        if(channelToEdit.location.zip){
            var zip = channelToEdit.location.zip;
            $("#tr_location td input#zip").attr("value", zip);
        }

        if(channelToEdit.location.city){
            var city = channelToEdit.location.city;
            $("#tr_location td input#city").attr("value", city);
        }
        
        if(channelToEdit.location.country){
            var country = channelToEdit.location.country;
            $("#tr_location td input#country").attr("value", country);
        }
    }

    //Host
    var host = channelToEdit.host;
    $("#tr_host td input").attr("value", host);
    $("#tr_host td input").attr("disabled", "disabled");

    //Owner
    var owner = channelToEdit.owner;
    $("#tr_owner td input").attr("value", owner);
    $("#tr_owner td input").attr("disabled", "disabled");

    //Populate participant fileds
    if(channelToEdit.participants != undefined){
        if(channelToEdit.participants.length != 0){
            for(var i = 0; i< channelToEdit.participants.length; i++){
                if(i==(channelToEdit.participants.length-1)){
                    participantPopulateForm(channelToEdit.participants[i], i+1, true);
                }else{
                    participantPopulateForm(channelToEdit.participants[i], i+1, false);
                }    
            }
        }
    }

    //Active
    var active = channelToEdit.active;
    for(var i =0; i<document.getElementById("tr_active").getElementsByTagName("input").length; i++){
        if(document.getElementById("tr_active").getElementsByTagName("input")[i].value == ''+active){
            document.getElementById("tr_active").getElementsByTagName("input")[i].setAttribute("checked", "checked");
        }
    } 

    //Populate header fields
    if(channelToEdit.headers != undefined){
        //Populate header fields
        if(channelToEdit.headers != undefined){
            var i = 0;
            for(var headerKey in channelToEdit.headers) {
                if(channelToEdit.headers.hasOwnProperty(headerKey)) {
                    headerPopulateForm(headerKey, channelToEdit.headers[headerKey], i+1);
                    i = i+1;
                }
            }

            if(i > 0){
                addHeaderInputs(i);
            }
        }
    }
}

function participantPopulateForm(theParticipant,index,last){
    if(index==1){
        $("#jid_participant"+index).attr("value",theParticipant);
        $("#deleteParticipant"+index).css("display","inline");
        $("#addParticipant"+index).attr("disabled","disabled");
        $("#jid_participant"+index).attr("disabled","disabled");
    }else{
        var new_div = jQuery ('<div id="participant'+index+'"></div>');
        $("#participants_input").append(new_div);

        var participantInput = document.createElement("input");
        participantInput.id = "jid_participant"+index;  
        participantInput.type = "text"; 
        participantInput.size = 22; 
        participantInput.value = theParticipant;
        $("#participant"+index).append(participantInput);
        
        $("#participant"+index).append(" ");

        var addInput = document.createElement("input"); 
        addInput.id = "addParticipant"+index;
        addInput.type = "button";
        addInput.value = "A";
        addInput.setAttribute("disabled", "disabled");
        $("#participant"+index).append(addInput); 

        $("#participant"+index).append(" ");

        var deleteInput = document.createElement("input"); 
        deleteInput.id = "deleteParticipant"+index;
        deleteInput.type = "button";
        deleteInput.value = "X";
        deleteInput.setAttribute("onClick","deleteInputs(this)");
        $("#participant"+index).append(deleteInput); 
        
        $("#participants_input input:#jid_participant"+index).attr("disabled","disabled");
        $("#participants_input input:#addParticipant"+index).attr("disabled","disabled");
    }

    if(last==true){
        addParticipantInput(index);
    }

    participantsPersisted[index] = $("#jid_participant"+index).val();
}

function headerPopulateForm(key,value,index){
    if(index==1){
        $("#key"+index).attr("value",key);
        $("#value"+index).attr("value",value);
        $("#deleteHeader"+index).css("display", "inline");
        $("#addHeader"+index).attr("disabled","disabled");
        $("#key"+index).attr("disabled","disabled");
        $("#value"+index).attr("disabled","disabled");
    }else{
        var new_div = jQuery ('<div id="header'+index+'"></div>');
        $("#header_inputs").append(new_div);

        var keyInput = document.createElement("input"); 
        keyInput.type = "text";
        keyInput.id = "key"+index;  
        keyInput.size = 2; 
        keyInput.value = key;
        $("#header"+index).append("hkey : ");
        $("#header"+index).append(keyInput);
        
        var valueInput = document.createElement("input"); 
        valueInput.type = "text"; 
        valueInput.id = "value"+index;
        valueInput.size = 2;  
        valueInput.value = value;
        $("#header"+index).append(" hvalue : ");
        $("#header"+index).append(valueInput);  

        $("#header"+index).append(" ");

        var addInput = document.createElement("input"); 
        addInput.id = "addHeader"+index;
        addInput.type = "button";
        addInput.value = "A";
        addInput.setAttribute("disabled", "disabled");
        $("#header"+index).append(addInput); 

        $("#header"+index).append(" ");

        var deleteInput = document.createElement("input"); 
        deleteInput.id = "deleteHeader"+index;
        deleteInput.type = "button";
        deleteInput.value = "X";
        deleteInput.setAttribute("onClick","deleteInputs(this)");
        $("#header"+index).append(deleteInput); 

        $("#header_inputs input:#key"+index).attr("disabled","disabled");
        $("#header_inputs input:#value"+index).attr("disabled","disabled");
        $("#header_inputs input:#addHeader"+index).attr("disabled","disabled");
    }

    //Persist objets into a var
    headersPersisted[index] = {
        hKey:$("#key"+index).val(),
        hValue: $("#value"+index).val()
    }
}

function addHeaderInputs(counter) {

    if($("#key"+counter).val()=="" || $("#value"+counter).val()==""){
        alert("You have to inform key and value to add an header");
    }else{
        //Avoid the user to delete any header
        $("#deleteHeader"+counter).css("display", "inline");
        
        //Update compteurs
        if(publicCounter != counter)
            publicCounter = counter;
        publicCounter++;

        //Persist objets into a var
        headersPersisted[counter] = {
            hKey:$("#key"+counter).val(),
            hValue: $("#value"+counter).val()
        }

        //Avoid headers edition.
        $("#header_inputs input:#key"+counter).attr("disabled","disabled");
        $("#header_inputs input:#value"+counter).attr("disabled","disabled");
        $("#header_inputs input:#addHeader"+counter).attr("disabled","disabled");

        var new_div = jQuery ('<div id="header'+publicCounter+'"></div>');
        $("#header_inputs").append(new_div);

        var keyInput = document.createElement("input"); 
        keyInput.type = "text";
        keyInput.id = "key"+publicCounter;  
        keyInput.size = 2; 
        $("#header"+publicCounter).append("hkey : ");
        $("#header"+publicCounter).append(keyInput);
        
        var valueInput = document.createElement("input"); 
        valueInput.type = "text"; 
        valueInput.id = "value"+publicCounter;
        valueInput.size = 2;  
        $("#header"+publicCounter).append(" hvalue : ");
        $("#header"+publicCounter).append(valueInput);  

        $("#header"+publicCounter).append(" ");

        var addInput = document.createElement("input"); 
        addInput.id = "addHeader"+publicCounter;
        addInput.type = "button";
        addInput.value = "A";
        addInput.setAttribute("onClick","addHeaderInputs(publicCounter)")
        $("#header"+publicCounter).append(addInput); 

        $("#header"+publicCounter).append(" ");

        var deleteInput = document.createElement("input"); 
        deleteInput.id = "deleteHeader"+publicCounter;
        deleteInput.type = "button";
        deleteInput.value = "X";
        deleteInput.setAttribute("style","display:none");
        deleteInput.setAttribute("onClick","deleteInputs(this)");
        $("#header"+publicCounter).append(deleteInput); 
    }
} 

function addParticipantInput(counter){

    if(!checkJID($("#jid_participant"+counter).val())){
        alert("Participant Malformat ! Please use this format : word@word(.word)");
    }else if($("#jid_participant"+counter).val()==""){
        alert("You have to fill the blank before add a participant");
    }else{
        $("#deleteParticipant"+counter).css("display", "inline");

        if(participantCounter != counter)
            participantCounter = counter;
        participantCounter++;

        $("#participants_input input:#jid_participant"+counter).attr("disabled","disabled");
        $("#participants_input input:#addParticipant"+counter).attr("disabled","disabled");

        var new_div = jQuery ('<div id="participant'+participantCounter+'"></div>');
        $("#participants_input").append(new_div);

        var participantInput = document.createElement("input");
        participantInput.id = "jid_participant"+participantCounter;  
        participantInput.type = "text"; 
        participantInput.size = 22; 
        $("#participant"+participantCounter).append(participantInput);
        
        $("#participant"+participantCounter).append(" ");

        var addInput = document.createElement("input"); 
        addInput.id = "addParticipant"+participantCounter;
        addInput.type = "button";
        addInput.value = "A";
        addInput.setAttribute("onClick","addParticipantInput(participantCounter)")
        $("#participant"+participantCounter).append(addInput); 

        $("#participant"+participantCounter).append(" ");

        var deleteInput = document.createElement("input"); 
        deleteInput.id = "deleteParticipant"+participantCounter;
        deleteInput.type = "button";
        deleteInput.value = "X";
        deleteInput.setAttribute("style","display:none");
        deleteInput.setAttribute("onClick","deleteInputs(this)");
        $("#participant"+participantCounter).append(deleteInput); 

        //Persist element into an object
        participantsPersisted[counter] = $("#jid_participant"+counter).val();
    }
}

function deleteInputs(inputToDelete){
    var isAnHeader = inputToDelete.id.indexOf("deleteHeader");
    var isAParticipant = inputToDelete.id.indexOf("deleteParticipant");
    var identifier = null;
    
    if(isAnHeader != -1){
        console.log("DELETE ONE HEADER");
        identifier = inputToDelete.id.replace("deleteHeader","");

        $("#header"+identifier).remove();
        
        delete headersPersisted[identifier];
    }

    if(isAParticipant != -1){
        console.log("DELETE ONE PARTICIPANT");
        identifier = inputToDelete.id.replace("deleteParticipant","")

        $("#participant"+identifier).remove();

        delete participantsPersisted[identifier];
    }
}

function retrieveForm(){
    headerBuilt = {}
    participantBuilt = [];

    idRetrived = document.getElementById("chid").value;
    descRetrived = document.getElementById('chdesc').value;
    priorityRetrived = document.getElementById('priority').value; 
            
    longRetrived = document.getElementById('longitude').value;
    latRetrived = document.getElementById('latitude').value;
    addressRetrieved = document.getElementById('addr').value;
    zipRetrived = document.getElementById('zip').value;
    cityRetrieved = document.getElementById('city').value;
    countryRetrieved = document.getElementById('country').value;

    /*locationBuilt = {
        lng:longRetrived,
        lat:latRetrived,
        addr: addressRetrieved,
        zip:zipRetrived,
        city:cityRetrieved,
        country:countryRetrieved,
    };*/

    //Location 
    var attrs = ['lng', 'lat', 'addr', 'zip', 'city', 'country'];
    var retrievedValues = [longRetrived, latRetrived, addressRetrieved,
    zipRetrived, cityRetrieved, countryRetrieved];

    for(var i = 0; i < attrs.length; i++){
        locationBuilt[attrs[i]] = retrievedValues[i];
        if(locationBuilt[attrs[i]] == ""){
            delete locationBuilt[attrs[i]];
        }
    }

    hostRetrived = document.getElementById('host').value;
    ownerRetrived = document.getElementById('owner').value;

    for(var attr in participantsPersisted){
        if(participantsPersisted.hasOwnProperty(attr))
            participantBuilt.push(participantsPersisted[attr]);
    }
    
    priorityConverted = conversePriorityToCode(priorityRetrived);
    

    for(var attr in headersPersisted){
        if(headersPersisted.hasOwnProperty(attr))
            headerBuilt[headersPersisted[attr].hKey] = headersPersisted[attr].hValue;
    }

    headersPersisted = {};
    participantsPersisted = {};
}

function editCollection(newChan){
    channels.get(newChan.id).attributes = newChan;
}

function requestInProgress(command){
    $("#requete").html(command + " in progress...");
}

function responseReceived(command){
    $("#requete").html(command + " received !");
}

function cleanRequestState(){
    $("#requete").html("No request !");
}

function onHStatus(hStatus) {
    switch(hStatus.status){
        case hClient.statuses.CONNECTED:
            status = 'Connected';
            $(document).trigger('connected');
            currentOwner = hClient.publisher;
            break;
        case hClient.statuses.CONNECTING:
            status = 'Connecting';
            break;
        case hClient.statuses.REATTACHING:
            status = 'Reattaching';
            break;
        case hClient.statuses.REATTACHED:
            status = 'Reattached';
            $(document).trigger('reattached');
            currentOwner = hClient.publisher;
            break;
        case hClient.statuses.DISCONNECTING:
            status = 'Disconnecting';
            break;
        case hClient.statuses.DISCONNECTED:
            status = 'Disconnected';
            break;
    }

    switch(hStatus.errorCode){
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
            error += hStatus.errorMsg;
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


//temporary patch coming from 0.3.10 preview
var checkJID = function(jid) {
    return new RegExp("^(?:([^@/<>'\"]+)@)([^@/<>'\"]+)(?:/([^/<>'\"]*))?$").test(jid);
}

/*function hCallback(msg){
    if(msg.type == 'hStatus'){
        
    }
    else if (msg.type == 'hResult'){
        if(msg.data.reqid == idGetChann){
            var result = msg.data.result;
            for(var i =0; i < result.length; i++){
                result[i].id = result[i].chid;
                channels.add(result[i]);
            }
            responseReceived("getChannels");
            console.log("All Channels retrieved !");
            listChannelView.setCollection(channels);
        }else{
            if(msg.data.status == 0){
                responseReceived("createUpdate");
                $(document).trigger('createUpdate');
                console.log("Channel created & persisted !");
            }else{
                console.log("ERROR n°: " + msg.data.status);
                console.log("ERROR Type : ", msg.data.result);
            }
        }
    }
}     */
