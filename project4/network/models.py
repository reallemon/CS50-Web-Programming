from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField("User", related_name="followers")

    def serialize(self):
        followers = [{follower.id, follower.username} for follower in self.followers.all()]
        following = [{follow.id, follow.username} for follow in self.following.all()]
        return {
            "id": self.id,
            "username": self.username,
            "followers": followers,
            "following": following
        }



class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="posts")
    text = models.TextField(max_length=280)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name="users")

    def serialize(self):
        likes = [[getattr(like, "username"), getattr(like, "id")] for like in self.likes.all()]
        return {
            "id": self.id,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "user": {"username": self.user.username, "id": self.user.id},
            "text": self.text,
            "likes": likes,
            "editable": False
        }

    def __str__(self):
        return f"{self.user} posted: {self.text}"
