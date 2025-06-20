from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from django.conf.urls.static import static

def homepage(request):
    return JsonResponse({"message": "Welcome to Jaffa Explorer API 🎉"})

urlpatterns = [
    path('', homepage),  
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),  
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)