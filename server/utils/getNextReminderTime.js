export const getNextReminderTime = (reminder, now = new Date()) => {

    const current = new Date(now);

    // --------------------------------
    // HELPER: DATE ONLY
    // --------------------------------
    const getDateOnly = (date) => {
        const result = new Date(date);

        result.setHours(0, 0, 0, 0);

        return result;
    };


    // --------------------------------
    // START DATE
    // --------------------------------
    let startDate = null;

    if (reminder.startDate) {
        startDate = getDateOnly(reminder.startDate);
    }


    // --------------------------------
    // END DATE
    // --------------------------------
    let endDate = null;

    if (reminder.endDate) {
        endDate = getDateOnly(reminder.endDate);

        endDate.setHours(23, 59, 59, 999);

        if (current > endDate) {
            return null;
        }
    }


    // --------------------------------
    // ONE TIME
    // --------------------------------
    if (reminder.reminderType === "ONE_TIME") {

        if (!reminder.scheduledAt) {
            return null;
        }

        const scheduledAt = new Date(reminder.scheduledAt);

        // Before start date
        if (startDate && getDateOnly(scheduledAt) < startDate) {
            return null;
        }

        // After end date
        if (endDate && scheduledAt > endDate) {
            return null;
        }

        if (scheduledAt > current) {
            return scheduledAt;
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

        let next = new Date(current);

        next.setHours(hours, minutes, 0, 0);


        // If today is before start date,
        // schedule on start date
        if (startDate && getDateOnly(current) < startDate) {

            next = new Date(startDate);

            next.setHours(hours, minutes, 0, 0);

        } else if (next <= current) {

            next.setDate(next.getDate() + 1);
        }


        // END DATE
        if (endDate && next > endDate) {
            return null;
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

        // Start searching from today
        // or from start date
        let searchDate = new Date(current);

        if (
            startDate &&
            getDateOnly(current) < startDate
        ) {
            searchDate = new Date(startDate);
        }

        for (let i = 0; i <= 7; i++) {

            const next = new Date(searchDate);

            next.setDate(
                searchDate.getDate() + i
            );

            next.setHours(hours, minutes, 0, 0);

            const dayName = days[next.getDay()];

            if (
                !reminder.daysOfWeek.includes(dayName)
            ) {
                continue;
            }

            if (next <= current) {
                continue;
            }

            // END DATE
            if (endDate && next > endDate) {
                return null;
            }

            return next;
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


        // --------------------------------
        // LAST TRIGGERED EXISTS
        // --------------------------------
        if (reminder.lastTriggeredAt) {

            next = new Date(
                new Date(reminder.lastTriggeredAt).getTime() +
                interval
            );

        }

        // --------------------------------
        // NO LAST TRIGGERED
        // USE START TIME AS ANCHOR
        // --------------------------------
        else if (reminder.startTime) {

            const [hours, minutes] =
                reminder.startTime
                    .split(":")
                    .map(Number);

            // If today is before start date,
            // use start date as anchor
            if (
                startDate &&
                getDateOnly(current) < startDate
            ) {

                next = new Date(startDate);

                next.setHours(
                    hours,
                    minutes,
                    0,
                    0
                );

            } else {

                next = new Date(current);

                next.setHours(
                    hours,
                    minutes,
                    0,
                    0
                );

                // If start time has already passed,
                // calculate next interval from start time
                if (next <= current) {

                    const elapsed =
                        current.getTime() -
                        next.getTime();

                    const intervalsPassed =
                        Math.floor(
                            elapsed / interval
                        ) + 1;

                    next = new Date(
                        next.getTime() +
                        intervalsPassed * interval
                    );
                }
            }
        }

        // --------------------------------
        // NO START TIME
        // --------------------------------
        else {

            next = new Date(
                current.getTime() + interval
            );
        }


        // --------------------------------
        // END TIME
        // --------------------------------
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


        // --------------------------------
        // END DATE
        // --------------------------------
        if (endDate && next > endDate) {
            return null;
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


        let next;


        // --------------------------------
        // LAST TRIGGERED EXISTS
        // --------------------------------
        if (reminder.lastTriggeredAt) {

            next = new Date(
                new Date(reminder.lastTriggeredAt).getTime() +
                intervalMilliseconds
            );
        }


        // --------------------------------
        // FIRST TRIGGER
        // START DATE + START TIME
        // --------------------------------
        else {

            let anchor = null;

            if (reminder.startDate) {

                anchor = new Date(
                    reminder.startDate
                );

                // Use startTime if available
                if (reminder.startTime) {

                    const [hours, minutes] =
                        reminder.startTime
                            .split(":")
                            .map(Number);

                    anchor.setHours(
                        hours,
                        minutes,
                        0,
                        0
                    );

                } else {

                    anchor.setHours(
                        0,
                        0,
                        0,
                        0
                    );
                }
            }

            // If anchor exists
            if (anchor) {

                if (anchor > current) {

                    next = anchor;

                } else {

                    next = new Date(
                        anchor.getTime() +
                        intervalMilliseconds
                    );

                    // If calculated next time
                    // is still in the past,
                    // move forward by intervals
                    if (next <= current) {

                        const elapsed =
                            current.getTime() -
                            anchor.getTime();

                        const intervalsPassed =
                            Math.floor(
                                elapsed /
                                intervalMilliseconds
                            ) + 1;

                        next = new Date(
                            anchor.getTime() +
                            intervalsPassed *
                            intervalMilliseconds
                        );
                    }
                }

            } else {

                next = new Date(
                    current.getTime() +
                    intervalMilliseconds
                );
            }
        }


        // --------------------------------
        // END TIME
        // --------------------------------
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


        // --------------------------------
        // END DATE
        // --------------------------------
        if (endDate && next > endDate) {
            return null;
        }

        return next;
    }


    return null;
};