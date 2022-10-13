import React, { ReactElement, useEffect, useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { Layout, PageHeader, Spin, Table } from "antd";
import axios from "axios";
const { Content } = Layout;


// A description of a Shopping List Item object.  Note we only need this here, hence why it's not in globalState.ts.
export interface IShoppingListItem {
  name: string,
  amount: number,
  amount_unit: string
}


/**
 * ShoppingList component.
 */
export default (): ReactElement => {


  console.log("ShoppingList()");


  // React Router hook.
  const navigate: NavigateFunction = useNavigate();


  // Local state.
  const [ showSpinner, setShowSpinner ] = useState(true as boolean);
  const [ shoppingListItems, setShoppingListItems ] = useState([] as Array<IShoppingListItem>);


  // Call the server to calculate the shopping list for us.  Note that even though this should only execute when we
  // navigate to this route, we'll still pass an empty array just to be certain of that.
  useEffect((): void => {

    console.log("useEffect()");

    (async () => {
      const responseShoppingListItems: any = await axios.get("/makeShoppingList");
      console.log("responseShoppingListItems.data", responseShoppingListItems.data);
      setShoppingListItems(responseShoppingListItems.data);
      setShowSpinner(false);
    })();

  }, []); /* End useEffect(). */


  // Return component config.
  // noinspection JSUnusedLocalSymbols
  return (
    <Spin size="large" spinning={showSpinner}>
      <Layout style={{ height: "100vh" }}>

        <PageHeader title="Home" subTitle="Shopping List"
          onBack={ (): void => { navigate("/static/index.html", { replace: true }); } }></PageHeader>

        <Content>
          <Table sticky={true} dataSource={shoppingListItems} rowKey={(inRecord) => inRecord.name}
            columns={[
              { title: "Name", dataIndex: "name", key: "name" },
              { title: "Amount", dataIndex: "amount", key: "amount" },
              { title: "Units", dataIndex: "amount_unit", key: "amountUnit" }
            ]}
          />
        </Content>

      </Layout>
    </Spin>
  );


}; /* End component. */


console.log("ShoppingList.tsx loaded");
