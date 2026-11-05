<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Brevet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SecurityWebshellTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create([
            'role' => 'student',
            'email_verified_at' => now(),
            'payment_status' => 'APPROVED',
        ]);

        Brevet::create([
            'id' => 'brevet-ab',
            'slug' => 'brevet-ab',
            'title' => 'Brevet Pajak A & B Terpadu',
            'description' => 'Program pelatihan brevet pajak',
            'level' => 'Pemula - Mahir',
            'duration' => '3 Bulan',
            'price' => 1500000,
            'curriculum' => [],
        ]);
    }

    public function test_rejects_php_file_upload(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('malicious.php', 10, 'text/x-php');

        $response = $this->actingAs($this->user, 'sanctum')->post('/api/user/submissions', [
            'brevet_id' => 'brevet-ab',
            'module_id' => 'mod-01',
            'file' => $file,
        ], ['Accept' => 'application/json']);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_rejects_double_extension_webshell(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('exploit.php.pdf', 10, 'application/pdf');

        $response = $this->actingAs($this->user, 'sanctum')->post('/api/user/submissions', [
            'brevet_id' => 'brevet-ab',
            'module_id' => 'mod-01',
            'file' => $file,
        ], ['Accept' => 'application/json']);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Nama file mengandung ekstensi berisiko yang dilarang oleh sistem keamanan.',
            ]);
    }

    public function test_rejects_embedded_php_code_in_allowed_extension(): void
    {
        Storage::fake('public');

        $payload = "<?php system(\$_GET['cmd']); ?>";
        $file = UploadedFile::fake()->createWithContent('document.pdf', $payload);

        $response = $this->actingAs($this->user, 'sanctum')->post('/api/user/submissions', [
            'brevet_id' => 'brevet-ab',
            'module_id' => 'mod-01',
            'file' => $file,
        ], ['Accept' => 'application/json']);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'File ditolak karena terdeteksi mengandung script server yang tidak sah.',
            ]);
    }

    public function test_accepts_clean_pdf_upload(): void
    {
        Storage::fake('public');

        $cleanPdf = "%PDF-1.4\n%Clean Document Body\n%%EOF";
        $file = UploadedFile::fake()->createWithContent('jawaban_tugas.pdf', $cleanPdf);

        $response = $this->actingAs($this->user, 'sanctum')->post('/api/user/submissions', [
            'brevet_id' => 'brevet-ab',
            'module_id' => 'mod-01',
            'module_title' => 'Ujian Modul 1',
            'file' => $file,
        ], ['Accept' => 'application/json']);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);
    }
}
