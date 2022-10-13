// noinspection DuplicatedCode


import { createState } from "@hookstate/core";


// Note that the IDs for IRecipe, IIngredient and IMenuItem must be optional for when adding new elements since that
// ID comes from the server.


// A description of a Recipe object.
export interface IRecipe {
  id?: number,
  name: string,
  description: string,
  rating: number,
  serves: number,
  ingredient_set: Array<IIngredient>
}


// A description of an Ingredient object.
export interface IIngredient {
  id?: number,
  name: string,
  amount: number,
  amount_unit: string,
  recipe_id?: number
}


// A description of a MenuItem object.
export interface IMenuItem {
  id?: number,
  recipe: number
}


// A description of our global state object.
export interface IGlobalState {
  initialLoadComplete: boolean,
  recipes: Array<IRecipe>,
  menuItems: Array<IMenuItem>
}


// Construct the global state object.
const gs = createState({
  initialLoadComplete: false as boolean,
  recipes: [ ] as Array<IRecipe>,
  menuItems: [ ] as Array<IMenuItem>
} as IGlobalState);
export default gs;


// A function used in several places that finds a recipe in the global state's recipes or menu Items array and returns
// the index of that recipe in that array.
export const getIndexOfRecipeByID = (inID: number, inWhichArray: string): number => {
  if (inWhichArray === "recipes") {
    return gs.recipes.get().map(function(inItem) { return inItem.id; }).indexOf(inID);
  } else {
    return gs.menuItems.get().map(function(inItem) { return inItem.recipe; }).indexOf(inID);
  }
}


console.log("globalState.ts loaded");
