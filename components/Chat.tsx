"use client"

import { useRef, useEffect, useState } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Message } from "ai"

interface ChatProps {
  currentChatId: string | null
}

export default function Chat({ currentChatId }: ChatProps) {
  const { messages, setMessages, input, setInput } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load chat history from localStorage when chat ID changes
  useEffect(() => {
    if (currentChatId) {
      const storedMessages = localStorage.getItem(`chat_${currentChatId}`)
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages))
      } else {
        setMessages([])
      }
    }
  }, [currentChatId, setMessages])

  // Save messages when they change
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(messages))
    }
  }, [currentChatId, messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, []) //Fixed useEffect dependency

  const formatAIResponse = (content: string) => {
    const sections = content.split("**").filter(Boolean)
    return sections
      .map((section, index) => {
        if (index % 2 === 0) {
          // This is a header
          return `<h3 class="font-bold mt-4 mb-2">${section}</h3>`
        } else {
          // This is content
          return `<p class="mb-4">${section
            .split("*")
            .map((part, i) => (i % 2 === 0 ? part : `<strong>${part}</strong>`))
            .join("")}</p>`
        }
      })
      .join("")
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!currentChatId) {
      // Create a new chat if none is selected
      const newChatId = Date.now().toString()
      const chatHistory = JSON.parse(localStorage.getItem("chatHistory") || "[]")
      const updatedHistory = [{ id: newChatId, title: `Chat ${chatHistory.length + 1}` }, ...chatHistory]

      // Save updated history and set the new chat ID
      localStorage.setItem("chatHistory", JSON.stringify(updatedHistory))

      // Reload page or update chat ID in parent component
      window.location.reload()
      return
    }

    if (!input.trim()) return

    const userMessage: Message = { id: Date.now().toString(), content: input, role: "user" }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("http://127.0.0.1:5000/api/legal-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      })

      const data = await res.json()
      const formattedResponse = formatAIResponse(data.response)
      const aiMessage: Message = { id: (Date.now() + 1).toString(), content: formattedResponse, role: "assistant" }
      setMessages((prevMessages) => [...prevMessages, aiMessage])
    } catch (error) {
      console.error("Error fetching AI response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, there was an error processing your request.",
        role: "assistant",
      }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentChatId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Select a chat from history or start a new one</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1 p-4">
        {messages.map((m) => (
          <div key={m.id} className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block p-2 rounded-lg ${
                m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {m.role === "assistant" ? <div dangerouslySetInnerHTML={{ __html: m.content }} /> : m.content}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="text-left mb-4">
            <span className="inline-block p-2 rounded-lg bg-muted">AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t border-border flex">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your legal query here..."
          className="flex-1 mr-2"
        />
        <Button type="submit" disabled={isLoading}>
          Send
        </Button>
      </form>
    </div>
  )
}

