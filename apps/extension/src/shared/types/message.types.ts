import { Link } from "./common.types";

export interface EditLinkMessage {
  type: "EDIT_LINK";
  link: Link;
}

export type ExtensionMessage = EditLinkMessage;
