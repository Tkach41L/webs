// import OpinionsHandlerMustache from "./opinionsHandlerMustache.js";

import Router from "./paramHashRouter.js";
import Routes from "./routes.js";

import DropdownMenuControl from "./dropdownMenuControl.js";

window.opnsHndlr = new OpinionsHandlerMustache(
  "opnFrm",
  "opContainer",
  "target"
);
window.router = new Router(Routes, "welcome");
