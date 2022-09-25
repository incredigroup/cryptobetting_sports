import { InfoBar } from './InfoBar';
import { Input } from './Input';
import { Messages } from './Messages';

export const Chat = ({ name, message, setMessage, messages, sendMessage }) => {
  
  return (
    <div className="flex flex-col justify-between bg-white rounded-lg lg:w-96" style={{ height: 610 }}>
      <InfoBar room={'Discussion'} />
      <Messages messages={messages} name={name} />
      <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
    </div>
  );
}