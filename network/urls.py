from django.urls import path
from . import views


app_name = "network"
urlpatterns = [
    path('', views.index_view, name="index"),
    path('explore', views.explore_view, name="explore"),
    path('<str:email>/', views.profile_view, name="profile"),
    path('login', views.login_view, name="login"),
    path('register', views.register_view, name="register"),
    path('logout', views.logout_view, name="logout"),

    # API
    path('section/<str:section>/<int:numpage>',
         views.section_api, name="section"),
    path('user/<str:username>/<int:numpage>', views.user_api, name="user"),
    path('post', views.post_api, name="post"),
]
