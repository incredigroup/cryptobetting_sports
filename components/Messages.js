import React from 'react'
import ScrollToBottom from 'react-scroll-to-bottom'
import { Message } from './Message'

export const Messages = ({ messages, name }) => (
    <ScrollToBottom className="flex-auto px-0 py-2 overflow-auto">
        {messages.map((message, i) => (
            <div key={i}>
                <Message message={message} name={name} />
            </div>
        ))}
    </ScrollToBottom>
);
