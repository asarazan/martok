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
enum class MyEnum(
  val serialName: String
) {
  @SerialName("type 1") TYPE1("type 1"),
  @SerialName("type 2") TYPE2("type 2");
}

@Serializable(with = Tagged.UnionSerializer::class)
sealed class Tagged {

  abstract val id: String

  abstract val foo: String?

  abstract val type: Type

  @Serializable
  enum class Type(
    val serialName: String
  ) {
    @SerialName("type 1") TYPE_1("type 1"),
    @SerialName("type 2") TYPE_2("type 2"),
    @SerialName("otherType") OTHER_TYPE("otherType");
  }

  @Serializable
  data class TaggedType_1(

    override val id: String,

    override val foo: String?,

    val state: String
  ) : Tagged() {

    override val type: Type = Type.TYPE_1
  }

  @Serializable
  data class TaggedType_2(

    override val id: String,

    override val foo: String?,

    val state: Double
  ) : Tagged() {

    override val type: Type = Type.TYPE_2
  }

  @Serializable
  data class TaggedOtherType(

    override val id: String,

    override val foo: String?,

    val state: Boolean
  ) : Tagged() {

    override val type: Type = Type.OTHER_TYPE
  }

  object UnionSerializer : JsonContentPolymorphicSerializer<Tagged>(Tagged::class) {
    override fun selectDeserializer(element: JsonElement) = when(
            val type = element.jsonObject["type"]
        ) {
            JsonPrimitive(Type.TYPE_1.serialName) -> TaggedType_1.serializer()
            JsonPrimitive(Type.TYPE_2.serialName) -> TaggedType_2.serializer()
            JsonPrimitive(Type.OTHER_TYPE.serialName) -> TaggedOtherType.serializer()
            else -> throw IllegalArgumentException("Unexpected type: $type")
    }
  }
}
