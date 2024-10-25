install.md
Kiểm tra log thay đổi: kafka-console-consumer --bootstrap-server localhost:9092 --topic source_customers --from-beginning  
Run: CLASSPATH=/Users/congdt/kafka_2.13-3.8.0/plugins/mysql/mysql-connector-j-8.3.0.jar ./bin/connect-standalone ./libexec/config/connect-standalone.properties /Users/congdt/Kafka/source-db-connector.properties /Users/congdt/Kafka/sink-db-connector.properties
Kiểm tra list topic: ─ /usr/local/Cellar/kafka/3.8.0/libexec/bin/kafka-topics.sh --list --bootstrap-server localcclear ─╯
plugin.path=/Users/congdt/kafka_2.13-3.8.0/plugins/confluentinc-kafka-connect-jdbc-10.8.0
plugin.path=/usr/local/Cellar/kafka/3.8.0/libexec/plugins
bootstrap.servers=localhost:9092
key.converter=org.apache.kafka.connect.storage.StringConverter
value.converter=org.apache.kafka.connect.storage.StringConverter

curl -X DELETE http://localhost:8083/connectors/sink-db-connector

curl -X POST -H "Content-Type: application/json" --data '{ ─╯ "name": "sink-db-connector",
"config": {
"connector.class": "io.confluent.connect.jdbc.JdbcSinkConnector",
"tasks.max": "1",
"topics": "source_customers",
"connection.url": "jdbc:mysql://localhost:3306/manager_plesk_db_phu?user=root&password=",
"auto.create": "true",
"insert.mode": "upsert",
"pk.mode": "record_key",
"pk.fields": "id",
"delete.enabled": "false",
"value.converter": "org.apache.kafka.connect.json.JsonConverter",
"value.converter.schemas.enable": "true",
"key.converter": "org.apache.kafka.connect.json.JsonConverter",
"key.converter.schemas.enable": "true"
}
}' http://localhost:8083/connectors
curl -X POST http://localhost:8083/connectors/sink-db-connector/restart
