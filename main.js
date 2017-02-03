var socket = io();

 function notifyMe() {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    // alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification("New Message!");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification("New Message!");
      }
    });
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}Notification.requestPermission().then(function(result) {
  console.log(result);
});function spawnNotification(theBody,theIcon,theTitle) {
  var options = {
      body: theBody,
      icon: theIcon
  }
  var n = new Notification(theTitle,options);
}

$('#Messageform').submit(function(){      
  socket.emit('clientchat message', $('#m').val());
  $('#m').val('');
  return false;
});

socket.on('serverchat message', function(msg){
  MSG =  msg
  $('#messages').append($('<li>').text(msg));
  notifyMe();
});

var chatApp = angular.module('chatApp' , [] );
chatApp.controller('chatController' , ['$scope' , '$http' , function($scope , $http){

function getFileData(){
  $http({
    method : 'post' ,
    url : '/getLinks'
  }).then(function(response){
      console.log(response)
      res = response.data.dbData;
      console.log(res.length)
      hostName = response.data.hostData;
      console.log(hostName)
      $scope.icon = [];
      for(i=0; i<res.length; i++){
          DATA = {}
          DATA.link = res[i].link
          DATA.owner = res[i].owner
          DATA.originalname = res[i].originalname
          DATA.linkid = res[i].linkid
          DATA.hostName = hostName;
          DATA.totalLink = hostName +"/"+ res[i].link
          $scope.icon.push(DATA);
        }

    } ,function(err){
        console.log(err);
      });
}

getFileData();

}] )