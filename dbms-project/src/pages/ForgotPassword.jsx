import React, { useState } from "react";
import {
    VerifyEmail,
    VerifyOTP,
    PasswordReset,
    ResetSuccessful,
} from "../components/ForgotPasswordComponent";
import api from "../services/api";
import { toast } from "react-toastify";

const ForgotPassword = () => {
    const [formState, setFormState] = useState("verifyEmail");
    const [email, setEmail] = useState("");
    const [otp, setOTP] = useState("");

    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleOTPChange = (e) => setOTP(e.target.value);

    const handleVerifyEmailAndSendOTP = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email.");
            return;
        }

        try {
            const response = await api.post("/forgotpassword/sendotp", { email });

            if (response.status === 200) {
                toast.success("OTP sent to your email.");
                setFormState("verifyOTP");
            } else {
                toast.error("Failed to send OTP. Try again.");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    const renderForm = () => {
        switch (formState) {
            case "verifyEmail":
                return (
                    <VerifyEmail
                        email={email}
                        handleEmailChange={handleEmailChange}
                        handleVerifyEmailAndSentOTP={handleVerifyEmailAndSendOTP}
                        setFormState={setFormState}
                    />
                );

            case "verifyOTP":
                return (
                    <VerifyOTP
                        email={email}
                        otp={otp}
                        handleOTPChange={handleOTPChange}
                        setFormState={setFormState}
                    />
                );

            case "passwordReset":
                return <PasswordReset email={email} setFormState={setFormState} />;

            case "resetSuccessful":
                return <ResetSuccessful />;

            default:
                return (
                    <div className="text-center text-red-500 dark:text-red-400">
                        Something went wrong! Please refresh the page.
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                {renderForm()}
            </div>
        </div>
    );
};

export default ForgotPassword;
