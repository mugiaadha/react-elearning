<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    /**
     * Public list of published blog posts
     */
    public function index(Request $request)
    {
        $category = $request->query('category');
        $search = $request->query('search');

        $query = BlogPost::where('status', 'PUBLISHED')
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        if ($category && $category !== 'ALL' && $category !== 'Semua') {
            $query->where('category', $category);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                    ->orWhere('excerpt', 'like', '%' . $search . '%')
                    ->orWhere('category', 'like', '%' . $search . '%');
            });
        }

        $posts = $query->get()->map(fn ($p) => $this->formatPost($p));

        return response()->json([
            'success' => true,
            'message' => 'Daftar artikel blog berhasil diambil.',
            'data' => $posts,
        ]);
    }

    /**
     * Public detail of a single blog post by slug or id
     */
    public function show($slugOrId)
    {
        $post = BlogPost::where('slug', $slugOrId)->first();
        if (!$post && is_numeric($slugOrId)) {
            $post = BlogPost::find($slugOrId);
        }

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        // Increment views count
        $post->increment('views_count');

        // Also fetch 3 related posts
        $related = BlogPost::where('status', 'PUBLISHED')
            ->where('id', '!=', $post->id)
            ->orderByRaw("CASE WHEN category = ? THEN 0 ELSE 1 END", [$post->category])
            ->orderByDesc('published_at')
            ->limit(3)
            ->get()
            ->map(fn ($p) => $this->formatPost($p, false));

        $formatted = $this->formatPost($post, true);
        $formatted['related_posts'] = $related;

        return response()->json([
            'success' => true,
            'message' => 'Detail artikel berhasil diambil.',
            'data' => $formatted,
        ]);
    }

    /**
     * Backoffice Admin: List all blog posts (including drafts)
     */
    public function adminIndex(Request $request)
    {
        $posts = BlogPost::orderByDesc('id')->get()->map(fn ($p) => $this->formatPost($p, true));

        return response()->json([
            'success' => true,
            'message' => 'Seluruh konten artikel blog berhasil diambil.',
            'data' => $posts,
        ]);
    }

    /**
     * Backoffice Admin: Create / Upload a new blog post
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'required|string',
            'category' => 'nullable|string|max:100',
            'image_url' => 'nullable|string',
            'image_file' => 'nullable|file|max:10240',
            'attachment_url' => 'nullable|string',
            'attachment_name' => 'nullable|string|max:255',
            'attachment_file' => 'nullable|file|max:25600',
            'read_time' => 'nullable|string|max:50',
            'author_name' => 'nullable|string|max:120',
            'author_role' => 'nullable|string|max:150',
            'author_avatar' => 'nullable|string',
            'tags' => 'nullable',
            'status' => 'nullable|in:PUBLISHED,DRAFT',
            'is_featured' => 'nullable',
        ]);

        // Generate unique slug
        $baseSlug = !empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['title']);

        if (empty($baseSlug)) {
            $baseSlug = 'artikel-pajak-' . rand(1000, 9999);
        }

        $slug = $baseSlug;
        $counter = 1;
        while (BlogPost::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        // Handle thumbnail image upload if provided
        $imageUrl = $validated['image_url'] ?? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1000&q=80';
        if ($request->hasFile('image_file')) {
            $uploadResult = $this->handleSafeUpload(
                $request->file('image_file'),
                ['jpg', 'jpeg', 'png', 'webp'],
                'blog/covers'
            );
            if (!$uploadResult['success']) {
                return response()->json(['success' => false, 'message' => $uploadResult['message']], 422);
            }
            $imageUrl = $uploadResult['url'];
        }

        // Handle optional attachment file upload (PDF/Doc/Excel regulasi)
        $attachmentUrl = $validated['attachment_url'] ?? null;
        $attachmentName = $validated['attachment_name'] ?? null;
        if ($request->hasFile('attachment_file')) {
            $uploadResult = $this->handleSafeUpload(
                $request->file('attachment_file'),
                ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip'],
                'blog/attachments'
            );
            if (!$uploadResult['success']) {
                return response()->json(['success' => false, 'message' => $uploadResult['message']], 422);
            }
            $attachmentUrl = $uploadResult['url'];
            if (empty($attachmentName)) {
                $attachmentName = $request->file('attachment_file')->getClientOriginalName();
            }
        }

        $tags = $this->parseTags($request->input('tags'));
        $content = $validated['content'];
        $excerpt = !empty($validated['excerpt'])
            ? $validated['excerpt']
            : Str::limit(strip_tags($content), 160);

        $wordCount = str_word_count(strip_tags($content));
        $estimatedMinutes = max(3, (int) ceil($wordCount / 180));
        $readTime = !empty($validated['read_time'])
            ? $validated['read_time']
            : "{$estimatedMinutes} Menit Baca";

        $status = $validated['status'] ?? 'PUBLISHED';
        $isFeatured = filter_var($request->input('is_featured', false), FILTER_VALIDATE_BOOLEAN);

        $post = BlogPost::create([
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' => $excerpt,
            'content' => $content,
            'category' => $validated['category'] ?: 'Regulasi Pajak',
            'image_url' => $imageUrl,
            'attachment_url' => $attachmentUrl,
            'attachment_name' => $attachmentName,
            'read_time' => $readTime,
            'author_name' => $validated['author_name'] ?: 'Bambang Sudarmono, S.E., Ak., M.Ak., BKP',
            'author_role' => $validated['author_role'] ?: 'Managing Partner & Konsultan Pajak BKP',
            'author_avatar' => $validated['author_avatar'] ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            'tags' => $tags,
            'status' => $status,
            'is_featured' => $isFeatured,
            'published_at' => $status === 'PUBLISHED' ? now() : null,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Artikel '{$post->title}' berhasil diterbitkan!",
            'data' => $this->formatPost($post, true),
        ], 201);
    }

    /**
     * Backoffice Admin: Update an existing blog post
     */
    public function update(Request $request, $id)
    {
        $post = BlogPost::find($id);
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string',
            'content' => 'sometimes|required|string',
            'category' => 'nullable|string|max:100',
            'image_url' => 'nullable|string',
            'image_file' => 'nullable|file|max:10240',
            'attachment_url' => 'nullable|string',
            'attachment_name' => 'nullable|string|max:255',
            'attachment_file' => 'nullable|file|max:25600',
            'read_time' => 'nullable|string|max:50',
            'author_name' => 'nullable|string|max:120',
            'author_role' => 'nullable|string|max:150',
            'author_avatar' => 'nullable|string',
            'tags' => 'nullable',
            'status' => 'nullable|in:PUBLISHED,DRAFT',
            'is_featured' => 'nullable',
        ]);

        if (isset($validated['title'])) {
            $post->title = $validated['title'];
        }

        if (!empty($validated['slug']) && $validated['slug'] !== $post->slug) {
            $newSlug = Str::slug($validated['slug']);
            if (!BlogPost::where('slug', $newSlug)->where('id', '!=', $post->id)->exists()) {
                $post->slug = $newSlug;
            }
        }

        if (isset($validated['content'])) {
            $post->content = $validated['content'];
        }

        if (array_key_exists('excerpt', $validated)) {
            $post->excerpt = $validated['excerpt'] ?: Str::limit(strip_tags($post->content), 160);
        }

        if (!empty($validated['category'])) {
            $post->category = $validated['category'];
        }

        if (!empty($validated['image_url'])) {
            $post->image_url = $validated['image_url'];
        }

        if ($request->hasFile('image_file')) {
            $uploadResult = $this->handleSafeUpload(
                $request->file('image_file'),
                ['jpg', 'jpeg', 'png', 'webp'],
                'blog/covers'
            );
            if (!$uploadResult['success']) {
                return response()->json(['success' => false, 'message' => $uploadResult['message']], 422);
            }
            $post->image_url = $uploadResult['url'];
        }

        if (array_key_exists('attachment_url', $validated)) {
            $post->attachment_url = $validated['attachment_url'];
        }

        if (array_key_exists('attachment_name', $validated)) {
            $post->attachment_name = $validated['attachment_name'];
        }

        if ($request->hasFile('attachment_file')) {
            $uploadResult = $this->handleSafeUpload(
                $request->file('attachment_file'),
                ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip'],
                'blog/attachments'
            );
            if (!$uploadResult['success']) {
                return response()->json(['success' => false, 'message' => $uploadResult['message']], 422);
            }
            $post->attachment_url = $uploadResult['url'];
            $post->attachment_name = $validated['attachment_name']
                ?? $request->file('attachment_file')->getClientOriginalName();
        }

        if (!empty($validated['read_time'])) {
            $post->read_time = $validated['read_time'];
        }

        if (!empty($validated['author_name'])) {
            $post->author_name = $validated['author_name'];
        }

        if (!empty($validated['author_role'])) {
            $post->author_role = $validated['author_role'];
        }

        if (!empty($validated['author_avatar'])) {
            $post->author_avatar = $validated['author_avatar'];
        }

        if ($request->has('tags')) {
            $post->tags = $this->parseTags($request->input('tags'));
        }

        if (isset($validated['status'])) {
            if ($validated['status'] === 'PUBLISHED' && !$post->published_at) {
                $post->published_at = now();
            }
            $post->status = $validated['status'];
        }

        if ($request->has('is_featured')) {
            $post->is_featured = filter_var($request->input('is_featured'), FILTER_VALIDATE_BOOLEAN);
        }

        $post->save();

        return response()->json([
            'success' => true,
            'message' => "Artikel '{$post->title}' berhasil diperbarui!",
            'data' => $this->formatPost($post, true),
        ]);
    }

    /**
     * Backoffice Admin: Delete a blog post
     */
    public function destroy($id)
    {
        $post = BlogPost::find($id);
        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Artikel tidak ditemukan.',
            ], 404);
        }

        $title = $post->title;
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => "Artikel '{$title}' berhasil dihapus.",
        ]);
    }

    /**
     * Anti-Webshell safe file upload helper
     */
    private function handleSafeUpload($uploadedFile, array $allowedExtensions, string $folder): array
    {
        $originalName = $uploadedFile->getClientOriginalName();
        $extension = strtolower($uploadedFile->getClientOriginalExtension());

        if (!in_array($extension, $allowedExtensions, true)) {
            return [
                'success' => false,
                'message' => 'Format file tidak diizinkan. Gunakan ekstensi: ' . implode(', ', $allowedExtensions),
            ];
        }

        $dangerousPatterns = '/\.(php[0-9]*|phtml|phar|shtml|cgi|pl|sh|bash|exe|bat|cmd|vbs|py|js|jsp)\b/i';
        if (preg_match($dangerousPatterns, $originalName)) {
            return [
                'success' => false,
                'message' => 'Nama file mengandung ekstensi berisiko yang dilarang oleh sistem keamanan.',
            ];
        }

        $path = $uploadedFile->getRealPath() ?: $uploadedFile->getPathname();
        $headerContent = ($path && file_exists($path)) ? (@file_get_contents($path, false, null, 0, 4096) ?: '') : '';
        if ($headerContent && preg_match('/(<\?php|<\?=|<script\s+language\s*=\s*["\']?php)/i', $headerContent)) {
            return [
                'success' => false,
                'message' => 'File ditolak karena terdeteksi mengandung script server yang tidak sah.',
            ];
        }

        $cleanName = Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) ?: 'media';
        $filename = $cleanName . '_' . Str::random(10) . '.' . $extension;
        $storedPath = $uploadedFile->storeAs($folder, $filename, 'public');

        return [
            'success' => true,
            'url' => asset('storage/' . $storedPath),
        ];
    }

    private function parseTags($rawTags): array
    {
        if (is_array($rawTags)) {
            return array_values(array_filter(array_map('trim', $rawTags)));
        }
        if (is_string($rawTags)) {
            $decoded = json_decode($rawTags, true);
            if (is_array($decoded)) {
                return array_values(array_filter(array_map('trim', $decoded)));
            }
            return array_values(array_filter(array_map('trim', explode(',', $rawTags))));
        }
        return ['UU HPP', 'Coretax DJP', 'Perpajakan'];
    }

    private function formatPost(BlogPost $post, bool $includeFullContent = true): array
    {
        $dateSource = $post->published_at ?: $post->created_at;
        $formattedDate = $dateSource ? $dateSource->translatedFormat('d M Y') : date('d M Y');

        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'content' => $includeFullContent ? $post->content : null,
            'category' => $post->category,
            'image' => $post->image_url,
            'image_url' => $post->image_url,
            'attachment_url' => $post->attachment_url,
            'attachment_name' => $post->attachment_name,
            'date' => $formattedDate,
            'readTime' => $post->read_time ?: '6 Menit Baca',
            'read_time' => $post->read_time ?: '6 Menit Baca',
            'author_name' => $post->author_name,
            'author_role' => $post->author_role,
            'author_avatar' => $post->author_avatar,
            'tags' => $post->tags ?: ['UU HPP', 'Coretax DJP'],
            'status' => $post->status,
            'is_featured' => (bool) $post->is_featured,
            'views_count' => (int) $post->views_count,
            'published_at' => $post->published_at?->toIso8601String(),
            'created_at' => $post->created_at?->format('d M Y H:i'),
        ];
    }
}

