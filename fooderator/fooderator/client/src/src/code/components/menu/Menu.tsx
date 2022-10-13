import React, { ReactElement, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { none, useHookstate } from "@hookstate/core";
import axios from "axios";
import { Button, Layout, PageHeader, List, Dropdown, Menu, notification, MenuProps, Spin } from "antd";
const { Footer, Content } = Layout;
import globalState, { IMenuItem, IRecipe, getIndexOfRecipeByID } from "../../globalState";


/**
 * Menu component.
 */
export default (): ReactElement => {


  console.log("Menu()");


  // React Router hook.
  const navigate: NavigateFunction = useNavigate();


  // Get global state.
  const gs = useHookstate(globalState);


  // Local state.
  const [ showSpinner, setShowSpinner ] = useState(false as boolean);


  // Handle clicks on items on the Add Recipe button.
  const handleAdd: MenuProps["onClick"] = ({ key }) => {

    console.log("handleAdd()", key);

    // Find the index of the recipe to be added based on its ID and then mutate state with it.  Note that we have to
    // first ensure it's not a duplicate, and if it is, we show a notification.
    if (typeof gs.menuItems.get().find(inRecipe => inRecipe.id === parseInt(key)) !== "undefined") {

      notification.error({ message: "Duplicate", description: "That recipe is already on the menu" });

    } else {

      setShowSpinner(true);
      const menuItem: IMenuItem = { recipe: parseInt(key) };
      (async () => {

        const response: any = await axios.post("/api/v1/menuitem/", menuItem);
        console.log("response.data", response.data);

        // Now we can add the object we got back locally.
        gs.menuItems.merge([response.data])

        // And finally, hide the spinner and show a notification.
        setShowSpinner(false);
        notification.success({ message: "Recipe Added", description: "The recipe has been added to the menu" });

      })();

    }

  }; /* End handleAdd(). */


  // Handle clicks on the Remove button.
  const handleRemove: Function = (inMenuItemID: number, inIndex: number) => {

    console.log("handleRemove()", inMenuItemID);

    setShowSpinner(true);
    (async () => {

      const response: any = await axios.delete(`/api/v1/menuitem/${inMenuItemID}/`);
      console.log("response.data", response.data);

      // Now we can remove the object from our local data.
      gs.menuItems[inIndex].set(none);

      // And finally, hide the spinner and show a notification.
      setShowSpinner(false);
      notification.success({ message: "Recipe Removed", description: "The recipe has been removed from the menu" });

    })();

  }; /* End handleRemove(). */


  // Gets a recipe for a given ID.  Used to get the name and description for a menu item.
  const getRecipeForItem: Function = (inRecipeID: number): IRecipe => {

    console.log("getRecipeForItem()", inRecipeID);

    const indexOfRecipeInGSRecipes: number = getIndexOfRecipeByID(inRecipeID, "recipes");
    console.log("getRecipeForItem() indexOfRecipeInGSRecipes", indexOfRecipeInGSRecipes);

    const recipe = gs.recipes.get()[indexOfRecipeInGSRecipes];
    console.log("getRecipeForItem() recipe", recipe);

    return recipe;

  }; /* End getRecipeForItem(). */


  // Return component config.
  return (
    <Spin size="large" spinning={showSpinner}>
      <Layout style={{ height: "100vh" }}>

        <PageHeader title="Home" subTitle="Menu"
          onBack={ (): void => { navigate("/static/index.html", { replace: true } ); } }></PageHeader>

        <Content style={{
          color: "#ffffff", overflow: "auto", display: "flex", flexDirection: "column", justifyContent: "normal",
          alignItems: "center"
        }}>
          <List itemLayout="horizontal" dataSource={gs.menuItems.get()} style={{ width: 640 }}
            renderItem={(inMenuItem, inIndex) => (
              <List.Item key={inMenuItem.id}
                actions={[<Button type="primary" shape="round"
                  onClick={ (): void => { handleRemove(inMenuItem.id, inIndex); } }>Remove</Button>]}>
                <List.Item.Meta description={getRecipeForItem(inMenuItem.recipe).description}
                  title={
                    <Button type="text" style={{ paddingLeft: 0 }}>{getRecipeForItem(inMenuItem.recipe).name}</Button>
                  } />
              </List.Item>
            )}/>
        </Content>

        <Footer style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Dropdown placement="top" trigger={["click"]} arrow={{pointAtCenter: true}}
            overlay={
              <Menu onClick={handleAdd}
                items={gs.recipes.get().map(inRecipe => { return ({ key: inRecipe.id, label: inRecipe.name }); })}/>
            }>
            <Button type="primary" shape="round">Add Recipe</Button>
          </Dropdown>
        </Footer>

      </Layout>
    </Spin>
  );


}; /* End Menu component. */


console.log("Menu.tsx loaded");
