import React, { useEffect, useRef } from 'react'
import { Form } from 'semantic-ui-react'
import {useAlert} from "../login"
import LoginButton from "./loginButton";
import { useSocket } from '../socketContext'
import InputComponent from "./InputComponent";
import Cookies from "universal-cookie";

function setToken(msg){
    const cookies = new Cookies();
    console.log(msg.expiresIn)
    cookies.set('token', msg.token, { path: '/', expires: new Date(msg.expiresIn) });
}


export default function LoginForm(props) {

    const status = useAlert()
    const socket = useSocket().socket

    const inputRef = {
        username: useRef(null),
        password: useRef(null),
        conf_pass: useRef(null),
    }
    
    const sendRequest = () => {
        console.log(status.login)
        let username = inputRef.username.current ? inputRef.username.current.value : null;
        let password =  inputRef.password.current ? inputRef.password.current.value : null;
        let conf_pass = inputRef.conf_pass.current ? inputRef.conf_pass.current.value : null;


        if (status.login){
            if (username && password){
                socket.emit("login",{
                    username,
                    password,
                })
            }
            else{
                props.error({status: true, h1: "Не указан логин или пароль", description: "Заполните все поля"})
                return
            }
        }
        else{
            if (username && password && conf_pass){
                if (password == conf_pass){
                    socket.emit("register",{
                        username,
                        password,
                        conf_pass
                    })
                }
                else{
                    props.error({status: true, h1: "Пароли не совпадают", description: "Попробуйте ввести еще раз"})
                    return
                }
            }
            else{
                props.error({status: true, h1: "Не указан логин или пароль", description: "Заполните все поля"})
                return
            }
        }

        socket.once('auth', (msg)=>{
            if (msg.success == "failure"){
                props.error({status: true, h1: msg.text, description: "Попробуйте ввести еще раз"})
                return
            }
            setToken(msg.token)
            props.status(false)
        })
    } 

    return(
        <div className="form-container">
            <Form className="customForm myform">
                <InputComponent text="Логин" name="login" type="text" follow={inputRef.username}>
                </InputComponent>
                <InputComponent text="Пароль" name="password" type="password" follow={inputRef.password} >
                </InputComponent>
                {!status.login ? (
                    <>
                        <InputComponent name="password" type="password" text="Повторите пароль" follow={inputRef.conf_pass} >
                        </InputComponent>
                    </>
                ): null}
                <Form.Field>
                    <LoginButton toggle={sendRequest} login={status.login}></LoginButton>
                </Form.Field>
                <div className="ui horizontal divider">
                    Или
                </div>
                <div className="ui fluid container center aligned">
                    <LoginButton login={!status.login} toggle={status.toggle}></LoginButton>
                </div>
            </Form>
        </div>
    )
}

// export default class LoginForm extends React.Component{
    
//     constructor(props) {
//         super(props);

//         this.state = {st: "hello"}
//         this.handleClick = this.handleClick.bind(this);
//     }
    
//     handleClick(){
//         this.setState(state=>({
//             st: "qq"
//         }))
//     }
    
//     render(){
//         return(
//             <div className="form-container">
//                 <Form className="customForm">
//                     <Form.Field>
//                         <label>Логин</label>
//                         <input placeholder={this.state.st} />
//                         </Form.Field>
//                     <Form.Field>
//                         <label>Пароль</label>
//                         <input placeholder='Пароль' />
//                     </Form.Field>
//                     <Form.Field>
//                         <div className="ui fluid container center aligned">
//                             <Button icon labelPosition='left'>
//                                 <Icon name='sign-in' />
//                                     Войти
//                             </Button>
//                         </div>
//                     </Form.Field>
//                     <div className="ui horizontal divider">
//                         Или
//                     </div>
//                     <div className="ui fluid container center aligned">
//                         <Button onClick={this.handleClick} icon labelPosition='left'>
//                             <Icon name='plus' />
//                                 Регистрация
//                         </Button>
//                     </div>
//                 </Form>
//             </div>
//         )
//     }
// }