"""Serializers for blog API."""
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Category, Comment, Tag, UserProfile

# --- USER SERIALIZERS ---

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for the extended user profile data."""
    class Meta:
        model = UserProfile
        fields = ['bio', 'avatar', 'social_twitter', 'social_linkedin', 'social_github']
        read_only_fields = ['avatar']


class UserSerializer(serializers.ModelSerializer):
    """Public user data with nested profile and post statistics."""
    profile = UserProfileSerializer(read_only=True)
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile', 'posts_count']
        read_only_fields = ['id']

    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Handles new user creation with password matching validation."""
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, data):
        if data['password'] != data.pop('password2'):
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        # UserProfile is created automatically via api/signals.py
        user = User.objects.create_user(**validated_data)
        return user


# --- TAXONOMY SERIALIZERS ---

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class CategorySerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'posts_count', 'created_at']

    def get_posts_count(self, obj):
        return obj.posts.filter(status='published').count()


# --- COMMENT SERIALIZERS ---

class CommentSerializer(serializers.ModelSerializer):
    """Handles comments and recursive nesting for replies."""
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'post', 'author', 'content', 'status',
            'parent_comment', 'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'status', 'created_at', 'updated_at']

    def get_replies(self, obj):
        # Recursively serializes child comments for a threaded view
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []


# --- POST SERIALIZERS ---

class PostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views (Feed/Search)."""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False,
        allow_null=True
    )
    # NEW: Add reading_time property from the model
    reading_time = serializers.ReadOnlyField()
    featured_image = serializers.ImageField(required=False, allow_null=True)

    # Optimized: pulls from the database annotation in ViewSet
    comments_count = serializers.IntegerField(source='approved_comments_count', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author', 'category',
            'category_id', 'featured_image', 'views', 'is_featured','featured_image',
            'comments_count','reading_time', 'created_at', 'published_at', 'status'
        ]
        read_only_fields = ['id', 'slug', 'views', 'created_at', 'published_at']


class PostDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for individual post pages."""
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    reading_time = serializers.ReadOnlyField()
    comments = serializers.SerializerMethodField()
    comments_count = serializers.IntegerField(source='approved_comments_count', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'author', 'category',
            'featured_image', 'status', 'views', 'is_featured', 'tags', 'comments',
            'comments_count','reading_time', 'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = ['id', 'views', 'created_at', 'updated_at', 'published_at']

    def get_comments(self, obj):
        # Only return top-level comments (replies are nested within these via CommentSerializer)
        top_level_comments = obj.comments.filter(parent_comment=None, status='approved')
        return CommentSerializer(top_level_comments, many=True).data