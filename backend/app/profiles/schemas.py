from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    """Role-specific step-2 details for roles with no dedicated entity (§6 of the spec) —
    contact_number and region are the only person-level fields the spec defines outside Driver.
    """

    contact_number: str | None = Field(default=None, max_length=20)
    region: str | None = Field(default=None, max_length=100)
