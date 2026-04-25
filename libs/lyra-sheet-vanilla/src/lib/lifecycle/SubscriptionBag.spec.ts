import { SubscriptionBag } from './SubscriptionBag';

describe('SubscriptionBag', () => {
  it('runs cleanup callbacks once', () => {
    const bag = new SubscriptionBag();
    const cleanup = jest.fn();

    bag.add(cleanup);
    bag.cleanup();
    bag.cleanup();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes subscriptions once', () => {
    const bag = new SubscriptionBag();
    const subscription = { unsubscribe: jest.fn() };

    bag.add(subscription);
    bag.cleanup();
    bag.cleanup();

    expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
