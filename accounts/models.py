from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.conf import settings


class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    full_name = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    is_visitor = models.BooleanField(default=False)
    is_business = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)

    is_banned_until = models.DateTimeField(null=True, blank=True)
    is_approved = models.BooleanField(default=True)  

    ROLE_CHOICES = (
        ('visitor', 'Visitor'),
        ('business', 'Business'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def is_banned(self):
        return self.is_banned_until and self.is_banned_until > timezone.now()

    def ban_for_30_days(self):
        self.is_banned_until = timezone.now() + timedelta(days=30)
        self.save()

    def __str__(self):
        return self.email


class VisitorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=10)
    profile_image = models.ImageField(upload_to='profile_pics/', blank=True, null=True)

    def __str__(self):
        return self.user.username


class BusinessProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    business_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    phone = models.CharField(max_length=20)
    location = models.CharField(max_length=255)
    in_jaffa = models.BooleanField()
    profile_image = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    work_time_sun_thu = models.CharField(max_length=50, blank=True, null=True)
    work_time_fri = models.CharField(max_length=50, blank=True, null=True)
    work_time_sat = models.CharField(max_length=50, blank=True, null=True) 


    def __str__(self):
        return f"{self.business_name} ({self.user.email})"


class GalleryImage(models.Model):
    business = models.ForeignKey(BusinessProfile, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to='business_gallery/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.business.business_name}"


class Sale(models.Model):
    business = models.ForeignKey(BusinessProfile, on_delete=models.CASCADE, related_name='sales')
    title = models.CharField(max_length=255)
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField()
    image = models.ImageField(upload_to='sales_banners/', blank=True, null=True)
    favorites_count = models.IntegerField(default=0)
    total_favorites = models.IntegerField(default=0)
    def __str__(self):
        return f"Sale: {self.title} ({self.business.business_name})"

class ContactMessage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.user.email} - {self.subject}"
    

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    image = models.ImageField(upload_to='posts/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name='comments')  
    content = models.TextField()  
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} on {self.post}"

class Report(models.Model):
    reporter = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)    

class FavoriteSale(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_sales')
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'sale')

class SiteRating(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, unique=True)
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.rating} Stars"