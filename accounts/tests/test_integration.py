from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import BusinessProfile, VisitorProfile, ContactMessage, Post, Sale, FavoriteSale, Offer, OfferRedemption, SiteRating
from django.contrib.auth import get_user_model
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils import timezone
from datetime import datetime, timedelta
import unittest
User = get_user_model()


class AccountsIntegrationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin', email='admin@example.com', password='admin123', is_admin=True, is_staff=True, is_active=True)
        self.visitor = User.objects.create_user(username='visitor', email='visitor@example.com', password='visitor123', is_visitor=True, is_active=True)
        self.business_user = User.objects.create_user(username='bizuser', email='biz@example.com', password='biz123', is_business=True, is_active=True)

        self.business = BusinessProfile.objects.create(
            user=self.business_user,
            business_name="Test Biz",
            category="shop",
            location="Jaffa",
            phone="0500000000",
            in_jaffa=True
        )

        VisitorProfile.objects.create(user=self.visitor, tokens=100)

        self.visitor_token = str(RefreshToken.for_user(self.visitor).access_token)
        self.business_token = str(RefreshToken.for_user(self.business_user).access_token)
        self.admin_token = str(RefreshToken.for_user(self.admin).access_token)

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_visitor_register(self):
        response = self.client.post(reverse('visitor-register'), {
            'username': 'newvisitor',
            'email': 'newvisitor@example.com',
            'password': 'newpassword123',
            'password2': 'newpassword123',
            'phone_number': '0501111222'
        })
        self.assertEqual(response.status_code, 201)

    def test_business_register(self):
        response = self.client.post(reverse('business-register'), {
            'username': 'newbiz',
            'email': 'newbiz@example.com',
            'password': 'bizpassword',
            'password2': 'bizpassword',
            'business_name': 'Test Shop',
            'category': 'shop',
            'custom_category': '',
            'description': 'Great place',
            'phone': '0500000001',
            'location': 'Jaffa',
            'is_in_jaffa': True
        })
        self.assertEqual(response.status_code, 201)

    def test_email_verification_success(self):
        from django.contrib.auth.tokens import default_token_generator
        uid = urlsafe_base64_encode(force_bytes(self.visitor.pk))
        token = default_token_generator.make_token(self.visitor)
        url = reverse('verify-email', args=[uid, token])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 302)

    def test_forgot_password(self):
        response = self.client.post(reverse('password-forgot'), {'email': self.visitor.email})
        self.assertEqual(response.status_code, 200)



    def test_reset_password_success(self):
        from django.contrib.auth.tokens import default_token_generator
        uid = urlsafe_base64_encode(force_bytes(self.visitor.pk))
        token = default_token_generator.make_token(self.visitor)
        url = reverse('password-reset', args=[uid, token])
        response = self.client.post(url, {
            'new_password': 'newpass123',
            'confirm_password': 'newpass123'
        })
        self.assertEqual(response.status_code, 200)

    def test_contact_us_authenticated(self):
        self.auth(self.visitor_token)
        response = self.client.post(reverse('contact'), {
            'subject': 'Test Subject',
            'message': 'Test message'
        })
        self.assertEqual(response.status_code, 201)

    def test_admin_login(self):
        response = self.client.post(reverse('admin-login'), {
            'email': self.admin.email,
            'password': 'admin123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)

    def test_contact_messages_list_and_delete_as_admin(self):
        msg = ContactMessage.objects.create(user=self.visitor, subject='Hello', message='World')
        self.auth(self.admin_token)
        res = self.client.get(reverse('admin-contact-messages'))
        self.assertEqual(res.status_code, 200)
        del_res = self.client.delete(reverse('admin-delete-contact', args=[msg.pk]))
        self.assertEqual(del_res.status_code, 204)

    def test_delete_sale(self):
        sale = Sale.objects.create(
            title='Test Sale',
            description='Sale Desc',
            start_date=datetime.today(),
            end_date=datetime.today() + timedelta(days=1),
            business=self.business
        )
        self.auth(self.business_token)
        res = self.client.delete(reverse('delete-sale', args=[sale.pk]))
        self.assertEqual(res.status_code, 200)

    def test_get_approved_businesses(self):
        res = self.client.get(reverse('approved-businesses'))
        self.assertEqual(res.status_code, 200)

    def test_admin_dashboard(self):
        self.auth(self.admin_token)
        res = self.client.get(reverse('admin-dashboard'))
        self.assertEqual(res.status_code, 200)
        self.assertIn('total_users', res.data)

    def test_admin_delete_post(self):
        post = Post.objects.create(user=self.admin, content='Admin Post')
        self.auth(self.admin_token)
        url = reverse('admin-delete-post', args=[post.pk])
        res = self.client.delete(url)
        self.assertEqual(res.status_code, 200)

    def test_add_remove_favorite_sale(self):
        sale = Sale.objects.create(
            title='Test Fav Sale',
            description='Sale Desc',
            start_date=datetime.today(),
            end_date=datetime.today() + timedelta(days=1),
            business=self.business
        )
        self.auth(self.visitor_token)
        add = self.client.post(reverse('favorite-sales-list'), {'sale': sale.id})
        self.assertEqual(add.status_code, 201)
        delete = self.client.delete(reverse('favorite-sales-delete', args=[sale.id]))
        self.assertEqual(delete.status_code, 200)

    def test_get_my_profile(self):
        self.auth(self.visitor_token)
        res = self.client.get(reverse('visitor-profile'))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['email'], self.visitor.email)

    def test_edit_my_profile(self):
        self.auth(self.visitor_token)
        res = self.client.put(reverse('visitor-profile'), {
            "full_name": "Updated Name",
            "address": "123 Main St",
            "phone_number": "0509999999"
        })
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['phone_number'], '0509999999')

    def test_get_all_users_admin(self):
        self.auth(self.admin_token)
        res = self.client.get(reverse('get-all-users'))
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)

    def test_ban_unban_user(self):
        self.auth(self.admin_token)
        ban_url = reverse('ban-user', args=[self.visitor.id])
        unban_url = reverse('unban-user', args=[self.visitor.id])
        ban = self.client.post(ban_url)
        self.assertEqual(ban.status_code, 200)
        unban = self.client.post(unban_url)
        self.assertEqual(unban.status_code, 200)

    def test_delete_user(self):
        new_user = User.objects.create_user(username='deleteuser', email='del@example.com', password='1234')
        self.auth(self.admin_token)
        res = self.client.delete(reverse('delete-user', args=[new_user.id]))
        self.assertIn(res.status_code, [200, 204])

    def test_approve_decline_business(self):
        self.auth(self.admin_token)
        approve_url = reverse('approve-business', args=[self.business_user.id])
        decline_url = reverse('decline-business', args=[self.business_user.id])
        approve = self.client.post(approve_url)
        self.assertEqual(approve.status_code, 200)
        decline = self.client.post(decline_url)
        self.assertEqual(decline.status_code, 200)
   

    def test_my_redemptions_view(self):
        self.auth(self.visitor_token)
        res = self.client.get(reverse('my-redemptions'))
        self.assertEqual(res.status_code, 200)

    def test_public_site_ratings(self):
        SiteRating.objects.create(user=self.visitor, rating=4, comment='Great site')
        res = self.client.get(reverse('public-site-ratings'))
        self.assertEqual(res.status_code, 200)

    def test_site_rating_retrieve(self):
        self.auth(self.visitor_token)
        res = self.client.get(reverse('my-site-rating'))
        self.assertIn(res.status_code, [200, 204, 404])


    @unittest.skip("Skipping OpenAI test during Jenkins build")
    def test_yaffa_bot(self):
        res = self.client.post('/api/yaffabot/')
        self.assertEqual(res.status_code, 200)

    def test_favorite_sales_list_view(self):
        self.auth(self.visitor_token)
        res = self.client.get(reverse('visitor-favorite-sales'))
        self.assertEqual(res.status_code, 200)

    def test_all_sales_list_view(self):
        res = self.client.get(reverse('all-sales'))
        self.assertEqual(res.status_code, 200)

    def test_token_refresh(self):
        refresh = str(RefreshToken.for_user(self.visitor))
        res = self.client.post(reverse('token_refresh'), {'refresh': refresh})
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)

    def test_business_profile_sales_view(self):
        self.auth(self.business_token)
        res = self.client.get('/api/profile/business/sales/')
        self.assertIn(res.status_code, [200, 404])

    def test_gallery_image_list(self):
        self.auth(self.business_token)
        res = self.client.get('/api/gallery-images/')
        self.assertEqual(res.status_code, 200)