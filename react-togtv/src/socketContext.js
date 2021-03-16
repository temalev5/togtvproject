import React, {useContext, useEffect, useState} from 'react'
import io from "socket.io-client";

const SocketContext = React.createContext()
// const socket = io.connect("http://localhost:7777")
const socket = io.connect("https://"+document.location.host+"/")

export const useSocket = () => {
  return useContext(SocketContext)
}

export const SocketProvider = ({ children }) => {
    return (
    <SocketContext.Provider value={{socket}}>
    { children }
    </SocketContext.Provider>)
}
