import csv
import json
from io import StringIO
from fastapi import APIRouter, Depends, Request
from app.db import leads_collection
from app.middleware.jwt_auth import jwt_auth
from app.middleware.rate_limit import internal_rate_limiter
from datetime import datetime
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from app.services.prompts import FOLLOWUP_PROMPT
from app.services.groq_client import ask_groq

router = APIRouter(
    prefix="/dashboard",
    dependencies=[Depends(jwt_auth)]
)


@router.get("/summary")
def summary(
    request: Request,
    __: None = Depends(internal_rate_limiter)
):
    total = leads_collection.count_documents({})

    high = leads_collection.count_documents({"ai.intent": "HIGH"})
    medium = leads_collection.count_documents({"ai.intent": "MEDIUM"})
    low = leads_collection.count_documents({"ai.intent": "LOW"})

    avg = list(leads_collection.aggregate([
        {"$group": {"_id": None, "avg": {"$avg": "$ai.score"}}}
    ]))

    return {
        "total_leads": total,
        "intent_split": {
            "HIGH": high,
            "MEDIUM": medium,
            "LOW": low
        },
        "average_score": round(avg[0]["avg"], 2) if avg else 0
    }


@router.get("/recent-leads")
def recent_leads(
    limit: int = 5,
    __: None = Depends(internal_rate_limiter)
):
    leads = (
        leads_collection
        .find({}, {"_id": 0})
        .sort("created_at", -1)
        .limit(limit)
    )

    return list(leads)

@router.get("/leads")
def get_leads(limit: int = 20):
    leads = (
        leads_collection
        .find({}, {
            "_id": 0,
            "name": 1,
            "email": 1,
            "company": 1,
            "role": 1,
            "status": 1,
            "notes": 1,
            "ai.intent": 1,
            "ai.score": 1,
            "created_at": 1
        })
        .sort("created_at", -1)
        .limit(limit)
    )
    return list(leads)



class LeadUpdate(BaseModel):
    status: str | None = None
    note: str | None = None


@router.post("/lead/update")
def update_lead(email: str, payload: LeadUpdate):
    update_query = {}

    # Update status
    if payload.status:
        update_query["$set"] = {"status": payload.status}

    # Add note
    if payload.note:
        update_query["$push"] = {
            "notes": {
                "text": payload.note,
                "created_at": datetime.utcnow()
            }
        }

    if not update_query:
        return {"message": "Nothing to update"}

    leads_collection.update_one(
        {"email": email},
        update_query
    )

    return {"message": "Lead updated"}


@router.get("/export")
def export_leads_csv():
    leads = leads_collection.find({}, {
        "_id": 0,
        "name": 1,
        "email": 1,
        "company": 1,
        "role": 1,
        "status": 1,
        "ai.intent": 1,
        "ai.score": 1,
        "created_at": 1
    })

    buffer = StringIO()
    writer = csv.writer(buffer)

    # CSV header
    writer.writerow([
        "Name",
        "Email",
        "Company",
        "Role",
        "Status",
        "Intent",
        "Score",
        "Created At"
    ])

    for l in leads:
        writer.writerow([
            l.get("name"),
            l.get("email"),
            l.get("company"),
            l.get("role"),
            l.get("status"),
            l.get("ai", {}).get("intent"),
            l.get("ai", {}).get("score"),
            l.get("created_at")
        ])

    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=leads.csv"
        }
    )


@router.post("/lead/followup")
def generate_followup(email: str):
    lead = leads_collection.find_one({"email": email})
    if not lead:
        return {"error": "Lead not found"}

    prompt = FOLLOWUP_PROMPT.format(
        name=lead["name"],
        role=lead["role"],
        company=lead["company"],
        problem=lead.get("problem", "Not specified"),
        intent=lead["ai"]["intent"],
        score=lead["ai"]["score"]
    )

    raw = ask_groq(prompt)

    try:
        data = json.loads(raw)

        if not isinstance(data.get("email"), str):
            raise ValueError("Invalid email content")

        return {
            "subject": data.get("subject", "Quick follow-up"),
            "email": data["email"],
            "angle": data.get("angle", "General follow-up")
        }

    except Exception:
        return {
            "subject": "Quick follow-up",
            "email": f"Hi {lead['name']}, just checking in to see if you had a chance to review my earlier message.",
            "angle": "General follow-up"
        }
