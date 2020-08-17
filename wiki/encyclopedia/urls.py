from django.urls import path

from . import views

app_name = "encyclopedia"
urlpatterns = [
    path("", views.index, name="index"),
    path("wiki/random/", views.random_page, name="random"),
    path("wiki/search/", views.search, name="search"),
    path("wiki/new/", views.new, name="new"),
    path("wiki/<str:entry>/", views.lookup, name="lookup"),
    path("wiki/<str:entry>/edit/", views.edit, name="edit")
]
