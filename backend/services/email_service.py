import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from typing import Dict, Any, Optional
import logging
from datetime import datetime
import os

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self, smtp_server: str = "smtp.gmail.com", smtp_port: int = 587):
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.sender_email = os.getenv('SENDER_EMAIL', 'alerts@cleanairsight.com')
        self.sender_password = os.getenv('SENDER_PASSWORD', '')
        
    def get_aqi_color(self, aqi: int) -> str:
        """Get color based on AQI level"""
        if aqi <= 50:
            return "#10b981"  # Green
        elif aqi <= 100:
            return "#f59e0b"  # Yellow
        elif aqi <= 150:
            return "#ef4444"  # Red
        elif aqi <= 200:
            return "#9333ea"  # Purple
        else:
            return "#7c2d12"  # Maroon
    
    def get_aqi_category(self, aqi: int) -> str:
        """Get AQI category based on level"""
        if aqi <= 50:
            return "Good"
        elif aqi <= 100:
            return "Moderate"
        elif aqi <= 150:
            return "Unhealthy for Sensitive Groups"
        elif aqi <= 200:
            return "Unhealthy"
        elif aqi <= 300:
            return "Very Unhealthy"
        else:
            return "Hazardous"
    
    def get_health_advice(self, aqi: int) -> str:
        """Get health advice based on AQI level"""
        if aqi <= 50:
            return "Air quality is satisfactory. Great day for outdoor activities!"
        elif aqi <= 100:
            return "Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion."
        elif aqi <= 150:
            return "Sensitive groups should reduce outdoor activities. Everyone else can enjoy normal outdoor activities."
        elif aqi <= 200:
            return "Everyone should limit prolonged outdoor exertion. Sensitive groups should avoid outdoor activities."
        elif aqi <= 300:
            return "Everyone should avoid prolonged outdoor exertion. Consider staying indoors."
        else:
            return "Health warnings of emergency conditions. Everyone should avoid outdoor activities."
    
    def generate_email_template(self, aqi_data: Dict[str, Any], unsubscribe_link: str) -> str:
        """Generate HTML email template"""
        aqi = aqi_data.get('current_aqi', 0)
        city = aqi_data.get('city', 'Your Location')
        forecast_aqi = aqi_data.get('forecast_aqi', 0)
        
        color = self.get_aqi_color(aqi)
        category = self.get_aqi_category(aqi)
        forecast_category = self.get_aqi_category(forecast_aqi)
        health_advice = self.get_health_advice(aqi)
        
        html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily AQI Alert - CleanAirSight</title>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #3b82f6, #1e40af); color: white; padding: 30px 20px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 28px; }}
        .header p {{ margin: 10px 0 0 0; opacity: 0.9; }}
        .aqi-card {{ padding: 30px; text-align: center; color: white; background-color: {color}; }}
        .aqi-value {{ font-size: 72px; font-weight: bold; margin: 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }}
        .aqi-category {{ font-size: 24px; font-weight: 600; margin-bottom: 10px; }}
        .aqi-location {{ font-size: 18px; opacity: 0.9; }}
        .content {{ padding: 30px; }}
        .forecast-section {{ background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0; }}
        .forecast-section h3 {{ margin: 0 0 15px 0; color: #1e40af; font-size: 20px; }}
        .forecast-data {{ display: flex; justify-content: space-between; align-items: center; }}
        .forecast-aqi {{ font-size: 36px; font-weight: bold; color: {self.get_aqi_color(forecast_aqi)}; }}
        .health-section {{ background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; }}
        .health-section h4 {{ margin: 0 0 10px 0; color: #065f46; font-size: 18px; }}
        .health-section p {{ margin: 0; color: #047857; line-height: 1.6; }}
        .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }}
        .footer a {{ color: #3b82f6; text-decoration: none; }}
        .footer a:hover {{ text-decoration: underline; }}
        .timestamp {{ color: #94a3b8; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌤️ CleanAirSight Alert</h1>
            <p>Your Daily Air Quality Update</p>
        </div>
        
        <div class="aqi-card">
            <div class="aqi-location">{city}</div>
            <div class="aqi-value">{aqi}</div>
            <div class="aqi-category">{category}</div>
        </div>
        
        <div class="content">
            <div class="forecast-section">
                <h3>🔮 Tomorrow's Forecast</h3>
                <div class="forecast-data">
                    <div>
                        <div style="color: #64748b;">Expected AQI</div>
                        <div class="forecast-aqi">{forecast_aqi}</div>
                        <div style="color: #64748b; font-size: 14px;">{forecast_category}</div>
                    </div>
                    <div style="font-size: 48px;">📊</div>
                </div>
            </div>
            
            <div class="health-section">
                <h4>💡 Health Recommendation</h4>
                <p>{health_advice}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <p style="color: #64748b; margin-bottom: 15px;">Data powered by NASA TEMPO satellite and ground sensors</p>
                <div class="timestamp">
                    Report generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>CleanAirSight</strong> - Predicting Cleaner, Safer Skies</p>
            <p>
                <a href="http://localhost:3000">Visit Dashboard</a> | 
                <a href="{unsubscribe_link}">Unsubscribe</a>
            </p>
            <p style="font-size: 12px; margin-top: 15px;">
                This alert was sent because you subscribed to AQI updates for {city}.<br>
                If you no longer wish to receive these alerts, click the unsubscribe link above.
            </p>
        </div>
    </div>
</body>
</html>
"""
        return html_template
    
    async def send_aqi_alert(self, subscriber_email: str, aqi_data: Dict[str, Any]) -> bool:
        """Send AQI alert email to subscriber"""
        try:
            # Generate unsubscribe link
            unsubscribe_link = f"http://localhost:8000/api/unsubscribe/{subscriber_email}"
            
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = f"🌤️ AQI Alert: {aqi_data.get('city', 'Your Location')} - {aqi_data.get('current_aqi', 'N/A')} ({self.get_aqi_category(aqi_data.get('current_aqi', 0))})"
            message["From"] = self.sender_email
            message["To"] = subscriber_email
            
            # Generate HTML content
            html_content = self.generate_email_template(aqi_data, unsubscribe_link)
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                if self.sender_password:  # Only authenticate if password is provided
                    server.login(self.sender_email, self.sender_password)
                
                server.sendmail(self.sender_email, subscriber_email, message.as_string())
            
            logger.info(f"Successfully sent AQI alert to {subscriber_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {subscriber_email}: {e}")
            return False
    
    async def send_confirmation_email(self, subscriber_email: str, city: str) -> bool:
        """Send subscription confirmation email"""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = "✅ Welcome to CleanAirSight AQI Alerts!"
            message["From"] = self.sender_email
            message["To"] = subscriber_email
            
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }}
        .container {{ max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; padding: 40px; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .success-icon {{ font-size: 72px; margin-bottom: 20px; }}
        h1 {{ color: #1e40af; margin-bottom: 20px; }}
        .content {{ line-height: 1.6; color: #374151; }}
        .highlight {{ background-color: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">🎉</div>
            <h1>Welcome to CleanAirSight!</h1>
        </div>
        
        <div class="content">
            <p>Thank you for subscribing to daily AQI alerts for <strong>{city}</strong>!</p>
            
            <div class="highlight">
                <h3>What to expect:</h3>
                <ul>
                    <li>📧 Daily morning AQI updates</li>
                    <li>🔮 24-hour air quality forecasts</li>
                    <li>💡 Personalized health recommendations</li>
                    <li>🚨 Priority alerts for unhealthy air quality</li>
                </ul>
            </div>
            
            <p>Your first alert will arrive tomorrow morning. Stay safe and breathe easy!</p>
        </div>
        
        <div class="footer">
            <p><strong>CleanAirSight Team</strong></p>
            <p>Powered by NASA TEMPO satellite data</p>
        </div>
    </div>
</body>
</html>
"""
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                if self.sender_password:
                    server.login(self.sender_email, self.sender_password)
                
                server.sendmail(self.sender_email, subscriber_email, message.as_string())
            
            logger.info(f"Successfully sent confirmation email to {subscriber_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send confirmation email to {subscriber_email}: {e}")
            return False