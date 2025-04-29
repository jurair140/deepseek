'use client'
import { assets } from "@/assets/assets";
import Message from "@/components/Message";
import PromptBox from "@/components/PromptBox";
import SideBar from "@/components/SideBar";
import Image from "next/image";
import { useState } from "react";

export default function Home() {

  const[expand,setExpand] = useState(false)
  const[message,setMessage] = useState([])
  const[isLoading,setIsLoading] = useState(false)

  return (
    <div>
      <div className="flex h-screen">
        
        <SideBar expand={expand} setExpand={setExpand}/>

        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
          <div className="md:hidden absolute px-4 top-6 flex items-center w-full justify-between">
            <Image
             onClick={()=> (expand ? setExpand(false) : setExpand(true))}
            className="rotate-180" src={assets.menu_icon} alt="menu-icon"/>
            <Image className="opacity-70" src={assets.chat_icon} alt="chat-icon"/>
          </div>

          {
            message.length === 0 ? (
              <>
               <div className="flex items-center gap-3">
                 <Image src={assets.logo_icon} alt="deep-seek-logo" className="h-16"/>
                 <p className="text-2xl font-medium">Hi, i am DeepSeek</p>
               </div>
               <p className="text-sm mt-2">How can i help you today?</p>
              </>
            ) : (
              <div>
                <Message role='user' content={'what the features of js'}/>
              </div>
            )
          }

          <PromptBox isLoading={isLoading} setIsLoading={setIsLoading}/>
          <p className="text-xs absolute bottom-1 text-gray-500">AI-generated, for reference only</p>

        </div>

      </div>
    </div>
  );
}
