"""
WhatsApp outreach via Twilio (or swap for any WA Business API).
Sends demo link to all clients with status='demo' who haven't been messaged.

Install:  pip install twilio requests
Run:      python send_whatsapp.py --dry-run
"""

import argparse
import os
import requests
import time
from twilio.rest import Client as TwilioClient

TWILIO_SID    = os.environ["TWILIO_ACCOUNT_SID"]
TWILIO_TOKEN  = os.environ["TWILIO_AUTH_TOKEN"]
TWILIO_FROM   = os.environ["TWILIO_WHATSAPP_FROM"]   # e.g. whatsapp:+14155238886
API_URL       = os.environ.get("API_URL", "http://localhost:3000")
ROOT_DOMAIN   = os.environ.get("ROOT_DOMAIN", "yourdomain.com")


def get_demo_clients() -> list[dict]:
    r = requests.get(f"{API_URL}/api/clients?status=demo")
    r.raise_for_status()
    return r.json()


def build_message(client: dict) -> str:
    demo_url = f"https://{client['subdomain']}.{ROOT_DOMAIN}"
    return (
        f"Namaste Dr. {client['doctor_name']}! 🙏\n\n"
        f"We've created a *free demo website* for {client['clinic_name']}:\n"
        f"👉 {demo_url}\n\n"
        f"It includes:\n"
        f"✅ Your clinic's services\n"
        f"✅ WhatsApp booking button\n"
        f"✅ Mobile-optimized design\n\n"
        f"*Activate for just ₹999/month.* Reply YES to get started!"
    )


def send_messages(clients: list[dict], dry_run: bool) -> None:
    twilio = TwilioClient(TWILIO_SID, TWILIO_TOKEN) if not dry_run else None
    sent, failed = 0, 0

    for client in clients:
        if not client.get("phone"):
            print(f"  Skip (no phone): {client['clinic_name']}")
            continue

        message = build_message(client)
        to = f"whatsapp:+91{client['phone']}"

        if dry_run:
            print(f"\n--- DRY RUN: {client['clinic_name']} ({to}) ---")
            print(message)
            continue

        try:
            twilio.messages.create(body=message, from_=TWILIO_FROM, to=to)
            print(f"  ✓ Sent to {client['clinic_name']} ({client['phone']})")
            sent += 1
        except Exception as e:
            print(f"  ✗ {client['clinic_name']}: {e}")
            failed += 1

        time.sleep(1)   # Rate limit: 1 msg/sec

    if not dry_run:
        print(f"\nDone: {sent} sent, {failed} failed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    print("Fetching demo clients...")
    clients = get_demo_clients()
    print(f"Found {len(clients)} demo clients\n")
    send_messages(clients, dry_run=args.dry_run)
