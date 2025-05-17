from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.utils.timezone import now
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator as token_generator
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.conf import settings
from accounts.models import VisitorProfile, BusinessProfile, User
from datetime import timedelta
from .models import BusinessProfile, GalleryImage, Sale,ContactMessage
from .models import Post, Like, Comment, Report

class VisitorRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True, label="Confirm Password")
    phone_number = serializers.CharField(write_only=True)
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'phone_number', 'profile_image']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        phone_number = validated_data.pop('phone_number')
        profile_image = validated_data.pop('profile_image', None)

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_visitor=True,
            is_active=False,
            role='visitor',
        )

        VisitorProfile.objects.create(
            user=user,
            phone_number=phone_number,
            profile_image=profile_image,
        )

        self.send_verification_email(user)
        return user

    def send_verification_email(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)
        activation_link = f"http://localhost:8000/api/verify-email/{uid}/{token}/"
        send_mail(
            subject="Verify Your Email - Jaffa Explorer",
            message=f"Hello {user.username},\n\nPlease verify your email:\n{activation_link}",
            from_email="noreply@jaffaexplorer.com",
            recipient_list=[user.email],
        )


class BusinessRegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    business_name = serializers.CharField(write_only=True)
    category = serializers.CharField(write_only=True)
    description = serializers.CharField(write_only=True)
    phone = serializers.CharField(write_only=True)
    location = serializers.CharField(write_only=True)
    is_in_jaffa = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'business_name', 'category', 'description',
            'phone', 'location', 'is_in_jaffa'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords do not match.")
        if not data.get('is_in_jaffa'):
            raise serializers.ValidationError("Business must be located in Jaffa.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        business_data = {
            'business_name': validated_data.pop('business_name'),
            'category': validated_data.pop('category'),
            'description': validated_data.pop('description'),
            'phone': validated_data.pop('phone'),
            'location': validated_data.pop('location'),
            'in_jaffa': validated_data.pop('is_in_jaffa'),
        }

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            is_business=True,
            is_active=False,
            role='business',
        )

        BusinessProfile.objects.create(user=user, **business_data)
        self.send_admin_notification_email(user, business_data)
        return user

    def send_admin_notification_email(self, user, business_data):
        message = (
            f"A new business has registered:\n\n"
            f"Username: {user.username}\n"
            f"Email: {user.email}\n"
            f"Business Name: {business_data['business_name']}\n"
            f"Category: {business_data['category']}\n"
            f"Description: {business_data['description']}\n"
            f"Phone: {business_data['phone']}\n"
            f"Location: {business_data['location']}\n"
            f"In Jaffa: {'Yes' if business_data['in_jaffa'] else 'No'}\n\n"
            f"Please review this registration in the admin panel."
        )

        send_mail(
            subject="New Business Registration Pending Approval",
            message=message,
            from_email="noreply@jaffaexplorer.com",
            recipient_list=["admin@jaffaexplorer.com"],
        )
class CustomVisitorTokenSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        if self.user.is_banned_until and self.user.is_banned_until > now():
            remaining = (self.user.is_banned_until - now()).days
            raise serializers.ValidationError(f"Your account is banned for {remaining} more day(s).")
        if not self.user.is_active:
            raise serializers.ValidationError("Please verify your email first.")
        if not self.user.is_visitor:
            raise serializers.ValidationError("Access denied: Not a visitor.")

        if self.user.is_banned_until and self.user.is_banned_until > now():
            remaining = (self.user.is_banned_until - now()).days
            raise serializers.ValidationError(f"Your account is banned for {remaining} more day(s).")
        
        data['access'] = str(self.get_token(self.user).access_token)
        data['refresh'] = str(self.get_token(self.user))
        data['username'] = self.user.username
        data['email'] = self.user.email
        return data


class CustomBusinessTokenSerializer(TokenObtainPairSerializer):
    username_field = 'email'

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        try:
            user = User.objects.get(email=email)
            attrs["username"] = user.username
        except User.DoesNotExist:
            raise serializers.ValidationError("No user found with this email.")

        if not user.is_active:
            raise serializers.ValidationError("Your account is not active.")
        if not user.is_approved:
            raise serializers.ValidationError("Your business account has not been approved yet.")
        if not user.is_business:
            raise serializers.ValidationError("Access denied: Not a business.")

        data = super().validate(attrs)
        data['access'] = str(self.get_token(self.user).access_token)
        data['refresh'] = str(self.get_token(self.user))
        data['username'] = self.user.username
        data['email'] = self.user.email
        return data

class VisitorProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    profile_image_url = serializers.SerializerMethodField()

    class Meta:
        model = VisitorProfile
        fields = ['username', 'email', 'phone_number', 'profile_image', 'profile_image_url']

    def get_profile_image_url(self, obj):
        request = self.context.get('request')
        if obj.profile_image and request:
            return request.build_absolute_uri(obj.profile_image.url)
        return None


class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_visitor', 'is_business', 'is_admin',
                  'is_active', 'is_banned_until', 'is_approved']


class CustomAdminTokenSerializer(TokenObtainPairSerializer):
    username_field = User.EMAIL_FIELD

    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_active:
            raise serializers.ValidationError("Account is inactive.")
        if not self.user.is_admin:
            raise serializers.ValidationError("Access denied: Not an admin.")

        data['access'] = str(self.get_token(self.user).access_token)
        data['refresh'] = str(self.get_token(self.user))
        data['email'] = self.user.email
        return data

class GalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryImage
        fields = ['id', 'image', 'uploaded_at']

class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = ['id', 'title', 'description', 'start_date', 'end_date', 'image']

class BusinessProfileSerializer(serializers.ModelSerializer):
    gallery_images = GalleryImageSerializer(many=True, read_only=True)
    sales = SaleSerializer(many=True, read_only=True)

    class Meta:
        model = BusinessProfile
        fields = ['id', 'business_name', 'description', 'category', 'phone', 'location', 'profile_image', 'gallery_images', 'sales']


class ContactMessageSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = ContactMessage
        fields = ['id', 'user', 'subject', 'message', 'created_at']


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'content', 'created_at']
        extra_kwargs = {
            'post': {'read_only': True}  
        }

class PostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    is_owner = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'user', 'content', 'image', 'created_at',
            'is_owner', 'likes_count', 'comments_count', 'comments' 
        ]

    def get_likes_count(self, obj):
        return Like.objects.filter(post=obj).count()

    def get_is_owner(self, obj):
        request = self.context.get('request')
        return request and request.user == obj.user

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']

class ReportSerializer(serializers.ModelSerializer):
    post = serializers.SerializerMethodField()
    reporter_email = serializers.EmailField(source='reporter.email', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'reason', 'created_at', 'reporter_email', 'post']
        read_only_fields = ['id', 'created_at']

    def get_post(self, obj):
        request = self.context.get('request')  
        return PostSerializer(obj.post, context=self.context).data
