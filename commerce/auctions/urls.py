from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new", views.new_listing, name="new"),
    path("watchlist", views.display_watchlist, name="watchlist"),
    path("<int:pk>", views.listing_lookup, name="listing"),
    path("<int:pk>/watch", views.watch, name="watch"),
    path("<int:pk>/bid", views.place_bid, name="bid"),
    path("<int:pk>/comment", views.place_comment, name="comment"),
    path("<int:pk>/close", views.close_listing, name="close")
]
