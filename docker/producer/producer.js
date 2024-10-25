const kafka = require("kafka-node");
const mysql = require("mysql");

// Kết nối đến db A
const connectionA = mysql.createConnection({
  host: "host.docker.internal",
  port: 3306,
  user: "root",
  password: "",
  database: "manager_plesk_local",
});

connectionA.connect((err) => {
  if (err) {
    console.error("Error connecting to db A:", err);
    return;
  }
  console.log("Connected to db A");
});

// Kafka Producer
const Producer = kafka.Producer;
const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER });
const producer = new Producer(client);

// Tạo topic nếu chưa tồn tại
const admin = new kafka.Admin(client);
const topicName = "db-sync";

// Kiểm tra và tạo topic
function ensureTopicExists() {
  return new Promise((resolve, reject) => {
    admin.listTopics((err, result) => {
      if (err) {
        return reject("Error listing topics: " + err);
      }

      const topics = result[1].metadata;
      if (!topics[topicName]) {
        // Topic chưa tồn tại, tạo mới
        admin.createTopics(
          [{ topic: topicName, partitions: 1, replicationFactor: 1 }],
          (err, res) => {
            if (err) {
              return reject("Error creating topic: " + err);
            } else {
              console.log("Topic created:", res);
              resolve();
            }
          }
        );
      } else {
        console.log(`Topic "${topicName}" already exists.`);
        resolve();
      }
    });
  });
}

// Kafka Producer ready event
producer.on("ready", async () => {
  console.log("Kafka Producer is ready");

  try {
    // Ensure the topic is created before polling the DB
    await ensureTopicExists();
    console.log("Topic is ready, starting polling");
    startPolling(); // Start polling after the topic exists
  } catch (error) {
    console.error("Error ensuring topic exists:", error);
  }
});

producer.on("error", (err) => {
  console.error("Producer error", err);
});

// Hàm gửi thông điệp đến Kafka
function sendToKafka(dataChange) {
  const message = JSON.stringify(dataChange);
  producer.send([{ topic: topicName, messages: [message] }], (err, data) => {
    if (err) {
      console.error("Error sending message to Kafka:", err);
    } else {
      console.log("Message sent to Kafka:", data);
    }
  });
}

// Hàm kiểm tra sự thay đổi trong bảng change_log
function startPolling() {
  setInterval(() => {
    connectionA.query(
      "SELECT * FROM change_log ORDER BY created_at DESC LIMIT 1",
      (err, results) => {
        if (err) {
          console.error("Error querying change_log:", err);
          return;
        }

        if (results.length > 0) {
          const dataChange = results[0];

          // Gửi thông điệp tới Kafka
          sendToKafka(dataChange);

          // Xóa log sau khi đã xử lý
          connectionA.query(
            "DELETE FROM change_log WHERE id = ?",
            [dataChange.id],
            (err) => {
              if (err) {
                console.error("Error deleting change_log entry:", err);
              }
            }
          );
        }
      }
    );
  }, 5000); // Kiểm tra mỗi 5 giây
}
