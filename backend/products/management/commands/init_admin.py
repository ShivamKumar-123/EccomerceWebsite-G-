from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from rest_framework_simplejwt.tokens import RefreshToken


class Command(BaseCommand):
    help = (
        "Create or update Django superuser and print JWT pair "
        "(same login as React admin default: admin / admin123)."
    )

    def add_arguments(self, parser):
        parser.add_argument("--username", default="admin", help="Superuser username")
        parser.add_argument("--email", default="admin@heavytech.local", help="Superuser email")
        parser.add_argument("--password", default="admin123", help="Superuser password")

    def handle(self, *args, **options):
        User = get_user_model()
        username = options["username"]
        email = options["email"]
        password = options["password"]

        user = User.objects.filter(username=username).first()
        if user:
            user.set_password(password)
            user.email = email
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.WARNING(f"Updated superuser: {username}"))
        else:
            User.objects.create_superuser(username, email, password)
            self.stdout.write(self.style.SUCCESS(f"Created superuser: {username}"))

        user = User.objects.get(username=username)
        refresh = RefreshToken.for_user(user)
        access = str(refresh.access_token)

        self.stdout.write("")
        self.stdout.write("Use these for BOTH dashboards:")
        self.stdout.write(f"  Username: {username}")
        self.stdout.write(f"  Password: {password}")
        self.stdout.write("")
        self.stdout.write("Django admin:  http://127.0.0.1:8000/admin/")
        self.stdout.write("Obtain new tokens anytime: POST /api/auth/token/ with username + password (JSON).")
        self.stdout.write("")
        self.stdout.write("JWT access (paste in React → Settings → Backend API, or VITE_JWT_ACCESS):")
        self.stdout.write(self.style.SUCCESS(access))
        self.stdout.write("")
        self.stdout.write("JWT refresh (optional — Settings → Refresh token, or VITE_JWT_REFRESH):")
        self.stdout.write(self.style.SUCCESS(str(refresh)))
        self.stdout.write("")
        self.stdout.write("React admin:   http://localhost:5173/admin  (default is already admin / admin123)")
