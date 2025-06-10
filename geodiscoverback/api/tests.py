from django.test import TestCase

from django.urls import reverse
from rest_framework.test import APITestCase
from .models import User, Topic

class SimpleUserTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            id="1",
            name="Тестовый",
            email="test@test.com",
            password="123",
            joined="2023-01-01"
        )
        self.url = '/users/'
    
    def test_get_users(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Тестовый')
    
    def test_create_user(self):
        new_user = {
            "id": "2",
            "name": "Новый",
            "email": "new@test.com",
            "password": "456",
            "joined": "2023-01-02"
        }
        response = self.client.post(self.url, new_user)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(User.objects.count(), 2)

class SimpleTopicTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            id="1",
            name="Автор",
            email="author@test.com",
            password="123",
            joined="2023-01-01"
        )
        self.topic = Topic.objects.create(
            id="1",
            title="Тестовая тема",
            author=self.user,  # передаем объект User
            content="Текст темы"
        )
        self.url = '/topics/'

    
    def test_get_topics(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['title'], 'Тестовая тема')

class ModelStrTests(APITestCase):
    def test_model_str(self):
        user = User.objects.create(
            id="10",
            name="Иван",
            email="ivan@test.com",
            password="123",
            joined="2023-01-01"
        )
        self.assertEqual(str(user), "Иван")