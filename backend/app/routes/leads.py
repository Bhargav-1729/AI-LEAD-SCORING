from datetime import datetime
from fastapi import APIRouter, Depends, Request
from app.models import LeadCreate
from app.db import leads_collection
from app.services.groq_client import ask_groq
from app.middleware.rate_limit import public_rate_limiter
from app.services.slack import send_high_intent_alert

router = APIRouter()

def build_prompt(lead: LeadCreate) -> str:
    return f"""
Evaluate this inbound demo request.

Role: {lead.role}
Company size: {lead.company_size}
Problem: {lead.problem}
Budget: {lead.budget or "Not mentioned"}
"""

@router.post("/lead")
def create_lead(
    lead: LeadCreate,
    request: Request,
    _: None = Depends(public_rate_limiter)
):
    ai_result = ask_groq(build_prompt(lead))

    lead_doc = {
        **lead.dict(),
        "status": "NEW",
        "notes": [],
        "slack_notified": False,
        "ai": {
            "score": ai_result["score"],
            "intent": ai_result["intent"],
            "reasons": ai_result["reasons"],
            "model": "llama-3.1-8b-instant",
            "version": "v1.0"
        },
        "created_at": datetime.utcnow()
    }

    leads_collection.insert_one(lead_doc)

    if ai_result["intent"] == "HIGH":
        send_high_intent_alert(
            {
                "name": lead.name,
                "company": lead.company,
                "role": lead.role,
                "email": lead.email
            },
            {
                "score": ai_result["score"],
                "intent": ai_result["intent"]
            }
        )
        leads_collection.update_one(
            {"email": lead.email},
            {"$set": {"slack_notified": True}}
        )

    return {
        "message": "Lead captured successfully",
        "ai_score": ai_result["score"],
        "ai_intent": ai_result["intent"]
    }
