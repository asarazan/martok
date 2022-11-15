/**
 * Represents a subscription to the push streaming server.
 * @see https://docs.joinmastodon.org/entities/pushsubscription/
 */
export type PushSubscription = {
  // Required Attributes

  /**
   * Description: The id of the push subscription in the database.
   * Type: String (cast from an integer, but not guaranteed to be a number)
   * Version history: Added in 2.4.0
   */
  id: string;

  /**
   * Description: Where push alerts will be sent to.
   * Type: String (URL)
   * Version history: Added in 2.4.0
   */
  endpoint: string;

  /**
   * Description: The streaming server's VAPID key.
   * Type: String
   * Version history: Added in 2.4.0
   */
  server_key: string;

  /**
   * Description: Which alerts should be delivered to the endpoint.
   * Type: Hash
   * Version history: Added in 2.4.0. alerts[poll] added in 2.8.0.
   */
  alerts: {
    /**
     * Receive a push notification when someone has followed you? Boolean.
     */
    follow: boolean;

    /**
     * Receive a push notification when a status you created has been favourited by someone else? Boolean.
     */
    favourites: boolean;

    /**
     * Receive a push notification when someone else has mentioned you in a status? Boolean.
     */
    mention: boolean;

    /**
     * Receive a push notification when a status you created has been boosted by someone else? Boolean.
     */
    reblog: boolean;

    /**
     * Receive a push notification when a poll you voted in or created has ended? Boolean. Added in 2.8.0
     */
    poll: boolean;
  };
};
