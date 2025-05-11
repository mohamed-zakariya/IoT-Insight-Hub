package com.example.dxc_backend.util;

public class EmailTemplateUtil {

    public static String buildAlertHtml(String type, String metric, float value, float threshold, String direction) {
        return """
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background: linear-gradient(135deg, #eef2f7, #cdddf0);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background-color: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                    padding: 30px;
                }
                .header {
                    text-align: center;
                }
                .header img {
                    width: 140px;
                    margin-bottom: 20px;
                }
                .title {
                    font-size: 24px;
                    color: #222;
                    margin-bottom: 20px;
                }
                .alert-details {
                    font-size: 16px;
                    color: #333;
                }
                .alert-details p {
                    margin: 12px 0;
                    display: flex;
                    align-items: center;
                }
                .alert-details img.icon {
                    width: 28px;
                    height: 28px;
                    margin-right: 12px;
                }
                .status {
                    font-weight: bold;
                    font-size: 18px;
                    color: #d9534f;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 12px;
                    color: #999;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="title">🚨 Sensor Alert Notification</div>
                </div>
                <div class="alert-details">
                    <p><img class="icon" src="https://img.icons8.com/color/48/satellite.png" alt="Sensor Icon"><strong>Sensor Type:</strong>&nbsp;%s</p>
                    <p> 📊 <strong>Metric:</strong>&nbsp;%s</p>
                    <p> 📈 <strong>Current Value:</strong>&nbsp;%.2f</p>
                    <p><img class="icon" src="https://img.icons8.com/color/48/speed.png" alt="Threshold Icon"><strong>Threshold:</strong>&nbsp;%.2f</p>
                    <p><img class="icon" src="https://img.icons8.com/color/48/error--v1.png" alt="Status Icon"><strong>Status:</strong>&nbsp;%s threshold</p>
                </div>
                <div class="footer">
                    &copy; 2025 DXC Technology – Smart City Alert System
                </div>
            </div>
        </body>
        </html>
        """.formatted(type, metric, value, threshold, direction);
    }

//    public class EmailTemplateUtil {
//        public static String buildAlertHtml(String type, String metric, float value, float threshold, String direction) {
//            return """
//            <html>
//              <body style='font-family: Arial, sans-serif; color: #333;'>
//                <h2>🚨 Sensor Alert Notification</h2>
//                <p><strong>Sensor Type:</strong> %s</p>
//                <p><strong>Metric:</strong> %s</p>
//                <p><strong>Current Value:</strong> %.2f</p>
//                <p><strong>Threshold:</strong> %.2f</p>
//                <p><strong>Status:</strong> %s threshold</p>
//              </body>
//            </html>
//            """.formatted(type, metric, value, threshold, direction);
//        }
//    }


}
