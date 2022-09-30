package net.sarazan.martok.first

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

@Serializable(with = Foo.UnionSerializer::class)
sealed class Foo {
  abstract val type: Type
  @Serializable
  enum class Type(
    val serialName: String
  ) {
    @SerialName("type1") TYPE1("type1"),
    @SerialName("type2") TYPE2("type2");
  }


  @Serializable
  data class FooType1(
    val value: String
  ) : Foo() {
    override val type: Type = Type.TYPE1
  }


  @Serializable
  data class FooType2(
    val value: Double
  ) : Foo() {
    override val type: Type = Type.TYPE2
  }


  object UnionSerializer : JsonContentPolymorphicSerializer<Foo>(Foo::class) {
    override fun selectDeserializer(element: JsonElement) = when(
      val type = element.jsonObject["type"]
    ) {
      JsonPrimitive(Type.TYPE1.serialName) -> FooType1.serializer()
      JsonPrimitive(Type.TYPE2.serialName) -> FooType2.serializer()
      else -> throw IllegalArgumentException("Unexpected type: $type")
    }
  }
}

@Serializable
data class FooInternal(
  val ref: Foo.FooType2,
  val refList: List<Foo.FooType2>
)
