import { useEffect, useState } from "react"
import ScrollToBottom from "react-scroll-to-bottom";


var xhr = new XMLHttpRequest()

export default function Chat2({socket,input}){
    const [currentMessage,setCurrentMessage] = useState(``)
    const [messageList,setMessageList] = useState([])
    const [chatroom,setChatroom] = useState(``)
    const [type,setType] = useState(``)
    const [inputText,setInputText] = useState(``)
    

    const sendMessage = async ()=>{
        if(currentMessage!==``){
            const messageData = {
                chatroom,
                sender:input.sender,
                message:currentMessage,
                type,
                // time: `${new Date(Date.now()).getHours()} : ${new Date(Date.now()).getMinutes()}`
                send_date:new Date()
            }
            await socket.emit(`send_message`,messageData)
            setCurrentMessage(``)
            setInputText(``)
        }
    }
    
    const handleInput=async(e)=>{
        setType(`message`)
        setCurrentMessage(e.target.value)
        setInputText(e.target.value)
    }
    const handleReceiveMessage = (data) => {
        setMessageList((list) => [...list, data]);
    };
    const handleImg = (e)=>{
        const reader = new FileReader()
        setType(`image`)
        const file = e.target.files[0]
        reader.readAsDataURL(file)
        reader.onload = ()=>{
            let a = reader.result
            setCurrentMessage(a)
            console.log(typeof a);
        }
    }

    useEffect(() => {
        socket.on(`room_id`, (data) => {
            setChatroom(data.id)
        });
        socket.on('disconnect', () => {
          console.log('Socket disconnected')
        });

        socket.on(`all_chat`,({allChat})=>{
            const x = allChat.map((item,index)=>{
                return (
                    { 
                        chatroom:item.chatroom_id,
                        sender:item.sender.user,
                        message:item.message,
                        type:item.type,
                        send_date:item.send_date
                    }
                )
            })
            setMessageList((list) => [...x]);
        })
      
        socket.on(`receive_message`, handleReceiveMessage)
        
        return () => {
            socket.off(`receive_message`, handleReceiveMessage)
            socket.off(`all_chat`)
        };
      }, [socket]);
console.log(currentMessage);
    return (    
        <div className="bg-red-400 border border-black p-5 flex gap-5 flex-col max-w-[800px]">
            <div className="text-center">Live Chat</div>
            <ScrollToBottom className="bg-white">
                <div className="bg-white h-[400px] w-full">
                    {messageList.map((message,index)=>{
                        return (
                            <div key={index}>
                                {input.sender===message.sender?(
                                    message.type==='message'?(
                                        <Message flex="end" message={message}/>
                                        ):(
                                        <Imgage flex="end" message={message}/>)
                                    ):(
                                    message.type==='message'?(
                                        <Message flex="start" message={message}/>
                                        ):(
                                        <Imgage flex="start" message={message}/>)
                                )}
                            </div>
                        )
                    })}
                </div>
            </ScrollToBottom>
            <div className="flex gap-5">
                <input value={inputText} className="rounded-2xl py-1 px-4" placeholder="message..." onChange={handleInput} type="text" />
                <input type="file" onChange={handleImg}/>
                <button onClick={sendMessage} className="bg-blue-500 py-1 px-4 rounded-2xl">send</button>
            </div>
        </div>
    )
}



function Message({ flex, message }) {
    return (
        <div className={`flex flex-col items-${flex}`}>
            <div>{message.sender}</div>
            <div>{message.message}</div>
            {/* <div>{message.send_date}</div> */}
        </div>
    );

}
  

function Imgage({flex,message}){
    return(
        <div className={`flex flex-col items-${flex}`}>
            <div>{message.sender}</div>
            <img className="w-[150px]" src={message.message}/>
        </div>
    )
}