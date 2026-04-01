from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from products.models import Category, Product


class ProductAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.cat = Category.objects.create(name="Electronics", slug="electronics")
        self.product = Product.objects.create(
            category=self.cat,
            name="Test Mill",
            price=Decimal("34999.00"),
            stock=10,
            image="https://example.com/img.jpg",
        )

    def test_list_products_public(self):
        r = self.client.get("/api/products/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(r.data), 1)

    def test_create_requires_auth(self):
        r = self.client.post(
            "/api/products/",
            {
                "name": "New",
                "category": self.cat.slug,
                "price": "1000",
                "stock": 1,
                "image": "https://example.com/x.jpg",
            },
            format="json",
        )
        self.assertIn(r.status_code, (status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN))

    def test_create_with_token(self):
        user = User.objects.create_user("apiadmin", password="x")
        from rest_framework.authtoken.models import Token

        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        r = self.client.post(
            "/api/products/",
            {
                "name": "New Product",
                "category": self.cat.slug,
                "price": "₹1,000",
                "stock": 2,
                "image": "https://example.com/y.jpg",
            },
            format="json",
        )
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
