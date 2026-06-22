<?php

namespace App\Core\Catalog\Application\Ports;

use App\Core\Catalog\Domain\Events\DomainEvent;

interface EventDispatcher
{
    public function dispatch(DomainEvent $event): void;
}
