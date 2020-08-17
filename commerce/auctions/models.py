from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Listing(models.Model):
    
    MOTORS = "MO"
    FASHION = "FA"
    MEDIA  = "ME"
    ELECTRONICS = "EL"
    ART = "AR"
    HOME = "HO"
    SPORTS = "SP"
    TOYS = "TO"
    BUSINESS = "BU"
    HEALTH = "HE"
    OTHER = "OT"

    CATEGORY_CHOICES = [
        [MOTORS, "Motors"],
        [FASHION, "Fashion"],
        [MEDIA, "Media"],
        [ELECTRONICS, "Electronics"],
        [ART, "Art"],
        [HOME, "Home"],
        [SPORTS, "Sports"],
        [TOYS, "Toys"],
        [BUSINESS, "Business"],
        [HEALTH, "Health"],
        [OTHER, "Other"]
    ]

    title = models.CharField(max_length=64)
    description = models.TextField()
    starting_bid = models.DecimalField(max_digits=8, decimal_places=2)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="listings")
    image_url = models.URLField(blank=True)
    category = models.CharField(blank=True, max_length=2, choices=CATEGORY_CHOICES)
    watchlist = models.ManyToManyField(
        User, blank=True, related_name="watchlist")
    def __str__(self):
        return str(self.title)

class Bid(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bids")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="bids")
    amount = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    
    def __str__(self):
        return f"${self.amount} bid on {self.listing} by {self.user}"

class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="comments")
    text = models.TextField()

    def __str__(self):
        return f"{self.user}'s comment on {self.listing}: {self.text[0:20]}"
