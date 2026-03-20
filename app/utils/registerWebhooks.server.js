export async function registerWebhooks(admin) {
  const topics = [
    "ORDERS_CREATE",
    "ORDERS_FULFILLED",
    "ORDERS_UPDATED",
  ];

  for (const topic of topics) {
    await admin.graphql(
      `#graphql
      mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!) {
        webhookSubscriptionCreate(
          topic: $topic
          webhookSubscription: {
            callbackUrl: "https://YOUR_APP_URL/webhooks/orders"
            format: JSON
          }
        ) {
          userErrors {
            message
          }
        }
      }`,
      { variables: { topic } }
    );
  }
}
