"""Django admin configuration."""
from django.contrib import admin
from .models import Category, Post, Comment, Tag, UserProfile


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'status', 'is_featured', 'views', 'published_at']
    list_filter = ['status', 'is_featured', 'category', 'created_at']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['views', 'created_at', 'updated_at']
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'content', 'excerpt')}),
        ('Publishing', {'fields': ('status', 'published_at', 'is_featured')}),
        ('Organization', {'fields': ('author', 'category')}),
        ('Media', {'fields': ('featured_image',)}),
        ('Engagement', {'fields': ('views',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['author', 'post', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['content', 'author__username', 'post__title']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Profile', {'fields': ('bio', 'avatar')}),
        ('Social Links', {'fields': ('social_twitter', 'social_linkedin', 'social_github')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
