from django.urls import path

from . import views

app_name = "encyclopedia"
urlpatterns = [
    path("", views.index, name="index"),
    path("random", views.random_page, name="random"),
    path("search", views.search, name="search"),
    path("new", views.new, name="new"),
    path("<str:entry>", views.lookup, name="lookup")
]
