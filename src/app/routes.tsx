import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { FOOTER_PAGES } from "./lib/footerPages";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "login", Component: LoginPage },
      { path: "startfree", Component: LoginPage },
      {
        path: "dashboard",
        lazy: async () => ({
          Component: (await import("./pages/DashboardPage")).DashboardPage,
        }),
      },
      {
        path: "dashboard/inquiries",
        lazy: async () => ({
          Component: (await import("./pages/ContactInquiriesPage")).ContactInquiriesPage,
        }),
      },
      {
        path: "create",
        lazy: async () => ({
          Component: (await import("./pages/CreateVideoPage")).CreateVideoPage,
        }),
      },
      ...FOOTER_PAGES.map((page) => ({
        path: page.path.replace(/^\//, ""),
        lazy: async () => ({
          Component: (await import("./pages/FooterInfoPage")).FooterInfoPage,
        }),
      })),
    ],
  },
]);
