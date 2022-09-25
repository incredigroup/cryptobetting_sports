import React from 'react'
import ReactEmoji from 'react-emoji'
import renderHTML from "react-render-html";

export const Message = ({ message: { user, text }, name }) => {
    let isSentByCurrentUser = false;

    const trimmedName = name.trim().toLowerCase()

    if (user === trimmedName) {
        isSentByCurrentUser = true
    }

    return (
        isSentByCurrentUser
            ? (
                <div className="flex justify-end px-2 py-0 mt-1">
                    <div className="messageBox backgroundBlue">
                        <div className="float-right w-full tracking-normal text-white break-words">{renderHTML(text)}</div>
                    </div>
                    <p className="flex items-center pr-2 tracking-wide text-gray-900 bg-transparent">{trimmedName}</p>
                </div>
            )
            : (
                <div className="flex justify-start px-2 py-0 mt-1">
                    <p className="flex items-center pl-2 tracking-wide text-gray-900 bg-transparent">{user}</p>
                    <div className="messageBox backgroundLight">
                        <div className="float-left w-full tracking-normal text-gray-900 break-words">{renderHTML(text)}</div>
                    </div>
                </div>
            )
    )

};

// ReactEmoji.emojify(text)