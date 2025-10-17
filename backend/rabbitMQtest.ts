import amqp from 'amqplib';

// 配置信息
const RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
const EXCHANGE_NAME = 'direct_messages';
const EXCHANGE_TYPE = 'direct';
const QUEUE_NAME = 'message';
const BINDING_KEY = 'new_message'; // 监听 'new_message' 事件

async function runSimpleConsumer() {
  // 建立連線
  const connection = await amqp.connect(RABBITMQ_URL);
  // 建立 Channel
  const channel = await connection.createChannel();

  // 宣告 Exchange (要與 Producer 的設定一致，通常設定為持久化)
  await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
    durable: true, // 確保 Exchange 持久化
  });

  // 宣告 Queue (確保 Queue 持久化)
  const q = await channel.assertQueue(QUEUE_NAME, {
    durable: true, // 確保 Queue 持久化
  });

  // 建立 Binding
  // 將 Queue 綁定到 Exchange，使用 BINDING_KEY
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, BINDING_KEY);

  console.log(
    `[*] Waiting for messages in Queue: ${q.queue}. Routing Key: ${BINDING_KEY}`,
  );

  // 開始消費訊息
  channel
    .consume(
      QUEUE_NAME,
      (msg) => {
        if (!msg) {
          return;
        }
        console.log(msg?.content.toString());
        channel.ack(msg);
      },
      {
        noAck: false, // 手動確認
      },
    )
    .catch(() => {});
}

runSimpleConsumer();
