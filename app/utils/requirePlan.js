export function requirePlan(currentPlan, requiredPlan) {
  const order = ["FREE", "STARTUP", "BUSINESS", "ADVANCED"];
  return order.indexOf(currentPlan) >= order.indexOf(requiredPlan);
}
