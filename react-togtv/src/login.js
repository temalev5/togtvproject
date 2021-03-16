import React, {useContext, useState} from 'react'

const AlertContext = React.createContext()

export const useAlert = () => {
  return useContext(AlertContext)
}

export const LoginProvider = ({ children }) => {
    const [login, setLogin] = useState(true)

    const toggle = () => { setLogin(prev => !prev); }
    
    return (
    <AlertContext.Provider value={{
        login,
        toggle,
        }}>
    { children }
    </AlertContext.Provider>)
}
