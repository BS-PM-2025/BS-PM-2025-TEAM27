from django.urls import reverse
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Sale, ContactMessage, Post, Like, FavoriteSale

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
            is_active=True
        )

        self.user = User.objects.create_user(
            username='user1',
            email='user1@example.com',
            password='userpass123',
            is_active=True
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
        url = '/posts/'
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        post_response = self.client.post(url, {'content': 'Hello world!'})
        self.assertEqual(post_response.status_code, 201)

        get_response = self.client.get(url)
        self.assertEqual(get_response.status_code, 200)
        self.assertGreaterEqual(len(get_response.data), 1)

    def test_like_post(self):
        post = Post.objects.create(user=self.user, content='Test Post')
        url = f'/posts/{post.pk}/like/'
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)

    def test_comment_post(self):
        post = Post.objects.create(user=self.user, content='Another Post')
        url = f'/posts/{post.pk}/comment/'
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        response = self.client.post(url, {'text': 'Nice!'})
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
        message = ContactMessage.objects.create(user=self.user, subject='Hi', message='Test msg')
        list_url = reverse('admin-contact-messages')
        delete_url = reverse('admin-delete-contact', args=[message.pk])

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.admin_token}')
        list_response = self.client.get(list_url)
        self.assertEqual(list_response.status_code, 200)

        delete_response = self.client.delete(delete_url)
        self.assertEqual(delete_response.status_code, 204)

    def test_all_sales_and_favorites(self):
        sale = Sale.objects.create(title='Sale 1', discount=15, business=self.admin.businessprofile)
        
        self.client.credentials()
        response = self.client.get(reverse('all-sales'))
        self.assertEqual(response.status_code, 200)

        FavoriteSale.objects.create(user=self.user, sale=sale)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.user_token}')
        fav_response = self.client.get(reverse('visitor-favorite-sales'))
        self.assertEqual(fav_response.status_code, 200)
