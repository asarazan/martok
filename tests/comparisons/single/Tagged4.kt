/****************************************************
** DO NOT EDIT THIS FILE BY HAND!                  **
** This file was automatically generated by Martok **
** More info at https://github.com/asarazan/martok **
*****************************************************/
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

@Serializable(with = Thing.UnionSerializer::class)
sealed class Thing {

  abstract val state: State
  abstract val type: Type

  @Serializable
  enum class Type(
    val serialName: String
  ) {
    @SerialName("foo") FOO("foo"),
    @SerialName("bar") BAR("bar");
  }

  @Serializable
  enum class State(
    val serialName: String
  ) {
    @SerialName("first") FIRST("first"),
    @SerialName("second") SECOND("second");
  }

  @Serializable
  data class ThingFoo(
    override val state: State
  ) : Thing() {
    override val type: Type = Type.FOO
  }

  @Serializable
  data class ThingBar(
    override val state: State
  ) : Thing() {

    override val type: Type = Type.BAR
  }

  object UnionSerializer : JsonContentPolymorphicSerializer<Thing>(Thing::class) {
    override fun selectDeserializer(element: JsonElement) = when(
            val type = element.jsonObject["type"]
        ) {
            JsonPrimitive(Type.FOO.serialName) -> ThingFoo.serializer()
            JsonPrimitive(Type.BAR.serialName) -> ThingBar.serializer()
            else -> throw IllegalArgumentException("Unexpected type: $type")
    }
  }
}

@Serializable
data class Base(
  val state: State
) {

  @Serializable
  enum class State(
    val serialName: String
  ) {
    @SerialName("first") FIRST("first"),
    @SerialName("second") SECOND("second");
  }
}