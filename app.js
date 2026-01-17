const express = require('express')  
const mongoose = require('mongoose')  
const users = require('./moduls/Users');
const cors = require('cors')

const app = express()
require('dotenv').config();
const { createServer } = require('http');
const { Server } = require('socket.io');

const { connectDB } = require('./lib/mongodb')

const os = require('os');

const emailRoutes = require('./routes/emailRoutes')
const authRoutes = require('./routes/authRoutes')
const changeUserData = require('./routes/changeUserData')
const filesRoutes = require('./routes/filesRoutesV2.0')
const userData = require('./routes/userData')
const userFileStory = require('./routes/userFileStory');

const server = createServer(app);
const io = new Server(server, {
    connectionStateRecovery: {},
    cors: {
        // Разрешаем подключения с клиентского домена/порта
        origin: "https://fileshare-one-rust.vercel.app", // <-- Не в коем случи не ставить в конце "/" !!!!!!
        methods: ["GET", "POST"],
    }
});


io.on('connection', async (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('pingfilesShareId', async (shareId) => {
        socket.join(shareId);
        await connectDB();

        const user = await users.findOne({shareId: shareId}) 
        const files = user.filse
        
        io.to(shareId).emit("files", files);
    });

    socket.on('pingfilesUserName', async (username) => {
        await connectDB();
        const user = await users.findOne({username: username}) 

        socket.join(user.shareId);

        const files = user.filse
        
        io.to(user.shareId).emit("files", files);
    });

});


app.use(cors())

app.use(express.json());
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ limit: '1000mb', extended: true }));

app.use('/api', emailRoutes, changeUserData, filesRoutes, userData, userFileStory, authRoutes)

// mongoose.set('bufferCommands', false);

mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
    })
    .then(() => {
        console.log('mongoose connect successes')
    })
    .catch ((err) => {
        console.log(err)
    })



server.listen(process.env.PORT_API, () => {
    console.log("API and Soket IO http://localhost:" + process.env.PORT_API);
});


// server.listen(process.env.PORT_API, () => {
//     console.log("Soket IO http://localhost:" + process.env.PORT_API);
// });

// app.listen(process.env.PORT_API, () => {
//     console.log("API http://localhost:" + process.env.PORT_API);
// })

console.log(os.hostname());
console.log(os.networkInterfaces());
console.log(os.userInfo());
console.log(os.version());