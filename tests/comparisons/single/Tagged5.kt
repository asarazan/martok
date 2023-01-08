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
enum class Types(
  val serialName: String
) {
  @SerialName("type 1") TYPE1("type 1"),
  @SerialName("type 2") TYPE2("type 2");
}

@Serializable(with = Tagged.UnionSerializer::class)
sealed class Tagged {
  abstract val id: String
  abstract val foo: String?
  abstract val type: Types


  @Serializable
  data class TaggedType1(
    override val id: String,
    override val foo: String?,
    val state: String
  ) : Tagged() {
    override val type: Types = Types.TYPE1
  }


  @Serializable
  data class TaggedType2(
    override val id: String,
    override val foo: String?,
    val state: Double
  ) : Tagged() {
    override val type: Types = Types.TYPE2
  }


  object UnionSerializer : JsonContentPolymorphicSerializer<Tagged>(Tagged::class) {
    override fun selectDeserializer(element: JsonElement) = when(
            val type = element.jsonObject["type"]
        ) {
            JsonPrimitive(Types.TYPE1.serialName) -> TaggedType1.serializer()
            JsonPrimitive(Types.TYPE2.serialName) -> TaggedType2.serializer()
            else -> throw IllegalArgumentException("Unexpected type: $type")
    }
  }
}