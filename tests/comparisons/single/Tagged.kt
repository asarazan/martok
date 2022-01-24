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

@Serializable(with = Tagged.UnionSerializer::class)
sealed class Tagged {
    abstract val id: String
    abstract val foo: String?
    abstract val type: String

    @Serializable
    data class Tagged1(
        override val id: String,
        override val foo: String?,
        override val type: String,
        val state: State1
    ) : Tagged()

    @Serializable
    data class Tagged2(
        override val id: String,
        override val foo: String?,
        override val type: String,
        val state: State2
    ) : Tagged()

    object UnionSerializer : JsonContentPolymorphicSerializer<Tagged>(Tagged::class) {
        override fun selectDeserializer(element: JsonElement) = when(
            val type = element.jsonObject["type"]
        ) {
            JsonPrimitive("type1") -> Tagged1.serializer()
            JsonPrimitive("type2") -> Tagged2.serializer()
            else -> throw IllegalArgumentException("Unexpected type: $type")
        }
    }
}

@Serializable
data class State1(
    val foo: String,
    val bar: Double
)

@Serializable
data class State2(
    val foo: Boolean,
    val bar: String
)
