package net.sarazan.martok

import kotlinx.serialization.KSerializer
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.descriptors.PrimitiveKind
import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.JsonObject

@Serializable
data class StringUnion(
    val foo: Foo
){
    @Serializable(with = Foo.Companion::class)
    enum class Foo(val value: String) {
        BAR_BAR("barBar"),
        BAZ_BAZ("bazBaz");
        companion object : KSerializer<Foo> {
            override val descriptor: SerialDescriptor get() {
                return PrimitiveSerialDescriptor("net.sarazan.martok.StringUnion.Foo", PrimitiveKind.STRING)
            }
            override fun deserialize(decoder: Decoder): Foo = when (val value = decoder.decodeString()) {
                "barBar" -> BAR_BAR
                "bazBaz" -> BAZ_BAZ
                else -> throw IllegalArgumentException("Foo could not parse: $value")
            }
            override fun serialize(encoder: Encoder, value: Foo) {
                return encoder.encodeString(value.value)
            }
        }
    }
}

@Serializable
data class NumberStringUnion(
    val foo: Foo
){
    @Serializable(with = Foo.Companion::class)
    enum class Foo(val value: String) {
        _1_1("1.1"),
        _2("2");
        companion object : KSerializer<Foo> {
            override val descriptor: SerialDescriptor get() {
                return PrimitiveSerialDescriptor("net.sarazan.martok.NumberStringUnion.Foo", PrimitiveKind.STRING)
            }
            override fun deserialize(decoder: Decoder): Foo = when (val value = decoder.decodeString()) {
                "1.1" -> _1_1
                "2" -> _2
                else -> throw IllegalArgumentException("Foo could not parse: $value")
            }
            override fun serialize(encoder: Encoder, value: Foo) {
                return encoder.encodeString(value.value)
            }
        }
    }
}


@Serializable
data class Nested(
    val foo: Foo
){
    @Serializable
    data class Foo(
        val bar: String,
        val baz: Baz
    ){
        @Serializable(with = Baz.Companion::class)
        enum class Baz(val value: String) {
            ONE("one"),
            TWO("two");
            companion object : KSerializer<Baz> {
                override val descriptor: SerialDescriptor get() {
                    return PrimitiveSerialDescriptor("net.sarazan.martok.Nested.Foo.Baz", PrimitiveKind.STRING)
                }
                override fun deserialize(decoder: Decoder): Baz = when (val value = decoder.decodeString()) {
                        "one" -> ONE
                        "two" -> TWO
                    else -> throw IllegalArgumentException("Baz could not parse: $value")
                }
                override fun serialize(encoder: Encoder, value: Baz) {
                    return encoder.encodeString(value.value)
                }
            }
        }
    }
}

@Serializable
data class SimplePoly(
    val foo: String? = null,
    val bar: Double? = null,
    val baz: Boolean? = null
)
