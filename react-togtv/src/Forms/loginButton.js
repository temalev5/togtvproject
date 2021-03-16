import React, { useEffect, useState } from 'react'
import { Icon, Button } from 'semantic-ui-react'

export default function LoginButton(props) {

    return(
        <div className="ui fluid container center aligned">
        <Button onClick={props.toggle} icon labelPosition='left'>
            {props.login ? (
                <>
                    <Icon name='sign-in' />Войти
                </>
            ) : (
                <>
                    <Icon name='plus' />Регистрация
                </>
            ) }
        </Button>
    </div>
    )

}