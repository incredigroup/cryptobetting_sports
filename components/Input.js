import React from 'react';

export const Input = ({ message, setMessage, sendMessage }) => (
    <form className="flex justify-between border-solid border-t-2 border-gray-300">
        <textarea 
            className="h-16 p-3 w-full border-none text-lg text-gray-900" 
            type="text" 
            placeholder="Type a message..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' ? sendMessage(e) : null }
        />
        <button className="block p-5 text-white no-underline w-16 bg-blue-700" onClick={(e) => sendMessage(e)}><div><i className="fa fa-paper-plane" /></div></button>
    </form>
);