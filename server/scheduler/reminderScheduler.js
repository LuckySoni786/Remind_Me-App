import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import ReminderHistory from "../models/ReminderHistory.js";

const createReminderHistory = async (reminder, triggeredAt) => {
    await ReminderHistory.create({
        reminder: reminder._id,
        user: reminder.user,
        title: reminder.title,
        category: reminder.category,
        reminderType: reminder.reminderType,
        status: "TRIGGERED",
        triggeredAt,
    });
};

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
                const now = new Date();

                const currentDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                );

                // START DATE CHECK
                if (reminder.startDate) {

                    const startDate = new Date(reminder.startDate);

                    const startOnly = new Date(
                        startDate.getFullYear(),
                        startDate.getMonth(),
                        startDate.getDate()
                    );

                    if (currentDate < startOnly) {
                        continue;
                    }
                }

                // END DATE CHECK
                if (reminder.endDate) {

                    const endDate = new Date(reminder.endDate);

                    const endOnly = new Date(
                        endDate.getFullYear(),
                        endDate.getMonth(),
                        endDate.getDate()
                    );

                    if (currentDate > endOnly) {
                        reminder.isActive = false;
                        await reminder.save();

                        console.log(
                            `Reminder expired: ${reminder.title}`
                        );
                        continue;
                    }
                }
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
                        await createReminderHistory(reminder, now);
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
                        await createReminderHistory(reminder, now);
                    }
                }

                // HOURLY REMINDER
                if (reminder.reminderType === "HOURLY") {

                    const now = new Date();

                    const currentHours = String(now.getHours()).padStart(2, "0");
                    const currentMinutes = String(now.getMinutes()).padStart(2, "0");

                    const currentTime = `${currentHours}:${currentMinutes}`;

                    // Check start and end time
                    if (
                        reminder.startTime &&
                        currentTime < reminder.startTime
                    ) {
                        continue;
                    }

                    if (
                        reminder.endTime &&
                        currentTime > reminder.endTime
                    ) {
                        continue;
                    }

                    if (!reminder.lastTriggeredAt) {

                        console.log(
                            `Hourly reminder is due: ${reminder.title}`
                        );

                        reminder.lastTriggeredAt = now;

                        await reminder.save();
                        await createReminderHistory(reminder, now);

                    } else {

                        const lastTriggeredTime =
                            reminder.lastTriggeredAt.getTime();

                        const interval =
                            reminder.intervalMinutes * 60 * 1000;

                        if (
                            now.getTime() - lastTriggeredTime >= interval
                        ) {

                            console.log(
                                `Hourly reminder is due: ${reminder.title}`
                            );

                            reminder.lastTriggeredAt = now;

                            await reminder.save();
                        }
                    }
                }

                // WEEKLY REMINDER
                if (reminder.reminderType === "WEEKLY") {

                    const now = new Date();
                    const days = [
                        "SUNDAY",
                        "MONDAY",
                        "TUESDAY",
                        "WEDNESDAY",
                        "THURSDAY",
                        "FRIDAY",
                        "SATURDAY"
                    ];

                    const currentDay = days[now.getDay()];
                    const currentHours = String(now.getHours()).padStart(2, "0");
                    const currentMinutes = String(now.getMinutes()).padStart(2, "0");

                    const currentTime = `${currentHours}:${currentMinutes}`;

                    // Check selected days

                    if (
                        !reminder.daysOfWeek ||
                        !reminder.daysOfWeek.includes(currentDay)
                    ) {
                        continue;
                    }

                    // Check reminder time
                    if (reminder.time !== currentTime) {
                        continue;
                    }

                    // Prevent multiple triggers on same day
                    if (
                        reminder.lastTriggeredAt &&
                        reminder.lastTriggeredAt.toDateString() === now.toDateString()
                    ) {
                        continue;
                    }


                    console.log(
                        `Weekly reminder is due: ${reminder.title}`
                    );

                    io.emit("reminder-due", {
                        reminderId: reminder._id,
                        title: reminder.title,
                        category: reminder.category
                    });

                    reminder.lastTriggeredAt = now;

                    await reminder.save();
                    await createReminderHistory(reminder, now);
                }

                // CUSTOM REMINDER
                if (reminder.reminderType === "CUSTOM") {

                    const now = new Date();

                    if (!reminder.lastTriggeredAt) {

                        console.log(
                            `Custom reminder is due: ${reminder.title}`
                        );

                        io.emit("reminder-due", {
                            reminderId: reminder._id,
                            title: reminder.title,
                            category: reminder.category
                        });

                        reminder.lastTriggeredAt = now;

                        await reminder.save();
                        await createReminderHistory(reminder, now);

                    } else {

                        const lastTriggeredTime =
                            reminder.lastTriggeredAt.getTime();

                        let intervalMilliseconds = 0;

                        if (reminder.customIntervalUnit === "MINUTES") {

                            intervalMilliseconds =
                                reminder.customInterval * 60 * 1000;

                        } else if (reminder.customIntervalUnit === "HOURS") {

                            intervalMilliseconds =
                                reminder.customInterval * 60 * 60 * 1000;

                        } else if (reminder.customIntervalUnit === "DAYS") {

                            intervalMilliseconds =
                                reminder.customInterval * 24 * 60 * 60 * 1000;
                        }

                        if (
                            intervalMilliseconds > 0 &&
                            now.getTime() - lastTriggeredTime >= intervalMilliseconds
                        ) {

                            console.log(
                                `Custom reminder is due: ${reminder.title}`
                            );

                            io.emit("reminder-due", {
                                reminderId: reminder._id,
                                title: reminder.title,
                                category: reminder.category
                            });

                            reminder.lastTriggeredAt = now;

                            await reminder.save();
                            await createReminderHistory(reminder, now);
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