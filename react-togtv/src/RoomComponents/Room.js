import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import User from "../RoomsComoponents/user";
import { Button, Icon } from "semantic-ui-react";
import { useSocket } from "../socketContext";
import Cookies from "universal-cookie";

export default function RoomPage(params) {
  const [status, setStatus] = useState(false);
  const [room, setChange] = useState(params.room);

  const socket = useSocket().socket;

  const toggle = () => {
    setChange((prev) => {
      return { ...prev, me: { status: !prev.me.status } };
    });
    // const []
    // setStatus(true)
    const cookies = new Cookies();
    let token = cookies.get("token");
    socket.emit("status", { status: room.me.status, token });
  };

  const leave = () => {
    const cookies = new Cookies();
    let token = cookies.get("token");
    socket.emit("leave_room", {token})
  }

  useEffect(() => {

    let iframe;
    let ifr=params.room.status;
    let room = params.room;
    let me = params.room.me;
    let current_timing = 0;

    function player(event){
      if (event.origin === "https://bayas.allohalive.com"){

        if (event.data.event == 'inited'){
            iframe = document.getElementsByTagName('iframe')[0].contentWindow
            iframe.postMessage({ method: 'play' }, '*');
            if (ifr != 1){
              iframe.postMessage({ method: 'pause' }, '*');
            }
        }
        else if (event.data.event == 'pause' && room.status === 1){
          const cookies = new Cookies();
          let token = cookies.get("token");
          socket.emit('pause', {token})
        }
        else if (event.data.event == "play" && room.status !== 1){
          if (iframe){
            iframe.postMessage({ method: 'pause' }, '*');
          }
        }
        else if (event.data.event == "time"){
          current_timing = event.data.data;
        }
    }
    console.log(event)
    }

    window.addEventListener("message", player, false);

    socket.on("sync", (msg)=>{
      if (iframe){
        if (Math.abs(msg.time - current_timing) > 1){
          iframe.postMessage({ method: 'seek', time: msg.time }, '*');
        }
      }
    })

    socket.on("change", (msg) => {
      room = msg.message;
      
      let idx = msg.message.username.findIndex(
        (user) => user.user_id == me.user_id
      );
      if (idx > -1) {
        let usr = msg.message.username.splice(idx, 1)[0];
        let usrme = msg.message.me;
        
        msg.message.me = usr;
        if (msg.status != 'leave'){
          msg.message.username.push(usrme);
        }
      }

      if (iframe){
        if (msg.message.status == 1){
          iframe.postMessage({ method: 'play' }, '*');
        }
        else if(msg.message.status == 2){
          iframe.postMessage({ method: 'pause' }, '*');
        }
      }

      console.log(msg.message)
      setChange(msg.message);
    });

    socket.once('leave_room', ()=>{
      params.status(true)
      params.status(false)
    })

    return () => {
      socket.removeAllListeners("sync");
      socket.removeAllListeners("change");
      window.removeEventListener("message", player);
    }
  }, []);

  return (
    <>
      <div>
        <div
          width="100%"
          heigth="100%"
          id="yohoho"
          data-player="alloha"
          data-kinopoisk={params.kp}
        ></div>
        <Helmet>
          <script src="https://yohoho.cc/yo.js"></script>
        </Helmet>
      </div>
      <div className="hud">
        <div className="chat"></div>
        <div className="users">
          <User user={room.me}></User>
          {room.username.map((user) => (
            <User key={user._id} user={user}></User>
          ))}
            <Button onClick={leave} floated='right' basic icon>
              <Icon name='sign-out' color='red' />
            </Button>
          {/* <div className="moreUsers">+2</div> */}
        </div>
        {room.status !== 1 ? (
          <div onClick={toggle} className="buttonStatus">
            {room.me.status ? (
              <Button basic color="orange" content="Не готов" />
            ) : (
              <Button basic color="green" content="Готов" />
            )}
          </div>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
