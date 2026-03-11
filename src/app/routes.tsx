import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CreateVideoPage } from "./pages/CreateVideoPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "create", Component: CreateVideoPage },
    ],
  },
]);
