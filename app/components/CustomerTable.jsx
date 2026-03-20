import {
    Badge,
    DataTable,
    TextField
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function CustomerTable({ customers = [], pageInfo }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [queryValue, setQueryValue] = useState("");
  const [sortSelected, setSortSelected] = useState(["name asc"]);

  const filterCustomers = useCallback((customers) => {
    if (!queryValue) return customers;
    
    const searchTerm = queryValue.toLowerCase();
    
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm) ||
      customer.city.toLowerCase().includes(searchTerm) ||
      customer.country.toLowerCase().includes(searchTerm)
    );
  }, [queryValue]);

  const sortCustomers = useCallback((customers) => {
    const [sortKey, sortDirection] = sortSelected[0].split(' ');
    
    return [...customers].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return sortDirection === 'asc' 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'email':
          return sortDirection === 'asc'
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email);
        case 'amount':
          return sortDirection === 'asc'
            ? a.amountSpent - b.amountSpent
            : b.amountSpent - a.amountSpent;
        case 'date':
          return sortDirection === 'asc'
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  }, [sortSelected]);

  const tableCustomers = Array.isArray(customers) && customers.length > 0 
    ? sortCustomers(
        filterCustomers(
          customers.map(({ node: customer }) => ({
            id: customer.id,
            name: customer.displayName,
            email: customer.email,
            city: customer.addresses[0]?.city || 'N/A',
            country: customer.addresses[0]?.country || 'N/A',
            amountSpent: parseFloat(customer.amountSpent.amount),
            amountDisplay: `${customer.amountSpent.amount} ${customer.amountSpent.currencyCode}`,
            verifiedEmail: customer.verifiedEmail,
            createdAt: new Date(customer.createdAt).toLocaleDateString(),
          }))
        )
      )
    : [];

  const resourceName = {
    singular: "customer",
    plural: "customers",
  };

  const rows = tableCustomers.map(customer => [
    customer.name,
    customer.email,
    customer.city,
    customer.country,
    customer.amountDisplay,
    <Badge key={customer.verifiedEmail} progress={customer.verifiedEmail ? "complete" : "incomplete"}>
      {customer.verifiedEmail ? "Verified" : "Unverified"}
    </Badge>,
    customer.createdAt
  ]);

  const handleSort = useCallback((index, direction) => {
    const sortMapping = {
      0: 'name',
      1: 'email',
      4: 'amount',
      6: 'date'
    };

    const sortKey = sortMapping[index];
    if (sortKey) {
      setSortSelected([`${sortKey} ${direction}`]);
    }
  }, []);

  const handleNextPage = useCallback(() => {
    const lastCursor = customers[customers.length - 1]?.cursor;
    if (lastCursor) {
      const params = new URLSearchParams(searchParams);
      params.set("cursor", lastCursor);
      navigate(`?${params.toString()}`);
    }
  }, [customers, navigate, searchParams]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ padding: '16px' }}>
        <TextField
          label="Search customers"
          value={queryValue}
          onChange={setQueryValue}
          clearButton
          onClearButtonClick={() => setQueryValue('')}
          placeholder="Search by name, email, city, or country"
          autoComplete="off"
        />
      </div>
      
      <DataTable
        columnContentTypes={[
          'text',
          'text',
          'text',
          'text',
          'numeric',
          'text',
          'text'
        ]}
        headings={[
          "Name",
          "Email",
          "City",
          "Country",
          "Amount Spent",
          "Email Status",
          "Created"
        ]}
        rows={rows}
        sortable={[true, true, true, true, true, false, true]}
        defaultSortDirection="ascending"
        cla
        onSort={handleSort}
        stickyHeader
        increasedTableDensity
        hasZebraStripingOnData
        pagination={{
          hasNext: pageInfo.hasNextPage,
          onNext: handleNextPage,
        }}
      />
    </div>
  );
} 