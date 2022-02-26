import { Server, Socket } from 'socket.io';
import { io as clientIo, Socket as ClientSocket} from 'socket.io-client';
import { createServer } from 'http';
import { Db } from 'mongodb';
import { client } from '../../src/database';
import user from '../../src/pubsub/users';

/**
 * Test users socket event publishers and subscribers
 */
describe("Pubsub - users", () => {
  let io: Server, serverSocket: Socket, clientSocket: ClientSocket;

  let db: Db;

  const port = 9000

  beforeAll((done) => {
    /* Connect to MongoDB test database */
    client.connect()
    db = client.db()

    /* Create HTTP server */
    const httpServer = createServer();
    const options = {
      path: '/',
      serveClient: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
    }

    /* Create server socket */
    io = new Server(httpServer, options);

    /* Create server and socket listener events */
    io.on("connection", (socket) => {
      serverSocket = socket;
      
      /* Initialize users socket event publishers and subscribers */
      user(serverSocket, io);
    });

    /* Create server listener */
    httpServer.listen(port);
    done()
  });

  beforeEach((done) => {
    /* Clear database before each test */
    db.collection('users').deleteMany({})
      .then(() => {
        /* Create client socket before each test */
        clientSocket = clientIo(`http://localhost:${port}`);

        clientSocket.on("connect", () => {     
          done()
        });
      })

  });

  afterEach((done) => {
    /* Disconnect client socket after each test */
    if (clientSocket.connected ) {
      clientSocket.disconnect()
    }
    done()
  })

  afterAll(async () => {
    /* Close connection to MongoDB test database */
    await client.close();

    /* Close connections to server and client sockets */
    io.close();
    clientSocket.close();
  });

  it("when server receives `user entered` event, the new username is added to the database", (done) => {
    const newUsername = 'Nora'
    const users = db.collection('users');

    clientSocket.emit('user entered', newUsername);  

    serverSocket.on('user entered', async (arg) => {
      const insertedUser = await users.findOne({ username: newUsername});
      expect(insertedUser).not.toBeNull()
      expect(insertedUser?.username).toEqual(newUsername)
      done()
    })
  });

  it("after server recieves `user entered` event, server sends `get user list` event and users list to all clients", (done) => {
    const newUsername = 'Nora'
    const users = db.collection('users');

    clientSocket.emit('user entered', newUsername);    

    clientSocket.on('get user list', (arg) => {
      expect(arg).not.toBeNull()
      expect(arg).toHaveLength(1)

      users.findOne({ username: newUsername})
        .then(user => {
          console.log('found user', user)
          expect(arg).toContainEqual(user)
          done()
        })
    })  
  });

  it("after server receives `user entered` event, server sends `get socket id` event and socketId to client that just connected", (done) => {
    const newUsername = 'Nora'
    const users = db.collection('users');
    
    clientSocket.emit('user entered', newUsername);  

    clientSocket.on('get socket id', (arg) => {
      expect(arg).not.toBeNull()

      users.findOne({ username: newUsername})
        .then(user => {
          expect(user?._id).toEqual(arg)
          done()
        })
    })
  });

  it("after client disconnects, the client data is removed from the database", (done) => {
    /* Connect user and check that user data is in database */
    const newUsername = 'Nora'
    const users = db.collection('users');
    
    clientSocket.emit('user entered', newUsername);  

    serverSocket.on('user entered', async (arg) => {
      const insertedUser = await users.findOne({ username: newUsername});
      expect(insertedUser).not.toBeNull()
      expect(insertedUser?.username).toEqual(newUsername)
      
      /* Disconnect client */
      clientSocket.disconnect()
    })

    /* Check that diconnected user is not in database */
    serverSocket.on('disconnect', async () => {
      console.log('test - user disconnected')
      const insertedUser = await users.findOne({ username: newUsername});
      expect(insertedUser).toBeNull()
      done()
    })
  })
})