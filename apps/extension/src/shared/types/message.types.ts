import { Link } from "./common.types";

export interface EditLinkMessage {
  type: "EDIT_LINK";
  link: Link;
}

export interface PageFocusMessage {
  type: "PAGE_FOCUS";
  hostname: string;
  ts: number;
}

export interface PageBlurMessage {
  type: "PAGE_BLUR";
  hostname: string;
  ts: number;
}

export interface TrackSaveMessage {
  type: "TRACK_SAVE";
  hostname: string;
}

export type ExtensionMessage =
  | EditLinkMessage
  | PageFocusMessage
  | PageBlurMessage
  | TrackSaveMessage;
