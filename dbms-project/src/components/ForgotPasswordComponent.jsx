import React, { useState } from "react";
import { Input, Button } from "@nextui-org/react";
import { Link } from "react-router-dom";
import axios from "axios";
import api from "../services/api";

export function VerifyEmail({ email, handleVerifyEmailAndSentOTP, handleEmailChange, setFormState }) {
    return (
        <form
            onSubmit={(e) => handleVerifyEmailAndSentOTP(e)}
            className="flex flex-col items-center justify-center px-4 sm:px-8 lg:px-24 py-16 space-y-6 max-w-2xl mx-auto h-screen"
        >
            <h1 className="text-2xl text-white sm:text-4xl lg:text-5xl font-semibold text-center">Forgot Password?</h1>
            <p className="text-gray-500 font-medium text-center">No worries, we'll reset your password and help you create a new one.</p>

            <div className="w-full">
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter your email"
                />
            </div>

            <Button
                type="submit"
                variant="solid"
                color="success"
                className="w-full h-12 text-white font-semibold rounded-md text-base sm:text-lg"
            >
                Reset Password
            </Button>

            <div>
                <Link to="/login" className="text-slate-400 font-medium text-sm sm:text-base">← Back to Login</Link>
            </div>
        </form>
    );
}

export function VerifyOTP({ email, otp, handleVerifyEmailAndSentOTP, handleOTPChange, setFormState }) {
    async function handleVerifyOTP(e) {
        e.preventDefault();
        try {
            const response = await api.post('/forgotpassword/verifyotp', { email, otp });
            if (response.status === 200) setFormState("passwordReset");
        } catch (error) {
            console.error(error.response || error);
        }
    }

    function handleResendOTP(e) {
        handleVerifyEmailAndSentOTP(e);
    }

    return (
        <form
            onSubmit={handleVerifyOTP}
            className="flex flex-col items-center justify-center px-4 sm:px-8 lg:px-24 py-16 space-y-6 max-w-2xl mx-auto h-screen"
        >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-center text-white">Check Your Email</h1>
            <p className="text-gray-500 font-medium text-center">Enter the OTP sent to your inbox.</p>

            <div className="w-full">

                <input
                    id="number"
                    type="number"
                    value={otp}
                    onChange={handleOTPChange}
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter the OTP"
                />
            </div>

            <Button
                type="submit"
                variant="solid"
                color="success"
                className="w-full h-12 text-white font-semibold rounded-md text-base sm:text-lg"
            >
                Proceed
            </Button>

            <div className="text-center">
                <p className="text-gray-600 font-medium text-sm sm:text-base">Didn't receive the email?</p>
                <p
                    className="text-blue-300 font-medium text-sm sm:text-base cursor-pointer"
                    onClick={handleResendOTP}
                >
                    Click to resend
                </p>
            </div>

            <div>
                <Link to="/login" className="text-slate-400 font-medium text-sm sm:text-base">← Back to Login</Link>
            </div>
        </form>
    );
}

export function PasswordReset({ email, setFormState }) {
    const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });

    function handlePasswordChange(e) {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    }

    async function handlePasswordReset(e) {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            console.error("Passwords do not match");
            return;
        }

        try {
            const response = await api.post("/forgotpassword/resetpassword", {
                email,
                newPassword: passwords.newPassword,
                confirmPassword: passwords.confirmPassword,
            });
            if (response.status === 200) setFormState("resetSuccessful");
        } catch (error) {
            console.error(error.response || error);
        }
    }

    return (
        <form
            onSubmit={handlePasswordReset}
            className="flex flex-col items-center justify-center px-4 sm:px-8 lg:px-24 py-16 space-y-6 max-w-2xl mx-auto h-screen"
        >
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-center text-white">Set New Password</h1>
            <p className="text-gray-500 font-medium text-center">Your new password must be different from previously used passwords.</p>

            <div className="w-full space-y-4">
                <input
                    id="newPassword"
                    type="password"
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={(e) =>
                        setPasswords((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                        }))
                    }
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Enter new password"
                />
                <input
                    id="confirmPassword"
                    type="password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={(e) =>
                        setPasswords((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                        }))
                    }
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="Confirm password"
                />

            </div>

            <Button
                type="submit"
                variant="solid"
                color="success"
                className="w-full h-12 text-white font-semibold rounded-md text-base sm:text-lg"
            >
                Reset Password
            </Button>

            <div>
                <Link to="/login" className="text-slate-400 font-medium text-sm sm:text-base">← Back to Login</Link>
            </div>
        </form>
    );
}

export function ResetSuccessful() {
    return (
        <div className="flex flex-col items-center justify-center px-4 sm:px-8 lg:px-24 py-16 space-y-6 max-w-2xl mx-auto h-screen">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-center text-black">Password Reset Successfully!</h1>

            <Link to="/login">
                <Button
                    variant="solid"
                    color="primary"
                    className="text-black font-semibold text-base sm:text-lg"
                >
                    ← Back to Login
                </Button>
            </Link>
        </div>
    );
}
