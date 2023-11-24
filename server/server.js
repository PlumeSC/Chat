const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const {PrismaClient} = require(`@prisma/client`)

const prisma = new PrismaClient()

app.use(express.json({ limit: '50mb' }));
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5174",
        methods: ["GET", "POST"],
    },
});


io.on('connection',socket=>{
   
    socket.on(`join_room`,async data=>{
        const arr = []
        arr.push(data.sender)
        arr.push(data.receiver)
        arr.sort()
        const sender = await prisma.user.findFirst({where:{user:arr[0]}})
        const receiver = await prisma.user.findFirst({where:{user:arr[1]}})
        let room = await prisma.chatroom.findFirst({
            where:{
                AND:[{userA_id:sender.id},{userB_id:receiver.id}]
            }
        })
        if(!room){
            room = await prisma.chatroom.create({
                data:{
                    userA_id:sender.id,
                    userB_id:receiver.id
                }
            })  
        }
        const allChat = await prisma.message.findMany({
            where:{
                chatroom_id:room.id
            },
            include:{
                sender:true
            }
        })

        socket.join(room.id)
        
        io.to(room.id).emit(`room_id`,{id:room.id})
        io.to(room.id).emit(`all_chat`,{allChat})
    })

    
    socket.on(`send_message`,async(data)=>{
        const {chatroom,sender,message,type} = data
        const senderId = await prisma.user.findFirst({where:{user:sender}})
        await prisma.message.create({
            data:{
                chatroom_id:chatroom,
                sender_id:senderId.id,
                message:message,
                send_date:new Date(),
                type
            }
        })
        io.to(chatroom).emit(`receive_message`,data)
    })



    socket.on(`disconnect`,()=>{
        console.log(`${socket.id} Disconnect`);
    })
})



server.listen(8000,()=>console.log(`run`))





const createUser = async (user)=>{
    const data = await prisma.user.create({
        data:{
            user
        }
    })
    console.log(data);
}

createUser("123asd")
