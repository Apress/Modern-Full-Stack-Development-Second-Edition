from rest_framework import serializers
from restapi.models import Ingredient, MenuItem, Recipe


# ------------------------------------------------ IngredientSerializer ------------------------------------------------
# Note that this has to be defined first because it's used in RecipeSerializer below.
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        # Note that we can't use __all__ here because it winds up breaking POST requests when adding a recipe due to
        # the reference to this serializer in the ingredient_set field on the RecipeSerilaizer.
        fields = ("id", "name", "amount", "amount_unit")


# -------------------------------------------------- RecipeSerializer --------------------------------------------------
class RecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipe
        fields = "__all__"

    ingredient_set = IngredientSerializer(many=True)

    # We need to implement create ourselves because DRF doesn't handle one-to-many relationships by default.
    def create(self, validated_data):
        print("RecipeSerializer.create()")
        print(self)
        print(validated_data)
        # Get the data of the ingredients.
        ingredient_validated_data = validated_data.pop("ingredient_set")
        # Create the Recipe.
        # noinspection PyUnresolvedReferences
        recipe = Recipe.objects.create(**validated_data)
        # Get the serializer for an Ingredient.
        ingredient_set_serializer = self.fields["ingredient_set"]
        # For each Ingredient, add the recipe to it (which means the recipe_id in the table).
        for each in ingredient_validated_data:
            each["recipe"] = recipe
        # Create the ingredient record in the table.
        ingredient_set_serializer.create(ingredient_validated_data)
        # Return the recipe, which now has the ingredients effectively linked to it and created in the database.
        return recipe

    # We need to implement update ourselves because DRF doesn't handle one-to-many relationships by default.
    def update(self, instance, validated_data):
        print("RecipeSerializer.update()")
        print(self)
        print(instance)
        print(validated_data)
        # Update the Recipe fields
        instance.name = validated_data["name"]
        instance.description = validated_data["description"]
        instance.rating = validated_data["rating"]
        instance.serves = validated_data["serves"]
        instance.save()
        # Delete all existing ingredients.
        for ingredient in instance.ingredient_set.all():
            ingredient.delete()
        # Get the serializer for an Ingredient.
        ingredient_set_serializer = self.fields["ingredient_set"]
        # Get the data of the ingredients.
        ingredient_validated_data = validated_data.pop("ingredient_set")
        # For each Ingredient, add the recipe to it (which means the recipe_id in the table).
        for each in ingredient_validated_data:
            each["recipe"] = instance
        # Create the ingredient record in the table.
        ingredient_set_serializer.create(ingredient_validated_data)
        return instance


# ------------------------------------------------- MenuItemSerializer -------------------------------------------------
class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = "__all__"
