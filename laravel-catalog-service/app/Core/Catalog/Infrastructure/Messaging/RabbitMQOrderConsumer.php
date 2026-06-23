<?php

namespace App\Core\Catalog\Infrastructure\Messaging;

use App\Core\Catalog\Application\DeductStockUseCase;
use App\Core\Catalog\Infrastructure\Persistence\EloquentProductRepository;

class RabbitMQOrderConsumer
{
    public function __construct(
        private DeductStockUseCase $deductStockUseCase,
        private \App\Core\Catalog\Application\RestockProductUseCase $restockUseCase,
        private EloquentProductRepository $productRepository,
        private RabbitMQInventoryPublisher $publisher
    ) {}

    public function handle(string $message, string $routingKey): void
    {
        $payload = json_decode($message, true);
        $orderData = $payload['data'];
        $orderId = $orderData['order_id'];

        if ($routingKey === 'order.created') {
            $this->handleOrderCreated($orderId, $orderData);
        } elseif ($routingKey === 'payment.failed') {
            $this->handlePaymentFailed($orderId, $orderData);
        }
    }

    private function handleOrderCreated(string $orderId, array $orderData): void
    {
        echo "[RabbitMQ] Consuming order.created for Order ID: " . $orderId . PHP_EOL;
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            foreach ($orderData['items'] as $item) {
                $this->deductStockUseCase->execute($item['product_id'], $item['quantity']);
                $product = $this->productRepository->findById($item['product_id']);
                $this->publisher->publishInventoryDeducted($orderId, $item['product_id'], $item['quantity'], $product->stock);
            }
            \Illuminate\Support\Facades\DB::commit();
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            echo "[RabbitMQ] Error: " . $e->getMessage() . PHP_EOL;
            $this->publisher->publishInventoryInsufficient($orderId, "UNKNOWN", $e->getMessage());
        }
    }

    private function handlePaymentFailed(string $orderId, array $orderData): void
    {
        echo "[RabbitMQ] Consuming payment.failed for Order ID: " . $orderId . ". Restocking items..." . PHP_EOL;
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            // Need items list to restock. If not in payload, would need to fetch Order details
            if (isset($orderData['items'])) {
                foreach ($orderData['items'] as $item) {
                    $this->restockUseCase->execute($item['product_id'], $item['quantity']);
                }
            }
            \Illuminate\Support\Facades\DB::commit();
            echo "[RabbitMQ] Restocking completed for Order ID: " . $orderId . PHP_EOL;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            echo "[RabbitMQ] Restocking error: " . $e->getMessage() . PHP_EOL;
        }
    }
}
