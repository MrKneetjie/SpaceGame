var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var base64Img = require('base64-img');
var totalUsers = 0;
var cui = new Array();
var playerIsMoving = false;
var path = require('path');
var htmlPath = path.join(__dirname, 'assets');
var tileSize = 2;
var maxSpeed = 20;
var names = [
  "Rob Bott",
  "Optimus Prime",
  "Socket",
  "Micro",
  "Norbit"
];

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function(socket){
  var randomName = GenerateNickname();
  var person = {id:socket.id, name:randomName, health:100};
  cui.push(person);

  totalUsers += 1;
  console.log('a user connected with id ' + socket.id +', currently ' + totalUsers + ' users online.');

  socket.emit("send users");

  setInterval(function(){
    socket.emit('getarray', cui, totalUsers);
  }, 1);

  socket.on('checkPos', function(dir, newX, newY, idp){
    for(var i = 0; i < totalUsers; i++) {
      if(cui[i].id == idp){
        switch (dir) {
          case 'up':
            if(cui[i].y - maxSpeed < newY){
              cui[i].y = newY;
              socket.emit('getarray', cui, totalUsers);
            } else {
              cui[i].y -= maxSpeed;
              socket.emit('getarray', cui, totalUsers);
            }
            break;
          case 'down':
            if(cui[i].y + maxSpeed > newY){
              cui[i].y = newY;
              socket.emit('getarray', cui, totalUsers);
            } else {
              cui[i].y += maxSpeed;
              socket.emit('getarray', cui, totalUsers);
            }
            break;
          case 'left':
            if(cui[i].x - maxSpeed < newX){
              cui[i].x = newX;
              socket.emit('getarray', cui, totalUsers);
            } else {
              cui[i].x += maxSpeed;
              socket.emit('getarray', cui, totalUsers);
            }
            break;
          case 'right':
            if(cui[i].x + maxSpeed > newX){
              cui[i].x = newX;
              socket.emit('getarray', cui, totalUsers);
            } else {
              cui[i].x -= maxSpeed;
              socket.emit('getarray', cui, totalUsers);
            }
            break;
        }
      }
    }
  });

  function GenerateNickname() {
    var index = Math.floor((Math.random() * names.length) + 1);
    var nickname = names[index];
    return nickname;
  }

  socket.on('updateHealth', function(newHP, died, idp){
    for(var i = 0; i < totalUsers; i++) {
      if (cui[i].id == idp) {
        cui[i].health = newHP;
        cui[i].dead = died;
        if(died) {
          console.log('player died with id: ' + idp);
          spawn(i);
        }
      }
    }
  });

  socket.on("first connection", function(luca){
    for(var i = 0; i < totalUsers; i++) {
      if (cui[i].fc == null) {
        cui[i].fc = 1;
        spawn(i);
        break;
      }
    }
  });

  function spawn(index){
    cui[index].health = 100;
    cui[index].dead = false;
    var randomx = Math.floor((Math.random() * 1600/tileSize) + tileSize);
    var randomy = Math.floor((Math.random() * 1000/tileSize) + tileSize);
    cui[index].x = randomx;
    cui[index].y = randomy;
    socket.emit('getarray', cui, totalUsers);
    socket.emit('start position', cui[index].x * tileSize, cui[index].y * tileSize, cui[index].id);
  }

  socket.on('setName', function(newName, idp){
    for (var i = 0; i < totalUsers; i++) {
      if(cui[i].id == idp) {
        cui[i].name = newName;
      }
    }
  });

  socket.on('disconnect', function(){
    for(var i = 0; i < totalUsers; i++) {
      if (cui[i].id == socket.id) {
        cui.splice(i, 1);
        socket.emit('getarray', cui);
        break;
      }
    }
    totalUsers -= 1;
    console.log('user disconnected, currently ' + totalUsers + ' users online.');
  });
});

http.listen(3000, '0.0.0.0', function(){
  console.log('listening on *:3000');
});

// SOCKET.EMIT STUURT
// SOCKET.ON ONTVANGT
