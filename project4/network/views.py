import json
import time

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post


def index(request):
    return render(request, "network/index.html")


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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


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
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@login_required
def new_post(request):
    # Must make a new post via POST
    if request.method != "POST":
            return JsonResponse({"error": "POST request required."}, status=400)
    
    # Get post data as JSON
    data = json.loads(request.body)

    # Validate post text
    if len(data.get("text").strip()) == 0:
        return JsonResponse({ "error": "Post must contain text."}, status=400)

    # Create new post
    post = Post(user = request.user, text = data.get("text"))
    post.save()

    return JsonResponse({"message": "Post was successful"}, status=201)

def display_posts(request):
    time.sleep(.1)
    posts = Post.objects.all().order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)

def user_info(request, user_id):
    user = User.objects.get(pk=user_id)
    if request.method == "PUT":
        pass
    
    return JsonResponse(user.serialize(), safe=False)

@login_required
def like_post(request, post_id):
    post = Post.objects.get(pk=post_id)
    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("liked") == "toggle":
            if request.user in post.likes.all():
                post.likes.remove(request.user)
            else:
                post.likes.add(request.user)
        elif data.get("text") is not None:
            post.text = data.get("text")
                    
        post.save()
        time.sleep(.1)
        return HttpResponse(status=204)