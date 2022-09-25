import Image from 'next/image';

export default function OnlineBox({ avatar, username, isOnline, smallBox=false }) {
  return (
    <div>
      <div className="box-content bg-gray-700 border-4 border-blue-800 w-36" style={{width: smallBox ? 110 : 144 }}>
        <div className="flex items-center justify-center w-36 h-36 bg-gradient-to-br from-green-300 via-yellow-400 to-pink-500" style={{width: smallBox ? 110 : 144, height: smallBox ? 110 : 144 }}>
          <div className="flex items-center justify-center bg-white border-2 border-black" style={{width: smallBox ? 90 : 121, height: smallBox ? 90 : 121 }}>
            {avatar == 'waiting.png' ? (
              <i className="text-5xl text-black fa fa-spinner fa-spin"></i>
            ):(
              <Image src={`/images/avatars/${avatar}`} alt={username} width={smallBox ? 90 : 121} height={smallBox ? 90 : 121} />
            )}
          </div>
        </div>
        <h2 className="py-1 text-lg text-center">{username}</h2>
        <h2 className={`flex justify-center py-1 bg-gray-800 ${isOnline ? 'text-green-400' : 'text-gray-300'}`}>{isOnline ? 'ONLINE' : username === 'waiting...' ? '. . .' : 'OFFLINE'}</h2>
      </div>
    </div>
  )
}