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
data class WithDates(
    @Serializable(with = kotlinx.datetime.serializers.InstantIso8601Serializer::class)
    val utcDate1: kotlinx.datetime.Instant,
    @Serializable(with = kotlinx.datetime.serializers.InstantIso8601Serializer::class)
    val isoDate2: kotlinx.datetime.Instant,
    @Serializable(with = kotlinx.datetime.serializers.InstantIso8601Serializer::class)
    val fooDate: kotlinx.datetime.Instant,
    val justAString: String
)
