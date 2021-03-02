import json
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http.response import JsonResponse
from django.shortcuts import render, HttpResponseRedirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post


def index_view(request):
    if request.user.is_authenticated:
        return render(request, "network/index.html")
    else:
        return HttpResponseRedirect(reverse("network:login"))


def following_view(request):
    return render(request, "network/following.html")


@login_required
def profile_view(request, email):
    return render(request, "network/profile.html", {
        "email": email
    })


def login_view(request):
    if request.method == "POST":
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("network:index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid email and/or password."
            })

    else:
        return render(request, "network/login.html")


def register_view(request):
    if request.method == "POST":
        fullname = request.POST["fullname"].split()
        email = request.POST["email"]
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]

        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Password must match."
            })

        try:
            user = User.objects.create_user(email, email, password)
            user.first_name = fullname[0]
            user.last_name = (" ").join(fullname[1:])
            user.save()
        except IntegrityError as e:
            return render(request, "network/register.html", {
                "message": "Email already taken."
            })

        login(request, user)
        return HttpResponseRedirect(reverse("network:index"))
    else:
        return render(request, "network/register.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("network:index"))


# ===================== API =====================
@login_required
@csrf_exempt
def user_api(request, username, numpage):
    if request.method == "PUT":
        user = request.user
        user_following = user.following.all()
        # Update following on PUT method
        data = json.loads(request.body)
        email = data.get("email")
        user2 = User.objects.get(email=email)

        if user2 in user_following:
            user.following.remove(user2)
        else:
            user.following.add(user2)
        user.save()
        return JsonResponse({'message': "Following user done"}, status=201)

    else:
        # Return user data on GET method
        user = User.objects.get(email=username)
        user_post = Post.objects.filter(
            maker=user).order_by("-created_on")

        posts = Paginator(user_post, 10)
        count = posts.num_pages
        data = posts.page(numpage)

        return JsonResponse({
            'user_data': user.serialize(),
            'user_posts': {
                "page_count": count,
                "page": numpage,
                "data": [post.serialize() for post in data]
            }
        }, safe=False)


@login_required
def section_api(request, section, numpage):
    # Return all post according to section and page
    if section == 'following':
        following = list(request.user.following.all())
        all_post = Post.objects.filter(
            maker__in=following
        ).order_by("-created_on")
    elif section == 'home':
        all_post = Post.objects.all().order_by("-created_on")

    posts = Paginator(all_post, 10)
    count = posts.num_pages
    data = posts.page(numpage)

    return JsonResponse({
        "page_count": count,
        "page": numpage,
        "data": [post.serialize() for post in data]
    }, safe=False)


@csrf_exempt
def post_api(request):
    if request.method == "PUT":
        # Update post content/likes on PUT method
        data = json.loads(request.body)
        post_id = data.get("post_id")
        post = Post.objects.get(id=post_id)

        # Update post content
        if data.get("content") is not None:
            post.content = data["content"]

        # Like/Unlike post
        if data.get("like_status") is not None:
            if data["like_status"]:
                post.likes.add(request.user)
            else:
                post.likes.remove(request.user)

        post.save()
        return JsonResponse({"message": "Update post done"}, status=201)

    elif request.method == "POST":
        # Create new post on POST method
        data = json.loads(request.body)
        content = data.get("content")
        if content == "":
            return JsonResponse({"error": "Content can't be blank."}, status=400)

        # Attempt to create post
        email = data.get("maker", "")
        user = User.objects.get(email=email)
        post = Post(maker=user, content=content)
        post.save()
        return JsonResponse({"message": "Create post done"}, status=201)
