from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    BusinessLoginView,
    VisitorRegisterView,
    BusinessRegisterView,
    VerifyEmailView,
    VisitorLoginView,
    VisitorProfileView,
    BusinessProfileViewSet,
    GalleryImageViewSet,
    SaleViewSet,
    get_all_users,
    ban_user,
    unban_user,
    delete_user,
    approve_business,
    decline_business,
    AdminLoginView,
    ForgotPasswordView,
    ResetPasswordView,
    delete_sale,
    delete_image,
    ContactUsView,
    ContactMessageDeleteView,
    ContactMessageListView,
    PostListCreateView,
    PostDetailView,
    LikePostView,
    CommentCreateView,
    ReportPostView, 
    ReportedPostsListView,
    PostViewSet, 
    CommentViewSet,
    reported_posts_view,
    delete_reported_post,
    ignore_report,
    admin_delete_post,
    my_posts
)


router = DefaultRouter()
router.register(r'profile/business', BusinessProfileViewSet, basename='business-profile')
router.register(r'gallery-images', GalleryImageViewSet, basename='gallery-image')
router.register(r'profile/business/sales', SaleViewSet, basename='business-sale')
router.register(r'sales', SaleViewSet, basename='sale')
router.register(r'posts', PostViewSet, basename='posts')
router.register(r'comments', CommentViewSet, basename='comments')

urlpatterns = [
    path('register/visitor/', VisitorRegisterView.as_view(), name='visitor-register'),
    path('register/business/', BusinessRegisterView.as_view(), name='business-register'),
    path('login/visitor/', VisitorLoginView.as_view(), name='visitor-login'),
    path('login/business/', BusinessLoginView.as_view(), name='business-login'),
    path('login/admin/', AdminLoginView.as_view(), name='admin-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('profile/visitor/', VisitorProfileView.as_view(), name='visitor-profile'),
    path('sales/<int:pk>/delete/', delete_sale, name='delete-sale'),
    path('gallery-images/<int:pk>/delete/', delete_image, name='delete-gallery-image'),
    path('admin/users/', get_all_users, name='get-all-users'),
    path('admin/users/<int:user_id>/ban/', ban_user, name='ban-user'),
    path('admin/users/<int:user_id>/unban/', unban_user, name='unban-user'),
    path('admin/users/<int:user_id>/delete/', delete_user, name='delete-user'),
    path('admin/business/<int:user_id>/approve/', approve_business, name='approve-business'),
    path('admin/business/<int:user_id>/decline/', decline_business, name='decline-business'),
    path('contact/', ContactUsView.as_view(), name='contact'),
    path('password/forgot/', ForgotPasswordView.as_view(), name='password-forgot'),
    path('password/reset/<uidb64>/<token>/', ResetPasswordView.as_view(), name='password-reset'),
    path('admin/contact-messages/', ContactMessageListView.as_view(), name='admin-contact-messages'),
    path('admin/contact-messages/<int:pk>/delete/', ContactMessageDeleteView.as_view(), name='admin-delete-contact'),
    path('posts/', PostListCreateView.as_view()),
    path('posts/<int:pk>/', PostDetailView.as_view()),
    path('posts/<int:pk>/like/', LikePostView.as_view()),
    path('posts/<int:pk>/comment/', CommentCreateView.as_view()),
    path('posts/<int:pk>/report/', ReportPostView.as_view()),
    path('admin/reported-posts/', ReportedPostsListView.as_view()),
    path('admin/reported-posts/', reported_posts_view, name='reported-posts'),
    path('admin/reported-posts/<int:post_id>/delete-post/', delete_reported_post, name='delete-reported-post'),
    path('admin/reported-posts/<int:report_id>/ignore/', ignore_report, name='ignore-report'),
    path('admin/posts/<int:post_id>/delete/', admin_delete_post, name='admin-delete-post'),
    path('my-posts/', my_posts),

]

urlpatterns += router.urls
