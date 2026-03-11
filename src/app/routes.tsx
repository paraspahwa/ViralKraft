import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CreateVideoPage } from "./pages/CreateVideoPage";
import { LoginPage } from "./pages/LoginPage";
import { FooterInfoPage } from "./pages/FooterInfoPage";
import { ContactInquiriesPage } from "./pages/ContactInquiriesPage";
import { FOOTER_PAGES } from "./lib/footerPages";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "startfree", Component: LoginPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "dashboard/inquiries", Component: ContactInquiriesPage },
      { path: "create", Component: CreateVideoPage },
      ...FOOTER_PAGES.map((page) => ({
        path: page.path.replace(/^\//, ""),
        Component: FooterInfoPage,
      })),
    ],
  },
]);
