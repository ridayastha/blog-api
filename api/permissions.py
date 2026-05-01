"""Custom permissions for API."""
from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Permission to allow authors to edit their own posts."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class IsPostAuthor(permissions.BasePermission):
    """Permission to check if user is the post author."""

    def has_object_permission(self, request, view, obj):
        return obj.post.author == request.user
