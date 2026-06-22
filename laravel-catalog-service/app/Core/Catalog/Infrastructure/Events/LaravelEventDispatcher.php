<?php

namespace App\Core\Catalog\Infrastructure\Events;

use App\Core\Catalog\Application\Ports\EventDispatcher as EventDispatcherPort;
use App\Core\Catalog\Domain\Events\DomainEvent;
use Illuminate\Contracts\Events\Dispatcher;

class LaravelEventDispatcher implements EventDispatcherPort
{
    public function __construct(
        private Dispatcher $laravelDispatcher
    ) {}

    public function dispatch(DomainEvent $event): void
    {
        $this->laravelDispatcher->dispatch($event);
    }
}
