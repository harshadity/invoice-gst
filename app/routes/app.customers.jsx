import {
  Page,
  Card,
  Layout,
  Spinner,
  Button,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useLoaderData, useNavigation } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import CustomerTable from "../components/CustomerTable";
import AddB2BCustomerModal from "../components/AddB2BCustomerModal";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");

  const customersResponse = await admin.graphql(
    `#graphql
    query GetCustomers($cursor: String) {
      customers(first: 50, after: $cursor) {
        edges {
          node {
            id
            displayName
            email
            addresses {
              address1
              address2
              city
              country
            }
            amountSpent {
              amount
              currencyCode
            }
            verifiedEmail
            createdAt
          }
          cursor
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }`,
    { variables: { cursor } }
  );

  const json = await customersResponse.json();

  return {
    customers: json.data.customers.edges,
    pageInfo: json.data.customers.pageInfo,
  };
}

export default function CustomersPage() {
  const { customers, pageInfo } = useLoaderData();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  const [open, setOpen] = useState(false);

  return (
    <Page>
      <TitleBar title="Customers" />

      <Layout>
        <Layout.Section>
          <Card>
            {/* Header actions */}
            <InlineStack align="space-between" gap="200">
              <div />
              <Button variant="primary" onClick={() => setOpen(true)}>
                Add B2B Customer
              </Button>
            </InlineStack>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spinner accessibilityLabel="Loading customers" size="large" />
              </div>
            ) : (
              <CustomerTable customers={customers} pageInfo={pageInfo} />
            )}
          </Card>
        </Layout.Section>
      </Layout>

      {/* Modal */}
      <AddB2BCustomerModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </Page>
  );
}
