import React, { useEffect, useState } from 'react'
import { Image, Popup } from "semantic-ui-react";
import { useSocket } from '../socketContext'


export default function User(params) {

    return(
        <Popup content={params.user.username} trigger={        
        <div className="userIcon">
            <Image src='https://react.semantic-ui.com/images/wireframe/square-image.png' avatar />
            <Image className="userStatus" src={params.user.status ? 'https://img.icons8.com/emoji/48/000000/green-circle-emoji.png' : 'https://img.icons8.com/emoji/48/000000/orange-circle-emoji.png'}></Image>
        </div>} />
    )

}