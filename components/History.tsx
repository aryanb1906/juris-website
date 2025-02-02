"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatHistory {
  id: string
  title: string
}

interface HistoryProps {
  currentChatId: string | null
  setCurrentChatId: (id: string) => void
}

export default function History({ currentChatId, setCurrentChatId }: HistoryProps) {
  const [history, setHistory] = useState<ChatHistory[]>([])

  useEffect(() => {
    const storedHistory = localStorage.getItem("chatHistory")
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory))
    }
  }, [])

  const startNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: `Chat ${history.length + 1}`,
    }
    const updatedHistory = [newChat, ...history]
    setHistory(updatedHistory)
    localStorage.setItem("chatHistory", JSON.stringify(updatedHistory))
    setCurrentChatId(newChat.id)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <Button onClick={startNewChat} className="w-full">
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {history.map((chat) => (
          <Button
            key={chat.id}
            variant={currentChatId === chat.id ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setCurrentChatId(chat.id)}
          >
            {chat.title}
          </Button>
        ))}
      </ScrollArea>
    </div>
  )
}

