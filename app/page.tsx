"use client"
import Image from "next/image"
import LimitlessGPTLogo from "./assets/LimitlessGPTLogo.png"
import { useChat } from '@ai-sdk/react'
import { Message } from '@ai-sdk/react'
import Bubble from "./components/Bubble"
import LoadingBubble from "./components/LoadingBubble"
import PromptSuggestionsRow from "./components/PromptSuggestionsRow"
import ReactMarkdown from 'react-markdown';

const Home = () => {
    const { append, isLoading, messages, input, handleInputChange } = useChat()
    const noMessages = !messages || messages.length === 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
      
        const userMessage: Message = {
          id: crypto.randomUUID(),
          content: input,
          role: "user",
        };
      
        append(userMessage); // append user message

        // Reset the input field
        handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [...messages, userMessage] })
        });
      
        const data = await res.json();
      
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          content: data.result,
          role: "assistant"
        };
      
        append(assistantMessage);
      };

    const handlePrompt = async (promptText: string) => {
        const msg: Message = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user"
        }
        append(msg)

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: [...messages, msg] })
        })
        
        const data = await res.json()
        
        const assistantMessage: Message = {
            id: crypto.randomUUID(),
            content: data.result,
            role: "assistant"
        }
        
        append(assistantMessage)
    }

    return (
        <main>
            <div style={{ display: 'flex', justifyContent: 'center', margin: '0 0 1rem 0' }}>
                <Image src={LimitlessGPTLogo} width={280} alt="LimitlessGPT Logo" />
            </div>
            
            <section className={noMessages ? "" : "populated"}>
                {noMessages ? (
                    <>
                        <p className="starter-text">
                            Curious about how youth innovators around the world are tackling climate and environmental challenges?<br></br>
                            Powered by real voices and AI, this chatbot brings you inspiring insights from thousands of community-driven transcripts.
                        </p>
                        <br/>
                        <PromptSuggestionsRow onPromptClick={handlePrompt}/>
                    </>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <div key={`message-${index}`}>
                                <Bubble message={message}>
                                    {message.role === "assistant" ? (
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    ) : (
                                        message.content
                                    )}
                                </Bubble>
                            </div>
                        ))}
                        {isLoading && <LoadingBubble />}
                    </>
                )}
                
            </section>
            <form onSubmit={handleSubmit}>
                <input className="question-box" onChange={handleInputChange} value={input} placeholder="Ask me something..."/>
                <input type="submit"/>
            </form>
        </main>
    )
}

export default Home