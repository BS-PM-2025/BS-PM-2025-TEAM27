from django.urls import reverse
from django.core import mail
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin_email = 'admin@jaffa.com'
        self.admin_password = 'adminpass123'
        self.admin_user = User.objects.create_user(
            username='adminuser',
            email=self.admin_email,
            password=self.admin_password,
            is_admin=True,
            is_active=True,
        )

        self.visitor_register_url = reverse('visitor-register')
        self.visitor_login_url = reverse('visitor-login')
        self.admin_login_url = reverse('admin-login')
        self.visitor_profile_url = reverse('visitor-profile')  # replace with actual view name if needed

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
            username='nonadminuser',
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
            'username': 'visitoruser'
        }
        response = self.client.post(self.visitor_register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email='visitor@example.com')
        self.assertFalse(user.is_active)

        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Verify Your Email Address', mail.outbox[0].subject)
        self.assertIn('Click the link below to verify your email', mail.outbox[0].body)

    def test_visitor_register_missing_fields(self):
        data = {
            'email': 'incomplete@example.com'
        }
        response = self.client.post(self.visitor_register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)
        self.assertIn('password', response.data)

    def test_visitor_login_success(self):
        user = User.objects.create_user(
            username='visitor1',
            email='visitor1@example.com',
            password='visitorpass',
            is_visitor=True,
            is_active=True
        )
        response = self.client.post(self.visitor_login_url, {
            'email': 'visitor1@example.com',
            'password': 'visitorpass'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_visitor_login_not_active(self):
        user = User.objects.create_user(
            username='inactiveuser',
            email='inactive@example.com',
            password='visitorpass',
            is_visitor=True,
            is_active=False
        )
        response = self.client.post(self.visitor_login_url, {
            'email': 'inactive@example.com',
            'password': 'visitorpass'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['detail'], 'Account is not verified.')

    def test_visitor_profile_authenticated_access(self):
        user = User.objects.create_user(
            username='profileuser',
            email='profile@example.com',
            password='visitorpass',
            is_visitor=True,
            is_active=True
        )
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.visitor_profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@example.com')

    def test_visitor_profile_unauthenticated_access(self):
        response = self.client.get(self.visitor_profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
