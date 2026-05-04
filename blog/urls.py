"""URL configuration for blog project."""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from api import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'posts', views.PostViewSet, basename='post')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'comments', views.CommentViewSet, basename='comment')
router.register(r'users', views.UserViewSet, basename='user')
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/auth/register/', views.UserRegistrationView.as_view(), name='user-register'),

    # Use only the JWT version for React
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Move this into the api/v1/ prefix for consistency
    path('api/v1/auth/me/', views.MeView.as_view(), name='user-me'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
