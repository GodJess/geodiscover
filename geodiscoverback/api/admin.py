from django.contrib import admin
from .models import User, Topic, Article, Place, Route, Comment, NewUsers
# Register your models here.

admin.site.register(User)
admin.site.register(Topic)
admin.site.register(Article)
admin.site.register(Place)
admin.site.register(Route)
admin.site.register(Comment)
admin.site.register(NewUsers)