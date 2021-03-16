const UsersModel = require('./models/users');
const RoomsModel = require('./models/rooms');
let jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const rooms = require('./models/rooms');
const https = require('https')

let buffer = [];
const jwt_token = process.env.jwt_token
const X_API_KEY = process.env.X_API_KEY

function _queryInfo(key){
  let res = buffer.findIndex(b=>b.key == key)
  
  res = JSON.parse( buffer.splice(res,1)[0].buff )
  if (res.results) {res = res.results}

  return res
}

let ondata = function(key){
  return function(body){
      let buf = buffer.findIndex(b=>b.key == key )
      buffer[buf].buff += body.toString()
  }
}

let onend = function(key, resolve){
  return function(){
      let res = _queryInfo(key)
      resolve(res)
  }
}

let responseCallback = function(key, resolve){
  return function(res){
    res.on('data', ondata(key));
    res.on('end', onend(key, resolve));
  }
}

function parsekp(id){
  return new Promise((resolve, reject)=>{
    let options = {
      protocol: 'https:',
      headers: {
          'X-API-KEY': X_API_KEY,
          'Content-Type':'application/json'
      }
    }

    let key = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)

    buffer.push({
      key: key,
      buff:""
    })

    https.get("https://kinopoiskapiunofficial.tech/api/v2.1/films/"+id+"?append_to_response=RATING", 
    options, responseCallback(key, resolve) )

  })
}

function checkAuth(token){
  return jwt.verify(token, jwt_token )
}

function createToken(body){
  let expiresIn = new Date();
  expiresIn.setDate(expiresIn.getDate() + 7)
  //Создание токена авторизации на основе приватного ключа сервера
  let token = jwt.sign(body, jwt_token, {
    expiresIn: "7d"
  });
  return {token, expiresIn}
}

sockets = []

function initUser(rooms, id){
  return new Promise(async (resolve, reject)=>{
    for (var i=0;i<rooms.username.length;i++){
      let x = await UsersModel.findOne({_id: rooms.username[i].user_id})
      rooms.username[i].username = x.toObject().username
      if (rooms.username[i].user_id == id){
        rooms.me = rooms.username.splice(i, 1)[0]
        i--;
      }
    }
  
    resolve(rooms)
  })
}


module.exports = io => {
  io.on('connection', (socket)=>{
    sockets.push({socket})    

    socket.on('getRooms', async (msg)=>{
      let id = checkAuth(msg).id

      let rooms = await RoomsModel.findOne({ "username.user_id": id  })
      if (!rooms){
        rooms = await RoomsModel.find({})
        rooms = rooms.map((room)=>{
          return room.toObject()
        })
        for (var i=0; i<rooms.length;i++){
          for (var j=0; j<rooms[i].username.length;j++){
            let x = await UsersModel.findOne({_id: rooms[i].username[j].user_id})
            rooms[i].username[j].username = x.toObject().username
          }
        }
      }
      else{
        rooms = rooms.toObject()
        socket.join(rooms._id.toString());
        let idx = sockets.findIndex(s=> s.socket == socket)
        sockets[idx].sync = setInterval( tickStatus, 5000, rooms._id.toString()  )
        
        rooms = await initUser(rooms, id)

        io.sockets.to(rooms._id.toString()).emit('change', {message: rooms});
      }

      socket.emit('rooms', rooms)
    })

    socket.on('kp_id', async (msg)=>{
      let id = checkAuth(msg.token).id
      let film = await parsekp(msg.kp)

      if (id && film){
        let rooms = await RoomsModel.create({
          username: [{
            user_id:id,
            status: false
          }],
          film:{
            film_id: film.data.filmId,
            name: film.data.nameRu,
            description: film.data.slogan,
            rating: Math.round(film.rating.rating),
            genres: film.data.genres.map(g=>g.genre).join(' '),
            countries: film.data.countries.map(c=>c.country).join(' '),
            duration: film.data.filmLength,
            year: film.data.year,
            poster: film.data.posterUrlPreview
          },
          status: 0,
          nowtime:0
        })
        
        rooms = rooms.toObject()
        socket.join(rooms._id.toString());
        let idx = sockets.findIndex(s=> s.socket == socket)
        sockets[idx].sync = setInterval( tickStatus, 5000, rooms._id.toString()  )
        
        rooms = await initUser(rooms, id)

        socket.emit('kp_id', {code: 0, success:"success", rooms })
      }
    })

    socket.on('join_room', async (msg) => {

      let id = checkAuth(msg.token).id

      let room_s = await RoomsModel.find({ "username.user_id": id  });

      if (room_s.length){
        return
      }

      let rooms = await RoomsModel.findOne({_id:msg.room_id})
      if (rooms){
        if ( rooms.username.findIndex(user=> user.user_id == id) == -1){
          rooms.username.push({
            user_id: id,
            status: false 
          })
          rooms = await rooms.save()
        }
        socket.join(rooms._id.toString());
        let idx = sockets.findIndex(s=> s.socket == socket)
        sockets[idx].sync = setInterval( tickStatus, 5000, rooms._id.toString()  )
        rooms = await RoomsModel.findOne({ "username.user_id": id  })
        rooms = rooms.toObject()

        rooms = await initUser(rooms, id)

        socket.emit('join_room', {code:0, success:'success', rooms})
        io.sockets.to(rooms._id.toString()).emit('change', {message: rooms});
      }
    })

    socket.on('leave_room', async (msg) => {
      let id = checkAuth(msg.token).id

      let rooms = await RoomsModel.findOne({ "username.user_id": id  })
      let ix = rooms.username.findIndex(u=> u.user_id == id)
      if (ix != -1){
        let user = rooms.username.splice(ix, 1)[0]
        rooms.save()
        rooms = rooms.toObject()
        rooms.username.push(user)

        rooms = await initUser(rooms, id)

        socket.leave(rooms.id)
        let idx = sockets.findIndex(s=> s.socket == socket)
        clearInterval(sockets[idx].sync);
        
        socket.emit('leave_room')

        io.sockets.to(rooms._id.toString()).emit('change', {status: "leave", message: rooms});

      }
    } )

    socket.on('pause', async (msg) => {

      let id = checkAuth(msg.token).id
      let rooms = await RoomsModel.findOne({ "username.user_id": id  })
        for (var i = 0;i < rooms.username.length;i++){
          rooms.username[i].status=false
        }
        rooms.status = 2
        rooms.time_pause = Date.now()
        rooms.save()
        rooms = rooms.toObject()

        rooms = await initUser(rooms, id)

        io.sockets.to(rooms._id.toString()).emit('change', {message: rooms});

    })

    socket.on('login', async (msg)=>{
      // Поиск пользователя
      let user = await UsersModel.findOne({
        username: msg.username,
      })

      // Проверка пароля на соответствие
      if (user && bcrypt.compareSync(msg.password, user.password)){
        // Создание токена авторизации
        let token = createToken({id: user._id})
        socket.emit('auth', {code: 1, token})
      }else{
        socket.emit('auth', {code: 0, success: 'failure', text:"Неверный логин или пароль"})
      }
    })

    socket.on('register', async (new_user)=>{
      // Поиск пользователя в бд
      let user = await UsersModel.findOne({
        username: new_user.username,
      })

      if (user){
        socket.emit('auth', {code: 0, success: 'failure', text:"Такой пользователь уже существует"})
        return;
      }
      
      // Создание пользователя
      user = await UsersModel.create({
        username: new_user.username,
        password: new_user.password,
      })

      // Создание токена авторизации
      let token = createToken({id: user._id})
      socket.emit('auth', {code: 0, token})
    })

    socket.on('disconnect', (socket)=>{
      console.log('disconnect')
    })

    async function tickStatus(room_id ){
      let rooms = await RoomsModel.findOne({ _id: room_id  })
      if (rooms.status != 1){
        return
      }
      let current_time = Date.now()
      let timing = (current_time - rooms.time_start) / 1000 
      socket.emit('sync', {time: timing})
    }

    socket.on('status', async(msg)=>{
      let id = checkAuth(msg.token).id
      let rooms = await RoomsModel.findOne({ "username.user_id": id  })

      let idx = rooms.username.findIndex(user=> user.user_id == id)
      rooms.username[idx].status = !rooms.username[idx].status

      let status_counter=0;
      for (var i=0;i<rooms.username.length;i++){
        if (rooms.username[i].status) status_counter++
      }

      if (status_counter==rooms.username.length){
        if (rooms.time_pause){

          let diff = Date.now() - rooms.time_pause
          //console.log( diff/1000 + " " + diff/60000 )

          let test = new Date(Date.now() - rooms.time_start)

          console.log( test.getMinutes() + " " + test.getSeconds() )

          rooms.time_start.setTime( rooms.time_start.getTime() + diff )
          rooms.markModified("time_start")

          test = new Date(Date.now() - rooms.time_start)

          console.log( test.getMinutes() + " " + test.getSeconds() )
          //console.log(rooms.time_start.getMinutes() + rooms.time_start.getSeconds() )
        } 
        else{
          rooms.time_start = new Date()
        }
        rooms.status = 1;
        //setInterval( tickStatus, 5000, rooms._id.toString()  )
      }
      

      rooms = await rooms.save()
      rooms = rooms.toObject()
      
      rooms = await initUser(rooms, id)

      io.sockets.to(rooms._id.toString()).emit('change', {message: rooms});
    })
})
}