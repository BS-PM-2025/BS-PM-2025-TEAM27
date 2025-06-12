from datetime import date
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from accounts.models import Sale, ContactMessage, Post, FavoriteSale, BusinessProfile

User = get_user_model()

class FunctionalViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            is_admin=True,
            is_staff=True,
            is_superuser=True,
            is_active=True
        )

        self.business_profile = BusinessProfile.objects.create(
            user=self.admin,
            business_name="Admin Shop",
            category="shop",
            description="Test business",
            phone="0500000000",
            location="Jaffa",
            in_jaffa=True
        )

        self.user = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='userpass123',
            is_active=True,
            is_visitor=True
        )

        self.admin_token = str(RefreshToken.for_user(self.admin).access_token)
        self.user_token = str(RefreshToken.for_user(self.user).access_token)

    def test_admin_login_success(self):
        url = reverse('admin-login')
        response = self.client.post(url, {
            'email': 'admin@example.com',
            'password': 'adminpass123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_post_create_and_list(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        post_url = reverse('posts-list')
        post_response = self.client.post(post_url, {'content': 'Hello world!'})
        self.assertEqual(post_response.status_code, 201)

        get_response = self.client.get(post_url)
        self.assertEqual(get_response.status_code, 200)
        self.assertGreaterEqual(len(get_response.data), 1)

    def test_admin_dashboard_access(self):
        url = reverse('admin-dashboard')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn('total_users', response.data)

    def test_favorite_sale_add(self):
        sale = Sale.objects.create(
            title='Limited Offer',
            description='Buy one get one free',
            start_date=date(2024, 1, 1),
            end_date=date(2025, 1, 1),
            business=self.business_profile
        )

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.post(
            reverse('favorite-sales-list'),
            {'sale': sale.id},
            format='json'
        )
        self.assertEqual(response.status_code, 201)

    def test_contact_us_authenticated(self):
        url = reverse('contact')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.post(url, {
            'subject': 'Help',
            'message': 'Need help with login'
        })
        self.assertEqual(response.status_code, 201)

    def test_contact_messages_list_and_delete_as_admin(self):
        msg = ContactMessage.objects.create(user=self.user, subject='Hi', message='Test msg')

        list_url = reverse('admin-contact-messages')
        delete_url = reverse('admin-delete-contact', kwargs={'pk': msg.pk})
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')

        list_response = self.client.get(list_url)
        self.assertEqual(list_response.status_code, 200)

        delete_response = self.client.delete(delete_url)
        self.assertEqual(delete_response.status_code, 204)

    def test_all_sales_and_favorites(self):
        sale = Sale.objects.create(
            title='Sale 1',
            description='Big discount!',
            start_date=date(2024, 1, 1),
            end_date=date(2025, 1, 1),
            business=self.business_profile
        )

        url = reverse('all-sales')
        self.client.credentials()
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)

        FavoriteSale.objects.create(user=self.user, sale=sale)
        fav_url = reverse('visitor-favorite-sales')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        fav_response = self.client.get(fav_url)
        self.assertEqual(fav_response.status_code, 200)

class AdminDeletePostTest(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username='adminuser', email='admin@example.com', password='adminpass'
        )
        self.post = Post.objects.create(user=self.admin, content='Test post')
        self.client = APIClient()
        self.client.force_authenticate(user=self.admin)

    def test_admin_can_delete_post(self):
        url = reverse('admin-delete-post', args=[self.post.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(Post.objects.filter(id=self.post.id).exists())

    def test_delete_nonexistent_post(self):
        url = reverse('admin-delete-post', args=[999])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['detail'], 'Post not found.')

class DeleteSaleTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='bizuser', email='biz@example.com', password='bizpass', is_business=True
        )
        self.business = BusinessProfile.objects.create(
            user=self.user,
            business_name="BizName",
            category="shop",
            phone="0500000000",
            location="Jaffa",
            in_jaffa=True
        )
        self.sale = Sale.objects.create(
            business=self.business,
            title='Discount 50%',
            description='Big Sale',
            start_date=date(2024, 5, 1),
            end_date=date(2025, 5, 1)
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_business_user_can_delete_own_sale(self):
        url = reverse('delete-sale', args=[self.sale.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Sale deleted')
        self.assertFalse(Sale.objects.filter(pk=self.sale.pk).exists())

    def test_cannot_delete_other_business_sale(self):
        other_user = User.objects.create_user(
            username='otherbiz', email='other@example.com', password='otherpass', is_business=True
        )
        self.client.force_authenticate(user=other_user)
        url = reverse('delete-sale', args=[self.sale.pk])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
