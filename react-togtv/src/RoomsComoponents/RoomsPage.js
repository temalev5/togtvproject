import React, { useState, useRef } from "react";
import {
  Card,
  Image,
  Button,
  Table,
  Rating,
  Dropdown,
  Icon,
  Modal,
  Header,
  Form,
} from "semantic-ui-react";
import User from "./user";
import Search from "./Search";
import { useSocket } from "../socketContext";
import Cookies from "universal-cookie";

function CardMap(params){
  const room = params.room
  const socket = useSocket().socket;

  const onclickbutton = () => {
    
    const cookies = new Cookies();
    let token = cookies.get("token");

    socket.emit('join_room', {token, room_id: room._id})

    socket.once('join_room', (msg)=>{
      if (msg.success == "success") {
        console.log(msg);
        console.log(params);
        params.status(msg.rooms);
      }
    })
  }

  return (
    <Card id={room._id} key={room._id}>
    <Card.Content style={{ borderBottom: "1px white solid" }}>
      <Image
        className="roomImage"
        floated="right"
        size="small"
        src={room.film.poster}
      />
      <Card.Header>{room.film.name}</Card.Header>
      <Card.Meta>
        <div className="users">
          {room.username.map((user) => (
            <User user={user} key={user._id}></User>
          ))}
          {/* <div className="moreUsers">+2</div> */}
        </div>
      </Card.Meta>
      <Table basic="very" celled collapsing>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Длительность</Table.Cell>
            <Table.Cell>{room.film.duration}</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Год</Table.Cell>
            <Table.Cell>{room.film.year}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <Card.Description>
        <Table className="w-100" basic="very" celled collapsing>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Страны</Table.Cell>
              <Table.Cell>{room.film.countries}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>Жанры</Table.Cell>
              <Table.Cell>{room.film.genres}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Card.Description>
    </Card.Content>
    <Card.Content extra>
      <div className="roomRating">
        <div>Рейтинг</div>
        <Rating icon="star" defaultRating={8} maxRating={10} disabled />
      </div>
      <div className="ui two buttons">
        <Button onClick={onclickbutton} basic color="green">
          Войти
        </Button>
      </div>
    </Card.Content>
  </Card>
  )
}


export default function RoomsPage(params) {
  const [open, setOpen] = useState(false);
  const kp_id = useRef(null);
  const [loadingroom, setLoadingRoom] = useState(false);

  const socket = useSocket().socket;

  const sendRequest = () => {
    setLoadingRoom(true);
    console.log(kp_id.current.value);
    let kp = kp_id.current ? kp_id.current.value : null;

    const cookies = new Cookies();
    let token = cookies.get("token");

    if (kp) {
      socket.emit("kp_id", { kp, token });

      socket.once("kp_id", (msg) => {
        if (msg.success == "success") {
          console.log(msg);
          console.log(params);
          params.status(msg.room);
        }
      });
    }
  };

  return (
    <div className="ui container">
      <div className="top">
        <Search></Search>
        <div className="rightTop">
          <Rating
            className=""
            icon="star"
            defaultRating={8}
            maxRating={10}
            disabled
          />
          <Dropdown text="Жанры" disabled />
          <Dropdown text="Год" disabled />
        </div>
      </div>
      <hr className="style-two"></hr>
      <div className="secondtop">
        <h2>Комнаты</h2>

        <Modal
          size="tiny"
          onClose={() => setOpen(false)}
          onOpen={() => setOpen(true)}
          open={open}
          trigger={
            <Button
              color="brown"
              size="tiny"
              className="ui"
              icon
              labelPosition="left"
            >
              <Icon name="plus" />
              Создать комнату
            </Button>
          }
        >
          <Modal.Header>Создать комнату</Modal.Header>
          <Modal.Content image>
            <Image
              size="small"
              src="https://vk.vkfaces.com/851028/v851028862/1dfb7c/5To-Sa-6jWs.jpg"
              wrapped
            />
            <Modal.Description>
              <Form>
                <Form.Field>
                  <label>Кинопоиск ID</label>
                  <input
                    ref={kp_id}
                    name="kinopoisk_id"
                    type="number"
                    placeholder="Кинопоиск ID"
                  />
                </Form.Field>
                <div className="ui horizontal divider">Или</div>
                <Form.Field>
                  <label>Название</label>
                  <div className="ui disabled category search">
                    <div className="ui icon input">
                      <input
                        className="prompt"
                        type="text"
                        placeholder="Поиск по названию"
                      ></input>
                      <i className="search icon"></i>
                    </div>
                    <div className="results"></div>
                  </div>
                </Form.Field>
              </Form>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color="black" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button
              content="Создать"
              labelPosition="right"
              icon="caret right"
              onClick={sendRequest}
              loading={loadingroom}
              positive
            />
          </Modal.Actions>
        </Modal>
      </div>
      <Card.Group className="roomsCards">
        {params.rooms.map((room) => (
          <CardMap status={params.status} key={room._id} room={room}></CardMap>
        ))}
      </Card.Group>
    </div>
  );
}
