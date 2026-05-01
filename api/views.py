"""Views for blog API."""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend

from .models import Post, Category, Comment, Tag, UserProfile
from .serializers import (
    PostListSerializer,
    PostDetailSerializer,
    CategorySerializer,
    CommentSerializer,
    UserSerializer,
    UserRegistrationSerializer,
    TagSerializer,
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


class UserLoginView(APIView):
    """User login endpoint (basic implementation)."""
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Username and password required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(username=username)
            if user.check_password(password):
                return Response({
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'message': 'Login successful'
                }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            pass
        
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for users."""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name']

    @action(detail=True, methods=['get'])
    def posts(self, request, pk=None):
        """Get user's published posts."""
        user = self.get_object()
        posts = user.posts.filter(status='published')
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for categories."""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    lookup_field = 'slug'

    @action(detail=True, methods=['get'])
    def posts(self, request, slug=None):
        """Get posts in this category."""
        category = self.get_object()
        posts = category.posts.filter(status='published')
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)


class PostViewSet(viewsets.ModelViewSet):
    """ViewSet for blog posts."""
    queryset = Post.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'author', 'is_featured']
    search_fields = ['title', 'content', 'excerpt']
    ordering_fields = ['created_at', 'published_at', 'views']
    ordering = ['-published_at']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostListSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def publish(self, request, slug=None):
        """Publish a draft post."""
        post = self.get_object()
        if post.status == 'draft':
            post.status = 'published'
            post.published_at = timezone.now()
            post.save()
            return Response({'message': 'Post published successfully'})
        return Response(
            {'error': 'Only draft posts can be published'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def increment_views(self, request, slug=None):
        """Increment post views."""
        post = self.get_object()
        post.views += 1
        post.save()
        return Response({'views': post.views})

    @action(detail=True, methods=['get'])
    def comments(self, request, slug=None):
        """Get approved comments for post."""
        post = self.get_object()
        comments = post.comments.filter(status='approved', parent_comment__isnull=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)


class CommentViewSet(viewsets.ModelViewSet):
    """ViewSet for comments."""
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['post', 'status']

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a comment (author only)."""
        comment = self.get_object()
        if comment.post.author == request.user:
            comment.status = 'approved'
            comment.save()
            return Response({'message': 'Comment approved'})
        return Response(
            {'error': 'Permission denied'},
            status=status.HTTP_403_FORBIDDEN
        )
