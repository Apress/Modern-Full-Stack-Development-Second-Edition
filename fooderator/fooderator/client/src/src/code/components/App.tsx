// noinspection HtmlUnknownTarget


import React, { ReactElement, useEffect, useState } from "react";
import { Spin } from "antd";
import { Link } from "react-router-dom";
import { useHookstate } from "@hookstate/core";
import axios from "axios";
import globalState from "../globalState";


/**
 * BaseLayout component.
 */
export default (): ReactElement => {


  console.log("App()");


  // Get global state and get the menu and recipes from it.
  const gs = useHookstate(globalState);


  // Local state.
  const [ showSpinner, setShowSpinner ] = useState(false as boolean);


  // Load data from server at startup.
  useEffect((): void => {
    if (gs.initialLoadComplete.get() === false) {
      setShowSpinner(true);
      console.log("LOADING DATA");
      (async () => {
        const responseRecipes: any = await axios.get("/api/v1/recipe/");
        console.log("responseRecipes.data", responseRecipes.data);
        const responseMenuItems: any = await axios.get("/api/v1/menuitem/");
        console.log("responseMenuItems.data", responseMenuItems.data);
        gs.recipes.merge([...responseRecipes.data]);
        gs.menuItems.merge([...responseMenuItems.data]);
        setShowSpinner(false);
        gs.initialLoadComplete.set(true);
      })();
    }
  }, []); /* End useEffect(). */


  // Return component config.
  return (
    <div style={{ textAlign: "center", position: "relative", top: "50%", transform: "translateY(-50%)" }}>
      <Spin size="large" spinning={showSpinner}>
        <h1>Fooderator Client</h1>
        <div style={{ padding: "10px" }}>
          <Link to="recipes"><img src="/static/recipes.png" alt="Recipes" /></Link>
        </div>
        <div style={{ padding: "10px" }}>
          <Link to="menu"><img src="/static/menu.png" alt="Menu" /></Link>
        </div>
        <div style={{ padding: "10px" }}>
          <Link to="shoppingList"><img src="/static/shopping_list.png" alt="Shopping List" /></Link>
        </div>
      </Spin>
    </div>
  );


}; /* End BaseLayout component. */


console.log("App.tsx loaded");
