const otpGenerator = require('otp-generator')
const db = require('./db') // adjust if needed
const mailSender = require('./mailSender')

const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        console.log("Checking user for email:", email);

        const [userResult] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
        console.log("User found:", userResult);

        if (userResult.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        let otp = otpGenerator.generate(6, {
            digits: true,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("Generated OTP:", otp);

        await db.query('INSERT INTO otp (email, otp) VALUES (?, ?)', [email, otp]);
        console.log("OTP inserted into DB");

        const htmlBody = `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`;
        await mailSender(email, "Your OTP Code", htmlBody);
        console.log("OTP sent to email");

        return res.status(200).json({ success: "OTP sent successfully" });

    } catch (error) {
        console.error("sendOTP error: ", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const [rows] = await db.query("SELECT * FROM otp WHERE email = ? ORDER BY created_at DESC LIMIT 1", [email]);
        const latestOTP = rows[0];

        if (!latestOTP) {
            return res.status(404).json({ expired: "OTP has expired or not requested" });
        }

        if (latestOTP.otp === otp) {
            return res.status(200).json({ success: "OTP verified successfully, you can now reset your password!" });
        } else {
            return res.status(400).json({ notVerified: "OTP not verified" });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Server error" });
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
};
