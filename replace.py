import re

# Membaca isi file index.html
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Membaca daftar kartu baru dari cards.html
with open('cards.html', 'r', encoding='utf-8') as f:
    cards_html = f.read().rstrip()

# Mencocokkan bagian di dalam <div class="carousel-track"> hingga </div> sebelum tombol "Lihat Semua Portofolio"
pattern = re.compile(
    r'(<div class="carousel-track">\s*\n).*?(\n\s*</div>\s*\n\s*<div class="mt-16 text-center">)',
    re.DOTALL
)

# Mengganti kartu lama dengan isi cards.html secara aman
if pattern.search(content):
    new_content = pattern.sub(lambda m: f"{m.group(1)}{cards_html}{m.group(2)}", content)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Berhasil: Kartu carousel di index.html sudah diperbarui!")
else:
    print("Gagal: Bagian .carousel-track tidak ditemukan di index.html.")
