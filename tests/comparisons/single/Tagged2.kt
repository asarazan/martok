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
data class HasId(
  val id: String
)

@Serializable(with = IntersectionFirst.UnionSerializer::class)
sealed class IntersectionFirst {
  abstract val id: String
  abstract val type: Type
  @Serializable
  enum class Type(
    val serialName: String
  ) {
    @SerialName("foo") FOO("foo"),
    @SerialName("bar") BAR("bar");
  }


  @Serializable
  data class IntersectionFirstFoo(
    override val id: String,
    val foo: String
  ) : IntersectionFirst() {
    override val type: Type = Type.FOO
  }


  @Serializable
  data class IntersectionFirstBar(
    override val id: String,
    val bar: String
  ) : IntersectionFirst() {
    override val type: Type = Type.BAR
  }


  object UnionSerializer : JsonContentPolymorphicSerializer<IntersectionFirst>(IntersectionFirst::class) {
    override fun selectDeserializer(element: JsonElement) = when(
            val type = element.jsonObject["type"]
        ) {
            JsonPrimitive(Type.FOO.serialName) -> IntersectionFirstFoo.serializer()
            JsonPrimitive(Type.BAR.serialName) -> IntersectionFirstBar.serializer()
            else -> throw IllegalArgumentException("Unexpected type: $type")
    }
  }
}

@Serializable(with = UnionFirst.UnionSerializer::class)
sealed class UnionFirst {
  abstract val type: Type
  @Serializable
  enum class Type(
    val serialName: String
  ) {
    @SerialName("foo") FOO("foo"),
    @SerialName("bar") BAR("bar");
  }


  @Serializable
  data class UnionFirstFoo(
    val foo: String,
    val id: String
  ) : UnionFirst() {
    override val type: Type = Type.FOO
  }


  @Serializable
  data class UnionFirstBar(
    val bar: String,
    val id: String
  ) : UnionFirst() {
    override val type: Type = Type.BAR
  }


  object UnionSerializer : JsonContentPolymorphicSerializer<UnionFirst>(UnionFirst::class) {
    override fun selectDeserializer(element: JsonElement) = when(
            val type = element.jsonObject["type"]
        ) {
            JsonPrimitive(Type.FOO.serialName) -> UnionFirstFoo.serializer()
            JsonPrimitive(Type.BAR.serialName) -> UnionFirstBar.serializer()
            else -> throw IllegalArgumentException("Unexpected type: $type")
    }
  }
}
