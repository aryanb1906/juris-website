"use client"

import { useState, useEffect } from "react"
import Chat from "@/components/Chat"
import History from "@/components/History"
import ThemeToggle from "@/components/ThemeToggle"

export default function Home() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  useEffect(() => {
    const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]")
    if (chatHistory.length > 0) {
      setCurrentChatId(chatHistory[0].id)
    }
  }, [])

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border">
        <History currentChatId={currentChatId} setCurrentChatId={setCurrentChatId} />
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b border-border flex justify-between items-center">
          <h1 className="text-2xl font-bold">Legal AI Chat</h1>
          <ThemeToggle />
        </header>
        <Chat currentChatId={currentChatId} />
      </main>
    </div>
  )
}

