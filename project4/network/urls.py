
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API Routes
    path("new", views.new_post, name="new"),
    path("posts", views.display_posts, name="posts"),
    path("posts/<int:post_id>", views.like_post, name="post")
]
