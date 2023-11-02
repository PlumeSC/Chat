import { useState } from "react"
import io from "socket.io-client"
import Chat from "./Chat";


const socket = io.connect("http://localhost:8000");

export default function App2 (){
    const [input,setInput] = useState({
        sender:``,
        receiver:``
    })
    const [chat,setChat] = useState(false)
    const handleInput =(e)=>{
        setInput({...input,[e.target.name]:e.target.value})
    }

    const join = ()=>{
        if(input.sender!==""&&input.receiver!==""){
            socket.emit('join_room',input)
            setChat(true)
        }
    }


    return(
        <div className="flex flex-col gap-5 justify-center items-center h-screen">
            {!chat?(
            <div className="border border-black p-8 flex flex-col gap-10 rounded-2xl">
                <div className="text-center">Live Chat</div>
                <input onChange={handleInput} name="sender" className="border border-black py-1 px-3 rounded-2xl" type="text" placeholder="userA"/>
                <input onChange={handleInput} name="receiver" className="border border-black py-1 px-3 rounded-2xl" type="text" placeholder="userB"/>
                <div className="flex justify-center">
                    <button onClick={join} className="bg-red-500 w-[120px] rounded-2xl py-1">lets Chat</button>
                </div>  
            </div>):(<Chat socket={socket} input={input}/>)}
        </div>
    )
}