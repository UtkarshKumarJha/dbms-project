import React, { useState } from 'react'
import { VerifyEmail, VerifyOTP, PasswordReset, ResetSuccessful } from '../components/ForgotPasswordComponent';
import api from '../services/api';

function ForgotPassword() {

    const [formState, setFormState] = useState("verifyEmail")

    const [email, setEmail] = useState("")
    const [otp, setOTP] = useState("")

    function handleEmailChange(e) {
        setEmail(e.target.value)
    }

    function handleOTPChange(e) {
        setOTP(e.target.value)
    }

    async function handleVerifyEmailAndSentOTP(e) {
        e.preventDefault();
        console.log("Verifying email:", email);

        try {
            const response = await api.post('/forgotpassword/sendotp', { email });
            console.log("Response:", response);
            if (response.status === 200) {
                setFormState("verifyOTP"); // Update formState on success
            } else {
                console.error("Unexpected response:", response);
            }
        } catch (error) {
            console.error("Error during API call:", error.response || error.message);
        }
    }

    function renderForm() {
        switch (formState) {
            case "verifyEmail":
                return <VerifyEmail
                    email={email}
                    handleEmailChange={handleEmailChange}
                    handleVerifyEmailAndSentOTP={handleVerifyEmailAndSentOTP}
                    setFormState={setFormState}
                />
            case "verifyOTP":
                return <VerifyOTP
                    email={email}
                    otp={otp}
                    handleOTPChange={handleOTPChange}
                    handleVerifyEmailAndSentOTP={handleVerifyEmailAndSentOTP}
                    setFormState={setFormState}
                />
            case "passwordReset":
                return <PasswordReset
                    email={email}
                    setFormState={setFormState}
                />
            case "resetSuccessful":
                return <ResetSuccessful />
            default:
                return <div>Something went wrong! Please refresh</div>
        }
    }

    return (
        <>
            {renderForm()}
        </>

    )
}

export default ForgotPassword