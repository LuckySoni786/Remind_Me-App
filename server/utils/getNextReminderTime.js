export const getNextReminderTime = (reminder, now = new Date()) => {

const current = new Date(now);

// START DATE
if (reminder.startDate) {
    const startDate = new Date(reminder.startDate);

    if (current < startDate) {
        return startDate;
    }
}

// END DATE
if (reminder.endDate) {
    const endDate = new Date(reminder.endDate);

    endDate.setHours(23, 59, 59, 999);

    if (current > endDate) {
        return null;
    }
}

    // --------------------------------
    // ONE TIME
    // --------------------------------
    if (reminder.reminderType === "ONE_TIME") {

        if (
            reminder.scheduledAt &&
            new Date(reminder.scheduledAt) > current
        ) {
            return new Date(reminder.scheduledAt);
        }

        return null;
    }


    // --------------------------------
    // DAILY
    // --------------------------------
    if (reminder.reminderType === "DAILY") {

        if (!reminder.time) {
            return null;
        }

        const [hours, minutes] = reminder.time
            .split(":")
            .map(Number);

        const next = new Date(current);

        next.setHours(hours, minutes, 0, 0);

        if (next <= current) {
            next.setDate(next.getDate() + 1);
        }

        return next;
    }


    // --------------------------------
    // WEEKLY
    // --------------------------------
    if (reminder.reminderType === "WEEKLY") {

        if (
            !reminder.time ||
            !reminder.daysOfWeek?.length
        ) {
            return null;
        }

        const [hours, minutes] = reminder.time
            .split(":")
            .map(Number);

        const days = [
            "SUNDAY",
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY"
        ];

        for (let i = 0; i <= 7; i++) {

            const next = new Date(current);

            next.setDate(
                current.getDate() + i
            );

            next.setHours(hours, minutes, 0, 0);

            const dayName = days[next.getDay()];

            if (
                reminder.daysOfWeek.includes(dayName) &&
                next > current
            ) {
                return next;
            }
        }

        return null;
    }


    // --------------------------------
    // HOURLY
    // --------------------------------
    if (reminder.reminderType === "HOURLY") {

        if (!reminder.intervalMinutes) {
            return null;
        }

        const interval =
            reminder.intervalMinutes * 60 * 1000;

        let next;

        if (reminder.lastTriggeredAt) {

            next = new Date(
                new Date(reminder.lastTriggeredAt).getTime() +
                interval
            );

        } else if (reminder.startTime) {

            const [hours, minutes] =
                reminder.startTime
                    .split(":")
                    .map(Number);

            next = new Date(current);

            next.setHours(
                hours,
                minutes,
                0,
                0
            );

            if (next <= current) {
                next = new Date(
                    current.getTime() + interval
                );
            }

        } else {

            next = new Date(
                current.getTime() + interval
            );
        }

        // END TIME CHECK
        if (reminder.endTime) {

            const [endHours, endMinutes] =
                reminder.endTime
                    .split(":")
                    .map(Number);

            const end = new Date(next);

            end.setHours(
                endHours,
                endMinutes,
                0,
                0
            );

            if (next > end) {
                return null;
            }
        }

        return next;
    }


    // --------------------------------
    // CUSTOM
    // --------------------------------
    if (reminder.reminderType === "CUSTOM") {

        if (
            !reminder.customInterval ||
            !reminder.customIntervalUnit
        ) {
            return null;
        }

        let intervalMilliseconds;

        switch (reminder.customIntervalUnit) {

            case "MINUTES":
                intervalMilliseconds =
                    reminder.customInterval *
                    60 *
                    1000;
                break;

            case "HOURS":
                intervalMilliseconds =
                    reminder.customInterval *
                    60 *
                    60 *
                    1000;
                break;

            case "DAYS":
                intervalMilliseconds =
                    reminder.customInterval *
                    24 *
                    60 *
                    60 *
                    1000;
                break;

            default:
                return null;
        }

        if (reminder.lastTriggeredAt) {

            return new Date(
                new Date(reminder.lastTriggeredAt).getTime() +
                intervalMilliseconds
            );

        }

        if (reminder.startDate) {

            const startDate =
                new Date(reminder.startDate);

            if (startDate > current) {
                return startDate;
            }
        }

        return new Date(
            current.getTime() +
            intervalMilliseconds
        );
    }


    return null;
};