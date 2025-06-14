from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from accounts.models import Sale, ContactMessage, Post, FavoriteSale, BusinessProfile, VisitorProfile

User = get_user_model()

class UserModelTests(TestCase):
    def test_create_admin_user(self):
        admin = User.objects.create_user(username='admin', email='admin@example.com', password='pass', is_admin=True)
        self.assertTrue(admin.is_admin)

    def test_create_visitor_user(self):
        visitor = User.objects.create_user(username='visitor', email='visitor@example.com', password='pass', is_visitor=True)
        self.assertTrue(visitor.is_visitor)

    def test_create_business_user(self):
        business = User.objects.create_user(username='biz', email='biz@example.com', password='pass', is_business=True)
        self.assertTrue(business.is_business)

    def test_user_str(self):
        user = User.objects.create_user(username='struser', email='str@example.com', password='pass')
        self.assertEqual(str(user), user.email)

    def test_user_email(self):
        user = User.objects.create_user(username='emuser', email='email@example.com', password='pass')
        self.assertEqual(user.email, 'email@example.com')

    def test_user_username(self):
        user = User.objects.create_user(username='uname', email='x@example.com', password='pass')
        self.assertEqual(user.username, 'uname')

class BusinessProfileModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='biz', email='biz@example.com', password='pass')

    def test_business_profile_creation(self):
        profile = BusinessProfile.objects.create(
            user=self.user,
            business_name="Test Biz",
            category="shop",
            phone="123456",
            location="Jaffa",
            in_jaffa=True
        )
        self.assertEqual(profile.user, self.user)
        self.assertEqual(profile.business_name, "Test Biz")

    def test_business_profile_str(self):
        profile = BusinessProfile.objects.create(
            user=self.user,
            business_name="My Shop",
            category="shop",
            phone="123",
            location="Jaffa",
            in_jaffa=True
        )
        self.assertEqual(str(profile), 'My Shop (biz@example.com)')

    def test_business_profile_location(self):
        profile = BusinessProfile.objects.create(
            user=self.user,
            business_name="Shop",
            category="cafe",
            phone="999",
            location="Tel Aviv",
            in_jaffa=False
        )
        self.assertEqual(profile.location, "Tel Aviv")

class PostModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='poster', email='poster@example.com', password='pass')

    def test_create_post(self):
        post = Post.objects.create(user=self.user, content='Hello!')
        self.assertEqual(post.content, 'Hello!')
        self.assertEqual(post.user, self.user)


    def test_post_content_max_length(self):
        content = 'x' * 500
        post = Post.objects.create(user=self.user, content=content)
        self.assertEqual(post.content, content)

class SaleModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='biz', email='biz@example.com', password='pass')
        self.profile = BusinessProfile.objects.create(user=self.user, business_name="B", category="shop", phone="1", location="Jaffa", in_jaffa=True)

    def test_create_sale(self):
        sale = Sale.objects.create(
            business=self.profile,
            title='Sale',
            description='Big discount',
            start_date=date.today(),
            end_date=date.today() + timedelta(days=5)
        )
        self.assertEqual(sale.business, self.profile)

    def test_sale_str(self):
        sale = Sale.objects.create(title='Test', description='D', start_date=date.today(), end_date=date.today(), business=self.profile)
        self.assertIn('Test', str(sale))

    def test_sale_dates(self):
        start = date.today()
        end = start + timedelta(days=10)
        sale = Sale.objects.create(title='X', description='Y', start_date=start, end_date=end, business=self.profile)
        self.assertEqual(sale.start_date, start)
        self.assertEqual(sale.end_date, end)

class FavoriteSaleTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='visitor', email='v@example.com', password='pass')
        self.biz = User.objects.create_user(username='biz', email='biz@example.com', password='pass')
        self.profile = BusinessProfile.objects.create(user=self.biz, business_name="B", category="shop", phone="1", location="Jaffa", in_jaffa=True)
        self.sale = Sale.objects.create(title='S', description='D', start_date=date.today(), end_date=date.today()+timedelta(days=3), business=self.profile)

    def test_favorite_creation(self):
        fav = FavoriteSale.objects.create(user=self.user, sale=self.sale)
        self.assertEqual(fav.user, self.user)
        self.assertEqual(fav.sale, self.sale)

class ContactMessageModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='u', email='u@example.com', password='pass')

    def test_contact_message_creation(self):
        msg = ContactMessage.objects.create(user=self.user, subject='Hi', message='Hello there')
        self.assertEqual(msg.subject, 'Hi')
        self.assertEqual(msg.user, self.user)

    def test_contact_message_str(self):
        msg = ContactMessage.objects.create(user=self.user, subject='Hi', message='Body')
        self.assertEqual(str(msg), 'Message from u@example.com - Hi')

class VisitorProfileModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='v', email='v@example.com', password='pass')

    def test_tokens_default(self):
        vp = VisitorProfile.objects.create(user=self.user)
        self.assertEqual(vp.tokens, 0)

    def test_set_tokens(self):
        vp = VisitorProfile.objects.create(user=self.user, tokens=50)
        self.assertEqual(vp.tokens, 50)

    def test_increment_tokens(self):
        vp = VisitorProfile.objects.create(user=self.user, tokens=10)
        vp.tokens += 5
        vp.save()
        self.assertEqual(vp.tokens, 15)

    def test_decrement_tokens(self):
        vp = VisitorProfile.objects.create(user=self.user, tokens=10)
        vp.tokens -= 3
        vp.save()
        self.assertEqual(vp.tokens, 7)

class StringRepresentationsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='u', email='u@example.com', password='pass')
        self.profile = BusinessProfile.objects.create(user=self.user, business_name="B", category="shop", phone="1", location="Jaffa", in_jaffa=True)
        self.sale = Sale.objects.create(title='S', description='D', start_date=date.today(), end_date=date.today()+timedelta(days=3), business=self.profile)
        self.post = Post.objects.create(user=self.user, content='Post')
        self.message = ContactMessage.objects.create(user=self.user, subject='Hi', message='Msg')


    def test_sale_str(self):
        self.assertIn('S', str(self.sale))

    def test_contact_message_str(self):
        self.assertEqual(str(self.message), 'Message from u@example.com - Hi')