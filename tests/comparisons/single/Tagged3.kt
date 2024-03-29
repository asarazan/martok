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

@Serializable(with = Empty.UnionSerializer::class)
sealed class Empty {
  abstract val type: Type
  @Serializable
  enum class Type(
    val serialName: String
  ) {
    @SerialName("foo") FOO("foo"),
    @SerialName("bar") BAR("bar");
  }


  @Serializable
  class EmptyFoo : Empty() {
    override val type: Type = Type.FOO
  }


  @Serializable
  class EmptyBar : Empty() {
    override val type: Type = Type.BAR
  }


  object UnionSerializer : JsonContentPolymorphicSerializer<Empty>(Empty::class) {
    override fun selectDeserializer(element: JsonElement) = when(
      val type = element.jsonObject["type"]
    ) {
      JsonPrimitive(Type.FOO.serialName) -> EmptyFoo.serializer()
      JsonPrimitive(Type.BAR.serialName) -> EmptyBar.serializer()
      else -> throw IllegalArgumentException("Unexpected type: $type")
    }
  }
}

@Serializable
data class NestedLiteralUnion(
  val id: String,
  val data: Data
) {
  @Serializable(with = Data.UnionSerializer::class)
  sealed class Data {
    abstract val some_type: SomeType
    @Serializable
    enum class SomeType(
      val serialName: String
    ) {
      @SerialName("foo") FOO("foo"),
      @SerialName("bar") BAR("bar");
    }


    @Serializable
    data class DataFoo(
      val data: Foo
    ) : Data() {
      override val some_type: SomeType = SomeType.FOO
    }


    @Serializable
    data class DataBar(
      val data: Bar
    ) : Data() {
      override val some_type: SomeType = SomeType.BAR
    }


    object UnionSerializer : JsonContentPolymorphicSerializer<Data>(Data::class) {
      override fun selectDeserializer(element: JsonElement) = when(
              val type = element.jsonObject["some_type"]
          ) {
              JsonPrimitive(SomeType.FOO.serialName) -> DataFoo.serializer()
              JsonPrimitive(SomeType.BAR.serialName) -> DataBar.serializer()
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
