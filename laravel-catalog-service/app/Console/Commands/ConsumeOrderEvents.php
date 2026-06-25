<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use App\Core\Catalog\Infrastructure\Messaging\RabbitMQOrderConsumer;

class ConsumeOrderEvents extends Command
{
    protected $signature = 'rabbitmq:consume-orders';
    protected $description = 'Consume order events from RabbitMQ';

    public function __construct(
        private RabbitMQOrderConsumer $consumer
    ) {
        parent::__construct();
    }

    public function handle()
    {
        $host = env('RABBITMQ_HOST', 'localhost');
        $port = env('RABBITMQ_PORT', 5672);
        $user = env('RABBITMQ_USER', 'guest');
        $pass = env('RABBITMQ_PASS', 'guest');

        $this->info("Connecting to RabbitMQ at $host:$port...");

        try {
            $connection = new AMQPStreamConnection($host, $port, $user, $pass);
            $channel = $connection->channel();

            $exchange = 'events';
            $queueName = 'catalog_service_orders';

            $channel->exchange_declare($exchange, 'topic', false, true, false);
            $channel->queue_declare($queueName, false, true, false, false);
            $channel->queue_bind($queueName, $exchange, 'order.created');
            $channel->queue_bind($queueName, $exchange, 'payment.failed');
            $channel->queue_bind($queueName, $exchange, 'refund.completed');

            $this->info(" [*] Waiting for messages. To exit press CTRL+C");

            $callback = function ($msg) {
                $this->info(" [x] Received " . $msg->body . " with routing key " . $msg->getRoutingKey());
                try {
                    $this->consumer->handle($msg->body, $msg->getRoutingKey());
                    $msg->ack();
                } catch (\Exception $e) {
                    $this->error("Error handling message: " . $e->getMessage());
                }
            };

            $channel->basic_qos(null, 1, null);
            $channel->basic_consume($queueName, '', false, false, false, false, $callback);

            while ($channel->is_consuming()) {
                $channel->wait();
            }

            $channel->close();
            $connection->close();
        } catch (\Exception $e) {
            $this->error("RabbitMQ Error: " . $e->getMessage());
        }
    }
}
