<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_views', function (Blueprint $table) {
            $table->id();
            $table->string('user_id');
            $table->uuid('product_id');
            $table->timestamp('viewed_at');

            $table->index(['user_id', 'viewed_at']);
            $table->index(['product_id', 'viewed_at']);
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_views');
    }
};
