from django.db.models import Count, Q
from django.contrib.auth.models import User
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import Post, Category, Comment, Tag
from .serializers import (
    PostListSerializer,
    PostDetailSerializer,
    CategorySerializer,
    CommentSerializer,
    UserSerializer,
    UserRegistrationSerializer,
)
from .permissions import IsAuthorOrReadOnly


class UserRegistrationView(APIView):
    """User registration endpoint."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                {'message': 'User registered successfully', 'user_id': user.id},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    """Returns data for the currently logged-in user."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email']

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        user = self.get_object()
        posts = user.posts.filter(status='published')
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    lookup_field = 'slug'

    @action(detail=True, methods=['get'])
    def posts(self, request, slug=None):
        category = self.get_object()
        # Filter posts by category and ensure they are published (for non-staff)
        posts = Post.objects.filter(category=category)

        if not request.user.is_staff:
            posts = posts.filter(status='published')

        # Use the PostListSerializer for a cleaner list view
        serializer = PostListSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)


class PostViewSet(viewsets.ModelViewSet):
    # Optimized with select_related for foreign keys
    queryset = Post.objects.all().select_related('author', 'category').prefetch_related('tags')
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'author', 'is_featured']
    search_fields = ['title', 'content']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer

    def get_queryset(self):
        # 1. Base Queryset
        queryset = super().get_queryset()

        # 2. Security: Hide drafts from public (Non-staff see only published)
        if not self.request.user.is_staff:
            queryset = queryset.filter(status='published')

        # 3. Optimization: Database-level count for comments
        return queryset.annotate(
            approved_comments_count=Count('comments', filter=Q(comments__status='approved'))
        )

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def publish(self, request, slug=None):
        post = self.get_object()
        if post.status == 'draft':
            post.status = 'published'
            post.published_at = timezone.now()
            post.save()
            return Response({'message': 'Post published'})
        return Response({'error': 'Only drafts can be published'}, status=400)

    @action(detail=True, methods=['post'])
    def increment_views(self, request, slug=None):
        post = self.get_object()
        post.views += 1
        post.save(update_fields=['views'])
        return Response({'views': post.views})


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post', 'status']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        comment = self.get_object()
        # Only the blog post author can approve comments on their post
        if comment.post.author == request.user:
            comment.status = 'approved'
            comment.save()
            return Response({'message': 'Comment approved'})
        return Response({'error': 'Permission denied'}, status=403)