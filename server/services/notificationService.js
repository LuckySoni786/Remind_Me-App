import nodemailer from "nodemailer";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
    "EMAIL_PASSWORD exists:",
    Boolean(process.env.EMAIL_PASSWORD)
);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Email service error:", error.message);
    } else {
        console.log("Email service is ready.");
    }
});

export const sendReminderEmail = async ({
    email,
    title,
    category,
    reminderType,
    triggeredAt
}) => {

    if (!email) {
        throw new Error("User email is required.");
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Reminder: ${title}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">

                <h2>Reminder Notification</h2>

                <p>
                    Your reminder is due.
                </p>

                <div>
                    <strong>Title:</strong> ${title}
                </div>

                <div>
                    <strong>Category:</strong> ${category}
                </div>

                <div>
                    <strong>Type:</strong> ${reminderType}
                </div>

                <div>
                    <strong>Time:</strong> ${new Date(
            triggeredAt
        ).toLocaleString()}
                </div>

                <p>
                    Please take the required action.
                </p>

            </div>
        `
    });
};



export const sendReminderEmailWithRetry = async (emailData) => {

    const maxAttempts = 3;
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {

        try {

            await sendReminderEmail(emailData);

            return {
                success: true,
                attempts: attempt,
                error: null
            };

        } catch (error) {

            lastError = error;

            console.error(
                `Email attempt ${attempt} failed:`,
                error.message
            );

            if (attempt < maxAttempts) {

                await new Promise((resolve) =>
                    setTimeout(resolve, 2000)
                );
            }
        }
    }

    return {
        success: false,
        attempts: maxAttempts,
        error: lastError?.message || "Email sending failed."
    };
};