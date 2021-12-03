import React, { useContext, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import './styles/app.scss'
import { SocketContext } from './context/socket';
import TestRoom from './pages/TestRoom';
import Home from './pages/Home';
import { User } from './app/features/types';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { setNewUser, setId } from './app/features/userSlice';
import { getAllActiveUsers } from './app/features/activeUsersSlice';
import { setModal } from './app/features/modalSlice';
import { resetNotification } from './app/features/notificationSlice';

const App: React.FC = () => {
  const dispatch = useAppDispatch()
  const socket = useContext(SocketContext)

  const activeUsers = useAppSelector(state => state.activeUsers.users)

  useEffect(() => {
    const usernameFromLocalStorage = window.localStorage.getItem('chat-username')

    // If username is found in localStorage, 
    // set the current user's username to the one found in localStorage
    if (usernameFromLocalStorage) {
      socket.emit('user entered', usernameFromLocalStorage)
      dispatch(setNewUser(usernameFromLocalStorage))
    }
  }, [dispatch, socket])

  // Manually connect to socket
  socket.connect()

  /*
   * Socket event listeners
  */
  socket.on('connect', () => {
    console.log('Connected to server')
  })
  socket.on('get user list', users => {
    // Get list of active users from server
    console.log('receiving user list', users)
    dispatch(getAllActiveUsers(users))
  })
  socket.on('get socket id', id => {
    // Setting the socket ID as the current user's ID
    console.log('setting app user id')
    dispatch(setId(id))
  })
  socket.on('invite requested', inviterId => {
    console.log('invite from ', inviterId)
    const inviter = activeUsers.find((user: User) => user.id === inviterId)

    if (inviter) {
        const modalData = {
        modalContent: `${inviter.username} has invited you to a private chat?`,
        confirmBtnText: 'Yes, accept invite.',
        declineBtnText: 'No, decline invite.',
        isActive: true,
        peerId: inviterId,
        socketEvent: 'invite accepted'  // Send server event when user invites another user to a private chat
      }

      dispatch(setModal(modalData))
    }  
  })
  socket.on('enter chat room', roomId => {
    console.log('enter room: ', roomId)
    dispatch(resetNotification())
  })
 
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/testroom' element={<TestRoom />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
