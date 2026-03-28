
import {
  Outlet,
  useLoaderData,
  useRouteError,
  useNavigation,
  useLocation,
  Navigate,
  Link,
} from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import {
  AppProvider as PolarisAppProvider,
  Spinner,
  Box,
  Text,
} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";

/* ---------------- LOADER ---------------- */

export async function loader({ request }) {
  try {
    const { session } = await authenticate.admin(request);

    const url = new URL(request.url);
    const host = url.searchParams.get("host") || "";

    const settings = await db.appSettings.upsert({
      where: { shop: session.shop },
      update: {},
      create: { shop: session.shop },
    });

    return {
      apiKey: process.env.SHOPIFY_API_KEY || "",
      host,
      isOnboarded: settings.isOnboarded || false,
    };
  }
catch (error) {
  console.error("Auth Error:", error);

  const url = new URL(request.url);

  let shop = url.searchParams.get("shop");

  // 🔥 Decode host if shop not present
  if (!shop) {
    const host = url.searchParams.get("host");

    if (host) {
      try {
        const decoded = Buffer.from(host, "base64").toString("utf-8");
        shop = decoded.split("/")[0];
      } catch (e) {
        console.error("Host decode failed");
      }
    }
  }

  // ❌ Still no shop → show safe message (avoid crash)
  if (!shop) {
    return new Response("App needs to be opened from Shopify Admin", {
      status: 400,
    });
  }

  // ✅ Redirect to auth with correct shop
  throw new Response(null, {
    status: 302,
    headers: {
      Location: `/auth/login?shop=${shop}&embedded=1`,
    },
  });
}
}

/* ---------------- COMPONENT ---------------- */

export default function App() {
  const { apiKey, host, isOnboarded } = useLoaderData();
  const navigation = useNavigation();
  const location = useLocation();

  const isLoading =
    navigation.state === "loading" ||
    navigation.state === "submitting";



  return (
    <ShopifyAppProvider embedded apiKey={apiKey} host={host}>
      <PolarisAppProvider i18n={enTranslations}>

        {/* 🔥 GLOBAL LOADER */}
        {isLoading && (
          <Box
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <Spinner size="large" />
            <Text variant="headingMd">Loading...</Text>
          </Box>
        )}

        {/* NAVIGATION */}
        <s-app-nav>
          <s-link href="/app/onboarding">Invoice GST</s-link>  
          <s-link href="/app">Home</s-link>
          <Link to="/app/orders">Orders</Link>
          <Link to="/app/reports">Reports</Link>
          <Link to="/app/products">Products</Link>
          <Link to="/app/customers">Customers</Link>
          <Link to="/app/settings">Settings</Link>
          <Link to="/app/templates">Templates</Link>
          <Link to="/app/email-automation">Email Automation</Link>
          <Link to="/app/pricing">Pricing</Link>

          <s-link href="/app/additional">Additional page</s-link>
        </s-app-nav>

        <Outlet />

      </PolarisAppProvider>
    </ShopifyAppProvider>
  );
}

/* ---------------- ERROR HANDLING ---------------- */

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

