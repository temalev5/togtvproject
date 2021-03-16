import React, {useState, useEffect} from "react";
import { LoginProvider } from "./login";
import { Dimmer, Loader, Container } from "semantic-ui-react";
import LoginForm from "./Forms/LoginForm";
import Cookies from "universal-cookie";
import { useSocket } from './socketContext'
import RoomsPage from "./RoomsComoponents/RoomsPage";
import RoomPage from "./RoomComponents/Room";

export default function SocketApp(params) {
    
    const [status, setStatus] = useState(false);
    const [rooms, setRooms] = useState(null)

    const socket = useSocket().socket

    useEffect(() => {

      const cookies = new Cookies();
      let token = cookies.get("token");

      if (token) {
        socket.emit( 'getRooms' , token )
        socket.once('rooms', (msg)=>{
          setRooms(msg)
        })
      } else {
        setStatus(true)
      }

    }, [status])
    
    
    return(
        <LoginProvider>
        <div>
          {status ? (
            <div>
              <Container>
                <LoginForm error={params.error} status={setStatus}></LoginForm>
              </Container>
            </div>
          ) : (
            <>
            {Array.isArray(rooms) ? (
              <>
              <RoomsPage rooms={rooms} status={setRooms}></RoomsPage>
              </>
            ) : (
            <>
            { rooms ? (
              <div>
                <RoomPage status={setStatus} room={rooms} kp={rooms.film.film_id}></RoomPage>
              </div>
            ) : (
            <Dimmer active>
              <Loader />
            </Dimmer>
            )}
            </>
            )}
            </>
          )}
        </div>
      </LoginProvider>
    )
}