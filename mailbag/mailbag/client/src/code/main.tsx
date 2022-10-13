// Style imports.
import "normalize.css";
import "../css/main.css";

// React imports.
import React from "react";
import { createRoot, Root } from "react-dom/client";

// App imports.
import BaseLayout from "./components/BaseLayout";
import * as IMAP from "./IMAP";
import * as Contacts from "./Contacts";
import { getState } from "./state";


// Render the UI.
const baseComponent: Root = createRoot(document.getElementById("mainContainer")!);
baseComponent.render(<BaseLayout />);

// Because we don't know when the UI will actually be rendered, and because we depend on that happening before we can
// continue since we need access to state (which isn't created until the BaseLayout component is rendered), we'll do a
// timeout until we get a state object, then we can continue.
const intervalFunction = function(): void {
  if (getState() === null) {
    setTimeout(intervalFunction, 100);
  } else {
    startupFunction();
  }
}
intervalFunction();

// Go fetch the user's mailboxes, and then their contacts.  We have to use getState() here because state is a member
// of the BaseLayout instance, but we don't have a reference to that object, so we can't access it.  But, getState()
// returns the singleton instance created as part of construction of BaseLayout, so this accomplishes our goal.
const startupFunction = function(): void {
  getState().showHidePleaseWait(true);
  async function getMailboxes(): Promise<any> {
    const imapWorker: IMAP.Worker = new IMAP.Worker();
    const mailboxes: IMAP.IMailbox[] = await imapWorker.listMailboxes();
    mailboxes.forEach((inMailbox) => {
      getState().addMailboxToList(inMailbox);
    });
  }
  getMailboxes().then(function(): void {
    // Now go fetch the user's contacts.
    async function getContacts() {
      const contactsWorker: Contacts.Worker = new Contacts.Worker();
      const contacts: Contacts.IContact[] = await contactsWorker.listContacts();
      contacts.forEach((inContact) => {
        getState().addContactToList(inContact);
      });
    }
    getContacts().then(() => getState().showHidePleaseWait(false));
  });
};
