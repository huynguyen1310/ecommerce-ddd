<?php

return [
    'default' => env('FILESYSTEM_DISK', 'local'),
    'disks' => [
        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
        ],
        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL') . '/storage',
            'visibility' => 'public',
            'throw' => false,
        ],
        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID', 'rustfsadmin'),
            'secret' => env('AWS_SECRET_ACCESS_KEY', 'rustfsadmin'),
            'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
            'bucket' => env('AWS_BUCKET', 'ecom-files'),
            'url' => env('AWS_URL', 'http://localhost:8080/storage/ecom-files'),
            'endpoint' => env('AWS_ENDPOINT', 'http://rustfs:9000'),
            'use_path_style_endpoint' => true,
            'throw' => false,
        ],
    ],
    'links' => [
        public_path('storage') => storage_path('app/public'),
    ],
];
