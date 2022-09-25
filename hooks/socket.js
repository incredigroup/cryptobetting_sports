import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

const SocketContext = React.createContext();

export const SocketProvider = ({ url='/', children }) => {
  const [socket, setSocket] = useState();
  
  useEffect(() => {
    const socketIo = io.connect(url);
    setSocket(socketIo);
    
    return () => {
      socketIo.disconnect();
    }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => React.useContext(SocketContext)