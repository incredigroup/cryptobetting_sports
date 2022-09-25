import React from 'react';
import OnlineBox from './OnlineBox';

export function ParticipantContainer({ participants }) {

  return (
    <div className='flex lg:flex-col gap-3 text-white h-4/5'>
      {participants[0]?.name 
        ? <OnlineBox avatar={participants[0].avatar} username={participants[0].name} isOnline={participants[0].isOnline} smallBox={true} />
        : <OnlineBox avatar={'waiting.png'} username={'waiting...'} isOnline={false} smallBox={true} />
      }
      {participants[1]?.name 
        ? <OnlineBox avatar={participants[1].avatar} username={participants[1].name} isOnline={participants[1].isOnline} smallBox={true} />
        : <OnlineBox avatar={'waiting.png'} username={'waiting...'} isOnline={false} smallBox={true} />
      }
      {participants[2]?.name 
        ? <OnlineBox avatar={'referee.png'} username={participants[2].name} isOnline={true} smallBox={true} />
        : <OnlineBox avatar={'waiting.png'} username={'waiting...'} isOnline={false} smallBox={true} />
      }
    </div>
  )
}