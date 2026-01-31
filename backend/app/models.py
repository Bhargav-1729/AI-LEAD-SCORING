from pydantic import BaseModel, EmailStr, Field

class LeadCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    company: str = Field(min_length=2, max_length=100)
    role: str = Field(min_length=2, max_length=50)
    company_size: str
    problem: str = Field(min_length=10, max_length=500)
    budget: str | None = None
