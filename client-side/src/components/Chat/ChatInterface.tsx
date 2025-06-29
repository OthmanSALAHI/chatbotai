import React, { useState, useRef, useEffect } from 'react';
import ChatMessage, { Message } from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { ScrollArea } from '@/components/ui/scroll-area';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  const sendMessageToAPI = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      const response = await fetch('http://46.101.105.5:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const botResponse: Message = {
        id: Date.now().toString(),
        content: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message to API:', error);
      
      // Show error message to user
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    await sendMessageToAPI(content);
  };

  return (
    <div className="relative h-full">
      {/* Chat messages area with bottom padding for input */}
      <div className="absolute inset-0 pb-20">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Welcome to AI ChatBot
                  </h2>
                  <p className="text-muted-foreground">
                    Start a conversation by typing a message below.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map(message => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isTyping && <TypingIndicator />}
              </>
            )}
          </div>
        </ScrollArea>
      </div>
      
      {/* Fixed input at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border">
        <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default ChatInterface;
