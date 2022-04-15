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
data class AnonList(
    val foo: List<FooItem>
) {
    @Serializable
    data class FooItem(
        val bar: String,
        val baz: Baz
    ) {
        @Serializable
        enum class Baz(
            val serialName: String
        ) {
            @SerialName("one") ONE("one"),
            @SerialName("two") TWO("two");
        }
    }
}

@Serializable
data class NumberUnion(
    val foo: Foo
) {
    @Serializable(with = Foo.Companion::class)
    enum class Foo(
        val value: Int
    ) {
        _1(1),
        _2(2);

        companion object : KSerializer<Foo> {
            override val descriptor: SerialDescriptor = PrimitiveSerialDescriptor("net.sarazan.martok.NumberUnion.Foo", PrimitiveKind.INT)

            override fun deserialize(decoder: Decoder) = when (val value = decoder.decodeInt()) {
                1      -> _1
                2      -> _2
                else   -> throw IllegalArgumentException("Foo could not parse: $value")
            }

            override fun serialize(encoder: Encoder, value: Foo) {
                return encoder.encodeInt(value.value)
            }
        }
    }
}

@Serializable
data class StringUnion(
    val foo: Foo
) {
    @Serializable
    enum class Foo(
        val serialName: String
    ) {
        @SerialName("barBar") BAR_BAR("barBar"),
        @SerialName("bazBaz") BAZ_BAZ("bazBaz");
    }
}

@Serializable
data class NumberStringUnion(
    val foo: Foo
) {
    @Serializable
    enum class Foo(
        val serialName: String
    ) {
        @SerialName("1.1") _1_1("1.1"),
        @SerialName("2") _2("2");
    }
}


@Serializable
data class Nested(
    val foo: Foo
) {
    @Serializable
    data class Foo(
        val bar: String,
        val baz: Baz
    ) {
        @Serializable
        enum class Baz(
            val serialName: String
        ) {
            @SerialName("one") ONE("one"),
            @SerialName("two") TWO("two");
        }
    }
}
