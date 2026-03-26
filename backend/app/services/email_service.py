# backend/app/services/email_service.py

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings 

def send_otp_email(to_email: str, otp_code: str):
    """Send an OTP code to the user's email."""

    subject = "Your verification code"
    body = f"""
    <h2>Your verification code</h2>
    <p>Use this code to complete your registration:</p>
    <h1 style="letter-spacing: 8px;">{otp_code}</h1>
    <p>This code expires in 10 minutes.</p>
    <p>If you did not request this, ignore this email.</p>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.MAIL_FROM
    msg["To"] = to_email
    msg.attach(MIMEText(body, "html"))

    with smtplib.SMTP(settings.MAIL_HOST, settings.MAIL_PORT) as server:
        server.starttls()  # encrypt the connection
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.sendmail(settings.MAIL_FROM, to_email, msg.as_string())