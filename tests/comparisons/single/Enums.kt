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
enum class Strings {
    @SerialName("one") ONE,
    @SerialName("two") TWO
}

@Serializable(with = Ordinals.Companion::class)
enum class Ordinals(val value: Int) {
    ZERO(0),
    ONE(1);

    companion object : KSerializer<Ordinals> {
        override val descriptor: SerialDescriptor =
            PrimitiveSerialDescriptor("net.sarazan.martok.Ordinals", PrimitiveKind.INT)

        override fun deserialize(decoder: Decoder) = when (val value = decoder.decodeInt()) {
            0      -> ZERO
            1      -> ONE
            else   -> throw IllegalArgumentException("Ordinals could not parse: $value")
        }

        override fun serialize(encoder: Encoder, value: Ordinals) {
            return encoder.encodeInt(value.value)
        }
    }
}

@Serializable(with = Numbers.Companion::class)
enum class Numbers(val value: Int) {
    ONE(1),
    TWO(2),
    THREE(3);

    companion object : KSerializer<Numbers> {
        override val descriptor: SerialDescriptor =
            PrimitiveSerialDescriptor("net.sarazan.martok.Numbers", PrimitiveKind.INT)

        override fun deserialize(decoder: Decoder) = when (val value = decoder.decodeInt()) {
            1      -> ONE
            2      -> TWO
            3      -> THREE
            else   -> throw IllegalArgumentException("Numbers could not parse: $value")
        }

        override fun serialize(encoder: Encoder, value: Numbers) {
            return encoder.encodeInt(value.value)
        }
    }
}