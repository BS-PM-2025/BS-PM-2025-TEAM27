from django.urls import reverse
from django.core import mail
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_email = 'admin@jaffa.com'
        self.admin_password = 'adminpass123'
        self.admin_user = User.objects.create_user(
            username='adminuser',  # ✅ Added
            email=self.admin_email,
            password=self.admin_password,
            is_admin=True,
            is_active=True,
        )
        self.visitor_register_url = reverse('visitor-register')
        self.admin_login_url = reverse('admin-login')

    def test_admin_login_success(self):
        response = self.client.post(self.admin_login_url, {
            'email': self.admin_email,
            'password': self.admin_password,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_admin_login_invalid_credentials(self):
        response = self.client.post(self.admin_login_url, {
            'email': self.admin_email,
            'password': 'wrongpassword',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], "Invalid credentials or not an admin.")

    def test_admin_login_non_admin_user(self):
        user = User.objects.create_user(
            username='nonadminuser',  # ✅ Added
            email='notadmin@jaffa.com',
            password='test1234',
            is_admin=False
        )
        response = self.client.post(self.admin_login_url, {
            'email': 'notadmin@jaffa.com',
            'password': 'test1234',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], "Invalid credentials or not an admin.")

    def test_visitor_register_success_sends_email(self):
        data = {
            'email': 'visitor@example.com',
            'password': 'visitorpass123',
            'username': 'visitoruser'  # Already correct ✅
        }
        response = self.client.post(self.visitor_register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if user created and inactive
        user = User.objects.get(email='visitor@example.com')
        self.assertFalse(user.is_active)

        # Check if email was sent
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Verify Your Email Address', mail.outbox[0].subject)
        self.assertIn('Click the link below to verify your email', mail.outbox[0].body)
