import { spfi } from "@pnp/sp";
import { SPFx } from "@pnp/sp/presets/all";
import { WebPartContext } from "@microsoft/sp-webpart-base";

let _sp: ReturnType<typeof spfi> | null = null;

export const setupSP = (context: WebPartContext): void => {
  _sp = spfi().using(SPFx(context));
};

export const getSp = () => {
  if (!_sp) {
    throw Error("You must call setupSP(context) first.");
  }
  return _sp;
};
