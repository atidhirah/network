from django.urls import path
from . import views

app_name = "network"
urlpatterns = [
    path('', views.index, name="index"),
    path('explore', views.explore, name="explore"),
    path('profile', views.profile, name="profile"),
    path('login', views.login_view, name="login"),
    path('register', views.register_view, name="register"),
    path('logout', views.logout_view, name="logout"),

    # API
    path('user', views.user_view, name="user"),
    path('<str:section>/<int:numpage>', views.section_view, name="section"),
    path('post', views.post_view, name="post"),
]
