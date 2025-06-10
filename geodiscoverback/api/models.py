from django.db import models

# Create your models here.

class User(models.Model):
    id = models.CharField('ID', max_length=100, primary_key=True)
    name = models.CharField('Имя', max_length=100)
    email = models.EmailField('Email')
    password = models.CharField('Пароль', max_length=100)
    avatar = models.TextField('Аватар', blank=True, null=True)
    joined = models.DateField('Дата регистрации')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"

class Topic(models.Model):
    id = models.CharField('ID', max_length=100, primary_key=True)
    title = models.CharField('Заголовок', max_length=200)
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topics')
    views = models.PositiveIntegerField('Просмотры', default=0)
    comments_count = models.PositiveIntegerField('Комментарии', default=0)
    created = models.CharField('Дата создания', max_length=20)
    tags = models.JSONField('Теги', default=list)
    content = models.TextField('Содержание')
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Тема"
        verbose_name_plural = "Темы"

class Article(models.Model):
    id = models.CharField('ID', max_length=100, primary_key=True)
    title = models.CharField('Заголовок', max_length=200)
    image = models.URLField('Изображение')
    category = models.CharField('Категория', max_length=100)
    content = models.TextField('Содержание')
    
    def __str__(self):
        return self.title
    
    class Meta:
        verbose_name = "Статья"
        verbose_name_plural = "Статьи"

class Place(models.Model):
    TYPE_CHOICES = [
        ('attraction', 'Достопримечательность'),
        ('cafe', 'Кафе'),
        ('park', 'Парк'),
    ]
    
    id = models.CharField('ID', max_length=100, primary_key=True)
    name = models.CharField('Название', max_length=200)
    coords = models.JSONField('Координаты')
    type = models.CharField('Тип', max_length=20, choices=TYPE_CHOICES)
    description = models.TextField('Описание')
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Место"
        verbose_name_plural = "Места"

class Route(models.Model):
    id = models.CharField('ID', max_length=100, primary_key=True)
    name = models.CharField('Название', max_length=200)
    places = models.JSONField('Места')
    distance = models.CharField('Дистанция', max_length=50)
    duration = models.CharField('Длительность', max_length=50)
    created = models.CharField('Дата создания', max_length=20)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='routes', null=True, blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "Маршрут"
        verbose_name_plural = "Маршруты"

class Comment(models.Model):
    id = models.PositiveIntegerField('ID', primary_key=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='topic_comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_comments')
    text = models.TextField('Текст')
    created = models.DateTimeField('Дата создания')
    
    def __str__(self):
        return f"Комментарий {self.id} к теме {self.topic.title}"
    
    class Meta:
        verbose_name = "Комментарий"
        verbose_name_plural = "Комментарии"

class NewUsers(models.Model):
    name = models.CharField("name", max_length=100)
    email = models.CharField("email", max_length=30)
    password = models.CharField("password", max_length=30)
    avatar = models.ImageField(upload_to= "images/", blank= True, default="images/avatar.jpg", null=True)
    joined = models.DateField("Дата регистрации")

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = "НовыйПользователь"
        verbose_name_plural = "НовыеПользователи"