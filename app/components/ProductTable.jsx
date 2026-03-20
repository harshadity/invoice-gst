import {
  Badge,
  Button,
  DataTable,
  TextField,
  Thumbnail,
  Modal,
  InlineStack,
  BlockStack,
  Text,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import { useNavigate, useSearchParams, useFetcher } from "react-router";

export default function ProductTable({ products = [], pageInfo, gstData = {} }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [queryValue, setQueryValue] = useState("");
  const [sortSelected, setSortSelected] = useState(["title asc"]);
  const [gstModalActive, setGstModalActive] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [gstPercentage, setGstPercentage] = useState("18");
  const [hsnCode, setHsnCode] = useState("");
  const [taxCategory, setTaxCategory] = useState("");
  const fetcher = useFetcher();

  const filterProducts = useCallback((products) => {
    if (!queryValue) return products;
    
    const searchTerm = queryValue.toLowerCase();
    
    return products.filter(product => 
      product.title.toLowerCase().includes(searchTerm) ||
      product.vendor.toLowerCase().includes(searchTerm) ||
      product.productType.toLowerCase().includes(searchTerm)
    );
  }, [queryValue]);

  const sortProducts = useCallback((products) => {
    const [sortKey, sortDirection] = sortSelected[0].split(' ');
    
    return [...products].sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return sortDirection === 'asc' 
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        case 'vendor':
          return sortDirection === 'asc'
            ? a.vendor.localeCompare(b.vendor)
            : b.vendor.localeCompare(a.vendor);
        case 'price':
          return sortDirection === 'asc'
            ? a.minPrice - b.minPrice
            : b.minPrice - a.minPrice;
        case 'inventory':
          return sortDirection === 'asc'
            ? a.totalInventory - b.totalInventory
            : b.totalInventory - a.totalInventory;
        case 'date':
          return sortDirection === 'asc'
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  }, [sortSelected]);

  const handleEditGST = useCallback((product) => {
    const productGst = gstData[product.id];
    setSelectedProduct(product);
    setGstPercentage(productGst?.gstPercentage?.toString() || "18");
    setHsnCode(productGst?.hsnCode || "");
    setTaxCategory(productGst?.taxCategory || "");
    setGstModalActive(true);
  }, [gstData]);

  const handleSaveGST = useCallback(() => {
    if (selectedProduct) {
      fetcher.submit(
        {
          productId: selectedProduct.id,
          gstPercentage,
          hsnCode,
          taxCategory,
        },
        { method: "POST" }
      );
      setGstModalActive(false);
    }
  }, [selectedProduct, gstPercentage, hsnCode, taxCategory, fetcher]);

  const tableProducts = Array.isArray(products) && products.length > 0
    ? sortProducts(
        filterProducts(
          products.map(({ node: product }) => ({
            id: product.id,
            title: product.title,
            status: product.status,
            vendor: product.vendor,
            productType: product.productType,
            totalInventory: product.totalInventory,
            minPrice: parseFloat(product.priceRangeV2.minVariantPrice.amount),
            maxPrice: parseFloat(product.priceRangeV2.maxVariantPrice.amount),
            priceDisplay: product.priceRangeV2.minVariantPrice.amount === product.priceRangeV2.maxVariantPrice.amount
              ? `${product.priceRangeV2.minVariantPrice.amount} ${product.priceRangeV2.minVariantPrice.currencyCode}`
              : `${product.priceRangeV2.minVariantPrice.amount} - ${product.priceRangeV2.maxVariantPrice.amount} ${product.priceRangeV2.minVariantPrice.currencyCode}`,
            imageUrl: product.images.edges[0]?.node.url,
            createdAt: new Date(product.createdAt).toLocaleDateString(),
            gstPercentage: gstData[product.id]?.gstPercentage || 18,
            hsnCode: gstData[product.id]?.hsnCode || "",
          }))
        )
      )
    : [];

  const rows = tableProducts.map(product => [
    <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Thumbnail
        source={product.imageUrl || ""}
        alt={product.title}
        size="small"
      />
      {product.title}
    </div>,
    <Badge key={product.status} status={product.status === "ACTIVE" ? "success" : "warning"}>
      {product.status}
    </Badge>,
    product.vendor,
    product.productType,
    product.priceDisplay,
    product.totalInventory,
    <div key={`gst-${product.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Text as="span">{product.gstPercentage}%</Text>
      {product.hsnCode && <Text as="span" tone="subdued">({product.hsnCode})</Text>}
    </div>,
    <Button key={`edit-${product.id}`} size="slim" onClick={() => handleEditGST(product)}>
      Edit GST
    </Button>,
  ]);

  const handleSort = useCallback((index, direction) => {
    const sortMapping = {
      0: 'title',
      2: 'vendor',
      4: 'price',
      5: 'inventory',
    };

    const sortKey = sortMapping[index];
    if (sortKey) {
      setSortSelected([`${sortKey} ${direction}`]);
    }
  }, []);

  const handleNextPage = useCallback(() => {
    if (pageInfo.hasNextPage) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("cursor", pageInfo.endCursor);
      navigate(`?${newParams.toString()}`);
    }
  }, [pageInfo, navigate, searchParams]);

  const handlePreviousPage = useCallback(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("cursor");
    navigate(`?${newParams.toString()}`);
  }, [navigate, searchParams]);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ padding: '16px' }}>
        <TextField
          label="Search products"
          value={queryValue}
          onChange={setQueryValue}
          clearButton
          onClearButtonClick={() => setQueryValue('')}
          placeholder="Search by title, vendor, or product type"
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
          'numeric',
          'text',
          'text'
        ]}
        headings={[
          "Product",
          "Status",
          "Vendor",
          "Type",
          "Price",
          "Inventory",
          "GST / HSN",
          "Actions"
        ]}
        rows={rows}
        sortable={[true, false, true, false, true, true, false, false]}
        defaultSortDirection="ascending"
        onSort={handleSort}
        stickyHeader
        increasedTableDensity
        hasZebraStripingOnData
        pagination={{
          hasNext: pageInfo.hasNextPage,
          onNext: handleNextPage,
          hasPrevious: searchParams.has("cursor"),
          onPrevious: handlePreviousPage,
        }}
      />

      <Modal
        open={gstModalActive}
        onClose={() => setGstModalActive(false)}
        title="Edit GST Settings"
        primaryAction={{
          content: 'Save',
          onAction: handleSaveGST,
          loading: fetcher.state === "submitting",
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setGstModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Text as="h3" variant="headingSm">
              {selectedProduct?.title}
            </Text>
            <TextField
              label="GST Percentage (%)"
              type="number"
              value={gstPercentage}
              onChange={setGstPercentage}
              autoComplete="off"
              helpText="Enter the GST tax percentage for this product"
            />
            <TextField
              label="HSN Code"
              value={hsnCode}
              onChange={setHsnCode}
              autoComplete="off"
              helpText="Harmonized System Nomenclature code"
            />
            <TextField
              label="Tax Category"
              value={taxCategory}
              onChange={setTaxCategory}
              autoComplete="off"
              helpText="Optional tax category classification"
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </div>
  );
} 