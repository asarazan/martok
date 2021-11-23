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
data class AllIntrinsics(
    val str: String,
    val literalString: String,
    val num: Double,
    val literalNum: Double,
    val bool: Boolean,
    val literalBool: Boolean,
    val strings: List<String>,
    val obj: JsonObject
)