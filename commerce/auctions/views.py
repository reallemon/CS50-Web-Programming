from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Comment, Listing, Bid


def index(request):
    listings = Listing.objects.exclude(closed=True).all()
    return render(request, "auctions/index.html", {
        "listings": listings
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


def listing_lookup(request, pk):
    listing = Listing.objects.get(pk=pk)
    return render(request, "auctions/listing.html", {
        "listing": listing
    })

@login_required
def watch(request, pk):
    if request.method == "POST":
        listing = Listing.objects.get(pk=pk)
        if listing in request.user.watchlist.all():
            request.user.watchlist.remove(listing)
        else:
            request.user.watchlist.add(listing)
    return HttpResponseRedirect(reverse("listing", args=[pk]))

@login_required
def place_bid(request, pk):
    if request.method == "POST":
        listing = Listing.objects.get(pk=pk)
        new_bid = float(request.POST["new_bid"])
        current_bid = listing.bids.last().amount if listing.bids.last() else float(listing.starting_bid) - .01
        if new_bid > current_bid:
            new_bid = Bid(user=request.user, listing=listing, amount=new_bid)
            new_bid.save()
            listing.bids.add(new_bid)
        else:
            return render(request, "auctions/listing.html", {
                "listing": listing,
                "message": "You can't place a lower bid"
            })
    return HttpResponseRedirect(reverse("listing", args=[pk]))

@login_required
def place_comment(request, pk):
    if request.method == "POST":
        listing = Listing.objects.get(pk=pk)
        new_comment = str(request.POST["new_comment"])
        new_comment = Comment(user=request.user, listing=listing, text=new_comment)
        new_comment.save()
    return HttpResponseRedirect(reverse("listing", args=[pk]))

@login_required
def close_listing(request, pk):
    if request.method == "POST":
        listing = Listing.objects.get(pk=pk)
        if listing.user == request.user and not listing.closed:
            listing.closed = True
            listing.save()
    return HttpResponseRedirect(reverse("listing", args=[pk]))

@login_required
def new_listing(request):
    if request.method == "POST":
        listing = Listing()
        listing.title = request.POST["title"]
        listing.description = request.POST["description"]
        listing.starting_bid = request.POST["startingBid"]
        listing.user = request.user
        listing.image_url = request.POST["imageUrl"]
        listing.category = request.POST["category"]
        listing.closed = False
        listing.save()
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/new.html")

@login_required
def display_watchlist(request):
    return render(request, "auctions/watchlist.html")