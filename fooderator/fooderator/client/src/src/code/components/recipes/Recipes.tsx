import React, { MouseEventHandler, ReactElement, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { useHookstate } from "@hookstate/core";
import { Button, Card, Layout, PageHeader, Rate } from "antd";
const { Footer, Content } = Layout;
import globalState from "../../globalState";
import RecipesEdit from "./Recipes_Edit";


/**
 * Recipes component.
 */
export default (): ReactElement => {


  console.log("Recipes()");


  // React Router hook.
  const navigate: NavigateFunction = useNavigate();


  // Get global state.
  const gs = useHookstate(globalState);


  // Local state.
  const [ isEditVisible, setIsEditVisible ] = useState(false as boolean);
  const [ editMode, setEditMode ] = useState("" as string);
  const [ recipeID, setRecipeID ] = useState(-1 as number);


  // Handle clicks on the Edit button.
  const handleEdit: Function = (inID: number) => {

    console.log("Recipes.handleEdit()", inID);

    // Launch the dialog in update mode, which means the existing recipe's ID has to be provided.
    setEditMode("Update Recipe");
    setRecipeID(inID);
    setIsEditVisible(true);

  }; /* End handleEdit(). */


  // Handle clicks on the Add Recipe button.
  const handleAdd: MouseEventHandler = (): void => {

    console.log("Recipes.handleAdd()");

    // Launch the dialog in add mode, which means a recipe ID of -1 to indicate it's not pre-existing.
    setEditMode("Add Recipe");
    setRecipeID(-1);
    setIsEditVisible(true);

  }; /* End handleAdd(). */


  // Return component config.
  return (
    <Layout style={{ height: "100vh" }}>
      {isEditVisible &&
        <RecipesEdit editMode={editMode} recipeID={recipeID} setRecipeID={setRecipeID}
          isEditVisible={isEditVisible} setIsEditVisible={setIsEditVisible} />
      }
      <PageHeader
        onBack={ (): void => { navigate("/static/index.html", { replace: true }); } }
        title="Home"
        subTitle="Recipes" />
      <Content style={{
        color: "#ffffff", overflow: "auto", display: "flex", flexDirection: "column", justifyContent: "normal",
        alignItems: "center"
      }}>
        { gs.recipes.get().map(inRecipe => {
          return (
            <Card type="inner" title={inRecipe.name} style={{ width: 640, margin: 10, borderRadius: "8px",
              boxShadow: "10px 6px 8px rgba(255, 255, 255, 0.5)" }} key={inRecipe.id}
              extra={<Button type="primary" shape="round"
              onClick={ (): void => { handleEdit(inRecipe.id); } }>Edit</Button>}>
              <Rate value={inRecipe.rating} />
              <br /><br />
              {inRecipe.description}
              <br /><br />
              Serves {inRecipe.serves} people
              <br /><br />
              <ul>
                { inRecipe.ingredient_set.map(inIngredient => {
                  return (
                     <li key={inIngredient.id}>
                      {inIngredient.name} ({inIngredient.amount} {inIngredient.amount_unit})
                    </li>
                  );
                }) }
              </ul>
            </Card>
          );
         } ) }
      </Content>
      <Footer style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Button type="primary" shape="round" onClick={handleAdd}>Add Recipe</Button>
      </Footer>
    </Layout>
  );


}; /* End component. */


console.log("Recipes.tsx loaded");
