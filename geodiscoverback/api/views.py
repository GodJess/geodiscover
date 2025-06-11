from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view

from rest_framework.response import Response
from .models import User, Topic, Article, Place, Route, Comment, NewUsers
from .serializers import (
    UserSerializer, TopicSerializer, ArticleSerializer, 
    PlaceSerializer, RouteSerializer, CommentSerializer, NewUserSerial
)

from rest_framework import status
from django.contrib.auth.hashers import make_password, check_password
from datetime import date

# User API
@api_view(['GET', 'POST'])
def users_api(request):
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def user_detail_api(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response(status=404)
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        user.delete()
        return Response(status=204)

# Topic API
@api_view(['GET', 'POST'])
def topics_api(request):
    if request.method == 'GET':
        topics = Topic.objects.all()
        serializer = TopicSerializer(topics, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        title = request.data.get('title')
        content = request.data.get('content')
        author = request.data.get('author')
        view = request.data.get('views')
        comments_count = request.data.get('comments_count')
        created = request.data.get('created')
        tags = request.data.get('tags')

        author_id = NewUsers.objects.get(id=author)

        topic_count = Topic.objects.all().count()

        new_topic = Topic.objects.create(id = topic_count + 1,title = title, author = author_id, views = view, comments_count = comments_count, created = created, tags = tags, content = content)
        
        return Response(TopicSerializer(new_topic, many= False).data, status=201)

@api_view(['GET', 'PUT', 'DELETE'])
def topic_detail_api(request, pk):
    try:
        topic = Topic.objects.get(id=pk)
    except Topic.DoesNotExist:
        return Response(status=404)
    
    if request.method == 'GET':
        serializer = TopicSerializer(topic)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = TopicSerializer(topic, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        topic.delete()
        return Response(status=204)

# Article API
@api_view(['GET', 'POST'])
def articles_api(request):
    if request.method == 'GET':
        articles = Article.objects.all()
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ArticleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def article_detail_api(request, pk):
    try:
        article = Article.objects.get(pk=pk)
    except Article.DoesNotExist:
        return Response(status=404)
    
    if request.method == 'GET':
        serializer = ArticleSerializer(article)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ArticleSerializer(article, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        article.delete()
        return Response(status=204)

# Place API
@api_view(['GET', 'POST'])
def places_api(request):
    if request.method == 'GET':
        places = Place.objects.all()
        serializer = PlaceSerializer(places, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PlaceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def place_detail_api(request, pk):
    try:
        place = Place.objects.get(pk=pk)
    except Place.DoesNotExist:
        return Response(status=404)
    
    if request.method == 'GET':
        serializer = PlaceSerializer(place)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = PlaceSerializer(place, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        place.delete()
        return Response(status=204)

# Route API
@api_view(['GET', 'POST'])
def routes_api(request):
    if request.method == 'GET':
        routes = Route.objects.all()
        serializer = RouteSerializer(routes, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = RouteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def route_detail_api(request, pk):
    try:
        route = Route.objects.get(pk=pk)
    except Route.DoesNotExist:
        return Response(status=404)
    
    if request.method == 'GET':
        serializer = RouteSerializer(route)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = RouteSerializer(route, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        route.delete()
        return Response(status=204)

# Comment API
@api_view(['GET', 'POST'])
def comments_api(request):
    if request.method == 'GET':
        comments = Comment.objects.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

@api_view(['GET', 'PUT', 'DELETE'])
def comment_detail_api(request, pk):
    try:
        comment = Comment.objects.get(pk=pk)
    except Comment.DoesNotExist:
        return Response(status=404)
    
    if request.method == 'GET':
        serializer = CommentSerializer(comment)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = CommentSerializer(comment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
    elif request.method == 'DELETE':
        comment.delete()
        return Response(status=204)
    

@api_view(['POST', "GET"])
def register_user(request):
    if request.method == "POST":
        name = request.data.get('name')
        email = request.data.get('email')
        password = request.data.get('password')
        if len(name) == 0 or len(email) == 0 or len(password) == 0:
            return Response({'error': 'Поле обязательно должно быть заполненно'}, status=status.HTTP_400_BAD_REQUEST)
        
        if NewUsers.objects.filter(email=email).exists():
            return Response({'error': 'Пользователь с таким email уже существует'}, status=status.HTTP_400_BAD_REQUEST)
        
        new_user = NewUsers.objects.create(
            name=name, 
            email=email, 
            password=password, 
            joined=date.today()
        )
        
        return Response(
            NewUserSerial(new_user, many=False, context={"request": request}).data,
            status=status.HTTP_201_CREATED
        )
    return Response({})


@api_view(["GET"])
def get_user(request):
    if request.method == "GET":
        return Response(NewUserSerial(NewUsers.objects.all(), many = True, context={"request": request}).data, status=200)

@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    if len(email) == 0 or len(password) == 0:
        return Response({'error': 'Email и пароль обязательны'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = NewUsers.objects.filter(email=email, password=password).first()
    
    if user:
        # Теперь передаем конкретный объект, а не QuerySet
        return Response(
            NewUserSerial(user, context={"request": request}).data,
            status=status.HTTP_200_OK
        )
    else:
        return Response(
            {'error': 'Неверный email или пароль'},
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
def update_avatar(request, user_id):
    try:
        user = NewUsers.objects.get(id=user_id)
    except NewUsers.DoesNotExist:
        return Response({'error': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)
    
    if 'avatar' not in request.FILES:
        return Response({'error': 'Файл аватара не предоставлен'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.avatar = request.FILES['avatar']
    user.save()
    
    user = NewUsers.objects.filter(id = user_id).first()
    return Response(
        NewUserSerial(user, many = False, context={"request": request}).data , status=status.HTTP_200_OK)