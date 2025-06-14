from django.urls import reverse
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import ContactMessage, Post, Sale, BusinessProfile, FavoriteSale
from datetime import date

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
        self.business_user = User.objects.create_user(
            username='bizuser',
            email='biz@example.com',
            password='bizpass',
            is_business=True,
            is_active=True
        )

        self.business = BusinessProfile.objects.create(
            user=self.business_user,
            business_name="BizName",
            category="shop",
            phone="0500000000",
            location="Jaffa",
            in_jaffa=True
        )

        self.sale = Sale.objects.create(
            title='Holiday Discount',
            description='30% off',
            start_date=date(2024, 1, 1),
            end_date=date(2025, 1, 1),
            business=self.business
        )

        self.post = Post.objects.create(user=self.admin, content='Test post')

        self.admin_token = str(RefreshToken.for_user(self.admin).access_token)
        self.user_token = str(RefreshToken.for_user(self.user).access_token)
        self.biz_token = str(RefreshToken.for_user(self.business_user).access_token)

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

    def test_admin_deletes_post(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        url = reverse('admin-delete-post', args=[self.post.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Post.objects.filter(id=self.post.id).exists())

    def test_business_user_deletes_sale(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.biz_token}')
        url = reverse('delete-sale', args=[self.sale.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Sale.objects.filter(id=self.sale.id).exists())

    def test_visitor_adds_favorite_sale(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        url = reverse('favorite-sales-list')
        response = self.client.post(url, {'sale': self.sale.id}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertTrue(FavoriteSale.objects.filter(user=self.user, sale=self.sale).exists())