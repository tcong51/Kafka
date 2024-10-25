# Application Kafka Producer and Consumer use the Kafka cluster to send and receive messages.

# The Kafka deloy in the docker container.

# 1. Install docker and docker-compose

# 2. Clone the repository

# 3. Run docker in desktop

# 4. Run the command: docker-compose up || clear all container (cd ./clearup_docer.sh) trước khi chạy lại container

- Structure: - kafka: - Dockerfile - docker-compose.yml - clearup_docer.sh - producer: - Dockerfile - producer.py - package.json - consumer: - Dockerfile - consumer.py - package.json
  **Note**:
- Cần cấu hình các thông số kết nối database trong file producer.js và consumer.js
- Thay đổi port trong file docker-compose.yml nếu cần thiết

#-- Cần cấu hình thêm ở database trước khi chạy container --#

1. Tạo thêm bảng change_log trong database

Example:

```sql
CREATE TABLE change_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(10),
    table_name VARCHAR(50),
    new_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

2. Cấu hình thêm trigger của các bảng cần đồng bộ dữ liệu (dữ liệu thay đổi) vào bảng change_log [Optional][Nếu cần]

Example:

```sql
DELIMITER $$

CREATE TRIGGER after_customers_insert
AFTER INSERT ON customers
FOR EACH ROW
BEGIN
    INSERT INTO change_log (action, table_name, new_data)
    VALUES ('INSERT', 'customers', JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'created_at', NEW.created_at, 'updated_at', NEW.updated_at));
END $$

CREATE TRIGGER after_customers_update
AFTER UPDATE ON customers
FOR EACH ROW
BEGIN
    INSERT INTO change_log (action, table_name, new_data)
    VALUES ('UPDATE', 'customers', JSON_OBJECT('id', NEW.id, 'name', NEW.name, 'created_at', NEW.created_at, 'updated_at', NEW.updated_at));
END $$

CREATE TRIGGER after_customers_delete
AFTER DELETE ON customers
FOR EACH ROW
BEGIN
    INSERT INTO change_log (action, table_name, new_data)
    VALUES ('DELETE', 'customers', JSON_OBJECT('id', OLD.id, 'name', OLD.name));
END $$

DELIMITER ;
```

-#- Create by Do Thanh Cong -#-
