<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('shop_id');
            $table->string('type'); // flash_sale, bundle, bogo, tiered, free_shipping
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->json('conditions'); // {min_qty, min_amount, product_ids, category}
            $table->json('rewards'); // {percent_off, fixed_off, free_product_id, free_shipping}
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('shop_id')->references('id')->on('shops')->onDelete('cascade');
            $table->index('shop_id');
            $table->index(['is_active', 'end_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};
