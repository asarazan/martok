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
        abstract val type: String
        @Serializable
        data class Data1(
            override val type: String,
            val data: Foo
        ) : Data()


        @Serializable
        data class Data2(
            override val type: String,
            val data: Bar
        ) : Data()


        object UnionSerializer : JsonContentPolymorphicSerializer<Data>(Data::class) {
            override fun selectDeserializer(element: JsonElement) = when(
                val type = element.jsonObject["type"]
            ) {
                JsonPrimitive("foo") -> Data1.serializer()
                JsonPrimitive("bar") -> Data2.serializer()
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
