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
    @SerialName("some_tag") abstract val someTag: SomeTag
    @Serializable
    enum class SomeTag(
        val serialName: String
    ) {
        @SerialName("foo") FOO("foo"),
        @SerialName("bar") BAR("bar");
    }


    @Serializable
    data class TaggedFoo(
        @SerialName("some_value1") val someValue1: String
    ) : Tagged() {
        @SerialName("some_tag") override val someTag: SomeTag = SomeTag.FOO
    }


    @Serializable
    data class TaggedBar(
        @SerialName("some_value2") val someValue2: String
    ) : Tagged() {
        @SerialName("some_tag") override val someTag: SomeTag = SomeTag.BAR
    }


    object UnionSerializer : JsonContentPolymorphicSerializer<Tagged>(Tagged::class) {
        override fun selectDeserializer(element: JsonElement) = when(
            val type = element.jsonObject["some_tag"]
        ) {
            JsonPrimitive(SomeTag.FOO.serialName) -> TaggedFoo.serializer()
            JsonPrimitive(SomeTag.BAR.serialName) -> TaggedBar.serializer()
            else -> throw IllegalArgumentException("Unexpected type: $type")
        }
    }
}

@Serializable
data class SnakeCase(
    @SerialName("some_union") val someUnion: SomeUnion,
    @SerialName("some_var") val someVar: String,
    @SerialName("stupid__var") val stupidVar: Boolean,
    @SerialName("some_ref") val someRef: Ref
) {
    @Serializable
    enum class SomeUnion(
        val serialName: String
    ) {
        @SerialName("foo_bar") FOO_BAR("foo_bar"),
        @SerialName("foo_baz") FOO_BAZ("foo_baz");
    }
}

@Serializable
data class Ref(
    val foo: String
)
