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

@Serializable(with = IntersectionFirst.UnionSerializer::class)
sealed class IntersectionFirst {
    abstract val id: String
    abstract val type: String

    @Serializable
    data class IntersectionFirst1(
        override val id: String,
        override val type: String,
        val foo: String
    ) : IntersectionFirst()

    @Serializable
    data class IntersectionFirst2(
        override val id: String,
        override val type: String,
        val bar: String
    ) : IntersectionFirst()

    object UnionSerializer : JsonContentPolymorphicSerializer<IntersectionFirst>(IntersectionFirst::class) {
        override fun selectDeserializer(element: JsonElement) = when(
            val type = element.jsonObject["type"]
        ) {
            JsonPrimitive("foo") -> IntersectionFirst1.serializer()
            JsonPrimitive("bar") -> IntersectionFirst2.serializer()
            else -> throw IllegalArgumentException("Unexpected type: $type")
        }
    }
}

@Serializable(with = UnionFirst.UnionSerializer::class)
sealed class UnionFirst {
    abstract val type: String

    @Serializable
    data class UnionFirst1(
        override val type: String,
        val id: String,
        val foo: String
    ) : UnionFirst()

    @Serializable
    data class UnionFirst2(
        override val type: String,
        val id: String,
        val bar: String
    ) : UnionFirst()

    object UnionSerializer : JsonContentPolymorphicSerializer<UnionFirst>(UnionFirst::class) {
        override fun selectDeserializer(element: JsonElement) = when(
            val type = element.jsonObject["type"]
        ) {
            JsonPrimitive("foo") -> UnionFirst1.serializer()
            JsonPrimitive("bar") -> UnionFirst2.serializer()
            else -> throw IllegalArgumentException("Unexpected type: $type")
        }
    }
}
