from django.urls import path
from restapi import views

urlpatterns = [

    # ----------------------------------------------------- Recipe -----------------------------------------------------
    path("recipe/", views.RecipeListCreateAPIView.as_view()),
    path("recipe/<int:pk>/", views.RecipeUpdateDeleteAPIView.as_view()),

    # ---------------------------------------------------- MenuItem ----------------------------------------------------
    path("menuitem/", views.MenuItemListCreateAPIView.as_view()),
    path("menuitem/<int:pk>/", views.MenuItemDeleteAPIView.as_view())

]
