import React from "react";
import { createBrowserRouter, RouterProvider, Outlet} from "react-router-dom";
import { SpeedInsights } from '@vercel/speed-insights'; 
import { Analytics } from '@vercel/analytics/react'
import Dashboard from "./components/Dashboard";
import Exchange from "./components/Exchange";
import Customize from "./components/Customize";
import Service from "./components/Service";
import Resell from "./components/Resell";
import Shop from "./components/Shop";
import Login from "./components/Login";
import FindCobbler from "./components/FindCobbler";
import Profile from "./components/Profile";
import Orders from "./components/Orders";
import Checkout from "./components/Checkout";
import Confirmation from "./components/Confirmation";
import Register from "./components/Register";
import ScrollToTop from "./components/ScrollToTop";
import FAQs from "./components/FAQs";
import Shipping from "./components/Shipping";
import SizeGuide from "./components/SizeGuide";
import Contact from "./components/Contact";
import Track from "./components/Track";
import About from "./components/About";
import Careers from "./components/Careers";
import Press from "./components/Press";
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";
import Error from "./components/Error";

function Root() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <Error />,
    children: [
    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/exchange",
      element: <Exchange />
    },
    {
      path: "/customize",
      element: <Customize />
    },
    {
      path: "/service",
      element: <Service />
    },
    {
      path: "/resell",
      element: <Resell />
    },
    {
      path: "/shop",
      element: <Shop />
    },
    {
      path: "/",
      element: <Dashboard />
    },
    {
      path: "/find-cobblers",
      element: <FindCobbler />
    },
    {
      path: "/profile",
      element: <Profile />
    },
    {
      path: "/orders",
      element: <Orders />
    },
    {
      path: "/checkout",
      element: <Checkout />
    },
    {
      path: "/confirmation",
      element: <Confirmation />
    },
    {
      path: "/register",
      element: <Register />
    },
    {
      path: "/faqs",
      element: <FAQs />
    },
    {
      path: "/shipping",
      element: <Shipping />
    },
    {
      path: "/size-guide",
      element: <SizeGuide />
    },
    {
      path: "/contact",
      element: <Contact />
    },
    {
      path: "/track",
      element: <Track />
    },
    {
      path: "/about",
      element: <About />
    },
    {
      path: "/careers",
      element: <Careers />
    },
    {
      path: "/press",
      element: <Press />
    },
    {
      path: "/privacy",
      element: <Privacy />
    },
    {
      path: "/terms",
      element: <Terms />
    },
    {
      path: "*",
      element: <Error />
    }
    ]
  }
]);

export default function App() {
  return (
    <>
      <SpeedInsights />
      <Analytics />
      <RouterProvider router={router} />
    </>
  );
}