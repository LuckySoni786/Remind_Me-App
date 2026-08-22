import cron from "node-cron";
import Reminder from "../models/Reminder.js";

const startReminderScheduler = (io) => {

    cron.schedule("* * * * *", async () => {

        try {

            const reminders = await Reminder.find({
                isActive: true
            });

            console.log(
                `Active reminders found: ${reminders.length}`
            );

            for (const reminder of reminders) {

                console.log({
                    id: reminder._id,
                    title: reminder.title,
                    type: reminder.reminderType,
                    category: reminder.category
                });

                // ONE TIME REMINDER
                if (reminder.reminderType === "ONE_TIME") {

                    const now = new Date();

                    if (
                        reminder.scheduledAt &&
                        reminder.scheduledAt <= now &&
                        !reminder.lastTriggeredAt
                    ) {

                        console.log(
                            `Reminder is due: ${reminder.title}`
                        );

                        io.emit("reminder-due", {
                            reminderId: reminder._id,
                            title: reminder.title,
                            category: reminder.category
                        });

                        reminder.lastTriggeredAt = now;
                        reminder.isActive = false;

                        await reminder.save();
                    }
                }

                // DAILY REMINDER
                if (reminder.reminderType === "DAILY") {

                    const now = new Date();

                    const currentHours = String(now.getHours()).padStart(2, "0");
                    const currentMinutes = String(now.getMinutes()).padStart(2, "0");

                    const currentTime = `${currentHours}:${currentMinutes}`;

                    if (
                        reminder.time === currentTime &&
                        reminder.lastTriggeredAt?.toDateString() !== now.toDateString()
                    ) {

                        console.log(
                            `Daily reminder is due: ${reminder.title}`
                        );
                        io.emit("reminder-due", {
                            reminderId: reminder._id,
                            title: reminder.title,
                            category: reminder.category
                        });
                        reminder.lastTriggeredAt = now;

                        await reminder.save();
                    }
                }

                // HOURLY REMINDER
                if (reminder.reminderType === "HOURLY") {

                    const now = new Date();

                    const currentTime = now.getTime();

                    if (!reminder.lastTriggeredAt) {

                        console.log(
                            `Hourly reminder is due: ${reminder.title}`
                        );

                        reminder.lastTriggeredAt = now;

                        await reminder.save();

                    } else {

                        const lastTriggeredTime =
                            reminder.lastTriggeredAt.getTime();

                        const interval =
                            reminder.intervalMinutes * 60 * 1000;

                        if (currentTime - lastTriggeredTime >= interval) {

                            console.log(
                                `Hourly reminder is due: ${reminder.title}`
                            );

                            reminder.lastTriggeredAt = now;

                            await reminder.save();
                        }
                    }
                }

            }

        } catch (error) {

            console.error(
                "Reminder scheduler error:",
                error.message
            );

        }

    });

};

export default startReminderScheduler;