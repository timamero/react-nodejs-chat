import app from './app';
import http from 'http';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { Server } from 'socket.io';
import videoHandlers from './pubsub/video';
import userHandler from './pubsub/users';
import privateChatHandler from './pubsub/privateChat';
import { listDatabases } from './demo';
import { createUser, getAllUsers, getUserByUsername } from './controllers/users';
// https://www.youtube.com/watch?v=fbYExfeFsI0&list=PL4RCxklHWZ9tRqdFK5YqoX3ju-Hk23Btu
//7:53
/*
 * Access variables in the .env file via process.env
*/
dotenv.config();

const port = 3001;
const server = http.createServer(app);

const main = async () => {
  const uri = process.env.MONGODB_URI

  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log('connected to MongoDB')

    // await createUser(client, {
    //   username: 'fennec'
    // })

    // await getUserByUsername(client, 'grogu')

    // await getUserByUsername(client, 'din')

    // await getUserByUsername(client, 'fennec')

    await getAllUsers(client)

  } catch(e) {
    console.log(e)
  } finally {
    await client.close()
  }
}

main().catch(console.error)

const options = {
  path: '/',
  serveClient: false,
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
}

const io: Server = new Server(server, options);

io.on('connection', (socket) => {
  console.log('a user connected');
  
  userHandler(socket, io);
  privateChatHandler(socket, io);
  videoHandlers.streamPeers(socket, io); // test

  socket.on('disconnect', () => {
    console.log('user disconnected');
  })
})

io.listen(port);