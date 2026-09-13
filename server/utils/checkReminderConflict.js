import Reminder from "../models/Reminder.js";

const TIME_WINDOW_MINUTES = 5;

const timeToMinutes = (time) => {
    if (!time) return null;

    const [hours, minutes] = time.split(":").map(Number);

    return hours * 60 + minutes;
};

const isTimeOverlapping = (time1, time2) => {
    const minutes1 = timeToMinutes(time1);
    const minutes2 = timeToMinutes(time2);

    if (minutes1 === null || minutes2 === null) {
        return false;
    }

    return Math.abs(minutes1 - minutes2) <= TIME_WINDOW_MINUTES;
};

const hasCommonDay = (days1 = [], days2 = []) => {
    return days1.some((day) => days2.includes(day));
};

export const checkReminderConflict = async ({
    userId,
    reminderType,
    scheduledAt,
    time,
    daysOfWeek,
    intervalMinutes,
    customInterval,
    customIntervalUnit,
    excludeReminderId = null
}) => {

    const query = {
        user: userId,
        isActive: true
    };

    // Don't compare reminder with itself during update
    if (excludeReminderId) {
        query._id = {
            $ne: excludeReminderId
        };
    }

    const existingReminders = await Reminder.find(query);

    for (const reminder of existingReminders) {

        // ==========================================
        // ONE TIME
        // ==========================================

        if (
            reminderType === "ONE_TIME" &&
            reminder.reminderType === "ONE_TIME" &&
            scheduledAt &&
            reminder.scheduledAt
        ) {
            const newTime = new Date(scheduledAt).getTime();
            const existingTime =
                new Date(reminder.scheduledAt).getTime();

            const differenceMinutes =
                Math.abs(newTime - existingTime) / (1000 * 60);

            if (differenceMinutes <= TIME_WINDOW_MINUTES) {
                return reminder;
            }
        }

        // ==========================================
        // DAILY
        // ==========================================

        if (
            reminderType === "DAILY" &&
            reminder.reminderType === "DAILY"
        ) {
            if (isTimeOverlapping(time, reminder.time)) {
                return reminder;
            }
        }

        // ==========================================
        // WEEKLY
        // ==========================================

        if (
            reminderType === "WEEKLY" &&
            reminder.reminderType === "WEEKLY"
        ) {
            const commonDay = hasCommonDay(
                daysOfWeek,
                reminder.daysOfWeek
            );

            if (
                commonDay &&
                isTimeOverlapping(time, reminder.time)
            ) {
                return reminder;
            }
        }

        // ==========================================
        // HOURLY
        // ==========================================

        if (
            reminderType === "HOURLY" &&
            reminder.reminderType === "HOURLY"
        ) {
            if (
                intervalMinutes &&
                reminder.intervalMinutes &&
                intervalMinutes === reminder.intervalMinutes
            ) {
                return reminder;
            }
        }

        // ==========================================
        // CUSTOM
        // ==========================================

        if (
            reminderType === "CUSTOM" &&
            reminder.reminderType === "CUSTOM"
        ) {
            if (
                customInterval &&
                reminder.customInterval &&
                customInterval === reminder.customInterval &&
                customIntervalUnit === reminder.customIntervalUnit
            ) {
                return reminder;
            }
        }
    }

    return null;
};