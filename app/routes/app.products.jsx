import { Page, Card, Layout } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { db } from "../db.server";
import ProductTable from "../components/ProductTable";

// ---------------- LOADER ----------------
export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");

  const response = await admin.graphql(
    `#graphql
    query GetProducts($cursor: String) {
      products(first: 20, after: $cursor) {
        edges {
          node {
            id
            title
            handle
            status
            totalInventory
            createdAt
            updatedAt
            priceRangeV2 {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  url
                }
              }
            }
            vendor
            productType
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }`,
    {
      variables: {
        cursor: cursor || null,
      },
    }
  );

  const json = await response.json();

  // Load GST data for products
  const productIds = json.data.products.edges.map(({ node }) => node.id);
  const gstData = await db.productGST.findMany({
    where: {
      shop: session.shop,
      productId: { in: productIds },
    },
  });

  // Create a map of product GST data
  const gstMap = {};
  gstData.forEach((gst) => {
    gstMap[gst.productId] = gst;
  });

  return {
    products: json.data.products.edges,
    pageInfo: json.data.products.pageInfo,
    gstData: gstMap,
  };
}

// ---------------- ACTION ----------------
export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  const productId = formData.get("productId");
  const gstPercentage = parseFloat(formData.get("gstPercentage") || "18");
  const hsnCode = formData.get("hsnCode") || "";
  const taxCategory = formData.get("taxCategory") || "";

  if (!productId) {
    return { ok: false, message: "Missing product ID" };
  }

  try {
    await db.productGST.upsert({
      where: {
        shop_productId: {
          shop: session.shop,
          productId,
        },
      },
      update: {
        gstPercentage,
        hsnCode,
        taxCategory,
      },
      create: {
        shop: session.shop,
        productId,
        gstPercentage,
        hsnCode,
        taxCategory,
      },
    });

    return { ok: true, message: "GST settings saved" };
  } catch (error) {
    console.error("Error saving GST data:", error);
    return { ok: false, message: "Failed to save GST settings" };
  }
}

// ---------------- PAGE COMPONENT ----------------
export default function ProductsPage() {
  const { products, pageInfo, gstData } = useLoaderData();

  return (
    <Page>
      <TitleBar title="Products" />
      <Layout>
        <Layout.Section>
          <Card>
            <ProductTable products={products} pageInfo={pageInfo} gstData={gstData} />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
