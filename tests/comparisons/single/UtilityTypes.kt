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
 * @expand
 */
@Serializable
data class WithOmit(
  val foo: String,
  val baz: Boolean? = null
)

/**
 * @expand
 */
@Serializable
data class WithPick(
  val bar: Double,
  val baz: Boolean? = null
)

/**
 * @expand
 */
@Serializable
data class WithPartial(
  val foo: String? = null,
  val bar: Double? = null,
  val baz: Boolean? = null
)

/**
 * @expand
 */
@Serializable
data class WithRequired(
  val foo: String,
  val bar: Double,
  val baz: Boolean
)

@Serializable
data class Base(
  val foo: String,
  val bar: Double,
  val baz: Boolean? = null
)
