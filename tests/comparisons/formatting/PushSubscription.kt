package net.sarazan.martok

import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.JsonContentPolymorphicSerializer
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject

/**
 * Represents a subscription to the push streaming server.
 * @see https://docs.joinmastodon.org/entities/pushsubscription/
 */
@Serializable
data class PushSubscription(

  /**
   * Description: The id of the push subscription in the database.
   * Type: String (cast from an integer, but not guaranteed to be a number)
   * Version history: Added in 2.4.0
   */
  val id: String,

  /**
   * Description: Where push alerts will be sent to.
   * Type: String (URL)
   * Version history: Added in 2.4.0
   */
  val endpoint: String,

  /**
   * Description: The streaming server's VAPID key.
   * Type: String
   * Version history: Added in 2.4.0
   */
  @SerialName("server_key")
  val serverKey: String,

  /**
   * Description: Which alerts should be delivered to the endpoint.
   * Type: Hash
   * Version history: Added in 2.4.0. alerts[poll] added in 2.8.0.
   */
  val alerts: Alerts
) {

  @Serializable
  data class Alerts(

    /**
     * Receive a push notification when someone has followed you? Boolean.
     */
    val follow: Boolean,

    /**
     * Receive a push notification when a status you created has been favourited by someone else? Boolean.
     */
    val favourites: Boolean,

    /**
     * Receive a push notification when someone else has mentioned you in a status? Boolean.
     */
    val mention: Boolean,

    /**
     * Receive a push notification when a status you created has been boosted by someone else? Boolean.
     */
    val reblog: Boolean,

    /**
     * Receive a push notification when a poll you voted in or created has ended? Boolean. Added in 2.8.0
     */
    val poll: Boolean
  )
}
