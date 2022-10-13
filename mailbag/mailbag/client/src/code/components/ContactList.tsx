// React imports.
import React from "react";

// Material-UI imports.
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Person from "@mui/icons-material/Person";
import { ListItemButton } from "@mui/material";


/**
 * Contacts.
 */
const ContactList = ({ state }): JSX.Element => (

  <List>

    {state.contacts.map(value => {
      return (
        <ListItem>
          <ListItemButton key={ value } onClick={ () => state.showContact(value._id, value.name, value.email) }>
            <ListItemAvatar>
              <Avatar>
                <Person />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={ `${value.name}` } />
          </ListItemButton>
        </ListItem>
      );
    })}

  </List>

); /* End Contacts. */


export default ContactList;
