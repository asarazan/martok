export const StandardKotlinImportList = [
  `import kotlinx.serialization.KSerializer`,
  `import kotlinx.serialization.SerialName`,
  `import kotlinx.serialization.Serializable`,
  `import kotlinx.serialization.descriptors.PrimitiveKind`,
  `import kotlinx.serialization.descriptors.PrimitiveSerialDescriptor`,
  `import kotlinx.serialization.descriptors.SerialDescriptor`,
  `import kotlinx.serialization.encoding.Decoder`,
  `import kotlinx.serialization.encoding.Encoder`,
  `import kotlinx.serialization.json.JsonContentPolymorphicSerializer`,
  `import kotlinx.serialization.json.JsonElement`,
  `import kotlinx.serialization.json.JsonObject`,
  `import kotlinx.serialization.json.JsonPrimitive`,
  `import kotlinx.serialization.json.jsonObject`,
];

export const StarKotlinImport = "import kotlinx.serialization.*";
export const StandardKotlinImports = StandardKotlinImportList.join("\n");
