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
data class SnakeCase(
    @SerializedName("some_union") val someUnion: SomeUnion,
    @SerializedName("some_var") val someVar: String,
    @SerializedName("stupid__var") val stupidVar: Boolean,
    @SerializedName("some_ref") val someRef: Ref
) {
    @Serializable
    enum class SomeUnion(
        @SerializedName("serialName") val serialname: String
    ) {
        @SerialName("foo_bar") FOO_BAR("foo_bar"),
        @SerialName("foo_baz") FOO_BAZ("foo_baz");
    }
}

@Serializable
data class Ref(
    val foo: String
)
