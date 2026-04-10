import re
import secrets
import string

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from rest_framework_simplejwt.tokens import RefreshToken

_SPECIAL = "!@#$%^&*-_=+"

# Minimum rules for --password (matches generated passwords)
_MIN_LEN = 12


def _validate_password_strength(password: str) -> str | None:
    """Return error message if weak, else None."""
    if len(password) < _MIN_LEN:
        return f"Password must be at least {_MIN_LEN} characters."
    if not re.search(r"[a-z]", password):
        return "Password must include a lowercase letter."
    if not re.search(r"[A-Z]", password):
        return "Password must include an uppercase letter."
    if not re.search(r"\d", password):
        return "Password must include a digit."
    if not re.search(r"[!@#$%^&*\-_=+]", password):
        return f"Password must include a special character ({_SPECIAL})."
    return None


def _generate_strong_password(length: int = 20) -> str:
    """Cryptographically random password meeting the same rules as validation."""
    length = max(length, _MIN_LEN)
    lower = secrets.choice(string.ascii_lowercase)
    upper = secrets.choice(string.ascii_uppercase)
    digit = secrets.choice(string.digits)
    special = secrets.choice(_SPECIAL)
    alphabet = string.ascii_letters + string.digits + _SPECIAL
    rest = "".join(secrets.choice(alphabet) for _ in range(length - 4))
    chars = list(lower + upper + digit + special + rest)
    secrets.SystemRandom().shuffle(chars)
    return "".join(chars)


class Command(BaseCommand):
    help = (
        "Create or update Django superuser and print JWT pair "
        "(use the same username/password to sign in at the React /admin page when API is configured). "
        "If --password is omitted, a strong random password is generated and printed once — save it securely."
    )

    def add_arguments(self, parser):
        parser.add_argument("--username", default="admin", help="Superuser username")
        parser.add_argument("--email", default="admin@goldymart.local", help="Superuser email")
        # Argparse treats % in help as printf-style; escape literal % from _SPECIAL.
        _pwd_help_special = _SPECIAL.replace("%", "%%")
        parser.add_argument(
            "--password",
            default=None,
            help=(
                f"Superuser password (min {_MIN_LEN} chars, upper+lower+digit+special {_pwd_help_special}). "
                "Omit to auto-generate a strong password."
            ),
        )

    def handle(self, *args, **options):
        User = get_user_model()
        username = options["username"]
        email = options["email"]
        password = options["password"]

        generated = False
        if password is None or str(password).strip() == "":
            password = _generate_strong_password()
            generated = True
        else:
            password = str(password)
            err = _validate_password_strength(password)
            if err:
                raise CommandError(err)

        user = User.objects.filter(username=username).first()
        if user:
            user.set_password(password)
            user.email = email
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True  # Simple JWT rejects inactive users ("No active account…")
            user.save()
            self.stdout.write(self.style.WARNING(f"Updated superuser: {username}"))
        else:
            User.objects.create_superuser(username, email, password)
            self.stdout.write(self.style.SUCCESS(f"Created superuser: {username}"))

        user = User.objects.get(username=username)
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        self.stdout.write("")
        if generated:
            self.stdout.write(
                self.style.WARNING(
                    "A strong random password was generated. Copy it now — it will not be shown again."
                )
            )
            self.stdout.write("")
        self.stdout.write("Use these for BOTH dashboards:")
        self.stdout.write(f"  Username: {username}")
        self.stdout.write(f"  Email:    {email}")
        self.stdout.write(f"  Password: {password}")
        self.stdout.write("")
        self.stdout.write("Django admin:  http://127.0.0.1:8000/admin/")
        self.stdout.write("Obtain new tokens anytime: POST /api/auth/token/ with username + password (JSON).")
        self.stdout.write("")
        self.stdout.write("JWT access (paste in React Admin Settings > Backend API, or VITE_JWT_ACCESS):")
        self.stdout.write(self.style.SUCCESS(access))
        self.stdout.write("")
        self.stdout.write("JWT refresh (optional - Settings > Refresh token, or VITE_JWT_REFRESH):")
        self.stdout.write(self.style.SUCCESS(str(refresh)))
        self.stdout.write("")
        self.stdout.write(
            "React admin:   http://localhost:5173/admin  (sign in with username + password; email is for your records)"
        )
