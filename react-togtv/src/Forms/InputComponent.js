import React from 'react'
import { Form } from 'semantic-ui-react'

export default function InputComponent(params) {
    
    return(
    <Form.Field>
        <label>{params.text}</label>
        <input name={params.name} type={params.type} ref={params.follow} placeholder={params.text} />
    </Form.Field>
    )
}