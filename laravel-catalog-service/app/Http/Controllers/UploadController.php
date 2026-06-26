<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        if (!$request->hasFile('file')) {
            return response()->json(['error' => 'No file uploaded'], 400);
        }

        $file = $request->file('file');
        if (!$file->isValid()) {
            return response()->json(['error' => 'Invalid file'], 400);
        }

        $ext = $file->getClientOriginalExtension();
        $filename = time() . '-' . Str::random(8) . ($ext ? '.' . $ext : '');

        $disk = Storage::disk('s3');
        $contents = file_get_contents($file->path());

        try {
            $disk->put($filename, $contents, ['ACL' => 'public-read']);
        } catch (\Exception $e) {
            $bucket = config('filesystems.disks.s3.bucket');
            $client = $disk->getClient();
            if (!$client->doesBucketExist($bucket)) {
                $client->createBucket(['Bucket' => $bucket]);
            }
            $disk->put($filename, $contents, ['ACL' => 'public-read']);
        }

        $url = config('filesystems.disks.s3.url') . '/' . $filename;
        return response()->json(['url' => $url, 'filename' => $filename], 201);
    }
}
