# hConsole
This is an administration console that allows people to manage their channels. 
Their will have other features in the future.

## How to Use it
When you start the application, you will have to log yourself with your username password and all informations 
regarding the [hServer](https://github.com/hubiquitus/hubiquitus-node) you are connecting. 
Those informations will be checked against the server and if they are correct, you'll be redirected to the Home page.

### Home page
On this page you'll be able to select one tab :
  * Channels administration

### Channels administration page
This is the main page for channels administration. 
It gives you a list that represents all channels recorded into the hServer.

Here is the list of action you will be able to do :
 * Edit YOUR channels by clicking on them in the list 
(If you try to edit one that isn't yours, you will be stoped by a pop up)
 * Create a channel 

Those two actions, redirect you to the form channel page 

### Channel form page
This form has 4 mandatory fields : 
* Id (Your id channel)
* Host (The domain to which the channel belongs)
* Participants (The list of all people authorized to subscribe to this current channel)
* Active (Option that allows or not all participants to have access to this channel)

All other fields are optionnal.

To add an extra into the location, a participant or an header, you have to click on the "Add" button to validate it. 
You can delete all entry with the "Delete" button.

####Specification for edit form page
When you want to edit your channel, you can't change the id, the host and the owner that is you.
All other fields can be changed.