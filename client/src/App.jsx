
import './App.css'
import ReminderListener from './components/ReminderListener.js';
import playReminderSound from "./utils/reminderSound";

function App() {
const testSound = () => {
    playReminderSound();
};
  return (
    <>
    <button onClick={testSound}>
    Test Reminder Sound
</button>
     <h1 className='text-4xl'>Hello </h1>
                 <ReminderListener />

    </>
  )
}

export default App
