import os
import requests
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.user import User
from app.schemas import user as user_schemas
from app.services import auth_service

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

@router.post("/api/auth/register", response_model=user_schemas.Token)
def register(user_in: user_schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user using email, username, and password, returning an access token."""
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    # Hash password and store user
    hashed_pwd = auth_service.get_password_hash(user_in.password)
    new_user = User(
        username=user_in.username.strip(),
        email=user_in.email.lower().strip(),
        hashed_password=hashed_pwd
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Issue JWT token
    token = auth_service.create_access_token(new_user.id)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/api/auth/login", response_model=user_schemas.Token)
def login(login_in: user_schemas.UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user using email and password, returning an access token."""
    user = db.query(User).filter(User.email == login_in.email.lower().strip()).first()
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password credentials."
        )
        
    # Verify password hash
    if not auth_service.verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password credentials."
        )
        
    token = auth_service.create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}

@router.post("/api/auth/google", response_model=user_schemas.Token)
def google_auth(req: user_schemas.GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user via Google ID Token.
    Verifies the credential signature with Google's APIs, signs in or registers, and returns an access token.
    """
    token_id = req.credential
    if not token_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Credential token missing from request payload."
        )

    # Call Google tokeninfo endpoint to verify token validity
    verify_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token_id}"
    try:
        res = requests.get(verify_url, timeout=10)
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Could not connect to Google verification endpoints: {str(e)}"
        )

    if res.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credentials credential certificate."
        )

    info = res.json()
    
    # Basic validation
    if info.get("iss") not in ["accounts.google.com", "https://accounts.google.com"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer signature."
        )
        
    # Verify client ID matches strictly (Audience Claim Validation)
    if not GOOGLE_CLIENT_ID or GOOGLE_CLIENT_ID == "your_google_client_id_goes_here":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Sign-In is not configured correctly on the backend server."
        )
    if info.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Audience claim mismatch (Token was not generated for this client)."
        )

    google_sub = info.get("sub")
    email = info.get("email", "").lower().strip()
    name = info.get("name", "Google User").strip()
    picture = info.get("picture", "")

    if not google_sub or not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google profile is missing necessary identity attributes."
        )

    # 1. Search by Google ID
    user = db.query(User).filter(User.google_id == google_sub).first()
    if not user:
        # 2. Search by Email (linked fallback)
        user = db.query(User).filter(User.email == email).first()
        if user:
            # Link Google credentials to existing email account
            user.google_id = google_sub
            if picture:
                user.picture = picture
            db.commit()
            db.refresh(user)
        else:
            # 3. Create fresh Google login user
            user = User(
                username=name,
                email=email,
                google_id=google_sub,
                picture=picture
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    # Issue local JWT token
    token = auth_service.create_access_token(user.id)
    return {"access_token": token, "token_type": "bearer"}

@router.get("/api/auth/me", response_model=user_schemas.User)
def get_me(current_user: User = Depends(auth_service.get_current_user)):
    """Fetch profile data of the currently authorized user."""
    return current_user

@router.get("/api/auth/google/client-id")
def get_google_client_id():
    """Retrieve Google Client ID for frontend button initialization."""
    return {"client_id": GOOGLE_CLIENT_ID}
