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

import net.sarazan.martok.WithLineComment

/**
 * Block Comment
 */
@Serializable
data class WithBlockComment(

  /**
   * Testing
   */
  val foo: String,

  /**
   * Testing with int.
   * @precision int
   */
  val bar: Int,

  /**
   * Testing with [WithLineComment]
   */
  val comment: WithLineComment
)

// This is a line comment.
@Serializable
data class WithLineComment(
  // So is this.
  val foo: Boolean
)
