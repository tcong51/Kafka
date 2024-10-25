const kafka = require("kafka-node");
const mysql = require("mysql");

// Kết nối đến db B
const connectionB = mysql.createConnection({
  host: "host.docker.internal",
  port: 3306,
  user: "root",
  password: "",
  database: "manager_plesk_db_phu",
});

connectionB.connect((err) => {
  if (err) {
    console.error("Error connecting to db B:", err);
    return;
  }
  console.log("Connected to db B");
});

// Kafka Consumer
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: process.env.KAFKA_BROKER });
function runQuery(dataChange) {
  return new Promise((resolve, reject) => {
    const tableName = dataChange.table_name;
    if (!tableName || !dataChange.new_data) {
      return reject("Missing table name or data");
    }

    let parsedData;
    try {
      // Kiểm tra và parse new_data
      parsedData = JSON.parse(dataChange.new_data);
    } catch (error) {
      return reject("Error parsing new_data: " + error.message);
    }

    const action = dataChange.action;

    // Xử lý hành động
    if (action === "INSERT") {
      // Thực hiện câu lệnh INSERT
      connectionB.query(
        "INSERT INTO ?? SET ?",
        [tableName, parsedData],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    } else if (action === "UPDATE") {
      // Thực hiện câu lệnh UPDATE (dùng id để xác định bản ghi)
      connectionB.query(
        "UPDATE ?? SET ? WHERE id = ?",
        [tableName, parsedData, parsedData.id],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    } else if (action === "DELETE") {
      // Thực hiện câu lệnh DELETE (dùng id để xác định bản ghi)
      connectionB.query(
        "DELETE FROM ?? WHERE id = ?",
        [tableName, parsedData.id],
        (err, results) => {
          if (err) {
            return reject(err);
          }
          resolve(results);
        }
      );
    } else {
      return reject("Unknown action: " + action);
    }
  });
}

// Hàm retry nếu topic chưa tồn tại
function retryConsumer() {
  const consumer = new Consumer(
    client,
    [{ topic: "db-sync", partition: 0, offset: 0 }],
    {
      autoCommit: true,
      fetchMaxWaitMs: 1000,
      fetchMinBytes: 1,
    }
  );

  // Khi nhận thông điệp từ Kafka
  consumer.on("message", async function (message) {
    try {
      const dataChange = JSON.parse(message.value);
      console.log("Data change:", dataChange);

      // Chạy query INSERT, UPDATE hoặc DELETE dựa trên hành động
      const result = await runQuery(dataChange);
      console.log("Query result:", result);
    } catch (err) {
      console.error("Error processing Kafka message:", err);
    }
  });

  consumer.on("error", (err) => {
    if (err.name === "TopicsNotExistError") {
      console.error("Topic does not exist yet, retrying in 5 seconds...");
      setTimeout(retryConsumer, 5000); // Retry after 5 seconds
    } else {
      console.error("Consumer error:", err);
    }
  });
}

// Khởi động consumer với retry
retryConsumer();
