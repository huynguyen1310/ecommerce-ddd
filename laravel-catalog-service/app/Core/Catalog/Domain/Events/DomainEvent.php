<?php

namespace App\Core\Catalog\Domain\Events;

interface DomainEvent
{
    public function eventName(): string;
    public function occurredAt(): \DateTimeImmutable;
}
