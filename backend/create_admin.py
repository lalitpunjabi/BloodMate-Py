import argparse
import getpass
import sys

from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.database import SessionLocal, engine
from app.db import models


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Create or update an admin user for BloodMate."
    )
    parser.add_argument("--email", required=True, help="Admin email address")
    parser.add_argument("--full-name", required=True, help="Admin full name")
    parser.add_argument(
        "--password",
        help="Admin password. If omitted, you will be prompted securely.",
    )
    parser.add_argument(
        "--activate",
        action="store_true",
        help="Ensure the admin account is marked active.",
    )
    return parser.parse_args()


def get_password(password_arg: str | None) -> str:
    if password_arg:
        return password_arg

    password = getpass.getpass("Admin password: ")
    confirm_password = getpass.getpass("Confirm password: ")

    if not password:
        raise ValueError("Password cannot be empty.")
    if password != confirm_password:
        raise ValueError("Passwords do not match.")

    return password


def create_or_update_admin(
    db: Session, email: str, full_name: str, password: str, activate: bool
) -> tuple[str, models.User]:
    user = db.query(models.User).filter(models.User.email == email).first()
    hashed_password = get_password_hash(password)

    if user:
        user.full_name = full_name
        user.hashed_password = hashed_password
        user.role = models.RoleEnum.admin
        if activate:
            user.is_active = True
        db.commit()
        db.refresh(user)
        return "updated", user

    user = models.User(
        email=email,
        full_name=full_name,
        hashed_password=hashed_password,
        role=models.RoleEnum.admin,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return "created", user


def main() -> int:
    args = parse_args()

    try:
        password = get_password(args.password)
    except ValueError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    models.Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        action, user = create_or_update_admin(
            db=db,
            email=args.email,
            full_name=args.full_name,
            password=password,
            activate=args.activate,
        )
    finally:
        db.close()

    print(
        f"Admin user {action}: email={user.email}, role={user.role.value}, active={user.is_active}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
