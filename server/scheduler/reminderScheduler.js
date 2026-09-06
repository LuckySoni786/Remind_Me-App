import cron from "node-cron";
import Reminder from "../models/Reminder.js";
import ReminderHistory from "../models/ReminderHistory.js";
import User from "../models/User.js";
// import { sendReminderEmail } from "../services/notificationService.js";
import {
    sendReminderEmailWithRetry
} from "../services/notificationService.js";

const triggerReminder = async (reminder, io, now) => {

    const user = await User.findById(reminder.user)
        .select("email firstName notificationPreferences");

    if (!user) {
        console.log(
            `User not found for reminder: ${reminder.title}`
        );

        return null;
    }

    const browserEnabled =
        user.notificationPreferences?.browser ?? true;

    const emailEnabled =
        user.notificationPreferences?.email ?? true;

    console.log(
        `Reminder is due: ${reminder.title}`
    );

    const history = await ReminderHistory.create({
        reminder: reminder._id,
        user: reminder.user,
        title: reminder.title,
        category: reminder.category,
        reminderType: reminder.reminderType,
        status: "TRIGGERED",
        triggeredAt: now,
        notificationStatus: {
            browser: "NOT_SENT",
            email: "NOT_SENT"
        }
    });

    // ==========================================
    // BROWSER NOTIFICATION
    // ==========================================

   if (
    browserEnabled &&
    (
        reminder.notificationType === "BROWSER" ||
        reminder.notificationType === "BOTH"
    )
) {
    try {

        io.emit("reminder-due", {
            reminderId: reminder._id,
            historyId: history._id,
            title: reminder.title,
            category: reminder.category,
            reminderType: reminder.reminderType,
            triggeredAt: now
        });

        history.notificationStatus.browser = "SENT";

    } catch (error) {

        history.notificationStatus.browser = "FAILED";

        console.error(
            `Browser notification failed: ${error.message}`
        );
    }
}

    // ==========================================
    // EMAIL NOTIFICATION
    // ==========================================

    if (
        reminder.notificationType === "EMAIL" ||
        reminder.notificationType === "BOTH"
    ) {
        try {

            const user = await User.findById(reminder.user)
                .select("email firstName");

            if (!user || !user.email) {
                history.notificationStatus.email = "FAILED";
            } else {

              const emailResult = await sendReminderEmailWithRetry({
    email: user.email,
    title: reminder.title,
    category: reminder.category,
    reminderType: reminder.reminderType,
    triggeredAt: now
});

history.retry.emailAttempts = emailResult.attempts;
history.retry.lastEmailAttemptAt = new Date();

if (emailResult.success) {

    history.notificationStatus.email = "SENT";
    history.retry.emailError = null;

} else {

    history.notificationStatus.email = "FAILED";
    history.retry.emailError = emailResult.error;
}

                history.notificationStatus.email = "SENT";
            }

        } catch (error) {

            history.notificationStatus.email = "FAILED";

            console.error(
                `Email notification failed: ${error.message}`
            );
        }
    }
    await history.save();

    reminder.lastTriggeredAt = now;
    await reminder.save();

    // ==========================================
    // UPDATE LAST TRIGGERED
    // ==========================================

    reminder.lastTriggeredAt = now;

    await reminder.save();

    console.log(
        `Reminder triggered successfully: ${reminder.title}`
    );

    return history;
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

                // ==========================================
                // SNOOZED REMINDER
                // ==========================================

                const snoozedHistory = await ReminderHistory.findOne({
                    reminder: reminder._id,
                    user: reminder.user,
                    status: "SNOOZED",
                    snoozedUntil: { $lte: now }
                }).sort({ snoozedUntil: 1 });

                if (snoozedHistory) {

                    console.log(
                        `Snoozed reminder is due again: ${reminder.title}`
                    );

                    // Mark previous history as triggered again
                    snoozedHistory.status = "TRIGGERED";
                    snoozedHistory.snoozedUntil = null;

                    await snoozedHistory.save();

                    // Send notification
                    io.emit("reminder-due", {
                        reminderId: reminder._id,
                        historyId: snoozedHistory._id,
                        title: reminder.title,
                        category: reminder.category,
                        reminderType: reminder.reminderType,
                        triggeredAt: now
                    });

                    reminder.lastTriggeredAt = now;

                    await reminder.save();

                    console.log(
                        `Snoozed reminder triggered successfully: ${reminder.title}`
                    );

                    continue;
                }

                // ONE TIME REMINDER
                // ==========================================

                if (reminder.reminderType === "ONE_TIME") {

                    const now = new Date();

                    if (
                        reminder.scheduledAt &&
                        reminder.scheduledAt <= now &&
                        !reminder.lastTriggeredAt
                    ) {

                        console.log(
                            `One-time reminder is due: ${reminder.title}`
                        );

                        // Trigger notification + create history
                        await triggerReminder(reminder, io, now);

                        // Disable one-time reminder
                        reminder.isActive = false;

                        await reminder.save();

                        console.log(
                            `One-time reminder triggered successfully: ${reminder.title}`
                        );
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

                        await triggerReminder(reminder, io, now);

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

                        await triggerReminder(reminder, io, now);


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

                            await triggerReminder(reminder, io, now);

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


                    await triggerReminder(reminder, io, now);
                }

                // CUSTOM REMINDER
                if (reminder.reminderType === "CUSTOM") {

                    const now = new Date();

                    if (!reminder.lastTriggeredAt) {

                        console.log(
                            `Custom reminder is due: ${reminder.title}`
                        );

                        await triggerReminder(reminder, io, now);

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
                            now.getTime() - lastTriggeredTime >=
                            intervalMilliseconds
                        ) {

                            console.log(
                                `Custom reminder is due: ${reminder.title}`
                            );

                            await triggerReminder(reminder, io, now);
                        }
                    }
                }

            }

            const triggeredHistories = await ReminderHistory.find({
                status: "TRIGGERED"
            });

            for (const history of triggeredHistories) {

                const now = new Date();

                // Testing ke liye 1 minute
                const missedAfter = 60 * 1000;

                const elapsedTime =
                    now.getTime() - history.triggeredAt.getTime();

                if (elapsedTime >= missedAfter) {

                    history.status = "MISSED";

                    await history.save();

                    console.log(
                        `Reminder marked as MISSED: ${history.title}`
                    );
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