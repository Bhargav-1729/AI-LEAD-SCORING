import os
import requests

SLACK_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
DASHBOARD_URL = os.getenv("DASHBOARD_URL", "http://localhost:5173")

def send_high_intent_alert(lead, ai):
    if not SLACK_WEBHOOK_URL:
        return

    payload = {
        "text": "<!here> 🔥 High Intent Lead Detected!",
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": (
                        f"*Name:* {lead['name']}\n"
                        f"*Company:* {lead['company']}\n"
                        f"*Role:* {lead['role']}\n"
                        f"*Email:* {lead['email']}\n"
                        f"*Score:* {ai['score']}\n"
                        f"*Intent:* {ai['intent']}"
                    )
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "button",
                        "text": { "type": "plain_text", "text": "Email Lead" },
                        "url": f"mailto:{lead['email']}"
                    },
                    {
                        "type": "button",
                        "text": { "type": "plain_text", "text": "Open Dashboard" },
                        "url": DASHBOARD_URL
                    }
                ]
            }
        ]
    }

    try:
        requests.post(SLACK_WEBHOOK_URL, json=payload, timeout=5)
    except Exception as e:
        print("Slack alert failed:", e)
