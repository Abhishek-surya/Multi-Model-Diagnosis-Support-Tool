import os
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests
from google.auth.exceptions import GoogleAuthError, TransportError

try:
    from backend.database import get_db
    from backend.crud import get_or_create_clinician, get_clinician_by_email
except ImportError:
    from database import get_db
    from crud import get_or_create_clinician, get_clinician_by_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Read Google Client ID from environment variable
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "").strip()


class GoogleLoginRequest(BaseModel):
    credential: str = Field(..., description="Google ID Token JWT returned by Google Identity Services")
    client_id: Optional[str] = Field(None, description="Optional Client ID if not configured on server")


class DevLoginRequest(BaseModel):
    email: str = Field(default="cardiologist@heartcare.org")
    name: str = Field(default="Dr. Alex Rivera, MD")


@router.get("/config")
def get_auth_config():
    """Returns the Google Client ID configured on the server."""
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    return {
        "google_client_id": client_id,
        "is_configured": bool(client_id)
    }


@router.post("/google")
def authenticate_with_google(
    payload: GoogleLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Verifies a Google OAuth ID Token credential, extracts authenticated clinician identity,
    and registers or updates their clinician record in the SQL database.
    """
    token_str = payload.credential.strip()
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google ID token credential must not be empty."
        )

    expected_client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip() or (payload.client_id or "").strip() or None

    try:
        # Cryptographically verify the Google token signature and audience
        idinfo = id_token.verify_oauth2_token(
            token_str,
            requests.Request(),
            audience=expected_client_id
        )

        email = idinfo.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google token did not contain a valid email address."
            )

        name = idinfo.get("name") or email.split("@")[0].title()
        picture = idinfo.get("picture")
        google_id = idinfo.get("sub")

        # Save or update clinician in database
        clinician = get_or_create_clinician(
            db=db,
            email=email,
            name=name,
            google_id=google_id,
            avatar_url=picture,
            role="Cardiologist / Clinician"
        )

        return {
            "status": "success",
            "message": f"Successfully authenticated as {clinician.name}",
            "user": clinician.to_dict(),
            "token": f"google-auth-session-{clinician.id}"
        }
    except (ValueError, GoogleAuthError) as ve:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Google OAuth token: {str(ve)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication verification error: {str(e)}"
        )


@router.post("/dev-login")
def dev_mode_login(
    payload: DevLoginRequest,
    db: Session = Depends(get_db)
):
    """
    Development fallback login endpoint for local testing without internet/Google credentials.
    """
    clinician = get_or_create_clinician(
        db=db,
        email=payload.email,
        name=payload.name,
        google_id="dev-mock-id",
        avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
        role="Attending Cardiologist"
    )
    return {
        "status": "success",
        "message": f"Authenticated via Dev Mode as {clinician.name}",
        "user": clinician.to_dict(),
        "token": f"dev-session-{clinician.id}"
    }


@router.get("/me")
def get_current_clinician(
    email: str,
    db: Session = Depends(get_db)
):
    """Fetch current clinician profile by email."""
    clinician = get_clinician_by_email(db, email)
    if not clinician:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Clinician with email '{email}' not found."
        )
    return clinician.to_dict()
