<?php

namespace App\Core\Catalog\Infrastructure\Messaging;

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RabbitMQInventoryPublisher
{
    public function publishInventoryDeducted(string $orderId, string $productId, int $quantityDeducted, int $remainingStock): void
    {
        $this->publish('inventory.deducted', [
            'event_id' => uniqid(),
            'occurred_at' => date('c'),
            'data' => [
                'order_id' => $orderId,
                'product_id' => $productId,
                'quantity_deducted' => $quantityDeducted,
                'remaining_stock' => $remainingStock,
                // Passing items back so downstream services (Payment) can pass them back 
                // to Catalog if a compensating transaction (restock) is needed.
                'items' => [
                    ['product_id' => $productId, 'quantity' => $quantityDeducted]
                ]
            ]
        ]);
    }

    public function publishInventoryInsufficient(string $orderId, string $productId, string $reason): void
    {
        $this->publish('inventory.insufficient', [
            'event_id' => uniqid(),
            'occurred_at' => date('c'),
            'data' => [
                'order_id' => $orderId,
                'product_id' => $productId,
                'reason' => $reason
            ]
        ]);
    }

    private function publish(string $routingKey, array $payload): void
    {
        $host = env('RABBITMQ_HOST', 'localhost');
        $port = env('RABBITMQ_PORT', 5672);
        $user = env('RABBITMQ_USER', 'guest');
        $pass = env('RABBITMQ_PASS', 'guest');

        $connection = new AMQPStreamConnection($host, $port, $user, $pass);
        $channel = $connection->channel();

        $exchange = 'events';
        $channel->exchange_declare($exchange, 'topic', false, true, false);

        $msg = new AMQPMessage(json_encode($payload), ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]);
        $channel->basic_publish($msg, $exchange, $routingKey);

        $channel->close();
        $connection->close();
    }
}
