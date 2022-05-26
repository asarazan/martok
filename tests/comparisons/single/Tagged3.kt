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
data class NestedLiteralUnion(
  val id: String,
  val data: Data
) {
  @Serializable(with = Data.UnionSerializer::class)
  sealed class Data {
    abstract val type: Type
    @Serializable
    enum class Type(
      val serialName: String
    ) {
      @SerialName("foo") FOO("foo"),
      @SerialName("bar") BAR("bar");
    }


    @Serializable
    data class DataFoo(
      val data: Foo
    ) : Data() {
      override val type = Type.FOO
    }


    @Serializable
    data class DataBar(
      val data: Bar
    ) : Data() {
      override val type = Type.BAR
    }


    object UnionSerializer : JsonContentPolymorphicSerializer<Data>(Data::class) {
      override fun selectDeserializer(element: JsonElement) = when(
              val type = element.jsonObject["type"]
          ) {
              JsonPrimitive(Type.FOO.serialName) -> DataFoo.serializer()
              JsonPrimitive(Type.BAR.serialName) -> DataBar.serializer()
              else -> throw IllegalArgumentException("Unexpected type: $type")
      }
    }
  }
}

@Serializable
data class Foo(
  val foo: String
)

@Serializable
data class Bar(
  val bar: String
)
