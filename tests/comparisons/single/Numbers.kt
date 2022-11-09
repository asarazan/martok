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

@Serializable
data class TestNumbers(
  /**
   * @precision float
   */
  val someFloat: Float,
  /**
   * @precision float
   */
  val someFloats: List<Float>,
  /**
   * @precision double
   */
  val someDouble: Double,
  /**
   * @precision double
   */
  val someDoubles: List<Double>,
  /**
   * @precision int
   */
  val someInt: Int,
  /**
   * @precision int
   */
  val someInts: List<Int>,
  /**
   * @precision long
   */
  val someLong: Long,
  /**
   * @precision long
   */
  val someLongs: List<Long>
)
