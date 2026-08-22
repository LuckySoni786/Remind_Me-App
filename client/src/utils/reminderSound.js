const playReminderSound = () => {
    const audio = new Audio("/sounds/reminder.mp3");

    audio.play().catch((error) => {
        console.log("Unable to play reminder sound:", error);
    });
};

export default playReminderSound;