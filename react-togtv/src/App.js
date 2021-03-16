import React, { useEffect, useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import { Socket } from "socket.io-client";
// import io from "socket.io-client";
import SocketApp from "./socketApp";
import { SocketProvider } from "./socketContext";

// import {
//   BrowserRouter as Router,
//   Switch,
//   Route,
//   Link
// } from "react-router-dom";

// const socket = io.connect("http://localhost:7777");

function App() {
  const [modal, setModal] = useState({
    status: false,
    h1: null,
    description: null
  });
  

  return (
    <>
      <SocketProvider>
        <SocketApp error={setModal}></SocketApp>
      </SocketProvider>

      <Modal
        centered={false}
        open={modal.status}
        onClose={() => setModal({status: false})}
        onOpen={() => setModal({status: true})}
      >
        <Modal.Header>{modal.h1}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            {modal.description}
          </Modal.Description>
        </Modal.Content>
      </Modal>

    </>
  );
}

export default App;
