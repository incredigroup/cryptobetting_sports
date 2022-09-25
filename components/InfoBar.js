import React from 'react';

export const InfoBar = ({ room }) => (
  <div>
    <div className="flex items-center justify-between h-16 bg-blue-600">
      <div className="flex items-center text-white ml-3">
        <img className="onlineIcon mr-2" src='/icons/onlineIcon.png' alt="online icon" />
        <h3>{room}</h3>
      </div>
      <div className="flex justify-end mr-3">
        <a href="/compete"><img src='/icons/closeIcon.png' alt="close icon" /></a>
      </div>
    </div>
  </div>
);