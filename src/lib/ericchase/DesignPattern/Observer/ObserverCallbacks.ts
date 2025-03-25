export type SubscriptionCallback<Value> = (value: Value, unsubscribe: () => void) => void;
export type UpdateCallback<Value> = (value: Value) => Value;
