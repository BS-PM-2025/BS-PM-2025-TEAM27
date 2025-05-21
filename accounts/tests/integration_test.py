from django.urls import reverse
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import ContactMessage

User = get_user_model()


class WorkingIntegrationTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass',
            is_admin=True,
            is_staff=True,
            is_active=True
        )
        self.user = User.objects.create_user(
            username='visitor',
            email='visitor@example.com',
            password='visitorpass',
            is_visitor=True,
            is_active=True
        )

        self.admin_token = str(RefreshToken.for_user(self.admin).access_token)
        self.user_token = str(RefreshToken.for_user(self.user).access_token)

    def test_admin_login(self):
        url = reverse('admin-login')
        response = self.client.post(url, {
            'email': self.admin.email,
            'password': 'adminpass'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_contact_us_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        url = reverse('contact')
        response = self.client.post(url, {
            'subject': 'Feedback',
            'message': 'Great site!'
        })
        self.assertEqual(response.status_code, 201)

    def test_contact_messages_list_and_delete_as_admin(self):
        msg = ContactMessage.objects.create(user=self.user, subject='Test', message='Hi admin')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        list_url = reverse('admin-contact-messages')
        delete_url = reverse('admin-delete-contact', args=[msg.pk])

        list_res = self.client.get(list_url)
        self.assertEqual(list_res.status_code, 200)

        del_res = self.client.delete(delete_url)
        self.assertEqual(del_res.status_code, 204)

    def test_get_approved_businesses(self):
        url = reverse('approved-businesses')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.data, list)

    def test_admin_dashboard_view(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = reverse('admin-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('total_users', response.data)
