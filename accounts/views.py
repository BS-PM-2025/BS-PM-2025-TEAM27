from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view,permission_classes
from rest_framework.permissions import IsAdminUser,AllowAny
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
from django.core.mail import send_mail
from django.utils import timezone
from datetime import datetime, timedelta
from .models import VisitorProfile, User
from .serializers import UserAdminSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from django.shortcuts import redirect
from django.db.models import Q
from .models import BusinessProfile, GalleryImage, Sale,ContactMessage,BusinessProfile
from .serializers import BusinessProfileSerializer, GalleryImageSerializer, SaleSerializer,ContactMessageSerializer
from rest_framework import viewsets, permissions
from django.conf import settings
from .models import Post, Like, Comment, Report,FavoriteSale,SiteRating
from .serializers import PostSerializer, LikeSerializer, CommentSerializer, ReportSerializer
from .serializers import (
    VisitorRegisterSerializer,
    BusinessRegisterSerializer,
    VisitorProfileSerializer,
    CustomVisitorTokenSerializer,
    CustomBusinessTokenSerializer,
    CustomAdminTokenSerializer,
    BusinessProfileSerializer,
    FavoriteSaleSerializer,
    SaleSerializer,
    SiteRatingSerializer,
)
from rest_framework.decorators import action
from rest_framework.generics import ListAPIView,DestroyAPIView


class VisitorRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = VisitorRegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        user.is_active = False
        user.save()
        self.send_verification_email(user)

    def send_verification_email(self, user):
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        verification_url = self.request.build_absolute_uri(
            reverse('verify-email', kwargs={'uidb64': uid, 'token': token})
        )
        send_mail(
            subject='Verify Your Email Address',
            message=f'Click the link below to verify your email:\n{verification_url}',
            from_email='noreply@jaffaexplorer.com',
            recipient_list=[user.email],
        )


class BusinessRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = BusinessRegisterSerializer
    permission_classes = [AllowAny]


class VerifyEmailView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return redirect("http://localhost:3000/verify-success")
            else:
                return redirect("http://localhost:3000/verify-failed")
        except Exception as e:
            return redirect("http://localhost:3000/verify-failed")


class VisitorLoginView(TokenObtainPairView):
    permission_classes = [AllowAny]
    serializer_class = CustomVisitorTokenSerializer


class BusinessLoginView(TokenObtainPairView):
    serializer_class = CustomBusinessTokenSerializer


class VisitorProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        try:
            profile = VisitorProfile.objects.get(user=request.user)
            serializer = VisitorProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        except VisitorProfile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        try:
            profile = VisitorProfile.objects.get(user=request.user)
            serializer = VisitorProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except VisitorProfile.DoesNotExist:
            return Response({"detail": "Profile not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_all_users(request):
    users = User.objects.all()
    serializer = UserAdminSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def ban_user(request, user_id):
    try:
        user = User.objects.get(pk=user_id)
        user.is_banned_until = datetime.now() + timedelta(days=30)
        user.save()

        send_mail(
            subject="Account Banned",
            message=f"Your account has been banned for 30 days. You can log back in on {user.is_banned_until.strftime('%Y-%m-%d')}.",
            from_email="jaffaexplorer@gmail.com",
            recipient_list=[user.email],
        )

        return Response({"detail": "User banned for 30 days."})
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def unban_user(request, user_id):
    try:
        user = get_object_or_404(User, id=user_id)
        user.is_banned_until = None
        user.save()

        send_mail(
            subject="Account Unbanned",
            message="Your account has been unbanned. You may now log in again.",
            from_email="noreply@jaffaexplorer.com",
            recipient_list=[user.email],
        )

        return Response({'detail': 'User unbanned successfully.'})
    except Exception as e:
        return Response({'error': str(e)}, status=400)
    
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return Response({'message': 'User deleted'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def approve_business(request, user_id):
    try:
        user = User.objects.get(id=user_id, is_business=True)
        user.is_approved = True
        user.is_active = True 
        user.save()

        send_mail(
            subject="Business Account Approved",
            message="Your business account has been approved. You can now log in and access the system.",
            from_email="noreply@jaffaexplorer.com",
            recipient_list=[user.email],
        )

        return Response({'message': 'Business account approved'})
    except User.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def decline_business(request, user_id):
    try:
        user = User.objects.get(id=user_id, is_business=True)
        user.delete()
        send_mail(
            subject="Business Account Decline",
            message="Your business account has been Declined. You can send us email to contact.",
            from_email="noreply@jaffaexplorer.com",
            recipient_list=[user.email],
        )
        return Response({'message': 'Business account declined and deleted'})
    except User.DoesNotExist:
        return Response({'error': 'Business not found'}, status=404)
    
from rest_framework.views import APIView

class AdminLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(request, email=email, password=password)

        if user is not None and user.is_admin:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({"detail": "Invalid credentials or not an admin."}, status=400)

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"
            
            send_mail(
                subject="Password Reset - Jaffa Explorer",
                message=f"Click the link to reset your password:\n{reset_link}",
                from_email="noreply@jaffaexplorer.com",
                recipient_list=[user.email],
            )
            return Response({"detail": "Password reset link sent."})
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=404)
        

class ResetPasswordView(APIView):
    def post(self, request, uidb64, token):
        password = request.data.get("password")
        password2 = request.data.get("password2")

        if password != password2:
            return Response({"error": "Passwords do not match."}, status=400)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)

            if not default_token_generator.check_token(user, token):
                return Response({"error": "Invalid or expired token."}, status=400)

            user.set_password(password)
            user.save()
            return Response({"message": "Password has been reset successfully."})
        except Exception as e:
            return Response({"error": str(e)}, status=400)        
        
class BusinessProfileViewSet(viewsets.ModelViewSet):
    queryset = BusinessProfile.objects.all()
    serializer_class = BusinessProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GalleryImageViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryImageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GalleryImage.objects.filter(business__user=self.request.user)

    def perform_create(self, serializer):
        business = self.request.user.businessprofile
        serializer.save(business=business)

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

    def get_permissions(self):
        if self.request.method == "DELETE":
            return [IsAdminUser()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_admin:
            return Sale.objects.all()
        return Sale.objects.filter(business__user=user)

    def perform_create(self, serializer):
        business_profile = self.request.user.businessprofile
        serializer.save(business=business_profile)

    def perform_update(self, serializer):
        serializer.save()



@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_sale(request, pk):
    sale = get_object_or_404(Sale, pk=pk, business__user=request.user)
    sale.delete()
    return Response({'message': 'Sale deleted'})

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_image(request, pk):
    img = get_object_or_404(GalleryImage, pk=pk, business__user=request.user)
    img.delete()
    return Response({'message': 'Image deleted'})        


class ContactUsView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        message = serializer.save(user=self.request.user)

        send_mail(
            subject=f"[Contact Us] {message.subject}",
            message=f"From: {self.request.user.get_full_name()} <{self.request.user.email}>\n\n{message.message}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
        )


class ContactMessageListView(generics.ListAPIView):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAdminUser]

class ContactMessageDeleteView(generics.DestroyAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAdminUser]

class PostListCreateView(generics.ListCreateAPIView):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_update(self, serializer):
        if self.request.user != self.get_object().user:
            raise PermissionError("You can't edit this post.")
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user != instance.user:
            raise PermissionError("You can't delete this post.")
        instance.delete()

class LikePostView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = Post.objects.get(pk=pk)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        if not created:
            like.delete()
            return Response({"message": "Unliked"})
        return Response({"message": "Liked"})

class CommentCreateView(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post_id = self.kwargs['pk']
        post = Post.objects.get(pk=post_id)
        serializer.save(user=self.request.user, post=post)

class ReportPostView(generics.CreateAPIView):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        post_id = self.kwargs['pk']
        post = Post.objects.get(pk=post_id)
        report = serializer.save(reporter=self.request.user, post=post)

        send_mail(
            subject=f"🚨 Post Reported by {self.request.user.email}",
            message=f"The post with ID {post_id} was reported.\n\nReason: {report.reason}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=False,
        )
class ReportedPostsListView(generics.ListAPIView):
    queryset = Report.objects.all().order_by('-created_at')
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAdminUser]

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([IsAdminUser])
def reported_posts_view(request):
    reports = Report.objects.select_related('post', 'reporter').all()
    serializer = ReportSerializer(reports, many=True, context={'request': request})
    return Response(serializer.data)



@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_reported_post(request, post_id):
    try:
        Post.objects.get(id=post_id).delete()
        Report.objects.filter(post_id=post_id).delete()
        return Response({"detail": "Post and related reports deleted."})
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=404)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def ignore_report(request, report_id):
    try:
        Report.objects.get(id=report_id).delete()
        return Response({"detail": "Report ignored and removed."})
    except Report.DoesNotExist:
        return Response({"detail": "Report not found."}, status=404)
    
@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_post(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
        post.delete()
        return Response({"detail": "Post deleted successfully."})
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_posts(request):
    posts = Post.objects.filter(user=request.user).order_by('-created_at')
    serializer = PostSerializer(posts, many=True, context={'request': request})
    return Response(serializer.data)


class ApprovedBusinessListAPIView(generics.ListAPIView):
    serializer_class = BusinessProfileSerializer

    def get_queryset(self):
        queryset = BusinessProfile.objects.filter(user__is_approved=True)
        category = self.request.query_params.get('category')
        open_on_saturday = self.request.query_params.get('open_on_saturday')

        if category:
            queryset = queryset.filter(category__iexact=category)
        if open_on_saturday == 'true':
            queryset = queryset.exclude(work_time_sat__iexact='Closed')

        return queryset
    
@api_view(['GET'])
@permission_classes([AllowAny])
def approved_businesses(request):
    businesses = BusinessProfile.objects.filter(user__is_approved=True, user__is_business=True, user__is_active=True)
    serializer = BusinessProfileSerializer(businesses, many=True, context={"request": request})
    return Response(serializer.data)   

class FavoriteSaleListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoriteSaleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not hasattr(self.request.user, 'visitorprofile'):
            return FavoriteSale.objects.none()
        return FavoriteSale.objects.filter(user=self.request.user)


    def perform_create(self, serializer):
        sale = serializer.validated_data['sale']
        favorite, created = FavoriteSale.objects.get_or_create(user=self.request.user, sale=sale)
        if created:
            sale.total_favorites += 1
            sale.save()



class FavoriteSaleDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, sale_id):
        try:
            fav = FavoriteSale.objects.get(user=request.user, sale_id=sale_id)
            fav.delete()
            return Response({"detail": "Favorite removed."})
        except FavoriteSale.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)
        
class AllSalesListView(ListAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [AllowAny]

class VisitorFavoriteSalesView(ListAPIView):
    serializer_class = FavoriteSaleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FavoriteSale.objects.filter(user=self.request.user)
    
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard_view(request):
    total_users = User.objects.count()
    total_visitors = User.objects.filter(is_visitor=True).count()
    total_businesses = User.objects.filter(is_business=True).count()
    total_sales = Sale.objects.count()
    total_favorites = FavoriteSale.objects.count()
    total_posts = Post.objects.count()

    return Response({
        'total_users': total_users,
        'total_visitors': total_visitors,
        'total_businesses': total_businesses,
        'total_sales': total_sales,
        'total_favorites': total_favorites,
        'total_posts': total_posts,
    })

class SiteRatingViewSet(viewsets.ModelViewSet):
    queryset = SiteRating.objects.all()
    serializer_class = SiteRatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SiteRating.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = SiteRating.objects.get(user=request.user)
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except SiteRating.DoesNotExist:
            return Response(status=status.HTTP_204_NO_CONTENT)
        
class PublicSiteRatingListView(ListAPIView):
    queryset = SiteRating.objects.all().order_by('-created_at')
    serializer_class = SiteRatingSerializer
    permission_classes = [AllowAny]

class AdminDeleteSiteRatingView(DestroyAPIView):
    queryset = SiteRating.objects.all()
    serializer_class = SiteRatingSerializer
<<<<<<< HEAD
    permission_classes = [IsAdminUser]

=======
    permission_classes = [IsAdminUser]
>>>>>>> c2254d5ba6b919fe4a5c830ab05c3d9b7cb99fbc
