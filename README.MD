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

-#- Create by Do Thanh Cong -#-
