from django.urls import path
from . import views


urlpatterns = [
    path('users/', views.users_api),
    path('users/<str:pk>/', views.user_detail_api),
    path('topics/', views.topics_api),
    path('topics/<str:pk>/', views.topic_detail_api),
    path('articles/', views.articles_api),
    path('articles/<str:pk>/', views.article_detail_api),
    path('places/', views.places_api),
    path('places/<str:pk>/', views.place_detail_api),
    path('routes/', views.routes_api),
    path('routes/<str:pk>/', views.route_detail_api),

    path('comments/', views.comments_api),
    path('comments/<int:pk>/', views.comment_detail_api),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('getUser/', views.get_user, name = "get_user"),
    path('update-avatar/<int:user_id>/', views.update_avatar, name='update-avatar'),
]