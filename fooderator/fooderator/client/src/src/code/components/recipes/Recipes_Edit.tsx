import React, { MouseEventHandler, ReactElement, useEffect, useState } from "react";
import { Button, Divider, Form, Input, InputNumber, List, Modal, notification, Popconfirm, Rate, Space,
  Spin
} from "antd";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
const { TextArea } = Input;
import { none, useHookstate } from "@hookstate/core";
import globalState, { IIngredient, IRecipe, getIndexOfRecipeByID } from "../../globalState";
import axios from "axios";


/**
 * Edit recipe dialog component (does double duty for adding a recipe).
 */
export default (inProps): ReactElement => {


  console.log("Recipes_Edit()", inProps);


  // Get global state.
  const gs = useHookstate(globalState);


  // We need the useForm hook in order to set the initial values when editing a recipe.
  const [ form ] = Form.useForm();


  // Local state.
  const [ ingredients, setIngredients ] = useState([] as Array<IIngredient>);
  const [ addIngredientData, setAddIngredientData ] =
    useState({ name: "", amount: 0, amount_unit: "" } as IIngredient);
  const [ showSpinner, setShowSpinner ] = useState(false as boolean);


  // When the component mounts, we need to set the list of ingredients for the recipe being edited, if any, but only
  // if it hasn't already been done (since this will be called every render cycle, and we can't add an empty array at
  // the end, or we'll wind up doing this over and over again).
  useEffect((): void => {

    console.log("useEffect()");

    if (inProps.recipeID !== -1) {

      // We're editing a recipe, so find the index of the recipe to be edited based on its ID, get the recipe, and
      // set the form fields to the existing values.
      console.log("Updating existing recipe");
      const indexOfRecipeInGSRecipes: number = getIndexOfRecipeByID(inProps.recipeID, "recipes");
      const recipe: IRecipe = gs.recipes.get()[indexOfRecipeInGSRecipes];
      form.setFieldsValue(
        { name: recipe.name, description: recipe.description, rating: recipe.rating, serves: recipe.serves }
      );
      setIngredients([...recipe.ingredient_set]);

    }

  }, []); /* End useEffect(). */


  // Called any time a field is changed.  Used to store the add ingredient field values.
  const handleChanges = (changedFields, allFields): void => {

    console.log("handleChanges()", changedFields[0].name[0], changedFields, allFields);

    // Although we're passed an array, it's always the first element we're interested in.
    const changedFieldName: string = changedFields[0].name[0];

    // The name we're passed MAY have a pipe character in it.  Those are the ingredient add fields, and it's all we
    // actually care about here.
    const locationOfPipe: number = changedFieldName.indexOf("|");

    // And, if it IS one of those fields, then and only then do we store the updated value, and we do that by taking
    // the value after the pipe, which matches the object property names, to make indexing the object very easy.
    if (locationOfPipe !== -1) {
      const aid: any = { ...addIngredientData };
      aid[changedFieldName.substring(locationOfPipe + 1)] = changedFields[0].value;
      setAddIngredientData(aid)
    }

  }; /* End handleChanges(). */


  // Handle clicks on the Save button.
  const handleSave = (inValues: any): void => {

    console.log("handleSave()", inValues, ingredients);

    setShowSpinner(true);

    // Create the recipe object.
    const recipe: IRecipe = {
      name: inValues.name,
      description: inValues.description,
      rating: inValues.rating,
      serves: inValues.serves,
      // Slight problem for ingredients: they're wrapped with Proxy's, but that breaks things, so we'll need to map
      // the array into a new array that removes the proxies.
      ingredient_set: ingredients.map((inIngredient) => { return {...inIngredient}; })
    };

    // Adding a new recipe.
    if (inProps.recipeID === -1) {

      console.log("handleSave() Saving NEW recipe", recipe);
      (async () => {

        const response: any = await axios.post("/api/v1/recipe/", recipe);
        console.log("response.data", response.data);

        // Now we can add the object we got back locally.
        gs.recipes.merge([response.data])

        // Show a success notification and close the dialog.
        notification.success({ message: "Recipe Saved", description: "The recipe has been saved" });
        inProps.setIsEditVisible(false);

      })();

    // Updating an existing recipe
    } else {

      // Need to add the ID field to the recipe object.
      recipe.id = inProps.recipeID;
      console.log("handleSave() Saving EXISTING recipe", recipe);
      (async () => {

        const response: any = await axios.put(`/api/v1/recipe/${recipe.id}/`, recipe);
        console.log("response.data", response.data);

        // Now we can replace the existing object with the one we got back locally.
        const indexOfRecipeInGSRecipes: number = getIndexOfRecipeByID(inProps.recipeID, "recipes");
        gs.recipes[indexOfRecipeInGSRecipes].set(response.data);

        // Show a success notification and close the dialog.
        notification.success({ message: "Recipe Saved", description: "The recipe has been updated" });
        inProps.setIsEditVisible(false);

      })();

    }

  }; /* End handleSave(). */


  // Handle clicks on the Delete confirm Yes button.
  const handleDeleteConfirm: MouseEventHandler = (): void => {

    console.log("handleDeleteConfirm()", inProps.recipeID);

    setShowSpinner(true);

    (async () => {

      const response: any = await axios.delete(`/api/v1/recipe/${inProps.recipeID}/`);
      console.log("response.data", response.data);

      // Now we can delete the existing object from global state.
      const indexOfRecipeInGSRecipes: number = getIndexOfRecipeByID(inProps.recipeID, "recipes");
      gs.recipes[indexOfRecipeInGSRecipes].set(none);

      // We also need to delete any menu item that references this recipe.  The deletion on the server will do that
      // automatically, but we have to take care of our local data manually.
      const indexOfRecipeInGSMenuItems: number = getIndexOfRecipeByID(inProps.recipeID, "menuItems");
      gs.menuItems[indexOfRecipeInGSMenuItems].set(none);

     // Show a success notification and close the dialog.
     notification.success({ message: "Recipe Deleted", description: "The recipe has been deleted" });
     inProps.setIsEditVisible(false);

    })();

  } /* End handleDeleteConfirm. */


  // Handle clicks on the (+) button next the ingredient entry row.
  const handleAddIngredient: MouseEventHandler = (): void => {

    console.log("handleAddIngredient()", addIngredientData);

    // Merge in the data for this ingredient, and then clear the ingredient data state so the form fields clear.
    // Note that we need to trim the name because that's going to be used as a key value when we build the shopping
    // list on the server-side later, and spaces would make that not work as expected.
    addIngredientData.name = addIngredientData.name.trim();
    setIngredients(ingredients.concat({ ...addIngredientData }));
    // Clear the add ingredient data and fields.
    setAddIngredientData({ name: "", amount: 0, amount_unit: "" })
    form.setFieldsValue({ "addIngredient|name": "", "addIngredient|amount": "", "addIngredient|amount_unit": "" });

  }; /* End handleAddIngredient(). */


  // Handle clicks on the (-) button next to an ingredient.
  const handleRemoveIngredient: Function = (inIndex: number): void => {

    console.log("handleRemoveIngredient()", inIndex);

    const ing: Array<IIngredient> = ingredients.filter((v, i) => inIndex !== i );
    console.log("handleRemoveIngredient() ing", ing);

    setIngredients(ing);

  }; /* End handleRemoveIngredient(). */


  // Return component config.
  return (
    <Modal title={inProps.editMode} visible={inProps.isEditVisible} centered footer={null} destroyOnClose={true}
      style={{ boxShadow: "0px 0px 30px 20px rgba(255, 255, 255, 0.5)" }} closable={false}>

      <Spin size="large" spinning={showSpinner}>

        <Form name="editRecipe" labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} preserve={false} form={form}
          initialValues={{ name: "", description: "", rating: 1, serves: 1 }}
          onFinish={handleSave} autoComplete="off" onFieldsChange={handleChanges}>

          <Form.Item label="Name" name="name"
            rules={[{ required: true, message: "Please enter a name for this recipe" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description"
            rules={[{ required: true, message: "Please enter a description for this recipe" }]}>
            <TextArea />
          </Form.Item>
          <Form.Item label="Rating" name="rating" rules={[{ required: false }]}>
            <Rate />
          </Form.Item>
          <Form.Item label="Serves" name="serves"
            rules={[{ required: true, message: "Please enter how many people this recipe serves" }]}>
            <InputNumber />
          </Form.Item>

          <Divider orientation="left">Ingredients</Divider>
          <Space align="baseline">
            <Form.Item name="addIngredient|name" rules={[{ required: false, message: "Required" }]}>
              <Input value={addIngredientData.name} placeholder="Name" style={{ width: 210 }} />
            </Form.Item>
            <Form.Item name="addIngredient|amount" rules={[{ required: false, message: "Required" }]}>
              <InputNumber value={addIngredientData.amount} placeholder="Amount" style={{ width: 90 }} />
            </Form.Item>
            <Form.Item name="addIngredient|amount_unit"  rules={[{ required: false, message: "Required" }]}>
              <Input value={addIngredientData.amount_unit} placeholder="Unit" style={{ width: 130 }} />
            </Form.Item>
            <PlusCircleOutlined onClick={ handleAddIngredient } />
          </Space>
          <div style={{ height: "210px", overflow: "auto" }}>
            <List itemLayout="horizontal" dataSource={ingredients}
              renderItem={(inIngredient: IIngredient, inIndex: number) => (
                <List.Item key={inIndex}
                  actions={[
                    <MinusCircleOutlined onClick={ (): void => handleRemoveIngredient(inIndex) } />
                  ]}>
                  <List.Item.Meta
                    title={`${inIngredient.name} ${inIngredient.amount} ${inIngredient.amount_unit}`} />
                </List.Item>
              )}
            />
          </div>
          <Divider orientation="left" />

          <Form.Item wrapperCol={{ offset: 13, span: 16 }}>
            <Space>
              <Button type="text" onClick={ () => { inProps.setIsEditVisible(false); } }>Cancel</Button>
              <Popconfirm title="Are you sure to delete this recipe?"
                okText="Delete" okType="danger" cancelButtonProps={{ type: "text" }} cancelText="Cancel"
                onConfirm={handleDeleteConfirm}>
                <Button danger disabled={inProps.editMode === "Add Recipe"}>Delete</Button>
              </Popconfirm>
              <Button type="primary" htmlType="submit">Save</Button>
            </Space>
          </Form.Item>

        </Form>

      </Spin>

    </Modal>
  );


}; /* End component. */


console.log("Recipes_Edit.tsx loaded");
