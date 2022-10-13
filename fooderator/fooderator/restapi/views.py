from django.http import HttpResponse
from rest_framework import status
from rest_framework.response import Response
import rest_framework.generics
import json
from restapi.models import Ingredient, MenuItem, Recipe
from restapi.serializers import MenuItemSerializer, RecipeSerializer


# ------------------------------------------------------- Recipe -------------------------------------------------------


class RecipeListCreateAPIView(rest_framework.generics.ListCreateAPIView):
    """This endpoint allows for listing all recipes in the database (GET), or creating one (POST)"""
    # noinspection PyUnresolvedReferences
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer

    def post(self, request, *args, **kwargs):
        # We have to do this work ourselves because of the one-to-many relationship of Recipe to Ingredients, which
        # DRF doesn't handle by default.  The issue is that on create, the ingredients need to reference the recipe,
        # but it of course doesn't exist yet.  So, we need to create it first, then add the reference to it to each
        # ingredient, then we can save the ingredients.  So, first, we get a serializer for a Recipe, which gives us
        # a Recipe object based on the data that was POSTed.
        serializer = RecipeSerializer(data=request.data)
        # Assuming it comes back valid, we can save the Recipe.  The ingredients will have been saved from the
        # serializer already, so we're good to go at this point.
        if serializer.is_valid():
            recipe = serializer.save()
            # And record a reference to the serializer in this class, so it can do its work properly.
            serializer = RecipeSerializer(recipe)
            # And then, just return a good response, along with the Recipe object itself.
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # If anything goes wrong, return an error.
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# noinspection DuplicatedCode,PyUnresolvedReferences
class RecipeUpdateDeleteAPIView(rest_framework.generics.RetrieveUpdateDestroyAPIView):
    """
        This endpoint allows for updating (PUT) or deleting (DELETE) a recipe by passing in the ID to update or delete.
        It also allows retrieving a single recipe (GET) or modifying one (PATCH), but those aren't used in Fooderator.
    """
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer


# ------------------------------------------------------ MenuItem ------------------------------------------------------


# noinspection DuplicatedCode,PyUnresolvedReferences
class MenuItemListCreateAPIView(rest_framework.generics.ListCreateAPIView):
    """This endpoint allows for listing (GET) all menu items in the database, or creating one (POST)"""
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer


# noinspection DuplicatedCode,PyUnresolvedReferences
class MenuItemDeleteAPIView(rest_framework.generics.DestroyAPIView):
    """This endpoint allows for deleting (DELETE) a menu item from the database by passing the ID to delete"""
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer


# -------------------------------------------- Make shopping list (non-DRF) --------------------------------------------


# noinspection PyUnusedLocal
def make_shopping_list(request):

    # First, we get the list of menu items, which is actually a list of references to recipes.
    # noinspection PyUnresolvedReferences
    menuitems = MenuItem.objects.all()

    # Now, we need to "collect" the unique ingredients across all recipes and the amounts needed.  In other words: if
    # onions appear in three recipes, and we need 2 onions for each, then we need to, in the end, have an entry for
    # 6 onions in total in the shopping list.  To do this, we iterate the menu items, and for each, look up the
    # ingredients associated with the recipe_id in the recipe.
    dict_shopping_list = {}
    for menuitem in menuitems:

        print(menuitem)

        # noinspection PyUnresolvedReferences
        ingredients = Ingredient.objects.filter(recipe_id=menuitem.recipe_id)
        print(ingredients)

        # Now that we have the recipe the menu item references, we can iterate the ingredients and add each to the
        # shopping list dictionary, updating any existing item's amount, or adding new ones (including the units).
        for ingredient in ingredients:
            print(ingredient)
            key = ingredient.name.lower() + ingredient.amount_unit.lower()
            if key in dict_shopping_list:
                # Item is already in the dictionary.
                print(dict_shopping_list[key])
                # noinspection PyUnresolvedReferences
                dict_shopping_list[key]["amount"] = dict_shopping_list[key]["amount"] + ingredient.amount
            else:
                # Not already there, so add it.
                dict_shopping_list[key] = {
                    "name": ingredient.name, "amount_unit": ingredient.amount_unit, "amount": ingredient.amount
                }
        print("dict_shopping_list", dict_shopping_list)

        # Now convert the dictionary to an array.
        arr_shopping_list = []
        for ingredient in dict_shopping_list:
            arr_shopping_list.append(dict_shopping_list[ingredient])
        print("arr_shopping_list", arr_shopping_list)

    # And finally, send the response to the client, which is a JSON version of the final array.
    # noinspection PyUnboundLocalVariable
    return HttpResponse(json.dumps(arr_shopping_list, indent=4))
