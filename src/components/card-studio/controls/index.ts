/**
 * The card controls, one set for the card studio and (from Phase 4)
 * onboarding. Each is controlled, knows nothing of the draft that holds it,
 * makes no call, and is drawn on the kit.
 */
export { CardColourPicker } from "./CardColourPicker";
export { StampColourPicker } from "./StampColourPicker";
export { TextColourPicker } from "./TextColourPicker";
export { StampPicker, type StampPicture } from "./StampPicker";
export { TexturePicker } from "./TexturePicker";
export { StampCountControl } from "./StampCountControl";
export { RewardField } from "./RewardField";
export { ColourPickerPanel } from "./ColourPickerPanel";
export {
  MAX_STAMPS,
  MIN_STAMPS,
  REWARD_MAX,
  automaticText,
  isFaint,
  matchingLook,
  type CardColours,
  type ReadyLook,
} from "./controlRules";
