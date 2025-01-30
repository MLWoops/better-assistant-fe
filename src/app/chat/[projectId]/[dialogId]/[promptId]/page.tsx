'use client'

import { AxiosProgressEvent } from 'axios';
import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import axiosInstance from '@/lib/utils';

type Message = {
  content: string
  role: string
}

type Prompt = {
  _id: string
  prompt_content: string
}

type RequestData = {
  dialog_id: string
  messages: Message[]
  user_input: string
}

export default function Chatbot() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const dialogId = params?.dialogId as string;
  const promptId = params?.promptId as string;

  const [prompt, setPrompt] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedResponse, setStreamedResponse] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [, forceRender] = useState(0);


  useEffect(() => {
    axiosInstance.get(`/dialog/${projectId}?dialogId=${dialogId}`).then((response) => {
      setMessages(response.data.dialog.dialog_content)
    })

    axiosInstance.get(`/prompts/${projectId}`).then((response) => {
      response.data.prompts.forEach((prompt: Prompt) => {
        if (prompt._id === promptId) {
          setPrompt(prompt.prompt_content)
        }
      })
    })
  }, [])


  const scrollToBottom = (
    container: HTMLElement | null,
    smooth = false,
  ) => {
    if (container?.children.length) {
      const lastElement = container?.lastChild as HTMLElement

      lastElement?.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
        inline: 'nearest',
      })
    }
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollToBottom(scrollAreaRef.current)
    }
    forceRender((prev) => prev + 1);
  }, [messages, streamedResponse])

  const clearChat = () => {
    setIsStreaming(false);
    setStreamedResponse("");
    forceRender((prev) => prev + 1);
  }

  const handleSendMessage = async () => {
    setInputMessage('')
    setMessages((prev) => [
      ...prev,
      { content: inputMessage, role: 'user' },
    ])

    const newMessage = [
      { content: prompt, role: 'system' },
      ...messages,
      { content: inputMessage, role: 'user' },
    ]

    const data: RequestData = {
      dialog_id: dialogId,
      messages: newMessage,
      user_input: inputMessage,
    }
    await getStreamingResponse(data).then((response) => {
      const msg: string = response.data
      let accumulatedResponse = "";
      msg.split("\n\n").forEach((line: string) => {
        let streamingResponse = line.slice(6); // "data: " 제거
        if (streamingResponse.startsWith(" ")) {
          streamingResponse = " " + streamingResponse.trim();
        }
        else if (streamingResponse.endsWith(" ")) {
          streamingResponse = streamingResponse.trim() + " ";
        }
        else {
          streamingResponse = streamingResponse.trim();
        }

        accumulatedResponse += streamingResponse;
      })
      setMessages((prev) => [
        ...prev,
        { content: accumulatedResponse, role: 'assistant' },
      ])
    }).then(() => {
      clearChat()
    }).catch((error) => {
      clearChat()
      if (error.response.data === "Too Many Requests") {
        alert("Too many requests. Please try again later.");
        setMessages(prev => prev.slice(0, prev.length - 1))
        setInputMessage(data.user_input)
      }
    })
  }

  const getStreamingResponse = async (data: RequestData) => {
    setIsStreaming(true)
    let accumulatedResponse = "";

    const onDownloadProgress = (progressEvent: AxiosProgressEvent) => {
      const currentChunk = progressEvent.event.target.responseText;
      const lines = currentChunk.split("\n\n");
      lines.forEach((line: string) => {
        if (line.startsWith("data: ")) {
          console.log(line);
          let streamingResponse = line.slice(6); // "data: " 제거
          if (streamingResponse.startsWith(" ")) {
            streamingResponse = " " + streamingResponse.trim();
          }
          else if (streamingResponse.endsWith(" ")) {
            streamingResponse = streamingResponse.trim() + " ";
          }
          else {
            streamingResponse = streamingResponse.trim();
          }

          accumulatedResponse += streamingResponse;
          setStreamedResponse(accumulatedResponse);
          forceRender((prev) => prev + 1);
        }
      });
    }

    return await axiosInstance.post('/generate', data, {
      responseType: "text",
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      onDownloadProgress
    })
  };

  return (
    <div className="flex flex-col flex-grow">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="max-w-2xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'
                }`}
            >
              <span
                className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
              >
                {message.content}
              </span>
            </div>
          ))}
          {isStreaming ? (
            <div className="text-left">
              <span className="inline-block p-2 rounded-lg bg-muted text-muted-foreground some">
                {streamedResponse}
              </span>
            </div>
          ) : null}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="max-w-2xl mx-auto flex items-center">
          <Input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') { handleSendMessage() } }}
            className="flex-grow mr-2"
            aria-label="Chat message input"
          />
          <Button disabled={isStreaming || inputMessage === ''} aria-label="Send message" className="mr-2" onClick={handleSendMessage}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
          <Dialog>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Audio Message</DialogTitle>
                <DialogDescription>
                  Click the button below to start/stop recording your message.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}