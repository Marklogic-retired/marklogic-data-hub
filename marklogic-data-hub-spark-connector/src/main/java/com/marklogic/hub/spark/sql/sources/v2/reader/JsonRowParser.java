package com.marklogic.hub.spark.sql.sources.v2.reader;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import org.apache.spark.sql.catalyst.InternalRow;
import org.apache.spark.sql.catalyst.json.CreateJacksonParser;
import org.apache.spark.sql.catalyst.json.JSONOptions;
import org.apache.spark.sql.catalyst.json.JacksonParser;
import org.apache.spark.sql.types.StructType;
import org.apache.spark.unsafe.types.UTF8String;
import scala.Function1;
import scala.Function2;
import scala.collection.Seq;
import scala.compat.java8.JFunction;

/**
 * Utility class for using Scala's JacksonParser to parse a string of JSON into an InternalRow.
 */
public class JsonRowParser {

    private final JacksonParser jacksonParser;
    private final Function2<JsonFactory, String, JsonParser> jsonParserCreator;
    private final Function1<String, UTF8String> utf8StringCreator;

    public JsonRowParser(StructType sparkSchema) {
        JSONOptions jsonOptions = new JSONOptions(new scala.collection.immutable.HashMap<>(), "", "");
        this.jacksonParser = new JacksonParser(sparkSchema, jsonOptions);

        // Uses https://github.com/scala/scala-java8-compat so that Java8 lambdas can be used to implement Scala's
        // Function1 and Function2 interfaces
        this.jsonParserCreator = JFunction.func((jsonFactory, someString) -> CreateJacksonParser.string(jsonFactory, someString));
        this.utf8StringCreator = JFunction.func((someString) -> UTF8String.fromString(someString));
    }

    public Seq<InternalRow> parseJsonRow(String json) {
        return this.jacksonParser.parse(json, this.jsonParserCreator, this.utf8StringCreator);
    }
}
