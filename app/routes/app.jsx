import { Outlet, useLoaderData, useRouteError } from "react-router";
import { Link } from "react-router-dom";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider as ShopifyAppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";

  // eslint-disable-next-line no-undef
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    host,
  };
}

export default function App() {
  const { apiKey, host } = useLoaderData();

  return (
    <ShopifyAppProvider embedded apiKey={apiKey} host={host}>
      <PolarisAppProvider i18n={enTranslations}>
        <s-app-nav>
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

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
