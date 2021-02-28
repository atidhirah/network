

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField(
        'User', related_name="followers"
    )

    def serialize(self):
        return {
            "username": self.username,
            "email": self.email,
            "fullname": f"{self.first_name} {self.last_name}",
            "date_joined": self.date_joined,
            "following_count": self.following.all().count(),
            "followers_count": self.followers.all().count(),
            "following": [user.username for user in self.following.all()],
            "followers": [user.username for user in self.followers.all()],
        }

    def __str__(self):
        return f"{self.username}"


class Post(models.Model):
    maker = models.ForeignKey(
        'User', on_delete=models.CASCADE, related_name="posts"
    )
    created_on = models.DateTimeField(auto_now_add=True)
    content = models.TextField()
    likes = models.ManyToManyField(
        'User', related_name="liked_post"
    )

    def serialize(self):
        return {
            "id": self.id,
            "maker": f"{self.maker.first_name} {self.maker.last_name}",
            "maker_email": self.maker.email,
            "created_on": self.created_on.strftime("%b %d %Y %H:%M"),
            "content": self.content,
            "likes": [user.email for user in self.likes.all()],
        }

    def __str__(self):
        return f"Post by {self.maker}"
