"""URL configuration for blog project."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from api import views

router = DefaultRouter()
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/auth/', include('rest_framework.urls')),
    path('api/v1/auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('api/v1/auth/login/', views.UserLoginView.as_view(), name='user-login'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
